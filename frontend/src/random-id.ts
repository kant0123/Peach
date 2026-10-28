/* 随机标识。
 *
 * `crypto.randomUUID` 只在安全上下文里存在：局域网里用 `http://192.168.x.x:8900` 打开 Peach 时它是
 * `undefined`，直接调用会抛 TypeError。`getRandomValues` 在非安全上下文里照常可用，所以退一步用它拼
 * 一个 v4 形态的串；两者都没有时才用时间与 `Math.random`，标识只用于区分同一页面里的几个实例。 */

export function randomId(): string {
  const source = globalThis.crypto;
  if (typeof source?.randomUUID === 'function') return source.randomUUID();
  if (typeof source?.getRandomValues === 'function') {
    const bytes = source.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
