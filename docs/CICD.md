# 🔄 CI/CD 完整指南

## 自动化工作流架构

### 流程概览

\`\`\`mermaid
graph LR
    A[代码提交] --> B{触发条件}
    B -->|Push| C[完整流水线]
    B -->|PR| D[预览部署]
    C --> E[代码检查]
    E --> F[安全扫描]
    F --> G[测试]
    G --> H[构建]
    H --> I[部署]
    I --> J[监控]
\`\`\`

## 工作流详解

### 1. 代码质量检查工作流

**触发时机**: 每次 Push 和 Pull Request

**执行步骤**:
1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 运行 ESLint
5. 执行 TypeScript 类型检查
6. 生成代码复杂度报告

### 2. 安全扫描工作流

**包含检查**:
- npm audit (依赖漏洞)
- Snyk (第三方库安全)
- CodeQL (代码安全分析)

### 3. 测试工作流

**测试矩阵**:
- Node.js 18.x 和 20.x
- 单元测试
- 集成测试
- 覆盖率报告

### 4. 构建和部署工作流

**环境**:
- **开发环境**: 自动部署到 Vercel Preview
- **预发布环境**: 手动触发
- **生产环境**: 保护分支部署

## 环境变量管理

### GitHub Secrets 配置清单

\`\`\`yaml
必需的 Secrets:
  - VERCEL_TOKEN
  - VERCEL_ORG_ID
  - VERCEL_PROJECT_ID
  - DATABASE_URL
  - REDIS_URL
  - JWT_SECRET
  - DOCKER_USERNAME
  - DOCKER_PASSWORD

可选的 Secrets:
  - SNYK_TOKEN
  - CODECOV_TOKEN
  - SLACK_WEBHOOK_URL
  - SENTRY_AUTH_TOKEN
\`\`\`

## 部署策略

### 分支策略

- `main`: 开发分支，自动部署到预览环境
- `production`: 生产分支，需要审批后部署
- `feature/*`: 功能分支，创建 PR 时预览部署

### 部署流程

\`\`\`bash
# 开发环境部署
git push origin main

# 生产环境部署
git checkout production
git merge main
git push origin production
\`\`\`

## 监控和告警

### 集成服务

1. **Sentry**: 错误追踪
2. **Vercel Analytics**: 性能监控
3. **Slack**: 部署通知
4. **Codecov**: 代码覆盖率

### 告警规则

- 构建失败立即通知
- 测试覆盖率低于 80% 警告
- 安全漏洞检测到高危问题

## 最佳实践

1. **提交前本地检查**
   \`\`\`bash
   pnpm lint
   pnpm type-check
   pnpm test
   \`\`\`

2. **使用 Husky 预提交钩子**
   \`\`\`bash
   pnpm prepare
   \`\`\`

3. **保持依赖更新**
   \`\`\`bash
   pnpm update --latest
   \`\`\`

4. **定期审查 GitHub Actions 日志**

---

**文档维护者**: YanYu  
**最后更新**: 2024-01-20
