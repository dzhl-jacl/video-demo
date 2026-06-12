import { fetchWithTimeout } from "@/lib/http";
import { getProviders, type LlmProvider } from "@/lib/providers";

export { extractJson } from "@/lib/json";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callProvider(
  provider: LlmProvider,
  messages: ChatMessage[],
  timeoutMs: number
): Promise<string> {
  const res = await fetchWithTimeout(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    timeoutMs,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.7,
      stream: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`${provider.name} HTTP ${res.status}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.name} 返回空内容`);
  return content as string;
}

// 沿 provider 数组逐个降级；全部失败则抛出，由上层走静态兜底
export async function chatWithFallback(
  messages: ChatMessage[],
  timeoutMs = 20000
): Promise<{ content: string; providerUsed: string }> {
  const providers = getProviders();
  let lastError: Error | null = null;

  for (const provider of providers) {
    if (!provider.apiKey) continue;
    try {
      const content = await callProvider(provider, messages, timeoutMs);
      return { content, providerUsed: provider.name };
    } catch (e) {
      lastError = e as Error;
      console.error(`[llm] ${provider.name} 调用失败，尝试下一个:`, lastError.message);
    }
  }
  throw lastError ?? new Error("无可用的 LLM provider");
}

