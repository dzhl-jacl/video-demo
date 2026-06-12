import { NextResponse } from "next/server";
import { COMPETITORS } from "@/data/competitors";
import { fetchCompetitor, fetchFollowerOnly } from "@/lib/bili/client";
import { getBiliSnapshot } from "@/data/bili-snapshot";
import { recordFollower, getFollowerHistory } from "@/lib/followerStore";
import type { CompetitorStat } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getBiliSnapshot();
  const snapByMid = new Map(snapshot.map((s) => [s.mid, s]));

  try {
    const results = await Promise.allSettled(COMPETITORS.map((c) => fetchCompetitor(c)));

    let fullRealCount = 0; // 完整抓取（含视频列表）成功数
    let followerRealCount = 0; // 至少粉丝数实时成功数
    const data: CompetitorStat[] = await Promise.all(
      results.map(async (r, i) => {
        const c = COMPETITORS[i];
        if (r.status === "fulfilled" && r.value.videoCount > 0) {
          fullRealCount++;
          followerRealCount++;
          await recordFollower(c.mid, r.value.follower);
          const real = await getFollowerHistory(c.mid);
          const snap = snapByMid.get(c.mid);
          const followerHistory = real
            ? real
            : snap
            ? [...snap.followerHistory.slice(0, -1), { date: r.value.followerHistory[0].date, value: r.value.follower }]
            : r.value.followerHistory;
          return { ...r.value, followerHistory };
        }

        // 视频列表被风控，退而求其次：单独抓真实粉丝数，视频指标用快照补
        const snap = snapByMid.get(c.mid) ?? snapshot[i];
        try {
          const follower = await fetchFollowerOnly(c.mid);
          followerRealCount++;
          await recordFollower(c.mid, follower);
          const real = await getFollowerHistory(c.mid);
          const followerHistory = real ?? [
            ...snap.followerHistory.slice(0, -1),
            { date: new Date().toISOString().slice(0, 10), value: follower },
          ];
          return { ...snap, follower, followerHistory };
        } catch {
          return snap;
        }
      })
    );

    const degraded = followerRealCount === 0;
    let message: string | undefined;
    if (degraded) {
      message = "实时接口不可用，已使用内置快照数据";
    } else if (fullRealCount === 0) {
      message = "视频列表接口受 B 站风控限制，粉丝数为实时、播放等指标用快照补齐";
    } else if (fullRealCount < COMPETITORS.length) {
      message = "部分 UP 视频数据受限，已用快照补齐";
    }

    return NextResponse.json({ data, degraded, message });
  } catch (e) {
    console.error("[api/bili/competitors] 兜底快照:", (e as Error).message);
    return NextResponse.json({
      data: snapshot,
      degraded: true,
      message: "抓取异常，已使用内置快照数据",
    });
  }
}
