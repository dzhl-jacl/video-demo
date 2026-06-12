import { parseTime } from "@/lib/time";
import { inferCategory } from "@/lib/category";

// 选题价值标签：站在测评团队成员视角，回答「这条资讯能做成什么选题」，
// 而非「它属于哪类硬件」。这是创作者真正用来筛选的维度。
export type ValueTag =
  | "新品首发"
  | "技术硬核"
  | "争议打假"
  | "价格真香"
  | "前瞻爆料"
  | "横评盘点";

export const VALUE_TAGS: ValueTag[] = [
  "新品首发",
  "技术硬核",
  "争议打假",
  "价格真香",
  "前瞻爆料",
  "横评盘点",
];

const RULES: { tag: ValueTag; keywords: string[] }[] = [
  { tag: "争议打假", keywords: ["翻车", "质疑", "实测", "打脸", "虚标", "缩水", "投诉", "维权", "回应", "争议", "塌房", "夸大", "注水", "致命", "召回", "故障", "拉胯"] },
  { tag: "前瞻爆料", keywords: ["曝光", "爆料", "谍照", "传闻", "预计", "或将", "有望", "下一代", "即将", "渲染图", "疑似", "前瞻", "剧透"] },
  { tag: "横评盘点", keywords: ["横评", "对比", "盘点", "榜单", "排行", "哪款", "怎么选", "选购", "年度", "全网", "汇总"] },
  { tag: "价格真香", keywords: ["降价", "上市", "售价", "价格", "开售", "首销", "性价比", "补贴", "优惠", "起售", "万元", "元起"] },
  { tag: "技术硬核", keywords: ["芯片", "soc", "架构", "传感器", "电池", "工艺", "纳米", "算力", "技术", "拆解", "原理", "影像", "续航", "散热", "屏幕", "快充", "固态"] },
  { tag: "新品首发", keywords: ["发布", "推出", "亮相", "正式", "新品", "首发", "登场", "面世", "开箱", "全新"] },
];

export interface NewsTags {
  valueTags: ValueTag[];
  category: string;
  isControversial: boolean;
  isFresh: boolean; // 48h 内首发窗口
}

export function tagNews(
  title: string,
  summary: string,
  publishedAt: string,
  now: number = Date.now()
): NewsTags {
  const text = `${title} ${summary}`.toLowerCase();
  const valueTags = RULES.filter((r) => r.keywords.some((k) => text.includes(k))).map((r) => r.tag);
  // 没命中任何价值标签时，至少给个保底（多数资讯本质是新品/资讯）
  if (valueTags.length === 0) valueTags.push("新品首发");

  const t = parseTime(publishedAt);
  const isFresh = t > 0 && now - t <= 48 * 3600 * 1000;

  return {
    valueTags,
    category: inferCategory(text),
    isControversial: valueTags.includes("争议打假"),
    isFresh,
  };
}
