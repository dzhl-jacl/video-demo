export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  category?: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  reviewAngle: string;
  reason: string;
  highlights: string[];
  controversies: string[];
  audience: string;
  heatScore: number;
  sourceUrls: string[];
}

export interface ScriptSection {
  heading: string;
  content: string;
  sources: string[];
}

export interface VideoScript {
  topicTitle: string;
  hook: string;
  sections: ScriptSection[];
  outro: string;
}

export type PipelineStage = "news" | "topics" | "script";

export interface ApiResult<T> {
  data: T;
  degraded: boolean;
  message?: string;
}

export interface BiliVideo {
  bvid: string;
  title: string;
  play: number;
  danmaku: number;
  comment: number;
  duration: string;
  created: number;
  category?: string;
}

export interface CompetitorStat {
  name: string;
  mid: number;
  follower: number;
  videoCount: number;
  avgPlay: number;
  maxPlay: number;
  topVideos: BiliVideo[];
  followerHistory: { date: string; value: number }[];
}

export interface HotspotAnalysis {
  titlePatterns: string[];
  hotAngles: string[];
  durationInsight: string;
  commonalities: string[];
  differentiation: { idea: string; category: string; reason: string }[];
}

export interface NewsAnalysis {
  worthMaking: string;
  angles: string[];
  verifyPoints: string[];
  suggestedTitle: string;
}

export type ClaimVerdict = "可信" | "待核实" | "存疑";

export interface FactCheckItem {
  claim: string;
  verdict: ClaimVerdict;
  reason: string;
  searchQueries: string[];
}

export interface FactCheck {
  topicTitle: string;
  items: FactCheckItem[];
  summary: string;
}

export interface ShotItem {
  scene: string;
  visual: string;
  subtitle: string;
  broll: string;
}

export interface ShotList {
  topicTitle: string;
  shots: ShotItem[];
}

export interface SpokenScript {
  topicTitle: string;
  content: string;
}

export interface PublishKit {
  titles: string[];
  description: string;
  tags: string[];
}

export type CommentScope = "self" | "competitor";

export type CommentCategory =
  | "纠错质疑"
  | "选题需求"
  | "争议点"
  | "做得好"
  | "做得不好";

export interface CommentItem {
  text: string;
  likes: number;
  category: CommentCategory;
  // 仅「选题需求」类会带：可直接成卡的选题方向
  topicIdea?: string;
}

export interface CommentInsight {
  scope: CommentScope;
  videoTitle: string;
  upName: string;
  summary: string;
  items: CommentItem[];
}

export interface CompareRow {
  dimension: string; // 对比维度（如 影像 / 续航 / 价格）
  values: string[]; // 与 products 顺序对应的各产品表现
  verifyNote?: string; // 需实测核实的提示（可空）
}

export interface CompareTable {
  products: string[];
  rows: CompareRow[];
  verdict: string; // 一句话横评结论 / 选购建议
}
