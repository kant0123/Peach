# ADR-0114：界面多语言

- 状态：已采纳
- 日期：2026-10-22
- 相关：ADR-0031

## 决策

界面文案支持简体中文与日语。简体中文是源语言，源码里的中文原文就是键：`t('保存配置')`。日语译文集中在 `frontend/src/i18n/ja.ts`，没有译文的键原样显示中文，所以文案可以按页面逐处迁移，未迁移的部分不会空白。

语言存在浏览器的 `peach.locale`，默认简体中文，在「应用与维护」的「界面语言」里切换。切换后整页重载，让已渲染的文案一次换完，不为每个组件维护订阅。插值用 `{名}`，例如 `t('共 {count} 项', { count })`。

服务端返回的文案、公开文档、技能与安装器仍以中文为准，不在本决策范围内；需要时另立 ADR。新增界面文案必须经 `t()`，并在 `ja.ts` 补齐译文。

## 日语安装包

默认语言在构建时由 `VITE_DEFAULT_LOCALE` 决定：设为 `ja` 的前端包在没有存过语言时以日语启动，未设置则仍是简体中文。仓库里提交的 `web/dist` 一律是简体中文默认，日语包只在构建时产生。

上游有更新时，在 Windows 上运行 `scripts/build_ja_installer.ps1 -Sync`：

1. 合并 `origin/master`。只有 `web/dist` 冲突时按合并后的源码重新构建；源码冲突则停下，手工解决后不带 `-Sync` 再运行。
2. 运行类型检查、`i18n-catalog` 测试和 `npm run check:untranslated`。后者找出没经 `t()` 的新中文，数据值（标签名、比较键）记在 `frontend/scripts/untranslated-baseline.txt`，确认后用 `node scripts/scan-untranslated.mjs --update-baseline` 更新。
3. 缺少媒体工具时从上游最新发布取 FFmpeg、untrunc、cloudflared 的制品，哈希由 `build_windows.ps1` 校验。
4. 以 `VITE_DEFAULT_LOCALE=ja` 调 `build_windows.ps1 -Installer`，产物为 `dist/ja/Peach-<版本>-ja-windows-x64-setup.exe`，随后还原 `web/dist`。

构建机需要 Node 24、64 位 Python 3.14 与 uv、Inno Setup 6（`winget install JRSoftware.InnoSetup`）。不监视上游：有需要时手动运行。本分支的安装器（`scripts/installer/peach.iss`）整体改为日语：向导文字用官方 `Japanese.isl`，自定义文案同为日语，不再保留简体中文。上游改动 `peach.iss` 时，合并后要把新增文案译成日语。

## 不向上游推送

本分支是日语化的本地派生，不向上游推送，也不推送任何 master。两层拦截：`scripts/githooks/pre-push` 拒绝推往 `peach-mitao/`、名为 `origin`／`upstream` 的远端，以及任何远端的 `refs/heads/master`（`tests/test_pre_push_hook.py` 守住）；`--no-verify` 能绕过钩子，所以本机另把 `origin` 的推送地址换成不可用的占位值（`git remote set-url --push origin DISABLED-no-push-to-upstream`，只改本机的 `.git/config`，拉取不受影响）。`release_tag.py --ship` 的推送因此也会被拒，这个派生不发版。需要推送时由人手动处理。
