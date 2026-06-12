// Agent 注册表：整条内容产线的单一数据源。
// /workflow（运行视图）、/agents（组件视图）都读这里，避免硬编码重复。
// 每个 Agent 是产线上的一个可编排节点，串起来就是「采集→选题→核查→脚本→分镜→口播→文案」。

export type AgentId =
  | "collect"
  | "topic"
  | "verify"
  | "script"
  | "shot"
  | "spoken"
  | "copy";

export interface AgentDef {
  id: AgentId;
  name: string;
  emoji: string;
  role: string; // 一句话角色定位
  input: string; // 吃什么
  output: string; // 产出什么
  api: string; // 对应服务端路由
  model: string; // 所用模型 / 调用链
  promptSummary: string; // Prompt 核心意图摘要
  fallback: string; // 降级策略（容错铁律）
}

export const AGENTS: AgentDef[] = [
  {
    id: "collect",
    name: "采集 Agent",
    emoji: "📡",
    role: "多源资讯雷达，盯紧数码圈一手动态",
    input: "RSS 多源（36氪/IT之家/少数派/爱范儿）",
    output: "去重、按新鲜度排序的资讯流",
    api: "/api/news",
    model: "规则引擎（不耗 token）",
    promptSummary: "无需 LLM：抓取 + GBK 解码 + 48h 新鲜度过滤 + 选题价值打标签。",
    fallback: "任一源失败/断网自动回落 data/seed-news 内置真实样本，永不空屏。",
  },
  {
    id: "topic",
    name: "选题 Agent",
    emoji: "🎯",
    role: "资深选题策划，聚类去重 + 选题价值打分",
    input: "资讯流（雷达收藏或采集）",
    output: "Top 选题卡（亮点/争议点/受众/热度/测评角度）",
    api: "/api/topics",
    model: "DeepSeek 降级链",
    promptSummary: "以硬核测评团队视角，从资讯里挑最值得做的选题，标出需实测验证的点。",
    fallback: "AI 超时/报错回落 FALLBACK_TOPICS 示例选题，演示不中断。",
  },
  {
    id: "verify",
    name: "核查 Agent",
    emoji: "🔍",
    role: "事实核查员，逐条标注待验证声明",
    input: "脚本初稿",
    output: "事实声明清单 + 可信度标注 + 交叉验证检索词",
    api: "/api/verify",
    model: "DeepSeek 降级链",
    promptSummary: "逐句抽取参数/跑分/价格/首发等事实声明，标可信/待核实/存疑并给验证关键词。",
    fallback: "AI 不可用时回落预置核查清单，纠错能力始终可见。",
  },
  {
    id: "script",
    name: "脚本 Agent",
    emoji: "✍️",
    role: "资深脚本编剧，写带「活人感」的中长测评稿",
    input: "选题卡",
    output: "脚本初稿（钩子/分段口播/结尾，带信源标注）",
    api: "/api/script",
    model: "DeepSeek 降级链",
    promptSummary: "第一人称真实体验、拒绝参数朗读，注入「胜利文绉绉」调性，关键事实标信源。",
    fallback: "AI 超时/报错回落 FALLBACK_SCRIPT 示例脚本，演示不中断。",
  },
  {
    id: "shot",
    name: "分镜 Agent",
    emoji: "🎬",
    role: "分镜师，把口播稿拆成可拍摄的镜头表",
    input: "脚本初稿",
    output: "分镜表（镜头/画面/字幕/B-roll 建议）",
    api: "/api/shotlist",
    model: "DeepSeek 降级链",
    promptSummary: "按段落拆镜头，给画面内容、字幕要点和 B-roll 素材建议，方便后期落地。",
    fallback: "AI 不可用时回落示例分镜表，交付链路不中断。",
  },
  {
    id: "spoken",
    name: "口播 Agent",
    emoji: "🎙️",
    role: "口播稿打磨，把脚本变成顺口能念的稿子",
    input: "脚本初稿",
    output: "口语化逐字口播稿",
    api: "/api/spoken",
    model: "DeepSeek 降级链",
    promptSummary: "把书面脚本改写成适合对着镜头念的口语稿，保留节奏与停顿提示。",
    fallback: "AI 不可用时回落示例口播稿。",
  },
  {
    id: "copy",
    name: "文案 Agent",
    emoji: "📢",
    role: "发布运营，产出标题/简介/标签全套",
    input: "脚本初稿",
    output: "标题候选 x5 + 视频简介 + 话题标签",
    api: "/api/publish",
    model: "DeepSeek 降级链",
    promptSummary: "据脚本生成有钩子的标题候选、B 站简介和话题标签，直接可发布。",
    fallback: "AI 不可用时回落示例发布文案。",
  },
];

export function getAgent(id: AgentId): AgentDef | undefined {
  return AGENTS.find((a) => a.id === id);
}
