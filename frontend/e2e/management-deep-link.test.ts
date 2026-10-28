/* 管理区深链打开时，页面只等自己首屏要的那几份：实体形状名单与垃圾评分是大库上要算好几秒的聚合，
 * 两样都压着不回，数据管理页也要画出来、能点。 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, visit, VIEWPORTS } from './harness.ts';

describe('管理区深链不等慢聚合', () => {
  let browser: Browser;
  before(async () => { browser = await launch(); });
  after(async () => { await browser?.close(); });
  it('实体形状与垃圾评分都还在算时，数据管理页照样画出并能点', { timeout: 60_000 }, async () => {
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve });
    const opened = await visit(browser, '/data-cleanup', VIEWPORTS[0]!, async page => {
      await page.route(/\/api\/(entity\/shapes|ads)(\?|$)/, async route => { await held; await route.continue().catch(() => {}) });
    });
    try {
      const ads = opened.page.locator('[data-cleanup-go="ads"]');
      await ads.waitFor({ timeout: 15_000 });
      assert.equal(await opened.page.locator('#stats [data-skeleton]').count(), 0);
      assert.ok(await opened.page.locator('[data-cleanup-go="trash"]').isEnabled());
    } finally {
      release();
      await opened.close();
    }
  });
});
