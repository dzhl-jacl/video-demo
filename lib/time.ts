// 把发布时间解析为时间戳；解析失败返回 0
export function parseTime(input: string): number {
  if (!input) return 0;
  const t = Date.parse(input);
  return Number.isNaN(t) ? 0 : t;
}

// 相对时间：如「3小时前」「2天前」「刚刚」
export function relativeTime(input: string, now: number = Date.now()): string {
  const t = parseTime(input);
  if (t === 0) return "时间未知";
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}天前`;
  const month = Math.floor(day / 30);
  return `${month}个月前`;
}

// 生成相对于现在的 ISO 时间字符串（兜底数据动态化用）
export function hoursAgoIso(hours: number, now: number = Date.now()): string {
  return new Date(now - hours * 3600000).toISOString();
}

// 中文数量格式化：万 / 亿
export function formatCount(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)}万`;
  return String(n);
}
