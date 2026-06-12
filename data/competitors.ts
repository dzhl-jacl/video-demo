export interface Competitor {
  name: string;
  mid: number;
}

// 数码区对标 UP 配置（mid 为 B 站用户 ID）。
// 胜利文绉绉 + 数码区头部，用于竞品数据对比与选题反推。
export const COMPETITORS: Competitor[] = [
  { name: "胜利文绉绉", mid: 12300996 },
  { name: "极客湾Geekerwan", mid: 546195 },
  { name: "何同学", mid: 163637592 },
  { name: "影视飓风", mid: 946974 },
];
