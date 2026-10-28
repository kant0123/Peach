/* 处理方式与媒体库分组的说明。设置页与它的首屏骨架用同一份文字，骨架里的折行和真实页面一致。 */
import { t } from '../../i18n';

/** 分组上方常显的一句：三档处理方式差在哪，细节收在对比表里。 */
export const POLICY_SUMMARY = t('每个媒体库都先读本地 NFO 和同目录图片；处理方式只决定要不要联网补全。');

/** 三档对比表：每行一个步骤，三列依次是自动补全、仅使用本地资料、自定义。 */
export const POLICY_COLUMNS = [t('自动补全'), t('仅使用本地资料'), t('自定义')] as const;
export const POLICY_MATRIX: readonly (readonly [step: string, auto: string, local: string, custom: string])[] = [
  [t('读本地 NFO 和图片'), '✓', '✓', '✓'],
  [t('读取视频信息、生成九宫格'), '✓', '✓', t('可选')],
  [t('联网补资料'), '✓', '—', t('可选')],
  [t('联网补封面'), '✓', '—', t('可选')],
  [t('联网补人物图片'), '✓', '—', t('可选')],
];
export const POLICY_COVER_NOTE = t('本地只有竖版海报时：自动补全会联网找完整封套（FC2 商品图除外），仅使用本地资料直接用竖版。');

/** 两颗添加键下面的一句：文件夹归媒体库，什么时候该加文件夹、什么时候该加媒体库。 */
export const LIBRARY_FOLDER_HELP = t('一个媒体库可以有多个文件夹，作品合在一起显示，共用名称、颜色和处理方式；要分开显示或分开设置时再添加媒体库。');
