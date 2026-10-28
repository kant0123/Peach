/* 这台设备能直接解哪些编码。
 *
 * 结论随 `/api/stream-plan` 一起交给服务端（`caps=hevc,av1`），服务端据此决定直读、
 * 只换容器还是整片重编码。判据只认 `supported: true`：Chrome 没有 HEVC 软件解码，
 * 不支持时不会报错而是黑屏，宁可让服务端转码。查不到就是没有能力，行为与不申报相同。 */

type Probe = { token: string; contentType: string };

const VIDEO_PROBES: Probe[] = [
  { token: 'h264-10', contentType: 'video/mp4; codecs="avc1.6e0028"' },
  { token: 'hevc', contentType: 'video/mp4; codecs="hvc1.1.6.L120.B0"' },
  { token: 'hevc-10', contentType: 'video/mp4; codecs="hvc1.2.4.L120.B0"' },
  { token: 'av1', contentType: 'video/mp4; codecs="av01.0.08M.08"' },
  { token: 'av1-10', contentType: 'video/mp4; codecs="av01.0.08M.10"' },
  { token: 'vp9', contentType: 'video/mp4; codecs="vp09.00.40.08"' },
  { token: 'vp9-10', contentType: 'video/mp4; codecs="vp09.02.40.10"' },
];

/* 音频没有解码代价上的坑，`canPlayType` 够用。 */
const AUDIO_PROBES: Probe[] = [
  { token: 'ac3', contentType: 'audio/mp4; codecs="ac-3"' },
  { token: 'eac3', contentType: 'audio/mp4; codecs="ec-3"' },
  { token: 'opus', contentType: 'audio/mp4; codecs="opus"' },
  { token: 'flac', contentType: 'audio/mp4; codecs="flac"' },
];

/* `hev1` 标签的 HEVC 只有 Chromium 系放行，WebKit 只认 `hvc1`。 */
const HEV1_TYPE = 'video/mp4; codecs="hev1.1.6.L120.B0"';
const STORAGE_KEY = 'peach.playback-caps.v1';

let pending: Promise<string> | null = null;

function remembered(): string | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { ua?: string; caps?: string } | null;
    return stored && stored.ua === navigator.userAgent && typeof stored.caps === 'string' ? stored.caps : null;
  } catch { return null }
}

function remember(caps: string): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ua: navigator.userAgent, caps })) } catch { /* 存不下就下次再查 */ }
}

async function detect(): Promise<string> {
  const found: string[] = [];
  const mediaCapabilities = (navigator as Navigator & { mediaCapabilities?: MediaCapabilities }).mediaCapabilities;
  if (mediaCapabilities?.decodingInfo) {
    await Promise.all(VIDEO_PROBES.map(async ({ token, contentType }) => {
      try {
        const info = await mediaCapabilities.decodingInfo({
          type: 'file',
          video: { contentType, width: 1920, height: 1080, bitrate: 8_000_000, framerate: 30 },
        });
        if (info.supported) found.push(token);
      } catch { /* 这个编码查不出来就当不支持 */ }
    }));
  }
  const video = document.createElement('video');
  if (video.canPlayType) {
    for (const { token, contentType } of AUDIO_PROBES) if (video.canPlayType(contentType)) found.push(token);
    if (found.includes('hevc') && video.canPlayType(HEV1_TYPE)) found.push('hev1');
  }
  return found.sort().join(',');
}

/** 端能力串，如 `av1,hevc`；查不到返回空串。同一设备只查一次。 */
export function playbackCaps(): Promise<string> {
  if (pending) return pending;
  const stored = remembered();
  pending = stored !== null ? Promise.resolve(stored) : detect().then((caps) => { remember(caps); return caps }).catch(() => '');
  return pending;
}

/** 测试用：丢掉进程内缓存。 */
export function resetPlaybackCapsForTest(): void { pending = null }
