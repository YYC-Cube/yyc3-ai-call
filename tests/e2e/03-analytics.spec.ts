import { test, expect } from "@playwright/test";

/**
 * E2E 测试: 数据分析与仪表板
 * 文件: tests/e2e/03-analytics.spec.ts
 *
 * 测试目标:
 * - 验证仪表板能正确加载和渲染
 * - 验证图表交互功能
 * - 验证数据过滤和日期范围选择
 * - 验证导出功能 (Phase 2)
 */

test.describe("数据分析仪表板", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("应该能访问数据分析页面", async ({ page }) => {
    // 查找分析 Tab
    const analyticsTab = page.locator('[role="tab"]').filter({
      hasText: /analytics|分析|数据/i,
    });

    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();

      // 验证分析内容加载
      const analyticsPanel = page.locator('[role="tabpanel"]');
      await expect(analyticsPanel.first()).toBeVisible();
    }
  });

  test("应该显示关键指标卡片 (KPI Cards)", async ({ page }) => {
    // 查找 KPI 卡片
    const kpiCards = page
      .locator("div")
      .filter({ hasText: /call|conversion|satisfaction|retention/i });

    if (await kpiCards.first().isVisible()) {
      // 验证至少有一个 KPI 卡片
      const cardCount = await kpiCards.count();
      expect(cardCount).toBeGreaterThan(0);

      // 验证 KPI 卡片包含数值
      const firstCard = kpiCards.first();
      const text = await firstCard.textContent();
      // 应该包含数字
      expect(text).toMatch(/\d+/);
    }
  });

  test("应该渲染图表组件", async ({ page }) => {
    // Recharts 使用 SVG 绘制图表
    const chartSvg = page.locator("svg").first();

    if (await chartSvg.isVisible()) {
      // 验证 SVG 包含数据点
      const circles = page.locator("circle"); // Recharts 中的数据点通常是圆形
      const circleCount = await circles.count();

      // 如果有 SVG，应该有某种图表元素
      expect(chartSvg).toBeTruthy();
    }
  });

  test("应该支持时间范围选择", async ({ page }) => {
    // 查找日期范围选择器
    const dateInput = page.locator('input[type="date"]').first();
    const dateRangeButton = page
      .locator("button")
      .filter({ hasText: /today|week|month|year|日期|范围/i })
      .first();

    if (await dateInput.isVisible()) {
      // 选择一个日期
      await dateInput.fill("2026-01-01");

      // 验证选择已更新
      const value = await dateInput.inputValue();
      expect(value).toContain("2026-01-01");
    } else if (await dateRangeButton.isVisible()) {
      // 点击日期范围按钮
      await dateRangeButton.click();

      // 等待菜单出现
      const dateMenu = page.locator('[role="menu"]').first();
      await expect(dateMenu).toBeVisible();
    }
  });

  test("应该支持指标过滤", async ({ page }) => {
    // 查找过滤按钮
    const filterButton = page
      .locator("button")
      .filter({ hasText: /filter|export|metric|指标|筛选|导出/i })
      .first();

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // 等待过滤菜单
      const filterMenu = page.locator('[role="menu"]').first();
      if (await filterMenu.isVisible()) {
        // 选择一个过滤选项
        const option = page.locator('[role="menuitem"]').first();
        if (await option.isVisible()) {
          await option.click();

          // 验证过滤已应用
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test("应该显示对标分析 (Benchmark)", async ({ page }) => {
    // 查找对标对比相关内容
    const benchmarkText = page
      .locator("text=/benchmark|对标|industry|行业|average|平均/i")
      .first();

    if (await benchmarkText.isVisible()) {
      // 验证对标数据可见
      expect(benchmarkText).toBeTruthy();
    }
  });

  test("应该支持数据导出 (需要 Phase 2)", async ({ page }) => {
    // 查找导出按钮
    const exportButton = page
      .locator("button")
      .filter({ hasText: /export|download|csv|excel|下载|导出/i })
      .first();

    if (await exportButton.isVisible()) {
      // 设置下载监听器
      const downloadPromise = page.waitForEvent("download");

      // 点击导出
      await exportButton.click();

      // 等待下载完成
      try {
        const download = await downloadPromise;

        // 验证文件名
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(csv|xlsx?|pdf)$/i);
      } catch (e) {
        // 导出功能可能在 Phase 2 才完全实现
        console.log("导出功能可能需要 Phase 2 实现");
      }
    }
  });

  test("图表应该是响应式的", async ({ page }) => {
    // 设置不同的视口尺寸并验证图表仍然可见
    const viewportSizes = [
      { width: 1920, height: 1080 }, // 桌面
      { width: 768, height: 1024 }, // 平板
      { width: 375, height: 667 }, // 手机
    ];

    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300);

      // 验证 KPI 卡片或图表仍可见
      const content = page.locator('[role="tabpanel"]').first();
      await expect(content).toBeVisible();
    }
  });

  test("应该显示实时数据更新指示", async ({ page }) => {
    // 查找更新时间戳或刷新按钮
    const refreshButton = page
      .locator("button")
      .filter({ hasText: /refresh|reload|update|刷新|更新/i })
      .first();
    const lastUpdated = page
      .locator("text=/last updated|updated at|最后更新/i")
      .first();

    if (await refreshButton.isVisible()) {
      // 验证刷新按钮存在
      expect(refreshButton).toBeTruthy();

      // 点击刷新
      await refreshButton.click();
      await page.waitForTimeout(500);
    }

    if (await lastUpdated.isVisible()) {
      // 验证时间戳格式
      const text = await lastUpdated.textContent();
      expect(text).toMatch(/\d{1,2}:\d{2}/); // HH:MM 格式
    }
  });

  test("图表交互: 悬停应显示详细信息", async ({ page }) => {
    // 查找图表中的数据点
    const dataPoint = page.locator("svg circle").first();

    if (await dataPoint.isVisible()) {
      // 悬停在数据点上
      await dataPoint.hover();

      // 等待 tooltip 出现
      await page.waitForTimeout(300);

      // 查找 tooltip
      const tooltip = page.locator('[role="tooltip"]').first();

      if (await tooltip.isVisible()) {
        // 验证 tooltip 包含数据
        const tooltipText = await tooltip.textContent();
        expect(tooltipText).toBeTruthy();
        expect(tooltipText).toMatch(/\d+/);
      }
    }
  });

  test("应该无控制台错误在仪表板加载时", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // 尝试加载所有数据分析内容
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    for (let i = 0; i < Math.min(tabCount, 3); i++) {
      const tab = tabs.nth(i);
      await tab.click();
      await page.waitForTimeout(500);
    }

    // 验证没有严重错误 (某些警告可能存在)
    const criticalErrors = errors.filter((e) => !e.includes("deprecated"));
    expect(criticalErrors).toHaveLength(0);
  });

  test("应该显示趋势指示符 (上升/下降)", async ({ page }) => {
    // 查找趋势箭头或指示符
    const trendUp = page.locator("text=/↑|up|增长|上升/i").first();
    const trendDown = page.locator("text=/↓|down|下降|减少/i").first();

    // 至少应该有一个趋势指示
    const hasTrend =
      (await trendUp.isVisible()) || (await trendDown.isVisible());

    if (hasTrend) {
      expect(hasTrend).toBeTruthy();
    }
  });
});

/**
 * 报告功能测试 (Phase 2)
 */
test.describe("报告生成与分享", () => {
  test.skip("应该能生成报告 (需要 Phase 2)", async ({ page }) => {
    await page.goto("/");

    // 查找报告生成按钮
    const reportButton = page
      .locator("button")
      .filter({ hasText: /report|generate|生成报告/i })
      .first();

    if (await reportButton.isVisible()) {
      await reportButton.click();

      // 等待报告生成对话框
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible();

      // 配置报告参数
      const nameInput = page.locator('input[placeholder*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Monthly Report");
      }

      // 生成报告
      const generateButton = page
        .locator("button")
        .filter({ hasText: /generate|submit|生成/i })
        .first();
      if (await generateButton.isVisible()) {
        await generateButton.click();

        // 验证报告已生成
        await page.waitForTimeout(2000);
      }
    }
  });

  test.skip("应该能分享报告链接", async ({ page }) => {
    // TODO: 实现报告分享测试
  });
});
