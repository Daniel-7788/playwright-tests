import { test, expect, chromium } from '@playwright/test';

// 啟用 trace 錄製
test.use({ trace: 'on' });

test.setTimeout(60000);

test('訊息發送流程測試', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://feature.aitago.tw/login');
  await page.waitForSelector('input[type="email"]');
  await page.waitForSelector('input[type="password"]');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'thiSizB1ev');
  await page.click('button:has-text("登入")');

  await page.waitForURL('**/line-oa/dashboard/performance');
  await page.waitForSelector('a[href*="message"]');
  await page.click('a[href*="message"]');

  await page.waitForSelector('button:has-text("新增卡片")');
  await page.click('button:has-text("新增卡片")');

  await page.fill('input[placeholder="請輸入活動名稱"]', '測試活動');
  await page.click('input[type="radio"]:nth-of-type(1)');
  await page.click('button:has-text("樣式")');
  await page.click('div[role="option"] >> text=樣式A');
  await page.fill('textarea[placeholder="請輸入預覽文字"]', '這是測試用的預覽文字');

  await page.click('button:has-text("發送")');
  await page.waitForSelector('text=發送成功', { timeout: 10000 });

  await browser.close();
});
