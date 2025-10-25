#!/usr/bin/env tsx

/**
 * YYC³ AI Intelligent Calling - 自动化部署脚本
 *
 * 支持多环境部署：development, staging, production
 *
 * 使用方法:
 *   pnpm deploy:dev      # 部署到开发环境
 *   pnpm deploy:staging  # 部署到预发布环境
 *   pnpm deploy:prod     # 部署到生产环境
 */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

// ==================== 配置 ====================
interface DeployConfig {
  environment: "development" | "staging" | "production"
  appName: string
  version: string
}

const config: DeployConfig = {
  environment: (process.argv[2] as any) || "development",
  appName: "YYC³ AI Intelligent Calling",
  version: "1.0.0",
}

// ==================== 颜色输出 ====================
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step: string) {
  log(`\n${"=".repeat(60)}`, "cyan")
  log(`  ${step}`, "bright")
  log("=".repeat(60), "cyan")
}

function logSuccess(message: string) {
  log(`✅ ${message}`, "green")
}

function logError(message: string) {
  log(`❌ ${message}`, "red")
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, "yellow")
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, "blue")
}

// ==================== 工具函数 ====================
function exec(command: string, silent = false): string {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    })
    return output
  } catch (error: any) {
    if (!silent) {
      logError(`命令执行失败: ${command}`)
      logError(error.message)
    }
    throw error
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8")
}

// ==================== 验证函数 ====================
function validateEnvironment() {
  logStep("验证部署环境")

  // 检查 Node.js 版本
  const nodeVersion = process.version
  logInfo(`Node.js 版本: ${nodeVersion}`)

  if (!nodeVersion.startsWith("v18") && !nodeVersion.startsWith("v20")) {
    logWarning("推荐使用 Node.js 18 或 20 LTS 版本")
  } else {
    logSuccess("Node.js 版本符合要求")
  }

  // 检查 pnpm
  try {
    const pnpmVersion = exec("pnpm --version", true).trim()
    logInfo(`pnpm 版本: ${pnpmVersion}`)
    logSuccess("pnpm 已安装")
  } catch {
    logError("pnpm 未安装，请运行: npm install -g pnpm")
    process.exit(1)
  }

  // 检查环境变量文件
  const envFile = `.env.${config.environment === "development" ? "local" : config.environment}`
  if (!fileExists(envFile)) {
    logWarning(`环境变量文件 ${envFile} 不存在`)
    logInfo(`请从 ${envFile}.example 复制并配置`)
  } else {
    logSuccess(`环境变量文件 ${envFile} 已找到`)
  }

  // 检查 Git 状态
  try {
    const gitStatus = exec("git status --porcelain", true)
    if (gitStatus && config.environment === "production") {
      logWarning("工作目录有未提交的更改")
      logInfo("生产环境部署建议提交所有更改")
    }
  } catch {
    logWarning("无法检查 Git 状态")
  }
}

function validateDependencies() {
  logStep("验证项目依赖")

  if (!fileExists("package.json")) {
    logError("package.json 文件不存在")
    process.exit(1)
  }

  const packageJson = JSON.parse(readFile("package.json"))
  logInfo(`项目: ${packageJson.name} v${packageJson.version}`)
  logSuccess("package.json 验证通过")

  // 检查 node_modules
  if (!fileExists("node_modules")) {
    logWarning("node_modules 目录不存在，需要安装依赖")
    return false
  }

  logSuccess("依赖已安装")
  return true
}

// ==================== 部署步骤 ====================
function installDependencies() {
  logStep("安装项目依赖")
  exec("pnpm install --frozen-lockfile")
  logSuccess("依赖安装完成")
}

function runLinting() {
  logStep("代码质量检查")

  try {
    exec("pnpm lint")
    logSuccess("ESLint 检查通过")
  } catch (error) {
    logError("ESLint 检查失败")
    if (config.environment === "production") {
      logError("生产环境部署中止")
      process.exit(1)
    } else {
      logWarning("继续部署，但请修复代码问题")
    }
  }
}

function runTypeCheck() {
  logStep("TypeScript 类型检查")

  try {
    exec("pnpm type-check")
    logSuccess("TypeScript 类型检查通过")
  } catch (error) {
    logError("TypeScript 类型检查失败")
    if (config.environment === "production") {
      logError("生产环境部署中止")
      process.exit(1)
    } else {
      logWarning("继续部署，但请修复类型错误")
    }
  }
}

function runTests() {
  logStep("运行测试")

  if (config.environment === "development") {
    logInfo("开发环境跳过测试")
    return
  }

  try {
    exec("pnpm test")
    logSuccess("所有测试通过")
  } catch (error) {
    logError("测试失败")
    if (config.environment === "production") {
      logError("生产环境部署中止")
      process.exit(1)
    }
  }
}

function buildApplication() {
  logStep("构建应用")

  const buildEnv = config.environment === "development" ? "development" : "production"
  exec(`NODE_ENV=${buildEnv} pnpm build`)

  logSuccess("应用构建完成")
}

function deployToVercel() {
  logStep(`部署到 Vercel (${config.environment})`)

  const prodFlag = config.environment === "production" ? "--prod" : ""

  try {
    exec(`vercel ${prodFlag}`)
    logSuccess(`成功部署到 Vercel ${config.environment} 环境`)
  } catch (error) {
    logError("Vercel 部署失败")
    throw error
  }
}

function buildDockerImage() {
  logStep("构建 Docker 镜像")

  const tag = `yyc-ai-calling:${config.environment}`
  const latestTag = config.environment === "production" ? "yyc-ai-calling:latest" : ""

  exec(`docker build -t ${tag} ${latestTag ? `-t ${latestTag}` : ""} .`)

  logSuccess(`Docker 镜像构建完成: ${tag}`)
}

function pushDockerImage() {
  logStep("推送 Docker 镜像")

  const tag = `yyc-ai-calling:${config.environment}`

  try {
    exec(`docker push ${tag}`)

    if (config.environment === "production") {
      exec("docker push yyc-ai-calling:latest")
    }

    logSuccess("Docker 镜像推送完成")
  } catch (error) {
    logWarning("Docker 镜像推送失败，可能需要登录")
    logInfo("运行: docker login")
  }
}

// ==================== 部署报告 ====================
function generateDeploymentReport() {
  logStep("生成部署报告")

  const report = {
    appName: config.appName,
    version: config.version,
    environment: config.environment,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    gitCommit: exec("git rev-parse HEAD", true).trim(),
    gitBranch: exec("git rev-parse --abbrev-ref HEAD", true).trim(),
  }

  const reportPath = path.join(process.cwd(), "deployment-report.json")
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  logInfo(`部署报告已生成: ${reportPath}`)
  log("\n" + JSON.stringify(report, null, 2), "cyan")
  logSuccess("部署报告生成完成")
}

// ==================== 主流程 ====================
async function main() {
  console.clear()
  log("\n" + "=".repeat(60), "bright")
  log(`  🚀 ${config.appName}`, "bright")
  log(`  📦 部署环境: ${config.environment.toUpperCase()}`, "bright")
  log(`  📅 ${new Date().toLocaleString("zh-CN")}`, "bright")
  log("=".repeat(60) + "\n", "bright")

  const startTime = Date.now()

  try {
    // 验证阶段
    validateEnvironment()
    const depsInstalled = validateDependencies()

    // 安装依赖
    if (!depsInstalled) {
      installDependencies()
    }

    // 质量检查
    runLinting()
    runTypeCheck()
    runTests()

    // 构建
    buildApplication()

    // 部署
    if (config.environment === "production" || config.environment === "staging") {
      // Vercel 部署
      deployToVercel()

      // Docker 部署
      buildDockerImage()
      pushDockerImage()
    } else {
      logInfo("开发环境，跳过部署步骤")
    }

    // 生成报告
    generateDeploymentReport()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    log("\n" + "=".repeat(60), "green")
    log(`  ✅ 部署成功！`, "green")
    log(`  ⏱️  总耗时: ${duration}秒`, "green")
    log("=".repeat(60) + "\n", "green")
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    log("\n" + "=".repeat(60), "red")
    log(`  ❌ 部署失败！`, "red")
    log(`  ⏱️  耗时: ${duration}秒`, "red")
    log(`  📝 错误信息: ${error.message}`, "red")
    log("=".repeat(60) + "\n", "red")

    process.exit(1)
  }
}

// 运行部署
main()
