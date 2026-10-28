"""高强度档位的预览生成：合并抽帧、固态盘上并行，以及对安全停点和检查点的保证。"""
from __future__ import annotations

import json
import subprocess
import tempfile
import threading
import time
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from PIL import Image

from peach import frame_capture, storage_profile
from peach.library_processing import _preview_workers, process_library, state_path
from peach.processing_control import CURRENT, ProcessingControl, control_for
from peach.repository import LedgerDatabase
from peach.settings_file import PeachConfig
from support.conditions import windows_ledger_roots
from support.ledger import fresh_ledger


def write_frames(destinations):
    for destination in destinations:
        Image.new('RGB', (480, 270), 'green').save(destination, format='JPEG')


def make_tile(_ffmpeg, _pattern, _columns, _rows, destination, **_options):
    Image.new('RGB', (1440, 810), 'green').save(destination, format='JPEG')
    return True


class CaptureFramesTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.destinations = [self.root / f's{index:02d}.jpg' for index in range(3)]

    def test_one_process_seeks_each_input_before_opening_it_and_maps_it_to_its_own_file(self):
        commands = []

        def run(command, **_options):
            commands.append(command)
            write_frames(self.destinations)
            return SimpleNamespace(returncode=0, stderr=b'')

        with patch.object(frame_capture.subprocess, 'run', run):
            self.assertTrue(frame_capture.capture_frames(
                'ffmpeg', 'movie.mp4', [1.0, 20.5, 40.25], self.destinations, threads=2))
        self.assertEqual(len(commands), 1)
        command = commands[0]
        inputs = [index for index, value in enumerate(command) if value == '-i']
        seeks = [index for index, value in enumerate(command) if value == '-ss']
        self.assertEqual([command[index + 1] for index in seeks], ['1.00', '20.50', '40.25'])
        self.assertEqual([seek + 2 for seek in seeks], inputs)
        self.assertEqual([command[index + 1] for index, value in enumerate(command) if value == '-map'],
                         ['0:v:0', '1:v:0', '2:v:0'])
        self.assertEqual(command[-1], str(self.destinations[-1]))
        self.assertEqual(command.count('-frames:v'), 3)
        self.assertIn('scale=480:-1', command)

    def test_a_failed_batch_leaves_no_partial_frames_and_reports_why(self):
        def run(command, **_options):
            write_frames(self.destinations[:2])
            return SimpleNamespace(returncode=1, stderr=b'bad input')

        diagnostics = {}
        with patch.object(frame_capture.subprocess, 'run', run):
            self.assertFalse(frame_capture.capture_frames(
                'ffmpeg', 'movie.mp4', [1, 2, 3], self.destinations, diagnostics=diagnostics))
        self.assertEqual(diagnostics['reason'], 'ffmpeg_error')
        self.assertFalse(any(path.exists() for path in self.destinations))

    def test_a_timed_out_batch_is_reported_as_a_timeout(self):
        def run(command, **_options):
            raise subprocess.TimeoutExpired(command, 1, stderr=b'slow')

        diagnostics = {}
        with patch.object(frame_capture.subprocess, 'run', run):
            self.assertFalse(frame_capture.capture_frames(
                'ffmpeg', 'movie.mp4', [1, 2, 3], self.destinations, diagnostics=diagnostics))
        self.assertEqual(diagnostics['reason'], 'timeout')


class StorageProfileTests(unittest.TestCase):
    def test_an_unreadable_device_is_never_treated_as_solid_state(self):
        with patch.object(storage_profile, '_windows_solid_state', side_effect=OSError('denied')), \
                patch.object(storage_profile, '_linux_solid_state', side_effect=OSError('denied')), \
                patch.object(storage_profile.sys, 'platform', 'linux'):
            self.assertFalse(storage_profile.solid_state('/media/x'))

    @unittest.skipUnless(storage_profile.os.name == 'nt', 'UNC 共享只存在于 Windows')
    def test_a_network_share_is_not_solid_state(self):
        self.assertFalse(storage_profile.solid_state('\\\\nas\\share\\clip.mp4'))


class PreviewWorkersTests(unittest.TestCase):
    def setUp(self):
        self.control = ProcessingControl(Path(tempfile.gettempdir()) / 'peach-preview-workers-unused.json')
        self.addCleanup(CURRENT.reset, CURRENT.set(self.control))

    def workers(self, mode, *, cpus=8, memory=64 * 1024**3):
        self.control.mode = mode
        with patch('peach.library_processing.os.cpu_count', return_value=cpus), \
                patch('peach.library_processing.available_memory_bytes', return_value=memory):
            return _preview_workers()

    def test_only_the_highest_intensity_runs_in_parallel(self):
        self.assertEqual(self.workers('low'), 1)
        self.assertEqual(self.workers('standard'), 1)
        self.assertGreater(self.workers('high'), 1)

    def test_workers_follow_cores_memory_and_a_fixed_ceiling(self):
        self.assertEqual(self.workers('high', cpus=4), 2)
        self.assertEqual(self.workers('high', cpus=2), 1)
        self.assertEqual(self.workers('high', cpus=64), 4)
        self.assertEqual(self.workers('high', memory=1024**3), 1)
        self.assertEqual(self.workers('high', memory=None), 1)

    def test_without_a_bound_control_there_is_one_worker(self):
        CURRENT.set(None)
        self.assertEqual(_preview_workers(), 1)


@windows_ledger_roots
class HighSpeedPreviewTests(unittest.TestCase):
    CLIPS = 6

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.media = self.root / 'media'
        self.media.mkdir()
        self.config = PeachConfig(self.root, self.root / 'config.toml', present=True,
                                  locations={'local': (str(self.media),)})
        directory = self.root / 'database'
        directory.mkdir()
        self.db = fresh_ledger(directory)
        self.database = LedgerDatabase(self.db)
        self.resolver = Mock()
        self.resolver.ffmpeg.return_value = SimpleNamespace(path=Path('test-ffmpeg'))
        with self.database.write_transaction() as connection:
            for asset_id in range(1, self.CLIPS + 1):
                video = self.media / f'clip-{asset_id}.mp4'
                video.write_bytes(b'video')
                connection.execute(
                    'INSERT INTO asset(id,location,path,name,medium,duration) VALUES(?,?,?,?,?,?)',
                    (asset_id, 'local', str(video), video.name, 'video', 30))
        self.lock = threading.Lock()
        self.running = self.peak = 0
        self.started = []
        self.captures = Mock()

    def capture_frames(self, _ffmpeg, path, timestamps, destinations, **_options):
        with self.lock:
            self.running += 1
            self.peak = max(self.peak, self.running)
            self.started.append(Path(path).name)
        try:
            self.captures(path, timestamps)
            time.sleep(0.03)
            write_frames(destinations)
            return True
        finally:
            with self.lock:
                self.running -= 1

    def process(self, mode='high', *, solid=True, capture=None, reports=None, **options):
        patches = [
            patch('peach.library_processing.FFmpegResolver', return_value=self.resolver),
            patch('peach.library_processing.solid_state', return_value=solid),
            patch('peach.library_processing.os.cpu_count', return_value=4),
            patch('peach.library_processing.available_memory_bytes', return_value=64 * 1024**3),
            patch('peach.frame_capture.capture_frames', side_effect=capture or self.capture_frames),
            patch('peach.frame_capture.tile_frames', side_effect=make_tile),
            patch('peach.library_processing._finish_collection', return_value={}),
            patch('peach.library_processing.root_online', return_value=True),
        ]
        for item in patches:
            item.start()
            self.addCleanup(item.stop)
        return process_library(self.config, self.db, self.root / 'candidates', self.root / 'covers',
                               database=self.database, stage='previews', speed_mode=mode,
                               report=(reports.append if reports is not None else lambda state: None),
                               **options)

    def snapshots(self):
        with self.database.read_connection() as connection:
            return {row[0]: row[1] for row in connection.execute('SELECT id,snapshot_path FROM asset')}

    def saved_state(self):
        return json.loads(state_path(self.config).read_text(encoding='utf-8'))

    def test_high_intensity_merges_frames_and_runs_two_videos_at_a_time_on_solid_state(self):
        reports = []
        with patch('peach.frame_capture.capture_with_retry', side_effect=AssertionError('逐帧路径不应启用')):
            result = self.process(reports=reports)
        self.assertEqual(result['status'], 'complete')
        self.assertEqual(result['previews'], self.CLIPS)
        self.assertEqual(self.captures.call_count, self.CLIPS)
        self.assertTrue(all(len(call.args[1]) == 9 for call in self.captures.call_args_list))
        self.assertEqual(self.peak, 2)
        self.assertTrue(all(self.snapshots().values()))
        checked = [row['checked'] for row in reports if row.get('stage') == '生成预览图']
        self.assertEqual(checked, sorted(checked))
        self.assertEqual(result['checked'], self.CLIPS)
        self.assertEqual(len(self.saved_state()['completed_previews']), self.CLIPS)
        self.assertEqual(result['issue_count'], 0)

    def check_frame_by_frame(self, mode):
        with patch('peach.frame_capture.capture_with_retry', return_value=True) as capture:
            result = self.process(mode, capture=AssertionError('合并抽帧只属于高强度'))
        self.assertEqual(capture.call_count, 9 * self.CLIPS)
        self.assertEqual(result['previews'], self.CLIPS)
        self.assertEqual(self.peak, 0)

    def test_standard_intensity_keeps_the_frame_by_frame_path(self):
        self.check_frame_by_frame('standard')

    def test_low_intensity_keeps_the_frame_by_frame_path(self):
        self.check_frame_by_frame('low')

    def test_sources_that_are_not_solid_state_stay_serial_and_frame_by_frame(self):
        with patch('peach.frame_capture.capture_with_retry', return_value=True) as capture:
            result = self.process(solid=False, capture=AssertionError('机械盘与网络盘不合并抽帧'))
        self.assertEqual(capture.call_count, 9 * self.CLIPS)
        self.assertEqual(result['previews'], self.CLIPS)

    def test_a_batch_that_fails_falls_back_to_frame_by_frame_with_per_frame_retry(self):
        def failing(_ffmpeg, _path, _timestamps, _destinations, diagnostics=None, **_options):
            diagnostics.update(reason='ffmpeg_error', stderr='')
            return False

        with patch('peach.frame_capture.capture_with_retry', return_value=True) as capture:
            result = self.process(capture=failing)
        self.assertEqual(capture.call_count, 9 * self.CLIPS)
        self.assertEqual(result['previews'], self.CLIPS)
        self.assertEqual(result['issue_count'], 0)

    def test_a_batch_timeout_is_recorded_as_a_retryable_issue_without_rereading_the_file(self):
        def slow(_ffmpeg, path, _timestamps, _destinations, diagnostics=None, **_options):
            if path.endswith('clip-2.mp4'):
                diagnostics.update(reason='timeout', returncode=None, stderr='')
                return False
            write_frames(_destinations)
            return True

        with patch('peach.frame_capture.capture_with_retry', side_effect=AssertionError('超时不重读')):
            result = self.process(capture=slow)
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['issue_count'], 1)
        self.assertEqual(result['retryable_asset_ids'], [2])
        self.assertEqual(result['previews'], self.CLIPS - 1)
        self.assertIsNone(self.snapshots()[2])
        self.assertNotIn(2, [int(key.split(':')[0]) for key in self.saved_state()['completed_previews']])
        self.assertEqual(result['issue_preview'][0]['message'], '视频抽帧超时，可重试；反馈问题请导出诊断报告')

    def test_one_failing_video_does_not_stop_the_others_or_their_checkpoints(self):
        def broken(_ffmpeg, path, _timestamps, destinations, **_options):
            if path.endswith('clip-3.mp4'):
                raise OSError('disk gone')
            write_frames(destinations)
            return True

        result = self.process(capture=broken)
        self.assertEqual(result['issue_count'], 1)
        self.assertEqual(result['retryable_asset_ids'], [3])
        self.assertEqual(result['previews'], self.CLIPS - 1)
        self.assertEqual(len(self.saved_state()['completed_previews']), self.CLIPS - 1)

    def test_pause_stops_new_videos_and_resume_continues_the_same_run(self):
        control = control_for(self.config)
        first, release = threading.Event(), threading.Event()
        outcome = {}

        def capture(_ffmpeg, path, timestamps, destinations, **_options):
            with self.lock:
                self.started.append(Path(path).name)
            if not first.is_set():
                first.set()
                control.request('pause', 'job')
                release.wait(5)
            write_frames(destinations)
            return True

        def run():
            try:
                outcome['result'] = self.process(capture=capture, job_id='job')
            except BaseException as error:
                outcome['error'] = error

        thread = threading.Thread(target=run)
        thread.start()
        self.addCleanup(lambda: (control.request('resume', 'job'), release.set(), thread.join(5)))
        self.assertTrue(first.wait(5))
        release.set()
        time.sleep(1.0)
        with self.lock:
            while_paused = len(self.started)
        self.assertLessEqual(while_paused, 2)
        self.assertTrue(thread.is_alive())
        control.request('resume', 'job')
        thread.join(10)
        self.assertFalse(thread.is_alive())
        self.assertNotIn('error', outcome)
        self.assertEqual(outcome['result']['previews'], self.CLIPS)
        self.assertEqual(len(self.started), self.CLIPS)

    def test_stopping_the_task_lets_in_flight_videos_finish_and_starts_no_more(self):
        calls = []

        def active():
            calls.append(1)
            return len(self.started) < 1

        with self.assertRaises(InterruptedError):
            self.process(active=active)
        time.sleep(0.2)
        self.assertLessEqual(len(self.started), 2)
        self.assertEqual(self.running, 0)
        self.assertFalse([thread for thread in threading.enumerate()
                          if thread.name.startswith('PeachPreview') and thread.is_alive()])


if __name__ == '__main__':
    unittest.main()
