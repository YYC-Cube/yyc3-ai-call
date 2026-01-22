# YYC³团队文档标准化审核规范

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📑 目录导航

- [YYC³团队文档标准化审核规范](#yyc团队文档标准化审核规范)
  - [📑 目录导航](#-目录导航)
  - [📋 文档概述](#-文档概述)
  - [🔍 审核框架与维度](#-审核框架与维度)
    - [🎯 核心理念](#-核心理念)
    - [📊 评估维度与权重](#-评估维度与权重)
    - [🔬 各维度详细指标](#-各维度详细指标)
  - [✅ 详细检查清单](#-详细检查清单)
  - [🚀 快速开始指南](#-快速开始指南)
    - [1. 项目命名标准化](#1-项目命名标准化)
    - [2. 文件头注释模板](#2-文件头注释模板)
    - [3. package.json标准化](#3-packagejson标准化)
    - [4. README文件标头标尾](#4-readme文件标头标尾)
  - [🛠️ 实用工具与自动化](#️-实用工具与自动化)
    - [快速生成项目模板](#快速生成项目模板)
    - [标准化检查命令](#标准化检查命令)
    - [自动化脚本规范](#自动化脚本规范)
  - [📊 评分标准](#-评分标准)
    - [评分方法](#评分方法)
  - [🚑 快速修复指南](#-快速修复指南)
  - [📞 支持与反馈](#-支持与反馈)
    - [联系我们](#联系我们)
    - [资源链接](#资源链接)
  - [📌 备注](#-备注)

---

## 📋 文档概述

本文档整合了YYC³团队的标准化规范、审核框架和快速实践指南，旨在为团队提供一套完整的项目标准化审核体系，确保所有项目都符合YYC³团队的质量标准和最佳实践。通过本清单，团队成员可以快速评估项目的标准化程度，并进行有针对性的优化和改进。

---

## 🔍 审核框架与维度

### 🎯 核心理念

YYC³ 审核框架基于 **「五高五标五化」** 核心理念构建，确保项目在技术、管理和业务层面均达到高标准：

- **五高**：高可用、高性能、高安全、高扩展、高可维护
- **五标**：标准化、规范化、自动化、智能化、可视化
- **五化**：流程化、文档化、工具化、数字化、生态化

### 🚨 端口限用规范

为确保团队项目部署的一致性和避免端口冲突，YYC³团队制定了如下端口使用规范：

- **默认端口范围**: 3200-3500（推荐所有新项目使用此范围）
- **限用端口范围**: 3000-3199（仅用于特殊项目和遗留系统）
- **端口命名建议**: 按照项目功能或服务类型选择端口号，便于记忆和维护

> **示例**：
>
> - 主应用服务：3200
> - API服务：3201
> - 管理后台：3202

### 📊 评估维度与权重

YYC³ 审核清单从六个核心维度对项目进行全面评估，各维度权重如下：

| 评估维度 | 权重 | 核心关注点 |
|---------|------|-----------|
| 技术架构 | 25% | 架构设计、技术选型、扩展性 |
| 代码质量 | 20% | 代码规范、可读性、可维护性 |
| 功能完整 | 20% | 功能实现、用户体验、需求匹配 |
| 开发运维 | 15% | CI/CD、自动化、部署流程 |
| 性能安全 | 15% | 性能优化、安全防护、漏洞检测 |
| 商业价值 | 5% | 业务契合度、市场前景、成本效益 |

### 🔬 各维度详细指标

以下是各评估维度的详细检查指标，用于指导项目的标准化审核：

<details open>
<summary><strong>🛡️ 技术架构 (25%)</strong></summary>

- **架构设计**：严格采用分层架构、微服务/模块化设计，确保系统各组件职责明确、边界清晰
- **技术选型**：优先使用符合团队标准的技术栈，如 Next.js 14+ (App Router)、TypeScript、Tailwind CSS 等
- **扩展性**：支持水平扩展、松耦合设计、可插拔组件，能够灵活适应未来业务快速增长需求
- **兼容性**：全面确保跨平台兼容、主流浏览器兼容性和系统向后兼容性

</details>

<details open>
<summary><strong>💻 代码质量 (20%)</strong></summary>

- **代码规范**：严格遵循团队编码规范，全面使用 TypeScript 类型定义，确保代码风格统一规范
- **可读性**：采用清晰合理的命名方式、适当的注释说明和结构化的代码组织，提升代码可理解性
- **可维护性**：实现高度模块化、低耦合、高内聚的代码结构，便于后续维护和扩展
- **测试覆盖率**：确保单元测试、集成测试和 E2E 测试的全面覆盖，提高代码可靠性和稳定性

</details>

<details open>
<summary><strong>🎯 功能完整 (20%)</strong></summary>

- **功能实现**：严格依据需求规格书完整实现所有功能点
- **用户体验**：提供响应式设计、流畅的交互体验和直观的操作界面
- **需求匹配**：确保功能与业务需求高度契合，有效解决用户核心痛点
- **文档完整性**：提供完整的 API 文档、用户操作手册和开发者文档

</details>

<details open>
<summary><strong>🚀 开发运维 (15%)</strong></summary>

- **CI/CD**：建立自动化构建、测试和部署流程，提高开发效率
- **自动化**：实现代码检查、格式规范和测试自动化
- **部署流程**：标准化部署、环境配置和版本管理
- **监控告警**：建立性能监控、错误告警和日志管理机制

</details>

<details open>
<summary><strong>🛡️ 性能安全 (15%)</strong></summary>

- **性能优化**：优化加载速度、响应时间和资源利用效率
- **安全防护**：实现输入验证、授权认证和数据加密等安全措施
- **漏洞检测**：定期进行安全扫描，及时修复发现的漏洞
- **合规性**：确保系统遵循相关法规和数据保护要求

</details>

<details open>
<summary><strong>💼 商业价值 (5%)</strong></summary>

- **业务契合度**：确保技术方案符合业务战略，提升业务效率
- **市场前景**：评估技术创新性和市场竞争力
- **成本效益**：分析开发成本、维护成本和投资回报率 (ROI)

</details>

---

## ✅ 详细检查清单

<details open>
<summary><strong>📁 项目级检查清单</strong></summary>

<details>
<summary>项目命名规范</summary>

- [ ] 项目名称以 `yyc3-` 开头
- [ ] 项目名称使用短横线分隔 `kebab-case`
- [ ] 项目名称清晰反映项目功能

</details>

<details>
<summary>package.json 配置</summary>

- [ ] 包含 `name` 字段，格式为 `yyc3-{project-name}`
- [ ] 包含 `author` 字段：`YYC³ <admin@0379.email>`
- [ ] 包含 `license` 字段，值为 `MIT`
- [ ] 包含 `repository` 字段，指向 GitHub 仓库
- [ ] 包含 `engines` 字段，指定 Node.js 版本

</details>

<details>
<summary>README.md 要求</summary>

- [ ] 包含 YYC³ 品牌信息和标语
- [ ] 包含项目介绍和核心功能
- [ ] 包含快速开始指南
- [ ] 包含使用示例和 API 文档
- [ ] 包含贡献指南和行为准则
- [ ] 包含许可证信息

</details>

<details>
<summary>项目初始化</summary>

- [ ] 使用 YYC³ 官方项目模板创建项目
- [ ] 安装所有必要依赖，确保依赖版本符合团队要求
- [ ] 执行 `pnpm install`（推荐）或 `npm install` 安装依赖
- [ ] 确认项目可以正常构建（执行 `pnpm build` 或 `npm run build`）
- [ ] 配置项目环境变量，遵循 `.env.example` 模板
- [ ] 初始化版本控制系统（如 Git），配置 `.gitignore` 文件

</details>

</details>

<details open>
<summary><strong>📄 代码文件检查清单</strong></summary>

<details>
<summary>文件头注释模板</summary>

- [ ] TypeScript/JavaScript 文件包含标准文件头
- [ ] 文件头包含 `@fileoverview`、`@author`、`@version` 等信息
- [ ] 文件头包含版权和许可证信息

示例：

```typescript
/**
 * @fileoverview [文件功能描述]
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */
```

</details>

<details>
<summary>代码风格</summary>

- [ ] 使用 TypeScript 编写所有代码
- [ ] 遵循团队 ESLint 和 Prettier 配置
- [ ] 组件使用 PascalCase 命名
- [ ] 工具函数使用 camelCase 命名
- [ ] 常量使用 UPPER_SNAKE_CASE 命名

</details>

<details>
<summary>代码质量</summary>

- [ ] 避免魔法数字和硬编码字符串
- [ ] 使用 TypeScript 接口定义数据结构
- [ ] 添加适当的错误处理
- [ ] 编写单元测试和集成测试

</details>

</details>

<details open>
<summary><strong>📖 文档文件检查清单</strong></summary>

<details>
<summary>Markdown 文档头</summary>

- [ ] 包含标准文档标题
- [ ] 包含品牌信息和标语
- [ ] 英文标语使用粗斜体格式

示例：

```markdown
# 🔖 YYC³ (Header)

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***
```

</details>

<details>
<summary>文档结构</summary>

- [ ] 包含文档内容区域
- [ ] 使用清晰的章节标题
- [ ] 包含表格、代码块等格式化内容
- [ ] 使用适当的图标增强可读性

</details>

<details>
<summary>文档标尾</summary>

- [ ] 包含品牌信息和标语
- [ ] 包含联系方式：`<admin@0379.email>`
- [ ] 英文标语使用粗斜体格式

</details>

</details>

示例：

```markdown
## 📄 文档标尾 (Footer)

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
```

<details open>
<summary><strong>📁 文件命名检查清单</strong></summary>

<details>
<summary>通用命名规则</summary>

- [ ] 使用英文命名，禁止使用中文
- [ ] 使用有意义的命名，避免缩写
- [ ] 文件和目录命名保持一致性

</details>

<details>
<summary>文件命名规范</summary>

- [ ] TypeScript 组件文件：`ComponentName.tsx` (PascalCase)
- [ ] TypeScript 类型文件：`types.ts` 或 `interface.ts`
- [ ] 工具函数文件：`utilityFunctions.ts` (camelCase)
- [ ] 样式文件：`styles.module.css`

</details>

<details>
<summary>目录命名规范</summary>

- [ ] 目录名使用 kebab-case：`src/components/ui-elements`
- [ ] 避免过深的目录结构（建议不超过 4 层）
- [ ] 使用单数形式：`src/type` 而不是 `src/types`

</details>

</details>

<details open>
<summary><strong>🏗️ 项目结构检查清单</strong></summary>

<details>
<summary>标准目录结构</summary>

```
src/
├── app/                # Next.js App Router
├── components/         # 通用组件
├── lib/                # 工具库
├── hooks/              # React Hooks
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── styles/             # 样式文件
```

</details>

<details>
<summary>目录检查</summary>

- [ ] 遵循标准目录结构
- [ ] 所有源代码放在 `src/` 目录下
- [ ] 配置文件放在项目根目录
- [ ] 测试文件与源代码放在同一目录下，使用 `.test.ts` 或 `.spec.ts` 后缀

</details>

</details>

---

## 🚀 快速开始指南

### 1. 项目命名标准化

```bash
# ❌ 错误的命名方式
my-project
redis-integration
user-management-system

# ✅ 正确的命名方式
yyc3-my-project
yyc3-cache-redis
yyc3-user-management
```

### 2. 文件头注释模板

> 参考「代码文件检查清单」中的文件头注释模板示例

### 3. package.json标准化

```json
{
  "name": "yyc3-{project-name}",
  "author": "YYC³ <admin@0379.email>",
  "license": "MIT",
  "repository": {
    "url": "https://github.com/YYC-Cube/{project-name}.git"
  }
}
```

### 4. README文件标头标尾

> 参考「文档文件检查清单」中的Markdown文档头和文档标尾示例

---

## 🛠️ 实用工具与自动化

### 快速生成项目模板

```bash
# 创建标准项目
bunx create-yyc3-app yyc3-my-awesome-project

# 选择模板类型
--template=basic     # 基础项目
--template=full      # 完整项目
--template=api       # API服务
--template=ui        # UI组件
```

### 标准化检查命令

```bash
# 检查项目标准化程度
bun run check:standards

# 自动修复格式问题
bun run fix:standards

# 生成标准文档
bun run generate:docs
```

### 自动化脚本规范

```bash
#!/bin/bash
# === 脚本健康检查头 ===
set -euo pipefail  # 严格模式
trap "cleanup" EXIT INT TERM

# 资源监控
check_system_health() {
...
```

---

## 📊 评分标准

| 评分区间 | 评级 | 说明 |
|---------|------|------|
| 90-100 | S | 优秀，完全符合所有标准 |
| 80-89 | A | 良好，符合大部分标准，少量问题 |
| 70-79 | B | 合格，基本符合标准，存在一些问题 |
| 60-69 | C | 待改进，部分符合标准，存在明显问题 |
| 0-59 | D | 不合格，不符合大部分标准，需要全面整改 |

### 评分方法

- 每个检查点计 1 分
- 按维度权重计算加权总分
- 根据总分确定评级

---

## 🚑 快速修复指南

当您遇到常见的标准化问题时，可以参考以下快速修复指南：

<details open>
<summary><strong>1. 文件与代码规范问题</strong></summary>

- **文件命名不规范**：按照「命名规范」部分的要求重命名文件，确保使用小写字母、连字符分隔的命名方式
- **缺少文件头注释**：使用提供的模板添加文件头注释，包含文件功能描述、作者、版本等信息
- **代码格式不一致**：执行 `pnpm format`（推荐）或 `npm run format` 命令进行统一格式化
- **代码缺少注释**：为复杂逻辑、函数和类添加必要的注释说明

</details>

<details open>
<summary><strong>2. 依赖与构建问题</strong></summary>

- **依赖版本冲突**：使用 `pnpm why` 或 `npm ls` 分析依赖树，更新或锁定依赖版本
- **构建失败**：检查错误日志，确保所有依赖已正确安装，执行 `pnpm install` 后重试
- **环境变量配置错误**：检查 `.env` 文件是否与 `.env.example` 模板一致，确保所有必要变量已配置

</details>

<details open>
<summary><strong>3. 文档与项目结构问题</strong></summary>
- **文档不完整**：按照「文档文件检查清单」补充必要文档内容
- **项目结构混乱**：参考「项目结构」部分重新组织文件和目录
- **缺少测试**：为核心功能添加单元测试，确保测试覆盖率符合要求
</details>

---

## 📞 支持与反馈

### 联系我们

- **技术支持**：<admin@0379.email>
- **问题反馈**：GitHub Issues
- **文档更新**：<admin@0379.email>

### 资源链接

- **完整规范文档**：[YYC³团队标准化规范文档.md](./YYC³团队标准化规范文档.md)
- **快速开始指南**：[快速开始指南.md](./快速开始指南.md)
- **审核分析框架**：[审核分析多维度.md](./审核分析多维度.md)

---

## 📌 备注

1. **文档更新**：本文档将定期更新以适应团队技术栈和规范的变化，请关注最新版本。

2. **使用建议**：
   - 建议在项目初始化阶段就开始使用本检查清单
   - 定期进行标准化审核，确保项目始终符合规范
   - 结合自动化工具使用，提高审核效率和准确性

3. **适用范围**：
   - 适用于 YYC³ 团队所有新项目
   - 旧项目建议逐步迁移到本规范
   - 特殊项目可根据实际情况调整部分标准

4. **术语说明**：
   - **五高五标五化**：YYC³ 团队的核心理念，指导团队的技术和管理实践
   - **标准目录结构**：基于 Next.js 14+ (App Router) 的推荐项目结构
   - **YYC³ 模板**：团队提供的标准化项目模板，包含所有必要的配置和依赖

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
