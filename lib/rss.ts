import { XMLParser } from "fast-xml-parser";
import { RSS_SOURCES } from "@/data/sources";
import { getSeedNews } from "@/data/seed-news";
import { fetchWithTimeout } from "@/lib/http";
import { parseTime } from "@/lib/time";
import { inferCategory } from "@/lib/category";
import type { NewsItem } from "@/lib/types";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

// 新鲜度窗口：默认只保留近 48 小时；不足时放宽到最近 N 条
const FRESH_WINDOW_MS = 48 * 3600 * 1000;
const MIN_ITEMS = 12;

export const SEED_NEWS: NewsItem[] = getSeedNews();

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseFeed(xml: string, sourceName: string, category: string): NewsItem[] {
  const doc = parser.parse(xml);
  const items = toArray(doc?.rss?.channel?.item ?? doc?.feed?.entry);
  return items.slice(0, 20).map((item: any, idx: number) => {
    const link =
      typeof item.link === "string" ? item.link : item.link?.["@_href"] ?? "";
    const rawSummary = item.description ?? item.summary ?? item.content ?? "";
    const publishedAt = String(item.pubDate ?? item.updated ?? item.published ?? "");
    const title = stripHtml(String(item.title ?? "")) || "无标题";
    const summary = stripHtml(String(rawSummary)).slice(0, 160);
    // 按标题+摘要推断产品品类，供雷达品类 Tab 筛选；推不出则回落来源分类
    const inferred = inferCategory(`${title} ${summary}`);
    return {
      id: `${sourceName}-${idx}-${parseTime(publishedAt) || Date.now()}`,
      title,
      source: sourceName,
      url: String(link),
      publishedAt,
      summary,
      category: inferred === "其他" ? category : inferred,
    };
  });
}

// 过滤近 48h 并按时间倒序；若新鲜内容不足，放宽为按时间排序后取最近 MIN_ITEMS 条
function applyFreshness(items: NewsItem[]): NewsItem[] {
  const now = Date.now();
  const sorted = [...items].sort(
    (a, b) => parseTime(b.publishedAt) - parseTime(a.publishedAt)
  );
  const fresh = sorted.filter((n) => {
    const t = parseTime(n.publishedAt);
    return t > 0 && now - t <= FRESH_WINDOW_MS;
  });
  if (fresh.length >= MIN_ITEMS) return fresh;
  return sorted.slice(0, Math.max(MIN_ITEMS, fresh.length));
}

// 阅读模式：给人看的资讯雷达，按时间倒序返回全部（不收窄到选题用量）
function applyReaderOrder(items: NewsItem[]): NewsItem[] {
  return [...items].sort(
    (a, b) => parseTime(b.publishedAt) - parseTime(a.publishedAt)
  );
}

async function fetchOneSource(name: string, url: string, category: string): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(url, {
      timeoutMs: 5000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TechTopicStudio/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await decodeResponse(res);
    return parseFeed(xml, name, category);
  } catch (e) {
    console.error(`[rss] 拉取失败 ${name}:`, (e as Error).message);
    return [];
  }
}

// 按响应实际编码解码：部分源（如中关村在线）是 GBK/gb18030，按 UTF-8 读会乱码。
async function decodeResponse(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "";
  let charset = /charset=([\w-]+)/i.exec(contentType)?.[1]?.toLowerCase() ?? "";

  // content-type 未声明时，从 XML 声明里探测
  if (!charset) {
    const head = new TextDecoder("utf-8").decode(buf.slice(0, 200));
    charset = /encoding=["']([\w-]+)["']/i.exec(head)?.[1]?.toLowerCase() ?? "utf-8";
  }
  // gb2312/gbk 统一用 gb18030 解码（超集，兼容性最好）
  const normalized = charset === "gb2312" || charset === "gbk" ? "gb18030" : charset;
  try {
    return new TextDecoder(normalized).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

export async function fetchAllNews(
  mode: "topic" | "reader" = "topic"
): Promise<{ items: NewsItem[]; degraded: boolean }> {
  const results = await Promise.all(
    RSS_SOURCES.map((s) => fetchOneSource(s.name, s.url, s.category))
  );
  const items = results.flat();

  // 任何情况下都不空屏：全部失败则回落到内置真实样本
  if (items.length === 0) {
    console.error("[rss] 所有源均失败，回落 seed 数据");
    return { items: SEED_NEWS, degraded: true };
  }
  // reader 模式给人看，返回更多条按时间倒序；topic 模式收窄到选题用量
  const ordered = mode === "reader" ? applyReaderOrder(items) : applyFreshness(items);
  return { items: ordered, degraded: false };
}
