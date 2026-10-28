/* 媒体库图标：触发键显示当前字形，点开是一块七列网格的单选面板，按「应用」才提交。
 *
 * 注册表里没有网格单选的弹出面板，用 React Aria 的 `Popover`、`Dialog`、`RadioGroup` 组合，
 * 面板外观取 BoardUI `menu-styles.ts`。取值是雪碧图里的字形名，服务端按
 * `peach.media_libraries.LIBRARY_ICONS` 校验。 */
import { useRef, useState } from 'react';
import { Dialog, Heading, Popover, Radio, RadioGroup } from 'react-aria-components';
import { MEDIA_SOURCE_ICONS } from '@peach/legacy/ui';

import { Button } from '@/components/base/buttons/button';
import { MENU_POPOVER_SURFACE } from '@/components/base/dropdown/menu-styles';

import { SourceMark } from './section';
import { t } from '../../i18n';

/* 一行七枚、六行排完。第一枚是「不另选」：网盘库自动用网盘标识，本地路径没有可识别的
   来源，就是默认那枚磁盘。其余按题材成组：身体与情欲、身份与装扮、场景与情境、媒介与归档。 */
export const LIBRARY_ICON_CHOICES = [
  ['', t('自动识别')], ['hard-drive', t('磁盘')], ['database', t('资料库')], ['heart', t('心动')], ['heart-hand', t('亲密')], ['flame', t('热情')], ['cherry', t('樱桃')],
  ['lollipop', t('甜心')], ['candy', t('糖果')], ['banana', t('香蕉')], ['droplets', t('湿润')], ['venus', t('女性')], ['mars', t('男性')], ['venus-and-mars', t('情侣')],
  ['gem', t('精选')], ['crown', t('女王')], ['ribbon', t('丝带')], ['shirt', t('制服')], ['graduation-cap', t('学生')], ['stethoscope', t('护士')], ['glasses', t('眼镜')],
  ['footprints', t('足迹')], ['hand', t('手部')], ['flower', t('花朵')], ['venetian-mask', t('角色扮演')], ['rabbit', t('兔女郎')], ['paw-print', t('兽耳')], ['dumbbell', t('健身')],
  ['bed-double', t('卧室')], ['bath', t('浴室')], ['key-round', t('私密')], ['wine', t('微醺')], ['cigarette', t('烟')], ['moon', t('夜色')], ['sparkles', t('幻想')],
  ['camera', t('写真')], ['video', t('影片')], ['film', t('电影')], ['image', t('图集')], ['gamepad-2', t('游戏')], ['star', t('收藏')], ['tags', t('主题')],
] as const;

/** 不另选时的字形与说法：网盘库跟着来源走（115、PikPak 的站标），本地路径没有什么可识别，就是默认磁盘。 */
export function libraryAutoChoice(kind: string): [string, string] {
  const mark = kind !== 'local' ? MEDIA_SOURCE_ICONS[kind] : '';
  return mark ? [mark, t('自动识别')] : ['hard-drive', t('默认')];
}

/** 「不另选」在单选组里的取值。存下来是空串，而空串做单选值时 React Aria 当作没有选中。 */
const AUTO = 'auto';

export function LibraryIconPicker({ value, label, kind = 'local', onChange }: {
  value: string; label: string; kind?: string; onChange(value: string): void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [autoMark, autoLabel] = libraryAutoChoice(kind);
  const nameOf = (key: string) => (key && LIBRARY_ICON_CHOICES.find(([choice]) => choice === key)?.[1]) || autoLabel;

  return (
    <>
      <Button ref={trigger} variant="secondary" className="self-start" aria-label={label} aria-haspopup="dialog"
        aria-expanded={open} onClick={() => { setDraft(value); setOpen(true); }}>
        <span data-icon-choice className="flex items-center gap-2"><SourceMark mark={value || autoMark} />{nameOf(value)}</span>
      </Button>
      <Popover triggerRef={trigger} isOpen={open} onOpenChange={setOpen} placement="bottom start" offset={4}
        className={MENU_POPOVER_SURFACE}>
        <Dialog aria-label={t('{label}可选图标', { label })} className="flex w-72 flex-col gap-3 outline-none">
          <Heading slot="title" className="px-1 text-body-medium text-text-primary">{t('选择媒体库图标')}</Heading>
          {/* 格子里只放图标，名字走 aria-label：带着字的话 42 个候选要排十几行。 */}
          <RadioGroup aria-label={t('可选图标')} value={draft || AUTO} onChange={(next) => setDraft(next === AUTO ? '' : next)}
            className="inline-grid grid-cols-7 gap-1">
            {LIBRARY_ICON_CHOICES.map(([key, name]) => (
              <Radio key={key || AUTO} value={key || AUTO} aria-label={key ? name : autoLabel}
                className="flex h-10 cursor-pointer items-center justify-center rounded-lg text-foreground-icon-secondary outline-none hover:bg-dropdown-item-hover-background focus-visible:ring-2 focus-visible:ring-border-focus-ring data-selected:bg-dropdown-item-hover-background data-selected:text-text-primary">
                <SourceMark mark={key || autoMark} />
              </Radio>
            ))}
          </RadioGroup>
          <div className="flex justify-end gap-2 border-t border-separator-border pt-2.5">
            <Button variant="secondary" onClick={() => setOpen(false)}>{t('取消')}</Button>
            <Button disabled={draft === value} onClick={() => { onChange(draft); setOpen(false); }}>{t('应用')}</Button>
          </div>
        </Dialog>
      </Popover>
    </>
  );
}
