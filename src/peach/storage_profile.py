"""判断一条路径落在哪一类存储上，以及此刻还有多少可用内存。

高强度处理只在「本机固态盘」上并行读取：机械盘的并发随机读取会把磁头来回拖动，
网络盘和云盘的并发读取会压住挂载服务。判不出来一律按「不是固态盘」处理，调用方
因此退回逐个读取，不会因为探测失败而误开并行。
"""
from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path


def solid_state(path: str | os.PathLike[str]) -> bool:
    """路径所在卷是本机固态盘；网络盘、机械盘、判不出来都回 `False`。"""
    try:
        if os.name == 'nt':
            return _windows_solid_state(os.path.abspath(os.fspath(path)))
        if sys.platform.startswith('linux'):
            return _linux_solid_state(os.stat(path).st_dev)
    except (OSError, ValueError, AttributeError):
        pass
    return False


@lru_cache(maxsize=32)
def _windows_solid_state(absolute: str) -> bool:
    import ctypes
    from ctypes import wintypes
    drive = os.path.splitdrive(absolute)[0]
    if len(drive) != 2 or drive[1] != ':':
        return False                                   # UNC 共享
    kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel32.GetDriveTypeW.argtypes = [wintypes.LPCWSTR]
    if kernel32.GetDriveTypeW(drive + '\\') != 3:      # DRIVE_FIXED：排除网络、光驱、可移动盘
        return False

    class Query(ctypes.Structure):
        _fields_ = [('PropertyId', ctypes.c_int), ('QueryType', ctypes.c_int),
                    ('AdditionalParameters', ctypes.c_ubyte * 1)]

    class SeekPenalty(ctypes.Structure):
        _fields_ = [('Version', wintypes.DWORD), ('Size', wintypes.DWORD),
                    ('IncursSeekPenalty', ctypes.c_ubyte)]

    kernel32.CreateFileW.restype = wintypes.HANDLE
    kernel32.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, wintypes.LPVOID,
                                     wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
    kernel32.DeviceIoControl.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.LPVOID, wintypes.DWORD,
                                         wintypes.LPVOID, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD),
                                         wintypes.LPVOID]
    handle = kernel32.CreateFileW('\\\\.\\' + drive, 0, 3, None, 3, 0, None)
    if handle in (None, wintypes.HANDLE(-1).value):
        return False
    try:
        query = Query(PropertyId=7, QueryType=0)       # StorageDeviceSeekPenaltyProperty
        result = SeekPenalty()
        returned = wintypes.DWORD()
        if not kernel32.DeviceIoControl(handle, 0x2D1400, ctypes.byref(query), ctypes.sizeof(query),
                                        ctypes.byref(result), ctypes.sizeof(result), ctypes.byref(returned), None):
            return False
        return returned.value >= ctypes.sizeof(result) and result.IncursSeekPenalty == 0
    finally:
        kernel32.CloseHandle(handle)


@lru_cache(maxsize=32)
def _linux_solid_state(device: int) -> bool:
    node = Path(f'/sys/dev/block/{os.major(device)}:{os.minor(device)}').resolve()
    for candidate in (node, node.parent):              # 分区的 queue 在上一级整盘节点
        flag = candidate / 'queue' / 'rotational'
        if flag.is_file():
            return flag.read_text().strip() == '0'
    return False


def available_memory_bytes() -> int | None:
    """此刻可用物理内存；读不到回 `None`。"""
    try:
        if os.name == 'nt':
            import ctypes

            class Status(ctypes.Structure):
                _fields_ = [('length', ctypes.c_ulong), ('load', ctypes.c_ulong),
                            ('total', ctypes.c_ulonglong), ('available', ctypes.c_ulonglong),
                            ('page_total', ctypes.c_ulonglong), ('page_available', ctypes.c_ulonglong),
                            ('virtual_total', ctypes.c_ulonglong), ('virtual_available', ctypes.c_ulonglong),
                            ('extended', ctypes.c_ulonglong)]

            status = Status()
            status.length = ctypes.sizeof(status)
            if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):
                return int(status.available)
            return None
        if sys.platform.startswith('linux'):
            for line in Path('/proc/meminfo').read_text().splitlines():
                if line.startswith('MemAvailable:'):
                    return int(line.split()[1]) * 1024
    except (OSError, ValueError, AttributeError):
        pass
    return None
