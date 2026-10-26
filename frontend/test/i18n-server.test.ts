/* 服务端生成的中文在日语界面里按整句换成译文，数据值原样保留。 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function load(locale: 'ja' | 'zh-CN') {
  vi.resetModules();
  localStorage.setItem('peach.locale', locale);
  return import('../src/i18n');
}

describe('localizeServer', () => {
  beforeEach(() => localStorage.clear());

  it('整句命中就换成日语，嵌套的对象与数组一并处理', async () => {
    const { localizeServer } = await load('ja');
    expect(localizeServer({ label: '媒体库', help: ['端口'], default: 'C:\\Users\\x', n: 1 }))
      .toEqual({ label: 'メディアライブラリ', help: ['ポート'], default: 'C:\\Users\\x', n: 1 });
  });

  it('带占位符的句子把可变部分填回译文', async () => {
    const { localizeServer } = await load('ja');
    expect(localizeServer('未检测到 WinFsp。')).toBe('WinFsp が見つかりません。');
    expect(localizeServer('目录不存在，或者不是目录：D:\\media。先建好再填。'))
      .toBe('フォルダーが存在しないか、ディレクトリではありません: D:\\media。先に作成してから入力してください。');
  });

  it('模板里取到的可变部分本身有译文时一并换掉，顿号串起来的名称列表逐项换', async () => {
    const { localizeServer } = await load('ja');
    expect(localizeServer('当前值：尚无；1 个匹配资产；2 个资料来源'))
      .toBe('現在の値: なし／一致する資産 1 件／情報源 2 件');
    expect(localizeServer('FC2Club、片商官网、Prestige')).toBe('FC2Club、メーカー公式サイト、Prestige');
    expect(localizeServer('Prestige、FALENO')).toBe('Prestige、FALENO');
  });

  it('任务登记表的名字、带分隔符的句子逐段换成译文', async () => {
    const { localizeServer } = await load('ja');
    expect(localizeServer('订阅源拉取')).toBe('購読フィードの取得');
    expect(localizeServer('扫描与采集：处理中')).toBe('スキャンと収集：处理中');
    expect(localizeServer('409 项需要处理，可重试未完成的部分。')).toBe('409 件の処理が必要です。未完了の部分は再試行できます。');
    expect(localizeServer('追更检查 · 手动')).toBe('新作チェック · 手動');
  });

  it('实体分类名与常见的接口错误换成译文', async () => {
    const { localizeServer } = await load('ja');
    expect(localizeServer({ label: '女优' })).toEqual({ label: '女優' });
    expect(localizeServer('请在运行 Peach 的电脑上打开配置')).toBe('Peach を実行しているパソコンで設定を開いてください');
    expect(localizeServer('配置保存失败：磁盘已满')).toBe('設定を保存できませんでした: 磁盘已满');
  });

  it('没有译文的句子原样返回', async () => {
    const { localizeServer } = await load('ja');
    expect(localizeServer('没有收录的句子')).toBe('没有收录的句子');
  });

  it('简体中文界面不改动任何内容', async () => {
    const { localizeServer } = await load('zh-CN');
    expect(localizeServer({ label: '媒体库' })).toEqual({ label: '媒体库' });
  });
});

describe('localizeStaticShell', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<button title="设置" aria-label="打开设置"></button><input placeholder="搜索馆藏"><h2 data-page-title>首页</h2>';
  });

  it('日语界面把页面骨架里写死的属性与标题换成译文', async () => {
    const { localizeStaticShell } = await load('ja');
    localizeStaticShell();
    const button = document.querySelector('button')!;
    expect(button.getAttribute('title')).toBe('設定');
    expect(button.getAttribute('aria-label')).toBe('設定を開く');
    expect(document.querySelector('input')!.getAttribute('placeholder')).toBe('ライブラリを検索');
    expect(document.querySelector('[data-page-title]')!.textContent).toBe('ホーム');
  });

  it('简体中文界面保持原样', async () => {
    const { localizeStaticShell } = await load('zh-CN');
    localizeStaticShell();
    expect(document.querySelector('button')!.getAttribute('title')).toBe('设置');
  });
});
