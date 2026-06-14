export interface RssSource {
  name: string;
  url: string;
  category: string;
}

// 贴合「胜利文绉绉」团队的硬件测评品类：手机/电脑/相机/可穿戴/汽车/泛数码
export const RSS_SOURCES: RssSource[] = [
  { name: "IT之家", url: "https://www.ithome.com/rss/", category: "数码新品" },
  { name: "爱范儿", url: "https://www.ifanr.com/feed", category: "消费电子" },
  { name: "少数派", url: "https://sspai.com/feed", category: "数码体验" },
  { name: "电车之家", url: "https://www.diandong.com/feed/", category: "汽车" },  
  { name: "36氪", url: "https://www.36kr.com/feed", category: "科技商业" },
  { name: "中关村在线", url: "https://rss.zol.com.cn/news.xml", category: "硬件评测" },
];
