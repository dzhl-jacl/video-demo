export interface LlmProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

// 多模型降级调用链：按数组顺序依次尝试，前一个失败自动切下一个。
// 现阶段同为 DeepSeek（主模型 + 推理模型兜底）；
// 未来接入 OpenAI / Claude 时，只需往数组追加一项，无需改调用逻辑。
export function getProviders(): LlmProvider[] {
  const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
  const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  const primary = process.env.DEEPSEEK_MODEL_PRIMARY ?? "deepseek-chat";
  const fallback = process.env.DEEPSEEK_MODEL_FALLBACK ?? "deepseek-reasoner";

  return [
    { name: "deepseek-primary", baseUrl, apiKey, model: primary },
    { name: "deepseek-fallback", baseUrl, apiKey, model: fallback },
  ];
}

export function hasApiKey(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}
