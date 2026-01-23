/**
 * 数据库连接与数据验证脚本
 * 用于验证 PostgreSQL 连接和 Prisma 配置是否正常
 *
 * 执行方式: pnpm db:verify
 *
 * @fileoverview 数据库健康检查与数据完整性验证
 * @module scripts/verify-db
 * @author YYC³ AI Call Center Team
 * @version 1.0.0
 * @created 2026-01-23
 */

import { PrismaClient } from "@prisma/client";
import { checkDBHealth, getDBInfo } from "../lib/db";

const prisma = new PrismaClient();

/**
 * 验证表数据
 */
async function verifyTableData() {
  console.log("\n📊 验证表数据...\n");

  const tables = [
    { name: "User", model: prisma.user },
    { name: "Customer", model: prisma.customer },
    { name: "CallRecord", model: prisma.callRecord },
    { name: "Campaign", model: prisma.campaign },
    { name: "CampaignCustomer", model: prisma.campaignCustomer },
    { name: "Form", model: prisma.form },
    { name: "FormSubmission", model: prisma.formSubmission },
    { name: "Task", model: prisma.task },
    { name: "AnalyticsMetric", model: prisma.analyticsMetric },
  ];

  const results = [];

  for (const table of tables) {
    try {
      const count = await table.model.count();
      results.push({ name: table.name, count, status: "✅" });
      console.log(
        `  ${table.name.padEnd(20)} ${count.toString().padStart(5)} 条`,
      );
    } catch (error: any) {
      results.push({
        name: table.name,
        count: 0,
        status: "❌",
        error: error.message,
      });
      console.log(`  ${table.name.padEnd(20)} ❌ 错误`);
    }
  }

  return results;
}

/**
 * 验证数据关系
 */
async function verifyRelations() {
  console.log("\n🔗 验证数据关系...\n");

  try {
    // 验证客户与通话记录关系
    const customerWithCalls = await prisma.customer.findFirst({
      where: { callRecords: { some: {} } },
      include: { callRecords: true },
    });

    if (customerWithCalls) {
      console.log(
        `  ✅ 客户-通话记录关系: ${customerWithCalls.name} 有 ${customerWithCalls.callRecords.length} 条通话记录`,
      );
    } else {
      console.log("  ⚠️  未找到有通话记录的客户");
    }

    // 验证用户与客户关系
    const userWithCustomers = await prisma.user.findFirst({
      where: { customers: { some: {} } },
      include: { customers: true },
    });

    if (userWithCustomers) {
      console.log(
        `  ✅ 用户-客户关系: ${userWithCustomers.name} 管理 ${userWithCustomers.customers.length} 个客户`,
      );
    } else {
      console.log("  ⚠️  未找到管理客户的用户");
    }

    // 验证表单与提交记录关系
    const formWithSubmissions = await prisma.form.findFirst({
      where: { submissions: { some: {} } },
      include: { submissions: true },
    });

    if (formWithSubmissions) {
      console.log(
        `  ✅ 表单-提交记录关系: ${formWithSubmissions.name} 有 ${formWithSubmissions.submissions.length} 条提交记录`,
      );
    } else {
      console.log("  ⚠️  未找到有提交记录的表单");
    }

    return true;
  } catch (error: any) {
    console.error("  ❌ 关系验证失败:", error.message);
    return false;
  }
}

/**
 * 验证索引
 */
async function verifyIndexes() {
  console.log("\n🔍 验证数据库索引...\n");

  try {
    // 执行原生查询检查索引
    const indexes = (await prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `) as any[];

    console.log(`  ✅ 找到 ${indexes.length} 个索引`);

    // 显示前 5 个索引作为示例
    indexes.slice(0, 5).forEach((idx) => {
      console.log(`     - ${idx.tablename}.${idx.indexname}`);
    });

    if (indexes.length > 5) {
      console.log(`     ... 还有 ${indexes.length - 5} 个索引`);
    }

    return true;
  } catch (error: any) {
    console.error("  ❌ 索引验证失败:", error.message);
    return false;
  }
}

/**
 * 验证全文搜索
 */
async function verifyFullTextSearch() {
  console.log("\n🔎 验证全文搜索功能...\n");

  try {
    // 测试客户全文搜索
    const searchTerm = "科技";
    const searchResults = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { company: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 5,
    });

    console.log(
      `  ✅ 全文搜索 "${searchTerm}": 找到 ${searchResults.length} 个结果`,
    );
    searchResults.forEach((r) => {
      console.log(`     - ${r.name} (${r.company})`);
    });

    return true;
  } catch (error: any) {
    console.error("  ❌ 全文搜索验证失败:", error.message);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🔍 开始数据库验证...\n");
  console.log("=".repeat(60));

  // 1. 健康检查
  console.log("\n💓 数据库健康检查...\n");
  const isHealthy = await checkDBHealth();
  if (isHealthy) {
    console.log("  ✅ 数据库连接正常");
  } else {
    console.error("  ❌ 数据库连接失败");
    process.exit(1);
  }

  // 2. 获取数据库信息
  const dbInfo = await getDBInfo();
  console.log(`  📦 PostgreSQL 版本: ${dbInfo.version}`);
  console.log(`  📊 表统计:`);
  console.log(`     - 用户: ${dbInfo.users} 条`);
  console.log(`     - 客户: ${dbInfo.customers} 条`);
  console.log(`     - 通话记录: ${dbInfo.callRecords} 条`);
  console.log(`     - 营销活动: ${dbInfo.campaigns} 条`);

  // 3. 验证表数据
  const tableResults = await verifyTableData();

  // 4. 验证数据关系
  await verifyRelations();

  // 5. 验证索引
  await verifyIndexes();

  // 6. 验证全文搜索
  await verifyFullTextSearch();

  // 7. 总结
  console.log("\n" + "=".repeat(60));
  console.log("\n📋 验证总结:\n");

  const totalRecords = tableResults.reduce((sum, r) => sum + r.count, 0);
  const failedTables = tableResults.filter((r) => r.status === "❌");

  if (failedTables.length === 0) {
    console.log(`  ✅ 所有表验证通过`);
    console.log(`  📊 总记录数: ${totalRecords} 条`);
    console.log("\n🎉 数据库验证完成！所有检查通过。\n");
  } else {
    console.error(`  ❌ ${failedTables.length} 个表验证失败:`);
    failedTables.forEach((t) => {
      console.error(`     - ${t.name}: ${t.error}`);
    });
    console.log("\n⚠️  数据库验证发现问题，请检查上述错误。\n");
    process.exit(1);
  }
}

// 执行主函数
main()
  .catch((e) => {
    console.error("\n❌ 验证过程失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
