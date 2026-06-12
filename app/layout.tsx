import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Assistant } from "@/components/Assistant";

export const metadata: Metadata = {
  title: "硬核测评工作台 | 科技数码内容生产平台",
  description: "竞品数据看板 + 多源资讯选题 + 一键生成带信源标注的脚本初稿",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
        <Assistant />
      </body>
    </html>
  );
}
