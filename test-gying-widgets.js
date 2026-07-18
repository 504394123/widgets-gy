const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const LOCAL_BASE_URL = "http://192.168.3.50:21111";

function loadWidget(filename, handlers = {}) {
  const httpCalls = [];
  const tmdbCalls = [];
  const logs = { log: [], error: [], warn: [] };
  const context = {
    setTimeout,
    clearTimeout,
    console: {
      log(...args) { logs.log.push(args.map(String).join(" ")); },
      error(...args) { logs.error.push(args.map(String).join(" ")); },
      warn(...args) { logs.warn.push(args.map(String).join(" ")); },
    },
    Widget: {
      http: {
        get: async (url, options = {}) => {
          httpCalls.push({ method: "GET", url, options });
          if (!handlers.httpGet) throw new Error(`Unexpected HTTP GET: ${url}`);
          return handlers.httpGet(url, options);
        },
        post: async (url, body, options = {}) => {
          httpCalls.push({ method: "POST", url, body, options });
          if (!handlers.httpPost) throw new Error(`Unexpected HTTP POST: ${url}`);
          return handlers.httpPost(url, body, options);
        },
      },
      tmdb: {
        get: async (api, options = {}) => {
          tmdbCalls.push({ api, options });
          return handlers.tmdbGet ? handlers.tmdbGet(api, options) : { results: [] };
        },
      },
    },
    WidgetMetadata: {},
  };

  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, filename), "utf8"),
    context,
    { filename }
  );

  return {
    context,
    httpCalls,
    tmdbCalls,
    logs,
    metadata: vm.runInContext("WidgetMetadata", context),
    call(expression) {
      return vm.runInContext(expression, context);
    },
  };
}

function browsePayload(type, rows, currentPage = 1, maxPage = 50) {
  return {
    data: {
      items: rows.map((row) => ({
        href: `/${type}/${row.id}`,
        title: row.title,
        poster: row.poster || `/api/poster?url=${encodeURIComponent(`https://images.example/${type}/${row.id}.webp`)}`,
        quality: row.quality || "",
        rating: row.rating === undefined ? "" : String(row.rating),
        tag: row.year === undefined ? "" : String(row.year),
        type,
      })),
      currentPage,
      maxPage,
    },
  };
}

async function testMainUsesLocalServiceWithoutAuthentication() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      assert.equal(url, `${LOCAL_BASE_URL}/api/browse`);
      assert.equal(options.params.type, "mv");
      assert.equal(options.params.page, 1);
      assert.equal(options.params.sort, "addtime");
      assert.equal(options.params.rrange, "0_10");
      assert.equal(options.params.srange, "0");
      assert.equal(Object.hasOwn(options, "headers"), false);
      return {
        data: browsePayload("mv", Array.from({ length: 48 }, (_, index) => ({
          title: `本地电影 ${index}`,
          id: `mv${index}`,
          rating: 7.1,
          year: 2026,
        }))),
      };
    },
  });

  assert.equal(widget.metadata.site, `${LOCAL_BASE_URL}/`);
  assert.equal(widget.metadata.version, "5.0.0");
  assert.equal(Object.hasOwn(widget.metadata, "globalParams"), false);
  assert.doesNotMatch(JSON.stringify(widget.metadata), /Cookie|User-Agent|app_auth|browser_verified/);
  const items = await widget.call('recentMovies({ page: 1, genre: "科幻" })');

  assert.equal(items.length, 12);
  assert.equal(items[0].title, "本地电影 0");
  assert.equal(items[0].type, "url");
  assert.equal(items[0].mediaType, "movie");
  assert.equal(
    items[0].posterPath,
    `${LOCAL_BASE_URL}/api/poster?url=${encodeURIComponent("https://images.example/mv/mv0.webp")}`
  );
  assert.equal(widget.httpCalls.length, 1);
  assert.equal(widget.tmdbCalls.length, 12);
}

async function testMainMetadataMatchesLocalFilterGroups() {
  const widget = loadWidget("gying.js");
  const expectedParamNames = [
    "page", "sort_by", "genre", "area", "lang", "year", "quality", "state",
    "rrange", "srange", "trange", "timetype", "imdb", "playable",
  ];

  for (const module of widget.metadata.modules) {
    assert.deepEqual(Array.from(module.params, (param) => param.name), expectedParamNames);
    const params = Object.fromEntries(Array.from(module.params, (param) => [param.name, param]));
    assert.deepEqual(
      Array.from(params.quality.enumOptions, (option) => option.value),
      ["", "720P", "1080P", "4K", "3D", "BD", "HDR", "DV", "原盘"]
    );
    assert.deepEqual(
      Array.from(params.state.enumOptions, (option) => option.value),
      ["", "预告", "抢先版"]
    );
    assert.ok(params.area.enumOptions.some((option) => option.value === "澳大利亚"));
    assert.ok(params.lang.enumOptions.some((option) => option.value === "无对白"));
    assert.ok(params.year.enumOptions.some((option) => option.value === "3"));
    assert.ok(params.year.enumOptions.some((option) => option.value === "1"));
  }

  const anime = widget.metadata.modules.find((module) => module.id === "recentAnime");
  const animeGenre = anime.params.find((param) => param.name === "genre");
  assert.ok(animeGenre.enumOptions.some((option) => option.value === "萌系"));
  assert.equal(animeGenre.enumOptions.some((option) => option.value === "萝系"), false);
}

async function testMainKeepsFilteredPagingThroughLocalProxy() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      assert.equal(url, `${LOCAL_BASE_URL}/api/browse`);
      assert.equal(options.params.type, "tv");
      assert.equal(options.params.page, 2);
      assert.equal(options.params.sort, "score");
      assert.equal(options.params.genre, "科幻");
      assert.equal(options.params.region, "美国");
      assert.equal(options.params.year, "2025");
      assert.equal(options.params.quality, "4K");
      assert.equal(options.params.lang, "英语");
      assert.equal(options.params.state, "抢先版");
      assert.equal(options.params.rrange, "7_10");
      assert.equal(options.params.srange, "10000");
      assert.equal(options.params.trange, "30");
      assert.equal(options.params.timetype, "uptime");
      assert.equal(options.params.imdb, "1");
      assert.equal(options.params.playable, "1");
      assert.equal(Object.hasOwn(options, "headers"), false);
      const offset = (options.params.page - 1) * 48;
      const rows = Array.from({ length: 48 }, (_, index) => ({
        title: `剧集 ${offset + index}`,
        id: `tv${offset + index}`,
        rating: 8.2,
        year: 2026,
      }));
      return {
        data: browsePayload("tv", rows, options.params.page),
      };
    },
  });

  const items = await widget.call(`recentTV({
    page: 5,
    sort_by: "score",
    genre: "科幻",
    area: "美国",
    year: "2025",
    quality: "4K",
    lang: "英语",
    state: "抢先版",
    rrange: "7_10",
    srange: "10000",
    trange: "30",
    timetype: "uptime",
    imdb: "1",
    playable: "1"
  })`);

  assert.equal(items.length, 12);
  assert.equal(items[0].title, "剧集 48");
  assert.equal(items[0].rating, 8.2);
  assert.equal(items[0].type, "url");
  assert.equal(items[0].mediaType, "tv");
  assert.match(items[0].posterPath, /^http:\/\/192\.168\.3\.50:21111\/api\/poster\?/);
  assert.equal(Object.hasOwn(widget.tmdbCalls[0].options.params, "first_air_date_year"), false);
}

async function testMainAcceptsJsonStringAndMatchesMovieYear() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      assert.equal(url, `${LOCAL_BASE_URL}/api/browse`);
      assert.equal(options.params.type, "mv");
      return {
        data: JSON.stringify(browsePayload("mv", [{
          title: "年份电影",
          id: "year-movie",
          rating: 7.1,
          year: 2024,
        }])),
      };
    },
    tmdbGet: async (api, options) => {
      assert.equal(api, "search/movie");
      assert.equal(options.params.query, "年份电影");
      assert.equal(options.params.year, 2024);
      return {
        results: [{
          id: 123,
          title: "TMDB 年份电影",
          poster_path: "/tmdb.webp",
          vote_average: 8.8,
        }],
      };
    },
  });

  const items = await widget.call("recentMovies({ page: 1 })");
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 123);
  assert.equal(items[0].type, "tmdb");
  assert.equal(items[0].mediaType, "movie");
  assert.equal(items[0].title, "TMDB 年份电影");
}

async function testMainSlicesOneLocalPageAcrossFourForwardPages() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      assert.equal(url, `${LOCAL_BASE_URL}/api/browse`);
      assert.equal(options.params.type, "ac");
      assert.equal(options.params.page, 1);
      return {
        data: browsePayload("ac", Array.from({ length: 48 }, (_, index) => ({
          title: `动漫 ${index}`,
          id: `ac${index}`,
        }))),
      };
    },
  });

  const items = await widget.call("recentAnime({ page: 2 })");
  assert.equal(items.length, 12);
  assert.equal(items[0].title, "动漫 12");
  assert.equal(items[11].title, "动漫 23");
}

async function testMainUsesCorrectGyingTypeForEveryCategory() {
  const cases = [
    { handler: "recentMovies", type: "mv" },
    { handler: "recentTV", type: "tv" },
    { handler: "recentAnime", type: "ac" },
  ];

  for (const testCase of cases) {
    const widget = loadWidget("gying.js", {
      httpGet: async (url, options) => {
        assert.equal(url, `${LOCAL_BASE_URL}/api/browse`);
        assert.equal(options.params.type, testCase.type);
        return { data: browsePayload(testCase.type, []) };
      },
    });

    assert.equal((await widget.call(`${testCase.handler}({ page: 1 })`)).length, 0);
    assert.equal(widget.httpCalls.length, 1);
    assert.equal(widget.httpCalls.some((call) => call.url.includes("/api/mukaku/")), false);
    assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/change/")), false);
  }
}

async function testMainKeepsLocalPosterInSourceDetail() {
  const widget = loadWidget("gying.js", {
    httpGet: async () => {
      return {
        data: browsePayload("mv", [{
          title: "本地详情电影",
          id: "local-detail",
          poster: "/api/poster?url=encoded-source",
          rating: 6.6,
          year: 2025,
        }]),
      };
    },
  });

  const items = await widget.call("recentMovies({ page: 1 })");
  assert.equal(items.length, 1);
  assert.equal(items[0].posterPath, `${LOCAL_BASE_URL}/api/poster?url=encoded-source`);
  widget.context.__sourceLink = items[0].link;
  const detail = await widget.call("loadDetail(__sourceLink)");
  assert.equal(detail.id, `${LOCAL_BASE_URL}/mv/local-detail`);
  assert.equal(detail.title, "本地详情电影");
  assert.equal(detail.posterPath, items[0].posterPath);
  assert.equal(detail.rating, 6.6);
}

async function testMainNormalizesAbsoluteSourceAndProtocolRelativePoster() {
  const widget = loadWidget("gying.js", {
    httpGet: async () => ({
      data: {
        data: {
          items: [{
            href: `${LOCAL_BASE_URL}/tv/absolute-id?from=proxy`,
            title: "完整地址剧集",
            poster: "//images.example/poster.webp",
            rating: "7.7",
            tag: "2025",
            type: "tv",
          }],
          currentPage: 1,
          maxPage: 1,
        },
      },
    }),
  });

  const items = await widget.call("recentTV({ page: 1 })");
  assert.equal(items.length, 1);
  assert.equal(items[0].id, `${LOCAL_BASE_URL}/tv/absolute-id`);
  assert.equal(items[0].posterPath, "http://images.example/poster.webp");
}

async function testMainDoesNotFallbackWhenLocalRequestFails() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      assert.equal(url, `${LOCAL_BASE_URL}/api/browse`);
      throw new Error("network unavailable");
    },
  });

  assert.equal((await widget.call('recentAnime({ page: 1, genre: "科幻" })')).length, 0);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [`${LOCAL_BASE_URL}/api/browse`]);
  assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/")), false);
  const errors = widget.logs.error.join("\n");
  assert.match(errors, /本地 Gying 服务|192\.168\.3\.50:21111/);
  assert.doesNotMatch(errors, /Cookie|browser_verified|419/);
}

async function testHomeUsesLocalServiceForEverySection() {
  const rowsByType = {
    mv: [{ title: "首页电影", id: "home-movie", rating: 8.2, year: 2026 }],
    tv: [{ title: "首页剧集", id: "home-tv", rating: 7.8, year: 2025 }],
    ac: [{ title: "首页动漫", id: "home-anime", rating: 7.4, year: 2024 }],
  };
  const sections = Object.entries(rowsByType).map(([type, rows]) => ({
    type,
    title: type,
    items: browsePayload(type, rows).data.items,
  }));
  const cases = [
    { handler: "recentMovies", type: "mv", title: "首页电影", mediaType: "movie" },
    { handler: "recentTV", type: "tv", title: "首页剧集", mediaType: "tv" },
    { handler: "recentAnime", type: "ac", title: "首页动漫", mediaType: "tv" },
  ];

  for (const testCase of cases) {
    const widget = loadWidget("gying_home.js", {
      httpGet: async (url, options) => {
        assert.equal(url, `${LOCAL_BASE_URL}/api/home`);
        assert.equal(Object.hasOwn(options, "headers"), false);
        return { data: JSON.stringify({ data: sections }) };
      },
    });

    assert.equal(widget.metadata.site, `${LOCAL_BASE_URL}/`);
    assert.equal(widget.metadata.version, "4.0.0");
    assert.equal(Object.hasOwn(widget.metadata, "globalParams"), false);
    assert.deepEqual(
      Array.from(widget.metadata.modules, (module) => module.id),
      ["recentMovies", "recentTV", "recentAnime"]
    );
    assert.doesNotMatch(JSON.stringify(widget.metadata), /Cookie|User-Agent|app_auth|browser_verified/);

    const items = await widget.call(`${testCase.handler}()`);
    assert.equal(items.length, 1);
    assert.equal(items[0].title, testCase.title);
    assert.equal(items[0].type, "url");
    assert.equal(items[0].mediaType, testCase.mediaType);
    assert.equal(items[0].id, `${LOCAL_BASE_URL}/${testCase.type}/${rowsByType[testCase.type][0].id}`);
    assert.match(items[0].posterPath, /^http:\/\/192\.168\.3\.50:21111\/api\/poster\?/);
    assert.equal(widget.httpCalls.length, 1);
    assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/")), false);
  }
}

async function liveHttpGet(url, options = {}) {
  const target = new URL(url);
  Object.entries(options.params || {}).forEach(([name, value]) => {
    target.searchParams.set(name, String(value));
  });
  const response = await fetch(target, { headers: options.headers || {} });
  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_error) {
    // Widget.http exposes non-JSON responses as strings.
  }
  return {
    data,
    status: response.status,
  };
}

async function testLiveLocalService() {
  const handlers = {
    httpGet: liveHttpGet,
    tmdbGet: async () => ({ results: [] }),
  };
  const main = loadWidget("gying.js", handlers);
  const movies = await main.call('recentMovies({ page: 1, genre: "科幻", area: "美国" })');
  const tv = await main.call('recentTV({ page: 1, genre: "科幻", area: "美国" })');
  const anime = await main.call("recentAnime({ page: 1 })");

  assert.ok(movies.length > 0 && movies.length <= 12);
  assert.ok(tv.length > 0 && tv.length <= 12);
  assert.ok(anime.length > 0 && anime.length <= 12);
  assert.ok(main.httpCalls.every((call) => call.url === `${LOCAL_BASE_URL}/api/browse`));
  assert.deepEqual(main.httpCalls.map((call) => call.options.params.type), ["mv", "tv", "ac"]);
  assert.notEqual(movies[0].title, tv[0].title);
  assert.ok([movies[0], tv[0], anime[0]].every((item) => item.posterPath));

  const home = loadWidget("gying_home.js", handlers);
  const homeMovies = await home.call("recentMovies()");
  const homeTV = await home.call("recentTV()");
  const homeAnime = await home.call("recentAnime()");
  assert.ok(homeMovies.length > 0 && homeMovies.length <= 12);
  assert.ok(homeTV.length > 0 && homeTV.length <= 12);
  assert.ok(homeAnime.length > 0 && homeAnime.length <= 12);
  assert.ok(home.httpCalls.every((call) => call.url === `${LOCAL_BASE_URL}/api/home`));
  assert.notEqual(homeMovies[0].title, homeTV[0].title);
  assert.ok([homeMovies[0], homeTV[0], homeAnime[0]].every((item) => item.posterPath));
}

const tests = [
  testMainUsesLocalServiceWithoutAuthentication,
  testMainMetadataMatchesLocalFilterGroups,
  testMainKeepsFilteredPagingThroughLocalProxy,
  testMainAcceptsJsonStringAndMatchesMovieYear,
  testMainSlicesOneLocalPageAcrossFourForwardPages,
  testMainUsesCorrectGyingTypeForEveryCategory,
  testMainKeepsLocalPosterInSourceDetail,
  testMainNormalizesAbsoluteSourceAndProtocolRelativePoster,
  testMainDoesNotFallbackWhenLocalRequestFails,
  testHomeUsesLocalServiceForEverySection,
];
if (process.env.GYING_LIVE === "1") tests.push(testLiveLocalService);

(async () => {
  const failures = [];
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      failures.push({ name: test.name, error });
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure.name}`);
      console.error(failure.error);
    }
    process.exit(1);
  }

  console.log(`gying widget tests passed (${tests.length})`);
})();
