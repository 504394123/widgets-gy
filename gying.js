WidgetMetadata = {
  id: "forward.gying",
  title: "Gying影视",
  version: "4.0.0",
  requiredVersion: "0.0.1",
  description: "获取 Gying.si 影视数据，滚动加载更多（需配置 Cookie）",
  author: "Antigravity",
  site: "https://www.gying.si/",
  globalParams: [
    {
      name: "cookie",
      title: "Cookie",
      type: "input",
      description: "支持浏览器插件导出的 JSON 格式，或 key=value; key=value 格式",
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
      ],
    },
  ],
};

const BASE_URL = "https://www.gying.si";

/**
 * 将用户输入的 Cookie 转换为 "name=value; name=value" 格式
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
 * 获取某一页的 JSON 数据，使用 /res/mv 或 /res/tv API
 * 参数格式：year=120&sort=addtime&rrange=6_10&srange=5000&page={page}
 */
async function fetchGying(type, page, sort, cookieString) {
  const url = `${BASE_URL}/res/${type}?year=120&sort=${sort}&rrange=6_10&srange=5000&page=${page}`;
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
 * 虚拟分页逻辑：
 *   Gying 每页 36 部 → 拆分成 3 个 Forward 页，每页 12 部
 *   Forward page N → Gying page ceil(N/3)，取第 ((N-1)%3)*12 到 ((N-1)%3)*12+12 条
 *
 * 效果：每次滚动只做 12 个并发 TMDB 查询（原来 36 个），速度快 3 倍；数据无损
 */
const ITEMS_PER_FORWARD_PAGE = 12;
const GYING_ITEMS_PER_PAGE = 36;
const FORWARD_PAGES_PER_GYING = Math.ceil(GYING_ITEMS_PER_PAGE / ITEMS_PER_FORWARD_PAGE); // = 3

async function fetchRecent(gyingType, mediaType, params) {
  const cookieString = parseCookieInput(params.cookie || "");
  if (!cookieString) {
    console.error("未填写 Cookie，无法获取 Gying 数据");
    return [];
  }

  const forwardPage = params.page || 1;
  const sort = params.sort_by || "addtime";

  // 计算对应的 Gying 真实页码和切片位置
  const gyingPage = Math.ceil(forwardPage / FORWARD_PAGES_PER_GYING);
  const sliceStart = ((forwardPage - 1) % FORWARD_PAGES_PER_GYING) * ITEMS_PER_FORWARD_PAGE;
  const sliceEnd = sliceStart + ITEMS_PER_FORWARD_PAGE;

  console.log(`Forward 第 ${forwardPage} 页 → Gying 第 ${gyingPage} 页 [${sliceStart}-${sliceEnd}]（排序：${sort}）`);

  const raw = await fetchGying(gyingType, gyingPage, sort, cookieString);

  if (!raw) {
    console.error("请求失败，请检查 Cookie 是否有效");
    return [];
  }

  const data = raw.inlist || raw;
  const allTitles = data.t || [];
  const allIds = data.i || [];
  const allRatings = data.d || [];

  if (allTitles.length === 0) {
    console.log(`Gying 第 ${gyingPage} 页无数据`);
    return [];
  }

  // 取当前 Forward 页对应的切片
  const titles = allTitles.slice(sliceStart, sliceEnd);
  const ids = allIds.slice(sliceStart, sliceEnd);
  const ratings = allRatings.slice(sliceStart, sliceEnd);

  console.log(`取第 ${sliceStart + 1}-${sliceStart + titles.length} 部，并行 TMDB 匹配...`);

  // 并行搜索所有影片（Promise.all 同时发起所有请求，大幅提速）
  const searchPromises = titles.map((title, n) => {
    const gid = ids[n] || "";
    const rating = ratings[n] || 0;
    const posterPath = gid ? `https://s.tutu.pm/img/mv/${gid}/256.webp` : "";
    const searchTitle = mediaType === "tv" ? cleanTVTitle(title) : title;

    return searchTMDB(searchTitle, mediaType).then(tmdb => {
      if (tmdb) {
        return {
          id: tmdb.id,
          type: "tmdb",
          title: tmdb.title || tmdb.name || title,
          originalTitle: tmdb.original_title || tmdb.original_name || "",
          description: tmdb.overview || "",
          releaseDate: tmdb.release_date || tmdb.first_air_date || "",
          posterPath: tmdb.poster_path || posterPath,
          backdropPath: tmdb.backdrop_path || "",
          rating: tmdb.vote_average || rating,
          mediaType: mediaType,
        };
      } else {
        console.log(`"${title}" 未在 TMDB 找到匹配`);
        return {
          id: `/${gyingType}/${gid}`,
          type: "movie",
          title: title,
          posterPath: posterPath,
          rating: rating,
        };
      }
    });
  });

  const results = await Promise.all(searchPromises);
  console.log(`Forward 第 ${forwardPage} 页返回 ${results.length} 部`);
  return results;
}

async function recentMovies(params) {
  return await fetchRecent("mv", "movie", params);
}

async function recentTV(params) {
  return await fetchRecent("tv", "tv", params);
}
