WidgetMetadata = {
  id: "forward.gying2",
  title: "Gying影视(首页)",
  version: "3.1.0",
  requiredVersion: "0.0.1",
  description: "获取 教父.com 最新更新的影视数据，通过 TMDB 补全影视信息（Cookie 可选）",
  author: "Antigravity",
  site: "https://www.xn--wcv59z.com/",
  detailCacheDuration: 3600,
  globalParams: [
    {
      name: "cookie",
      title: "Cookie（可选）",
      type: "input",
      description: "公开最近更新无需填写；支持新站导出的 JSON 或 key=value 格式",
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
      params: [],
    },
    {
      id: "recentTV",
      title: "最近更新剧集",
      functionName: "recentTV",
      params: [],
    },
  ],
};

const BASE_URL = "https://www.xn--wcv59z.com";
const IMG_BASE = "https://s.tutu.pm/img";

/**
 * 将用户输入的 Cookie 转换为 "name=value; name=value" 格式
 * 支持两种格式：
 * 1. JSON 数组（浏览器插件导出）：[{"name":"app_auth","value":"xxx"}, ...]
 * 2. 普通字符串：app_auth=xxx; BT_auth=xxx
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
 * 调用 /res/change/{type}/{index} API，返回该批次的影视 JSON 数据
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

async function fetchGying(type, index, cookieString) {
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

function buildSourceItem(gyingType, mediaType, item) {
  const link = `source:${encodeURIComponent(JSON.stringify({
    type: gyingType,
    mediaType: mediaType,
    title: item.title,
    gid: item.gid,
    rating: item.rating,
  }))}`;
  return {
    id: `${BASE_URL}/${gyingType}/${item.gid}`,
    type: "url",
    link: link,
    mediaType: mediaType,
    title: item.title,
    posterPath: `${IMG_BASE}/${gyingType}/${item.gid}/256.webp`,
    rating: item.rating,
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
    if (mediaType === "movie" && year > 1900) {
      searchParams.year = year;
    }
    const response = await Widget.tmdb.get(api, {
      params: searchParams,
    });
    if (response && response.results && response.results.length > 0) {
      return response.results[0];
    }
  } catch (err) {
    console.error(`TMDB 搜索"${title}"失败`, err);
  }
  return null;
}

/**
 * 获取最近更新影视，结合 Gying 列表 + TMDB 数据
 */
async function fetchRecent(gyingType, mediaType, params = {}) {
  params = params || {};
  const cookieString = parseCookieInput(params.cookie || "");

  const allTitles = [];
  const seenIds = new Set();
  const MAX_PAGES = 5;

  // 第一步：从 Gying 拿到所有不重复的片名列表
  for (let i = 1; i <= MAX_PAGES; i++) {
    const raw = await fetchGying(gyingType, i, cookieString);

    const data = getListData(raw);
    if (!data) {
      console.log(`第 ${i} 批次响应无效，停止`);
      break;
    }

    const titles = data.t;
    const ids = data.i;
    if (titles.length === 0) break;

    let added = 0;
    for (let n = 0; n < titles.length; n++) {
      const title = String(titles[n] || "").trim();
      const gid = String(ids[n] || "").trim();
      if (!title || !gid || seenIds.has(gid)) continue;
      seenIds.add(gid);
      const rating = Array.isArray(data.d) && Number.isFinite(Number(data.d[n]))
        ? Number(data.d[n])
        : 0;
      const meta = Array.isArray(data.a) && Array.isArray(data.a[n])
        ? data.a[n]
        : [];
      allTitles.push({ title: title, gid: gid, rating: rating, year: Number(meta[0]) || 0 });
      added++;
    }

    console.log(`第 ${i} 批次：新增 ${added} 部，累计 ${allTitles.length} 部不重复`);
  }

  console.log(`教父.com 共抓取 ${allTitles.length} 部，开始并行 TMDB 匹配...`);

  // 并行搜索所有影片（Promise.all 同时发起所有请求，大幅提速）
  const searchPromises = allTitles.map(item => {
    const searchTitle = mediaType === "tv" ? cleanTVTitle(item.title) : item.title;
    return searchTMDB(searchTitle, mediaType, item.year).then(tmdb => {
      if (tmdb) {
        return {
          id: tmdb.id,
          type: "tmdb",
          title: tmdb.title || tmdb.name || item.title,
          originalTitle: tmdb.original_title || tmdb.original_name || "",
          description: tmdb.overview || "",
          releaseDate: tmdb.release_date || tmdb.first_air_date || "",
          posterPath: tmdb.poster_path || `${IMG_BASE}/${gyingType}/${item.gid}/256.webp`,
          backdropPath: tmdb.backdrop_path || "",
          rating: Number(tmdb.vote_average) > 0 ? tmdb.vote_average : item.rating,
          mediaType: mediaType,
        };
      }
      console.log(`"${item.title}" 未在 TMDB 找到匹配，保留来源条目`);
      return buildSourceItem(gyingType, mediaType, item);
    });
  });

  const results = await Promise.all(searchPromises);
  console.log(`完成，共返回 ${results.length} 部影视`);
  return results;
}

async function recentMovies(params = {}) {
  return await fetchRecent("mv", "movie", params || {});
}

async function recentTV(params = {}) {
  return await fetchRecent("tv", "tv", params || {});
}
