import type { CompetitorStat } from "@/lib/types";

// 内置真实感快照：断网/限流时兜底，保证看板永不空屏。
// 粉丝历史用相对天数动态生成，趋势曲线始终"最近"。
interface SnapTemplate {
  name: string;
  mid: number;
  follower: number;
  followerGrowth: number[];
  videoCount: number;
  avgPlay: number;
  maxPlay: number;
  topVideos: {
    title: string;
    play: number;
    danmaku: number;
    comment: number;
    duration: string;
    daysAgo: number;
    category: string;
  }[];
}

const TEMPLATES: SnapTemplate[] = [
  {
    name: "胜利文绉绉",
    mid: 12300996,
    follower: 928000,
    followerGrowth: [-8200, -6100, -4500, -3000, -1600, -700, 0],
    videoCount: 9,
    avgPlay: 612000,
    maxPlay: 1480000,
    topVideos: [
      { title: "旗舰影像手机长测：计算摄影到底进步了多少", play: 1480000, danmaku: 8200, comment: 5400, duration: "23:11", daysAgo: 4, category: "手机" },
      { title: "轻薄本横评：六款热门机型散热与续航实测", play: 920000, danmaku: 5100, comment: 3800, duration: "31:42", daysAgo: 11, category: "电脑" },
      { title: "智能眼镜深度体验：实时翻译到底够不够用", play: 760000, danmaku: 4300, comment: 2900, duration: "18:55", daysAgo: 18, category: "眼镜" },
    ],
  },
  {
    name: "极客湾Geekerwan",
    mid: 546195,
    follower: 5120000,
    followerGrowth: [-21000, -16000, -12000, -8000, -4500, -2000, 0],
    videoCount: 7,
    avgPlay: 2350000,
    maxPlay: 6800000,
    topVideos: [
      { title: "旗舰SoC性能与能效深度拆解", play: 6800000, danmaku: 32000, comment: 18000, duration: "27:30", daysAgo: 6, category: "手机" },
      { title: "桌面级显卡架构解析与游戏实测", play: 3100000, danmaku: 15000, comment: 9200, duration: "22:18", daysAgo: 15, category: "电脑" },
    ],
  },
  {
    name: "何同学",
    mid: 163637592,
    follower: 12400000,
    followerGrowth: [-15000, -11000, -8000, -5000, -2800, -1200, 0],
    videoCount: 4,
    avgPlay: 4200000,
    maxPlay: 9100000,
    topVideos: [
      { title: "如果用一年只发四条视频会怎样", play: 9100000, danmaku: 41000, comment: 26000, duration: "14:02", daysAgo: 9, category: "数码" },
      { title: "智能穿戴设备的未来形态思考", play: 3800000, danmaku: 12000, comment: 8800, duration: "11:47", daysAgo: 30, category: "手表" },
    ],
  },
  {
    name: "影视飓风",
    mid: 946974,
    follower: 9800000,
    followerGrowth: [-18000, -13500, -9500, -6200, -3400, -1500, 0],
    videoCount: 11,
    avgPlay: 1850000,
    maxPlay: 5200000,
    topVideos: [
      { title: "新无反相机视频能力实拍对比", play: 5200000, danmaku: 22000, comment: 14000, duration: "19:33", daysAgo: 5, category: "相机" },
      { title: "新能源车智驾系统实地路测", play: 2400000, danmaku: 9800, comment: 6100, duration: "25:09", daysAgo: 13, category: "汽车" },
    ],
  },
];

function dateNDaysAgo(days: number, now: number): string {
  return new Date(now - days * 86400000).toISOString().slice(0, 10);
}

export function getBiliSnapshot(now: number = Date.now()): CompetitorStat[] {
  const historyDays = [30, 25, 20, 15, 10, 5, 0];
  return TEMPLATES.map((t) => ({
    name: t.name,
    mid: t.mid,
    follower: t.follower,
    videoCount: t.videoCount,
    avgPlay: t.avgPlay,
    maxPlay: t.maxPlay,
    topVideos: t.topVideos.map((v, i) => ({
      bvid: `BVSEED${t.mid}${i}`,
      title: v.title,
      play: v.play,
      danmaku: v.danmaku,
      comment: v.comment,
      duration: v.duration,
      created: Math.round((now - v.daysAgo * 86400000) / 1000),
      category: v.category,
    })),
    followerHistory: historyDays.map((d, i) => ({
      date: dateNDaysAgo(d, now),
      value: t.follower + t.followerGrowth[i],
    })),
  }));
}
