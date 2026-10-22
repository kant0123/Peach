import { StatusDot } from '@/components/base/badges/status-dot';
import { cx } from '@/utils/cx';
import { t } from '../../i18n';
import './connection-status.css';

/** 连接状态使用圆点；任务结果和配置状态使用 Chip。 */
export function ConnectionStatus({ online }: { online: boolean | undefined }) {
  return <span data-mount={online === true ? 'online' : online === false ? 'offline' : 'unknown'}
    className={cx('inline-flex items-center gap-1.5 whitespace-nowrap text-body-2-medium',
      online === true ? 'text-notification-success-foreground' : online === false ? 'text-text-error-primary' : 'text-text-secondary')}>
    <StatusDot color={online === undefined ? 'indigo' : 'green'} />
    {online === true ? t('在线') : online === false ? t('离线') : t('未检测')}
  </span>;
}
