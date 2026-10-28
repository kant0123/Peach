/* 本机端口与已保存媒体配置使用同一份修订号。 */
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { LinkButton } from '@/components/base/buttons/link-button';
import { ApiError, apiSend, errorMessage } from '../../api';
import { CONFIGURATION_URL } from '../../configuration-endpoints';
import type { ConfigurationGroupProps } from '../bundle';
import { Note } from '../components/note';
import { ConfigurationChoice, ConfigurationInput } from '../components/configuration-fields';
import { RESTART_REDIRECT_MS } from '../restart-redirect';
import { ErrorText, Footer, Help, Section, Stack } from './section';
import { busyProps, useAction } from './use-action';
import { t } from '../../i18n';

const HOST_OPTIONS = [
  { value: '0.0.0.0', label: t('同一局域网的设备') },
  { value: '127.0.0.1', label: t('只有这台电脑') },
];

export function PortSettings({ data, receipt }: ConfigurationGroupProps) {
  const network = data.network;
  const editable = network ? network.editable : data.editable && data.port_editable !== false;
  const [host, setHost] = useState(network?.host ?? '127.0.0.1');
  const [name, setName] = useState(network?.mdns_name ?? 'peach');
  const [port, setPort] = useState(String(data.port));
  const [fields, setFields] = useState<Partial<Record<'port' | 'host' | 'mdns_name', string>>>({});
  const [saved, setSaved] = useState<{ url: string } | null>(null);
  const action = useAction();
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => location.assign(saved.url), RESTART_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [saved]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFields({});
    void action.run('save', (signal) => apiSend<{ url: string }>(CONFIGURATION_URL, {
      revision: data.revision, media_dirs: data.media_dirs,
      ...(data.media_sources ? { media_sources: data.media_sources } : {}),
      port, scan_now: false,
      ...(network?.editable ? { host, ...(host === '0.0.0.0' ? { mdns_name: name } : {}) } : {}),
    }, 'POST', signal), (result) => {
      setSaved({ url: new URL('/settings/network', result.url).href }); receipt(t('已保存配置'));
    }, (cause) => {
      const fields = cause instanceof ApiError && cause.status === 400
        ? (cause.body as { errors?: Partial<Record<'port' | 'host' | 'mdns_name', string>> } | null)?.errors : null;
      if (fields && (fields.port || fields.host || fields.mdns_name)) setFields(fields);
      else action.setError(errorMessage(cause));
    });
  };
  if (saved) return <Section title={t('访问地址')}><Stack>
    <Note tone="success" title={t('配置已保存')}>{t('Peach 正在重新启动。')}
      <LinkButton href={saved.url} size="small">{t('返回网络与访问')}</LinkButton>
    </Note>
  </Stack></Section>;
  return <Section title={t('访问地址')} onSubmit={editable ? submit : undefined}><Stack>
    {network ? <>
      <Address label={t('本机地址')} value={network.local_url} receipt={receipt} />
      {network.lan_url || network.ip_url ? <>
        <Address label={t('手机连接地址')} value={network.lan_url || network.ip_url} receipt={receipt} />
        {network.lan_url && network.ip_url ? <Address label={t('备用 IP 地址')} value={network.ip_url} receipt={receipt} /> : null}
        <Help>{t('手机与电脑连接同一 Wi-Fi。')}{network.ip_url && network.lan_url ? t('名称地址打不开时，可尝试备用 IP 地址。') : ''}</Help>
      </> : <Help>{network.scope === 'local'
        ? t('当前只允许这台电脑访问，手机无法连接。')
        : t('局域网连接地址未取得，请检查电脑的网络连接和服务启动配置。')}</Help>}
    </> : null}
    {editable ? <>
      {network?.editable ? <>
        <ConfigurationChoice id="configHost" label={t('谁可以访问')} value={host} onChange={setHost} options={HOST_OPTIONS}
          isDisabled={Boolean(action.busy)} isInvalid={Boolean(fields.host)}>
          {fields.host ? <ErrorText>{fields.host}</ErrorText> : null}
        </ConfigurationChoice>
        {host === '0.0.0.0' ? <ConfigurationInput id="configMdnsName" label={t('局域网访问地址')} value={name} onChange={setName}
          prefix={network.local_url.startsWith('https:') ? 'https://' : 'http://'} suffix=".local"
          autoComplete="off" spellCheck="false" maxLength={63} isDisabled={Boolean(action.busy)} validationBehavior="aria"
          isInvalid={Boolean(fields.mdns_name)} hint={fields.mdns_name || undefined} /> : null}
      </> : null}
      <ConfigurationInput id="configPort" label={t('端口')} prefix="localhost:" inputMode="numeric" value={port} onChange={setPort}
        isDisabled={Boolean(action.busy)} validationBehavior="aria" isInvalid={Boolean(fields.port)} hint={fields.port} />
    </> : <Help>{data.notice || t('访问范围、名称与端口由服务启动配置管理。')}</Help>}
    {network?.editable && host === '0.0.0.0' && network.scope === 'local'
      ? <Help>{t('保存并重启后显示手机连接地址。可在下方设置访问密码。')}</Help> : null}
    {action.error ? <Note tone="error" title={t('没有保存')}>{action.error}</Note> : null}
  </Stack>{editable ? <Footer status={t('保存后 Peach 会重启，并跳转到新地址。')}>
    <Button type="submit" {...busyProps(action.busy === 'save')}>{t('保存配置')}</Button>
  </Footer> : null}</Section>;
}

function Address({ label, value, receipt }: { label: string; value: string; receipt(message: string): void }) {
  const action = useAction();
  return <div className="flex min-w-0 flex-col gap-2">
    <div className="flex min-w-0 flex-wrap items-end gap-2">
      <Input className="min-w-0 flex-1" label={label} value={value} isReadOnly autoComplete="off" />
      <Button variant="secondary" aria-label={t('复制{label}', { label })} onClick={() => void action.run('copy', () => navigator.clipboard.writeText(value),
        () => receipt(t('已复制地址')))}>{t('复制地址')}</Button>
    </div>
    {action.error ? <Help role="status">{t('复制失败，请选中地址复制。')}</Help> : null}
  </div>;
}
