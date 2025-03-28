import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // 指定測試目錄
  testMatch: '**/*.ts', // 匹配所有 .ts 文件作為測試
  reporter: [['html', { open: 'never' }]],
  use: {
    trace: 'on',
    screenshot: 'on', // 修改為總是截圖
    video: 'on',     // 修改為總是錄製視頻
  },
});