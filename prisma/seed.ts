/**
 * Prisma 种子数据脚本
 * 用于初始化数据库测试数据
 *
 * 执行方式: pnpm prisma db seed
 *
 * @fileoverview 数据库种子数据生成
 * @module prisma/seed
 * @author YYC³ AI Call Center Team
 * @version 1.0.0
 * @created 2026-01-23
 */

import {
  PrismaClient,
  UserRole,
  CustomerStatus,
  IntentLevel,
  CallDirection,
  CallStatus,
  Sentiment,
  CampaignType,
  CampaignStatus,
  TaskType,
  Priority,
  TaskStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * 生成随机手机号
 */
function generatePhone(): string {
  const prefixes = [
    "130",
    "131",
    "132",
    "133",
    "134",
    "135",
    "136",
    "137",
    "138",
    "139",
    "150",
    "151",
    "152",
    "153",
    "155",
    "156",
    "157",
    "158",
    "159",
    "180",
    "181",
    "182",
    "183",
    "184",
    "185",
    "186",
    "187",
    "188",
    "189",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return prefix + suffix;
}

/**
 * 生成随机邮箱
 */
function generateEmail(name: string): string {
  const domains = ["163.com", "qq.com", "gmail.com", "outlook.com", "yyc3.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${name.toLowerCase().replace(/\s/g, "")}${Math.floor(Math.random() * 1000)}@${domain}`;
}

/**
 * 主函数：清空并填充种子数据
 */
async function main() {
  console.log("🌱 开始播种数据...\n");

  // 清空现有数据（开发环境）
  if (process.env.NODE_ENV === "development") {
    console.log("🗑️  清空现有数据...");
    await prisma.formSubmission.deleteMany({});
    await prisma.form.deleteMany({});
    await prisma.campaignCustomer.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.callRecord.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.analyticsMetric.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ 数据清空完成\n");
  }

  // 1. 创建用户
  console.log("👤 创建用户...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@yyc3.com",
      password: hashedPassword,
      name: "系统管理员",
      role: UserRole.ADMIN,
      phone: "13800138000",
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: "agent1@yyc3.com",
      password: hashedPassword,
      name: "王芳",
      role: UserRole.AGENT,
      phone: "13800138001",
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: "agent2@yyc3.com",
      password: hashedPassword,
      name: "李明",
      role: UserRole.AGENT,
      phone: "13800138002",
    },
  });

  console.log(`✅ 创建了 3 个用户\n`);

  // 2. 创建客户
  console.log("🎭 创建客户...");
  const customerNames = [
    "张伟",
    "王芳",
    "李娜",
    "刘强",
    "陈静",
    "杨洋",
    "赵敏",
    "黄磊",
    "周杰",
    "吴彦祖",
    "郑爽",
    "孙俪",
    "马云",
    "马化腾",
    "雷军",
    "刘德华",
    "周星驰",
    "成龙",
    "李连杰",
    "甄子丹",
  ];

  const customers = [];
  for (let i = 0; i < 50; i++) {
    const name = customerNames[i % customerNames.length] + (i > 19 ? i : "");
    const customer = await prisma.customer.create({
      data: {
        name,
        email: generateEmail(name),
        phone: generatePhone(),
        status: [
          CustomerStatus.NEW,
          CustomerStatus.CONTACTED,
          CustomerStatus.INTERESTED,
          CustomerStatus.NEGOTIATING,
        ][Math.floor(Math.random() * 4)],
        intentLevel: [
          IntentLevel.LOW,
          IntentLevel.MEDIUM,
          IntentLevel.HIGH,
          IntentLevel.VERY_HIGH,
        ][Math.floor(Math.random() * 4)],
        company: `${name}科技公司`,
        position: ["CEO", "总监", "经理", "主管"][
          Math.floor(Math.random() * 4)
        ],
        province: ["北京", "上海", "广东", "浙江", "江苏"][
          Math.floor(Math.random() * 5)
        ],
        city: ["北京", "上海", "深圳", "杭州", "南京"][
          Math.floor(Math.random() * 5)
        ],
        rfmScore: Math.random() * 100,
        totalCalls: Math.floor(Math.random() * 20),
        totalValue: Math.floor(Math.random() * 100000),
        tags: ["VIP", "高净值", "潜力客户", "老客户"].slice(
          0,
          Math.floor(Math.random() * 3) + 1,
        ),
        userId: [agent1.id, agent2.id][Math.floor(Math.random() * 2)],
      },
    });
    customers.push(customer);
  }

  console.log(`✅ 创建了 ${customers.length} 个客户\n`);

  // 3. 创建通话记录
  console.log("📞 创建通话记录...");
  for (let i = 0; i < 100; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    await prisma.callRecord.create({
      data: {
        customerId: customer.id,
        phoneNumber: customer.phone,
        direction:
          Math.random() > 0.5 ? CallDirection.OUTBOUND : CallDirection.INBOUND,
        status: [CallStatus.COMPLETED, CallStatus.MISSED, CallStatus.BUSY][
          Math.floor(Math.random() * 3)
        ],
        duration: Math.floor(Math.random() * 600),
        sentiment: [Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE][
          Math.floor(Math.random() * 3)
        ],
        sentimentScore: Math.random() * 100,
        qualityScore: Math.random() * 100,
        intentTags: ["购买意向", "咨询价格", "产品对比"].slice(
          0,
          Math.floor(Math.random() * 2) + 1,
        ),
        summary: "客户对产品表示感兴趣，要求提供详细方案",
      },
    });
  }

  console.log("✅ 创建了 100 条通话记录\n");

  // 4. 创建营销活动
  console.log("🎯 创建营销活动...");
  const campaign1 = await prisma.campaign.create({
    data: {
      name: "春节促销活动",
      description: "春节期间特惠活动，针对高价值客户",
      type: CampaignType.PHONE,
      status: CampaignStatus.ACTIVE,
      targetCount: 100,
      successCount: 25,
      startDate: new Date("2026-01-20"),
      endDate: new Date("2026-02-10"),
      userId: admin.id,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: "新客户开发计划",
      description: "针对潜在客户的开发活动",
      type: CampaignType.MIXED,
      status: CampaignStatus.ACTIVE,
      targetCount: 200,
      successCount: 45,
      startDate: new Date("2026-01-01"),
      userId: agent1.id,
    },
  });

  console.log("✅ 创建了 2 个营销活动\n");

  // 5. 创建任务
  console.log("📋 创建任务...");
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    await prisma.task.create({
      data: {
        title: `跟进客户 ${customer.name}`,
        description: "进行产品介绍和需求确认",
        type: [TaskType.OUTBOUND_CALL, TaskType.FOLLOW_UP, TaskType.SURVEY][
          Math.floor(Math.random() * 3)
        ],
        priority: [Priority.LOW, Priority.MEDIUM, Priority.HIGH][
          Math.floor(Math.random() * 3)
        ],
        status: [
          TaskStatus.PENDING,
          TaskStatus.IN_PROGRESS,
          TaskStatus.COMPLETED,
        ][Math.floor(Math.random() * 3)],
        customerId: customer.id,
        userId: [agent1.id, agent2.id][Math.floor(Math.random() * 2)],
        dueDate: new Date(
          Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }

  console.log("✅ 创建了 30 个任务\n");

  // 6. 创建表单
  console.log("📝 创建表单...");
  const form = await prisma.form.create({
    data: {
      name: "客户需求调研表",
      description: "收集客户详细需求信息",
      fields: {
        fields: [
          { type: "text", label: "姓名", required: true },
          { type: "phone", label: "联系电话", required: true },
          { type: "email", label: "电子邮箱", required: false },
          {
            type: "select",
            label: "产品类型",
            options: ["产品A", "产品B", "产品C"],
          },
          { type: "textarea", label: "详细需求", required: true },
        ],
      },
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log("✅ 创建了 1 个表单\n");

  // 7. 创建分析指标
  console.log("📊 创建分析指标...");
  const metrics = [
    { metric: "call_success_rate", value: 75.5 },
    { metric: "avg_call_duration", value: 180.2 },
    { metric: "conversion_rate", value: 12.8 },
    { metric: "customer_satisfaction", value: 85.3 },
    { metric: "daily_calls", value: 156 },
  ];

  for (const metric of metrics) {
    await prisma.analyticsMetric.create({
      data: metric,
    });
  }

  console.log("✅ 创建了 5 个分析指标\n");

  console.log("🎉 种子数据播种完成！");
  console.log("\n📊 数据统计:");
  console.log(`   - 用户: ${await prisma.user.count()} 条`);
  console.log(`   - 客户: ${await prisma.customer.count()} 条`);
  console.log(`   - 通话记录: ${await prisma.callRecord.count()} 条`);
  console.log(`   - 营销活动: ${await prisma.campaign.count()} 条`);
  console.log(`   - 任务: ${await prisma.task.count()} 条`);
  console.log(`   - 表单: ${await prisma.form.count()} 条`);
  console.log(`   - 分析指标: ${await prisma.analyticsMetric.count()} 条`);
}

// 执行主函数
main()
  .catch((e) => {
    console.error("❌ 种子数据播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
