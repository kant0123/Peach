/* 界面语言：简体中文是源语言，日语是译文目录。
 *
 * 源码里的中文原文就是键：`t('保存配置')`。没有译文的键原样返回，所以逐处迁移时未迁移的文案照旧显示中文，
 * 不会出现空白或键名。语言存在 `peach.locale`，启动时同步读取；切换后整页重载，让所有已渲染的文案
 * 一次换完，不维护逐组件的订阅。插值用 `{名}`：`t('共 {count} 项', { count })`。 */
import { jaCatalog } from './ja';

export type Locale = 'zh-CN' | 'ja';

export const LOCALES: readonly { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ja', label: '日本語' },
];

const STORAGE_KEY = 'peach.locale';

/** 没有存过语言时的默认值。构建时用环境变量 `VITE_DEFAULT_LOCALE=ja` 打出默认日语的包，见 ADR-0114。 */
const DEFAULT_LOCALE: Locale = import.meta.env.VITE_DEFAULT_LOCALE === 'ja' ? 'ja' : 'zh-CN';

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

export function t(source: string, params?: Record<string, string | number | undefined | null>): string {
  const text = current === 'ja' ? (jaCatalog[source] ?? source) : source;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name] ?? '') : whole));
}
