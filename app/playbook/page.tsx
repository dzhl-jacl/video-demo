import { PROMPT_CARDS, VERIFY_SOP, SAFETY_RULES, TONE_SAMPLE } from "@/lib/playbook";
import { VALUE_TAGS } from "@/lib/tagging";
import { getProviders } from "@/lib/providers";

export const metadata = { title: "工作流手册" };

export default function PlaybookPage() {
  const providers = getProviders().map((p) => p.model);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">工作流手册 · Playbook</h1>
        <p className="mt-1 text-sm text-slate-400">
          把这套工具背后的方法论沉淀下来：提示词、选题标签体系、信息验证 SOP、容错铁律、团队调性。可复制、可交接、能落地到团队日常。
        </p>
      </header>

      <Section title="一、AI 提示词模板">
        <div className="grid gap-3 md:grid-cols-2">
          {PROMPT_CARDS.map((p) => (
            <div key={p.name} className="rounded-xl border border-white/5 bg-panel/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">{p.name}</h3>
                <code className="text-[11px] text-accent">{p.key}</code>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{p.intent}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="二、选题价值标签体系">
        <p className="mb-2 text-xs text-slate-500">
          站在创作者视角回答「这条资讯能做成什么选题」，而非「它属于哪类硬件」。这是雷达筛选的核心维度，规则打标、不耗 token。
        </p>
        <div className="flex flex-wrap gap-2">
          {VALUE_TAGS.map((t) => (
            <span key={t} className="rounded-lg bg-accent/10 px-3 py-1 text-xs text-accent">
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section title="三、信息验证 SOP（团队招牌：纠错）">
        <ol className="space-y-2">
          {VERIFY_SOP.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-accent2">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="四、脚本调性基因（胜利文绉绉的味）">
        <ul className="space-y-1.5">
          {TONE_SAMPLE.map((s, i) => (
            <li key={i} className="text-sm text-slate-300">· {s}</li>
          ))}
        </ul>
      </Section>

      <Section title="五、容错铁律 SOP">
        <div className="grid gap-3 md:grid-cols-2">
          {SAFETY_RULES.map((r) => (
            <div key={r.title} className="rounded-xl border border-white/5 bg-panel/50 p-4">
              <h3 className="text-sm font-semibold text-slate-100">{r.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{r.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="六、多模型降级调用链">
        <p className="mb-2 text-xs text-slate-500">
          按数组顺序依次尝试，前一个失败自动切下一个；未来接 OpenAI/Claude 只需往数组追加一项，无需改调用逻辑。
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {providers.map((m, i) => (
            <span key={i} className="flex items-center gap-2">
              <code className="rounded-md bg-white/5 px-2 py-1 text-slate-300">{m}</code>
              {i < providers.length - 1 && <span className="text-slate-600">→</span>}
            </span>
          ))}
          <span className="text-slate-600">→</span>
          <code className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-300">静态兜底</code>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </section>
  );
}
