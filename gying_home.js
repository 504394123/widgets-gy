WidgetMetadata = {
  id: "forward.gying2",
  title: "Gying影视(首页)",
  version: "3.0.0",
  requiredVersion: "0.0.1",
  description: "获取 Gying.si 最新更新的影视数据，通过 TMDB 补全影视信息（需配置 Cookie）",
  author: "Antigravity",
  site: "https://www.gying.si/",
  globalParams: [
    {
      name: "cookie",
      title: "Cookie",
      type: "input",
      description: "支持直接粘贴浏览器插件导出的 JSON 格式，或 key=value; key=value 格式",
      placeholders: [
        {
          title: "JSON 格式（推荐）",
          value: "[{\"name\":\"app_auth\",\"value\":\"xxx\"},{\"name\":\"BT_auth\",\"value\":\"xxx\"},{\"name\":\"BT_cookietime\",\"value\":\"xxx\"},{\"name\":\"PHPSESSID\",\"value\":\"xxx\"}]"
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

const BASE_URL = "https://www.gying.si";
const IMG_BASE = "https://s.tutu.pm/img/mv";

/**
 * 将用户输入的 Cookie 转换为 "name=value; name=value" 格式
 * 支持两种格式：
 * 1. JSON 数组（浏览器插件导出）：[{"name":"app_auth","value":"xxx"}, ...]
 * 2. 普通字符串：app_auth=xxx; BT_auth=xxx
 */
function parseCookieInput(input) {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      return arr.map(c => `${c.name}=${c.value}`).join("; ");
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
  return title
    .replace(/\s*第[一二三四五六七八九十百千0-9]+季.*$/, "")
    .replace(/\s*Season\s*\d+.*$/i, "")
    .trim();
}

/**
 * 调用 /res/change/{type}/{index} API，返回该批次的影视 JSON 数据
 */
async function fetchGying(type, index, cookieString) {
  const url = `${BASE_URL}/res/change/${type}/${index}`;
  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": `${BASE_URL}/`,
        "Cookie": cookieString,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    return response.data || null;
  } catch (err) {
    console.error(`请求 ${url} 失败`, err);
    return null;
  }
}

/**
 * 用标题搜索 TMDB，返回第一个匹配结果
 */
async function searchTMDB(title, mediaType) {
  try {
    const api = mediaType === "tv" ? "search/tv" : "search/movie";
    const response = await Widget.tmdb.get(api, {
      params: {
        query: title,
        language: "zh-CN",
      }
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
async function fetchRecent(gyingType, mediaType, params) {
  const cookieString = parseCookieInput(params.cookie || "");

  if (!cookieString) {
    console.error("未填写 Cookie，无法获取 Gying 数据");
    return [];
  }

  const allTitles = [];
  const seenIds = new Set();
  const MAX_PAGES = 5;

  // 第一步：从 Gying 拿到所有不重复的片名列表
  for (let i = 1; i <= MAX_PAGES; i++) {
    const raw = await fetchGying(gyingType, i, cookieString);

    if (!raw || typeof raw === "string") {
      console.log(`第 ${i} 批次无效（可能 Cookie 失效），停止`);
      break;
    }

    const titles = raw.t || [];
    const ids = raw.i || [];
    if (titles.length === 0) break;

    let hasDuplicate = false;
    for (let n = 0; n < titles.length; n++) {
      const gid = ids[n];
      if (!gid || seenIds.has(gid)) {
        hasDuplicate = true;
        continue;
      }
      seenIds.add(gid);
      allTitles.push({ title: titles[n], gid: gid });
    }

    console.log(`第 ${i} 批次：${titles.length} 部，累计 ${allTitles.length} 部不重复`);
    if (hasDuplicate) break;
  }

  console.log(`Gying 共抓取 ${allTitles.length} 部，开始并行 TMDB 匹配...`);

  // 并行搜索所有影片（Promise.all 同时发起所有请求，大幅提速）
  const searchPromises = allTitles.map(item => {
    const searchTitle = mediaType === "tv" ? cleanTVTitle(item.title) : item.title;
    return searchTMDB(searchTitle, mediaType).then(tmdb => {
      if (tmdb) {
        return {
          id: tmdb.id,
          type: "tmdb",
          title: tmdb.title || tmdb.name || item.title,
          originalTitle: tmdb.original_title || tmdb.original_name || "",
          description: tmdb.overview || "",
          releaseDate: tmdb.release_date || tmdb.first_air_date || "",
          posterPath: tmdb.poster_path || `${IMG_BASE}/${item.gid}/256.webp`,
          backdropPath: tmdb.backdrop_path || "",
          rating: tmdb.vote_average || 0,
          mediaType: mediaType,
        };
      } else {
        console.log(`"${item.title}" 未在 TMDB 找到匹配，使用 Gying 数据`);
        return {
          id: `/mv/${item.gid}`,
          type: "movie",
          title: item.title,
          posterPath: `${IMG_BASE}/${item.gid}/256.webp`,
          rating: 0,
        };
      }
    });
  });

  const results = await Promise.all(searchPromises);
  console.log(`完成，共返回 ${results.length} 部影视`);
  return results;
}

async function recentMovies(params) {
  return await fetchRecent("mv", "movie", params);
}

async function recentTV(params) {
  return await fetchRecent("tv", "tv", params);
}
