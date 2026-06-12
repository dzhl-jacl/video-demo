import type {
  VideoScript,
  FactCheck,
  ShotList,
  SpokenScript,
  PublishKit,
  CompareTable,
} from "@/lib/types";

// 把各 Agent 产物序列化成 Markdown，供「一键复制 / 导出」。
// 这是产品从「展示品」变成「日常能用工具」的关键一步。

export function scriptToMarkdown(s: VideoScript): string {
  const secs = s.sections
    .map((sec) => {
      const src = sec.sources.length ? `\n\n> 信源：${sec.sources.join(" / ")}` : "";
      return `## ${sec.heading}\n\n${sec.content}${src}`;
    })
    .join("\n\n");
  return `# ${s.topicTitle}\n\n**开场钩子**\n\n${s.hook}\n\n${secs}\n\n**结尾互动**\n\n${s.outro}\n`;
}

export function factCheckToMarkdown(f: FactCheck): string {
  const items = f.items
    .map(
      (it, i) =>
        `### ${i + 1}. [${it.verdict}] ${it.claim}\n\n- 判断依据：${it.reason}\n- 验证检索词：${it.searchQueries.join(" / ")}`
    )
    .join("\n\n");
  return `# 事实核查：${f.topicTitle}\n\n> ${f.summary}\n\n${items}\n`;
}

export function shotListToMarkdown(s: ShotList): string {
  const rows = s.shots
    .map((sh) => `| ${sh.scene} | ${sh.visual} | ${sh.subtitle} | ${sh.broll} |`)
    .join("\n");
  return `# 分镜表：${s.topicTitle}\n\n| 镜头 | 画面 | 字幕/口播 | B-roll |\n| --- | --- | --- | --- |\n${rows}\n`;
}

export function spokenToMarkdown(s: SpokenScript): string {
  return `# 口播稿：${s.topicTitle}\n\n${s.content}\n`;
}

export function publishToMarkdown(p: PublishKit): string {
  const titles = p.titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
  return `# 发布文案\n\n## 标题候选\n\n${titles}\n\n## 简介\n\n${p.description}\n\n## 标签\n\n${p.tags.map((t) => `#${t}`).join(" ")}\n`;
}

export function compareToMarkdown(t: CompareTable): string {
  const header = `| 维度 | ${t.products.join(" | ")} | 核实提示 |`;
  const divider = `| --- | ${t.products.map(() => "---").join(" | ")} | --- |`;
  const rows = t.rows
    .map((r) => `| ${r.dimension} | ${r.values.join(" | ")} | ${r.verifyNote || "-"} |`)
    .join("\n");
  return `# 横评对比表\n\n${header}\n${divider}\n${rows}\n\n**结论**：${t.verdict}\n`;
}

export interface ReportEntry {
  topicTitle: string;
  category?: string;
  savedAt: number;
  sections: number;
}

export function reportToMarkdown(title: string, entries: ReportEntry[]): string {
  const byCat = new Map<string, number>();
  entries.forEach((e) => {
    const c = e.category || "未分类";
    byCat.set(c, (byCat.get(c) ?? 0) + 1);
  });
  const catLine = [...byCat.entries()].map(([c, n]) => `${c} ${n}`).join(" · ");
  const list = entries
    .map((e, i) => {
      const t = new Date(e.savedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      return `${i + 1}. [${e.category || "未分类"}] ${e.topicTitle}（${e.sections} 段 · ${t}）`;
    })
    .join("\n");
  return `# ${title}\n\n产出脚本：${entries.length} 篇\n品类分布：${catLine || "—"}\n\n## 选题与脚本清单\n\n${list || "（暂无产出）"}\n`;
}
