WidgetMetadata = {
  id: "forward.gying",
  title: "Gying影视",
  version: "4.0.1",
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
 * 支持可选筛选参数：genre（类型）、area（地区）、year（年代）
 */
async function fetchGying(type, page, sort, cookieString, filters = {}) {
  let url = `${BASE_URL}/res/${type}?sort=${sort}&rrange=${filters.rrange || "6_10"}&srange=${filters.srange || "5000"}&page=${page}`;
  if (filters.year) url += `&year=${encodeURIComponent(filters.year)}`;
  if (filters.genre) url += `&genre=${encodeURIComponent(filters.genre)}`;
  if (filters.area) url += `&region=${encodeURIComponent(filters.area)}`;
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
  const filters = {
    year: params.year || "",
    genre: params.genre || "",
    area: params.area || "",
    rrange: params.rrange || "6_10",
    srange: params.srange || "5000",
  };

  // 计算对应的 Gying 真实页码和切片位置
  const gyingPage = Math.ceil(forwardPage / FORWARD_PAGES_PER_GYING);
  const sliceStart = ((forwardPage - 1) % FORWARD_PAGES_PER_GYING) * ITEMS_PER_FORWARD_PAGE;
  const sliceEnd = sliceStart + ITEMS_PER_FORWARD_PAGE;

  const filterLog = [filters.year, filters.genre, filters.area].filter(Boolean).join("/") || "无筛选";
  console.log(`Forward 第 ${forwardPage} 页 → Gying 第 ${gyingPage} 页 [${sliceStart}-${sliceEnd}]（排序：${sort} | ${filterLog}）`);

  const raw = await fetchGying(gyingType, gyingPage, sort, cookieString, filters);

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
