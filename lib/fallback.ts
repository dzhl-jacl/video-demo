import type {
  Topic,
  VideoScript,
  HotspotAnalysis,
  NewsAnalysis,
  FactCheck,
  ShotList,
  SpokenScript,
  PublishKit,
  CommentInsight,
  CompareTable,
} from "@/lib/types";

export const FALLBACK_NEWS_ANALYSIS: NewsAnalysis = {
  worthMaking: "值得做成开箱首测 + 关键卖点实测，重点验证厂商宣传是否属实。",
  angles: ["第一时间开箱体验", "核心卖点真实表现", "同价位横向对比"],
  verifyPoints: ["厂商宣传的关键参数是否经得起实测", "实际使用场景下的体验是否打折"],
  suggestedTitle: "厂商吹的这点，我们替你真机测了测",
};

// DeepSeek 全部失败时的静态降级数据，保证演示链路不中断
export const FALLBACK_TOPICS: Topic[] = [
  {
    id: "fb-topic-1",
    title: "折叠屏减重到 200 克以内：这次是真轻了，还是又在玩参数？",
    category: "手机",
    reviewAngle: "长期长测",
    reason: "轻量化与铰链耐用是折叠屏最大痛点，厂商宣传亮眼但折痕和手感需要长测验证。",
    highlights: ["整机重量实测对比", "铰链手感与折痕", "日常单手使用体验"],
    controversies: ["50 万次铰链寿命是否经得起日常", "轻量化是否牺牲了电池"],
    audience: "折叠屏潜在用户、数码发烧友",
    heatScore: 90,
    sourceUrls: ["https://www.ithome.com/"],
  },
  {
    id: "fb-topic-2",
    title: "城市领航辅助驾驶实地路测：宣传的算力翻倍，路上到底什么感受",
    category: "汽车",
    reviewAngle: "场景实测",
    reason: "智驾是新能源车评测最大看点，算力宣传与真实路况体验差距值得深挖。",
    highlights: ["复杂路口表现", "接管频率统计", "与上代横向对比"],
    controversies: ["算力翻倍是否等于体验翻倍", "极端场景安全冗余"],
    audience: "新能源车主、智驾关注者",
    heatScore: 88,
    sourceUrls: ["https://www.diandong.com/"],
  },
  {
    id: "fb-topic-3",
    title: "38 克 AI 智能眼镜上手：实时翻译够用吗，戴一天累不累",
    category: "眼镜",
    reviewAngle: "开箱首测",
    reason: "智能眼镜重新走热，轻量化与翻译延迟是体验核心，兼具实用与隐私争议。",
    highlights: ["佩戴舒适度", "翻译延迟实测", "第一视角拍摄画质"],
    controversies: ["实时翻译的准确率与延迟", "公共场合拍摄的隐私问题"],
    audience: "尝鲜用户、内容创作者",
    heatScore: 83,
    sourceUrls: ["https://www.ifanr.com/"],
  },
];

export const FALLBACK_SCRIPT: VideoScript = {
  topicTitle: "折叠屏减重到 200 克以内：这次是真轻了，还是又在玩参数？",
  hook: "折叠屏喊了这么多年轻量化，这次终于压到 200 克以内。但拿到手那一刻我第一反应是——这么轻，铰链还扛得住天天开合吗？",
  sections: [
    {
      heading: "开箱与上手第一印象",
      content:
        "拿在手里确实比上代明显轻一截，单手握持的压力小了很多。展开那一下的阻尼感很顺，但折痕在特定角度的光线下还是能看出来，这点我们后面专门拍给你看。",
      sources: ["https://www.ithome.com/"],
    },
    {
      heading: "核心体验：日常用起来到底怎么样",
      content:
        "我把它当主力机用了两周，外屏完成度足够应付大部分场景，展开后多任务是真香。但轻量化之后电池容量有没有妥协、续航撑不撑得住一天重度使用，这才是关键，下面上数据。",
      sources: [],
    },
    {
      heading: "技术解读：铰链寿命的 50 万次怎么来的",
      content:
        "厂商宣传的 50 万次铰链寿命，换算成每天开合一百次也要十几年。这个数字是实验室理想环境测出来的，真实使用里灰尘、磕碰都会影响，需要客观看待，别被参数带节奏。",
      sources: ["https://www.ithome.com/"],
    },
    {
      heading: "值不值得买",
      content:
        "如果你受够了传统折叠屏的厚重，这次的减重是实打实的进步。但要不要现在入手，得看你能不能接受折痕和它的价格，这部分我给几类人分别给个建议。",
      sources: [],
    },
  ],
  outro: "你觉得折叠屏的轻量化，是不是已经到了可以当主力机的临界点？评论区聊聊你最在意的那个点。",
};

export const FALLBACK_HOTSPOT: HotspotAnalysis = {
  titlePatterns: [
    "用疑问句制造悬念（如「真能打吗」「值不值」）",
    "数字+反差（如「1.06kg」「只发四条视频」）",
    "点明品类+硬核动作（如「深度拆解」「实地路测」）",
  ],
  hotAngles: ["旗舰性能与能效拆解", "多机型横向对比", "真实场景长测", "技术原理科普"],
  durationInsight: "硬核测评多在 18-30 分钟，深度解析型可更长，何同学式叙事向偏短在 11-15 分钟。",
  commonalities: [
    "选题踩中当期最热的新品或行业争议点",
    "有别人没做的实测数据或独家视角",
    "标题制造信息差或悬念，封面突出反差",
  ],
  differentiation: [
    { idea: "针对头部只做单品测评的空白，做同价位段「避坑横评」", category: "电脑", reason: "横评工作量大，多数 UP 只做单品，横评更稀缺也更实用" },
    { idea: "把厂商宣传参数逐条「实测打假」做成固定栏目", category: "手机", reason: "契合团队纠错定位，差异化且可持续" },
    { idea: "智能眼镜/可穿戴的长期佩戴日记式长测", category: "眼镜", reason: "新品类长测内容稀缺，能建立专业度" },
  ],
};

export const FALLBACK_FACTCHECK: FactCheck = {
  topicTitle: "折叠屏减重到 200 克以内：这次是真轻了，还是又在玩参数？",
  items: [
    {
      claim: "整机重量压到 200 克以内",
      verdict: "待核实",
      reason: "厂商标称重量常为不含保护壳的裸机数据，需用电子秤实测确认。",
      searchQueries: ["折叠屏 200克 实测重量", "该机型 裸机重量 第三方"],
    },
    {
      claim: "铰链寿命 50 万次",
      verdict: "存疑",
      reason: "实验室理想环境数据，日常灰尘磕碰会显著影响，缺乏长期使用验证。",
      searchQueries: ["折叠屏 铰链寿命 实验室标准", "50万次 铰链 真实耐用"],
    },
    {
      claim: "轻量化未牺牲电池容量",
      verdict: "待核实",
      reason: "减重通常伴随电池容量取舍，需对比上代电池规格与续航实测。",
      searchQueries: ["该机型 电池容量 对比上代", "折叠屏 减重 续航 实测"],
    },
    {
      claim: "外屏完成度可应付大部分场景",
      verdict: "可信",
      reason: "属体验性主观描述，有大量用户反馈支撑，风险较低。",
      searchQueries: ["折叠屏 外屏 日常使用 体验"],
    },
  ],
  summary: "整体待核实项偏多，优先用电子秤实测重量、并核对电池规格，铰链寿命建议长测验证。",
};

export const FALLBACK_SHOTLIST: ShotList = {
  topicTitle: "折叠屏减重到 200 克以内：这次是真轻了，还是又在玩参数？",
  shots: [
    { scene: "开场-特写", visual: "手持机器单手开合，慢动作特写铰链", subtitle: "这么轻，铰链还扛得住天天开合吗？", broll: "电子秤称重画面叠加" },
    { scene: "开箱-中景", visual: "桌面俯拍开箱，与上代并排", subtitle: "比上代轻了一截", broll: "上代机型对比空镜" },
    { scene: "体验-跟拍", visual: "通勤场景单手握持使用", subtitle: "单手握持压力明显变小", broll: "地铁/街头通勤空镜" },
    { scene: "实测-屏幕", visual: "屏幕展开多任务操作特写", subtitle: "展开后多任务是真香", broll: "分屏操作录屏" },
    { scene: "技术-图示", visual: "铰链结构动画讲解", subtitle: "50万次是怎么测出来的", broll: "铰链拆解/结构动画" },
    { scene: "结尾-口播", visual: "正面口播出镜给建议", subtitle: "到底值不值得现在入手", broll: "价格对比表叠加" },
  ],
};

export const FALLBACK_SPOKEN: SpokenScript = {
  topicTitle: "折叠屏减重到 200 克以内：这次是真轻了，还是又在玩参数？",
  content:
    "折叠屏喊了这么多年轻量化，（停顿）这次终于压到 200 克以内了。\n但说实话，我拿到手第一反应不是「真香」，而是——（加重）这么轻，铰链还扛得住天天开合吗？\n\n先说手感，确实比上代轻了一截，单手拿着压力小很多。\n展开那一下阻尼很顺，不过折痕在特定角度还是看得见，这个我后面拍给你看。\n\n续航这块我得提醒一句，（加重）减重很容易在电池上做妥协，所以这块数据待我们实测，先别急着下结论。\n\n至于铰链宣传的 50 万次，（停顿）听着吓人，但那是实验室数据，真实用起来灰尘磕碰都会影响，别被参数带节奏。\n\n那到底值不值得买？评论区聊聊你最在意的那个点。",
};

export const FALLBACK_PUBLISH: PublishKit = {
  titles: [
    "200 克折叠屏上手：是真轻了，还是又在玩参数？",
    "我把这台「最轻折叠屏」当主力机用了两周，说点实话",
    "折叠屏减重 vs 铰链寿命，厂商没告诉你的取舍",
    "50 万次铰链是怎么测的？折叠屏宣传里的水分",
    "这次折叠屏的轻量化，能当主力机了吗？",
  ],
  description:
    "折叠屏减重到 200 克以内，是真进步还是参数游戏？我们实测了重量、续航和铰链手感，并扒了扒厂商宣传里需要打问号的地方。你最在意折叠屏的哪个点？评论区聊聊。",
  tags: ["折叠屏", "数码测评", "手机", "硬核测评", "避坑指南"],
};

export const FALLBACK_COMMENT_SELF: CommentInsight = {
  scope: "self",
  videoTitle: "旗舰影像手机长测：计算摄影到底进步了多少",
  upName: "胜利文绉绉",
  summary: "观众挑出了传感器型号与充电功率两处口误（需纠错），同时高频催更影像横评和折叠屏长测。",
  items: [
    { text: "23分钟那段传感器型号说错了，新款换成了一英寸大底", likes: 1820, category: "纠错质疑" },
    { text: "充电功率口误，说成90W其实是80W", likes: 1120, category: "纠错质疑" },
    { text: "夜景对比把涂抹感讲清楚了，这才是硬核测评", likes: 2210, category: "做得好" },
    { text: "求做一期同价位影像横评，单机看不出怎么选", likes: 1760, category: "选题需求", topicIdea: "同价位旗舰影像横评：样张盲选 + 计算摄影拆解" },
    { text: "什么时候出折叠屏长测？等好久了", likes: 1450, category: "选题需求", topicIdea: "折叠屏主力机长测：一个月真实使用掉不掉链子" },
    { text: "片头BGM太大声，人声听不清", likes: 760, category: "做得不好" },
    { text: "中间拆解部分节奏拖，可以更紧凑", likes: 540, category: "做得不好" },
  ],
};

export const FALLBACK_COMMENT_COMPETITOR: CommentInsight = {
  scope: "competitor",
  videoTitle: "旗舰SoC性能与能效深度拆解",
  upName: "极客湾Geekerwan",
  summary: "对标视频评论区暴露了「游戏长时间帧率稳定性」「国产芯片对比」两个尚未被充分满足的选题机会。",
  items: [
    { text: "求加测游戏长时间帧率稳定性，跑分高掉帧也白搭", likes: 3200, category: "选题需求", topicIdea: "旗舰手机游戏长时间帧率稳定性实测横评" },
    { text: "希望对比国产芯片，别老是高通联发科", likes: 2680, category: "选题需求", topicIdea: "国产旗舰SoC专项对比：性能能效与生态" },
    { text: "能效曲线没标室温，不同温度差很多", likes: 2100, category: "纠错质疑" },
    { text: "功耗墙的说法有争议，别的UP测得不一样", likes: 1330, category: "争议点" },
    { text: "终于有人测SoC不只看安兔兔，支持", likes: 1980, category: "做得好" },
    { text: "拆解太专业普通人听不懂，求通俗版", likes: 870, category: "做得不好" },
  ],
};

export const FALLBACK_COMPARE: CompareTable = {
  products: ["旗舰影像手机 A", "旗舰影像手机 B", "旗舰影像手机 C"],
  rows: [
    { dimension: "主摄传感器", values: ["一英寸大底", "1/1.3 英寸", "1/1.3 英寸"], verifyNote: "厂商标称底大小需实测成像差异验证" },
    { dimension: "长焦能力", values: ["3.2x 潜望", "5x 潜望", "3x 直立"], verifyNote: "高倍数字变焦画质需实拍核实" },
    { dimension: "夜景涂抹感", values: ["控制较好", "偏重", "中等"], verifyNote: "需统一场景实拍盲测" },
    { dimension: "视频规格", values: ["8K30", "4K120", "4K60"], verifyNote: "高规格续航发热待实测" },
    { dimension: "续航", values: ["中上", "强", "中"], verifyNote: "需统一亮度与负载实测" },
    { dimension: "价格", values: ["6499 起", "5999 起", "5499 起"], verifyNote: "" },
  ],
  verdict: "极致影像选 A，均衡与续航选 B，预算有限且看重轻薄选 C；最终成像差异建议以实拍盲测为准。",
};
