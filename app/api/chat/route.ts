import { NextResponse } from "next/server";
import { chatWithFallback } from "@/lib/deepseek";
import { hasApiKey } from "@/lib/providers";

export const dynamic = "force-dynamic";

const SYSTEM =
  "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的 AI 助手，嵌在团队的内容生产工作台里。你熟悉手机/电脑/相机/手表/眼镜/汽车等数码品类，擅长选题判断、资料梳理、信息纠错、脚本润色。回答要专业、简洁、口语化，避免参数朗读和空话。如果涉及没把握的事实，提醒对方实测核实。";

const FALLBACK_REPLY =
  "AI 助手暂时连不上（可能没配 Key 或网络问题）。不过工作台的核心功能都能用：去「选题生产」跑选题→脚本，去「评论区反哺」挖选题，去「横评表生成」搭对比表。等会儿再试试我。";

export async function POST(req: Request) {
  let messages: { role: "user" | "assistant"; content: string }[] = [];
  let pageContext = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages.slice(-8) : [];
    pageContext = typeof body?.pageContext === "string" ? body.pageContext : "";
  } catch {
    messages = [];
  }

  if (!hasApiKey() || messages.length === 0) {
    return NextResponse.json({ data: FALLBACK_REPLY, degraded: true });
  }

  try {
    const sys = pageContext ? `${SYSTEM}\n当前页面上下文：${pageContext}` : SYSTEM;
    const { content, providerUsed } = await chatWithFallback(
      [{ role: "system", content: sys }, ...messages],
      20000
    );
    return NextResponse.json({ data: content, degraded: false, message: `由 ${providerUsed} 回答` });
  } catch (e) {
    console.error("[api/chat] 降级:", (e as Error).message);
    return NextResponse.json({ data: FALLBACK_REPLY, degraded: true });
  }
}
