import { promises as fs } from "fs";
import path from "path";

// 粉丝时序仓库：把每次抓取的真实粉丝数按天落到本地 JSON，逐步积累成真实时间序列。
// 无历史时由上层回落 snapshot 动态曲线，保证永不空屏（容错铁律）。

export interface FollowerPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

type Store = Record<string, FollowerPoint[]>; // key: mid

const FILE = path.join(process.cwd(), "data", "follower-history.json");
const MAX_POINTS = 60;

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

async function writeStore(store: Store): Promise<void> {
  try {
    await fs.writeFile(FILE, JSON.stringify(store), "utf-8");
  } catch (e) {
    // 只读环境（如部分 serverless）写失败不影响主流程
    console.error("[followerStore] 写入失败:", (e as Error).message);
  }
}

// 记录某 mid 当天的粉丝数（同一天覆盖，跨天追加）。
export async function recordFollower(mid: number, value: number, now = Date.now()): Promise<void> {
  const date = new Date(now).toISOString().slice(0, 10);
  const store = await readStore();
  const key = String(mid);
  const points = store[key] ?? [];
  const last = points[points.length - 1];
  if (last && last.date === date) {
    last.value = value;
  } else {
    points.push({ date, value });
  }
  store[key] = points.slice(-MAX_POINTS);
  await writeStore(store);
}

// 取某 mid 的真实时序（点数不足时返回 null，由上层走快照）。
export async function getFollowerHistory(mid: number, minPoints = 2): Promise<FollowerPoint[] | null> {
  const store = await readStore();
  const points = store[String(mid)];
  if (!points || points.length < minPoints) return null;
  return points;
}
