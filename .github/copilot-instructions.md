# YYC³ AI Intelligent Calling - Copilot Instructions

## 项目概述

YYC³ AI Intelligent Calling 是一个企业级智能外呼系统，基于 **Next.js 15** + **React 19** + **TypeScript** 构建，集成 Zhipu AI（智谱AI）大模型，提供智能对话引擎、批量外呼、数据分析等功能。

---

## 核心架构

### 技术栈

- **前端框架**：Next.js 15.2.4 (App Router)，React 19
- **语言**：TypeScript 5.0（严格模式启用）
- **UI 框架**：Radix UI + Tailwind CSS 3.4
- **AI 集成**：Zhipu AI (ChatGLM3-6B) via OpenAI-compatible API（`lib/ai-client.ts`）
- **数据库**：PostgreSQL（需通过 Docker Compose）
- **缓存/队列**：Redis
- **容器化**：Docker + Docker Compose（参考 `docker-compose.yml`）

### 关键架构模式

1. **客户端-服务器架构**
   - 前端：`app/` (Next.js App Router + Server Components)
   - API 路由：`app/api/ai/*` (AI 功能端点)
   - 共享库：`lib/` (工具函数、AI Client、Hooks)

2. **AI 集成点**
   - **API 端点**：`/api/ai/chat`、`/api/ai/intent`、`/api/ai/sentiment`
   - **客户端 Hook**：`lib/hooks/useAI.ts`（React Hook 封装 AI 功能）
   - **AI Client**：`lib/ai-client.ts`（Zhipu AI/vLLM OpenAI-compatible 接口）
   - **环境变量**：`AI_BASE_URL`、`AI_MODEL`、`AI_TEMPERATURE` 等

3. **页面组件架构**
   - **主仪表板**：`app/page.tsx`（Tab 式导航）
   - **功能模块**（根目录 .tsx 文件）：
     - `smart-call-system.tsx`：智能外呼与通话管理
     - `customer-profile-360.tsx`：客户 360° 画像
     - `data-analytics.tsx`：实时数据分析
     - `customer-management/`：客户管理系统
     - `marketing-automation.tsx`：营销自动化
     - `intelligent-forms.tsx`、`intelligent-phone-database.tsx`

---

## 开发工作流

### 本地开发环境

```bash
# 1. 安装依赖（项目使用 pnpm）
pnpm install

# 2. 启动开发服务器
pnpm dev                    # localhost:3000

# 3. Docker 环境（数据库 + Redis）
pnpm docker:run            # 启动 docker-compose.yml

# 4. 代码质量检查
pnpm lint                  # ESLint 检查
pnpm format                # Prettier 格式化
pnpm type-check            # TypeScript 类型检查

# 5. 测试
pnpm test                  # Jest 单元测试
pnpm test:watch            # 监听模式
pnpm test:e2e              # Playwright E2E 测试
```

### 构建与部署

```bash
pnpm build                 # 生产构建
pnpm start                 # 启动生产服务器

# 部署脚本（scripts/deploy.ts）
pnpm deploy:dev            # 开发环境
pnpm deploy:staging        # 预发布环境
pnpm deploy:prod           # 生产环境
```

---

## 代码模式与约定

### 文件结构约定

```
├── app/                           # Next.js App Router
│   ├── layout.tsx                # 根布局（RootLayout）
│   ├── page.tsx                  # 主仪表板
│   └── api/ai/                   # AI 相关 API 端点
├── components/                    # React 组件
│   ├── ai-chat.tsx               # AI 对话示例组件
│   └── ui/                       # Radix UI 封装（shadcn/ui）
├── lib/
│   ├── ai-client.ts              # 核心 AI Client 类
│   ├── hooks/useAI.ts            # React Hook 包装
│   └── utils.ts                  # 工具函数
├── [feature].tsx                 # 主要功能模块（客户端组件）
├── next.config.mjs               # Next.js 配置
├── tsconfig.json                 # TypeScript 配置（paths: @/*）
└── tailwind.config.ts            # Tailwind CSS 配置
```

### React 组件模式

**约定**：大多数组件使用 `"use client"` 指令（客户端组件）

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAI } from "@/lib/hooks/useAI";

// 组件示例（智能外呼系统）
interface CallRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  status: "completed" | "missed" | "busy" | "ongoing";
  sentiment: "positive" | "neutral" | "negative";
  qualityScore: number;
}

export function SmartCallSystem() {
  const [records, setRecords] = useState<CallRecord[]>([]);
  const { chat, classifyIntent, analyzeSentiment } = useAI();

  // 使用 React Hooks 管理状态
  // 使用 useAI Hook 调用 AI 服务
}
```

### AI 集成模式

**特点**：支持实时对话、意图分类、情感分析三大功能

```typescript
// 1. useAI Hook 使用示例
const { loading, error, chat, classifyIntent, analyzeSentiment } = useAI();

// 2. 调用 AI 聊天
const response = await chat(messages, {
  temperature: 0.6,
  max_tokens: 1024,
});

// 3. 意图分类与情感分析并行
const [intent, sentiment] = await Promise.all([
  classifyIntent(userInput),
  analyzeSentiment(userInput),
]);
```

**关键 AI Client 特性**（`lib/ai-client.ts`）：

- 支持 Zhipu AI 及 vLLM OpenAI-compatible 端点
- 环境变量配置：`AI_BASE_URL`、`AI_MODEL`、`AI_TEMPERATURE`、`AI_MAX_TOKENS`
- 超时控制：默认 20000ms

### 数据类型约定

```typescript
// 所有复杂数据结构在文件顶部定义 interface
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  intent?: { intent: string; confidence: number };
  sentiment?: { sentiment: string; score: number };
}
```

---

## 关键功能特性

### 1. 智能外呼系统（Smart Call System）

- **文件**：`smart-call-system.tsx`
- **功能**：通话管理、实时转录、情感分析、质量评分
- **特性**：
  - 通话记录追踪（已完成、未接、忙线、进行中）
  - 实时情感分析与语音分析
  - 脚本推荐系统（基于场景和成功率）

### 2. 客户 360° 画像（Customer Profile 360）

- **文件**：`customer-profile-360.tsx`
- **功能**：多维度客户分析、RFM 评分、风险评估
- **特性**：
  - 基本信息、行为数据、偏好分析
  - 财务档案、流失风险评估
  - 生命周期标签与预测价值

### 3. 数据分析平台（Data Analytics）

- **文件**：`data-analytics.tsx`
- **功能**：实时仪表板、趋势分析、对标分析
- **特性**：
  - 关键指标实时展示
  - 时间序列数据可视化（Recharts）

### 4. 客户管理系统（Customer Management）

- **路径**：`customer-management/`
- **功能**：完整的客户生命周期管理

---

## 环境与依赖

### 必需环境变量

```env
# AI 配置
AI_BASE_URL=http://127.0.0.1:10086/v1          # vLLM 或 Zhipu API
AI_MODEL=chatglm3-6b                           # 模型名称
AI_TEMPERATURE=0.6                             # 温度参数
AI_MAX_TOKENS=1024                             # 最大令牌数
AI_TIMEOUT_MS=20000                            # 超时时间

# 数据库
DATABASE_URL=postgresql://user:pass@db:5432/db
REDIS_URL=redis://redis:6379

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=development
```

### 核心依赖

- **UI**：@radix-ui/\*、lucide-react、embla-carousel-react
- **表单**：react-hook-form、@hookform/resolvers、zod
- **图表**：recharts
- **工具**：date-fns、clsx、class-variance-authority
- **开发**：TypeScript、ESLint、Prettier、Jest、Playwright

---

## 测试约定

- **单元测试**：`*.test.ts(x)` 文件，Jest 框架
- **E2E 测试**：`*.spec.ts` 文件，Playwright 框架
- **代码覆盖率目标**：>80%

---

## Docker 与部署

### Docker Compose 服务

- **app**：Next.js 应用（端口 3000）
- **postgres**：PostgreSQL 数据库（端口 5432）
- **redis**：Redis 缓存（端口 6379）
- **nginx**：反向代理（端口 80/443）

### 生产构建

```dockerfile
# 多阶段构建：deps → builder → runner
# 最终镜像采用 node:20-alpine，非 root 用户运行
# 健康检查：/api/health 端点（30s 间隔）
```

---

## 常见模式与最佳实践

### ✅ 应该做的

1. **使用 TypeScript 接口定义所有复杂数据**
2. **在组件顶部定义数据类型 interface**
3. **使用 Radix UI 组件维持设计一致性**
4. **并行调用 AI 服务**（`Promise.all`）
5. **通过 useAI Hook 调用所有 AI 功能**
6. **使用环境变量配置 AI 参数**
7. **导入使用路径别名** `@/`

### ❌ 避免做的

1. **在客户端直接调用 Zhipu AI API**（使用 `/api/ai/*` 端点）
2. **硬编码 AI 配置参数**
3. **混用不同的 UI 组件库**（坚持使用 Radix UI）
4. **忘记在客户端组件顶部添加 `"use client"`**

---

## 架构决策记录

- **Next.js App Router**：支持 Server & Client Components 混合开发，优化性能
- **OpenAI-compatible API**：使用 vLLM wrapper 支持开源模型部署灵活性
- **Radix UI + Tailwind**：无缝整合、高度可定制的设计系统
- **Docker Compose**：快速本地开发环境，一键启动完整技术栈

---

## 快速参考

| 任务           | 命令                           |
| -------------- | ------------------------------ |
| 启动开发服务器 | `pnpm dev`                     |
| Docker 环境    | `pnpm docker:run`              |
| 代码检查       | `pnpm lint && pnpm type-check` |
| 格式化代码     | `pnpm format`                  |
| 生产构建       | `pnpm build && pnpm start`     |
| 部署           | `pnpm deploy:prod`             |

---

## 相关文档

- 📋 [README.md](../README.md) - 项目完整介绍
- 🏗️ [架构设计文档](../docs/YYC3-AI-Call-架构设计/)
- 📚 [AI SDK 集成指南](../docs/AI-SDK-集成指南.md)
- 🚀 [部署指南](../docs/YYC3-AI-Call-DEPLOYMENT.md)
- 🔄 [CI/CD 配置](../docs/YYC3-AI-Call-CICD.md)
