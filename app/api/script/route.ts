import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildScriptPrompt } from "@/lib/prompts";
import { FALLBACK_SCRIPT } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { Topic, VideoScript } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let topic: Topic | null = null;
  try {
    const body = await req.json();
    topic = body?.topic ?? null;
  } catch {
    topic = null;
  }

  if (!hasApiKey() || !topic) {
    return NextResponse.json({
      data: FALLBACK_SCRIPT,
      degraded: true,
      message: hasApiKey() ? "无选题输入，已使用示例脚本" : "未配置 API Key，已使用示例脚本",
    });
  }

  try {
    const { system, user } = buildScriptPrompt(topic);
    let script: VideoScript | null = null;
    let providerUsed = "";
    // 偶发：大模型返回非纯 JSON 导致解析失败，自动重试一次（第二次强调只输出 JSON）
    for (let attempt = 0; attempt < 2 && !script; attempt++) {
      const userMsg =
        attempt === 0 ? user : `${user}\n\n注意：只输出合法 JSON 本身，不要任何解释文字或 \`\`\` 代码块包裹。`;
      const r = await chatWithFallback([
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ]);
      providerUsed = r.providerUsed;
      const parsed = extractJson<VideoScript>(r.content);
      if (parsed && parsed.sections) script = parsed;
    }
    if (!script) throw new Error("解析脚本 JSON 失败");
    return NextResponse.json({ data: script, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/script] 降级到静态脚本:", (e as Error).message);
    return NextResponse.json({
      data: { ...FALLBACK_SCRIPT, topicTitle: topic.title },
      degraded: true,
      message: "AI 暂不可用，已使用示例脚本",
    });
  }
}
