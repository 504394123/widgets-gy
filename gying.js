WidgetMetadata = {
  id: "forward.gying",
  title: "Gying影视",
  version: "4.5.0",
  requiredVersion: "0.0.1",
  description: "获取 教父.com 完整分类影视列表；支持 Cookie 或账号密码登录",
  author: "Antigravity",
  site: "https://www.xn--wcv59z.com/",
  detailCacheDuration: 3600,
  globalParams: [
    {
      name: "authMode",
      title: "登录方式",
      type: "enumeration",
      value: "cookie",
      enumOptions: [
        { title: "Cookie", value: "cookie" },
        { title: "账号密码", value: "account" },
      ],
    },
    {
      name: "cookie",
      title: "Cookie",
      type: "input",
      description: "填写新站当前 Cookie（至少包含 app_auth）；验证失效时尝试 PoW 刷新，宿主不返回 Set-Cookie 时需重新导入",
      belongTo: { paramName: "authMode", value: ["cookie"] },
      placeholders: [
        {
          title: "JSON 格式（推荐）",
          value: "[{\"name\":\"app_auth\",\"value\":\"xxx\"},{\"name\":\"browser_verified\",\"value\":\"xxx\"},{\"name\":\"PHPSESSID\",\"value\":\"xxx\"}]"
        }
      ]
    },
    {
      name: "username",
      title: "账号/邮箱",
      type: "input",
      description: "仅用于本次登录请求，不写入脚本或 Widget.storage",
      belongTo: { paramName: "authMode", value: ["account"] },
    },
    {
      name: "password",
      title: "密码（普通文本）",
      type: "input",
      description: "Forward 暂无密码框；内容可能出现在本地配置或调试日志中",
      belongTo: { paramName: "authMode", value: ["account"] },
    },
    {
      name: "userAgent",
      title: "User-Agent（可选）",
      type: "input",
      description: "browser_verified 会绑定 User-Agent；反复提示过期时，填写导出 Cookie 时同一浏览器的完整 User-Agent",
      placeholders: [
        {
          title: "Chrome 120（内置默认）",
          value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      ]
    }
  ],
  modules: [
    {
      id: "recentMovies",
      title: "最近更新电影",
      functionName: "recentMovies",
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "sort_by",
          title: "排序方式",
          type: "enumeration",
          enumOptions: [
            { title: "添加时间", value: "addtime" },
            { title: "更新时间", value: "uptime" },
            { title: "上映时间", value: "date" },
            { title: "评分最高", value: "score" },
            { title: "评分人数", value: "number" },
            { title: "评分总人数", value: "numbers" },
            { title: "综合评分", value: "cscore" },
          ],
        },
        {
          name: "genre",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "剧情", value: "剧情" },
            { title: "科幻", value: "科幻" },
            { title: "动作", value: "动作" },
            { title: "喜剧", value: "喜剧" },
            { title: "爱情", value: "爱情" },
            { title: "冒险", value: "冒险" },
            { title: "奇幻", value: "奇幻" },
            { title: "动画", value: "动画" },
            { title: "恐怖", value: "恐怖" },
            { title: "惊悚", value: "惊悚" },
            { title: "战争", value: "战争" },
            { title: "犯罪", value: "犯罪" },
            { title: "悬疑", value: "悬疑" },
            { title: "传记", value: "传记" },
            { title: "纪录", value: "纪录" },
            { title: "歌舞", value: "歌舞" },
            { title: "音乐", value: "音乐" },
            { title: "古装", value: "古装" },
            { title: "武侠", value: "武侠" },
            { title: "家庭", value: "家庭" },
            { title: "丧尸", value: "丧尸" },
            { title: "灾难", value: "灾难" },
            { title: "西部", value: "西部" },
            { title: "历史", value: "历史" },
            { title: "励志", value: "励志" },
          ],
        },
        {
          name: "area",
          title: "地区",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "大陆", value: "大陆" },
            { title: "香港", value: "香港" },
            { title: "台湾", value: "台湾" },
            { title: "欧美", value: "欧美" },
            { title: "美国", value: "美国" },
            { title: "日本", value: "日本" },
            { title: "韩国", value: "韩国" },
            { title: "英国", value: "英国" },
            { title: "法国", value: "法国" },
            { title: "德国", value: "德国" },
            { title: "印度", value: "印度" },
            { title: "泰国", value: "泰国" },
            { title: "亚洲", value: "亚洲" },
            { title: "海外", value: "海外" },
            { title: "俄罗斯", value: "俄罗斯" },
            { title: "意大利", value: "意大利" },
            { title: "西班牙", value: "西班牙" },
          ],
        },
        {
          name: "year",
          title: "年代",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "2026", value: "2026" },
            { title: "2025", value: "2025" },
            { title: "2024", value: "2024" },
            { title: "2023", value: "2023" },
            { title: "2022", value: "2022" },
            { title: "2021", value: "2021" },
            { title: "2020", value: "2020" },
            { title: "2019", value: "2019" },
            { title: "2018", value: "2018" },
            { title: "2017", value: "2017" },
            { title: "2016", value: "2016" },
            { title: "20年代", value: "120" },
            { title: "10年代", value: "110" },
            { title: "00年代", value: "100" },
            { title: "90年代", value: "90" },
          ],
        },
        {
          name: "rrange",
          title: "评分区间",
          type: "enumeration",
          enumOptions: [
            { title: "全部 (0-10)", value: "0_10" },
            { title: "1分以上", value: "1_10" },
            { title: "2分以上", value: "2_10" },
            { title: "3分以上", value: "3_10" },
            { title: "4分以上", value: "4_10" },
            { title: "5分以上", value: "5_10" },
            { title: "6分以上", value: "6_10" },
            { title: "7分以上", value: "7_10" },
            { title: "8分以上", value: "8_10" },
            { title: "9分以上", value: "9_10" },
            { title: "仅10分", value: "10_10" },
          ],
        },
        {
          name: "srange",
          title: "评分人数",
          type: "enumeration",
          enumOptions: [
            { title: "不限", value: "0" },
            { title: "1000人以上", value: "1000" },
            { title: "2000人以上", value: "2000" },
            { title: "3000人以上", value: "3000" },
            { title: "4000人以上", value: "4000" },
            { title: "5000人以上", value: "5000" },
            { title: "1万人以上", value: "10000" },
            { title: "2万人以上", value: "20000" },
            { title: "5万人以上", value: "50000" },
            { title: "10万人以上", value: "100000" },
            { title: "20万人以上", value: "200000" },
            { title: "50万人以上", value: "500000" },
            { title: "100万人以上", value: "1000000" },
          ],
        },
        {
          name: "quality",
          title: "画质",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "720P", value: "720P" },
            { title: "1080P", value: "1080P" },
            { title: "4K", value: "4K" },
          ],
        },
      ],
    },
    {
      id: "recentTV",
      title: "最近更新剧集",
      functionName: "recentTV",
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "sort_by",
          title: "排序方式",
          type: "enumeration",
          enumOptions: [
            { title: "添加时间", value: "addtime" },
            { title: "更新时间", value: "uptime" },
            { title: "上映时间", value: "date" },
            { title: "评分最高", value: "score" },
            { title: "评分人数", value: "number" },
            { title: "评分总人数", value: "numbers" },
            { title: "综合评分", value: "cscore" },
          ],
        },
        {
          name: "genre",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "剧情", value: "剧情" },
            { title: "科幻", value: "科幻" },
            { title: "动作", value: "动作" },
            { title: "喜剧", value: "喜剧" },
            { title: "爱情", value: "爱情" },
            { title: "冒险", value: "冒险" },
            { title: "奇幻", value: "奇幻" },
            { title: "动画", value: "动画" },
            { title: "恐怖", value: "恐怖" },
            { title: "惊悚", value: "惊悚" },
            { title: "战争", value: "战争" },
            { title: "犯罪", value: "犯罪" },
            { title: "悬疑", value: "悬疑" },
            { title: "家庭", value: "家庭" },
            { title: "历史", value: "历史" },
            { title: "励志", value: "励志" },
            { title: "青春", value: "青春" },
            { title: "古装", value: "古装" },
          ],
        },
        {
          name: "area",
          title: "地区",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "大陆", value: "大陆" },
            { title: "香港", value: "香港" },
            { title: "台湾", value: "台湾" },
            { title: "欧美", value: "欧美" },
            { title: "美国", value: "美国" },
            { title: "日本", value: "日本" },
            { title: "韩国", value: "韩国" },
            { title: "英国", value: "英国" },
            { title: "泰国", value: "泰国" },
            { title: "亚洲", value: "亚洲" },
            { title: "海外", value: "海外" },
          ],
        },
        {
          name: "year",
          title: "年代",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "2026", value: "2026" },
            { title: "2025", value: "2025" },
            { title: "2024", value: "2024" },
            { title: "2023", value: "2023" },
            { title: "2022", value: "2022" },
            { title: "2021", value: "2021" },
            { title: "2020", value: "2020" },
            { title: "2019", value: "2019" },
            { title: "2018", value: "2018" },
            { title: "2017", value: "2017" },
            { title: "2016", value: "2016" },
            { title: "20年代", value: "120" },
            { title: "10年代", value: "110" },
            { title: "00年代", value: "100" },
            { title: "90年代", value: "90" },
          ],
        },
        {
          name: "rrange",
          title: "评分区间",
          type: "enumeration",
          enumOptions: [
            { title: "全部 (0-10)", value: "0_10" },
            { title: "1分以上", value: "1_10" },
            { title: "2分以上", value: "2_10" },
            { title: "3分以上", value: "3_10" },
            { title: "4分以上", value: "4_10" },
            { title: "5分以上", value: "5_10" },
            { title: "6分以上", value: "6_10" },
            { title: "7分以上", value: "7_10" },
            { title: "8分以上", value: "8_10" },
            { title: "9分以上", value: "9_10" },
            { title: "仅10分", value: "10_10" },
          ],
        },
        {
          name: "srange",
          title: "评分人数",
          type: "enumeration",
          enumOptions: [
            { title: "不限", value: "0" },
            { title: "1000人以上", value: "1000" },
            { title: "2000人以上", value: "2000" },
            { title: "3000人以上", value: "3000" },
            { title: "4000人以上", value: "4000" },
            { title: "5000人以上", value: "5000" },
            { title: "1万人以上", value: "10000" },
            { title: "2万人以上", value: "20000" },
            { title: "5万人以上", value: "50000" },
            { title: "10万人以上", value: "100000" },
            { title: "20万人以上", value: "200000" },
            { title: "50万人以上", value: "500000" },
            { title: "100万人以上", value: "1000000" },
          ],
        },
        {
          name: "quality",
          title: "画质",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "720P", value: "720P" },
            { title: "1080P", value: "1080P" },
            { title: "4K", value: "4K" },
          ],
        },
      ],
    },
    {
      id: "recentAnime",
      title: "最近更新动漫",
      functionName: "recentAnime",
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "sort_by",
          title: "排序方式",
          type: "enumeration",
          enumOptions: [
            { title: "添加时间", value: "addtime" },
            { title: "更新时间", value: "uptime" },
            { title: "上映时间", value: "date" },
            { title: "评分最高", value: "score" },
            { title: "评分人数", value: "number" },
            { title: "评分总人数", value: "numbers" },
            { title: "综合评分", value: "cscore" },
          ],
        },
        {
          name: "genre",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "剧情", value: "剧情" },
            { title: "萝系", value: "萝系" },
            { title: "科幻", value: "科幻" },
            { title: "日常", value: "日常" },
            { title: "战斗", value: "战斗" },
            { title: "战争", value: "战争" },
            { title: "热血", value: "热血" },
            { title: "机战", value: "机战" },
            { title: "游戏", value: "游戏" },
            { title: "搞笑", value: "搞笑" },
            { title: "恋爱", value: "恋爱" },
            { title: "后宫", value: "后宫" },
            { title: "百合", value: "百合" },
            { title: "基腐", value: "基腐" },
            { title: "冒险", value: "冒险" },
            { title: "奇幻", value: "奇幻" },
            { title: "恐怖", value: "恐怖" },
            { title: "惊悚", value: "惊悚" },
            { title: "犯罪", value: "犯罪" },
            { title: "悬疑", value: "悬疑" },
            { title: "古装", value: "古装" },
            { title: "武侠", value: "武侠" },
            { title: "泡面", value: "泡面" },
            { title: "校园", value: "校园" },
            { title: "运动", value: "运动" },
            { title: "青春", value: "青春" },
            { title: "治愈", value: "治愈" },
            { title: "致郁", value: "致郁" },
            { title: "励志", value: "励志" },
            { title: "历史", value: "历史" },
            { title: "异世界", value: "异世界" },
          ],
        },
        {
          name: "area",
          title: "地区",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "大陆", value: "大陆" },
            { title: "香港", value: "香港" },
            { title: "台湾", value: "台湾" },
            { title: "欧美", value: "欧美" },
            { title: "美国", value: "美国" },
            { title: "日本", value: "日本" },
            { title: "韩国", value: "韩国" },
            { title: "英国", value: "英国" },
            { title: "法国", value: "法国" },
            { title: "德国", value: "德国" },
            { title: "亚洲", value: "亚洲" },
            { title: "海外", value: "海外" },
          ],
        },
        {
          name: "year",
          title: "年代",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "2026", value: "2026" },
            { title: "2025", value: "2025" },
            { title: "2024", value: "2024" },
            { title: "2023", value: "2023" },
            { title: "2022", value: "2022" },
            { title: "2021", value: "2021" },
            { title: "2020", value: "2020" },
            { title: "2019", value: "2019" },
            { title: "2018", value: "2018" },
            { title: "2017", value: "2017" },
            { title: "2016", value: "2016" },
            { title: "20年代", value: "120" },
            { title: "10年代", value: "110" },
            { title: "00年代", value: "100" },
            { title: "90年代", value: "90" },
          ],
        },
        {
          name: "rrange",
          title: "评分区间",
          type: "enumeration",
          enumOptions: [
            { title: "全部 (0-10)", value: "0_10" },
            { title: "1分以上", value: "1_10" },
            { title: "2分以上", value: "2_10" },
            { title: "3分以上", value: "3_10" },
            { title: "4分以上", value: "4_10" },
            { title: "5分以上", value: "5_10" },
            { title: "6分以上", value: "6_10" },
            { title: "7分以上", value: "7_10" },
            { title: "8分以上", value: "8_10" },
            { title: "9分以上", value: "9_10" },
            { title: "仅10分", value: "10_10" },
          ],
        },
        {
          name: "srange",
          title: "评分人数",
          type: "enumeration",
          enumOptions: [
            { title: "不限", value: "0" },
            { title: "1000人以上", value: "1000" },
            { title: "2000人以上", value: "2000" },
            { title: "3000人以上", value: "3000" },
            { title: "4000人以上", value: "4000" },
            { title: "5000人以上", value: "5000" },
            { title: "1万人以上", value: "10000" },
            { title: "2万人以上", value: "20000" },
            { title: "5万人以上", value: "50000" },
            { title: "10万人以上", value: "100000" },
            { title: "20万人以上", value: "200000" },
            { title: "50万人以上", value: "500000" },
            { title: "100万人以上", value: "1000000" },
          ],
        },
        {
          name: "quality",
          title: "画质",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "720P", value: "720P" },
            { title: "1080P", value: "1080P" },
            { title: "4K", value: "4K" },
          ],
        },
      ],
    },
  ],
};

const BASE_URL = "https://www.xn--wcv59z.com";
const IMG_BASE = "https://s.tutu.pm/img";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const VERIFICATION_COOKIE_NAMES = new Set(["browser_verified", "browser_pow"]);
const POW_CACHE_TTL_MS = 20 * 60 * 60 * 1000;
const LOGIN_CACHE_TTL_MS = 60 * 60 * 1000;
// The live site currently sends 2048-bit values and t=400000. Keep bounded
// headroom, but reject pathological challenges before BigInt allocates.
const POW_MAX_ITERATIONS = 800000;
const POW_MAX_HEX_LENGTH = 768;
const POW_BATCH_SIZE = 8192;
const POW_MIN_DURATION_MS = 3000;
const verificationCache = new Map();
const verificationInFlight = new Map();
const loginCache = new Map();
const loginInFlight = new Map();

/**
 * 将用户输入的 Cookie 转换为 "name=value; name=value" 格式
 */
function parseCookieInput(input) {
  if (!input) return "";
  let value = String(input).trim();
  const cookies = new Map();

  // Browser extensions commonly export either [{name, value}] or
  // {cookies:[{name,value}]}; accepting both avoids silently sending JSON as
  // one malformed cookie value.
  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      const entries = Array.isArray(parsed)
        ? parsed
        : (parsed && Array.isArray(parsed.cookies)
          ? parsed.cookies
          : (parsed && parsed.name ? [parsed] : Object.keys(parsed || {}).map((name) => ({
            name: name,
            value: parsed[name],
          }))));
      entries.forEach((cookie) => {
        if (cookie && cookie.name && cookie.value !== undefined && cookie.value !== null) {
          cookies.set(String(cookie.name).trim(), String(cookie.value));
        }
      });
      if (cookies.size > 0) {
        return Array.from(cookies.entries())
          .map(([name, cookieValue]) => `${name}=${cookieValue}`)
          .join("; ");
      }
    } catch (_error) {
      console.error("Cookie JSON 解析失败，将作为原始字符串使用");
    }
  }

  // Accept a copied `Cookie:`/`Set-Cookie:` header, multiline exports, and
  // Netscape-style tab-separated cookie files. Attributes are ignored.
  value = value
    .replace(/^\s*(?:Cookie|Set-Cookie)\s*:\s*/i, "")
    .replace(/\r/g, "");
  value.split("\n").forEach((line) => {
    let text = line.trim();
    if (!text) return;
    // Cookie exports may prefix every line, not just the first one.
    text = text.replace(/^(?:Cookie|Set-Cookie)\s*:\s*/i, "").trim();
    const fields = text.split("\t");
    if (fields.length >= 7 && fields[5] && fields[6]) {
      cookies.set(fields[5].trim(), fields[6].trim());
      return;
    }
    if (text.startsWith("#")) return;
    text.split(";").forEach((part) => {
      const separator = part.indexOf("=");
      if (separator <= 0) return;
      const name = part.slice(0, separator).trim();
      const cookieValue = part.slice(separator + 1).trim();
      if (!name || /^(?:path|domain|expires|max-age|samesite|secure|httponly)$/i.test(name)) return;
      cookies.set(name, cookieValue);
    });
  });
  return Array.from(cookies.entries())
    .map(([name, cookieValue]) => `${name}=${cookieValue}`)
    .join("; ");
}

function parseCookieMap(cookieString) {
  const cookies = new Map();
  String(cookieString || "").split(";").forEach((part) => {
    const separator = part.indexOf("=");
    if (separator <= 0) return;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!name) return;
    cookies.set(name.toLowerCase(), { name: name, value: value });
  });
  return cookies;
}

function serializeCookieMap(cookies) {
  return Array.from(cookies.values())
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

function withoutVerificationCookies(cookieString) {
  const cookies = parseCookieMap(cookieString);
  VERIFICATION_COOKIE_NAMES.forEach((name) => cookies.delete(name));
  return serializeCookieMap(cookies);
}

function hasCookie(cookieString, name) {
  return parseCookieMap(cookieString).has(String(name || "").toLowerCase());
}

function splitSetCookieHeader(value) {
  if (Array.isArray(value)) {
    return value.reduce((all, item) => all.concat(splitSetCookieHeader(item)), []);
  }
  if (value && typeof value === "object") {
    if (value.value !== undefined) return splitSetCookieHeader(value.value);
    if (value.values !== undefined) return splitSetCookieHeader(value.values);
  }
  if (value === null || value === undefined) return [];
  const text = String(value).trim();
  if (!text) return [];
  // Headers.get() may combine multiple Set-Cookie values. Expires dates contain
  // commas too, so split only when the next token looks like another cookie.
  return text.split(/,(?=\s*[^;,=\s]+\s*=)/g).map((item) => item.trim()).filter(Boolean);
}

function getHeaderValue(headers, name) {
  if (!headers) return null;
  if (typeof headers === "string") {
    try {
      return getHeaderValue(JSON.parse(headers), name);
    } catch (_error) {
      const wanted = String(name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const values = [];
      const pattern = new RegExp(`^\\s*${wanted}\\s*:\\s*(.*)$`, "i");
      String(headers).split(/\r?\n/).forEach((line) => {
        const match = line.match(pattern);
        if (match) values.push(match[1]);
      });
      if (values.length === 1) return values[0];
      if (values.length > 1) return values;
      return null;
    }
  }
  const wanted = String(name || "").toLowerCase();

  if (typeof headers.get === "function") {
    try {
      const value = headers.get(name) || headers.get(wanted);
      if (value !== null && value !== undefined) return value;
    } catch (_error) {}
  }

  if (typeof headers.forEach === "function") {
    const values = [];
    try {
      headers.forEach((value, key) => {
        if (String(key).toLowerCase() === wanted) values.push(value);
      });
    } catch (_error) {}
    if (values.length > 0) return values;
  }

  if (typeof headers.entries === "function") {
    const values = [];
    try {
      for (const entry of headers.entries()) {
        if (Array.isArray(entry) && String(entry[0]).toLowerCase() === wanted) {
          values.push(entry[1]);
        }
      }
    } catch (_error) {}
    if (values.length > 0) return values;
  }

  if (Array.isArray(headers)) {
    const values = [];
    headers.forEach((entry) => {
      if (typeof entry === "string") {
        const separator = entry.indexOf(":");
        if (separator > 0 && entry.slice(0, separator).trim().toLowerCase() === wanted) {
          values.push(entry.slice(separator + 1).trim());
        }
      } else if (Array.isArray(entry) && String(entry[0]).toLowerCase() === wanted) {
        values.push(entry[1]);
      } else if (entry && typeof entry === "object") {
        const key = entry.name !== undefined ? entry.name : entry.key;
        if (key !== undefined && String(key).toLowerCase() === wanted) {
          values.push(entry.value !== undefined ? entry.value : entry.val);
        }
      }
    });
    if (values.length > 0) return values;
  }

  if (typeof headers === "object") {
    const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === wanted);
    if (key) return headers[key];
  }
  return null;
}

function cookieRecordToLine(record) {
  if (!record || typeof record !== "object") return null;
  const name = record.name !== undefined ? record.name : record.key;
  const value = record.value !== undefined ? record.value : record.val;
  if (!name || /^set-cookie$/i.test(String(name)) || value === undefined || value === null) {
    return null;
  }
  let line = `${String(name).trim()}=${String(value)}`;
  if (record.expires) line += `; Expires=${record.expires}`;
  if (record.maxAge !== undefined) line += `; Max-Age=${record.maxAge}`;
  return line;
}

function getSetCookieLines(response) {
  const values = [];
  const seen = new Set();
  const add = (line) => {
    if (!line || seen.has(line)) return;
    seen.add(line);
    values.push(line);
  };
  [
    response && response.headers,
    response && response.header,
    response && response.responseHeaders,
    response && response.meta && response.meta.headers,
    response && response.meta && response.meta.responseHeaders,
  ].forEach((headers) => {
    const value = getHeaderValue(headers, "set-cookie");
    splitSetCookieHeader(value).forEach(add);
  });

  // Some Forward builds expose parsed cookies separately from response
  // headers, either as [{name, value}] or as a name -> value map.
  [
    response && response.cookies,
    response && response.cookie,
    response && response.meta && response.meta.cookies,
  ].forEach((cookies) => {
    if (Array.isArray(cookies)) {
      cookies.forEach((cookie) => add(cookieRecordToLine(cookie)));
    } else if (cookies && typeof cookies === "object") {
      const direct = cookieRecordToLine(cookies);
      if (direct) add(direct);
      else Object.keys(cookies).forEach((name) => {
        if (cookies[name] !== undefined && cookies[name] !== null) {
          add(`${name}=${cookies[name]}`);
        }
      });
    } else if (typeof cookies === "string") {
      splitSetCookieHeader(cookies).forEach(add);
    }
  });
  return values;
}

function mergeCookieStrings(cookieString, setCookieLines) {
  const cookies = parseCookieMap(cookieString);
  splitSetCookieHeader(setCookieLines).forEach((line) => {
    const parts = String(line).split(";");
    const pair = parts.shift().trim();
    const separator = pair.indexOf("=");
    if (separator <= 0) return;

    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    const attributes = parts.join(";");
    const maxAge = attributes.match(/(?:^|;)\s*max-age\s*=\s*(-?\d+)/i);
    const expires = attributes.match(/(?:^|;)\s*expires\s*=\s*([^;]+)/i);
    const expiresAt = expires ? Date.parse(expires[1].trim()) : NaN;
    const deleted = (maxAge && Number(maxAge[1]) <= 0)
      || (Number.isFinite(expiresAt) && expiresAt <= Date.now())
      || value === "";
    const key = name.toLowerCase();
    if (deleted) cookies.delete(key);
    else cookies.set(key, { name: name, value: value });
  });
  return serializeCookieMap(cookies);
}

function responseData(response) {
  if (!response) return null;
  let data = Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (_error) {}
  }
  return data;
}

function replaceLiteral(value, secret) {
  if (!secret) return value;
  return String(value).split(String(secret)).join("<redacted>");
}

function safeErrorMessage(error, secrets = []) {
  let message = error && typeof error.message === "string"
    ? error.message
    : (typeof error === "string" ? error : "未知错误");
  const secretValues = Array.isArray(secrets) ? secrets : [secrets];
  secretValues.forEach((secret) => {
    const value = String(secret || "");
    if (!value) return;
    message = replaceLiteral(message, value);
    try {
      message = replaceLiteral(message, encodeURIComponent(value));
    } catch (_error) {}
  });
  message = message.replace(
    /(["']?(?:username|password)["']?\s*[:=]\s*)(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^&;\s,}\]]+)/gi,
    "$1<redacted>"
  );
  return message.replace(
    /((?:cookie|app_auth|browser_verified|browser_pow)\s*[:=]\s*)[^;\s,}]+/gi,
    "$1<redacted>"
  );
}

/**
 * 清理剧集标题，去除"第X季"这样的后缀，避免 TMDB 搜索失败
 * 例如：七王国的骑士 第一季 -> 七王国的骑士
 */
function cleanTVTitle(title) {
  return String(title || "")
    .replace(/\s*第[一二三四五六七八九十百千0-9]+季.*$/, "")
    .replace(/\s*Season\s*\d+.*$/i, "")
    .trim();
}

/**
 * 动漫标题清理，处理动漫特有的命名规律
 * 例：仙逆 年番2       → 仙逆
 * 例：火之童子 第7季    → 火之童子
 * 例：凡人修仙传：星海飞驰篇 → 凡人修仙传
 */
function cleanAnimeTitle(title) {
  return String(title || "")
    // 去掉“第X季”（中文数字或阿拉伯数字）
    .replace(/\s*第[一二三四五六七八九十百千0-9]+季.*$/, "")
    // 去掉“Season N”
    .replace(/\s*Season\s*\d+.*$/i, "")
    // 去掉“年番N”（年番番组）
    .replace(/\s*年番\s*\d+.*$/, "")
    // 去掉“第N期”（屶1期、制1期等）
    .replace(/\s*第[一二三四五六七八九十百千0-9]+期.*$/, "")
    // 去掉全角凒号副标题（：之後的内容）
    .replace(/[：:].*$/, "")
    .trim();
}

/**
 * 获取某一页的 JSON 数据，使用 /res/mv 或 /res/tv API
 * 支持可选筛选参数：genre（类型）、area（地区）、year（年代）
 */
function normalizeUserAgent(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim() || DEFAULT_USER_AGENT;
}

function buildHeaders(cookieString, extraHeaders = {}, userAgent = "") {
  const headers = {
    "User-Agent": normalizeUserAgent(userAgent),
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": `${BASE_URL}/`,
    "X-Requested-With": "XMLHttpRequest",
  };
  Object.keys(extraHeaders || {}).forEach((name) => {
    if (extraHeaders[name] === null || extraHeaders[name] === undefined) delete headers[name];
    else headers[name] = extraHeaders[name];
  });
  if (cookieString) headers.Cookie = cookieString;
  return headers;
}

async function fetchGying(type, page, sort, cookieString, filters = {}, options = {}) {
  const query = {
    sort: sort || "addtime",
    rrange: filters.rrange || "0_10",
    srange: filters.srange || "0",
    page: page,
  };
  if (filters.year) query.year = filters.year;
  if (filters.genre) query.genre = filters.genre;
  if (filters.area) query.region = filters.area;
  if (filters.quality) query.quality = filters.quality;

  const url = `${BASE_URL}/res/${type}`;
  try {
    const response = await Widget.http.get(url, {
      headers: buildHeaders(cookieString, options.headers, options.userAgent),
      params: query,
    });
    // Keep the response envelope so HTTP status fields remain available to the
    // verification-expiry detector. getListData unwraps `.data` below.
    return response;
  } catch (err) {
    console.error(`请求 ${url} 失败: ${safeErrorMessage(err)}`);
    // Keep the original error so callers can inspect HTTP status fields such
    // as error.response.status instead of mistaking every failure for an
    // ordinary empty response.
    return err || { message: "网络请求失败" };
  }
}

function normalizeHex(value, fieldName) {
  const text = String(value || "").trim().replace(/^0x/i, "");
  if (!text || !/^[0-9a-f]+$/i.test(text)) {
    throw new Error(`浏览器验证挑战 ${fieldName} 无效`);
  }
  if (text.length > POW_MAX_HEX_LENGTH) {
    throw new Error(`浏览器验证挑战 ${fieldName} 过大`);
  }
  return text;
}

function yieldExecution() {
  if (typeof setTimeout === "function") {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  return Promise.resolve();
}

async function waitForMinimumDuration(startedAt, durationMs) {
  const deadline = startedAt + durationMs;
  if (Date.now() >= deadline) return;
  if (typeof setTimeout === "function") {
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, deadline - Date.now())));
    return;
  }

  // There is no reliable non-blocking timer fallback in older JSCore hosts.
  // Finish immediately there rather than busy-waiting and freezing Forward;
  // current Forward builds expose setTimeout and take the timed path above.
}

async function solveProofOfWork(challenge) {
  if (typeof BigInt !== "function") {
    throw new Error("当前 Forward 运行环境不支持 BigInt，无法完成浏览器验证");
  }

  const modulusHex = normalizeHex(challenge && challenge.N, "N");
  const seedHex = normalizeHex(challenge && challenge.x, "x");
  const iterations = Number(challenge && challenge.t);
  if (!Number.isSafeInteger(iterations) || iterations < 0 || iterations > POW_MAX_ITERATIONS) {
    throw new Error("浏览器验证挑战计算次数超出支持范围");
  }

  const modulus = BigInt(`0x${modulusHex}`);
  if (modulus <= BigInt(1)) throw new Error("浏览器验证挑战模数无效");

  let result = BigInt(`0x${seedHex}`) % modulus;
  const startedAt = Date.now();
  for (let index = 0; index < iterations; index += 1) {
    result = (result * result) % modulus;
    if ((index + 1) % POW_BATCH_SIZE === 0) await yieldExecution();
  }
  await waitForMinimumDuration(startedAt, POW_MIN_DURATION_MS);
  return result.toString(16);
}

function verificationCacheKey(cookieString, userAgent) {
  const cookieKey = withoutVerificationCookies(cookieString) || "__anonymous__";
  return `${cookieKey}\n${normalizeUserAgent(userAgent)}`;
}

function invalidateVerificationCache(cookieString, userAgent) {
  verificationCache.delete(verificationCacheKey(cookieString, userAgent));
}

async function performBrowserVerification(cookieString, userAgent) {
  const baseCookie = withoutVerificationCookies(cookieString);
  const pageHeaders = buildHeaders(baseCookie, {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "X-Requested-With": null,
  }, userAgent);
  const pageResponse = await Widget.http.get(`${BASE_URL}/mv`, {
    headers: pageHeaders,
  });
  let sessionCookie = mergeCookieStrings(baseCookie, getSetCookieLines(pageResponse));

  const challengeResponse = await Widget.http.get(`${BASE_URL}/res/pow`, {
    headers: buildHeaders(sessionCookie, {
      "Accept": "application/json, text/plain, */*",
      "X-Requested-With": null,
    }, userAgent),
  });
  sessionCookie = mergeCookieStrings(sessionCookie, getSetCookieLines(challengeResponse));
  if (!hasCookie(sessionCookie, "browser_pow")) {
    throw new Error("Forward 未暴露 browser_pow Cookie；请重新导入完整有效 Cookie，或升级到支持响应 Cookie 的版本");
  }
  const challenge = responseData(challengeResponse);
  if (!challenge || typeof challenge !== "object") {
    throw new Error("浏览器验证挑战响应为空");
  }

  const proof = await solveProofOfWork(challenge);
  const verifyResponse = await Widget.http.post(
    `${BASE_URL}/res/pow`,
    `y=${encodeURIComponent(proof)}`,
    {
      headers: buildHeaders(sessionCookie, {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": null,
      }, userAgent),
    }
  );
  const verification = responseData(verifyResponse);
  if (!verification || verification.success !== true) {
    throw new Error("浏览器验证未通过");
  }

  sessionCookie = mergeCookieStrings(sessionCookie, getSetCookieLines(verifyResponse));
  const hasExplicitVerificationCookie = hasCookie(sessionCookie, "browser_verified");
  if (!hasExplicitVerificationCookie) {
    throw new Error("Forward 未暴露 browser_verified Cookie；请重新导入完整有效 Cookie，或升级到支持响应 Cookie 的版本");
  }
  return {
    cookieString: sessionCookie,
    hasExplicitVerificationCookie: hasExplicitVerificationCookie,
  };
}

async function refreshBrowserVerification(cookieString, userAgent) {
  const key = verificationCacheKey(cookieString, userAgent);
  const cached = verificationCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached;
  if (verificationInFlight.has(key)) return await verificationInFlight.get(key);

  const promise = performBrowserVerification(cookieString, userAgent)
    .then((refreshed) => {
      if (refreshed.hasExplicitVerificationCookie) {
        verificationCache.set(key, {
          cookieString: refreshed.cookieString,
          hasExplicitVerificationCookie: true,
          expiresAt: Date.now() + POW_CACHE_TTL_MS,
        });
      }
      return refreshed;
    })
    .finally(() => verificationInFlight.delete(key));
  verificationInFlight.set(key, promise);
  return await promise;
}

function encodeForm(fields) {
  return Object.keys(fields || {}).map((name) => {
    const value = fields[name] === null || fields[name] === undefined ? "" : fields[name];
    return `${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`;
  }).join("&");
}

function fingerprintText(value) {
  const text = String(value || "");
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x5bd1e995);
    second ^= second >>> 13;
  }
  return `${text.length}:${(first >>> 0).toString(16)}:${(second >>> 0).toString(16)}`;
}

function credentialFingerprint(username, password, userAgent) {
  return [username, password, normalizeUserAgent(userAgent)]
    .map((value) => fingerprintText(value))
    .join(":");
}

async function performCredentialLogin(username, password, userAgent) {
  const verification = await refreshBrowserVerification("", userAgent);
  if (!verification || !verification.hasExplicitVerificationCookie) {
    throw new Error("Forward 未暴露 browser_verified Cookie，无法建立登录会话");
  }

  const response = await Widget.http.post(
    `${BASE_URL}/user/login`,
    encodeForm({
      code: "",
      siteid: 1,
      dosubmit: 1,
      cookietime: 10506240,
      username: username,
      password: password,
    }),
    {
      allow_redirects: false,
      headers: buildHeaders(verification.cookieString, {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": BASE_URL,
        "Referer": `${BASE_URL}/user/login`,
        "X-Requested-With": null,
      }, userAgent),
    }
  );
  const result = responseData(response);
  if (result && Number(result.captcha) === 2) {
    throw new Error("账号登录需要验证码；请先在浏览器完成验证，再改用 Cookie 登录方式");
  }
  if (!result || Number(result.code) !== 200) {
    const reason = result && (result.msg || result.message);
    throw new Error(reason ? `账号或密码登录失败：${String(reason)}` : "账号或密码登录失败");
  }

  const responseCookies = mergeCookieStrings("", getSetCookieLines(response));
  if (!hasCookie(responseCookies, "app_auth")) {
    throw new Error("登录响应成功，但 Forward 未暴露 app_auth Cookie；请改用 Cookie 登录方式");
  }
  return {
    cookieString: mergeCookieStrings(verification.cookieString, getSetCookieLines(response)),
  };
}

async function loginWithCredentials(usernameValue, passwordValue, userAgent) {
  const username = String(usernameValue || "").trim();
  const password = passwordValue === null || passwordValue === undefined
    ? ""
    : String(passwordValue);
  if (!username || !password) throw new Error("账号和密码均为必填项");
  if (username.length > 320) throw new Error("账号长度超出支持范围");
  if (password.length > 1024) throw new Error("密码长度超出支持范围");

  const key = credentialFingerprint(username, password, userAgent);
  const cached = loginCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached;
  if (loginInFlight.has(key)) return await loginInFlight.get(key);

  const promise = performCredentialLogin(username, password, userAgent)
    .then((session) => {
      const cachedSession = {
        cookieString: session.cookieString,
        expiresAt: Date.now() + LOGIN_CACHE_TTL_MS,
      };
      loginCache.set(key, cachedSession);
      return cachedSession;
    })
    .finally(() => loginInFlight.delete(key));
  loginInFlight.set(key, promise);
  return await promise;
}

function getListData(payload) {
  const body = responseData(payload);
  if (!body || typeof body !== "object") return null;
  const data = body.inlist && typeof body.inlist === "object"
    ? body.inlist
    : body;
  if (!Array.isArray(data.t) || !Array.isArray(data.i)) return null;
  return data;
}

function isVerificationExpired(payload) {
  const seen = new Set();
  let expired = false;
  const textPattern = /(?:浏览器验证|browser verification|verification expired|verify(?:ing)? (?:expired|required|failed))/i;
  const inspect = (value, depth) => {
    if (expired || value === null || value === undefined || depth > 5) return;
    if (typeof value === "string") {
      if (textPattern.test(value)) {
        expired = true;
        return;
      }
      const text = value.trim();
      if ((text.startsWith("{") || text.startsWith("[")) && text.length < 200000) {
        try {
          inspect(JSON.parse(text), depth + 1);
        } catch (_error) {}
      }
      return;
    }
    if (typeof value !== "object" && typeof value !== "function") return;
    if (seen.has(value)) return;
    seen.add(value);

    const statusValues = [value.status, value.statusCode, value.httpStatus];
    if (statusValues.some((status) => Number(status) === 419)) {
      expired = true;
      return;
    }
    if (Number(value.code) === 419 || Number(value.refresh) === 1) {
      expired = true;
      return;
    }

    [value.message, value.msg, value.error, value.cause, value.response, value.data,
      value.body, value.result, value.payload].forEach((child) => inspect(child, depth + 1));
  };
  inspect(payload, 0);
  return expired;
}

function getSourceRating(data, index) {
  if (Array.isArray(data.d)) {
    const rating = Number(data.d[index]);
    return Number.isFinite(rating) ? rating : 0;
  }

  if (Array.isArray(data.z)) {
    const rating = Number(data.z[index]);
    return Number.isFinite(rating) ? rating / 10 : 0;
  }

  return 0;
}

function buildSourceItem(type, mediaType, title, gid, posterPath, rating) {
  const link = `source:${encodeURIComponent(JSON.stringify({
    type: type,
    mediaType: mediaType,
    title: title,
    gid: gid,
    rating: rating,
  }))}`;
  return {
    id: `${BASE_URL}/${type}/${gid}`,
    type: "url",
    link: link,
    mediaType: mediaType,
    title: title,
    posterPath: posterPath,
    rating: rating,
  };
}

async function loadDetail(link) {
  const value = String(link || "");
  if (!value.startsWith("source:")) return null;

  try {
    const source = JSON.parse(decodeURIComponent(value.slice(7)));
    if (!source || !["mv", "tv", "ac"].includes(source.type)) return null;
    const gid = String(source.gid || "").trim();
    const title = String(source.title || "").trim();
    if (!gid || !title) return null;

    return {
      id: `${BASE_URL}/${source.type}/${gid}`,
      type: "url",
      link: value,
      mediaType: source.mediaType === "movie" ? "movie" : "tv",
      title: title,
      posterPath: `${IMG_BASE}/${source.type}/${gid}/256.webp`,
      rating: Number(source.rating) || 0,
    };
  } catch (error) {
    console.error(`来源详情参数解析失败: ${safeErrorMessage(error)}`);
    return null;
  }
}

/**
 * 用标题搜索 TMDB，返回第一个匹配结果
 */
async function searchTMDB(title, mediaType, year) {
  try {
    const api = mediaType === "tv" ? "search/tv" : "search/movie";
    const searchParams = {
      query: title,
      language: "zh-CN",
    };
    // 加上年份可显著提升匹配准确度
    if (year && typeof year === "number" && year > 1900) {
      if (mediaType === "tv") {
        searchParams.first_air_date_year = year;
      } else {
        searchParams.year = year;
      }
    }
    const response = await Widget.tmdb.get(api, { params: searchParams });
    if (response && response.results && response.results.length > 0) {
      return response.results[0];
    }
  } catch (err) {
    console.error(`TMDB 搜索"${title}"(年份:${year})失败: ${safeErrorMessage(err)}`);
  }
  return null;
}

/**
 * 虚拟分页逻辑：
 *   教父.com 每页 48 部 → 拆分成 4 个 Forward 页，每页 12 部
 *   Forward page N → 源站 page ceil(N/4)，取第 ((N-1)%4)*12 到 ((N-1)%4)*12+12 条
 *
 * 效果：每次滚动只做 12 个并发 TMDB 查询（原来 36 个），速度快 3 倍；数据无损
 */
const ITEMS_PER_FORWARD_PAGE = 12;
const GYING_ITEMS_PER_PAGE = 48;
const FORWARD_PAGES_PER_GYING = Math.ceil(GYING_ITEMS_PER_PAGE / ITEMS_PER_FORWARD_PAGE); // = 4

async function fetchRecent(gyingType, mediaType, params = {}) {
  params = params || {};
  const forwardPage = Math.max(1, Number(params.page) || 1);
  const sort = params.sort_by || "addtime";
  const userAgent = normalizeUserAgent(params.userAgent || "");
  const requestedAuthMode = String(params.authMode || "").trim().toLowerCase();
  const hasCredentialInput = params.username !== undefined || params.password !== undefined;
  const accountMode = requestedAuthMode === "account"
    || (!requestedAuthMode && !params.cookie && hasCredentialInput);
  const credentialSecrets = accountMode ? [params.username, params.password] : [];
  let authenticatedCookie = "";
  if (accountMode) {
    try {
      const session = await loginWithCredentials(params.username, params.password, userAgent);
      authenticatedCookie = session.cookieString;
    } catch (error) {
      console.error(`账号登录失败：${safeErrorMessage(error, credentialSecrets)}`);
      return [];
    }
  } else {
    authenticatedCookie = parseCookieInput(params.cookie || "");
    if (!authenticatedCookie) {
      console.error("未填写 Cookie，无法获取教父.com 完整分类列表");
      return [];
    }
  }

  const filters = {
    year: params.year || "",
    genre: params.genre || "",
    area: params.area || "",
    rrange: params.rrange || "0_10",
    srange: params.srange || "0",
    quality: params.quality || "",
  };

  const gyingPage = Math.ceil(forwardPage / FORWARD_PAGES_PER_GYING);
  const sliceStart = ((forwardPage - 1) % FORWARD_PAGES_PER_GYING) * ITEMS_PER_FORWARD_PAGE;
  const sliceEnd = sliceStart + ITEMS_PER_FORWARD_PAGE;

  const filterLog = [filters.year, filters.genre, filters.area].filter(Boolean).join("/") || "无筛选";
  console.log(`Forward 第 ${forwardPage} 页 → 教父.com 第 ${gyingPage} 页 [${sliceStart}-${sliceEnd}]（排序：${sort} | ${filterLog}）`);

  let activeCookie = authenticatedCookie;
  let raw = await fetchGying(gyingType, gyingPage, sort, activeCookie, filters, { userAgent: userAgent });
  let data = getListData(raw);
  if (!data && isVerificationExpired(raw)) {
    try {
      console.log("浏览器验证已过期，正在同一 Cookie 会话中刷新");
      for (let refreshAttempt = 0; refreshAttempt < 2 && !data; refreshAttempt += 1) {
        // A cached browser_verified may have been revoked before its local TTL.
        // Drop it after a failed retry and recompute the proof once in this call.
        if (refreshAttempt > 0) {
          invalidateVerificationCache(authenticatedCookie, userAgent);
          console.log("缓存的浏览器验证已失效，重新计算验证");
        }
        const refreshed = await refreshBrowserVerification(authenticatedCookie, userAgent);
        if (!refreshed || !refreshed.hasExplicitVerificationCookie) {
          throw new Error("Forward 未暴露 browser_verified Cookie；请重新导入完整有效 Cookie");
        }
        activeCookie = refreshed.cookieString;
        raw = await fetchGying(gyingType, gyingPage, sort, activeCookie, filters, { userAgent: userAgent });
        data = getListData(raw);
        if (data || !isVerificationExpired(raw)) break;
      }
    } catch (error) {
      console.error(`自动刷新浏览器验证失败：${safeErrorMessage(error, credentialSecrets)}`);
      return [];
    }
  }
  if (!data) {
    if (isVerificationExpired(raw)) {
      console.error("浏览器验证仍未通过，请确认 app_auth 有效且 User-Agent 与导出 Cookie 的浏览器一致");
    } else {
      console.error("分类列表请求失败或响应格式无效，请检查 Cookie 与网络状态");
    }
    return [];
  }

  if (data.t.length === 0) {
    console.log(`教父.com 第 ${forwardPage} 页无数据`);
    return [];
  }

  const sourceItems = [];
  const limit = Math.min(sliceEnd, data.t.length);
  for (let sourceIndex = sliceStart; sourceIndex < limit; sourceIndex++) {
    const title = String(data.t[sourceIndex] || "").trim();
    const gid = String(data.i[sourceIndex] || "").trim();
    if (!title || !gid) continue;
    sourceItems.push({
      title: title,
      gid: gid,
      rating: getSourceRating(data, sourceIndex),
      meta: Array.isArray(data.a) && Array.isArray(data.a[sourceIndex])
        ? data.a[sourceIndex]
        : [],
    });
  }

  console.log(`取 ${sourceItems.length} 部，并行 TMDB 匹配...`);

  const searchPromises = sourceItems.map((item) => {
    const posterPath = `${IMG_BASE}/${gyingType}/${item.gid}/256.webp`;
    const searchTitle = gyingType === "ac"
      ? cleanAnimeTitle(item.title)
      : (mediaType === "tv" ? cleanTVTitle(item.title) : item.title);
    // 电影才用年份精确匹配；剧集年份是当季播放年非首播年，不传
    const year = Number(item.meta[0]);
    const releaseYear = mediaType === "movie" && year > 1900 ? year : null;

    return searchTMDB(searchTitle, mediaType, releaseYear).then(tmdb => {
      if (tmdb) {
        return {
          id: tmdb.id,
          type: "tmdb",
          title: tmdb.title || tmdb.name || item.title,
          originalTitle: tmdb.original_title || tmdb.original_name || "",
          description: tmdb.overview || "",
          releaseDate: tmdb.release_date || tmdb.first_air_date || "",
          posterPath: tmdb.poster_path || posterPath,
          backdropPath: tmdb.backdrop_path || "",
          rating: Number(tmdb.vote_average) > 0 ? tmdb.vote_average : item.rating,
          mediaType: mediaType,
        };
      }
      console.log(`"${item.title}" 未在 TMDB 找到匹配，保留来源条目`);
      return buildSourceItem(
        gyingType,
        mediaType,
        item.title,
        item.gid,
        posterPath,
        item.rating
      );
    });
  });

  const results = await Promise.all(searchPromises);
  console.log(`Forward 第 ${forwardPage} 页返回 ${results.length} 部`);
  return results;
}

async function recentMovies(params = {}) {
  return await fetchRecent("mv", "movie", params || {});
}

async function recentTV(params = {}) {
  return await fetchRecent("tv", "tv", params || {});
}

async function recentAnime(params = {}) {
  // 动漫大多数是剧集形式，用 tv 类型搜 TMDB
  return await fetchRecent("ac", "tv", params || {});
}
