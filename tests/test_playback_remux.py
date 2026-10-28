"""浏览器播放少编码：判定表、拷流分片、切断回收。

判定表（容器 × 视频 × 音频 → 直接 Range / 拷流 HLS / 全面转码）与它的回退都在这里。
"""
import asyncio
import json
import tempfile
import threading
import unittest
from pathlib import Path
from unittest import mock

from peach.ffmpeg import BinaryChoice
from peach import segments
from peach.segments import (
    REMUX_AAC_AUDIO, REMUX_COPY_AUDIO, HlsSegmentService, SegmentUnavailable, segment_options,
)
from peach.streaming import StreamSessionRegistry
from peach.transcodes import (
    TranscodeCancelled, TranscodeNeedsSession, TranscodeService, background_process_flags,
)


class _Resolver:
    def __init__(self, root: Path, probe: bool = True):
        self.root = root
        self.probe = probe

    def ffmpeg(self):
        return BinaryChoice(self.root / "ffmpeg.exe", "test")

    def ffprobe(self):
        return BinaryChoice(self.root / "ffprobe.exe", "test") if self.probe else None


def _probe_process(streams, duration="180.0", start_time="0.000000"):
    class Process:
        returncode = 0

        def __init__(self, command, **_kwargs):
            self.command = list(command)

        def communicate(self, timeout=None):
            report = {"streams": streams, "format": {"duration": duration, "start_time": start_time}}
            return json.dumps(report).encode(), b""

    return Process


def _streams(codec, pix="yuv420p", audio="aac", tag=""):
    items = [{"codec_type": "video", "codec_name": codec, "pix_fmt": pix, "codec_tag_string": tag}]
    if audio:
        items.append({"codec_type": "audio", "codec_name": audio})
    return items


def segments_profile(video, pix, audio, tag=""):
    from peach.transcodes import _MediaProfile
    return _MediaProfile(video_codec=video, pixel_format=pix, audio_codec=audio, duration=60.0, video_tag=tag)


class CapabilityParsingTests(unittest.TestCase):
    def test_unknown_tokens_and_oversized_values_are_dropped(self):
        from peach.transcodes import caps_query, parse_caps
        self.assertEqual(parse_caps("hevc, AV1 ,bogus,hevc-10"), frozenset({"hevc", "av1", "hevc-10"}))
        self.assertEqual(parse_caps(""), frozenset())
        self.assertEqual(parse_caps(None), frozenset())
        self.assertEqual(parse_caps("hevc," * 100), frozenset())
        self.assertEqual(caps_query(frozenset()), "")
        self.assertEqual(caps_query(frozenset({"hevc", "av1"})), "&caps=av1,hevc")


class DecisionTableTests(unittest.TestCase):
    def _service(self, root: Path):
        return TranscodeService(_Resolver(root), root / "cache", prefer_hardware=False)

    def _decide(self, name, streams, caps=frozenset(), **probe):
        """返回 (需要转码吗, 拷流音频处理)。"""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            source = root / name
            source.write_bytes(b"x")
            service = self._service(root)
            with mock.patch("peach.transcodes.subprocess.Popen", side_effect=_probe_process(streams, **probe)):
                return (service.requires_conversion(source, caps=caps),
                        service.remux_audio(source, caps=caps))

    def test_table(self):
        cases = (
            # 名字, 视频, 像素格式, 音频, 需要转码, 拷流音频
            ("a.mov", "h264", "yuv420p", "aac", False, None),
            ("a.mov", "h264", "yuvj420p", "mp3", False, None),
            ("a.mov", "h264", "yuv420p", "", False, None),
            ("a.mov", "prores", "yuv422p10le", "pcm_s16le", True, None),
            ("a.mov", "h264", "yuv420p", "pcm_s16be", True, None),
            ("a.mp4", "h264", "yuv420p", "aac", False, None),
            ("a.mkv", "h264", "yuv420p", "aac", True, "copy"),
            ("a.mkv", "h264", "yuv420p", "mp3", True, "copy"),
            ("a.mkv", "h264", "yuv420p", "", True, "copy"),
            ("a.mkv", "h264", "yuv420p", "ac3", True, "aac"),
            ("a.mkv", "h264", "yuv420p", "dts", True, "aac"),
            ("a.mkv", "h264", "yuv420p10le", "aac", True, None),
            ("a.mkv", "hevc", "yuv420p", "aac", True, None),
            ("a.mkv", "mpeg4", "yuv420p", "aac", True, None),
            ("a.avi", "h264", "yuv420p", "aac", True, None),
            ("a.ts", "h264", "yuv420p", "aac", True, None),
            ("a.wmv", "vc1", "yuv420p", "wmav2", True, None),
        )
        for name, codec, pix, audio, convert, remux in cases:
            with self.subTest(name=name, codec=codec, pix=pix, audio=audio):
                self.assertEqual(self._decide(name, _streams(codec, pix, audio)), (convert, remux))

    def test_capabilities_decide_which_codecs_are_sent_straight(self):
        none = frozenset()
        cases = (
            # 名字, 视频, 像素, 音频, 标签, 能力, 需要转码
            ("a.mp4", "hevc", "yuv420p", "aac", "hvc1", none, True),
            ("a.mp4", "hevc", "yuv420p", "aac", "hvc1", {"hevc"}, False),
            ("a.mov", "hevc", "yuv420p", "aac", "hvc1", {"hevc"}, False),
            ("a.mp4", "hevc", "yuv420p", "aac", "hev1", {"hevc"}, True),
            ("a.mp4", "hevc", "yuv420p", "aac", "hev1", {"hevc", "hev1"}, False),
            ("a.mp4", "hevc", "yuv420p10le", "aac", "hvc1", {"hevc"}, True),
            ("a.mp4", "hevc", "yuv420p10le", "aac", "hvc1", {"hevc-10"}, False),
            ("a.mp4", "hevc", "yuv422p10le", "aac", "hvc1", {"hevc", "hevc-10"}, True),
            ("a.mp4", "av1", "yuv420p", "aac", "av01", none, True),
            ("a.mp4", "av1", "yuv420p", "aac", "av01", {"av1"}, False),
            ("a.mp4", "av1", "yuv420p10le", "aac", "av01", {"av1"}, True),
            ("a.mp4", "av1", "yuv420p10le", "aac", "av01", {"av1", "av1-10"}, False),
            ("a.mp4", "vp9", "yuv420p", "aac", "vp09", {"vp9"}, False),
            ("a.mp4", "vp9", "yuv420p", "aac", "vp09", {"av1"}, True),
            ("a.mp4", "h264", "yuv420p10le", "aac", "avc1", none, True),
            ("a.mp4", "h264", "yuv420p10le", "aac", "avc1", {"h264-10"}, False),
            ("a.mp4", "h264", "yuv444p", "aac", "avc1", {"h264-10"}, True),
            ("a.mp4", "h264", "yuv420p", "ac3", "avc1", none, True),
            ("a.mp4", "h264", "yuv420p", "ac3", "avc1", {"ac3"}, False),
            ("a.mp4", "h264", "yuv420p", "opus", "avc1", {"opus"}, False),
            ("a.mp4", "h264", "yuv420p", "dts", "avc1", {"ac3", "eac3", "opus", "flac"}, True),
            ("a.mp4", "hevc", "yuv420p", "ac3", "hvc1", {"hevc"}, True),
            ("a.mp4", "hevc", "yuv420p", "ac3", "hvc1", {"hevc", "ac3"}, False),
            ("a.mp4", "mpeg4", "yuv420p", "aac", "mp4v", {"hevc", "av1", "vp9"}, True),
            ("a.mp4", "h264", "yuv420p", "aac", "avc1", {"hevc"}, False),
        )
        for name, codec, pix, audio, tag, caps, convert in cases:
            with self.subTest(name=name, codec=codec, pix=pix, audio=audio, tag=tag, caps=sorted(caps)):
                got = self._decide(name, _streams(codec, pix, audio, tag), frozenset(caps))[0]
                self.assertEqual(got, convert)

    def test_mkv_with_other_codecs_goes_through_fmp4_only_when_the_device_can_decode_them(self):
        none = frozenset()
        cases = (
            # 视频, 像素, 音频, 能力, 拷流处理
            ("hevc", "yuv420p", "aac", none, None),
            ("hevc", "yuv420p", "aac", {"hevc"}, "fmp4-copy"),
            ("hevc", "yuv420p", "mp3", {"hevc"}, "fmp4-copy"),
            ("hevc", "yuv420p", "ac3", {"hevc"}, "fmp4-aac"),
            ("hevc", "yuv420p", "ac3", {"hevc", "ac3"}, "fmp4-copy"),
            ("hevc", "yuv420p", "dts", {"hevc", "ac3", "eac3", "opus", "flac"}, "fmp4-aac"),
            ("hevc", "yuv420p10le", "aac", {"hevc"}, None),
            ("hevc", "yuv420p10le", "aac", {"hevc-10"}, "fmp4-copy"),
            ("av1", "yuv420p", "opus", {"av1", "opus"}, "fmp4-copy"),
            ("av1", "yuv420p", "vorbis", {"av1"}, "fmp4-aac"),
            ("vp9", "yuv420p", "aac", {"vp9"}, "fmp4-copy"),
            ("vp9", "yuv420p", "aac", {"hevc", "av1"}, None),
            ("h264", "yuv420p10le", "aac", {"h264-10"}, "fmp4-copy"),
            ("h264", "yuv420p10le", "aac", none, None),
            ("h264", "yuv420p", "aac", {"hevc"}, "copy"),
            ("hevc", "yuv422p10le", "aac", {"hevc", "hevc-10"}, None),
            ("mpeg2video", "yuv420p", "mp2", {"hevc", "av1", "vp9"}, None),
        )
        for codec, pix, audio, caps, expected in cases:
            with self.subTest(codec=codec, pix=pix, audio=audio, caps=sorted(caps)):
                got = self._decide("a.mkv", _streams(codec, pix, audio, "[0][0][0][0]"), frozenset(caps))[1]
                self.assertEqual(got, expected)

    def test_whole_file_copy_is_used_for_playable_codecs_and_tags_hevc_hvc1(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            service = self._service(root)
            source = root / "a.mkv"
            source.write_bytes(b"x")
            profile = segments_profile(video="hevc", pix="yuv420p", audio="ac3", tag="hev1")
            names = lambda caps: [a.name for a in service._attempts(
                root / "ffmpeg.exe", source, root / "o.mp4", profile, caps)]
            self.assertNotIn("video-copy", names(frozenset()))
            attempts = list(service._attempts(
                root / "ffmpeg.exe", source, root / "o.mp4", profile, frozenset({"hevc", "hev1"})))
            copy = attempts[0]
            self.assertEqual(copy.name, "video-copy")
            self.assertEqual(copy.command[copy.command.index("-tag:v") + 1], "hvc1")
            self.assertEqual(copy.command[copy.command.index("-c:a") + 1], "aac")

    def test_cache_names_differ_by_capabilities(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = self._service(root)
            streams = _streams("hevc", "yuv420p", "aac", "hvc1")
            produced = []

            class Process:
                returncode = 0

                def __init__(self, command, **_kwargs):
                    self.command = list(command)

                def communicate(self, timeout=None):
                    if Path(self.command[0]).stem.lower() == "ffprobe":
                        return json.dumps({"streams": streams, "format": {"duration": "10"}}).encode(), b""
                    Path(self.command[-1]).write_bytes(b"mp4")
                    return b"", b""

            with mock.patch("peach.transcodes.subprocess.Popen", side_effect=Process):
                for caps in (frozenset(), frozenset({"hevc"})):
                    produced.append(service.browser_path(3, source, caps=caps)[0])
            self.assertNotEqual(produced[0], produced[1])

    def test_mkv_with_a_nonzero_start_or_unknown_duration_is_not_copied(self):
        for probe in ({"start_time": "1.4"}, {"duration": "0"}, {"start_time": "N/A"}):
            with self.subTest(probe=probe):
                self.assertEqual(self._decide("a.mkv", _streams("h264"), **probe)[1], None)

    def test_without_ffprobe_nothing_is_copied(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = TranscodeService(_Resolver(root, probe=False), root / "cache")
            self.assertIsNone(service.remux_audio(source))

    def test_mov_missing_composition_offsets_is_still_repaired_like_mp4(self):
        from support.mp4 import minimal_mp4
        for name in ("m.mp4", "m.mov"):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                source = root / name
                source.write_bytes(minimal_mp4(timescale=1000, sample_delta=40, samples=100, keyframe_every=25))
                service = self._service(root)
                streams = [dict(s, has_b_frames=2) if s["codec_type"] == "video" else s
                           for s in _streams("h264")]
                with mock.patch("peach.transcodes.subprocess.Popen", side_effect=_probe_process(streams)):
                    self.assertTrue(service.requires_conversion(source))
                    self.assertTrue(service.decode_order_timestamps(source))
                    self.assertEqual(service.browser_path(5, source), (source, False))


class WholeFileTranscodeGuardTests(unittest.TestCase):
    def test_not_allowed_without_a_cached_result_never_starts_ffmpeg(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            source = root / "a.avi"
            source.write_bytes(b"x")
            service = TranscodeService(_Resolver(root), root / "cache", prefer_hardware=False)
            with mock.patch("peach.transcodes.subprocess.Popen") as popen:
                with self.assertRaises(TranscodeNeedsSession):
                    service.browser_path(1, source, convert=False)
            popen.assert_not_called()

    def test_not_allowed_still_serves_an_existing_cache_entry(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            source = root / "a.avi"
            source.write_bytes(b"x")
            service = TranscodeService(_Resolver(root), root / "cache", prefer_hardware=False)
            stat = source.stat()
            cached = root / "cache" / f"1-{stat.st_size}-{stat.st_mtime_ns}.mp4"
            cached.parent.mkdir()
            cached.write_bytes(b"mp4")
            self.assertEqual(service.browser_path(1, source, convert=False), (cached, True))

    def test_a_stop_event_kills_ffmpeg_and_leaves_no_partial_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            source = root / "a.avi"
            source.write_bytes(b"x")
            service = TranscodeService(_Resolver(root), root / "cache", prefer_hardware=False)
            stop = threading.Event()
            killed = []

            class Process:
                returncode = None

                def __init__(self, command, **_kwargs):
                    self.command = command
                    Path(command[-1]).parent.mkdir(parents=True, exist_ok=True)
                    Path(command[-1]).write_bytes(b"partial")
                    stop.set()

                def communicate(self, timeout=None):
                    if killed:
                        return b"", b""
                    import subprocess
                    raise subprocess.TimeoutExpired("ffmpeg", timeout)

                def kill(self):
                    killed.append(True)
                    self.returncode = -9

            with mock.patch("peach.transcodes.subprocess.Popen", side_effect=Process):
                with self.assertRaises(TranscodeCancelled):
                    service.browser_path(1, source, stop=stop)
            self.assertEqual(killed, [True])
            self.assertEqual(list((root / "cache").glob("*")), [])

    def test_cache_is_trimmed_oldest_first_but_keeps_the_new_entry(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            service = TranscodeService(_Resolver(root), root / "cache", cache_bytes=250)
            cache = root / "cache"
            cache.mkdir()
            import os
            for index, name in enumerate(("old.mp4", "mid.mp4", "new.mp4")):
                (cache / name).write_bytes(b"x" * 100)
                os.utime(cache / name, (1000 + index, 1000 + index))
            service._trim_cache(cache / "new.mp4")
            self.assertEqual(sorted(p.name for p in cache.iterdir()), ["mid.mp4", "new.mp4"])

    def test_encoding_children_get_lower_priority_but_probes_do_not(self):
        with mock.patch("peach.transcodes.os.name", "nt"), \
                mock.patch("peach.transcodes.subprocess.CREATE_NO_WINDOW", 0x08000000, create=True), \
                mock.patch("peach.transcodes.subprocess.BELOW_NORMAL_PRIORITY_CLASS", 0x4000, create=True):
            self.assertEqual(background_process_flags(), 0x08004000)
            self.assertEqual(background_process_flags(low_priority=False), 0x08000000)


class RemuxSegmentTests(unittest.TestCase):
    def _service(self, root: Path):
        return HlsSegmentService(_Resolver(root), root / "work")

    def test_options_name_the_mode(self):
        self.assertEqual(segment_options(False), {})
        self.assertEqual(segment_options(True), {"transcode": True})
        self.assertEqual(segment_options(REMUX_COPY_AUDIO), {"remux": REMUX_COPY_AUDIO})
        self.assertEqual(segment_options(REMUX_AAC_AUDIO), {"remux": REMUX_AAC_AUDIO})

    def test_remux_commands_copy_video_and_only_encode_audio_when_asked(self):
        with tempfile.TemporaryDirectory() as tmp:
            service = self._service(Path(tmp))
            for mode, audio in ((REMUX_COPY_AUDIO, "copy"), (REMUX_AAC_AUDIO, "aac")):
                attempts = service._attempts(Path("ffmpeg"), Path("a.mkv"), 10.0, 9.68, False, "", mode)
                self.assertEqual([name for name, _ in attempts][:2], ["remux+0.25", "remux+0.12"])
                command = attempts[0][1](Path("out.ts"))
                self.assertEqual(command[command.index("-c:v") + 1], "copy")
                self.assertEqual(command[command.index("-c:a") + 1], audio)
                self.assertEqual(command[command.index("-ss") + 1], "10.250")
                self.assertEqual(command[command.index("-to") + 1], "19.680")
                self.assertIn("-copyts", command)
                self.assertIn("-noaccurate_seek", command)
                self.assertNotIn("libx264", command)

    def test_cache_paths_do_not_collide_between_modes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = self._service(root)
            paths = {service.cached_path(source, 1, 0, **kw) for kw in (
                {}, {"transcode": True}, {"remux": REMUX_COPY_AUDIO}, {"remux": REMUX_AAC_AUDIO})}
            self.assertEqual(len(paths), 4)

    def _plan_with(self, keyframes, duration=180.0, size=1024):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "a.mkv"
            source.write_bytes(bytes(size))
            service = self._service(root)
            with mock.patch.object(segments, "_probe_keyframes", return_value=keyframes) as probe:
                first = service.remux_plan(source, duration)
                second = service.remux_plan(source, duration)
            self.assertEqual(first, second)
            self.assertEqual(probe.call_count, 1, "结论（含否定结论）按文件缓存")
            return first

    def test_plan_snaps_to_keyframes(self):
        plan = self._plan_with([0.0, 10.0, 19.68, 29.68], duration=40.0)
        self.assertEqual([round(s, 2) for s, _ in plan], [0.0, 10.0, 19.68, 29.68])
        self.assertAlmostEqual(sum(length for _, length in plan), 40.0, places=3)

    def test_plan_is_refused_when_it_would_be_unsafe(self):
        self.assertIsNone(self._plan_with(None))
        self.assertIsNone(self._plan_with([5.0, 15.0, 25.0], duration=30.0), "第一个关键帧太晚")
        self.assertIsNone(self._plan_with([0.0, 60.0, 120.0], duration=180.0), "关键帧太稀")

    def test_oversized_files_are_not_scanned(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = self._service(root)
            with mock.patch.object(segments, "REMUX_SCAN_MAX_BYTES", 0), \
                    mock.patch.object(segments, "_probe_keyframes") as probe:
                self.assertIsNone(service.remux_plan(source, 60.0))
            probe.assert_not_called()

    def test_alignment_check_rejects_a_segment_that_started_one_gop_early(self):
        def report(video_first, video_last, audio_first):
            lines = [f"0,{video_first:.3f},", f"0,{video_last:.3f},", f"1,{audio_first:.3f},"]

            class Result:
                returncode = 0
                stdout = "\n".join(lines).encode()
            return Result

        offset = segments.REMUX_TS_OFFSET
        cases = (
            (10.0 + offset, 19.8 + offset, 9.94 + offset, True),
            (0.0 + offset, 19.8 + offset, 9.94 + offset, False),   # 多带了上一个 GOP
            (19.68 + offset, 29.8 + offset, 19.6 + offset, False),  # 落到了下一个关键帧
            (10.0 + offset, 25.0 + offset, 9.94 + offset, False),   # 越过终点
            (10.0 + offset, 19.8 + offset, 3.0 + offset, False),    # 音频起点离谱
        )
        for first, last, audio, expected in cases:
            with self.subTest(first=first):
                with mock.patch.object(segments.subprocess, "run", return_value=report(first, last, audio)):
                    self.assertEqual(
                        segments._remux_aligned(Path("ffprobe"), Path("seg.ts"), 10.0, 9.68), expected)

    def test_generate_retries_with_the_next_seek_margin_until_aligned(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = self._service(root)
            commands = []

            class Process:
                returncode = 0

                async def communicate(self):
                    return b"", b""

            async def fake_exec(*command, **_kwargs):
                commands.append(list(command))
                Path(command[-1]).write_bytes(b"ts")
                return Process()

            verdicts = iter([False, True])

            async def run():
                with mock.patch("asyncio.create_subprocess_exec", fake_exec), \
                        mock.patch.object(segments, "_remux_aligned", side_effect=lambda *a: next(verdicts)):
                    return await service.generate(
                        source, 10.0, 9.68, asset_id=1, index=1, session="s",
                        registry=StreamSessionRegistry(), remux=REMUX_COPY_AUDIO)

            path = asyncio.run(run())
            self.assertTrue(path.is_file())
            self.assertEqual([c[c.index("-ss") + 1] for c in commands], ["10.250", "10.120"])

    def test_generate_gives_up_when_no_margin_aligns(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = self._service(root)

            class Process:
                returncode = 0

                async def communicate(self):
                    return b"", b""

            async def fake_exec(*command, **_kwargs):
                Path(command[-1]).write_bytes(b"ts")
                return Process()

            async def run():
                with mock.patch("asyncio.create_subprocess_exec", fake_exec), \
                        mock.patch.object(segments, "_remux_aligned", return_value=False):
                    await service.generate(source, 10.0, 9.68, asset_id=1, index=1, session="s",
                                           registry=StreamSessionRegistry(), remux=REMUX_COPY_AUDIO)

            with self.assertRaises(SegmentUnavailable):
                asyncio.run(run())
            self.assertEqual(list((root / "work").rglob("*.ts")), [], "对不上的分片不得留在缓存里")


class HlsPlanRoutingTests(unittest.TestCase):
    """`_hls_plan` 在 H.264 的 MKV 上先试拷流，计划不成立就回到固定 6 秒的转码计划。"""

    def _state(self, audio, remux_plan):
        from types import SimpleNamespace
        asset = SimpleNamespace(duration=60.0)
        return SimpleNamespace(
            media_engine=SimpleNamespace(
                asset=lambda _id: asset,
                stream_plan=lambda _id, mode="auto": SimpleNamespace(protocol="range"),
                filesystem=SimpleNamespace(file_for=lambda a, thumbnail=False: Path("a.mkv")),
            ),
            transcode_service=mock.Mock(remux_audio=mock.Mock(return_value=audio),
                                        media_duration=mock.Mock(return_value=60.0)),
            hls_service=mock.Mock(remux_plan=mock.Mock(return_value=remux_plan),
                                  conversion_plan=mock.Mock(return_value=[(0.0, 6.0)])),
            stream_sessions=StreamSessionRegistry(),
        )

    def test_routes(self):
        from peach.routes_media import _hls_plan
        plan = [(0.0, 10.0), (10.0, 10.0)]
        cases = (
            ("copy", plan, plan, REMUX_COPY_AUDIO),
            ("aac", plan, plan, REMUX_AAC_AUDIO),
            ("aac", None, [(0.0, 6.0)], True),      # 关键帧表不合格：回到转码
            (None, plan, [(0.0, 6.0)], True),       # 不是 H.264 的 MKV：转码
            ("fmp4-copy", plan, plan, segments.FMP4_COPY_AUDIO),
            ("fmp4-aac", plan, plan, segments.FMP4_AAC_AUDIO),
            ("fmp4-copy", None, [(0.0, 6.0)], True),
        )
        for audio, remux_plan, expected_plan, expected_mode in cases:
            with self.subTest(audio=audio, plan=bool(remux_plan)):
                state = self._state(audio, remux_plan)
                _, _, got_plan, mode = _hls_plan(state, 1, "s", True)
                self.assertEqual((got_plan, mode), (expected_plan, expected_mode))


class Fmp4SegmentTests(unittest.TestCase):
    @staticmethod
    def _box(kind: bytes, payload: bytes = b"") -> bytes:
        import struct
        return struct.pack(">I4s", 8 + len(payload), kind) + payload

    def test_a_segment_is_split_into_init_and_media_and_loses_the_index(self):
        from peach.fmp4 import Fmp4Error, split_segment
        raw = (self._box(b"ftyp", b"cmfc") + self._box(b"moov", b"HEAD")
               + self._box(b"moof", b"one") + self._box(b"mdat", b"AAA")
               + self._box(b"moof", b"two") + self._box(b"mdat", b"BBB")
               + self._box(b"mfra", b"index"))
        init, media = split_segment(raw)
        self.assertEqual(init, self._box(b"ftyp", b"cmfc") + self._box(b"moov", b"HEAD"))
        self.assertEqual(media, self._box(b"moof", b"one") + self._box(b"mdat", b"AAA")
                         + self._box(b"moof", b"two") + self._box(b"mdat", b"BBB"))
        with self.assertRaises(Fmp4Error):
            split_segment(self._box(b"ftyp", b"x") + self._box(b"moov", b"y"))
        with self.assertRaises(Fmp4Error):
            split_segment(raw[:-3])

    def test_playlist_declares_the_init_segment_for_fmp4_only(self):
        plan = [(0.0, 8.0), (8.0, 8.0)]
        ts = segments.build_hls_playlist(plan, lambda i: f"{i}.ts")
        fmp4 = segments.build_hls_playlist(plan, lambda i: f"{i}.m4s", init_url="init.mp4?s=1")
        self.assertIn("#EXT-X-VERSION:3", ts)
        self.assertNotIn("EXT-X-MAP", ts)
        self.assertIn("#EXT-X-VERSION:7", fmp4)
        self.assertIn('#EXT-X-MAP:URI="init.mp4?s=1"', fmp4)
        self.assertIn("0.m4s", fmp4)

    def test_commands_copy_the_video_tag_hevc_hvc1_and_keep_the_source_timeline(self):
        with tempfile.TemporaryDirectory() as tmp:
            service = HlsSegmentService(_Resolver(Path(tmp)), Path(tmp) / "work")
            for codec, tag in (("hevc", True), ("av1", False)):
                for mode, audio in ((segments.FMP4_COPY_AUDIO, "copy"), (segments.FMP4_AAC_AUDIO, "aac")):
                    command = service._attempts(
                        Path("ffmpeg"), Path("a.mkv"), 8.0, 8.0, False, codec, mode)[0][1](Path("out.mp4"))
                    self.assertEqual(command[command.index("-c:v") + 1], "copy")
                    self.assertEqual(command[command.index("-c:a") + 1], audio)
                    self.assertEqual("-tag:v" in command, tag)
                    if tag:
                        self.assertEqual(command[command.index("-tag:v") + 1], "hvc1")
                    self.assertIn("-copyts", command)
                    self.assertEqual(command[command.index("-movflags") + 1], "cmaf+frag_discont")
                    self.assertEqual(command[command.index("-f") + 1], "mp4")
                    self.assertNotIn("mpegts", command)

    def test_cache_paths_and_init_live_together(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "a.mkv"
            source.write_bytes(b"x")
            service = HlsSegmentService(_Resolver(root), root / "work")
            segment = service.cached_path(source, 1, 3, remux=segments.FMP4_COPY_AUDIO)
            self.assertEqual(segment.name, "3.m4s")
            self.assertEqual(service.init_path(source, 1, segments.FMP4_COPY_AUDIO),
                             segment.with_name("init.mp4"))

    def test_open_gop_keyframes_are_not_segment_boundaries(self):
        """HEVC 的 CRA 后面紧跟显示时刻更早的前导帧，从这里切开后一片开头缺参考。"""
        lines = [
            "0.0,N/A,K__,", "0.16,N/A,___,", "0.08,0.0,___,",           # 关键帧 0.0：后面都不早于它
            "8.0,7.92,K__,", "7.92,7.96,___,", "7.96,8.0,___,",         # 8.0 之后有 7.92 的前导帧
            "16.0,15.92,K__,", "16.16,15.96,___,", "16.08,16.0,___,",   # 16.0 干净
        ]

        class Result:
            returncode = 0
            stdout = "\n".join(lines).encode()
        with mock.patch.object(segments.subprocess, "run", return_value=Result):
            self.assertEqual(segments._probe_keyframes(Path("ffprobe"), Path("a.mkv")), [0.0, 16.0])


class IdleReapTests(unittest.TestCase):
    class _Process:
        def __init__(self):
            self.returncode = None
            self.killed = False

        def kill(self):
            self.killed = True
            self.returncode = -9

    def test_only_idle_reapable_processes_are_killed(self):
        registry = StreamSessionRegistry(idle_seconds=60.0, sweep_seconds=3600.0)
        idle, busy, whole_file = self._Process(), self._Process(), self._Process()
        with mock.patch("peach.streaming.monotonic", return_value=1000.0):
            registry.register_process("gone", idle, reapable=True)
            registry.register_process("watching", busy, reapable=True)
            registry.register_process("long", whole_file)
        with mock.patch("peach.streaming.monotonic", return_value=1100.0):
            registry.touch("watching")
            registry.touch("long")
            self.assertEqual(registry.reap_idle(), 1)
        self.assertTrue(idle.killed)
        self.assertFalse(busy.killed)
        self.assertFalse(whole_file.killed, "整片转码只有它自己的请求在等，不按空闲回收")
        self.assertFalse(registry.is_cancelled("gone"), "只杀进程，不立墓碑，暂停后还能继续播")

    def test_a_process_inside_the_window_is_left_alone(self):
        registry = StreamSessionRegistry(idle_seconds=60.0, sweep_seconds=3600.0)
        process = self._Process()
        with mock.patch("peach.streaming.monotonic", return_value=1000.0):
            registry.register_process("s", process, reapable=True)
        with mock.patch("peach.streaming.monotonic", return_value=1030.0):
            self.assertEqual(registry.reap_idle(), 0)
        self.assertFalse(process.killed)

    def test_sweeper_thread_reaps_without_any_new_request(self):
        registry = StreamSessionRegistry(idle_seconds=0.05, sweep_seconds=0.02)
        process = self._Process()
        registry.register_process("s", process, reapable=True)
        deadline = threading.Event()
        for _ in range(100):
            if process.killed:
                break
            deadline.wait(0.05)
        self.assertTrue(process.killed)


    def test_a_reaped_process_is_reported_exactly_once(self):
        registry = StreamSessionRegistry(idle_seconds=60.0, sweep_seconds=3600.0)
        process, other = self._Process(), self._Process()
        with mock.patch("peach.streaming.monotonic", return_value=1000.0):
            registry.register_process("s", process, reapable=True)
        with mock.patch("peach.streaming.monotonic", return_value=1100.0):
            registry.reap_idle()
        self.assertTrue(registry.consume_reaped(process))
        self.assertFalse(registry.consume_reaped(process))
        self.assertFalse(registry.consume_reaped(other))

    def test_a_cancelled_session_is_not_reported_as_reaped(self):
        registry = StreamSessionRegistry(idle_seconds=60.0, sweep_seconds=3600.0)
        process = self._Process()
        registry.register_process("s", process, reapable=True)
        registry.cancel("s")
        self.assertTrue(process.killed)
        self.assertFalse(registry.consume_reaped(process))

    def test_the_default_window_clears_orphans_within_half_a_minute(self):
        self.assertLessEqual(StreamSessionRegistry()._idle_seconds, 30.0)


class ReapedSegmentTests(unittest.IsolatedAsyncioTestCase):
    async def test_a_reaped_encoder_ends_the_segment_instead_of_trying_the_next_one(self):
        """回收杀掉 FFmpeg 后退出码非零，生成循环若当成编码失败，会接着起下一个编码器的进程。"""
        registry = StreamSessionRegistry(idle_seconds=0.0, sweep_seconds=3600.0)
        finished = asyncio.Event()

        class Process:
            returncode = None

            async def communicate(self):
                await finished.wait()
                return b"", b""

            def kill(self):
                self.returncode = 1
                finished.set()

        spawned = []

        async def spawn(*command, **_kwargs):
            spawned.append(command)
            return Process()

        service = HlsSegmentService.__new__(HlsSegmentService)
        with mock.patch.object(segments.asyncio, "create_subprocess_exec", spawn):
            running = asyncio.ensure_future(service._run(["ffmpeg"], "s", registry))
            while not spawned:
                await asyncio.sleep(0.01)
            await asyncio.sleep(0.01)
            self.assertEqual(registry.reap_idle(), 1)
            with self.assertRaises(segments.SegmentCancelled):
                await asyncio.wait_for(running, 5)
        self.assertEqual(len(spawned), 1)
        self.assertFalse(registry.is_cancelled("s"), "回收不立墓碑，暂停后继续播放的请求照常重新生成这一片")

        class Finishing:
            returncode = 0

            async def communicate(self):
                return b"", b""

        async def spawn_again(*command, **_kwargs):
            return Finishing()

        with mock.patch.object(segments.asyncio, "create_subprocess_exec", spawn_again):
            self.assertEqual(await service._run(["ffmpeg"], "s", registry), (0, b""))


class RealServerDisconnectTests(unittest.TestCase):
    """真 uvicorn、真应用的中间件栈：浏览器关掉标签页，处理函数里要看得到客户端走了。

    用假 `Request` 的用例证明不了这一点。`BaseHTTPMiddleware` 包住应用时，
    `request.is_disconnected()` 永远返回 False，FFmpeg 就一直跑到自然结束。
    """

    def _serve(self):
        """起一台挂着真实应用的 uvicorn，返回 (app, 连接函数)。"""
        import socket
        import time

        import uvicorn

        from peach.api import create_app
        from peach.config import PeachSettings
        from support.ledger import fresh_ledger

        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name).resolve()
        app = create_app(PeachSettings(
            configured=True, db_path=fresh_ledger(root), follow_state_root=root / "state",
            allowed_media_roots=(root,)))
        self.addCleanup(app.state.http_transport.close)
        server = uvicorn.Server(uvicorn.Config(
            app, host="127.0.0.1", port=0, log_level="error", lifespan="off"))
        thread = threading.Thread(target=server.run, daemon=True)
        thread.start()
        self.addCleanup(thread.join, 10)
        self.addCleanup(setattr, server, "should_exit", True)
        deadline = time.monotonic() + 20
        while not server.started and time.monotonic() < deadline:
            time.sleep(0.05)
        self.assertTrue(server.started)
        port = server.servers[0].sockets[0].getsockname()[1]

        def request_then_close(target: str):
            client = socket.create_connection(("127.0.0.1", port), timeout=5)
            client.sendall(f"GET {target} HTTP/1.1\r\nHost: peach.test\r\n\r\n".encode())
            time.sleep(0.5)
            client.close()

        return app, request_then_close

    def test_a_handler_behind_the_app_middleware_sees_the_client_leave(self):
        from starlette.responses import PlainTextResponse
        from starlette.routing import Route

        app, request_then_close = self._serve()
        seen = threading.Event()
        answered = threading.Event()

        async def probe(request):
            for _ in range(100):
                if await request.is_disconnected():
                    seen.set()
                    break
                await asyncio.sleep(0.05)
            answered.set()
            return PlainTextResponse("done")

        app.router.routes.insert(0, Route("/__probe", probe))
        request_then_close("/__probe")
        self.assertTrue(answered.wait(10))
        self.assertTrue(seen.is_set(), "客户端已关闭连接，处理函数却没有看到断开")

    def test_closing_the_tab_stops_a_whole_file_conversion(self):
        """`/stream` 在等整片转码时浏览器走了：转码线程要收到停止信号，FFmpeg 随之被杀。"""
        app, request_then_close = self._serve()
        started = threading.Event()
        stopped = threading.Event()

        def converting(request, asset_id, session, stop, caps=frozenset()):
            started.set()
            if stop.wait(20):
                stopped.set()
            from starlette.responses import Response
            return Response(status_code=410)

        with mock.patch("peach.routes_media._stream_response", converting):
            request_then_close("/stream?id=1&session=tab")
            self.assertTrue(started.wait(10), "转码没有开始")
            self.assertTrue(stopped.wait(10), "标签页关闭之后转码仍在继续")


if __name__ == "__main__":
    unittest.main()
