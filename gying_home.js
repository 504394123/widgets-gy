WidgetMetadata = {
  id: "forward.gying2",
  title: "Gying影视(首页)",
  version: "4.0.0",
  requiredVersion: "0.0.1",
  description: "通过局域网 Gying 服务获取电影、剧集和动漫的最近更新",
  author: "Antigravity",
  site: "http://192.168.3.50:21111/",
  detailCacheDuration: 3600,
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
    {
      id: "recentAnime",
      title: "最近更新动漫",
      functionName: "recentAnime",
      params: [],
    },
  ],
};

const BASE_URL = "http://192.168.3.50:21111";

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

function safeErrorMessage(error) {
  return error && typeof error.message === "string"
    ? error.message
    : (typeof error === "string" ? error : "未知错误");
}

function cleanTVTitle(title) {
  return String(title || "")
    .replace(/\s*第[一二三四五六七八九十百千0-9]+季.*$/, "")
    .replace(/\s*Season\s*\d+.*$/i, "")
    .trim();
}

function cleanAnimeTitle(title) {
  return String(title || "")
    .replace(/\s*第[一二三四五六七八九十百千0-9]+季.*$/, "")
    .replace(/\s*Season\s*\d+.*$/i, "")
    .replace(/\s*年番\s*\d+.*$/, "")
    .replace(/\s*第[一二三四五六七八九十百千0-9]+期.*$/, "")
    .replace(/[：:].*$/, "")
    .trim();
}

function absoluteLocalUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) {
    const protocol = (BASE_URL.match(/^([a-z][a-z0-9+.-]*:)/i) || [])[1] || "http:";
    return `${protocol}${url}`;
  }
  return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
}

function normalizeSourcePath(value, expectedType) {
  const path = String(value || "")
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "");
  const match = path.match(/^\/?(mv|tv|ac)\/([^/?#]+)/i);
  if (!match || match[1].toLowerCase() !== expectedType) return "";
  return `/${expectedType}/${match[2]}`;
}

function normalizeSourceItem(item, expectedType) {
  if (!item || typeof item !== "object") return null;
  const path = normalizeSourcePath(item.href, expectedType);
  const title = String(item.title || "").trim();
  if (!path || !title) return null;
  const rating = Number(item.rating);
  const yearMatch = String(item.tag || "").match(/\d{4}/);
  const year = Number(yearMatch ? yearMatch[0] : 0);
  return {
    path: path,
    title: title,
    posterPath: absoluteLocalUrl(item.poster),
    rating: Number.isFinite(rating) ? rating : 0,
    year: Number.isFinite(year) ? year : 0,
  };
}

function getHomeSections(payload) {
  const body = responseData(payload);
  if (!body) return null;
  const sections = Array.isArray(body.data) ? body.data : body;
  return Array.isArray(sections) ? sections : null;
}

async function fetchHome() {
  const url = `${BASE_URL}/api/home`;
  try {
    return await Widget.http.get(url);
  } catch (error) {
    console.error(`请求本地 Gying 服务 ${url} 失败: ${safeErrorMessage(error)}`);
    return null;
  }
}

function buildSourceItem(type, mediaType, item) {
  const link = `source:${encodeURIComponent(JSON.stringify({
    type: type,
    mediaType: mediaType,
    title: item.title,
    path: item.path,
    posterPath: item.posterPath,
    rating: item.rating,
  }))}`;
  return {
    id: `${BASE_URL}${item.path}`,
    type: "url",
    link: link,
    mediaType: mediaType,
    title: item.title,
    posterPath: item.posterPath,
    rating: item.rating,
  };
}

async function loadDetail(link) {
  const value = String(link || "");
  if (!value.startsWith("source:")) return null;

  try {
    const source = JSON.parse(decodeURIComponent(value.slice(7)));
    if (!source || !["mv", "tv", "ac"].includes(source.type)) return null;
    const path = normalizeSourcePath(source.path, source.type);
    const title = String(source.title || "").trim();
    if (!path || !title) return null;

    return {
      id: `${BASE_URL}${path}`,
      type: "url",
      link: value,
      mediaType: source.mediaType === "movie" ? "movie" : "tv",
      title: title,
      posterPath: absoluteLocalUrl(source.posterPath),
      rating: Number(source.rating) || 0,
    };
  } catch (error) {
    console.error(`来源详情参数解析失败: ${safeErrorMessage(error)}`);
    return null;
  }
}

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
    const response = await Widget.tmdb.get(api, { params: searchParams });
    if (response && Array.isArray(response.results) && response.results.length > 0) {
      return response.results[0];
    }
  } catch (error) {
    console.error(`TMDB 搜索"${title}"失败: ${safeErrorMessage(error)}`);
  }
  return null;
}

async function fetchRecent(gyingType, mediaType) {
  const raw = await fetchHome();
  const sections = getHomeSections(raw);
  if (!sections) {
    console.error("本地 Gying 首页请求失败或响应格式无效，请检查服务状态与局域网连接");
    return [];
  }

  const section = sections.find((entry) => entry && entry.type === gyingType);
  const rawItems = section && Array.isArray(section.items) ? section.items : [];
  const sourceItems = rawItems
    .slice(0, 12)
    .map((item) => normalizeSourceItem(item, gyingType))
    .filter(Boolean);

  const results = await Promise.all(sourceItems.map((item) => {
    const searchTitle = gyingType === "ac"
      ? cleanAnimeTitle(item.title)
      : (mediaType === "tv" ? cleanTVTitle(item.title) : item.title);
    const releaseYear = mediaType === "movie" && item.year > 1900 ? item.year : null;

    return searchTMDB(searchTitle, mediaType, releaseYear).then((tmdb) => {
      if (!tmdb) return buildSourceItem(gyingType, mediaType, item);
      return {
        id: tmdb.id,
        type: "tmdb",
        title: tmdb.title || tmdb.name || item.title,
        originalTitle: tmdb.original_title || tmdb.original_name || "",
        description: tmdb.overview || "",
        releaseDate: tmdb.release_date || tmdb.first_air_date || "",
        posterPath: tmdb.poster_path || item.posterPath,
        backdropPath: tmdb.backdrop_path || "",
        rating: Number(tmdb.vote_average) > 0 ? tmdb.vote_average : item.rating,
        mediaType: mediaType,
      };
    });
  }));

  console.log(`本地 Gying 首页 ${gyingType} 返回 ${results.length} 部`);
  return results;
}

async function recentMovies() {
  return await fetchRecent("mv", "movie");
}

async function recentTV() {
  return await fetchRecent("tv", "tv");
}

async function recentAnime() {
  return await fetchRecent("ac", "tv");
}
