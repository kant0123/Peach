import { t } from '../i18n';
export const PREFERENCE_SECTIONS = {
  appearance: t('外观与导航'), playback: t('浏览与播放'), jav: t('JAV 与新作'), search: t('搜索与推荐'), content: t('内容显示'),
} as const;
export const CONFIGURATION_SECTIONS = {
  library: t('媒体库与入库'), subscriptions: t('来源与订阅'), downloads: t('下载渠道'), network: t('网络与访问'), maintenance: t('应用与维护'),
  diagnostics: t('系统诊断'),
} as const;
export type ConfigurationPath = `/settings/${keyof typeof CONFIGURATION_SECTIONS}`;
export function configurationSection(path: string): string {
  return CONFIGURATION_SECTIONS[path.split('/')[2] as keyof typeof CONFIGURATION_SECTIONS] || CONFIGURATION_SECTIONS.library;
}
export const PREFERENCE_PATHS = ['/settings', ...Object.keys(PREFERENCE_SECTIONS).map(key => `/settings/${key}`)];
export const isPreferencePath = (path: string): boolean => PREFERENCE_PATHS.includes(path);
export function preferenceSection(path: string): string {
  return PREFERENCE_SECTIONS[path.split('/')[2] as keyof typeof PREFERENCE_SECTIONS] || PREFERENCE_SECTIONS.appearance;
}
export function settingsPath(title: string): string {
  const key = Object.entries({ ...PREFERENCE_SECTIONS, ...CONFIGURATION_SECTIONS }).find(([, value]) => value === title)?.[0];
  return `/settings/${key || 'appearance'}`;
}
export interface SettingsBackground {
  pathname: string; search: string; state: unknown; seq: number;
}
export const settingsBackgroundOf = (state: unknown): SettingsBackground | null => {
  const background = (state as { settingsBackground?: SettingsBackground } | null)?.settingsBackground;
  return background && typeof background.pathname === 'string' ? background : null;
};
