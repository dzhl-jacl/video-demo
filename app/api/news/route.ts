import { NextResponse } from "next/server";
import { fetchAllNews } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const mode = new URL(req.url).searchParams.get("mode") === "reader" ? "reader" : "topic";
  try {
    const { items, degraded } = await fetchAllNews(mode);
    return NextResponse.json({
      data: items,
      degraded,
      message: degraded ? "实时源不可用，已使用内置样本数据" : undefined,
    });
  } catch (e) {
    console.error("[api/news] 兜底失败:", (e as Error).message);
    const { getSeedNews } = await import("@/data/seed-news");
    return NextResponse.json({
      data: getSeedNews(),
      degraded: true,
      message: "采集异常，已使用内置样本数据",
    });
  }
}
