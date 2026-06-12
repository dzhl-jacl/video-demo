import { relativeTime } from "@/lib/time";
import type { NewsItem, Topic, VideoScript } from "@/lib/types";

// 「胜利文绉绉」团队调性样本：注入脚本/口播 prompt，避免通稿腔，让产物像团队里人写的。
export const TEAM_TONE = `团队风格基因（务必贯穿全文）：
- 开场钩子：用一个真实疑问或反差切入，像跟朋友聊天，绝不念产品参数。例：「厂商说续航翻倍，但我充了一晚上发现……」
- 活人感：第一人称、有情绪、有吐槽、有「我」的真实使用细节，可以有口头禅和停顿。
- 硬核但说人话：把技术原理讲清楚讲生动，用类比代替术语堆砌。
- 纠错基因：对厂商宣传保持警惕，凡是没实测过的数字都明确说「这个待我们实测」，不当复读机。
- 拒绝说教：不居高临下科普，给观点和建议，把判断权留给观众。`;

export function buildTopicPrompt(
  news: NewsItem[],
  preferredCategory?: string
): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的资深选题策划。团队做的是中长视频硬件测评，覆盖手机、电脑、相机、智能手表、智能眼镜、新能源汽车等品类。你们拒绝枯燥的参数朗读和高高在上的说教，主打真实上手体验 + 硬核技术解读。\n你的任务：从一批数码新品资讯中聚类去重，筛选出最值得做成测评视频的选题，并明确每个选题的产品品类与测评切入角度（如开箱首测、横向对比、长期长测、技术拆解、避坑指南、真实场景实测）。优先选择最近发布的热点（资讯前的时间标记越新越优先），保持纠错意识，把厂商宣传里不确定、需要实测验证的点单独标出。只输出 JSON，不要任何多余文字。";

  const newsText = news
    .map(
      (n, i) =>
        `${i + 1}. (${relativeTime(n.publishedAt)})[${n.source}|${n.category ?? ""}] ${n.title}｜${n.summary}｜来源:${n.url}`
    )
    .join("\n");

  const user = `以下是今日采集的数码新品与行业资讯：
${newsText}
${preferredCategory ? `\n【偏好提示】请优先考虑「${preferredCategory}」品类相关的选题（如有合适资讯），但仍以资讯质量和热度为准。\n` : ""}
请聚类去重后，输出 3 个最值得做的硬件测评视频选题。严格按以下 JSON 数组格式输出：
[
  {
    "id": "topic-1",
    "title": "选题标题（有钩子、适合中长测评视频）",
    "category": "产品品类（手机/电脑/相机/手表/眼镜/汽车 之一）",
    "reviewAngle": "测评切入角度（开箱首测/横向对比/长期长测/技术拆解/避坑指南/场景实测 之一）",
    "reason": "推荐理由（为什么值得做、热度与争议来源）",
    "highlights": ["测评看点1", "看点2", "看点3"],
    "controversies": ["厂商宣传中需实测验证或存疑的点1", "点2"],
    "audience": "目标受众",
    "heatScore": 85,
    "sourceUrls": ["相关资讯来源链接"]
  }
]`;

  return { system, user };
}

export function buildScriptPrompt(topic: Topic): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的资深脚本编剧，擅长中长视频。风格要求：第一人称真实体验、口语化有「活人感」、把复杂技术讲清楚讲生动，坚决拒绝参数朗读和空洞说教。关键事实与厂商宣传必须标注信息来源，便于后期人工核实纠错。只输出 JSON，不要多余文字。\n\n" +
    TEAM_TONE;

  const user = `请为以下硬件测评选题撰写中长视频脚本初稿：
标题：${topic.title}
品类：${topic.category}
测评角度：${topic.reviewAngle}
推荐理由：${topic.reason}
测评看点：${topic.highlights.join("、")}
需实测验证的点：${topic.controversies.join("、")}
目标受众：${topic.audience}
可用信源：${topic.sourceUrls.join("、")}

严格按以下 JSON 格式输出（sections 建议 3-4 段，覆盖：开箱/外观、核心体验实测、技术解读、值不值得买）：
{
  "topicTitle": "${topic.title}",
  "hook": "开场钩子（15秒内用真实疑问或反差抓住观众）",
  "sections": [
    { "heading": "分段标题", "content": "第一人称口播稿，有真实体验细节", "sources": ["该段引用的信源链接"] }
  ],
  "outro": "结尾引导互动的话（抛出一个值得讨论的问题）"
}`;

  return { system, user };
}

export function buildNewsAnalysisPrompt(
  title: string,
  summary: string,
  source: string
): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的资深选题策划。给你一条资讯，你要从测评创作者视角判断它能不能做、怎么做。重点突出团队擅长的硬核技术解读和纠错能力。只输出 JSON，不要多余文字。";

  const user = `资讯来源：${source}
标题：${title}
摘要：${summary}

请判断这条资讯的选题价值，严格按以下 JSON 输出：
{
  "worthMaking": "一句话判断值不值得做、做成什么形态（如开箱首测/深度拆解/争议实测）",
  "angles": ["可切入的角度1", "角度2", "角度3"],
  "verifyPoints": ["需要实测核实/可能存疑的点1", "点2"],
  "suggestedTitle": "一个有钩子的视频标题建议"
}`;

  return { system, user };
}

export function buildHotspotPrompt(
  videos: { title: string; play: number; duration: string; category?: string; up: string }[]
): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的内容策略分析师。你的任务：拆解同类头部 UP 的爆款视频，提炼可复用的爆款规律，并给出我们团队可以做的差异化切入点。不要空话套话，要具体、可执行。只输出 JSON，不要多余文字。";

  const list = videos
    .map(
      (v, i) =>
        `${i + 1}. [${v.up}|${v.category ?? "数码"}|${v.duration}|播放${v.play}] ${v.title}`
    )
    .join("\n");

  const user = `以下是同类头部 UP 的高播放爆款视频样本：
${list}

请拆解这些爆款，严格按以下 JSON 输出：
{
  "titlePatterns": ["爆款标题的共性套路1（如：用疑问句制造悬念）", "套路2", "套路3"],
  "hotAngles": ["高播放的选题角度1（如：横评对比）", "角度2", "角度3"],
  "durationInsight": "时长规律的一句话总结",
  "commonalities": ["爆款共性1", "共性2", "共性3"],
  "differentiation": [
    { "idea": "我们可以做的差异化选题/切入点", "category": "品类", "reason": "为什么这是空白或能做出差异" }
  ]
}`;

  return { system, user };
}

// 把脚本结构压成纯文本，供下游核查/分镜/口播/文案 Agent 复用。
function scriptToText(script: VideoScript): string {
  const body = script.sections
    .map((s, i) => `${i + 1}. ${s.heading}\n${s.content}`)
    .join("\n");
  return `标题：${script.topicTitle}\n开场钩子：${script.hook}\n${body}\n结尾：${script.outro}`;
}

export function buildVerifyPrompt(script: VideoScript): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的事实核查员，纠错是团队的招牌能力。给你一份脚本初稿，你要逐句揪出所有事实性声明（参数、跑分、价格、首发时间、技术原理），判断可信度并给出可直接搜索的交叉验证关键词。宁可多标也不放过。只输出 JSON，不要多余文字。";

  const user = `请核查以下脚本中的事实性声明：
${scriptToText(script)}

严格按以下 JSON 输出（items 至少 4 条）：
{
  "topicTitle": "${script.topicTitle}",
  "items": [
    {
      "claim": "脚本中出现的具体事实声明原话",
      "verdict": "可信/待核实/存疑 之一",
      "reason": "为什么这样判断（厂商单方面宣传？缺乏第三方数据？）",
      "searchQueries": ["可直接拿去搜索引擎核实的检索词1", "检索词2"]
    }
  ],
  "summary": "一句话总结这份脚本的整体可信度与最该优先核实的点"
}`;

  return { system, user };
}

export function buildShotlistPrompt(script: VideoScript): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的分镜师，配合后期落地。给你一份口播脚本，你要拆成可拍摄的分镜表，每个镜头给出画面内容、字幕要点和可用的 B-roll 素材建议，务实可执行。只输出 JSON，不要多余文字。";

  const user = `请把以下脚本拆成分镜表：
${scriptToText(script)}

严格按以下 JSON 输出（shots 6-10 条，覆盖开场到结尾）：
{
  "topicTitle": "${script.topicTitle}",
  "shots": [
    {
      "scene": "镜头编号或场景名（如 开场-特写）",
      "visual": "画面内容（拍什么、机位、运镜）",
      "subtitle": "该镜头的字幕/口播要点",
      "broll": "可叠加的 B-roll 或空镜素材建议"
    }
  ]
}`;

  return { system, user };
}

export function buildSpokenPrompt(script: VideoScript): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的口播稿编辑。给你一份脚本，你要改写成 UP 主对着镜头能直接念的口语稿：句子短、有停顿、有语气，去掉书面腔，保留真实体验和吐槽感。只输出 JSON，不要多余文字。\n\n" +
    TEAM_TONE;

  const user = `请把以下脚本改写成连贯的口语化口播稿：
${scriptToText(script)}

严格按以下 JSON 输出：
{
  "topicTitle": "${script.topicTitle}",
  "content": "完整口播稿，用换行分段，可用（停顿）（加重）等提示标记节奏"
}`;

  return { system, user };
}

export function buildPublishPrompt(script: VideoScript): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的发布运营。给你一份脚本，你要产出可直接发布的标题候选、视频简介和话题标签。标题要有钩子、契合 B 站调性，避免标题党到失真。只输出 JSON，不要多余文字。";

  const user = `请为以下视频生成发布物料：
${scriptToText(script)}

严格按以下 JSON 输出：
{
  "titles": ["标题候选1", "候选2", "候选3", "候选4", "候选5"],
  "description": "视频简介（2-4 句，含看点和互动引导）",
  "tags": ["话题标签1", "标签2", "标签3", "标签4", "标签5"]
}`;

  return { system, user };
}

export function buildCommentPrompt(
  scope: "self" | "competitor",
  videoTitle: string,
  comments: { text: string; likes: number }[]
): { system: string; user: string } {
  const roleLine =
    scope === "self"
      ? "这是【我们团队自己视频】的评论区。你要帮团队做内容复盘：揪出观众指出的纰漏（喂给纠错）、夸赞认可的点（沉淀打法）、吐槽不满的点（迭代方向）、以及催更和新选题需求。"
      : "这是【对标 UP 视频】的评论区。你要从中挖掘选题机会：观众想看但还没人做的、有争议待澄清的、可被我们差异化切入的。";

  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的内容运营兼选题策划。" +
    roleLine +
    "把每条评论归类为：纠错质疑 / 选题需求 / 争议点 / 做得好 / 做得不好 之一。对「选题需求」类，额外给出可直接成卡的选题方向。只输出 JSON，不要多余文字。";

  const list = comments
    .map((c, i) => `${i + 1}. (赞${c.likes}) ${c.text}`)
    .join("\n");

  const user = `视频标题：${videoTitle}
以下是该视频的热门评论：
${list}

严格按以下 JSON 输出：
{
  "summary": "一句话总结这条视频评论区最值得团队关注的信号",
  "items": [
    {
      "text": "评论原文（可精简）",
      "likes": 赞数,
      "category": "纠错质疑/选题需求/争议点/做得好/做得不好 之一",
      "topicIdea": "仅当 category 为选题需求时填：一个可直接做的选题方向，否则留空字符串"
    }
  ]
}`;

  return { system, user };
}

export function buildComparePrompt(products: string[]): { system: string; user: string } {
  const system =
    "你是 B 站硬核数码测评团队（对标「胜利文绉绉」）的横评策划。给你几款产品，你要生成一张结构化对比表骨架，帮团队快速搭起横评框架。维度要专业且贴合该品类的核心痛点，对厂商宣传、需要实测才能下结论的维度要标注核实提示。只输出 JSON，不要多余文字。";

  const user = `请为以下产品生成横评对比表：
${products.map((p, i) => `${i + 1}. ${p}`).join("\n")}

严格按以下 JSON 输出（rows 6-9 个核心对比维度，values 数组顺序与 products 一致）：
{
  "products": ${JSON.stringify(products)},
  "rows": [
    {
      "dimension": "对比维度（如 影像/性能/续航/做工/价格/生态）",
      "values": ["产品1的表现", "产品2的表现", "..."],
      "verifyNote": "该维度需实测核实的点（厂商宣传待验证则填，否则留空字符串）"
    }
  ],
  "verdict": "一句话横评结论与分人群选购建议"
}`;

  return { system, user };
}
