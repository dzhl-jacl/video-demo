// 按标题/摘要关键词推断产品品类，让资讯与视频能按品类筛选与统计。
const CATEGORY_RULES: { cat: string; keywords: string[] }[] = [
  { cat: "手机", keywords: ["手机", "iphone", "安卓", "折叠", "soc", "芯片", "影像", "鸿蒙", "旗舰机", "红米", "小米", "华为", "vivo", "oppo", "一加", "荣耀", "三星"] },
  { cat: "电脑", keywords: ["电脑", "笔记本", "轻薄本", "显卡", "cpu", "主机", "装机", "mac", "处理器", "键盘", "显示器", "内存", "硬盘", "intel", "amd", "ryzen"] },
  { cat: "相机", keywords: ["相机", "镜头", "无反", "微单", "拍摄", "影视", "摄影", "佳能", "索尼", "尼康", "富士"] },
  { cat: "手表", keywords: ["手表", "手环", "穿戴", "watch", "智能戒指"] },
  { cat: "眼镜", keywords: ["眼镜", "ar", "vr", "头显", "glasses"] },
  { cat: "汽车", keywords: ["汽车", "车", "智驾", "电车", "新能源", "理想", "蔚来", "小鹏", "特斯拉", "比亚迪", "问界"] },
];

export function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.cat;
  }
  return "其他";
}
