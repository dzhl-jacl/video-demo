import { hoursAgoIso } from "@/lib/time";
import type { NewsItem } from "@/lib/types";

// 兜底样本：弱化具体型号、品类化描述，发布时间动态生成（相对现在），
// 即使断网回落也不会暴露过时内容。
interface SeedTemplate {
  hoursAgo: number;
  title: string;
  source: string;
  url: string;
  summary: string;
  category: string;
}

const TEMPLATES: SeedTemplate[] = [
  {
    hoursAgo: 3,
    title: "新一代旗舰影像手机发布：自研影像芯片主打计算摄影与暗光长曝",
    source: "IT之家",
    url: "https://www.ithome.com/",
    summary: "厂商宣称暗光与高动态场景成片率大幅提升，自研影像协处理器是看点，值得做真实样张横评。",
    category: "手机",
  },
  {
    hoursAgo: 6,
    title: "轻薄本新品上市：双芯协同散热，主打静音与长续航办公",
    source: "中关村在线",
    url: "https://www.zol.com.cn/",
    summary: "性能释放与温度墙、续航的真实表现需要长测验证，适合做办公场景实测。",
    category: "电脑",
  },
  {
    hoursAgo: 9,
    title: "无反相机新机型发布：机内防抖与连续对焦算法重做，支持高规格视频",
    source: "爱范儿",
    url: "https://www.ifanr.com/",
    summary: "面向视频创作者，机身防抖与对焦是评测核心，适合实拍对比。",
    category: "相机",
  },
  {
    hoursAgo: 14,
    title: "新款智能手表加入体温与血压监测，续航宣称大幅延长",
    source: "少数派",
    url: "https://sspai.com/",
    summary: "健康监测精度与续航是用户最关心的点，需与专业设备做对照验证。",
    category: "手表",
  },
  {
    hoursAgo: 20,
    title: "AI 智能眼镜新品：主打轻量化与实时翻译、第一视角拍摄",
    source: "爱范儿",
    url: "https://www.ifanr.com/",
    summary: "佩戴舒适度、翻译延迟与隐私问题值得深挖，兼具实用与争议。",
    category: "眼镜",
  },
  {
    hoursAgo: 28,
    title: "新能源车型改款：升级智驾芯片与城市领航，宣称算力翻倍",
    source: "电车之家",
    url: "https://www.diandong.com/",
    summary: "城市领航辅助驾驶的真实表现是评测重点，需要实地路测验证宣传与体验差距。",
    category: "汽车",
  },
  {
    hoursAgo: 34,
    title: "桌面级 DIY 新品：旗舰显卡显存翻倍，主攻本地 AI 与高刷游戏",
    source: "中关村在线",
    url: "https://www.zol.com.cn/",
    summary: "显存翻倍对本地大模型与游戏的实际意义，适合做装机实测与性价比分析。",
    category: "电脑",
  },
  {
    hoursAgo: 42,
    title: "折叠屏新机：铰链寿命与轻量化双双升级，整机重量进一步下探",
    source: "IT之家",
    url: "https://www.ithome.com/",
    summary: "折痕、铰链手感与展开体验值得上手长测，轻量化是否牺牲电池是关注点。",
    category: "手机",
  },
];

export function getSeedNews(now: number = Date.now()): NewsItem[] {
  return TEMPLATES.map((t, idx) => ({
    id: `seed-${idx}`,
    title: t.title,
    source: t.source,
    url: t.url,
    publishedAt: hoursAgoIso(t.hoursAgo, now),
    summary: t.summary,
    category: t.category,
  }));
}
