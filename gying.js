WidgetMetadata = {
  id: "forward.gying",
  title: "Gying影视",
  version: "4.1.0",
  requiredVersion: "0.0.1",
  description: "获取 教父.com 影视数据；最近更新无需 Cookie，筛选与深度翻页需配置新站 Cookie",
  author: "Antigravity",
  site: "https://www.xn--wcv59z.com/",
  detailCacheDuration: 3600,
  globalParams: [
    {
      name: "cookie",
      title: "Cookie（可选）",
      type: "input",
      description: "不填可看最近更新；筛选与更多分页需粘贴新站导出的 Cookie",
      placeholders: [
        {
          title: "JSON 格式（推荐）",
          value: "[{\"name\":\"app_auth\",\"value\":\"xxx\"},{\"name\":\"browser_verified\",\"value\":\"xxx\"},{\"name\":\"PHPSESSID\",\"value\":\"xxx\"}]"
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
            { title: "6分以上（默认）", value: "6_10" },
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
            { title: "5000人以上（默认）", value: "5000" },
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
            { title: "6分以上（默认）", value: "6_10" },
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
            { title: "5000人以上（默认）", value: "5000" },
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
            { title: "6分以上（默认）", value: "6_10" },
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
            { title: "5000人以上（默认）", value: "5000" },
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
const PUBLIC_FEED_PAGES = 5;

/**
 * 将用户输入的 Cookie 转换为 "name=value; name=value" 格式
 */
function parseCookieInput(input) {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        const cookies = new Map();
        arr.forEach((cookie) => {
          if (cookie && cookie.name && cookie.value !== undefined) {
            cookies.set(String(cookie.name), String(cookie.value));
          }
        });
        return Array.from(cookies.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join("; ");
      }
    } catch (e) {
      console.error("Cookie JSON 解析失败，将作为原始字符串使用");
    }
  }
  return trimmed;
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
function buildHeaders(cookieString) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": `${BASE_URL}/`,
    "X-Requested-With": "XMLHttpRequest",
  };
  if (cookieString) headers.Cookie = cookieString;
  return headers;
}

async function fetchGying(type, page, sort, cookieString, filters = {}) {
  const query = {
    sort: sort || "addtime",
    rrange: filters.rrange || "6_10",
    srange: filters.srange || "5000",
    page: page,
  };
  if (filters.year) query.year = filters.year;
  if (filters.genre) query.genre = filters.genre;
  if (filters.area) query.region = filters.area;
  if (filters.quality) query.quality = filters.quality;

  const url = `${BASE_URL}/res/${type}`;
  try {
    const response = await Widget.http.get(url, {
      headers: buildHeaders(cookieString),
      params: query,
    });
    return response.data || null;
  } catch (err) {
    console.error(`请求 ${url} 失败`, err);
    return null;
  }
}

async function fetchPublicFeed(type, index, cookieString) {
  const url = `${BASE_URL}/res/change/${type}/${index}`;
  try {
    const response = await Widget.http.get(url, {
      headers: buildHeaders(cookieString),
    });
    return response.data || null;
  } catch (err) {
    console.error(`请求 ${url} 失败`, err);
    return null;
  }
}

function getListData(payload) {
  if (!payload || typeof payload !== "object") return null;
  const data = payload.inlist && typeof payload.inlist === "object"
    ? payload.inlist
    : payload;
  if (!Array.isArray(data.t) || !Array.isArray(data.i)) return null;
  return data;
}

function isVerificationExpired(payload) {
  if (!payload || typeof payload !== "object") return false;
  return payload.code === 419
    || payload.refresh === 1
    || /浏览器验证/.test(String(payload.msg || ""));
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
    console.error("来源详情参数解析失败", error);
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
    console.error(`TMDB 搜索"${title}"(年份:${year})失败`, err);
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
  const cookieString = parseCookieInput(params.cookie || "");
  const forwardPage = Math.max(1, Number(params.page) || 1);
  const sort = params.sort_by || "addtime";
  const filters = {
    year: params.year || "",
    genre: params.genre || "",
    area: params.area || "",
    rrange: params.rrange || "6_10",
    srange: params.srange || "5000",
    quality: params.quality || "",
  };

  // 有有效 Cookie 时保留完整筛选和深度分页；验证失效则退回公开更新流。
  const gyingPage = Math.ceil(forwardPage / FORWARD_PAGES_PER_GYING);
  let sliceStart = ((forwardPage - 1) % FORWARD_PAGES_PER_GYING) * ITEMS_PER_FORWARD_PAGE;
  let sliceEnd = sliceStart + ITEMS_PER_FORWARD_PAGE;
  let data = null;

  const filterLog = [filters.year, filters.genre, filters.area].filter(Boolean).join("/") || "无筛选";
  if (cookieString) {
    console.log(`Forward 第 ${forwardPage} 页 → 教父.com 第 ${gyingPage} 页 [${sliceStart}-${sliceEnd}]（排序：${sort} | ${filterLog}）`);
    const raw = await fetchGying(gyingType, gyingPage, sort, cookieString, filters);
    data = getListData(raw);
    if (!data) {
      if (isVerificationExpired(raw)) {
        console.warn("浏览器验证已过期，改用公开最近更新列表");
      } else {
        console.warn("筛选列表不可用，改用公开最近更新列表");
      }
    }
  }

  if (!data) {
    if (forwardPage > PUBLIC_FEED_PAGES) {
      console.log("公开最近更新列表仅提供前 5 页；更多分页需要有效 Cookie");
      return [];
    }
    const raw = await fetchPublicFeed(gyingType, forwardPage, cookieString);
    data = getListData(raw);
    if (!data) {
      console.error("公开最近更新列表请求失败");
      return [];
    }
    sliceStart = 0;
    sliceEnd = ITEMS_PER_FORWARD_PAGE;
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
