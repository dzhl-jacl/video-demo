"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  desc: string;
  disabled?: boolean;
}

interface NavGroup {
  group?: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    items: [
      { href: "/workflow", label: "工作流编排中心", desc: "一条龙 Agent 产线，一键跑全程" },
      { href: "/", label: "竞品看板", desc: "同类 UP 数据与爆款拆解" },
    ],
  },
  {
    group: "内容生产中心",
    items: [
      { href: "/radar", label: "资讯雷达", desc: "刷一手资讯找网感" },
      { href: "/comments", label: "评论区反哺", desc: "评论变下一期选题" },
      { href: "/compare", label: "横评表生成", desc: "几款产品生成对比表" },
      { href: "/studio", label: "选题生产", desc: "资讯到脚本一条龙" },
      { href: "/library", label: "脚本库", desc: "归档回看与对比" },
    ],
  },
  {
    group: "Agent 与方法论",
    items: [
      { href: "/agents", label: "Agent 库", desc: "每个 Agent 的职责与降级" },
      { href: "/playbook", label: "工作流手册", desc: "提示词与 SOP 沉淀" },
      { href: "/report", label: "选题日报/周报", desc: "产出汇总可分享" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-panel/40 px-3 py-4 lg:block">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent2 text-lg font-black text-bg shadow-lg shadow-accent/20">
            硬
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-bold tracking-tight text-slate-50">硬核测评工作台</div>
            <div className="mt-0.5 text-[11px] text-slate-500">科技数码内容生产平台</div>
          </div>
        </div>
        <nav className="mt-6 space-y-5">
          {NAV.map((grp, gi) => (
            <div key={gi} className="space-y-1">
              {grp.group && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {grp.group}
                </div>
              )}
              {grp.items.map((item) => {
                const active = pathname === item.href;
                if (item.disabled) {
                  return (
                    <div
                      key={item.href}
                      className="cursor-not-allowed rounded-lg px-3 py-2 opacity-40"
                    >
                      <div className="text-sm text-slate-300">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative block rounded-lg px-3 py-2 transition ${
                      active
                        ? "bg-accent/15 text-accent"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                    )}
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className={`text-[11px] ${active ? "text-accent/70" : "text-slate-500"}`}>{item.desc}</div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3 lg:hidden">
          <span className="font-bold text-slate-50">硬核测评工作台</span>
          <nav className="ml-auto flex gap-3 text-xs">
            <Link href="/workflow" className="text-accent">编排</Link>
            <Link href="/" className="text-accent">看板</Link>
            <Link href="/radar" className="text-accent">雷达</Link>
            <Link href="/studio" className="text-accent2">生产</Link>
          </nav>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
