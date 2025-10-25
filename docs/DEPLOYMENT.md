# 🚀 部署文档 - 锦澜家居智能客服中心

## 目录

- [概述](#概述)
- [环境要求](#环境要求)
- [部署流程](#部署流程)
- [环境配置](#环境配置)
- [CI/CD 流水线](#cicd-流水线)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

---

## 概述

本文档详细说明了锦澜家居智能客服中心的部署流程和最佳实践。

### 部署架构

\`\`\`
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│ GitHub       │─────▶│   Vercel    │
│ Repository  │      │ Actions      │      │ Production  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Docker     │
                     │   Registry   │
                     └──────────────┘
\`\`\`

---

## 环境要求

### 开发环境

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: >= 2.30.0

### 生产环境

- **服务器**: Ubuntu 20.04 LTS 或更高版本
- **内存**: 最少 2GB RAM
- **存储**: 最少 20GB 可用空间
- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0

---

## 部署流程

### 1. 本地开发部署

\`\`\`bash
# 克隆仓库
git clone https://github.com/YY-Nexus/jinlan-customer-service.git
cd jinlan-customer-service

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入实际配置

# 启动开发服务器
pnpm dev
\`\`\`

访问 `http://localhost:3000`

### 2. Docker 部署

\`\`\`bash
# 构建镜像
docker build -t jinlan-customer-service:latest .

# 运行容器
docker run -d \
  --name jinlan-app \
  -p 3000:3000 \
  --env-file .env.production \
  jinlan-customer-service:latest

# 使用 Docker Compose
docker-compose up -d
\`\`\`

### 3. Vercel 部署

\`\`\`bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
\`\`\`

### 4. 自动化部署

使用部署脚本：

\`\`\`bash
# 部署到开发环境
pnpm deploy:dev

# 部署到预发布环境
pnpm deploy:staging

# 部署到生产环境
pnpm deploy:prod
\`\`\`

---

## 环境配置

### 环境变量优先级

1. `.env.local` (本地开发，不提交到 Git)
2. `.env.production` (生产环境)
3. `.env` (默认配置)

### 必需的环境变量

\`\`\`env
# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=锦澜家居智能客服中心
NEXT_PUBLIC_API_URL=https://api.example.com

# 数据库
DATABASE_URL=postgresql://user:password@host:5432/db

# 认证
JWT_SECRET=your_secret_key_here

# Redis
REDIS_URL=redis://localhost:6379
\`\`\`

### 安全注意事项

⚠️ **重要**: 
- 永远不要将 `.env.local` 或 `.env.production` 提交到版本控制
- 使用强密码和随机密钥
- 定期轮换敏感凭证
- 使用密钥管理服务（如 AWS Secrets Manager）

---

## CI/CD 流水线

### GitHub Actions 工作流

我们的 CI/CD 流水线包括以下阶段：

#### 1. 代码质量检查
- ESLint 代码规范检查
- TypeScript 类型检查
- 代码复杂度分析

#### 2. 安全扫描
- npm audit 漏洞扫描
- Snyk 依赖安全检查
- CodeQL 代码安全分析

#### 3. 测试
- 单元测试
- 集成测试
- E2E 测试
- 代码覆盖率报告

#### 4. 构建
- Next.js 应用构建
- 静态资源优化
- Docker 镜像构建

#### 5. 部署
- 预览环境部署（Pull Request）
- 生产环境部署（Production 分支）
- 部署通知

### 触发条件

- **推送到 main/production 分支**: 触发完整流水线
- **Pull Request**: 触发代码检查和预览部署
- **手动触发**: 通过 GitHub Actions UI

---

## 监控和日志

### 应用监控

- **Sentry**: 错误追踪和性能监控
- **Google Analytics**: 用户行为分析
- **Vercel Analytics**: 性能指标

### 日志管理

\`\`\`bash
# 查看 Docker 容器日志
docker-compose logs -f app

# 查看 Nginx 日志
docker-compose logs -f nginx

# 查看实时日志
tail -f /var/log/nginx/access.log
\`\`\`

### 健康检查

应用提供健康检查端点：

\`\`\`bash
# 检查应用状态
curl http://localhost:3000/api/health

# 预期响应
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "version": "1.0.0"
}
\`\`\`

---

## 故障排除

### 常见问题

#### 1. 构建失败

**问题**: `Error: Cannot find module ...`

**解决方案**:
\`\`\`bash
# 清理缓存并重新安装
rm -rf node_modules .next
pnpm install
pnpm build
\`\`\`

#### 2. 数据库连接失败

**问题**: `Error: connect ECONNREFUSED`

**解决方案**:
- 检查数据库是否运行
- 验证 `DATABASE_URL` 配置
- 检查防火墙和网络设置

#### 3. 内存不足

**问题**: `JavaScript heap out of memory`

**解决方案**:
\`\`\`bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
\`\`\`

#### 4. Docker 容器无法启动

**问题**: 容器启动后立即退出

**解决方案**:
\`\`\`bash
# 查看容器日志
docker logs jinlan-app

# 检查环境变量
docker exec jinlan-app env

# 重新构建镜像
docker-compose build --no-cache
\`\`\`

### 回滚策略

如果生产部署出现问题：

\`\`\`bash
# Vercel 回滚到上一个版本
vercel rollback

# Docker 回滚到上一个镜像
docker-compose down
docker tag jinlan-customer-service:previous jinlan-customer-service:latest
docker-compose up -d
\`\`\`

---

## 性能优化

### 1. 构建优化

\`\`\`javascript
// next.config.mjs
const nextConfig = {
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
}
\`\`\`

### 2. 缓存策略

- 静态资源: 365 天缓存
- API 响应: Redis 缓存
- 页面: ISR 增量静态生成

### 3. CDN 配置

使用 Vercel Edge Network 或 Cloudflare 进行全球加速。

---

## 安全清单

在部署前确认：

- [ ] 所有敏感信息已从代码中移除
- [ ] 环境变量已正确配置
- [ ] HTTPS 已启用
- [ ] 安全头部已配置
- [ ] CORS 策略已设置
- [ ] 速率限制已启用
- [ ] 日志记录已配置
- [ ] 备份策略已实施

---

## 联系支持

如遇到部署问题，请联系：

- **技术支持**: support@jinlan.com
- **GitHub Issues**: [项目 Issues 页面](https://github.com/YY-Nexus/jinlan-customer-service/issues)
- **文档**: [完整文档](https://docs.jinlan.com)

---

**最后更新**: 2024-01-20  
**版本**: 1.0.0
