from __future__ import annotations

import asyncio
import logging
import threading
import time
from collections.abc import MutableSet
from pathlib import Path
from time import monotonic
from typing import Any

from starlette.responses import FileResponse, Response
from starlette.types import Receive, Scope, Send

RANGE_PREFIX = "bytes="
#: 会话这么久没有任何请求，它名下还在跑的分片 FFmpeg 就是孤儿。分片请求在生成期间每 0.5 秒
#: 续一次期（见 `routes_media._until_disconnect`），所以活着的会话不会被误杀，取 30 秒只是
#: 取消请求与断开检测都落空时的兜底：标签页进程被强杀、设备断网睡眠。
IDLE_REAP_SECONDS = 30.0
IDLE_SWEEP_SECONDS = 10.0


class StreamSessionRegistry:
    """Track addressable browser stream requests so the UI can cancel them."""

    def __init__(self, *, tombstone_seconds: float = 300.0,
                 idle_seconds: float = IDLE_REAP_SECONDS,
                 sweep_seconds: float = IDLE_SWEEP_SECONDS) -> None:
        self._active: dict[str, MutableSet[asyncio.Task[object]]] = {}
        self._processes: dict[str, MutableSet[Any]] = {}
        self._cancelled: dict[str, float] = {}
        self._tombstone_seconds = tombstone_seconds
        self._lock = threading.RLock()
        self._idle_seconds = idle_seconds
        self._sweep_seconds = sweep_seconds
        #: 会话最近一次有请求的时刻。取消请求没送到（关标签页、断网）时靠它回收子进程。
        self._seen: dict[str, float] = {}
        self._reapable: set[Any] = set()
        #: 被回收杀掉的进程。生成分片的协程醒来时据此判定这不是编码失败，不去试下一个编码器。
        self._reaped: set[Any] = set()
        self._sweeper: threading.Thread | None = None

    def touch(self, session: str) -> None:
        """记一次这个会话的请求活动；空会话号不记。"""
        if session:
            with self._lock:
                self._seen[session] = monotonic()

    def reap_idle(self) -> int:
        """杀掉久无请求的会话名下的可回收子进程（HLS 分片的 FFmpeg），返回杀掉的个数。

        只杀进程，不给会话立墓碑：播放器暂停几分钟后继续，会话照旧可用，只是
        被杀的那一片要重新生成。
        """
        now = monotonic()
        victims = []
        with self._lock:
            for session, processes in self._processes.items():
                if now - self._seen.get(session, 0.0) >= self._idle_seconds:
                    victims.extend(item for item in processes if item in self._reapable)
            for session in [key for key, moment in self._seen.items()
                            if now - moment >= self._idle_seconds * 10 and key not in self._processes]:
                self._seen.pop(session, None)
        killed = 0
        for process in victims:
            try:
                if process.returncode is None:
                    with self._lock:
                        self._reaped.add(process)
                    process.kill()
                    killed += 1
            except (OSError, ProcessLookupError):
                pass
        return killed

    def consume_reaped(self, process: Any) -> bool:
        """这个进程是不是被回收杀掉的；问过一次就忘。"""
        with self._lock:
            if process in self._reaped:
                self._reaped.discard(process)
                return True
            return False

    def _ensure_sweeper(self) -> None:
        with self._lock:
            if self._sweeper is not None and self._sweeper.is_alive():
                return
            self._sweeper = threading.Thread(target=self._sweep, name="PeachStreamReaper", daemon=True)
            self._sweeper.start()

    def _sweep(self) -> None:
        """有子进程在跑时定期回收；没有了就退出，下次登记再起。"""
        while True:
            time.sleep(self._sweep_seconds)
            self.reap_idle()
            with self._lock:
                if not self._reapable:
                    self._sweeper = None
                    return

    def _prune(self, now: float) -> None:
        expired = [
            session for session, cancelled_at in self._cancelled.items()
            if now - cancelled_at >= self._tombstone_seconds
        ]
        for session in expired:
            self._cancelled.pop(session, None)

    def register(self, session: str, task: asyncio.Task[object]) -> bool:
        with self._lock:
            self._prune(monotonic())
            if session in self._cancelled:
                return False
            self._active.setdefault(session, set()).add(task)
            return True

    def register_process(self, session: str, process: Any, *, reapable: bool = False) -> bool:
        """把生成 HLS 片段的子进程纳入同一个可取消会话。

        `reapable` 的进程在会话久无请求时会被回收；整片转码的请求本身就是唯一的活动，
        不能按这个判据杀，所以默认不可回收。
        """
        with self._lock:
            now = monotonic()
            self._prune(now)
            if session in self._cancelled:
                return False
            self._processes.setdefault(session, set()).add(process)
            if reapable:
                self._reapable.add(process)
                self._seen[session] = now
        if reapable:
            self._ensure_sweeper()
        return True

    def unregister_process(self, session: str, process: Any) -> None:
        with self._lock:
            self._reapable.discard(process)
            processes = self._processes.get(session)
            if not processes:
                return
            processes.discard(process)
            if not processes:
                self._processes.pop(session, None)

    def is_cancelled(self, session: str) -> bool:
        with self._lock:
            self._prune(monotonic())
            return session in self._cancelled

    def unregister(self, session: str, task: asyncio.Task[object]) -> None:
        with self._lock:
            tasks = self._active.get(session)
            if not tasks:
                return
            tasks.discard(task)
            if not tasks:
                self._active.pop(session, None)

    def cancel(self, session: str) -> int:
        with self._lock:
            self._prune(monotonic())
            self._cancelled[session] = monotonic()
            self._seen.pop(session, None)
            tasks = tuple(self._active.pop(session, ()))
            processes = tuple(self._processes.pop(session, ()))
            self._reapable.difference_update(processes)
        for task in tasks:
            task.cancel()
        for process in processes:
            try:
                if process.returncode is None:
                    process.kill()
            except (OSError, ProcessLookupError):
                pass
        return len(tasks) + len(processes)

    def active_count(self, session: str) -> int:
        with self._lock:
            return len(self._active.get(session, ()))


async def _wait_for_disconnect(receive: Receive) -> None:
    """等到客户端断开。请求体读完后 uvicorn 的 receive() 只会在断开时再返回一次。"""
    while True:
        message = await receive()
        if message["type"] == "http.disconnect":
            return


async def _send_until_disconnect(inner, scope: Scope, receive: Receive, send: Send) -> None:
    """跑 `inner` 发响应，客户端一断开就把它掐掉。"""
    respond = asyncio.ensure_future(inner(scope, receive, send))
    watch = asyncio.ensure_future(_wait_for_disconnect(receive))
    try:
        await asyncio.wait({respond, watch}, return_when=asyncio.FIRST_COMPLETED)
    finally:
        respond.cancel()
        watch.cancel()
        await asyncio.gather(respond, watch, return_exceptions=True)
    if not respond.cancelled():
        respond.result()


class BufferedFileResponse(FileResponse):
    """按 1 MiB 读文件再发，客户端一断开就停止读。

    Starlette 默认每次读 64 KiB，浏览器缓冲一段 Range 要向 CloudDrive 发几十次小读；
    读大一点只是少跑几趟挂载层，Range 语义不变。

    浏览器拖动进度条时会掐掉旧的开区间 Range 请求。uvicorn 在连接断开后 send() 只是静默
    返回，Starlette 的 FileResponse 又不监听断开事件，读文件的循环会一直跑到文件末尾：
    一部 5 GB 的片子每拖一次就多一个幽灵读者，通过挂载把剩下的几 GB 全拉一遍，新位置那
    一块只能排在它们后面（2026-09-13 实测，断开后 15 秒继续下行 221 MB 直到文件结束）。
    所以这里自己盯 http.disconnect，收到就取消发送任务，最多多读一块。
    """

    chunk_size = 1 << 20

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await super().__call__(scope, receive, send)
            return
        await _send_until_disconnect(super().__call__, scope, receive, send)


class CancellableFileResponse(BufferedFileResponse):
    """能按会话取消正在发送任务的 FileResponse。"""

    def __init__(
        self,
        path: str | Path,
        *,
        session: str,
        registry: StreamSessionRegistry,
        media_type: str | None = None,
    ) -> None:
        super().__init__(path, media_type=media_type)
        self.session = session
        self.registry = registry

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        task = asyncio.current_task()
        if task is None or not self.registry.register(self.session, task):
            await Response(status_code=410, headers={"Cache-Control": "no-store"})(scope, receive, send)
            return
        try:
            await super().__call__(scope, receive, send)
        except asyncio.CancelledError:
            logging.getLogger(__name__).info("stream session cancelled: %s", self.session)
            raise
        finally:
            self.registry.unregister(self.session, task)


def _overlap(blob: bytes, base: int, start: int, end: int):
    """`blob` 铺在虚拟文件的 `base` 处，取它和闭区间 [start, end] 相交的那一段。"""
    begin = max(start, base)
    stop = min(end + 1, base + len(blob))
    if begin < stop:
        yield blob[begin - base:stop - base]


def _requested_range(scope: Scope, total: int) -> tuple[int, int, bool] | None:
    """解析单段 Range，返回 (起, 止, 是不是按 Range 答的)；要不起的区间返回 None。

    末位的布尔值决定回 206 还是 200：整份内容也要回 206，有播放器把 200 读成「这个
    服务端不支持 Range」，接着就把拖动关掉。
    多段 Range 当没有 Range 处理：浏览器播视频从不这么请求，为它写一套 multipart
    没有真实需求。
    """
    raw = ""
    for key, value in scope.get("headers", ()):
        if key.lower() == b"range":
            raw = value.decode("latin-1").strip()
            break
    if not raw.startswith(RANGE_PREFIX) or "," in raw:
        return 0, total - 1, False
    first, _, last = raw[len(RANGE_PREFIX):].partition("-")
    try:
        if not first:
            length = int(last)
            if length <= 0:
                return 0, total - 1, False
            return total - min(length, total), total - 1, True
        start = int(first)
        end = int(last) if last else total - 1
    except ValueError:
        return 0, total - 1, False
    end = min(end, total - 1)
    return None if start > end or start >= total else (start, end, True)


class SplicedMp4Response(Response):
    """把「修好的头 + 原文件里那一段 mdat」当成一个虚拟文件发出去。

    Starlette 的 `FileResponse` 按磁盘上那个文件的大小和偏移切 Range，而这里要发的字节
    序列在磁盘上并不存在：头在边车里，内容是原文件中间的一段。所以 Range 自己算。
    断开就停读，理由和 `BufferedFileResponse` 一样。
    """

    chunk_size = 1 << 20

    def __init__(
        self,
        path: str | Path,
        header,
        *,
        session: str = "",
        registry: StreamSessionRegistry | None = None,
    ) -> None:
        super().__init__(b"", media_type="video/mp4")
        self.path = Path(path)
        self.header = header
        self.session = session
        self.registry = registry

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await super().__call__(scope, receive, send)
            return
        task = asyncio.current_task()
        tracked = bool(self.session and self.registry is not None)
        if tracked and (task is None or not self.registry.register(self.session, task)):
            await Response(status_code=410, headers={"Cache-Control": "no-store"})(scope, receive, send)
            return
        try:
            await _send_until_disconnect(self._respond, scope, receive, send)
        except asyncio.CancelledError:
            logging.getLogger(__name__).info("stream session cancelled: %s", self.session)
            raise
        finally:
            if tracked and task is not None:
                self.registry.unregister(self.session, task)

    async def _respond(self, scope: Scope, receive: Receive, send: Send) -> None:
        total = self.header.size
        window = _requested_range(scope, total)
        if window is None:
            await Response(
                status_code=416,
                headers={"Content-Range": f"bytes */{total}", "Cache-Control": "no-store"},
            )(scope, receive, send)
            return
        start, end, ranged = window
        headers = [
            (b"content-type", b"video/mp4"),
            (b"accept-ranges", b"bytes"),
            (b"cache-control", b"no-store"),
            (b"content-length", str(end - start + 1).encode("latin-1")),
        ]
        if ranged:
            headers.append((b"content-range", f"bytes {start}-{end}/{total}".encode("latin-1")))
        await send({
            "type": "http.response.start",
            "status": 206 if ranged else 200,
            "headers": headers,
        })
        if scope.get("method", "GET").upper() == "HEAD":
            await send({"type": "http.response.body", "body": b"", "more_body": False})
            return
        stream = self._chunks(start, end)
        try:
            async for chunk in stream:
                await send({"type": "http.response.body", "body": chunk, "more_body": True})
        finally:
            await stream.aclose()
        await send({"type": "http.response.body", "body": b"", "more_body": False})

    async def _chunks(self, start: int, end: int):
        """按虚拟文件的坐标取字节：先头、再原文件那一段、最后尾。"""
        body_start = len(self.header.prefix)
        body_end = body_start + (self.header.payload_end - self.header.payload_start)
        for chunk in _overlap(self.header.prefix, 0, start, end):
            yield chunk
        if end >= body_start and start < body_end:
            async for chunk in self._source_chunks(
                max(start, body_start) - body_start, min(end + 1, body_end) - body_start,
            ):
                yield chunk
        for chunk in _overlap(self.header.suffix, body_end, start, end):
            yield chunk

    async def _source_chunks(self, begin: int, stop: int):
        """整段共用一个句柄：挂载盘上每开一次文件都要多走一趟握手。"""
        handle = await asyncio.to_thread(open, self.path, "rb")
        try:
            await asyncio.to_thread(handle.seek, self.header.payload_start + begin)
            remaining = stop - begin
            while remaining > 0:
                chunk = await asyncio.to_thread(handle.read, min(self.chunk_size, remaining))
                if not chunk:
                    return
                yield chunk
                remaining -= len(chunk)
        finally:
            handle.close()
