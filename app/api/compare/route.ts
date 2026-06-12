import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildComparePrompt } from "@/lib/prompts";
import { FALLBACK_COMPARE } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { CompareTable } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let products: string[] = [];
  try {
    const body = await req.json();
    products = Array.isArray(body?.products)
      ? body.products.map((p: unknown) => String(p).trim()).filter(Boolean)
      : [];
  } catch {
    products = [];
  }

  if (!hasApiKey() || products.length < 2) {
    return NextResponse.json({
      data: FALLBACK_COMPARE,
      degraded: true,
      message: hasApiKey() ? "至少输入 2 款产品，已使用示例对比表" : "未配置 API Key，已使用示例对比表",
    });
  }

  try {
    const { system, user } = buildComparePrompt(products);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const table = extractJson<CompareTable>(content);
    if (!table || !table.rows) throw new Error("解析对比表 JSON 失败");
    return NextResponse.json({ data: table, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/compare] 降级到静态对比表:", (e as Error).message);
    return NextResponse.json({
      data: { ...FALLBACK_COMPARE, products },
      degraded: true,
      message: "AI 暂不可用，已使用示例对比表",
    });
  }
}
