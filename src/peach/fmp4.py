"""把 FFmpeg 输出的分片 MP4 拆成 HLS 要的两份：初始化段与媒体段。

HLS 的 fMP4 要一个共用的初始化段（`ftyp` + `moov`，`#EXT-X-MAP`）和一串只含
`moof` + `mdat` 的媒体段。每个分片是一次独立的 FFmpeg 运行，输出里各带一份头；
头在同一个源上逐字节相同，取一份当初始化段，其余丢掉。

时间轴不在这里改：`-copyts` 加 `frag_discont` 让 `tfdt` 直接是源里的绝对时刻，各分片首尾相接。
"""
from __future__ import annotations

import struct


class Fmp4Error(ValueError):
    pass


def _boxes(data, start: int, end: int):
    """逐个产出 (类型, 起点, 内容起点, 终点)；长度不合法就抛错，不猜。"""
    offset = start
    while offset < end:
        if offset + 8 > end:
            raise Fmp4Error("box 头被截断")
        size, kind = struct.unpack_from(">I4s", data, offset)
        body = offset + 8
        if size == 1:
            if offset + 16 > end:
                raise Fmp4Error("64 位长度被截断")
            size = struct.unpack_from(">Q", data, body)[0]
            body += 8
        elif size == 0:
            size = end - offset
        if size < body - offset or offset + size > end:
            raise Fmp4Error("box 长度越界")
        yield kind, offset, body, offset + size
        offset += size


def split_segment(raw: bytes) -> tuple[bytes, bytes]:
    """返回 (初始化段, 媒体段)。媒体段只含 moof 与 mdat，丢掉 mfra 等其余盒子。"""
    data = memoryview(raw)
    head = bytearray()
    media = bytearray()
    has_moov = False
    for kind, offset, body, stop in _boxes(data, 0, len(data)):
        if kind in (b"ftyp", b"moov"):
            head += data[offset:stop]
            has_moov = has_moov or kind == b"moov"
        elif kind in (b"moof", b"mdat"):
            media += data[offset:stop]
    if not has_moov or not media:
        raise Fmp4Error("缺 moov 或没有媒体片段")
    return bytes(head), bytes(media)
