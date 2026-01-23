/**
 * Prisma Client 数据库连接单例
 * 遵循 Next.js 最佳实践，避免开发环境下热重载导致的连接泄漏
 *
 * @fileoverview 全局 Prisma Client 实例管理
 * @module lib/db
 * @author YYC³ AI Call Center Team
 * @version 1.0.0
 * @created 2026-01-23
 */

import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 配置选项
 */
const prismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
} as const;

/**
 * 全局 Prisma Client 实例声明 (用于开发环境缓存)
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * 获取或创建 Prisma Client 实例
 *
 * 开发环境: 使用全局变量缓存实例，避免热重载时创建多个连接
 * 生产环境: 每次创建新实例
 *
 * @returns {PrismaClient} Prisma Client 实例
 */
export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

// 开发环境下缓存实例到全局
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * 优雅关闭数据库连接
 * 在应用关闭时调用
 */
export async function disconnectDB() {
  await prisma.$disconnect();
}

/**
 * 健康检查：验证数据库连接
 *
 * @returns {Promise<boolean>} 连接状态
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * 获取数据库连接信息
 *
 * @returns {Promise<object>} 数据库版本和统计信息
 */
export async function getDBInfo() {
  try {
    const version = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version();
    `;

    const stats = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM customers) as customer_count,
        (SELECT COUNT(*) FROM call_records) as call_count,
        (SELECT COUNT(*) FROM campaigns) as campaign_count;
    `;

    return {
      version: version[0]?.version || "Unknown",
      stats: stats[0] || {},
      connected: true,
    };
  } catch (error) {
    console.error("Failed to get DB info:", error);
    return {
      version: "Unknown",
      stats: {},
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 导出类型定义
export type { PrismaClient };
export * from "@prisma/client";

// 默认导出
export default prisma;
