import { useEffect, useRef, useState } from 'react';
import { RiArrowDownSLine, RiDatabase2Line, RiGlobalLine, RiHardDrive2Line, RiListCheck2, RiRefreshLine } from '@remixicon/react';
import { Popover } from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { MENU_ITEM, MENU_ITEM_INTERACTIVE, MENU_POPOVER_SURFACE } from '@/components/base/dropdown/menu-styles';
import { cx } from '@/utils/cx';
import { checkboxHtml, formModal, iconSwitchHtml } from '@peach/legacy/ui';
import { MenuDialog } from '../components/menu-dialog';
import { busyProps } from '../settings/use-action';
import type { LibraryProcessingCommand, ProcessingSpeed, SyncStep } from './library-processing';
import { t } from '../../i18n';

export const RESOURCE_NOTICE_KEY = 'peach.library-processing.resource-notice.v1';
/** 「选择同步内容」上次的勾选，只是本机浏览器里的便利。 */
export const SYNC_CHOICE_KEY = 'peach.library-processing.sync-choice.v1';

const speeds = () => [['low', t('低占用')], ['standard', t('标准')], ['high', t('全速')]] as const;
const STEPS: readonly SyncStep[] = ['sources', 'local', 'media', 'collect'];
const stepLabel = (step: SyncStep, metadataOnly: boolean) => ({
  sources: t('扫描文件'),
  local: t('检查配套文件'),
  media: metadataOnly ? t('读取媒体属性') : t('读取媒体属性与生成预览'),
  collect: t('采集外部资料与封面'),
})[step];
/** 主按钮：只处理上次之后有变化的文件夹与影片，上次失败的项目留给「重试」或完整同步。 */
export const CHANGED_SYNC: LibraryProcessingCommand = { scope: 'changed', retry_failed: false };
export const FULL_SYNC: LibraryProcessingCommand = { scope: 'full' };

interface SyncChoice { steps: SyncStep[]; scope: 'changed' | 'full'; retry_failed: boolean }

function readChoice(): SyncChoice {
  try {
    const saved = JSON.parse(localStorage.getItem(SYNC_CHOICE_KEY) || 'null');
    if (saved && Array.isArray(saved.steps) && (saved.scope === 'changed' || saved.scope === 'full')) {
      const steps = STEPS.filter(step => saved.steps.includes(step));
      return { steps: steps.length ? steps : [...STEPS], scope: saved.scope, retry_failed: saved.retry_failed === true };
    }
  } catch { /* 存储不可用或内容损坏时用默认勾选 */ }
  return { steps: [...STEPS], scope: 'changed', retry_failed: false };
}

const speedOf = (dialog: HTMLDialogElement): ProcessingSpeed => {
  const selected = dialog.querySelector<HTMLInputElement>('input[name="processing-speed"]:checked')?.value;
  return selected === 'low' ? 'low' : selected === 'high' ? 'high' : 'standard';
};

const LEGEND = 'mb-2 text-caption-1-regular text-text-secondary';
const HINT = 'text-caption-1-regular text-text-secondary';
const ROW = 'flex items-center gap-2 text-body-2-medium';

const choiceHtml = (choice: SyncChoice, speedMode: ProcessingSpeed, metadataOnly: boolean) => {
  const steps = STEPS.map(step =>
    `<label class="${ROW}">${checkboxHtml(`name="sync-step" value="${step}"${choice.steps.includes(step) ? ' checked' : ''}`)}`
    + `<span>${stepLabel(step, metadataOnly)}</span></label>`).join('');
  return `<fieldset class="grid gap-2"><legend class="${LEGEND}">${t('步骤')}</legend>${steps}
      <p class="${HINT}">${t('采集外部资料要用配套文件里读出的番号，勾选它会一并检查配套文件。')}</p></fieldset>
    <fieldset class="grid gap-2"><legend class="${LEGEND}">${t('范围')}</legend>
      ${iconSwitchHtml('sync-scope', t('范围'), [['changed', t('只处理有变化的')], ['full', t('全部重新检查')]], choice.scope, { text: true })}
      <p class="${HINT}">${t('只处理有变化的：跳过没有变化的文件夹和处理过的影片。全部重新检查：逐个重读文件、重问外部来源，耗时较长。')}</p>
      <label class="${ROW}">${checkboxHtml(`name="retry-failed"${choice.retry_failed ? ' checked' : ''}`)}<span>${t('重试上次失败的项目')}</span></label>
    </fieldset>
    <fieldset class="grid gap-2"><legend class="${LEGEND}">${t('处理模式')}</legend>
      ${iconSwitchHtml('processing-speed', t('处理模式'), speeds(), speedMode, { text: true })}</fieldset>`;
};

/** 勾了采集就锁住配套文件；全部重新检查本来就会重试失败项。 */
function wireChoice(dialog: HTMLDialogElement) {
  const local = dialog.querySelector<HTMLInputElement>('input[name="sync-step"][value="local"]')!;
  const collect = dialog.querySelector<HTMLInputElement>('input[name="sync-step"][value="collect"]')!;
  const retry = dialog.querySelector<HTMLInputElement>('input[name="retry-failed"]')!;
  const sync = () => {
    if (collect.checked) local.checked = true;
    local.disabled = collect.checked;
    const full = dialog.querySelector<HTMLInputElement>('input[name="sync-scope"]:checked')?.value === 'full';
    if (full) retry.checked = true;
    retry.disabled = full;
  };
  dialog.querySelectorAll<HTMLInputElement>('input[name="sync-step"], input[name="sync-scope"]')
    .forEach(input => input.addEventListener('change', sync));
  sync();
}

function readSelection(dialog: HTMLDialogElement): LibraryProcessingCommand & SyncChoice {
  const steps = [...dialog.querySelectorAll<HTMLInputElement>('input[name="sync-step"]:checked')]
    .map(input => input.value as SyncStep);
  if (!steps.length) throw new Error(t('请至少勾选一个步骤'));
  const scope = dialog.querySelector<HTMLInputElement>('input[name="sync-scope"]:checked')?.value === 'full' ? 'full' : 'changed';
  const retry_failed = dialog.querySelector<HTMLInputElement>('input[name="retry-failed"]')!.checked;
  return { steps, scope, retry_failed, speed_mode: speedOf(dialog) };
}

const acknowledge = () => { try { localStorage.setItem(RESOURCE_NOTICE_KEY, 'seen') } catch { /* 本次启动照常完成 */ } };

/** 扫描和已有作品补全共用资料流水线，视频预览由媒体库设置决定。 */
export function ProcessingActions({ busy, scan = false, metadataOnly = false, speedMode = 'standard', onRun }: {
  busy: boolean; scan?: boolean; metadataOnly?: boolean; speedMode?: ProcessingSpeed;
  onRun(command: LibraryProcessingCommand): void | Promise<unknown>;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const prompt = useRef<ReturnType<typeof formModal> | null>(null);
  useEffect(() => () => prompt.current?.close(), []);
  const [open, setOpen] = useState(false);
  const primary: { label: string; icon: typeof RiDatabase2Line; command: LibraryProcessingCommand; choose?: boolean } = scan
    ? { label: t('同步媒体库'), icon: RiDatabase2Line, command: CHANGED_SYNC }
    : { label: t('同步这些影片'), icon: RiDatabase2Line, command: { stage: 'collect' } };
  const options: (typeof primary)[] = scan ? [
    { label: t('完整同步'), icon: RiRefreshLine, command: FULL_SYNC },
    { label: t('选择同步内容…'), icon: RiListCheck2, command: {}, choose: true },
  ] : [primary,
    { label: t('仅生成视频预览'), icon: RiHardDrive2Line, command: { stage: 'previews' } },
    { label: t('仅补全资料'), icon: RiGlobalLine, command: { stage: 'metadata' } },
  ];
  const choose = () => {
    const dialog = formModal({
      title: t('选择同步内容'),
      description: t('勾选这一趟要做的步骤和范围。处理会读取媒体文件，可能让电脑变慢；需要同时使用电脑时，可选择低占用模式。'),
      body: choiceHtml(readChoice(), speedMode, metadataOnly),
      confirmLabel: t('开始同步'),
      onConfirm: async () => {
        const { steps, scope, retry_failed, speed_mode } = readSelection(dialog.dialog);
        await onRun({ steps, scope, retry_failed, speed_mode });
        try { localStorage.setItem(SYNC_CHOICE_KEY, JSON.stringify({ steps, scope, retry_failed })) } catch { /* 下次用默认勾选 */ }
        acknowledge();
      },
    });
    wireChoice(dialog.dialog);
    return dialog;
  };
  const notice = (command: LibraryProcessingCommand) => {
    const previews = command.stage === 'previews';
    const title = previews ? t('生成视频预览') : command.scope === 'full' ? t('完整同步') : t('同步媒体库');
    const dialog = formModal({
      title,
      description: previews
        ? t('生成视频预览会读取视频并占用处理器，可能让电脑变慢。需要同时使用电脑时，可选择低占用模式。')
        : t('处理会读取媒体文件{value}，可能让电脑变慢。需要同时使用电脑时，可选择低占用模式。',
          { value: metadataOnly ? t('并下载资料') : t('、下载资料并生成视频预览') }),
      body: iconSwitchHtml('processing-speed', t('处理模式'), speeds(), speedMode, { text: true }),
      confirmLabel: title,
      onConfirm: async () => {
        await onRun({ ...command, speed_mode: speedOf(dialog.dialog) });
        acknowledge();
      },
    });
    return dialog;
  };
  const run = (command: LibraryProcessingCommand, chooser = false) => {
    if (busy) return;
    setOpen(false);
    let acknowledged = false;
    try { acknowledged = localStorage.getItem(RESOURCE_NOTICE_KEY) === 'seen' } catch { /* 存储不可用时保留提示 */ }
    if (!chooser && (!scan || acknowledged || command.stage === 'metadata')) {
      void Promise.resolve(onRun(command)).catch(() => { /* 错误由任务入口留在原位 */ });
      return;
    }
    if (prompt.current) return;
    const dialog = chooser ? choose() : notice(command);
    prompt.current = dialog;
    void dialog.done.then(() => { if (prompt.current === dialog) prompt.current = null });
  };
  return <>
    <span data-button-group data-split-button data-variant="primary">
      <Button leadingIcon={primary.icon} {...busyProps(busy)} onClick={() => run(primary.command)}
        title={scan ? t('只处理上次同步之后有变化的文件和影片') : undefined}>{primary.label}</Button>
      <Button ref={trigger} iconOnly leadingIcon={RiArrowDownSLine} aria-label={t('更多同步方式')}
        aria-haspopup="dialog" aria-expanded={open} {...busyProps(busy)} onClick={() => { if (!busy) setOpen(!open) }} />
    </span>
    <Popover triggerRef={trigger} isOpen={open} onOpenChange={setOpen} placement="bottom end" offset={4}
      className={MENU_POPOVER_SURFACE}>
      <MenuDialog aria-label={t('同步方式')} className="flex w-56 flex-col gap-1 outline-none">
        {options.map(({ label, icon: Icon, command, choose: chooser }) => {
          const blocked = metadataOnly && command.stage === 'previews';
          return <button key={label} type="button" disabled={blocked}
            title={blocked ? t('请先在媒体库设置中开启视频预览生成') : undefined}
            className={cx(MENU_ITEM, MENU_ITEM_INTERACTIVE, 'text-body-2-medium')}
            onClick={() => run(command, chooser)}><Icon aria-hidden className="size-4 shrink-0" />{label}</button>;
        })}
      </MenuDialog>
    </Popover>
  </>;
}
