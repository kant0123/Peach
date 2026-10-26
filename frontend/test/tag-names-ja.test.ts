/* 日语界面里标签只在显示时换名：带前缀的只换前缀，库里的原名不动。 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function load(locale: 'ja' | 'zh-CN') {
  vi.resetModules();
  localStorage.setItem('peach.locale', locale);
  return import('../src/core/tags');
}

describe('tagLabel', () => {
  beforeEach(() => localStorage.clear());

  it('日语界面换成日语名，没有译名的原样显示', async () => {
    const { tagLabel } = await load('ja');
    expect(tagLabel('中出内射')).toBe('中出し');
    expect(tagLabel('演员:新井リマ')).toBe('出演者:新井リマ');
    expect(tagLabel('没有登记的标签')).toBe('没有登记的标签');
  });

  it('简体中文界面不变', async () => {
    const { tagLabel } = await load('zh-CN');
    expect(tagLabel('中出内射')).toBe('中出内射');
    expect(tagLabel('演员:新井リマ')).toBe('演员:新井リマ');
  });
});
