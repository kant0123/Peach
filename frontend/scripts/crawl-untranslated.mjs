/* 在日语界面下逐页巡回，找出画面上仍是简体中文的文字（正文、title、aria-label、placeholder、alt）。
 *
 * 源码检查（scan-untranslated.mjs）只看前端源码里的字符串；服务端返回的文案、web/index.html 里写死的
 * 提示、拼出来的句子它看不到。这里直接看渲染结果：
 *   A 级 含简体中文独有的字（设、库、页……），日语里不会出现，一律是漏译；
 *   B 级 只有汉字、没有假名的字符串，可能是日语里也通用的词，也可能是漏译，需要人看一眼。
 * 服务、数据库与 Chrome 由 tests/test_web_i18n_crawl.py 准备，经环境变量传进来；
 * 路径取自 e2e/smoke.test.ts 的 ROUTES，另外切每一个页签、打开设置面板。
 * 结果写到 PEACH_CRAWL_OUT（JSON），退出码恒为 0：是否失败由调用方对照基线判断。 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const origin = process.env.PEACH_E2E_ORIGIN;
const chrome = process.env.PEACH_E2E_CHROME;
const out = process.env.PEACH_CRAWL_OUT;
if (!origin || !chrome || !out) throw new Error('缺少 PEACH_E2E_ORIGIN / PEACH_E2E_CHROME / PEACH_CRAWL_OUT');

const here = dirname(fileURLToPath(import.meta.url));
const smoke = readFileSync(join(here, '..', 'e2e', 'smoke.test.ts'), 'utf8');
const paths = [...new Set([...smoke.matchAll(/path: '(\/[^']*)'/g)].map((match) => match[1]))];
for (const extra of ['/configuration', '/data', '/activity', '/review', '/taste', '/duplicates']) {
  if (!paths.includes(extra)) paths.push(extra);
}

/* 简体中文里常用、日语常用汉字里写法不同的字。出现任何一个就判定为中文。 */
const SIMPLIFIED = '设库务开关页图签览载续选项态时间显认证种类实现统计码账号输错误应该这么从为对与进过还让运动数据组织频后连录标题发产则级确读写网络环节处理个们说话没样头见点长门问东车书买卖语听电话师虽边针铁钱银锁镜队阳阴阶陈随难离顺须顾预领颜风飞饭馆饮驾验马骑鱼鸟麦黄齐龙龟总编缓缩继绩给经结终细织绍统继维综线练组绝续约红纪级纯纸纳纷绑绘绝络缺罗习兴举义乐买乱争于亏云亚产亲亿仅从仓仪们价众优伙会伟传伤伦伪侠侣侦侧侨俭债倾偿储兑党兰关兴养兽内冈册写军农冲决况冻净凉减凑凤击凿划刘则刚创删别剑剧办务动励劲劳势勋区医华协单卖卢卫却厂厅历压厌厕县参双发变叙叠叶号叹向吗启吴员呐呕响哑响啸嘱团园围图圆圣场坏块坚坛坝坞坟坠垄垒垫埘堑墙壮声壳处备复够头夹夺奋奖妆妇妈姗娄娱孙学宁宝实宠审宪宫宽宾对寻导寿将尔尘尝层属岁岛岭币帅师帐带帮干并广庄庆库应庙废开异弃张弹强归当录彦彻征径态总惊惯愿懒戏战户扑执扩扫扬扰抚报担拟择挂挡挣捡换损据掷摄摆摇摊撑敌数斋斗斩无时旷昙显晋晓晕暂术机杀杂权条来杨极构枪柜标树样档桥梦检楼欢欧毕毙气汇汉污汤沟没沥沦济浅测浓涂涛润涨淀渊温湾湿满滞滤滨滚潜澜灯灵灾灿炉点炼烁烂烟烦烧热爱爷牵犹状独狭猎猪献玛现琐电画畅畴疗疯痒发盖盘眯着矫矿码础硕确碍礼祸离种积称税稳穷窃窍竞笔笼筑筛筝签简类粮紧级纤纬纲纳纵纷纸线练组细织终经绑绒结绕绘给络绝统继续绩绪维综缓编缘缩缴网罗罚职联聪肃肠肤肿胀胜胡脉脏脑脚脱腊腾舰艰艺节芦苏苍苹范茧荐荒荣药莱获营萧萨蓝蔑薮蚀蛮补装裤览观规视览触订计认讨让训议讯记讲许论设访证评识诈诉诊词译试诗诚话诞询该详语误说请诸诺读课谁调谈谊谋谓谜谢谨谱貌贝贞负贡财责贤败账货质贩贪购贯贱贴贵贷贸费贺贼赁资赋赌赏赔赖赚赛赞赠赢赵趋跃践踪车轧轨轩转轮软轰轻载较辅辆辈输辑辞边辽达迁过迈运还进远违连迟适选递逻遗邓邮邻郑酱释针钓钙钞钟钢钥钦钱钻铁铃铜铭银铺链销锁锅锐错锡锦键锻镇镜长门闪闭问闯闲间闷闹闻阅阔队阳阴阵阶际陆陈险随隐难雏雾霉静页顶项顺须顽顾顿颁颂预领颗题额颜额风飘饥饭饮饰饱饼馆驳驴驶驻驾骂骄验骑骗惊鱼鲁鲜鸟鸡鸭鸿鹅鹰麦黄点齐齿龄龙';
/* 上面有不少字日语里同形（数、学、会、区……）。译文目录的日语一侧出现过的汉字一律视为日语用字，从集合里剔除。 */
const japaneseHan = new Set();
for (const catalog of ['ja.ts', 'ja-server.ts']) {
  for (const line of readFileSync(join(here, '..', 'src', 'i18n', catalog), 'utf8').split('\n')) {
    const cut = line.lastIndexOf("': '");
    if (cut < 0) continue;
    for (const char of line.slice(cut + 4)) if (/[一-鿿]/.test(char)) japaneseHan.add(char);
  }
}
const simplified = new Set([...SIMPLIFIED].filter((char) => !japaneseHan.has(char)));
const kana = /[぀-ヿ]/;
const han = /[一-鿿]/;

const collect = () => {
  const found = [];
  const add = (kind, text) => {
    const value = (text || '').replace(/\s+/g, ' ').trim();
    if (value && /[一-鿿]/.test(value)) found.push({ kind, text: value.slice(0, 160) });
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script,style,noscript,[data-i18n-ignore]')) continue;
    add('text', node.nodeValue);
  }
  for (const element of document.querySelectorAll('[title],[aria-label],[placeholder],[alt]')) {
    for (const attribute of ['title', 'aria-label', 'placeholder', 'alt']) add(attribute, element.getAttribute(attribute));
  }
  add('document.title', document.title);
  return found;
};

const classify = (text) => {
  if ([...text].some((char) => simplified.has(char))) return 'A';
  if (han.test(text) && !kana.test(text)) return 'B';
  return null;
};

const browser = await chromium.launch({ headless: true, executablePath: chrome, timeout: 60_000 });
const seen = new Map();
const record = (route, items) => {
  for (const { kind, text } of items) {
    const tier = classify(text);
    if (!tier) continue;
    const key = `${tier}\t${text}`;
    const entry = seen.get(key) ?? { tier, text, kinds: new Set(), routes: new Set() };
    entry.kinds.add(kind);
    entry.routes.add(route);
    seen.set(key, entry);
  }
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => { try { localStorage.setItem('peach.locale', 'ja'); } catch { /* 存储被禁用时走默认语言 */ } });
  const queue = [...paths];
  const worker = async () => {
   for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
    console.error(`巡回 ${path}`);
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    /* 一页最多 60 秒：页面卡住时关掉它，挂起的调用随之抛错，不拖住整轮巡回。 */
    const guard = setTimeout(() => { page.close().catch(() => {}); }, 60_000);
    try {
      await page.goto(`${origin}${path}`, { waitUntil: 'load', timeout: 20_000 });
      await page.waitForTimeout(1200);
      record(path, await page.evaluate(collect));
      if (path === '/') {
        await page.locator('#settingsBtn').click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(800);
        record('/ (設定パネル)', await page.evaluate(collect));
      }
      const tabs = page.getByRole('tab');
      const count = Math.min(await tabs.count(), 10);
      for (let index = 0; index < count; index += 1) {
        const tab = tabs.nth(index);
        if (!(await tab.isVisible().catch(() => false))) continue;
        await tab.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(350);
        record(`${path} [tab ${index + 1}]`, await page.evaluate(collect));
      }
    } catch (error) {
      record(path, [{ kind: 'crawl-error', text: `巡回失败: ${String(error).slice(0, 80)}` }]);
    } finally {
      clearTimeout(guard);
      await page.close().catch(() => {});
      console.error(`完了 ${path}`);
    }
   }
  };
  await Promise.all([worker(), worker(), worker()]);
} finally {
  /* 結果を書き出すまでブラウザの終了は待たない。閉じる処理が固まっても報告は残る。 */
}

const rows = [...seen.values()].map((entry) => ({
  tier: entry.tier, text: entry.text, kinds: [...entry.kinds], routes: [...entry.routes].slice(0, 4),
})).sort((a, b) => a.tier.localeCompare(b.tier) || a.text.localeCompare(b.text));
writeFileSync(out, JSON.stringify({ paths, rows }, null, 1), 'utf8');
console.log(`巡回 ${paths.length} 路径：A ${rows.filter((row) => row.tier === 'A').length} 件、B ${rows.filter((row) => row.tier === 'B').length} 件 → ${out}`);
await Promise.race([browser.close().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 10_000))]);
process.exit(0);
