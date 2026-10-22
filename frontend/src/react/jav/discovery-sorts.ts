import { JAV_RELEASE_SORT } from '../../sort-preferences';
import { t } from '../../i18n';

export const DISCOVERY_SORTS = [
  ['taste', t('口味'), t('按口味匹配排序')],
  ['release_date', JAV_RELEASE_SORT[1], t('按发行日期排序')],
  ['source_score', t('来源评分'), t('按来源评分排序')],
  ['duration', t('时长'), t('按时长排序')],
  ['code', t('番号'), t('按番号排序')],
] as const;
export type DiscoverySort = typeof DISCOVERY_SORTS[number][0];
export type DiscoveryDirection = 'asc' | 'desc';

export function discoveryScore(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(3) : '—';
}

/** 口味相关度使用固定百分制；未知读数保留空值。 */
export function recommendationScore(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { score: '—', label: t('资料未取得'), color: 'neutral' as const };
  const score = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const tier = score >= 75 ? { label: t('强烈推荐'), color: 'lime' as const }
    : score >= 50 ? { label: t('推荐'), color: 'blue' as const }
    : score >= 25 ? { label: t('值得看看'), color: 'yellow' as const }
    : { label: t('探索'), color: 'neutral' as const };
  return { score: String(score), ...tier };
}
