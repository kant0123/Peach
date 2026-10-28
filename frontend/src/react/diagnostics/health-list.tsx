import { useState } from 'react';
import { RiFileListLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { LinkButton } from '@/components/base/buttons/link-button';
import { fmtDur, fmtSize, LOC } from '@peach/legacy/core';
import { DataTable, type DataColumn } from '../components/data-table';
import { EmptyState } from '../components/empty-state';
import { Note } from '../components/note';
import { Disclosure, Stack } from '../settings/section';
import { busyProps, useAction } from '../settings/use-action';
import type { LibraryGroup, LibraryItem } from './diagnostics';
import { t } from '../../i18n';

const identity = (item: LibraryItem) => item.title || item.name || item.code || t('作品 #{id}', { id: item.id });
const listText = (items: LibraryItem[]) => [
  [t('作品'), t('番号'), t('文件名'), t('媒体库'), t('路径'), t('时长（秒）'), t('大小（字节）')],
  ...items.map(item => [identity(item), item.code ?? '', item.name, LOC[item.location] || item.location,
    item.path, item.duration ?? '', item.size ?? '']),
].map(row => row.map(value => String(value ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');

export function HealthList({ group, openItem, receipt }: {
  group: LibraryGroup; openItem(id: number): void; receipt(message: string): void;
}) {
  const action = useAction();
  const [selected, setSelected] = useState<string[]>([]);
  const copy = (items: LibraryItem[]) => void action.run('copy',
    () => navigator.clipboard.writeText(listText(items)), () => receipt(t('已复制清单')));
  const columns: DataColumn<LibraryItem>[] = [
    { id: 'title', label: t('作品'), value: identity, render: item => <span className="flex min-w-0 flex-col gap-1">
      <LinkButton variant="primary" className="justify-start whitespace-normal text-left"
        onClick={() => openItem(item.id)}>{identity(item)}</LinkButton>
      {item.name && item.name !== identity(item)
        ? <span data-middle-truncate title={item.name} className="block min-w-0 text-caption-1-regular text-text-secondary">{item.name}</span> : null}
    </span> },
    { id: 'code', label: t('番号'), width: 144, value: item => item.code || '',
      render: item => <span className="whitespace-nowrap">{item.code || t('未识别')}</span> },
    { id: 'location', label: t('媒体库'), width: 128, value: item => LOC[item.location] || item.location,
      render: item => LOC[item.location] || item.location || t('未取得') },
    { id: 'path', label: t('文件路径'), width: 320, min: 180, value: item => item.path,
      render: item => <span data-middle-truncate title={item.path}
        className="block min-w-0 w-full text-body-2-regular text-text-secondary">{item.path || t('未取得')}</span> },
    { id: 'duration', label: t('时长'), width: 112, value: item => item.duration ?? 0,
      render: item => item.duration && item.duration > 0 ? fmtDur(item.duration) : t('未取得') },
    { id: 'size', label: t('大小'), width: 112, value: item => item.size ?? 0,
      render: item => item.size !== null ? fmtSize(item.size) : t('未取得') },
  ];
  return <Disclosure summary={`${group.label} · ${group.count === null ? t('未取得') : t('{value} 项', { value: group.count.toLocaleString() })}`}>
    {group.count === null ? <Note tone="neutral">{t('清单未取得，请重新检查。')}</Note> : !group.items.length
      ? <EmptyState icon={RiFileListLine} title={t('清单为空')} size="compact">{t('没有需要处理的作品。')}</EmptyState>
      : <Stack>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {group.truncated ? <span className="text-body-2-regular text-text-secondary">
            {t('已载入 {loaded} / {total} 项', { loaded: group.items.length.toLocaleString(), total: group.count.toLocaleString() })}
          </span> : null}
          <Button size="small" variant="secondary" {...busyProps(action.busy === 'copy')}
            onClick={() => copy(group.items)}>{t('复制当前清单')}</Button>
        </div>
        {action.error ? <Note tone="error">{action.error}</Note> : null}
        <DataTable label={group.label} title={t('作品清单')} unit={t('部作品')} panel={false}
          items={group.items} columns={columns} rowId={item => String(item.id)} rowLabel={identity}
          selected={selected} onSelected={setSelected}
          actions={items => <Button size="small" variant="secondary" {...busyProps(action.busy === 'copy')}
            onClick={() => copy(items)}>{t('复制所选')}</Button>} />
      </Stack>}
  </Disclosure>;
}
