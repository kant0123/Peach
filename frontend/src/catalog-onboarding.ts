import { emptyStateHtml } from '@peach/legacy/ui';
import { t } from './i18n';
import { esc } from '@peach/legacy/core';

type Request = (url: string) => Promise<any>;
const FILTERS = ['loc', 'creator', 'performer', 'studio', 'series', 'agency', 'tag', 'tag_match', 'len', 'dur_min', 'dur_max', 'orient', 'region', 'year', 'state', 'jav', 'thumb'];

/** 清除馆藏条件，保留当前页面、视图与本地或在线范围。 */
export function clearCatalogAddress(address = typeof location === 'undefined' ? '/' : location.href): string {
  const url = new URL(address, 'http://localhost');
  for (const key of [...FILTERS, 'q', 'category', 'cat']) url.searchParams.delete(key);
  url.searchParams.set('thumb', '0');
  return url.pathname + (url.search ? url.search : '') + url.hash;
}

/** 推荐与当前列表共用筛选，并以实际搜索命中作为展示条件。 */
export async function catalogSuggestions(state: Record<string, string>, request: Request): Promise<string[]> {
  const params = new URLSearchParams();
  for (const key of FILTERS) if (state[key]) params.set(key, state[key]);
  const [facets, sample] = await Promise.all([
    request('/api/facets?' + params), request('/api/items?' + params + '&limit=5'),
  ]);
  const candidates: string[] = [...new Set<string>([
    ...(facets.creators || []), ...(facets.tagperformers || []), ...(facets.tags || []),
  ].map(row => String(row.k || '')).concat((sample.items || []).map((row: { code?: string; name?: string }) => row.code || row.name || '')))]
    .filter(value => value.length > 1).slice(0, 10);
  const hits = await Promise.all(candidates.map(async value => {
    const query = new URLSearchParams(params); query.set('q', value); query.set('limit', '1');
    const result = await request('/api/items?' + query);
    return result.total > 0 ? value : '';
  }));
  return hits.filter(Boolean);
}

/** 空馆藏、筛选无结果与资料尚未建立分别给出可执行入口。 */
export function catalogEmptyHtml({ kind = 'catalog', filtered = false, jav = false, configurable: _configurable = false, online = false } = {}): string {
  const add = ('<a class="geist-button primary" href="/settings/library">' + t('添加媒体') + '</a>');
  const follow = '<a class="geist-button' + (online ? ' primary' : '') + ('" href="/subscriptions?tab=add">' + t('添加关注') + '</a>');
  if (filtered || jav) return emptyStateHtml('search', jav ? t('还没有符合条件的 JAV 作品') : t('没有符合条件的内容'),
    jav ? t('已扫描但尚未补充发行资料的视频可在全部内容中查看。') : t('清除筛选或搜索条件后查看全部内容。'),
    { actions: jav
      ? ('<a class="geist-button primary" href="/?loc=&thumb=0">' + t('查看全部内容') + '</a><a class="geist-button" href="/data-cleanup#libraryProcessing">' + t('补全影片资料') + '</a>')
      : `<a class="geist-button primary" href="${filtered ? esc(clearCatalogAddress()) : '/?loc=&thumb=0'}">${filtered ? t('清除筛选') : t('查看全部内容')}</a>` });
  if (kind !== 'catalog') {
    const labels: Record<string, string> = { tags: t('标签'), performers: t('艺人'), creators: t('卖家'), studios: t('厂牌'), agencies: t('事务所'), series: t('系列') };
    // 在线那一档数的是来源上的东西，名字也跟着来源的说法：艺人页在线摆的是关注来源里的创作者。
    const onlineLabels: Record<string, string> = { tags: t('标签'), performers: t('创作者') };
    const label = (online ? onlineLabels[kind] : '') || labels[kind] || t('资料');
    return emptyStateHtml(kind === 'tags' ? 'tags' : 'user-round', t('还没有{label}', { label }),
      online ? t('添加关注来源并获取内容后，这里会显示来源上的{label}。', { label }) : t('添加内容并补充资料后，这里会显示对应信息。'),
      { actions: online ? follow : add + follow });
  }
  return emptyStateHtml('play', t('还没有视频'), t('添加媒体目录或关注来源，开始建立你的馆藏。'), { actions: add + follow });
}
