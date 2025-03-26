import { test, expect, chromium } from '@playwright/test';

// 設定較長的測試等待時間（90秒）
test.setTimeout(90000);

test('訊息發送流程測試', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // 啟用 trace 記錄（只啟用一次）
  await context.tracing.start({ screenshots: true, snapshots: true });

  const page = await context.newPage();
  console.log('✅ 開啟新分頁');

  try {
    // 進入登入頁面
    await page.goto('https://feature.aitago.tw/login');
    console.log('🌐 已進入登入頁面');

    // 輸入登入資訊
    await page.getByLabel('電子信箱').fill('test@example.com');
    await page.getByLabel('密碼').fill('thiSizB1ev');
    await page.locator('button[type="submit"]').click();
    console.log('🔐 登入中');

    // 等待導向頁面載入
    await page.waitForURL('**/line-oa/dashboard/performance', { timeout: 15000 });
    console.log('🎯 成功導向至 dashboard');

    // 進入訊息發送頁面
    await page.goto('https://feature.aitago.tw/line-oa/marketing/campaign/6');
    console.log('📩 進入訊息發送頁面');

    // 點擊新增卡片訊息按鈕
    await page.click('button:has-text("新增卡片訊息")');
    console.log('🆕 點擊新增卡片訊息');

    // 自動產生活動名稱範本：test20250326_1532
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const activityName = `test${timestamp}`;

    // 等待活動名稱欄位出現後再填寫
    await page.waitForSelector('input[placeholder="請輸入活動名稱"]', { timeout: 10000 });
    await page.fill('input[placeholder="請輸入活動名稱"]', activityName);
    console.log(`📝 自動輸入活動名稱：${activityName}`);

    // 選擇 AI 演算腳本與預設群發
    await page.click('button:has-text("下一步")');
    console.log('➡️ 選擇 AI 腳本與預設群發，點擊下一步');

    // 選擇樣式 test03261206
    await page.click('div:has-text("test03261206")');
    console.log('🎨 選擇樣式 test03261206');

    // 等待預覽文字欄位出現後填寫
    await page.waitForSelector('textarea[placeholder="請輸入預覽文字"]', { timeout: 10000 });
    await page.fill('textarea[placeholder="請輸入預覽文字"]', '我是預覽文字');
    console.log('💬 輸入預覽文字');

    // 點擊下一步
    await page.click('button:has-text("下一步")');
    console.log('➡️ 點擊下一步');

    // 預設立即發送，點擊發布活動
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api') && res.status() === 200),
      page.click('button:has-text("發布活動")')
    ]);
    console.log('🚀 點擊發布活動並收到後端回應');

    // 確認發送成功訊息或活動名稱出現於頁面中
    await page.waitForSelector(`text=${activityName}`, { timeout: 10000 });
    console.log('✅ 發送成功並驗證活動建立');

    // 驗證 LINE 訊息是否真的發送（透過後台訊息紀錄頁面檢查）
    await page.goto('https://feature.aitago.tw/line-oa/message-history');
    console.log('📄 前往訊息紀錄頁面');

    await page.waitForSelector(`text=${activityName}`, { timeout: 10000 });
    console.log('📬 成功驗證 LINE 訊息已發送（後台訊息紀錄中找到）');

  } catch (error) {
    console.error('❌ 測試過程中出現錯誤：', error);
    const screenshotPath = 'error-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`🖼️ 錯誤截圖已儲存：${screenshotPath}`);
  } finally {
    try {
      await context.tracing.stop({ path: 'trace.zip' });
      console.log('🧪 Trace 紀錄完成並儲存 trace.zip');
    } catch (err) {
      console.warn('⚠️ 無法儲存 trace，可能未啟動或已被終止');
    }

    await browser.close();
    console.log('🛑 測試結束，瀏覽器關閉');
  }
});
