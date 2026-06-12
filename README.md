# 科技选题脚本工作流

把科技数码内容生产拆成一条**可编排、可复用的 Agent 产线**：多源资讯采集 → 选题打分 → 脚本初稿 → 事实核查 → 分镜 → 口播 → 发布文案，一键跑全程。

核心叙事：**把整条内容产线拆成一串 Agent，而这个平台本身就是用 Vibe Coding 搭出来的作品。** 把编辑每天的「找选题 → 查资料 → 写脚本 → 配后期」从数小时压缩到 10 分钟。

## 一条龙产线（7 个 Agent）

```
采集Agent → 选题Agent → 脚本Agent → 核查Agent → 分镜Agent → 口播Agent → 文案Agent
```

每个 Agent 独立、可单步触发、可在 `/workflow` 一键串跑，数据在节点间向下流动。

## 三视图

- **运行视图 `/workflow`**：产线流程图 + 一键跑全程 + 逐节点状态点亮，支持「任意输入」把你手头的产品名/通稿/想法当场灌进产线。
- **组件视图 `/agents`**：每个 Agent 的角色 / 输入输出 / 模型 / 降级策略（读 `lib/agents.ts` 单一数据源）。
- **方法论视图 `/playbook`**：提示词模板、选题价值标签体系、信息验证 SOP、容错铁律、多模型降级链——可交接的团队资产。

## 功能模块

- **资讯流**：多源 RSS（36氪 / IT之家 / 少数派 / 爱范儿）实时采集；任何失败自动回落内置真实样本，永不空屏。
- **AI 选题**：DeepSeek 对资讯聚类去重并打分，输出选题卡，含推荐理由、亮点、需核实点、目标受众、热度分。
- **脚本工作台**：选中选题一键生成脚本初稿，多 Tab 延伸到核查 / 分镜 / 口播 / 文案，每个产物可一键复制 Markdown / 导出。
- **任意输入（杀招）**：粘贴产品名、厂商通稿或一个选题想法，直接灌进产线跑通全程，把「看排练好的剧本」变成「拿你们的活当场试」。
- **评论区反哺 `/comments`**：双维度 hybrid 抓评论——对标 UP 评论挖选题机会、自己评论区做复盘（纠错 / 夸赞 / 吐槽 / 催更），AI 分五档，「选题需求」一键成卡进产线；抓取失败回落快照样本。
- **横评表生成 `/compare`**：输入数款产品，AI 生成结构化对比表骨架（维度×产品）并标注需实测核实项，可复制 / 导出。
- **脚本库 `/library`**：脚本归档、回看、导出，勾选两篇并排对比看迭代。
- **选题日报 / 周报 `/report`**：按今日 / 本周 / 全部汇总产出与品类分布，一键复制成可分享报告。
- **AI 助手浮窗**：全局悬浮，带当前页面上下文做问答 / 改写，超时或无 Key 时降级提示。

## 稳定性设计（现场演示不翻车）

- **数据源 hybrid**：实时 RSS 优先，失败/断网自动回落 `data/seed-news.json`。
- **多模型降级调用链**：`lib/providers.ts` 中按 provider 数组顺序降级（主模型 → 备用模型 → 静态兜底）；未来加 OpenAI/Claude 只需往数组追加一项。
- **AI 降级**：DeepSeek 超时/报错时返回预置示例选题与脚本，演示不中断。
- **断点恢复**：三个阶段结果持久化到 localStorage，刷新/切走/中断都能从上一步恢复（`lib/usePipeline.ts`）。
- 所有外部调用走服务端 API 路由，带 5s 超时与 try/catch。

## 技术栈

Next.js 14（App Router）+ TypeScript（严格模式）+ Tailwind CSS + DeepSeek API（OpenAI 兼容接口）。

## 目录结构

```
app/
  page.tsx              # 竞品看板
  workflow/page.tsx     # 工作流编排中心（运行视图，一键跑全程）
  radar/page.tsx        # 资讯雷达
  comments/page.tsx     # 评论区反哺（双维度挖选题/复盘）
  compare/page.tsx      # 横评表生成
  studio/page.tsx       # 选题生产（脚本 + 核查/分镜/口播/文案多 Tab）
  library/page.tsx      # 脚本库（归档/对比）
  report/page.tsx       # 选题日报/周报
  agents/page.tsx       # Agent 库（组件视图）
  playbook/page.tsx     # 工作流手册（方法论沉淀）
  api/news|topics|script              # 采集 / 选题 / 脚本
  api/verify|shotlist|spoken|publish  # 核查 / 分镜 / 口播 / 文案 Agent
  api/comments|compare|chat           # 评论反哺 / 横评表 / AI 助手
lib/
  agents.ts             # Agent 注册表（单一数据源）
  playbook.ts           # 手册内容
  exporter.ts           # 产物 → Markdown 序列化
  followerStore.ts      # 竞品粉丝时序持久化
  useLibrary.ts         # 脚本库（localStorage）
  rss.ts / deepseek.ts / providers.ts / prompts.ts / fallback.ts
  tagging.ts / category.ts / usePipeline.ts / useReader.ts
components/             # ScriptWorkbench / FactCheckPanel / ShotListPanel / SpokenPanel / PublishPanel / SeedInput / CopyBar / Assistant ...
data/                  # sources（RSS 源）/ seed-news（兜底样本）/ competitors / bili-snapshot / comment-snapshot
```

## 本地运行

```bash
npm install
cp .env.local.example .env.local   # 填入 DeepSeek API Key
npm run dev                          # http://localhost:3000
```

> 不配 Key 也能跑：选题与脚本会走静态示例数据，完整演示链路不受影响。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（仅放 `.env.local` 或 Vercel 环境变量，切勿提交进 Git） |
| `DEEPSEEK_BASE_URL` | 接口地址，默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL_PRIMARY` | 主模型，默认 `deepseek-chat` |
| `DEEPSEEK_MODEL_FALLBACK` | 备用模型，默认 `deepseek-reasoner` |

## 部署 Vercel

1. 推送到 GitHub 仓库。
2. Vercel 导入该仓库（自动识别 Next.js）。
3. 在 Vercel 项目 Settings → Environment Variables 配置上表变量。
4. Deploy，得到 `https://xxx.vercel.app` 公网链接。
