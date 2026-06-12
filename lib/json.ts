// JSON 抽取工具：从可能带 ```json 包裹或前后噪声的 LLM 输出里提取 JSON。
// 抽到独立文件，供服务端 API 与客户端流式解析共用。

export function extractJson<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const arrStart = cleaned.indexOf("[");
    const begin =
      arrStart !== -1 && (arrStart < start || start === -1) ? arrStart : start;
    if (begin === -1) return null;
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    return JSON.parse(cleaned.slice(begin, end + 1)) as T;
  } catch {
    return null;
  }
}
