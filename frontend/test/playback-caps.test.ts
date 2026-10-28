/* 设备能力申报：只认 `supported: true`，查不到就是没有能力，同一设备只查一次。 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { playbackCaps, resetPlaybackCapsForTest } from '../src/player/capabilities';
import { playableStreamSource } from '../src/player/stream';

function stubCapabilities(supported: (contentType: string) => boolean) {
  const decodingInfo = vi.fn(async (config: { video: { contentType: string } }) => ({
    supported: supported(config.video.contentType), smooth: true, powerEfficient: false,
  }));
  Object.defineProperty(navigator, 'mediaCapabilities', { value: { decodingInfo }, configurable: true });
  return decodingInfo;
}

beforeEach(() => { resetPlaybackCapsForTest(); localStorage.clear(); });
afterEach(() => {
  Reflect.deleteProperty(navigator, 'mediaCapabilities');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('播放能力申报', () => {
  it('只收 supported 为真的编码，结果排序成稳定的串', async () => {
    stubCapabilities((type) => type.includes('hvc1.1.6') || type.includes('av01.0.08M.08'));
    expect(await playbackCaps()).toBe('av1,hevc');
  });

  it('不支持 mediaCapabilities 或查询抛错时没有能力', async () => {
    expect(await playbackCaps()).toBe('');
    resetPlaybackCapsForTest(); localStorage.clear();
    Object.defineProperty(navigator, 'mediaCapabilities', {
      value: { decodingInfo: async () => { throw new TypeError('bad config') } }, configurable: true,
    });
    expect(await playbackCaps()).toBe('');
  });

  it('同一设备只查一次：第二次读本地记忆', async () => {
    const decodingInfo = stubCapabilities(() => true);
    const first = await playbackCaps();
    const calls = decodingInfo.mock.calls.length;
    resetPlaybackCapsForTest();
    expect(await playbackCaps()).toBe(first);
    expect(decodingInfo.mock.calls.length).toBe(calls);
  });

  it('起播计划带上能力串；没有能力时地址保持原样', async () => {
    const urls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      urls.push(url);
      return new Response(JSON.stringify({ protocol: 'range', src: '/stream?id=9' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }));
    stubCapabilities((type) => type.includes('hvc1.1.6'));
    await playableStreamSource({ id: 9 }, 's');
    expect(urls[0]).toBe('/api/stream-plan?id=9&session=s&caps=hevc');
    resetPlaybackCapsForTest(); localStorage.clear();
    Reflect.deleteProperty(navigator, 'mediaCapabilities');
    await playableStreamSource({ id: 9 }, 's');
    expect(urls[1]).toBe('/api/stream-plan?id=9&session=s');
  });
});
