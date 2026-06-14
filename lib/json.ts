// JSON 抽取工具：从可能带 ```json 包裹或前后噪声的 LLM 输出里提取 JSON。
// 抽到独立文件，供服务端 API 与客户端流式解析共用。

// 从 begin 处的 { 或 [ 开始，按括号配对扫描出第一个完整闭合的 JSON 片段。
// 能正确跳过字符串内部的括号与转义，避免被解释文字里的花括号干扰。
function sliceBalanced(s: string, begin: number): string | null {
  const open = s[begin];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = begin; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return s.slice(begin, i + 1);
    }
  }
  return null;
}

export function extractJson<T>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const objStart = cleaned.indexOf("{");
  const arrStart = cleaned.indexOf("[");
  const begin =
    arrStart !== -1 && (arrStart < objStart || objStart === -1) ? arrStart : objStart;
  if (begin === -1) return null;

  // 先按括号配对精确截取第一个完整 JSON
  const balanced = sliceBalanced(cleaned, begin);
  if (balanced) {
    try {
      return JSON.parse(balanced) as T;
    } catch {
      // 落到下面的兜底
    }
  }

  // 兜底：首个 { / [ 到最后一个 } / ]
  try {
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (end <= begin) return null;
    return JSON.parse(cleaned.slice(begin, end + 1)) as T;
  } catch {
    return null;
  }
}
