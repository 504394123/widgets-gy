const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const NEW_BASE_URL = "https://www.xn--wcv59z.com";

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

function createCredentialFlow(options = {}) {
  const username = options.username || "tester+forward@example.com";
  const password = options.password || "S3cure&p=ass";
  const state = {
    challengePageCalls: 0,
    challengeCalls: 0,
    verificationCalls: 0,
    loginCalls: 0,
    categoryCalls: 0,
  };

  const handlers = {
    httpGet: async (url, requestOptions) => {
      if (url === `${NEW_BASE_URL}/mv`) {
        state.challengePageCalls += 1;
        assert.equal(requestOptions.headers["User-Agent"], "CredentialBrowser/1.0");
        if (state.loginCalls > 0) {
          assert.match(requestOptions.headers.Cookie, /app_auth=auth/);
        } else {
          assert.equal(requestOptions.headers.Cookie, undefined);
        }
        return {
          data: "<html>challenge</html>",
          headers: "Set-Cookie: browser_pow=pow; Path=/; HttpOnly",
        };
      }
      if (url === `${NEW_BASE_URL}/res/pow`) {
        state.challengeCalls += 1;
        assert.match(requestOptions.headers.Cookie, /browser_pow=pow/);
        if (state.loginCalls > 0) {
          assert.match(requestOptions.headers.Cookie, /app_auth=auth/);
        }
        return { data: { N: "f", x: "2", t: 0 } };
      }
      if (url === `${NEW_BASE_URL}/res/mv`) {
        state.categoryCalls += 1;
        assert.match(requestOptions.headers.Cookie, /browser_verified=verified/);
        assert.match(requestOptions.headers.Cookie, /app_auth=auth/);
        if (options.assertCategoryRequest) {
          options.assertCategoryRequest(requestOptions, state.categoryCalls);
        }
        if (options.expireFirstCategory && state.categoryCalls === 1) {
          return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期" } };
        }
        const rows = Array.from({ length: 48 }, (_, index) => ({
          title: `账号电影 ${index}`,
          id: `credential${index}`,
        }));
        return {
          data: {
            inlist: {
              t: rows.map((row) => row.title),
              i: rows.map((row) => row.id),
              d: rows.map(() => 8.1),
              a: rows.map(() => [2026]),
            },
          },
        };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
    httpPost: async (url, body, requestOptions) => {
      if (url === `${NEW_BASE_URL}/res/pow`) {
        state.verificationCalls += 1;
        assert.equal(body, "y=2");
        assert.match(requestOptions.headers.Cookie, /browser_pow=pow/);
        if (state.loginCalls > 0) {
          assert.match(requestOptions.headers.Cookie, /app_auth=auth/);
        }
        return {
          data: { success: true },
          headers: [
            "Set-Cookie: browser_verified=verified; Path=/; HttpOnly",
            "Set-Cookie: browser_pow=gone; Max-Age=0; Path=/",
          ].join("\n"),
        };
      }
      if (url === `${NEW_BASE_URL}/user/login`) {
        state.loginCalls += 1;
        const fields = new URLSearchParams(body);
        assert.equal(fields.get("code"), "");
        assert.equal(fields.get("siteid"), "1");
        assert.equal(fields.get("dosubmit"), "1");
        assert.equal(fields.get("cookietime"), "10506240");
        assert.equal(fields.get("username"), username);
        assert.equal(fields.get("password"), password);
        assert.equal(requestOptions.allow_redirects, false);
        assert.equal(requestOptions.headers["Content-Type"], "application/x-www-form-urlencoded");
        assert.equal(requestOptions.headers.Referer, `${NEW_BASE_URL}/user/login`);
        assert.equal(requestOptions.headers.Origin, NEW_BASE_URL);
        assert.equal(requestOptions.headers["User-Agent"], "CredentialBrowser/1.0");
        assert.match(requestOptions.headers.Cookie, /browser_verified=verified/);
        return options.loginResponse || {
          data: { code: "200", msg: "登录成功" },
          headers: "Set-Cookie: app_auth=auth; Path=/; HttpOnly",
        };
      }
      throw new Error(`Unexpected HTTP POST: ${url}`);
    },
  };

  return { handlers, password, state, username };
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
    httpGet: async (url, options) => {
      throw new Error(`gying.js must not use a public fallback: ${url}`);
    },
  });

  assert.equal(widget.metadata.site, `${NEW_BASE_URL}/`);
  const items = await widget.call('recentMovies({ page: 1, genre: "科幻" })');

  assert.equal(items.length, 0);
  assert.equal(widget.httpCalls.length, 0);
  assert.equal(widget.tmdbCalls.length, 0);
}

async function testMainDeclaresOptionalCredentialInputs() {
  const widget = loadWidget("gying.js");
  const params = Object.fromEntries(
    widget.metadata.globalParams.map((param) => [param.name, param])
  );

  assert.equal(params.authMode.type, "enumeration");
  assert.equal(params.authMode.value, "cookie");
  assert.deepEqual(
    Array.from(params.authMode.enumOptions, (option) => String(option.value)),
    ["cookie", "account"]
  );
  assert.equal(params.username.type, "input");
  assert.equal(params.password.type, "input");
  assert.equal(Object.hasOwn(params.username, "value"), false);
  assert.equal(Object.hasOwn(params.password, "value"), false);
}

async function testMainLogsInWithCredentialsAndReusesSession() {
  const flow = createCredentialFlow();
  const widget = loadWidget("gying.js", flow.handlers);
  widget.context.setTimeout = (callback) => {
    callback();
    return 0;
  };
  widget.context.__credentialParams = {
    authMode: "account",
    username: flow.username,
    password: flow.password,
    cookie: "app_auth=wrong; browser_verified=wrong",
    userAgent: "CredentialBrowser/1.0",
    page: 1,
    genre: "科幻",
  };

  const firstItems = await widget.call("recentMovies(__credentialParams)");
  widget.context.__credentialParams.page = 2;
  const secondItems = await widget.call("recentMovies(__credentialParams)");

  assert.equal(firstItems.length, 12);
  assert.equal(secondItems.length, 12);
  assert.equal(firstItems[0].title, "账号电影 0");
  assert.equal(secondItems[0].title, "账号电影 12");
  assert.equal(flow.state.challengePageCalls, 1);
  assert.equal(flow.state.challengeCalls, 1);
  assert.equal(flow.state.verificationCalls, 1);
  assert.equal(flow.state.loginCalls, 1);
  assert.equal(flow.state.categoryCalls, 2);
}

async function testMainKeepsLoginSessionWhenVerificationExpires() {
  const flow = createCredentialFlow({
    expireFirstCategory: true,
    assertCategoryRequest(requestOptions) {
      assert.equal(requestOptions.params.genre, "科幻");
      assert.equal(requestOptions.params.region, "美国");
      assert.equal(requestOptions.params.year, "2026");
      assert.equal(requestOptions.params.quality, "4K");
    },
  });
  const widget = loadWidget("gying.js", flow.handlers);
  widget.context.setTimeout = (callback) => {
    callback();
    return 0;
  };
  widget.context.__credentialParams = {
    authMode: "account",
    username: flow.username,
    password: flow.password,
    userAgent: "CredentialBrowser/1.0",
    page: 1,
    genre: "科幻",
    area: "美国",
    year: "2026",
    quality: "4K",
  };

  const items = await widget.call("recentMovies(__credentialParams)");

  assert.equal(items.length, 12);
  assert.equal(flow.state.loginCalls, 1);
  assert.equal(flow.state.categoryCalls, 2);
  assert.equal(flow.state.challengePageCalls, 2);
  assert.equal(flow.state.challengeCalls, 2);
  assert.equal(flow.state.verificationCalls, 2);
}

async function testMainKeepsAuthenticationModesIsolated() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, requestOptions) => {
      assert.equal(url, `${NEW_BASE_URL}/res/mv`);
      assert.equal(requestOptions.headers.Cookie, "app_auth=cookie; browser_verified=proof");
      return { data: { inlist: { t: [], i: [] } } };
    },
    httpPost: async (url) => {
      throw new Error(`Cookie mode must not POST credentials: ${url}`);
    },
  });
  widget.context.__params = {
    authMode: "cookie",
    cookie: "app_auth=cookie; browser_verified=proof",
    username: "hidden-account",
    password: "hidden-password",
  };

  const items = await widget.call("recentMovies(__params)");

  assert.equal(items.length, 0);
  assert.deepEqual(widget.httpCalls.map((call) => call.method), ["GET"]);
}

async function testMainRejectsIncompleteCredentialsWithoutNetwork() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      throw new Error(`Incomplete credentials must not use GET: ${url}`);
    },
    httpPost: async (url) => {
      throw new Error(`Incomplete credentials must not use POST: ${url}`);
    },
  });
  widget.context.__missingPassword = { authMode: "account", username: "tester" };
  widget.context.__missingUsername = { authMode: "account", password: "secret" };

  assert.equal((await widget.call("recentMovies(__missingPassword)")).length, 0);
  assert.equal((await widget.call("recentMovies(__missingUsername)")).length, 0);
  assert.equal(widget.httpCalls.length, 0);
  assert.match(widget.logs.error.join("\n"), /账号.*密码|密码.*账号/);
}

async function testMainRejectsLoginWhenAppAuthIsHidden() {
  const flow = createCredentialFlow({
    loginResponse: { data: { code: 200, msg: "登录成功" } },
  });
  const widget = loadWidget("gying.js", flow.handlers);
  widget.context.setTimeout = (callback) => {
    callback();
    return 0;
  };
  widget.context.__credentialParams = {
    authMode: "account",
    username: flow.username,
    password: flow.password,
    userAgent: "CredentialBrowser/1.0",
  };

  const items = await widget.call("recentMovies(__credentialParams)");

  assert.equal(items.length, 0);
  assert.equal(flow.state.loginCalls, 1);
  assert.equal(flow.state.categoryCalls, 0);
  assert.match(widget.logs.error.join("\n"), /app_auth/);
}

async function testMainStopsOnCaptchaAndRedactsCredentials() {
  const flow = createCredentialFlow();
  flow.handlers.httpPost = async (url, body, requestOptions) => {
    if (url === `${NEW_BASE_URL}/res/pow`) {
      flow.state.verificationCalls += 1;
      return {
        data: { success: true },
        headers: "Set-Cookie: browser_verified=verified; Path=/; HttpOnly",
      };
    }
    if (url === `${NEW_BASE_URL}/user/login`) {
      flow.state.loginCalls += 1;
      assert.match(requestOptions.headers.Cookie, /browser_verified=verified/);
      return {
        data: {
          code: 400,
          captcha: 2,
          msg: `请重试 ${flow.username} password=${flow.password}`,
        },
      };
    }
    throw new Error(`Unexpected HTTP POST: ${url} ${body}`);
  };
  const widget = loadWidget("gying.js", flow.handlers);
  widget.context.setTimeout = (callback) => {
    callback();
    return 0;
  };
  widget.context.__credentialParams = {
    authMode: "account",
    username: flow.username,
    password: flow.password,
    userAgent: "CredentialBrowser/1.0",
  };

  const items = await widget.call("recentMovies(__credentialParams)");
  const errors = widget.logs.error.join("\n");

  assert.equal(items.length, 0);
  assert.equal(flow.state.loginCalls, 1);
  assert.equal(flow.state.categoryCalls, 0);
  assert.match(errors, /验证码/);
  assert.doesNotMatch(errors, new RegExp(flow.username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(errors, new RegExp(flow.password.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
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

async function testMainRefreshesVerificationAndKeepsFilters() {
  let categoryCalls = 0;
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        categoryCalls += 1;
        assert.equal(options.headers["User-Agent"], "TestBrowser/1.0");
        assert.equal(options.params.page, 2);
        assert.equal(options.params.sort, "addtime");
        assert.equal(options.params.genre, "科幻");
        assert.equal(options.params.region, "美国");
        assert.equal(options.params.year, "2025");
        assert.equal(options.params.quality, "4K");
        assert.equal(options.params.rrange, "7_10");
        assert.equal(options.params.srange, "10000");
        if (categoryCalls === 1) {
          return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期，请刷新页面" } };
        }
        assert.match(options.headers.Cookie, /app_auth=auth/);
        assert.match(options.headers.Cookie, /browser_verified=verified/);
        assert.doesNotMatch(options.headers.Cookie, /browser_verified=stale/);
        const rows = Array.from({ length: 48 }, (_, index) => ({
          title: `电影 ${48 + index}`,
          id: `mv${48 + index}`,
        }));
        return {
          data: {
            page: { pages: 50 },
            inlist: {
              t: rows.map((row) => row.title),
              i: rows.map((row) => row.id),
              d: rows.map(() => 8.2),
              a: rows.map(() => [2025]),
            },
          },
        };
      }
      if (url === `${NEW_BASE_URL}/mv`) {
        assert.equal(options.headers["User-Agent"], "TestBrowser/1.0");
        return {
          data: "<html>challenge</html>",
          headers: [
            "HTTP/2 200",
            "Set-Cookie: browser_pow=pow; Path=/; HttpOnly",
            "",
          ].join(String.fromCharCode(13, 10)),
        };
      }
      if (url === `${NEW_BASE_URL}/res/pow`) {
        assert.equal(options.headers["User-Agent"], "TestBrowser/1.0");
        assert.equal(options.headers.Cookie, "app_auth=auth; browser_pow=pow");
        return {
          data: { N: "f", x: "2", t: 3 },
          responseHeaders: [["Set-Cookie", "browser_pow=pow; Path=/; HttpOnly"]],
        };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
    httpPost: async (url, body, options) => {
      assert.equal(url, `${NEW_BASE_URL}/res/pow`);
      assert.equal(body, "y=1");
      assert.equal(options.headers["Content-Type"], "application/x-www-form-urlencoded");
      assert.equal(options.headers["User-Agent"], "TestBrowser/1.0");
      assert.equal(options.headers.Cookie, "app_auth=auth; browser_pow=pow");
      return {
        data: { success: true },
        meta: {
          headers: [
            {
              name: "Set-Cookie",
              value: "browser_verified=verified; Expires=Wed, 21 Oct 2030 07:28:00 GMT; Path=/; HttpOnly",
            },
            {
              name: "Set-Cookie",
              value: "browser_pow=gone; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0; Path=/",
            },
          ],
        },
      };
    },
  });

  const items = await widget.call(
    'recentMovies({ page: 5, genre: "科幻", area: "美国", year: "2025", quality: "4K", rrange: "7_10", srange: "10000", userAgent: "TestBrowser/1.0", cookie: "app_auth=auth; browser_verified=stale" })'
  );
  assert.equal(items.length, 12);
  assert.equal(items[0].title, "电影 48");
  assert.equal(items[0].type, "url");
  assert.equal(categoryCalls, 2);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [
    `${NEW_BASE_URL}/res/mv`,
    `${NEW_BASE_URL}/mv`,
    `${NEW_BASE_URL}/res/pow`,
    `${NEW_BASE_URL}/res/pow`,
    `${NEW_BASE_URL}/res/mv`,
  ]);
}

async function testMainForcesRefreshWhenCachedVerificationExpires() {
  let categoryCalls = 0;
  let refreshRound = 0;
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        categoryCalls += 1;
        if (categoryCalls === 1 || categoryCalls === 3 || categoryCalls === 4) {
          return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期" } };
        }

        const expectedVerification = categoryCalls === 2 ? "one" : "two";
        assert.match(options.headers.Cookie, new RegExp(`browser_verified=${expectedVerification}`));
        const rows = Array.from({ length: 48 }, (_, index) => ({
          title: `缓存验证 ${index}`,
          id: `cached${index}`,
        }));
        return {
          data: {
            inlist: {
              t: rows.map((row) => row.title),
              i: rows.map((row) => row.id),
              d: rows.map(() => 7.5),
              a: rows.map(() => [2026]),
            },
          },
        };
      }
      if (url === `${NEW_BASE_URL}/mv`) {
        refreshRound += 1;
        return {
          data: "<html>challenge</html>",
          headers: `Set-Cookie: browser_pow=pow${refreshRound}; Path=/; HttpOnly`,
        };
      }
      if (url === `${NEW_BASE_URL}/res/pow`) {
        assert.equal(options.headers.Cookie, `app_auth=auth; browser_pow=pow${refreshRound}`);
        return { data: { N: "f", x: "2", t: 3 } };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
    httpPost: async (url, body, options) => {
      assert.equal(url, `${NEW_BASE_URL}/res/pow`);
      assert.equal(body, "y=1");
      assert.equal(options.headers.Cookie, `app_auth=auth; browser_pow=pow${refreshRound}`);
      return {
        data: { success: true },
        headers: `Set-Cookie: browser_verified=${refreshRound === 1 ? "one" : "two"}; Path=/; HttpOnly`,
      };
    },
  });
  // Keep this regression test fast; the production path still enforces 3 s.
  widget.context.setTimeout = (callback) => {
    callback();
    return 0;
  };

  const expression = 'recentMovies({ page: 1, userAgent: "TestBrowser/1.0", cookie: "app_auth=auth; browser_verified=stale" })';
  const firstItems = await widget.call(expression);
  assert.equal(firstItems.length, 12);
  const secondItems = await widget.call(expression);
  assert.equal(secondItems.length, 12);
  assert.equal(refreshRound, 2);
  assert.equal(categoryCalls, 5);
}

async function testMainAcceptsCookieHeaderAndJsonBody() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      assert.equal(url, `${NEW_BASE_URL}/res/mv`);
      assert.equal(options.headers.Cookie, "app_auth=header; browser_verified=proof");
      assert.equal(options.params.rrange, "0_10");
      assert.equal(options.params.srange, "0");
      const rows = Array.from({ length: 48 }, (_, index) => ({
        title: `Header 电影 ${index}`,
        id: `header${index}`,
      }));
      return {
        data: JSON.stringify({
          inlist: {
            t: rows.map((row) => row.title),
            i: rows.map((row) => row.id),
            d: rows.map(() => 7.1),
            a: rows.map(() => [2024]),
          },
        }),
      };
    },
  });

  const items = await widget.call(
    'recentMovies({ page: 1, cookie: "Cookie: app_auth=header;\\n browser_verified=proof" })'
  );
  assert.equal(items.length, 12);
  assert.equal(items[0].title, "Header 电影 0");
  assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/change/")), false);
}

async function testMainParsesCommonCookieExports() {
  const widget = loadWidget("gying.js");
  widget.context.__netscapeCookies = [
    "# Netscape HTTP Cookie File",
    "#HttpOnly_.xn--wcv59z.com\tTRUE\t/\tTRUE\t2147483647\tapp_auth\tauth",
    ".xn--wcv59z.com\tTRUE\t/\tTRUE\t2147483647\tbrowser_verified\tproof",
  ].join("\n");
  assert.equal(
    widget.call("parseCookieInput(__netscapeCookies)"),
    "app_auth=auth; browser_verified=proof"
  );

  widget.context.__multilineCookies = [
    "Set-Cookie: app_auth=auth; Path=/; HttpOnly",
    "Set-Cookie: browser_verified=proof; Path=/; HttpOnly",
  ].join("\n");
  assert.equal(
    widget.call("parseCookieInput(__multilineCookies)"),
    "app_auth=auth; browser_verified=proof"
  );

  widget.context.__cookieResponse = {
    headers: ["HTTP/2 200", "Set-Cookie: browser_pow=pow; Path=/; HttpOnly"],
    meta: { cookies: { browser_verified: "proof" } },
  };
  assert.equal(
    widget.call('mergeCookieStrings("app_auth=auth", getSetCookieLines(__cookieResponse))'),
    "app_auth=auth; browser_pow=pow; browser_verified=proof"
  );
}

async function testMainRejectsHiddenSetCookieHeaders() {
  let categoryCalls = 0;
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        categoryCalls += 1;
        if (categoryCalls === 1) {
          return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期" } };
        }
        throw new Error("分类请求不应在隐藏 Set-Cookie 后重试");
      }
      if (url === `${NEW_BASE_URL}/mv`) {
        assert.equal(options.headers.Cookie, "app_auth=jar");
        return { data: "<html>challenge</html>" };
      }
      if (url === `${NEW_BASE_URL}/res/pow`) {
        assert.equal(options.headers.Cookie, "app_auth=jar");
        return { data: JSON.stringify({ N: "f", x: "2", t: 3 }) };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
    httpPost: async (url, body, options) => {
      assert.equal(url, `${NEW_BASE_URL}/res/pow`);
      assert.equal(body, "y=1");
      assert.equal(options.headers.Cookie, "app_auth=jar");
      return { data: { success: true } };
    },
  });

  const items = await widget.call(
    'recentMovies({ page: 1, cookie: "app_auth=jar; browser_verified=stale" })'
  );
  assert.equal(items.length, 0);
  assert.equal(categoryCalls, 1);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [
    `${NEW_BASE_URL}/res/mv`,
    `${NEW_BASE_URL}/mv`,
    `${NEW_BASE_URL}/res/pow`,
  ]);
  assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/change/")), false);
}

async function testMainRejectsHiddenVerificationCookie() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期" } };
      }
      if (url === `${NEW_BASE_URL}/mv`) {
        return {
          data: "<html>challenge</html>",
          headers: "Set-Cookie: browser_pow=pow; Path=/; HttpOnly",
        };
      }
      if (url === `${NEW_BASE_URL}/res/pow`) {
        assert.equal(options.headers.Cookie, "app_auth=x; browser_pow=pow");
        return { data: { N: "f", x: "2", t: 0 } };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
    httpPost: async () => ({ data: { success: true } }),
  });

  const items = await widget.call(
    'recentMovies({ page: 1, cookie: "app_auth=x; browser_verified=stale" })'
  );
  assert.equal(items.length, 0);
  assert.equal(widget.httpCalls.some((call) => call.method === "POST"), true);
  assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/change/")), false);
}

async function testMainDetectsNestedHttpStatus() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        return { status: 419, data: { message: "verification expired" } };
      }
      if (url === `${NEW_BASE_URL}/mv`) return { data: "<html>challenge</html>" };
      if (url === `${NEW_BASE_URL}/res/pow`) {
        return { status: 419, data: { refresh: 1 } };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
  });

  const items = await widget.call('recentMovies({ page: 1, cookie: "app_auth=x" })');
  assert.equal(items.length, 0);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [
    `${NEW_BASE_URL}/res/mv`,
    `${NEW_BASE_URL}/mv`,
    `${NEW_BASE_URL}/res/pow`,
  ]);
}

async function testMainDetectsThrownHttpStatus() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        const error = new Error("request rejected");
        error.response = { status: 419, data: { msg: "browser verification expired" } };
        throw error;
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
  });

  const items = await widget.call('recentMovies({ page: 1, cookie: "app_auth=x" })');
  assert.equal(items.length, 0);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [
    `${NEW_BASE_URL}/res/mv`,
    `${NEW_BASE_URL}/mv`,
  ]);
}

async function testPowWithoutTimersDoesNotBusyWait() {
  const widget = loadWidget("gying.js");
  widget.context.setTimeout = undefined;
  const startedAt = Date.now();
  const proof = await widget.call('solveProofOfWork({ N: "f", x: "2", t: 3 })');
  assert.equal(proof, "1");
  assert.ok(Date.now() - startedAt < 500);
}

async function testMainRejectsOversizedPowChallenge() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url, options) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期" } };
      }
      if (url === `${NEW_BASE_URL}/mv`) {
        return {
          data: "<html>challenge</html>",
          headers: "Set-Cookie: browser_pow=pow; Path=/; HttpOnly",
        };
      }
      if (url === `${NEW_BASE_URL}/res/pow`) {
        assert.equal(options.headers.Cookie, "app_auth=x; browser_pow=pow");
        return { data: { N: "f".repeat(1025), x: "2", t: 1 } };
      }
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
  });

  const items = await widget.call('recentMovies({ page: 1, cookie: "app_auth=x" })');
  assert.equal(items.length, 0);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [
    `${NEW_BASE_URL}/res/mv`,
    `${NEW_BASE_URL}/mv`,
    `${NEW_BASE_URL}/res/pow`,
  ]);
  assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/change/")), false);
}

async function testMainReturnsEmptyWhenVerificationRefreshFails() {
  const widget = loadWidget("gying.js", {
    httpGet: async (url) => {
      if (url === `${NEW_BASE_URL}/res/mv`) {
        return { data: { code: 419, refresh: 1, msg: "浏览器验证已过期，请刷新页面" } };
      }
      if (url === `${NEW_BASE_URL}/mv`) return { data: "<html>challenge</html>" };
      throw new Error(`Unexpected HTTP GET: ${url}`);
    },
  });

  const items = await widget.call(
    'recentMovies({ page: 2, genre: "科幻", cookie: "app_auth=x" })'
  );
  assert.equal(items.length, 0);
  assert.deepEqual(widget.httpCalls.map((call) => call.url), [
    `${NEW_BASE_URL}/res/mv`,
    `${NEW_BASE_URL}/mv`,
    `${NEW_BASE_URL}/res/pow`,
  ]);
  assert.equal(widget.httpCalls.some((call) => call.url.includes("/res/change/")), false);
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
      const payload = changePayload("tv", batches[index] || []);
      return { data: index === 1 ? JSON.stringify(payload) : payload };
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
  testMainDeclaresOptionalCredentialInputs,
  testMainLogsInWithCredentialsAndReusesSession,
  testMainKeepsLoginSessionWhenVerificationExpires,
  testMainKeepsAuthenticationModesIsolated,
  testMainRejectsIncompleteCredentialsWithoutNetwork,
  testMainRejectsLoginWhenAppAuthIsHidden,
  testMainStopsOnCaptchaAndRedactsCredentials,
  testMainKeepsFilteredPagingWithCurrentCookie,
  testMainRefreshesVerificationAndKeepsFilters,
  testMainForcesRefreshWhenCachedVerificationExpires,
  testMainAcceptsCookieHeaderAndJsonBody,
  testMainParsesCommonCookieExports,
  testMainRejectsHiddenSetCookieHeaders,
  testMainRejectsHiddenVerificationCookie,
  testMainDetectsNestedHttpStatus,
  testMainDetectsThrownHttpStatus,
  testPowWithoutTimersDoesNotBusyWait,
  testMainRejectsOversizedPowChallenge,
  testMainReturnsEmptyWhenVerificationRefreshFails,
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
