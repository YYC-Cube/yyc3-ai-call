# ==================== 多阶段构建 - YYC³ AI Intelligent Calling ====================

# 阶段1: 依赖安装
FROM node:20-alpine AS deps
LABEL maintainer="YanYu <193180580+YY-Nexus@users.noreply.github.com>"
LABEL app="YYC³ AI Intelligent Calling"
LABEL version="1.0.0"

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY .npmrc* ./

# 安装依赖
RUN pnpm install --frozen-lockfile --prod=false

# 阶段2: 构建应用
FROM node:20-alpine AS builder
WORKDIR /app

# 复制 pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建参数
ARG NEXT_PUBLIC_APP_NAME="YYC³ AI Intelligent Calling"
ARG BUILD_DATE
ARG VCS_REF

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN pnpm build

# 阶段3: 生产运行
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置文件权限
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server.js"]
