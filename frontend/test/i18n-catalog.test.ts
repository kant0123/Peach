// @vitest-environment node
/* 日语译文目录与源码里的 t() 调用一一对应：缺译会显示中文，多余的译文说明键已经改名或删除。 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { jaCatalog } from '../src/i18n/ja';

const root = fileURLToPath(new URL('../src', import.meta.url));

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.(ts|tsx|js)$/.test(entry.name) && !entry.name.endsWith('.d.ts') && !path.includes(join('src', 'i18n')) ? [path] : [];
  });
}

const used = new Set<string>();
for (const file of sources(root)) {
  for (const match of readFileSync(file, 'utf8').matchAll(/(?<![\w.$])t\('((?:[^'\\\n]|\\.)*)'/g)) {
    used.add((match[1] ?? '').replace(/\\'/g, "'"));
  }
}

describe('日语译文目录', () => {
  it('覆盖源码里每一个 t() 键', () => {
    expect([...used].filter((key) => !(key in jaCatalog)).sort()).toEqual([]);
  });

  it('不留源码已经不用的译文', () => {
    expect(Object.keys(jaCatalog).filter((key) => !used.has(key)).sort()).toEqual([]);
  });
});
