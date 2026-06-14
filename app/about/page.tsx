"use client";

const STACK = [
  "Next.js 14 (App Router)",
  "TypeScript 严格模式",
  "Tailwind CSS",
  "DeepSeek (OpenAI 兼容)",
  "RSS / B 站数据抓取",
  "云服务器 + Nginx + pm2 部署",
];

const HIGHLIGHTS = [
  {
    title: "Agent 编排，而非单点调用",
    desc: "把内容生产拆成采集→选题→脚本→核查→分镜→口播→文案 7 个可独立运行、又能一键串跑的 Agent，数据在节点间向下流动。",
  },
  {
    title: "永不空屏的容错铁律",
    desc: "RSS 失败回落内置样本，AI 超时/解析失败回落静态示例并自动重试，多模型降级链。任何一环挂掉，演示都不中断。",
  },
  {
    title: "真实数据 + 真实 AI",
    desc: "资讯是实时抓取的，竞品粉丝数实时拉取，AI 是真实接入的 DeepSeek，不是写死的假数据。",
  },
  {
    title: "从需求到上线全自己做",
    desc: "需求拆解、Agent 设计、Prompt 调优、前后端实现、香港云服务器部署上线，全链路独立完成。",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
          关于作者
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-50">邓子昊</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          这个站是我为应聘数码内容团队做的作品：一套面向硬核测评团队的 AI 内容生产工作流平台。
          我平时就喜欢用 AI 工具研究各种数码产品，也一直在折腾 Agent、自动化工作流和本地/云端部署。
          做这个站，是想把对你们团队工作方式的理解，落成一个真正能用、能跑通的东西。
        </p>
      </header>

      <section className="animate-fade-in-up mt-8" style={{ animationDelay: "0.08s" }}>
        <h2 className="text-sm font-semibold text-slate-200">为什么做这个</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          数码测评团队每天最耗时的，是「找选题、查资料、写脚本初稿」这一段。我把这条产线拆成一串 Agent，
          让 AI 接管重复劳动，把人留给判断和创意。它不只是个 Demo——数据真实抓取、AI 真实接入，打开就能用。
          这也是我对「AI 工作流 / Agent / 自动化」这件事的一份答卷。
        </p>
      </section>

      <section className="animate-fade-in-up mt-8" style={{ animationDelay: "0.16s" }}>
        <h2 className="text-sm font-semibold text-slate-200">技术栈</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-lg border border-white/10 bg-panel/50 px-3 py-1.5 text-xs text-slate-300">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="animate-fade-in-up mt-8" style={{ animationDelay: "0.24s" }}>
        <h2 className="text-sm font-semibold text-slate-200">这个站的几个工程亮点</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-xl border border-white/5 bg-panel/40 p-4">
              <h3 className="text-sm font-medium text-slate-100">{h.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-in-up mt-8 rounded-2xl border border-accent/20 bg-accent/5 p-6" style={{ animationDelay: "0.32s" }}>
        <h2 className="text-base font-semibold text-slate-100">期待加入，一起把产线打磨得更顺手</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          这个站里的功能和团队风格肯定还没完全贴合，你们日常真正想要的能力，我也很想当面听你们说说再往里调。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-300">
            <span className="text-slate-500">联系电话：</span>
            <a href="tel:13929009765" className="text-accent hover:text-accent/80">13929009765</a>
          </span>
        </div>
      </section>
    </div>
  );
}
