import { test, expect } from "@playwright/test";

/**
 * 示例 E2E 测试: 验证首页加载和基本导航
 * 文件: tests/e2e/01-homepage.spec.ts
 * 执行: pnpm exec playwright test tests/e2e/01-homepage.spec.ts
 */

test.describe("首页和基本导航", () => {
  test("应该成功加载首页", async ({ page }) => {
    // 导航到首页
    await page.goto("/");

    // 验证页面标题
    await expect(page).toHaveTitle(/YYC³ AI/);

    // 验证主要元素可见
    const headerLogo = page.locator('img[alt="YYC³ AI"]').first();
    await expect(headerLogo).toBeVisible();
  });

  test("应该显示所有主要 Tab 导航", async ({ page }) => {
    await page.goto("/");

    // 等待 Tab 列表加载
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // 验证关键 Tab 存在
    const expectedTabs = [
      "overview",
      "smart-call",
      "profile",
      "analytics",
      "marketing",
      "customers",
    ];

    for (const tab of expectedTabs) {
      const tabButton = page.locator(`[role="tab"]:has-text("${tab}")`).first();
      // Tab 应该存在于 DOM 中
      await expect(tabButton).toHaveCount(1);
    }
  });

  test("应该能切换 Tab 导航", async ({ page }) => {
    await page.goto("/");

    // 点击第一个 Tab
    const smartCallTab = page.locator('[role="tab"]').nth(1);
    await smartCallTab.click();

    // 验证 Tab 被选中
    await expect(smartCallTab).toHaveAttribute("data-state", "active");
  });

  test("顶部通知按钮应该可以点击", async ({ page }) => {
    await page.goto("/");

    // 找到通知按钮 (🔔)
    const notificationButton = page.locator('button:has-text("🔔")').first();
    await expect(notificationButton).toBeVisible();

    // 点击打开通知面板
    await notificationButton.click();

    // 验证通知面板/对话框出现
    const notificationPanel = page.locator('[role="dialog"]').first();
    await expect(notificationPanel).toBeVisible();
  });

  test("暗黑模式切换应该工作", async ({ page }) => {
    await page.goto("/");

    // 找到暗黑模式切换按钮
    const darkModeSwitch = page.locator('button:has-text("🌙")').first();
    await expect(darkModeSwitch).toBeVisible();

    // 获取初始 HTML class
    const htmlBefore = await page.locator("html").getAttribute("class");

    // 点击切换
    await darkModeSwitch.click();

    // 等待过渡动画
    await page.waitForTimeout(300);

    // 验证 class 已更改
    const htmlAfter = await page.locator("html").getAttribute("class");
    // 至少应该有某种视觉变化 (dark class added/removed)
    expect(htmlBefore !== htmlAfter).toBeTruthy();
  });

  test("响应式设计 - 移动视口", async ({ page }) => {
    // 设置移动视口
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // 验证移动菜单按钮可见
    const mobileMenuButton = page.locator('button:has-text("☰")').first();
    await expect(mobileMenuButton).toBeVisible();

    // 点击打开移动菜单
    await mobileMenuButton.click();

    // 验证菜单打开
    await expect(mobileMenuButton).toHaveAttribute("data-state", "open");
  });

  test("页面应该无控制台错误", async ({ page, context }) => {
    // 收集控制台消息
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on("console", (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    await page.goto("/");

    // 过滤掉警告，只检查错误
    const errors = consoleMessages.filter((m) => m.type === "error");

    // 应该没有 JavaScript 错误
    expect(errors).toHaveLength(0);
  });
});

/**
 * 场景测试: 客户管理流程
 * 预计需要数据库集成后添加更多测试
 */
test.describe("客户管理流程 (集成测试)", () => {
  test.skip("应该能创建新客户", async ({ page }) => {
    // TODO: Phase 2 实现
    // 此测试依赖数据库集成和 API 持久化
    // 步骤:
    // 1. 导航到客户管理页
    // 2. 点击新增客户
    // 3. 填写表单
    // 4. 提交
    // 5. 验证客户在列表中出现
    // 6. 查询数据库验证持久化
  });

  test.skip("应该能搜索客户", async ({ page }) => {
    // TODO: Phase 2 实现
  });

  test.skip("应该能编辑客户信息", async ({ page }) => {
    // TODO: Phase 2 实现
  });
});

/**
 * 场景测试: 外呼系统
 */
test.describe("智能外呼系统", () => {
  test("应该能导航到外呼系统", async ({ page }) => {
    await page.goto("/");

    // 找到 Smart Call System tab
    const smartCallTab = page.locator('[role="tab"]').nth(1);
    await smartCallTab.click();

    // 验证相关内容加载 (通话记录或开始录音按钮)
    const content = page.locator('[role="tabpanel"]').nth(1);
    await expect(content).toBeVisible();
  });

  test.skip("应该能开始和停止录音", async ({ page }) => {
    // TODO: Phase 2 实现
    // 需要模拟音频操作或 Mock 音频 API
  });
});
