/* 找出源码里没经 `t()` 的中文字面量（字符串、模板片段、JSX 文本），注释不算。
 * 已确认是数据值的（标签名、比较键、服务端返回的状态词）记在 untranslated-baseline.txt，
 * 只报基线之外的新增。上游同步后跑一次，新出现的整行文案就是还没日语化的部分。
 *   node scripts/scan-untranslated.mjs                 报新增，有新增则退出码 1
 *   node scripts/scan-untranslated.mjs --update-baseline  把当前结果记为基线 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSync } from 'oxc-parser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = join(root, 'scripts', 'untranslated-baseline.txt');
const cjk = /[぀-ヿ一-鿿]/;

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const full = join(dir, name);
  if (statSync(full).isDirectory()) return name === 'i18n' ? [] : walk(full);
  // 译文目录与标签译名表本身就是中日对照的数据，不是漏译。
  return /\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts') && name !== 'tag-names-ja.ts' ? [full] : [];
});

const isTranslationCall = (node) => node?.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 't';

const found = [];
for (const file of walk(join(root, 'src'))) {
  const text = readFileSync(file, 'utf8');
  const { program } = parseSync(file, text);
  const rel = relative(root, file).replaceAll('\\', '/');
  const lineOf = (pos) => text.slice(0, pos).split('\n').length;
  const visit = (node, parent, grand) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const child of node) visit(child, parent, grand); return; }
    if (typeof node.type === 'string') {
      let value = null;
      if (node.type === 'Literal' && typeof node.value === 'string') value = node.value;
      else if (node.type === 'TemplateElement') value = node.value.cooked ?? node.value.raw;
      else if (node.type === 'JSXText') value = node.value;
      if (value && cjk.test(value) && !isTranslationCall(parent) && !(node.type === 'TemplateElement' && isTranslationCall(grand))) {
        found.push({ key: `${rel} | ${value.trim().replace(/\s+/g, ' ').slice(0, 80)}`, line: lineOf(node.start) });
      }
    }
    for (const key of Object.keys(node)) if (key !== 'parent') visit(node[key], node, parent);
  };
  visit(program, null, null);
}

const keys = [...new Set(found.map((item) => item.key))].sort();
if (process.argv.includes('--update-baseline')) {
  writeFileSync(baselinePath, `${keys.join('\n')}\n`, 'utf8');
  console.log(`基线已更新：${keys.length} 条`);
  process.exit(0);
}

const baseline = new Set(existsSync(baselinePath) ? readFileSync(baselinePath, 'utf8').split('\n').filter(Boolean) : []);
const fresh = found.filter((item) => !baseline.has(item.key));
for (const item of fresh) console.log(`${item.key.split(' | ')[0]}:${item.line}: ${item.key.split(' | ').slice(1).join(' | ')}`);
console.log(fresh.length ? `\n新增 ${fresh.length} 处未经 t() 的中文。整行文案请包 t() 并在 src/i18n/ja.ts 补译；数据值请 --update-baseline 记入基线。` : '没有新增的未包裹中文。');
process.exit(fresh.length ? 1 : 0);
