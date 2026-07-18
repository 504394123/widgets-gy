const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const NEW_BASE_URL = "https://www.xn--wcv59z.com";

function loadWidget(filename, handlers = {}) {
  const httpCalls = [];
  const tmdbCalls = [];
  const context = {
    console: {
      log() {},
      error() {},
      warn() {},
    },
    Widget: {
      http: {
        get: async (url, options = {}) => {
          httpCalls.push({ url, options });
          if (!handlers.httpGet) throw new Error(`Unexpected HTTP GET: ${url}`);
          return handlers.httpGet(url, options);
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
    metadata: vm.runInContext("WidgetMetadata", context),
    call(expression) {
      return vm.runInContext(expression, context);
    },
  };
}

function changePayload(type, rows) {
  return {
    ty: type,
    t: rows.map((row) => row.title),
    i: rows.map((row) => row.id),
    d: rows.map((row) => row.rating || 0),
    a: rows.map((row) => [row.year || 0]),
  };
}

async function testMainRequiresCookieAndNeverUsesPublicFeed() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      throw new Error(`gying.js must not use a public fallback: ${url}`);
    },
  });

  assert.equal(widget.metadata.site, `${NEW_BASE_URL}/`);
  const items = await widget.call('recentMovies({ page: 1, genre: "科幻" })');

  assert.equal(items.length, 0);
  assert.equal(widget.httpCalls.length, 0);
  assert.equal(widget.tmdbCalls.length, 0);
}

async function testMainKeepsFilteredPagingWithCurrentCookie() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      assert.equal(url, `${NEW_BASE_URL}/res/tv`);
      assert.equal(options.params.page, 2);
      assert.equal(options.params.sort, "addtime");
      assert.equal(options.params.genre, "科幻");
      assert.equal(options.params.region, "美国");
      assert.equal(options.params.year, "2025");
      assert.equal(options.params.quality, "4K");
      assert.equal(options.params.rrange, "7_10");
      assert.equal(options.params.srange, "10000");
      assert.equal(options.headers.Referer, `${NEW_BASE_URL}/`);
      assert.equal(options.headers.Cookie, "app_auth=new; browser_verified=proof");
      const offset = (options.params.page - 1) * 48;
      const rows = Array.from({ length: 48 }, (_, index) => ({
        title: `剧集 ${offset + index}`,
        id: `tv${offset + index}`,
      }));
      return {
        data: {
          page: { pages: 50 },
          inlist: {
            t: rows.map((row) => row.title),
            i: rows.map((row) => row.id),
            d: rows.map(() => 8.2),
            z: rows.map(() => 12),
            a: rows.map(() => [2026]),
          },
        },
      };
    },
  });

  const cookie = JSON.stringify([
    { name: "app_auth", value: "old" },
    { name: "app_auth", value: "new" },
    { name: "browser_verified", value: "proof" },
  ]);
  const items = await widget.call(`recentTV({
    page: 5,
    cookie: ${JSON.stringify(cookie)},
    genre: "科幻",
    area: "美国",
    year: "2025",
    quality: "4K",
    rrange: "7_10",
    srange: "10000"
  })`);

  assert.equal(items.length, 12);
  assert.equal(items[0].title, "剧集 48");
  assert.equal(items[0].rating, 8.2);
  assert.equal(items[0].type, "url");
  assert.equal(items[0].mediaType, "tv");
  assert.equal(items[0].posterPath, "https://s.tutu.pm/img/tv/tv48/256.webp");
}

async function testMainDoesNotFallbackWhenVerificationExpired() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期，请刷新页面" } };
      }
      throw new Error(`gying.js must not use a public fallback: ${url}`);
    },
  });

  const items = await widget.call(
    'recentMovies({ page: 2, genre: "科幻", cookie: "app_auth=x" })'
  );
  assert.equal(items.length, 0);
  assert.deepEqual(
    widget.httpCalls.map((call) => call.url),
    [`${NEW_BASE_URL}/res/mv`]
  );
}

async function testMainDoesNotFallbackWhenCategoryRequestFails() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      assert.equal(url, `${NEW_BASE_URL}/res/ac`);
      throw new Error("network unavailable");
    },
  });

  const items = await widget.call(
    'recentAnime({ page: 1, genre: "科幻", cookie: "app_auth=x" })'
  );
  assert.equal(items.length, 0);
  assert.deepEqual(
    widget.httpCalls.map((call) => call.url),
    [`${NEW_BASE_URL}/res/ac`]
  );
}

async function testHomeFeedIsPublicAndContinuesPastDuplicates() {
  const widget = loadWidget("gying_home.js", {
    httpGet: async (url, options) => {
      assert.equal(options.headers.Referer, `${NEW_BASE_URL}/`);
      const index = Number(url.split("/").pop());
      const batches = {
        1: [
          { title: "剧集甲", id: "a", rating: 8.2, year: 2026 },
          { title: "剧集乙", id: "b", rating: 7.8, year: 2025 },
        ],
        2: [{ title: "剧集乙", id: "b", rating: 7.8, year: 2025 }],
        3: [{ title: "剧集丙", id: "c", rating: 7.4, year: 2024 }],
        4: [],
      };
      assert.equal(url, `${NEW_BASE_URL}/res/change/tv/${index}`);
      return { data: changePayload("tv", batches[index] || []) };
    },
  });

  assert.equal(widget.metadata.site, `${NEW_BASE_URL}/`);
  const items = await widget.call("recentTV()");

  assert.equal(items.length, 3);
  assert.equal(items[2].title, "剧集丙");
  assert.equal(items[2].type, "url");
  assert.equal(items[2].mediaType, "tv");
  assert.match(items[2].link, /^source:/);
  assert.equal(items[2].posterPath, "https://s.tutu.pm/img/tv/c/256.webp");
  widget.context.__sourceLink = items[2].link;
  const detail = await widget.call("loadDetail(__sourceLink)");
  assert.equal(detail.title, "剧集丙");
  assert.equal(detail.mediaType, "tv");
  assert.equal(widget.httpCalls.some((call) => call.options.headers.Cookie), false);
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

async function testLivePublicFeeds() {
  const handlers = {
    httpGet: liveHttpGet,
    tmdbGet: async () => ({ results: [] }),
  };
  const main = loadWidget("gying.js", handlers);
  const invalidCookieItems = await main.call(
    'recentMovies({ page: 1, genre: "科幻", cookie: "app_auth=invalid; browser_verified=invalid" })'
  );
  assert.equal(invalidCookieItems.length, 0);
  assert.ok(main.httpCalls.some((call) => call.url === `${NEW_BASE_URL}/res/mv`));
  assert.equal(main.httpCalls.some((call) => call.url.includes("/res/change/")), false);

  const home = loadWidget("gying_home.js", handlers);
  const homeItems = await home.call("recentMovies()");
  assert.ok(homeItems.length >= 12);
  assert.equal(homeItems[0].mediaType, "movie");
}

const tests = [
  testMainRequiresCookieAndNeverUsesPublicFeed,
  testMainKeepsFilteredPagingWithCurrentCookie,
  testMainDoesNotFallbackWhenVerificationExpired,
  testMainDoesNotFallbackWhenCategoryRequestFails,
  testHomeFeedIsPublicAndContinuesPastDuplicates,
];
if (process.env.GYING_LIVE === "1") tests.push(testLivePublicFeeds);

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
