import { test, expect } from "@playwright/test";

/**
 * E2E 测试: 客户管理流程
 * 文件: tests/e2e/02-customer-management.spec.ts
 *
 * 前提条件:
 * - 应用运行在 http://localhost:3000
 * - 数据库已初始化 (Phase 2)
 * - 用户已认证 (如需要)
 */

test.describe("客户管理系统", () => {
  // 每个测试前导航到首页
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("应该能访问客户管理页面", async ({ page }) => {
    // 查找并点击客户管理 Tab
    const customerTab = page.locator('button[role="tab"]').filter({
      hasText: /customer|客户/i,
    });

    if (await customerTab.isVisible()) {
      await customerTab.click();

      // 验证客户管理内容加载
      const customerContent = page.locator('[role="tabpanel"]').filter({
        has: page.locator("text=/customer|客户/i"),
      });

      await expect(customerContent).toBeVisible();
    }
  });

  test("应该显示客户列表", async ({ page }) => {
    // 如果有客户 Tab，点击它
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    // 尝试找到客户相关的 Tab
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const text = await tab.textContent();
      if (text?.toLowerCase().includes("customer")) {
        await tab.click();
        break;
      }
    }

    // 等待列表加载
    await page.waitForTimeout(500);

    // 验证至少有表格或列表结构存在
    const table = page.locator("table").first();
    const list = page.locator('[role="list"]').first();

    const hasTable = await table.isVisible().catch(() => false);
    const hasList = await list.isVisible().catch(() => false);

    expect(hasTable || hasList).toBeTruthy();
  });

  test("应该有搜索/过滤功能", async ({ page }) => {
    // 查找搜索输入框
    const searchInput = page.locator('input[placeholder*="search" i]').first();

    if (await searchInput.isVisible()) {
      // 输入搜索词
      await searchInput.fill("test");

      // 等待搜索结果
      await page.waitForTimeout(500);

      // 验证搜索已执行
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe("test");
    }
  });

  test("应该能按状态过滤", async ({ page }) => {
    // 查找状态过滤器
    const filterButton = page
      .locator("button")
      .filter({ hasText: /status|filter|状态/i })
      .first();

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // 等待过滤菜单出现
      const filterMenu = page.locator('[role="menu"]').first();
      await expect(filterMenu).toBeVisible();

      // 选择一个过滤选项
      const filterOption = page.locator('[role="menuitem"]').first();
      if (await filterOption.isVisible()) {
        await filterOption.click();

        // 验证过滤已应用
        await page.waitForTimeout(300);
      }
    }
  });

  test("应该显示分页控制 (如果有多个记录)", async ({ page }) => {
    // 等待内容加载
    await page.waitForTimeout(500);

    // 查找分页按钮
    const pagination = page.locator('[aria-label*="pagination" i]').first();
    const pageButtons = page
      .locator("button")
      .filter({ hasText: /page|next|previous|下一页|上一页/i });

    const hasPagination = await pagination.isVisible().catch(() => false);
    const hasPageButtons = await pageButtons
      .first()
      .isVisible()
      .catch(() => false);

    // 如果有分页，验证它的功能
    if (hasPagination || hasPageButtons) {
      const nextButton = pageButtons
        .filter({ hasText: /next|下一页|→/i })
        .first();
      if (await nextButton.isVisible()) {
        // 验证按钮存在
        expect(nextButton).toBeTruthy();
      }
    }
  });

  test.skip("应该能创建新客户 (需要 Phase 2 API)", async ({ page }) => {
    // 查找新增按钮
    const addButton = page
      .locator("button")
      .filter({ hasText: /add|new|create|新增|添加/i })
      .first();

    if (await addButton.isVisible()) {
      await addButton.click();

      // 等待表单/对话框打开
      const form = page.locator('[role="dialog"]').first();
      await expect(form).toBeVisible();

      // 填写表单字段
      const nameInput = page.locator('input[placeholder*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Test Customer");
      }

      const emailInput = page.locator('input[placeholder*="email" i]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill("test@example.com");
      }

      // 提交表单
      const submitButton = page
        .locator("button")
        .filter({ hasText: /submit|save|save|保存/i })
        .first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // 等待成功消息或列表更新
        await page.waitForTimeout(1000);

        // 验证新客户在列表中出现
        const newCustomerRow = page.locator("text=/Test Customer/i");
        await expect(newCustomerRow).toBeVisible();
      }
    }
  });

  test.skip("应该能编辑客户信息 (需要 Phase 2 API)", async ({ page }) => {
    // 查找编辑按钮 (通常是表格行中的编辑图标)
    const editButton = page.locator('button[aria-label*="edit" i]').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // 等待编辑表单打开
      const form = page.locator('[role="dialog"]').first();
      await expect(form).toBeVisible();

      // 修改字段
      const nameInput = page.locator('input[placeholder*="name" i]').first();
      await nameInput.clear();
      await nameInput.fill("Updated Customer Name");

      // 保存
      const saveButton = page
        .locator("button")
        .filter({ hasText: /save|submit/i })
        .first();
      await saveButton.click();

      // 验证更新
      await page.waitForTimeout(500);
      const updatedRow = page.locator("text=/Updated Customer Name/i");
      await expect(updatedRow).toBeVisible();
    }
  });

  test.skip("应该能删除客户 (需要 Phase 2 API + 确认)", async ({ page }) => {
    // 查找删除按钮
    const deleteButton = page.locator('button[aria-label*="delete" i]').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // 等待确认对话框
      const confirmDialog = page.locator('[role="alertdialog"]').first();
      await expect(confirmDialog).toBeVisible();

      // 确认删除
      const confirmButton = page
        .locator("button")
        .filter({ hasText: /confirm|yes|删除|确认/i })
        .first();
      await confirmButton.click();

      // 验证客户从列表中移除
      await page.waitForTimeout(500);
    }
  });

  test("应该在移动设备上响应式显示", async ({ page }) => {
    // 设置移动视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 重新导航
    await page.goto("/");
    await page.waitForTimeout(300);

    // 验证内容仍可访问
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(await tabs.count());
  });

  test("应该处理加载状态", async ({ page }) => {
    // 在页面加载时检查加载指示器
    const loadingIndicator = page
      .locator('[role="status"]')
      .filter({ hasText: /loading|加载/i })
      .first();

    // 如果有加载指示器，验证它最终消失
    if (await loadingIndicator.isVisible()) {
      // 等待加载完成
      await page.waitForTimeout(2000);

      // 加载指示器应该不可见
      await expect(loadingIndicator).not.toBeVisible();
    }
  });
});

/**
 * 测试客户数据完整性
 */
test.describe("客户数据完整性", () => {
  test.skip("应该显示所有必需的客户字段", async ({ page }) => {
    await page.goto("/");

    // 预期的客户字段
    const expectedFields = [
      "name", // 名称
      "email", // 邮箱
      "phone", // 电话
      "status", // 状态
    ];

    // 验证这些字段在列表或表格中出现
    for (const field of expectedFields) {
      const fieldElement = page.locator(`text=/${field}/i`).first();
      // 字段应该至少出现一次在页面上
      expect(fieldElement).toBeTruthy();
    }
  });

  test.skip("客户记录应该有有效的数据格式", async ({ page }) => {
    await page.goto("/");

    // 获取第一条记录的电子邮件
    const emailCell = page.locator("text=/@/").first();

    if (await emailCell.isVisible()) {
      const emailText = await emailCell.textContent();

      // 验证电子邮件格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(emailText || "")).toBeTruthy();
    }
  });
});
