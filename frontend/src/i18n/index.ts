/* 界面语言：简体中文是源语言，日语是译文目录。
 *
 * 源码里的中文原文就是键：`t('保存配置')`。没有译文的键原样返回，所以逐处迁移时未迁移的文案照旧显示中文，
 * 不会出现空白或键名。语言存在 `peach.locale`，启动时同步读取；切换后整页重载，让所有已渲染的文案
 * 一次换完，不维护逐组件的订阅。插值用 `{名}`：`t('共 {count} 项', { count })`。 */
import { jaCatalog } from './ja';
import { jaServerCatalog } from './ja-server';

export type Locale = 'zh-CN' | 'ja';

export const LOCALES: readonly { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ja', label: '日本語' },
];

const STORAGE_KEY = 'peach.locale';

/** 没有存过语言时的默认值。构建时用环境变量 `VITE_DEFAULT_LOCALE=ja` 打出默认日语的包，见 ADR-0130。 */
const DEFAULT_LOCALE: Locale = import.meta.env?.VITE_DEFAULT_LOCALE === 'ja' ? 'ja' : 'zh-CN';

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ja' || stored === 'zh-CN') return stored;
  } catch {
    /* 存储被禁用时走默认语言。 */
  }
  return DEFAULT_LOCALE;
}

let current: Locale = readLocale();

export function locale(): Locale {
  return current;
}

/** 写入语言并重载页面。 */
export function setLocale(next: Locale): void {
  if (next === current) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    return;
  }
  current = next;
  location.reload();
}

export function applyDocumentLanguage(): void {
  document.documentElement.lang = current;
}

const serverTemplates = Object.entries(jaServerCatalog).filter(([key]) => /\{\w+\}/.test(key)).map(([key, text]) => {
  const names: string[] = [];
  const pattern = key.split(/(\{\w+\})/).map((part) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    if (!name) return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    names.push(name);
    return '([\\s\\S]+?)';
  }).join('');
  return { pattern: new RegExp(`^${pattern}$`), names, text };
});

function localizeServerText(source: string): string {
  const exact = jaServerCatalog[source];
  if (exact !== undefined) return exact;
  for (const { pattern, names, text } of serverTemplates) {
    const match = pattern.exec(source);
    // 取到的可变部分若本身是已收录的整句（「尚无」之类）也换成译文，路径与名称保持原样。
    if (match) return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
      const part = match[names.indexOf(name) + 1];
      return part === undefined ? whole : (jaServerCatalog[part] ?? part);
    });
  }
  // 「A、B、C」「A · B」「标题：内容」这样用分隔符串起来的句子：逐段换，至少有一段换成译文才算命中。
  for (const separator of ['、', ' · ', '：']) {
    if (!source.includes(separator)) continue;
    const parts = source.split(separator);
    const translated = parts.map(localizeServerText);
    if (translated.some((part, index) => part !== parts[index])) return translated.join(separator);
  }
  return source;
}

/** 把接口返回里服务端生成的中文换成日语：整句命中 `jaServerCatalog` 才换，路径、网址等数据原样保留。 */
export function localizeServer<T>(value: T): T {
  if (current !== 'ja') return value;
  if (typeof value === 'string') return localizeServerText(value) as T;
  if (Array.isArray(value)) return value.map((item) => localizeServer(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeServer(item)])) as T;
  }
  return value;
}

/** `web/index.html` 里直接写死的提示与标题：日语界面下启动时按整句换成译文，属性与标题文字都处理。 */
export function localizeStaticShell(root: ParentNode = document): void {
  if (current !== 'ja') return;
  const known = (text: string) => jaCatalog[text] ?? localizeServerText(text);
  for (const element of root.querySelectorAll('[title], [aria-label], [placeholder]')) {
    for (const attribute of ['title', 'aria-label', 'placeholder']) {
      const value = element.getAttribute(attribute);
      if (value && /[一-鿿]/.test(value)) element.setAttribute(attribute, known(value));
    }
  }
  const heading = root.querySelector('[data-page-title]');
  if (heading?.textContent) heading.textContent = known(heading.textContent.trim());
}

export function t(source: string, params?: Record<string, string | number | undefined | null>): string {
  const text = current === 'ja' ? (jaCatalog[source] ?? source) : source;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name] ?? '') : whole));
}
