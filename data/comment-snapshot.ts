import type { RawComment } from "@/lib/bili/client";

// 评论快照：抓取失败/限流时兜底，保证评论洞察页永不空屏。
// 取材自数码区评论区常见的真实声音类型（纠错、催更、吐槽、夸赞）。

export interface CommentSnapshot {
  videoTitle: string;
  comments: RawComment[];
}

// 自己评论区（胜利文绉绉视角）：含纠错、夸赞、吐槽、催更
export const SELF_COMMENT_SNAPSHOT: CommentSnapshot = {
  videoTitle: "旗舰影像手机长测：计算摄影到底进步了多少",
  comments: [
    { text: "23分钟那段说的传感器型号错了吧，那颗是上一代的，新款换成了一英寸大底", likes: 1820 },
    { text: "续航测试是不是没关后台啊，我同款重度用能比你这多俩小时", likes: 1340 },
    { text: "夜景对比这段太顶了，终于有人把涂抹感讲清楚了，这才是硬核测评", likes: 2210 },
    { text: "求做一期同价位影像横评！光看单机还是不知道怎么选", likes: 1760 },
    { text: "你们的对比维度太专业了，但能不能加个普通人视角的样张盲选", likes: 980 },
    { text: "片头BGM太大声了，人声都听不清，下次调一下", likes: 760 },
    { text: "什么时候出折叠屏的长测？等了好久了", likes: 1450 },
    { text: "充电功率那里口误了吧，说成90W其实是80W，弹幕都在刷", likes: 1120 },
    { text: "这期节奏有点拖，中间拆解部分可以再紧凑点", likes: 540 },
    { text: "建议加一个一年后回访，看看这机器长期用下来掉不掉链子", likes: 1290 },
  ],
};

// 对标 UP 评论区（极客湾视角）：选题需求、争议、纠错
export const COMPETITOR_COMMENT_SNAPSHOT: CommentSnapshot = {
  videoTitle: "旗舰SoC性能与能效深度拆解",
  comments: [
    { text: "求加测一下游戏长时间帧率稳定性，跑分再高掉帧也白搭", likes: 3200 },
    { text: "能效曲线这段，室温没标吧？不同温度差很多的", likes: 2100 },
    { text: "希望下期对比一下国产芯片，别老是高通联发科", likes: 2680 },
    { text: "这代大核频率拉这么高，发热控制其实没说清楚", likes: 1540 },
    { text: "终于有人测SoC不是只看安兔兔了，支持", likes: 1980 },
    { text: "求一期手机SoC天梯图更新，老图过时了", likes: 2450 },
    { text: "拆解很专业但普通用户听不懂，能不能出个通俗版", likes: 870 },
    { text: "这个功耗墙的说法有争议吧，别的UP测出来不一样", likes: 1330 },
  ],
};
