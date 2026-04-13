WidgetMetadata = {
  id: "forward.hdlive",
  title: "HDHive影视",
  version: "1.2.2",
  requiredVersion: "0.0.1",
  description: "获取 HDHive 电影列表，仅使用下方实时更新列表，不解析顶部轮播",
  author: "Antigravity",
  site: "https://hdhive.com/movie",
  globalParams: [
    {
      name: "cookie",
      title: "Cookie",
      type: "input",
      description: "可选。支持浏览器插件导出的 JSON 格式，或 key=value; key=value 格式",
      placeholders: [
        {
          title: "JSON 格式（可选）",
          value: "[{\"name\":\"token\",\"value\":\"xxx\"}]"
        }
      ]
    }
  ],
  modules: [
    {
      id: "recentMovies",
      title: "电影列表",
      functionName: "recentMovies",
      params: [
        { name: "page", title: "页码", type: "page" }
      ]
    }
  ]
};

const BASE_URL = "https://hdhive.com";
const MOVIE_PATH = "/movie";
const MOVIE_API_PATH = "/api/public/movies";
const PAGE_SIZE = 40;
const DECRYPT_ACTION_ID_FALLBACK = "405f0ab232fa844d7038944a5a0928f8a696add970";

// 动态 Action ID 缓存，避免每次都请求页面
let _cachedActionId = null;

// 从页面 JS chunk 中动态提取当前有效的 Next-Action ID
// Next.js Server Action ID 格式固定为 "40" + 40位十六进制，共 42 个字符
async function fetchDecryptActionId(cookieString) {
  if (_cachedActionId) return _cachedActionId;

  // 第一步：拉取影片列表页，找到所有 JS chunk 的路径
  let html = "";
  try {
    const pageResp = await Widget.http.get(`${BASE_URL}${MOVIE_PATH}`, {
      headers: buildHeaders(cookieString, { Accept: "text/html,application/xhtml+xml,*/*" })
    });
    html = typeof pageResp.data === "string" ? pageResp.data : "";
  } catch (err) {
    console.error("HDHive 获取页面失败", err);
    _cachedActionId = DECRYPT_ACTION_ID_FALLBACK;
    return _cachedActionId;
  }

  // 提取所有 /_next/static/chunks/*.js 路径（去重）
  const chunkPattern = /\/_next\/static\/chunks\/[^"'<> ]+\.js/g;
  const allMatches = html.match(chunkPattern) || [];
  const chunkPaths = [...new Set(allMatches)];

  // 第二步：遍历 chunk，精准匹配函数名为 "decrypt" 的 Server Action ID
  // 实际 JS 格式: (0,k.createServerReference)("40[40位hex]",k.callServer,void 0,k.findSourceMapURL,"decrypt")
  // encrypte 函数只会把数据再次加密（无用），checkIn 是签到，两者都要排除
  const precisePattern = /["'](40[0-9a-fA-F]{40})["'][\s\S]{0,240}?["']decrypt["']/;
  for (let i = 0; i < chunkPaths.length; i++) {
    try {
      const chunkResp = await Widget.http.get(`${BASE_URL}${chunkPaths[i]}`, {
        headers: buildHeaders(cookieString, {})
      });
      const chunkText = typeof chunkResp.data === "string" ? chunkResp.data : "";
      const preciseMatch = chunkText.match(precisePattern);
      if (preciseMatch) {
        const id = preciseMatch[1];
        console.log(`HDHive 自动获取 Next-Action ID 成功: ${id}`);
        _cachedActionId = id;
        return id;
      }
    } catch (err) {
      // chunk 拉取失败，继续
    }
  }

  console.error("HDHive 未能自动获取 Next-Action ID，使用内置备用 ID");
  _cachedActionId = DECRYPT_ACTION_ID_FALLBACK;
  return _cachedActionId;
}

function parseCookieInput(input) {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        return arr
          .filter(item => item && item.name)
          .map(item => `${item.name}=${item.value || ""}`)
          .join("; ");
      }
    } catch (err) {
      console.error("Cookie JSON 解析失败，将作为原始字符串使用", err);
    }
  }

  return trimmed;
}

function buildHeaders(cookieString, extraHeaders) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": `${BASE_URL}${MOVIE_PATH}`,
    ...extraHeaders
  };

  if (cookieString) {
    headers.Cookie = cookieString;
  }

  return headers;
}

async function fetchEncryptedMovieList(page, cookieString) {
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const url = `${BASE_URL}${MOVIE_API_PATH}?page_size=${PAGE_SIZE}&page=${pageNumber}&share_num_gt=0`;
  let response = null;

  try {
    response = await Widget.http.get(url, {
    headers: buildHeaders(cookieString, {
      "Accept": "application/json, text/plain, */*"
    })
    });
  } catch (err) {
    console.error(`请求失败: ${url}`, err);
    return null;
  }

  if (!response || !response.data) {
    return null;
  }

  return typeof response.data === "string" ? JSON.parse(response.data) : response.data;
}

function extractActionResultPayload(text) {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!/^\d+:/.test(line)) continue;

    const payload = line.replace(/^\d+:/, "").trim();
    if (!payload) continue;
    if (payload.startsWith("{\"a\":")) continue;
    if (payload.startsWith("E{")) continue;

    try {
      return JSON.parse(payload);
    } catch (err) {
      continue;
    }
  }

  return null;
}

async function decryptPayload(encryptedText, cookieString) {
  const actionId = await fetchDecryptActionId(cookieString);
  if (!actionId) {
    console.error("HDHive 无法获取 Next-Action ID，解密跳过");
    return null;
  }

  const body = JSON.stringify([encryptedText]);
  const url = `${BASE_URL}${MOVIE_PATH}`;
  const headers = buildHeaders(cookieString, {
    "Accept": "text/x-component",
    "Content-Type": "text/plain;charset=UTF-8",
    "Next-Action": actionId
  });
  const attempts = [
    async function () {
      return await Widget.http.post(url, body, { headers: headers });
    },
    async function () {
      return await Widget.http.request({
        url: url,
        method: "POST",
        headers: headers,
        body: body
      });
    },
    async function () {
      return await Widget.http.request({
        url: url,
        method: "POST",
        headers: headers,
        body: [encryptedText]
      });
    }
  ];

  let response = null;
  for (let i = 0; i < attempts.length; i += 1) {
    try {
      response = await attempts[i]();
      if (response && typeof response.data === "string") {
        break;
      }
    } catch (err) {
      console.error(`HDHive 解密请求方式 ${i + 1} 失败`, err);
    }
  }

  if (!response || typeof response.data !== "string") {
    console.error("HDHive 解密请求全部失败");
    return null;
  }

  const decrypted = extractActionResultPayload(response.data);
  if (!decrypted) {
    console.error("HDHive 解密 action 返回内容无法解析");
    return null;
  }

  return decrypted;
}

function normalizeMovieItem(item) {
  if (!item || item.type !== "movie") {
    return null;
  }

  const tmdbIdNum = item.tmdb_id ? Number(item.tmdb_id) : 0;

  if (tmdbIdNum) {
    return {
      id: tmdbIdNum,
      type: "tmdb",
      title: item.title || "",
      releaseDate: item.release_date || "",
      posterPath: item.poster_path || "",
      backdropPath: item.backdrop_path || "",
      rating: item.tmdb_rating || item.douban_rating || item.imdb_rating || 0,
      mediaType: "movie"
    };
  }

  console.log(`"${item.title}" 缺少 tmdb_id，跳过`);
  return null;
}

async function recentMovies(params) {
  const cookieString = parseCookieInput(params.cookie || "");
  const page = params.page || 1;
  const encryptedResponse = await fetchEncryptedMovieList(page, cookieString);

  if (!encryptedResponse || !encryptedResponse.data) {
    console.error("未获取到 HDHive 列表接口数据");
    return [];
  }

  const decryptedItems = await decryptPayload(encryptedResponse.data, cookieString);
  if (!Array.isArray(decryptedItems) || decryptedItems.length === 0) {
    console.error("HDHive 列表解密后为空");
    return [];
  }

  const results = decryptedItems
    .map(normalizeMovieItem)
    .filter(Boolean);

  console.log(`HDHive 第 ${page} 页返回 ${results.length} 部电影`);
  return results;
}
