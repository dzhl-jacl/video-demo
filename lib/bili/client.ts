import { fetchWithTimeout } from "@/lib/http";
import { encodeWbi } from "@/lib/bili/wbi";
import { inferCategory } from "@/lib/category";
import type { Competitor } from "@/data/competitors";
import type { BiliVideo, CompetitorStat } from "@/lib/types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, Referer: "https://www.bilibili.com/" };

function buildQuery(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

// 获取某 UP 的视频列表（含播放/弹幕/评论/时长/发布时间）
async function fetchVideos(mid: number): Promise<BiliVideo[]> {
  const signed = await encodeWbi({ mid, pn: 1, ps: 25, order: "pubdate" });
  const url = `https://api.bilibili.com/x/space/wbi/arc/search?${buildQuery(signed)}`;
  const res = await fetchWithTimeout(url, { timeoutMs: 6000, headers: HEADERS });
  const json = await res.json();
  if (json?.code !== 0) throw new Error(`arc/search code=${json?.code}`);
  const list = json?.data?.list?.vlist ?? [];
  return list.map((v: any) => ({
    bvid: String(v.bvid ?? ""),
    title: String(v.title ?? ""),
    play: Number(v.play ?? 0),
    danmaku: Number(v.video_review ?? 0),
    comment: Number(v.comment ?? 0),
    duration: String(v.length ?? ""),
    created: Number(v.created ?? 0),
    category: inferCategory(String(v.title ?? "")),
  }));
}

// 获取粉丝数
async function fetchFollower(mid: number): Promise<number> {
  const url = `https://api.bilibili.com/x/relation/stat?vmid=${mid}`;
  const res = await fetchWithTimeout(url, { timeoutMs: 5000, headers: HEADERS });
  const json = await res.json();
  if (json?.code !== 0) throw new Error(`relation/stat code=${json?.code}`);
  return Number(json?.data?.follower ?? 0);
}

// 对外：仅抓粉丝数（视频列表被风控时的实时兜底）
export async function fetchFollowerOnly(mid: number): Promise<number> {
  return fetchFollower(mid);
}

function aggregate(name: string, mid: number, follower: number, videos: BiliVideo[]): CompetitorStat {
  const plays = videos.map((v) => v.play);
  const avgPlay = plays.length ? Math.round(plays.reduce((a, b) => a + b, 0) / plays.length) : 0;
  const maxPlay = plays.length ? Math.max(...plays) : 0;
  const topVideos = [...videos].sort((a, b) => b.play - a.play).slice(0, 3);
  return {
    name,
    mid,
    follower,
    videoCount: videos.length,
    avgPlay,
    maxPlay,
    topVideos,
    // 实时单次抓取只有当前点，趋势由快照补足；此处给单点
    followerHistory: [{ date: new Date().toISOString().slice(0, 10), value: follower }],
  };
}

export async function fetchCompetitor(c: Competitor): Promise<CompetitorStat> {
  const [follower, videos] = await Promise.all([fetchFollower(c.mid), fetchVideos(c.mid)]);
  return aggregate(c.name, c.mid, follower, videos);
}

export interface RawComment {
  text: string;
  likes: number;
}

// 取某 UP 最近一条视频（用于抓评论）。返回 bvid + 标题。
async function fetchLatestVideo(mid: number): Promise<{ bvid: string; title: string }> {
  const videos = await fetchVideos(mid);
  if (videos.length === 0) throw new Error("无视频");
  const latest = [...videos].sort((a, b) => b.created - a.created)[0];
  return { bvid: latest.bvid, title: latest.title };
}

// bvid -> aid（评论接口的 oid 用 aid）
async function bvidToAid(bvid: string): Promise<number> {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`;
  const res = await fetchWithTimeout(url, { timeoutMs: 6000, headers: HEADERS });
  const json = await res.json();
  if (json?.code !== 0) throw new Error(`view code=${json?.code}`);
  return Number(json?.data?.aid ?? 0);
}

// 抓某视频的热门评论（按点赞排序）
async function fetchReplies(aid: number): Promise<RawComment[]> {
  const url = `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=2&ps=20&pn=1`;
  const res = await fetchWithTimeout(url, { timeoutMs: 6000, headers: HEADERS });
  const json = await res.json();
  if (json?.code !== 0) throw new Error(`reply code=${json?.code}`);
  const replies = json?.data?.replies ?? [];
  return replies
    .map((r: any) => ({
      text: String(r?.content?.message ?? "").replace(/\s+/g, " ").trim(),
      likes: Number(r?.like ?? 0),
    }))
    .filter((c: RawComment) => c.text.length > 0);
}

// 抓某 UP 最新视频的评论（标题 + 评论列表），任一步失败抛出由上层走快照兜底。
export async function fetchUpComments(
  mid: number
): Promise<{ videoTitle: string; comments: RawComment[] }> {
  const { bvid, title } = await fetchLatestVideo(mid);
  const aid = await bvidToAid(bvid);
  const comments = await fetchReplies(aid);
  if (comments.length === 0) throw new Error("无评论");
  return { videoTitle: title, comments };
}
