// 工作流手册（Playbook）内容：把项目实际用到的方法论沉淀成可读资产。
// 直接对应 JD「总结 AI 提示词、资料研究流程、脚本模板、信息验证方法、内容生产工作流」。

export interface PromptCard {
  name: string;
  intent: string;
  key: string;
}

export const PROMPT_CARDS: PromptCard[] = [
  {
    name: "选题 Prompt",
    intent: "从资讯聚类去重，以硬核测评视角挑最值得做的选题，标出需实测验证的点。",
    key: "buildTopicPrompt",
  },
  {
    name: "脚本 Prompt",
    intent: "第一人称真实体验、拒绝参数朗读，注入团队调性，关键事实标信源。",
    key: "buildScriptPrompt + TEAM_TONE",
  },
  {
    name: "核查 Prompt",
    intent: "逐句揪事实声明，判可信度并给可直接搜索的交叉验证关键词。",
    key: "buildVerifyPrompt",
  },
  {
    name: "分镜 Prompt",
    intent: "把口播稿拆成可拍摄镜头表，给画面/字幕/B-roll 建议。",
    key: "buildShotlistPrompt",
  },
];

export const VERIFY_SOP: string[] = [
  "区分「厂商单方面宣传」与「第三方实测数据」，前者一律标待核实。",
  "参数/跑分/价格/首发时间这类硬数字，必须给可搜索的交叉验证关键词。",
  "实验室理想值（如铰链寿命 50 万次）要换算成真实使用场景再判断。",
  "主观体验描述（手感、观感）有大量用户反馈支撑的可标可信。",
  "核查结论永远是「待人工复核」的辅助，不直接替代编辑判断。",
];

export const SAFETY_RULES: { title: string; detail: string }[] = [
  { title: "数据源永不空屏", detail: "RSS 多源优先，任一失败/断网自动回落 seed 内置真实样本。" },
  { title: "AI 调用必有降级", detail: "DeepSeek 超时/报错返回预置示例选题与脚本，演示不中断。" },
  { title: "外部调用走服务端 + 超时", detail: "RSS、DeepSeek、B 站抓取一律在 API 路由执行，带超时与 try/catch。" },
  { title: "密钥走环境变量", detail: "API key 只放 .env.local / Vercel 环境变量，绝不硬编码进 Git。" },
  { title: "容错优先于功能", detail: "新增功能先想「它挂了会怎样」，宁可降级展示也不让页面崩。" },
];

export const TONE_SAMPLE: string[] = [
  "开场钩子：用真实疑问/反差切入，像跟朋友聊天，不念参数。",
  "活人感：第一人称、有情绪、有吐槽、有「我」的真实细节。",
  "硬核说人话：用类比代替术语堆砌，把原理讲生动。",
  "纠错基因：没实测过的数字都说「这个待我们实测」，不当复读机。",
  "拒绝说教：给观点和建议，把判断权留给观众。",
];
