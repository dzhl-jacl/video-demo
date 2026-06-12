import { createHash } from "crypto";
import { fetchWithTimeout } from "@/lib/http";

// B 站 WBI 签名所需的固定混淆表
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61,
  26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36,
  20, 34, 44, 52,
];

function getMixinKey(orig: string): string {
  return MIXIN_KEY_ENC_TAB.map((n) => orig[n]).join("").slice(0, 32);
}

let cachedKeys: { mixinKey: string; ts: number } | null = null;
const KEY_TTL_MS = 30 * 60 * 1000;

// 从 nav 接口获取 img_key/sub_key，拼接重排得 mixin_key（带 30 分钟缓存）
async function getWbiKeys(): Promise<string> {
  if (cachedKeys && Date.now() - cachedKeys.ts < KEY_TTL_MS) {
    return cachedKeys.mixinKey;
  }
  const res = await fetchWithTimeout("https://api.bilibili.com/x/web-interface/nav", {
    timeoutMs: 5000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Referer: "https://www.bilibili.com/",
    },
  });
  const json = await res.json();
  const imgUrl: string = json?.data?.wbi_img?.img_url ?? "";
  const subUrl: string = json?.data?.wbi_img?.sub_url ?? "";
  const imgKey = imgUrl.split("/").pop()?.split(".")[0] ?? "";
  const subKey = subUrl.split("/").pop()?.split(".")[0] ?? "";
  if (!imgKey || !subKey) throw new Error("无法获取 WBI keys");
  const mixinKey = getMixinKey(imgKey + subKey);
  cachedKeys = { mixinKey, ts: Date.now() };
  return mixinKey;
}

// 为请求参数计算 WBI 签名，返回带 wts 和 w_rid 的完整参数
export async function encodeWbi(
  params: Record<string, string | number>
): Promise<Record<string, string | number>> {
  const mixinKey = await getWbiKeys();
  const wts = Math.round(Date.now() / 1000);
  const signed: Record<string, string | number> = { ...params, wts };

  const query = Object.keys(signed)
    .sort()
    .map((key) => {
      const value = String(signed[key]).replace(/[!'()*]/g, "");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  const wRid = createHash("md5").update(query + mixinKey).digest("hex");
  return { ...signed, w_rid: wRid };
}
