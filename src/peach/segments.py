"""按关键帧切 HLS 片段，避免挂载网盘承担整段 MP4 Range。"""
from __future__ import annotations

import asyncio
import logging
import math
import os
import subprocess
import threading
import uuid
from collections import OrderedDict
from pathlib import Path

from .ffmpeg import FFmpegResolver
from .hardware_transcode import HardwareTranscoder
from .mp4index import keyframe_seconds, segment_plan
from .fmp4 import Fmp4Error, split_segment
from .streaming import StreamSessionRegistry
from .transcodes import background_process_flags

HLS_SEGMENT_SECONDS = 6
# 片段缓存上限。超了按最后访问时间淘汰；片段可再生，丢了只是重跑一次 FFmpeg。
DEFAULT_CACHE_BYTES = 2 << 30
PLAN_CACHE_LIMIT = 256
CODEC_CACHE_LIMIT = 256
PROBE_TIMEOUT_SECONDS = 20
#: 拷流分片：视频原样封装，音频按需转 aac。值同时是 `_hls_plan` 第四项与缓存目录的标记。
REMUX_COPY_AUDIO = "remux-copy"
REMUX_AAC_AUDIO = "remux-aac"
#: 视频不是 H.264（或是 10bit）时装 fMP4：MPEG-TS 里的 HEVC/AV1 浏览器不认。
FMP4_COPY_AUDIO = "fmp4-copy"
FMP4_AAC_AUDIO = "fmp4-aac"
FMP4_MODES = frozenset({FMP4_COPY_AUDIO, FMP4_AAC_AUDIO})
REMUX_MODES = frozenset({REMUX_COPY_AUDIO, REMUX_AAC_AUDIO}) | FMP4_MODES
#: fMP4 的统一时间偏移：全部分片同向平移，起点不贴着 0，片头的重排延迟不会落到负时间。
FMP4_TS_OFFSET = 1.0
#: 关键帧表要把整个文件解复用一遍；超过这个体积或时限就放弃拷流，回到重编码。
REMUX_SCAN_MAX_BYTES = 3 << 30
REMUX_SCAN_TIMEOUT_SECONDS = 20
#: 拷流分片最长不超过这个秒数，关键帧太稀的片源一段就是半部片，不如重编码。
REMUX_MAX_SEGMENT_SECONDS = 20.0
#: 容器的第一个关键帧不能晚于这个秒数，否则开头那段没有可解的画面。
REMUX_FIRST_KEYFRAME_SECONDS = 1.0
#: 输入 `-ss` 要比关键帧时刻略大：恰好落在关键帧上的目标时刻会 seek 到上一个关键帧，
#: 每段多带一整个 GOP。依次尝试，产出的分片起点对不上计划就换下一个。
REMUX_SEEK_MARGINS = (0.25, 0.12, 0.5, 0.0)
#: 关键帧后往后看这么多个包，查有没有显示时刻更早的前导帧。
REMUX_LEADING_LOOKAHEAD = 16
#: 分片首个视频包的显示时刻允许偏离计划起点的范围（秒）。B 帧重排会让它略晚于起点。
REMUX_START_TOLERANCE = (-0.05, 0.3)
#: 全部拷流分片统一晚 0.1 秒：开头有 B 帧的片源第一个 dts 为负，muxer 会只把第一片整体推后，
#: 与后面各片之间多出一截重叠。统一预留这一段，每片的时间轴就同向同量。
REMUX_TS_OFFSET = 0.1
logger = logging.getLogger(__name__)


def _probe_video_codec(ffprobe: Path, source: Path) -> str:
    """问 ffprobe 要第一条视频流的编码名。问不出来返回空串，调用方按软件解码处理。"""
    command = (str(ffprobe), "-v", "error", "-select_streams", "v:0", "-show_entries",
               "stream=codec_name", "-of", "default=nw=1:nk=1", str(source))
    try:
        result = subprocess.run(command, capture_output=True, timeout=PROBE_TIMEOUT_SECONDS,
                                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
    except (OSError, subprocess.SubprocessError):
        return ""
    return result.stdout.decode("utf-8", "replace").strip().lower() if result.returncode == 0 else ""


def _probe_keyframes(ffprobe: Path, source: Path) -> list[float] | None:
    """逐包读视频流的关键帧显示时刻（秒，升序）。读不出返回 None。

    MKV 没有 MP4 那样集中的 `stss`，只能扫一遍包头；`-select_streams v:0` 之外的包
    仍要读过，所以调用方限制了体积和时限。没有 pts 的包退回 dts。
    """
    command = (str(ffprobe), "-v", "error", "-select_streams", "v:0", "-show_entries",
               "packet=pts_time,dts_time,flags", "-of", "csv=p=0", str(source))
    try:
        result = subprocess.run(command, capture_output=True, timeout=REMUX_SCAN_TIMEOUT_SECONDS,
                                creationflags=background_process_flags(low_priority=False))
    except (OSError, subprocess.SubprocessError):
        return None
    if result.returncode:
        return None
    moments: list[float | None] = []
    keyframes: list[int] = []
    for line in result.stdout.decode("utf-8", "replace").splitlines():
        fields = line.strip().rstrip(",").split(",")
        if len(fields) < 3:
            continue
        moment = None
        for raw in fields[:2]:
            try:
                moment = float(raw)
                break
            except ValueError:
                continue
        if "K" in fields[2] and moment is not None:
            keyframes.append(len(moments))
        moments.append(moment)
    # 开放 GOP：关键帧之后解码顺序紧跟着显示时刻更早的前导帧（HEVC 的 CRA + RASL）。
    # 从这里切开，后一片开头的前导帧缺参考，被解码器丢掉或时间戳错乱，所以不当作分片边界。
    safe = []
    for index in keyframes:
        here = moments[index]
        if all(later is None or later >= here for later in moments[index + 1:index + 1 + REMUX_LEADING_LOOKAHEAD]):
            safe.append(here)
    return sorted(set(safe)) or None


def _remux_aligned(ffprobe: Path, path: Path, start: float, duration: float,
                   offset: float = REMUX_TS_OFFSET) -> bool:
    """拷流分片的真实内容对得上计划吗：第一个视频包在起点上，音频不早于起点太多。

    `-ss` 落在哪个关键帧由容器索引决定，ffmpeg 退出码 0 也可能多带或少带一个 GOP；
    对不上的分片写进缓存，播放就是整段重复或画面错位，所以出炉前先验。
    """
    command = (str(ffprobe), "-v", "error", "-show_entries", "packet=stream_index,pts_time",
               "-of", "csv=p=0", str(path))
    try:
        result = subprocess.run(command, capture_output=True, timeout=PROBE_TIMEOUT_SECONDS,
                                creationflags=background_process_flags(low_priority=False))
    except (OSError, subprocess.SubprocessError):
        return False
    if result.returncode:
        return False
    first: dict[str, float] = {}
    last: dict[str, float] = {}
    for line in result.stdout.decode("utf-8", "replace").splitlines():
        fields = line.strip().rstrip(",").split(",")
        if len(fields) != 2:
            continue
        try:
            index, moment = fields[0], float(fields[1])
        except ValueError:
            continue
        first[index] = min(moment, first.get(index, moment))
        last[index] = max(moment, last.get(index, moment))
    if "0" not in first:
        return False
    low, high = REMUX_START_TOLERANCE
    start += offset
    if not start + low <= first["0"] <= start + high:
        return False
    if last["0"] > start + duration + 1.0:
        return False
    return all(moment >= start - 0.6 for index, moment in first.items() if index != "0")


def segment_options(mode) -> dict:
    """`_hls_plan` 第四项对应的 `generate` 参数：False 原样封装，True 重编码，其余拷流。"""
    if mode in REMUX_MODES:
        return {"remux": mode}
    return {"transcode": True} if mode else {}


class SegmentUnavailable(RuntimeError):
    pass


class SegmentCancelled(RuntimeError):
    pass


def build_hls_playlist(plan: list[tuple[float, float]], segment_url, init_url: str | None = None) -> str:
    """按真实分片计划生成 VOD 播放列表。

    时长必须写实际值。按 6 秒等分声明的话，`-c copy` 只能切在关键帧上，
    遇到关键帧间隔 8.33 秒的片源，目录说的和实际内容就完全对不上。
    """
    target = max(1, round(max(length for _, length in plan)))
    lines = [
        "#EXTM3U",
        # fMP4 分片要 EXT-X-MAP，协议版本至少 6；MPEG-TS 保持 3。
        f"#EXT-X-VERSION:{7 if init_url else 3}",
        f"#EXT-X-TARGETDURATION:{target}",
        "#EXT-X-PLAYLIST-TYPE:VOD",
        "#EXT-X-MEDIA-SEQUENCE:0",
    ]
    if init_url:
        lines.extend(("#EXT-X-INDEPENDENT-SEGMENTS", f'#EXT-X-MAP:URI="{init_url}"'))
    for index, (_, length) in enumerate(plan):
        lines.extend((f"#EXTINF:{length:.3f},", str(segment_url(index))))
    lines.extend(("#EXT-X-ENDLIST", ""))
    return "\n".join(lines)


class HlsSegmentService:
    """按关键帧边界 remux 单个时间段，输出可缓存的 MPEG-TS。"""

    def __init__(
        self,
        resolver: FFmpegResolver,
        work_root: Path,
        segment_seconds: int = HLS_SEGMENT_SECONDS,
        max_concurrent: int | None = None,
        cache_bytes: int = DEFAULT_CACHE_BYTES,
        prefer_hardware: bool = False,
        hardware: HardwareTranscoder | None = None,
    ):
        self.resolver = resolver
        self.work_root = work_root
        self.segment_seconds = segment_seconds
        self.cache_bytes = cache_bytes
        self.prefer_hardware = prefer_hardware
        self.hardware = hardware if hardware is not None else HardwareTranscoder(enabled=prefer_hardware)
        # 每个分片请求都会起一个 FFmpeg；播放器本身就并发预取，多设备同看能把机器打满。
        self._limit = max_concurrent or max(1, (os.cpu_count() or 4) // 2)
        self._semaphore: asyncio.Semaphore | None = None
        self._plans: OrderedDict[tuple, list[tuple[float, float]]] = OrderedDict()
        self._codecs: OrderedDict[tuple, str] = OrderedDict()
        self._scan_lock = threading.Lock()
        # 同一分片常被并发请求：播放器预取、重连、多设备同看都会撞上同一个目标文件。
        # 同目标只放一个生成者，后到者等它完事后直接用缓存，不再各起一个 FFmpeg 重读网盘。
        self._generation_locks: dict[Path, asyncio.Lock] = {}

    def _gate(self) -> asyncio.Semaphore:
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(self._limit)
        return self._semaphore

    def fingerprint(self, source: Path) -> tuple:
        try:
            stat = source.stat()
        except OSError:
            return (str(source), 0, 0)
        return (str(source), stat.st_size, int(stat.st_mtime))

    async def video_codec(self, source: Path) -> str:
        """片源的视频编码名；探测不到返回空串。按 (路径, 大小, mtime) 缓存。

        只有重编码路径问这一句，用来决定敢不敢把解码交给显卡。探测本身在线程里跑：
        片源在挂载网盘上时 ffprobe 要几百毫秒，占着事件循环会卡住同时在放的其它片。
        """
        key = self.fingerprint(source)
        cached = self._codecs.get(key)
        if cached is not None:
            self._codecs.move_to_end(key)
            return cached
        choice = self.resolver.ffprobe()
        codec = await asyncio.to_thread(_probe_video_codec, choice.path, source) if choice else ""
        while len(self._codecs) >= CODEC_CACHE_LIMIT:
            self._codecs.popitem(last=False)
        self._codecs[key] = codec
        return codec

    def plan(self, source: Path, duration: float) -> list[tuple[float, float]] | None:
        """返回分片计划；读不到关键帧就返回 None，由调用方回退标准 Range。"""
        key = (*self.fingerprint(source), self.segment_seconds, round(duration, 3))
        cached = self._plans.get(key)
        if cached is not None:
            self._plans.move_to_end(key)
            return cached or None
        keyframes = keyframe_seconds(source)
        result = segment_plan(keyframes, duration, self.segment_seconds) if keyframes else []
        while len(self._plans) >= PLAN_CACHE_LIMIT:
            self._plans.popitem(last=False)
        self._plans[key] = result
        return result or None

    def remux_plan(self, source: Path, duration: float) -> list[tuple[float, float]] | None:
        """拷流分片计划：读 MKV 的关键帧表，边界落在真实关键帧上。

        任何一步不成立都返回 None，调用方退回重编码：没有 ffprobe、文件太大、扫描超时、
        首个关键帧太晚、关键帧稀得一段超过 `REMUX_MAX_SEGMENT_SECONDS`。结论按文件身份
        缓存（含否定结论），同一个文件的扫描串行，并发的播放列表与分片请求不会各扫一遍。
        """
        key = (*self.fingerprint(source), self.segment_seconds, round(duration, 3), "remux")
        with self._scan_lock:
            cached = self._plans.get(key)
            if cached is not None:
                self._plans.move_to_end(key)
                return cached or None
            result: list[tuple[float, float]] = []
            choice = self.resolver.ffprobe()
            try:
                oversized = source.stat().st_size > REMUX_SCAN_MAX_BYTES
            except OSError:
                oversized = True
            keyframes = None if choice is None or oversized else _probe_keyframes(choice.path, source)
            if keyframes and keyframes[0] <= REMUX_FIRST_KEYFRAME_SECONDS:
                plan = segment_plan(keyframes, duration, self.segment_seconds)
                if plan and max(length for _, length in plan) <= REMUX_MAX_SEGMENT_SECONDS:
                    result = plan
            while len(self._plans) >= PLAN_CACHE_LIMIT:
                self._plans.popitem(last=False)
            self._plans[key] = result
            return result or None

    def cached_path(self, source: Path, asset_id: int, index: int, *, transcode: bool = False,
                    remux: str = "") -> Path:
        _, size, mtime = self.fingerprint(source)
        # 版本号跟着转码命令走：命令一变，磁盘上按另一套命令转出来的片段就得失效，
        # 否则换了解码器，播放器拿到的仍是缓存里那些绿帧。
        flavor = '-h264-v2' if transcode else (f'-{remux}-v1' if remux else '')
        suffix = "m4s" if remux in FMP4_MODES else "ts"
        return self.work_root / str(asset_id) / f"{size}-{mtime}-{self.segment_seconds}{flavor}" / f"{index}.{suffix}"

    def init_path(self, source: Path, asset_id: int, remux: str) -> Path:
        """fMP4 的初始化段，与同一模式的媒体段放在一个目录里。"""
        return self.cached_path(source, asset_id, 0, remux=remux).with_name("init.mp4")

    def conversion_plan(self, duration: float) -> list[tuple[float, float]]:
        """编码片段各自以关键帧开始，覆盖完整的播放时间轴。"""
        return [(float(start), min(float(self.segment_seconds), duration - start))
                for start in range(0, math.ceil(duration), self.segment_seconds)]

    def _evict(self) -> None:
        files = [item for pattern in ("*.ts", "*.m4s") for item in self.work_root.rglob(pattern)
                 if item.is_file()]
        total = 0
        stats = []
        for item in files:
            try:
                stat = item.stat()
            except OSError:
                continue
            total += stat.st_size
            stats.append((stat.st_mtime, stat.st_size, item))
        if total <= self.cache_bytes:
            return
        for _, size, item in sorted(stats):
            try:
                item.unlink()
            except OSError:
                continue
            total -= size
            if total <= self.cache_bytes:
                return

    async def generate(
        self,
        source: Path,
        start: float,
        duration: float,
        *,
        asset_id: int,
        index: int,
        session: str,
        registry: StreamSessionRegistry,
        transcode: bool = False,
        remux: str = "",
    ) -> Path:
        target = self.cached_path(source, asset_id, index, transcode=transcode, remux=remux)
        if target.is_file() and target.stat().st_size:
            os.utime(target, None)      # 命中即续期，淘汰按最后访问时间
            return target
        lock = self._generation_locks.setdefault(target, asyncio.Lock())
        try:
            async with lock:
                # 等到锁的可能是排在生成者后面的请求，先看缓存再决定要不要自己跑。
                if target.is_file() and target.stat().st_size:
                    os.utime(target, None)
                    return target
                return await self._generate_uncached(
                    source, start, duration, target,
                    session=session, registry=registry, transcode=transcode, remux=remux,
                )
        finally:
            if not lock.locked():
                self._generation_locks.pop(target, None)

    async def _generate_uncached(
        self, source: Path, start: float, duration: float, target: Path, *,
        session: str, registry: StreamSessionRegistry, transcode: bool, remux: str = "",
    ) -> Path:
        choice = self.resolver.ffmpeg()
        if choice is None:
            raise SegmentUnavailable("ffmpeg unavailable")
        if registry.is_cancelled(session):
            raise SegmentCancelled(session)
        target.parent.mkdir(parents=True, exist_ok=True)
        codec = await self.video_codec(source) if (
            (transcode and self.hardware.enabled) or remux in FMP4_MODES) else ""
        detail = ""
        async with self._gate():
            attempts = await asyncio.to_thread(
                self._attempts, choice.path, source, start, duration, transcode, codec, remux,
            )
            for name, build in attempts:
                temporary = target.with_name(
                    f"{uuid.uuid4().hex}.tmp.{'mp4' if remux in FMP4_MODES else 'ts'}")
                try:
                    returncode, stderr = await self._run(
                        build(temporary), session, registry, low_priority=transcode)
                    if returncode == 0 and temporary.is_file() and temporary.stat().st_size:
                        if remux and not await asyncio.to_thread(
                                _remux_aligned, self._probe_binary(), temporary, start, duration,
                                FMP4_TS_OFFSET if remux in FMP4_MODES else REMUX_TS_OFFSET):
                            detail = f"{name}: 分片起点与关键帧计划对不上"
                            continue
                        if remux in FMP4_MODES:
                            try:
                                await asyncio.to_thread(
                                    self._finish_fmp4, temporary, target,
                                    target.with_name("init.mp4"))
                            except (Fmp4Error, OSError) as exc:
                                detail = f"{name}: fMP4 分片整理失败：{exc}"
                                continue
                        else:
                            temporary.replace(target)
                        logger.info("HLS 分片完成：%s", name)
                        self._evict()
                        return target
                    if registry.is_cancelled(session):
                        raise SegmentCancelled(session)
                    detail = stderr.decode("utf-8", "replace")[-1000:]
                    if not detail:
                        # FFmpeg 可以退出码 0、stderr 全空却写出 0 字节（时间窗取错就是
                        # 这样）。此时光报 "ffmpeg failed" 等于没报，把能观测到的都说出来。
                        size = temporary.stat().st_size if temporary.is_file() else None
                        detail = (
                            f"ffmpeg wrote no data: returncode={returncode} "
                            f"bytes={'缺文件' if size is None else size} "
                            f"ss={start:.3f} to={start + duration:.3f}"
                        )
                    detail = f"{name}: {detail}"
                finally:
                    temporary.unlink(missing_ok=True)
        raise SegmentUnavailable(detail)

    @staticmethod
    def _finish_fmp4(raw: Path, target: Path, init: Path) -> None:
        """把 FFmpeg 的分片 MP4 拆成初始化段与媒体段后落盘。"""
        head, media = split_segment(raw.read_bytes())
        if not init.is_file():
            pending = init.with_name(f"{uuid.uuid4().hex}.tmp.init")
            pending.write_bytes(head)
            pending.replace(init)
        pending = target.with_name(f"{uuid.uuid4().hex}.tmp.m4s")
        try:
            pending.write_bytes(media)
            pending.replace(target)
        finally:
            pending.unlink(missing_ok=True)

    def _probe_binary(self) -> Path:
        choice = self.resolver.ffprobe()
        if choice is None:
            raise SegmentUnavailable("ffprobe unavailable")
        return choice.path

    def _attempts(self, ffmpeg: Path, source: Path, start: float, duration: float,
                  transcode: bool, codec: str = "", remux: str = ""):
        """依次尝试的命令，每项是 (名字, 接收临时文件路径的构造函数)。

        封装复制只有一种。重编码与整片转码共享可用硬件后端，最后回退 libx264。

        NVDEC 解得出来的编码才走 CUDA 解码，`codec` 空或不在名单里就从软件解码起。
        判据要在开跑前定，因为坏结果不会自报：实测 `MIAD573_02.wmv`（vc1、1080p）经
        `-hwaccel cuda` 出来的首个分片，开头 21 帧在黑场与纯绿之间交替（色度均值在
        128 与 0 之间跳），而 FFmpeg 退出码 0、stderr 全空，绿帧就这么写进缓存，
        下次命中还是它。同一段去掉 CUDA 解码后色度全程 128，一帧绿都没有。
        """
        prefix = [str(ffmpeg), "-hide_banner", "-loglevel", "error", "-nostdin", "-y"]
        mapping = ["-map", "0:v:0", "-map", "0:a:0?", "-sn", "-dn"]
        mux = ["-muxdelay", "0", "-muxpreload", "0", "-f", "mpegts"]
        if remux in FMP4_MODES:
            audio = ["-c:a", "copy"] if remux == FMP4_COPY_AUDIO else ["-c:a", "aac", "-b:a", "160k"]
            # WebKit 只认 hvc1，MKV 里的 HEVC 没有 MP4 标签，统一写 hvc1。
            tag = ["-tag:v", "hvc1"] if codec == "hevc" else []
            return [(f"fmp4+{margin:g}", lambda out, margin=margin: prefix + ["-noaccurate_seek",
                     "-ss", f"{start + margin:.3f}", "-i", str(source), "-to", f"{start + duration:.3f}"]
                     + mapping + ["-c:v", "copy"] + tag + audio
                     + ["-copyts", "-output_ts_offset", f"{FMP4_TS_OFFSET}", "-f", "mp4",
                        "-movflags", "cmaf+frag_discont", str(out)])
                    for margin in REMUX_SEEK_MARGINS]
        if remux:
            # 视频原样封装；音频不是 aac/mp3 才转 aac。`-noaccurate_seek` 让转码的音频也从
            # 落点起算，不然按 `-ss` 精确裁掉的那一小段会在每个分片开头留下静音缺口。
            audio = ["-c:a", "copy"] if remux == REMUX_COPY_AUDIO else ["-c:a", "aac", "-b:a", "160k"]
            return [(f"remux+{margin:g}", lambda out, margin=margin: prefix + ["-noaccurate_seek",
                     "-ss", f"{start + margin:.3f}", "-i", str(source), "-to", f"{start + duration:.3f}"]
                     + mapping + ["-c:v", "copy"] + audio
                     + ["-copyts", "-output_ts_offset", f"{REMUX_TS_OFFSET}"] + mux + [str(out)])
                    for margin in REMUX_SEEK_MARGINS]
        if not transcode:
            # 终点必须写成绝对时间戳。-copyts 保留原始时间轴后，-t 会被当成绝对结束时刻
            # 而不是片段时长，于是除了开头那一两段，每段的 -t 都早已过期，ffmpeg 以
            # 退出码 0、空 stderr 写出 0 字节，服务端只能报一句没有内容的 ffmpeg failed。
            # 保留原始时间戳，让每段接着上一段走。用 -avoid_negative_ts make_zero
            # 把每段归零的话，每段都自称从 0 秒开始，拖动进度条时容易跳错位置。
            window = ["-ss", f"{start:.3f}", "-i", str(source), "-to", f"{start + duration:.3f}"]
            return [("copy", lambda out: prefix + window + mapping + ["-c", "copy", "-copyts"] + mux + [str(out)])]
        window = ["-ss", f"{start:.3f}", "-i", str(source), "-t", f"{duration:.3f}"]
        audio = ["-c:a", "aac", "-b:a", "160k", "-output_ts_offset", f"{start:.3f}"]
        attempts = []
        for encoder in self.hardware.encoders(ffmpeg):
            for attempt in encoder.attempts(codec):
                attempts.append((attempt.name, lambda out, attempt=attempt:
                                 prefix + list(attempt.before_input) + window + mapping
                                 + list(attempt.output) + audio + mux + [str(out)]))
        attempts.append(("libx264", lambda out: prefix + window + mapping + [
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-threads", "2",
        ] + audio + mux + [str(out)]))
        return attempts

    async def _run(self, command: list[str], session: str, registry: StreamSessionRegistry,
                   *, low_priority: bool = False) -> tuple[int, bytes]:
        """跑一次 FFmpeg 并把进程登记到会话，取消时能被杀掉。返回 (退出码, stderr)。

        重编码占满 CPU，调用方传 `low_priority` 让界面和其它请求先走；拷流只是搬数据，不降。
        """
        creationflags = background_process_flags(low_priority=low_priority)
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=asyncio.subprocess.PIPE,
                creationflags=creationflags,
            )
        except OSError as exc:
            raise SegmentUnavailable("ffmpeg failed to start") from exc
        if not registry.register_process(session, process, reapable=True):
            _kill_process(process)
            await process.communicate()
            raise SegmentCancelled(session)
        try:
            _, stderr = await process.communicate()
        except asyncio.CancelledError:
            _kill_process(process)
            await process.communicate()
            raise
        finally:
            registry.unregister_process(session, process)
        return process.returncode, stderr or b""


def _kill_process(process) -> None:
    try:
        if process.returncode is None:
            process.kill()
    except (OSError, ProcessLookupError):
        pass
