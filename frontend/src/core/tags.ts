import { locale, t } from '../i18n';
import { JA_TAG_NAMES, JA_TAG_PREFIXES } from './tag-names-ja';
/* 标签显示名：纯查表，无 DOM 或请求，Application 与 React 页面共用本模块。
 * 映射只影响显示名，不做同义词归并；数据库标签名仍是真相，查不到时原样返回。 */
const TAG_DISPLAY_NAMES:Record<string,string>={'1080P':'1080p','60fps':'60FPS','AI去码':t('AI解码'),
  '眼镜':t('眼镜娘'),'情趣内衣':t('性感内衣'),
  '口罩遮脸':t('口罩'),'强制剧情':t('强制'),'骑乘':t('骑乘位'),
  '后入':t('背后位'),'3P多人':'3P','双洞齐插':t('双洞齐下'),'毒龙':t('毒龙钻')};
/** 标签键到界面上的名称；表里没有就原样返回。日语界面再查 `JA_TAG_NAMES`，带前缀的（`演员:名字`）只换前缀。 */
const tagLabel=(tag:string)=>{
  const named=TAG_DISPLAY_NAMES[tag];
  if(named)return named;
  if(locale()!=='ja')return tag;
  const plain=JA_TAG_NAMES[tag];
  if(plain)return plain;
  const colon=tag.search(/[:：]/);
  const prefix=colon>0?JA_TAG_PREFIXES[tag.slice(0,colon)]:undefined;
  return prefix?`${prefix}${tag.slice(colon)}`:tag;
};

export {TAG_DISPLAY_NAMES, tagLabel};
