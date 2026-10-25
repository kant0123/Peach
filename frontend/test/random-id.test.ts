/* 随机标识：安全上下文用 randomUUID，局域网 http（非安全上下文）里它是 undefined，退到 getRandomValues。 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { randomId } from '../src/random-id';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => { vi.unstubAllGlobals(); });

describe('randomId', () => {
  it('有 randomUUID 就直接用它', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'fixed-uuid' });
    expect(randomId()).toBe('fixed-uuid');
  });

  it('没有 randomUUID（非安全上下文）时用 getRandomValues 拼 v4 形态，且每次不同', () => {
    vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => fillBytes(bytes) });
    const first = randomId();
    expect(first).toMatch(UUID_V4);
    expect(randomId()).not.toBe(first);
  });

  it('什么随机接口都没有时仍给出非空标识', () => {
    vi.stubGlobal('crypto', undefined);
    expect(randomId()).not.toBe('');
  });
});

let counter = 0;
/** 每次填不同的字节，足够区分两次调用。 */
function fillBytes(bytes: Uint8Array): Uint8Array {
  counter += 1;
  bytes.forEach((_, index) => { bytes[index] = (index * 31 + counter * 17) & 0xff; });
  return bytes;
}
