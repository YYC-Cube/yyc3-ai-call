import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "YYC³ AI Intelligent Calling",
  description: "AI 驱动的智能外呼系统 - YYC³",
  generator: "v0.dev",
  keywords: ["YYC³", "AI", "Intelligent Calling", "智能外呼", "客户服务"],
  authors: [{ name: "YanYu", url: "https://github.com/YY-Nexus" }],
  creator: "YanYu",
  publisher: "YYC³",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "YYC³ AI Intelligent Calling",
    description: "AI 驱动的智能外呼系统",
    siteName: "YYC³ AI Intelligent Calling",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
