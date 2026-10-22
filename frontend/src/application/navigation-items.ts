import { t } from '../i18n';
/** 应用导航的完整词表；默认可见顺序由 sidebar 的持久偏好决定。 */
export type SidebarKey = '' | 'performers' | 'studios' | 'tags' | 'jav' | 'flagged' | 'playlists'
  | 'follow' | 'immerse' | 'manage' | 'stats' | 'taste' | 'review' | 'data-cleanup' | 'trash'
  | 'follow-manage' | 'quality' | 'activity';
export type ManagementKey = 'stats' | 'taste' | 'review' | 'cleanup' | 'trash' | 'follow'
  | 'quality' | 'activity' | 'configuration';
export type NavigationItem<Key extends string = string> = readonly [key: Key, label: string, glyph: string];

export const SIDEBAR_ITEMS = [
  ['', t('首页'), 'home'],
  ['performers', t('艺人'), 'user-round'],
  ['studios', t('厂牌'), 'clapperboard'],
  ['tags', t('标签'), 'tags'],
  ['jav', 'JAV', 'jav'],
  ['flagged', t('已标记'), 'bookmark'],
  ['playlists', t('播放列表'), 'playlist'],
  ['follow', t('关注'), 'rss'],
  ['immerse', t('沉浸模式'), 'gallery-vertical-end'],
  ['manage', t('管理'), 'wrench'],
] as const satisfies readonly NavigationItem<SidebarKey>[];

export const MANAGE_SECTIONS = [
  ['stats', t('统计'), 'chart'],
  ['taste', t('口味'), 'heart'],
  ['review', t('人工复核'), 'square-check-big'],
  ['cleanup', t('数据管理'), 'hard-drive'],
  ['trash', t('回收站'), 'trash'],
  ['follow', t('关注管理'), 'rss'],
  ['quality', t('高清版'), 'sparkles'],
  ['activity', t('任务中心'), 'history'],
  ['configuration', t('Peach 配置'), 'folder-cog'],
] as const satisfies readonly NavigationItem<ManagementKey>[];

export const MANAGE_MENU_SECTIONS: readonly ManagementKey[] = ['stats', 'taste', 'cleanup', 'follow', 'activity', 'configuration'];
export const getManageMenuSections = (configurable: boolean): readonly NavigationItem<ManagementKey>[] =>
  MANAGE_SECTIONS.filter(([key]) => MANAGE_MENU_SECTIONS.includes(key) && (key !== 'configuration' || configurable));

export const OPTIONAL_SIDEBAR_ITEMS: readonly NavigationItem<SidebarKey>[] = MANAGE_SECTIONS
  .flatMap(([key, label, glyph]): NavigationItem<SidebarKey>[] => key === 'configuration' ? []
    : [[key === 'follow' ? 'follow-manage' : key === 'cleanup' ? 'data-cleanup' : key, label, glyph]]);
export const NAV_CATALOG: readonly NavigationItem<SidebarKey>[] = [...SIDEBAR_ITEMS, ...OPTIONAL_SIDEBAR_ITEMS];
export const DIRECT_MANAGE_NAV: Readonly<Partial<Record<SidebarKey, ManagementKey>>> = {
  stats: 'stats', review: 'review', 'data-cleanup': 'cleanup', trash: 'trash',
  'follow-manage': 'follow', quality: 'quality', activity: 'activity',
};
