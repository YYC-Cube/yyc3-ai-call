# E2E 测试指南

本目录包含使用 Playwright 编写的端到端测试。

## 📋 测试文件清单

| 文件                             | 测试场景       | 状态       | 说明                     |
| -------------------------------- | -------------- | ---------- | ------------------------ |
| `01-homepage.spec.ts`            | 首页加载和导航 | ✅ 就绪    | 基础 UI 交互和响应式设计 |
| `02-customer-management.spec.ts` | 客户管理       | 🚧 需要 DB | API 持久化依赖 Phase 2   |
| `03-analytics.spec.ts`           | 数据分析仪表板 | ✅ 就绪    | 图表和指标显示           |
| `04-smart-call-system.spec.ts`   | 智能外呼系统   | ✅ 就绪    | 通话记录和状态管理       |
| `05-api-integration.spec.ts`     | API 集成       | 🚧 需要 DB | 前端-后端数据流测试      |

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

Playwright 已在 package.json 中配置为 devDependency。

### 2. 启动应用

```bash
# 在终端 1 启动开发服务器
pnpm dev
```

应用将运行在 `http://localhost:3000`

### 3. 运行测试

```bash
# 在终端 2 运行所有 E2E 测试
pnpm exec playwright test tests/e2e/

# 或使用 npm script (如果添加了)
npm run test:e2e

# 运行特定测试文件
pnpm exec playwright test tests/e2e/01-homepage.spec.ts

# 运行特定测试用例
pnpm exec playwright test -g "应该成功加载首页"

# 以交互模式运行 (UI mode)
pnpm exec playwright test --ui

# 运行并显示 HTML 报告
pnpm exec playwright test --reporter=html
# 打开报告
pnpm exec playwright show-report
```

## 📊 测试执行模式

### 开发模式 (headed mode)

看到浏览器窗口执行测试：

```bash
pnpm exec playwright test --headed
```

### 调试模式

在每个步骤暂停，逐步执行：

```bash
pnpm exec playwright test --debug
```

### 特定浏览器

```bash
# 仅在 Chromium 上运行
pnpm exec playwright test --project=chromium

# 仅在 Firefox 上运行
pnpm exec playwright test --project=firefox

# 仅在 Safari 上运行
pnpm exec playwright test --project=webkit

# 仅在移动设备上运行
pnpm exec playwright test --project="Pixel 5"
```

## 🏗️ 项目配置

**Playwright 配置**: `playwright.config.ts`

关键配置:

- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 秒/测试
- **Retries**: 开发 0, CI 2
- **浏览器**: Chromium, Firefox, WebKit
- **设备**: Desktop, Pixel 5 (Android), iPhone 12 (iOS)
- **报告**: HTML reporter 生成报告
- **Dev Server**: 自动启动 `pnpm dev`

## 📝 编写新测试

### 基础测试模板

```typescript
import { test, expect } from "@playwright/test";

test.describe("功能名称", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("应该执行某项操作", async ({ page }) => {
    // 1. 操作 (Act)
    await page.locator("button").first().click();

    // 2. 验证 (Assert)
    await expect(page.locator("text=/success/i")).toBeVisible();
  });
});
```

### 常用 Playwright API

```typescript
// 导航
await page.goto("/");

// 定位元素
const button = page.locator("button");
const input = page.locator('input[placeholder="Search"]');
const tab = page.locator('[role="tab"]').filter({ hasText: "Customers" });

// 交互
await button.click();
await input.fill("search term");
await input.clear();
await page.keyboard.press("Enter");

// 等待
await page.waitForTimeout(1000); // 固定延迟
await page.waitForSelector("button"); // 元素出现
await expect(button).toBeVisible(); // 显式等待

// 验证
await expect(button).toBeVisible();
await expect(input).toHaveValue("text");
await expect(page).toHaveTitle("Title");
await expect(page).toHaveURL("/path");

// 页面信息
const text = await button.textContent();
const value = await input.inputValue();
const count = await button.count();

// 截图和视频
await page.screenshot({ path: "screenshot.png" });
```

## 🔍 调试技巧

### 1. 添加日志输出

```typescript
test("test with logging", async ({ page }) => {
  console.log("Page loaded");
  await page.goto("/");
  console.log("Clicked button");
  await page.locator("button").click();
});
```

### 2. 暂停执行

```typescript
test("test with pause", async ({ page }) => {
  await page.pause(); // 交互式暂停
  await page.goto("/");
});
```

### 3. 视察 DOM

```typescript
test("inspect dom", async ({ page }) => {
  const content = await page.content();
  console.log(content);
});
```

### 4. 收集控制台消息

```typescript
test("check console", async ({ page }) => {
  const messages: string[] = [];
  page.on("console", (msg) => messages.push(msg.text()));

  await page.goto("/");

  console.log("Console messages:", messages);
});
```

## 📈 CI/CD 集成

### GitHub Actions

在 `.github/workflows/` 中配置 E2E 测试:

```yaml
- name: Run E2E tests
  run: pnpm exec playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📦 依赖版本

- **Playwright**: ^1.40.0
- **@playwright/test**: ^1.40.0

查看 `package.json` 了解完整版本。

## ⚠️ 常见问题

### Q1: 测试超时

**原因**: 元素加载缓慢或网络问题

**解决方案**:

```typescript
// 增加超时
await expect(button).toBeVisible({ timeout: 10000 });

// 或手动等待
await page.waitForLoadState("networkidle");
```

### Q2: 跨域错误

**原因**: 测试服务器未运行

**解决方案**:

```bash
# 确保应用在 localhost:3000 运行
pnpm dev
```

### Q3: 元素未找到

**原因**: 定位器选择器不正确

**解决方案**:

```typescript
// 使用更明确的选择器
const button = page.locator('button[type="submit"]');

// 或过滤
const tab = page.locator('[role="tab"]').filter({ hasText: "Search" });

// 调试: 打印所有匹配元素
const elements = page.locator("button");
for (let i = 0; i < (await elements.count()); i++) {
  console.log(await elements.nth(i).textContent());
}
```

## 📚 资源

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [选择器文档](https://playwright.dev/docs/locators)

## 🔄 下一步 (Phase 2)

- [ ] 添加数据库集成测试
- [ ] 实现用户认证测试
- [ ] 添加流式 API 测试
- [ ] 配置 CI/CD 自动运行
- [ ] 添加性能基准测试
- [ ] 实现视觉回归测试

## 💡 最佳实践

1. **使用角色选择器** - 优先使用 `[role="button"]` 而不是 CSS 类
2. **避免固定延迟** - 使用显式等待而不是 `waitForTimeout`
3. **独立测试** - 每个测试应该独立运行，不依赖其他测试
4. **清晰的断言** - 使用描述性的错误消息
5. **页面对象模式** - 对复杂应用使用 POM 组织代码

```typescript
// Page Object 示例
class CustomerPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/customers");
  }

  async searchCustomer(name: string) {
    await this.page.locator('input[placeholder="Search"]').fill(name);
    await this.page.keyboard.press("Enter");
  }

  async getCustomerRow(name: string) {
    return this.page.locator(`text=${name}`).first();
  }
}

// 使用
test("search customer", async ({ page }) => {
  const customerPage = new CustomerPage(page);
  await customerPage.goto();
  await customerPage.searchCustomer("John");
  const row = await customerPage.getCustomerRow("John");
  await expect(row).toBeVisible();
});
```

---

**最后更新**: 2026-01-23  
**维护者**: YYC³ AI Call Center Team
