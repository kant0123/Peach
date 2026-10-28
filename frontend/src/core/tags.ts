import { locale } from '../i18n';
import { JA_TAG_NAMES, JA_TAG_PREFIXES } from './tag-names-ja';

/** 标签显示沿用服务端当前名称；Application 与 React 页面共用。日语界面再查 `JA_TAG_NAMES`，带前缀的（`演员:名字`）只换前缀。 */
export const tagLabel = (tag: string) => {
  if (locale() !== 'ja') return tag;
  const plain = JA_TAG_NAMES[tag];
  if (plain) return plain;
  const colon = tag.search(/[:：]/);
  const prefix = colon > 0 ? JA_TAG_PREFIXES[tag.slice(0, colon)] : undefined;
  return prefix ? `${prefix}${tag.slice(colon)}` : tag;
};
