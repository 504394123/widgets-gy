WidgetMetadata = {
  id: "forward.hdlive",
  title: "HDHive影视",
  version: "1.3.0",
  requiredVersion: "0.0.1",
  description: "获取 HDHive 真实电影分页列表（纯 JavaScript 签名，无外部组件）",
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
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const LANGUAGE_FINGERPRINT = "zh-CN,zh;q=0.9,en;q=0.8";

let _securityClient = null;
let _secureSession = null;
let _secureSessionPromise = null;
let _weakRandomWarned = false;

function parseCookieInput(input) {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("[")) {
    try {
      const entries = JSON.parse(trimmed);
      if (Array.isArray(entries)) {
        return entries
          .filter(item => item && item.name)
          .map(item => `${item.name}=${item.value || ""}`)
          .join("; ");
      }
    } catch (error) {
      console.error("[HDHive] Cookie JSON 解析失败，将按普通 Cookie 字符串处理");
    }
  }

  return trimmed;
}

function parseCookieMap(cookieString) {
  const map = {};
  if (!cookieString) return map;

  cookieString.split(";").forEach(part => {
    const separator = part.indexOf("=");
    if (separator === -1) return;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) map[key] = value;
  });

  return map;
}

function buildHeaders(cookieString, extraHeaders) {
  const cookieMap = parseCookieMap(cookieString);
  const headers = {
    "User-Agent": USER_AGENT,
    "Accept-Language": LANGUAGE_FINGERPRINT,
    "Referer": `${BASE_URL}${MOVIE_PATH}`,
    ...extraHeaders
  };

  if (cookieString) headers.Cookie = cookieString;
  if (cookieMap.csrf_access_token) headers["X-CSRF-TOKEN"] = cookieMap.csrf_access_token;
  return headers;
}

function getUserIdFromCookie(cookieString) {
  const cookieMap = parseCookieMap(cookieString);
  if (cookieMap.hdh_uid && /^[1-9]\d*$/.test(cookieMap.hdh_uid)) {
    return cookieMap.hdh_uid;
  }

  const token = cookieMap.token || "";
  const parts = token.split(".");
  if (parts.length < 2) return "0";

  try {
    const payloadText = base64DecodeString(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadText);
    const userId = payload.user_id || payload.sub;
    if (typeof userId === "number" && Number.isInteger(userId) && userId > 0) return String(userId);
    if (typeof userId === "string" && /^\d+$/.test(userId)) return userId;
  } catch (error) {}

  return "0";
}

function getGlobalObject() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  return {};
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  const root = getGlobalObject();

  if (root.crypto && typeof root.crypto.getRandomValues === "function") {
    root.crypto.getRandomValues(bytes);
    return bytes;
  }

  if (!_weakRandomWarned) {
    _weakRandomWarned = true;
    console.warn("[HDHive] 当前运行环境缺少 crypto.getRandomValues，已启用兼容随机源");
  }
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

function bytesToHex(bytes) {
  let output = "";
  for (let i = 0; i < bytes.length; i += 1) {
    output += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
  }
  return output;
}

function stringToUtf8Bytes(input) {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(input));

  const encoded = unescape(encodeURIComponent(String(input)));
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i += 1) bytes[i] = encoded.charCodeAt(i);
  return bytes;
}

function bytesToUtf8String(bytes) {
  if (typeof TextDecoder !== "undefined") return new TextDecoder("utf-8").decode(bytes);

  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return decodeURIComponent(escape(binary));
}

function base64EncodeBytes(bytes) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;

    output += chars[(triple >> 18) & 63];
    output += chars[(triple >> 12) & 63];
    output += i + 1 < bytes.length ? chars[(triple >> 6) & 63] : "=";
    output += i + 2 < bytes.length ? chars[triple & 63] : "=";
  }

  return output;
}

function base64DecodeBytes(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = String(input || "").replace(/\s/g, "").replace(/=+$/, "");
  const bytes = [];
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const value = chars.indexOf(clean[i]);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 255);
    }
  }

  return new Uint8Array(bytes);
}

function base64DecodeString(input) {
  let text = String(input || "");
  text += "=".repeat((4 - text.length % 4) % 4);
  return bytesToUtf8String(base64DecodeBytes(text));
}

function safeParseJSON(data) {
  if (!data) return null;
  if (typeof data === "object") return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

function concatBytes(...parts) {
  let length = 0;
  for (let i = 0; i < parts.length; i += 1) length += parts[i].length;

  const result = new Uint8Array(length);
  let offset = 0;
  for (let i = 0; i < parts.length; i += 1) {
    result.set(parts[i], offset);
    offset += parts[i].length;
  }
  return result;
}

function sha256Bytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || []);
  const words = [];
  const bitLength = bytes.length * 8;

  for (let i = 0; i < bytes.length; i += 1) {
    const wordIndex = Math.floor(i / 4);
    words[wordIndex] = (words[wordIndex] || 0) | (bytes[i] << (24 - (i % 4) * 8));
  }

  const paddingIndex = Math.floor(bitLength / 32);
  words[paddingIndex] = (words[paddingIndex] || 0) | (0x80 << (24 - bitLength % 32));
  const lengthIndex = Math.floor((bitLength + 64) / 512) * 16 + 15;
  words[lengthIndex - 1] = Math.floor(bitLength / 0x100000000);
  words[lengthIndex] = bitLength >>> 0;

  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const schedule = new Array(64);

  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  for (let offset = 0; offset < words.length; offset += 16) {
    for (let index = 0; index < 16; index += 1) schedule[index] = words[offset + index] | 0;
    for (let index = 16; index < 64; index += 1) {
      const s0 = rightRotate(schedule[index - 15], 7)
        ^ rightRotate(schedule[index - 15], 18)
        ^ (schedule[index - 15] >>> 3);
      const s1 = rightRotate(schedule[index - 2], 17)
        ^ rightRotate(schedule[index - 2], 19)
        ^ (schedule[index - 2] >>> 10);
      schedule[index] = (schedule[index - 16] + s0 + schedule[index - 7] + s1) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (let index = 0; index < 64; index += 1) {
      const upperSigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const choose = (e & f) ^ (~e & g);
      const temp1 = (h + upperSigma1 + choose + constants[index] + schedule[index]) | 0;
      const upperSigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (upperSigma0 + majority) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  const result = new Uint8Array(32);
  for (let i = 0; i < hash.length; i += 1) {
    result[i * 4] = (hash[i] >>> 24) & 255;
    result[i * 4 + 1] = (hash[i] >>> 16) & 255;
    result[i * 4 + 2] = (hash[i] >>> 8) & 255;
    result[i * 4 + 3] = hash[i] & 255;
  }
  return result;
}

function sha256Hex(input) {
  const bytes = typeof input === "string" ? stringToUtf8Bytes(input) : input;
  return bytesToHex(sha256Bytes(bytes));
}

function hmacSha256(keyInput, data) {
  let key = keyInput;
  if (key.length > 64) key = sha256Bytes(key);

  const innerPad = new Uint8Array(64);
  const outerPad = new Uint8Array(64);
  for (let i = 0; i < 64; i += 1) {
    const value = i < key.length ? key[i] : 0;
    innerPad[i] = value ^ 0x36;
    outerPad[i] = value ^ 0x5c;
  }

  return sha256Bytes(concatBytes(outerPad, sha256Bytes(concatBytes(innerPad, data))));
}

function xGf(initial) {
  const output = new Float64Array(16);
  if (initial) {
    for (let i = 0; i < initial.length; i += 1) output[i] = initial[i];
  }
  return output;
}

const X25519_121665 = xGf([0xdb41, 1]);
const X25519_BASEPOINT = new Uint8Array([
  9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]);

function xCar(output) {
  let carry = 1;
  for (let i = 0; i < 16; i += 1) {
    const value = output[i] + carry + 65535;
    carry = Math.floor(value / 65536);
    output[i] = value - carry * 65536;
  }
  output[0] += carry - 1 + 37 * (carry - 1);
}

function xSwap(a, b, bit) {
  const mask = ~(bit - 1);
  for (let i = 0; i < 16; i += 1) {
    const value = mask & (a[i] ^ b[i]);
    a[i] ^= value;
    b[i] ^= value;
  }
}

function xPack(output, input) {
  const reduced = xGf();
  const value = xGf(input);
  xCar(value);
  xCar(value);
  xCar(value);

  for (let round = 0; round < 2; round += 1) {
    reduced[0] = value[0] - 0xffed;
    for (let i = 1; i < 15; i += 1) {
      reduced[i] = value[i] - 0xffff - ((reduced[i - 1] >> 16) & 1);
      reduced[i - 1] &= 0xffff;
    }
    reduced[15] = value[15] - 0x7fff - ((reduced[14] >> 16) & 1);
    const borrow = (reduced[15] >> 16) & 1;
    reduced[14] &= 0xffff;
    xSwap(value, reduced, 1 - borrow);
  }

  for (let i = 0; i < 16; i += 1) {
    output[i * 2] = value[i] & 255;
    output[i * 2 + 1] = value[i] >> 8;
  }
}

function xUnpack(output, input) {
  for (let i = 0; i < 16; i += 1) {
    output[i] = input[i * 2] + (input[i * 2 + 1] << 8);
  }
  output[15] &= 0x7fff;
}

function xAdd(output, a, b) {
  for (let i = 0; i < 16; i += 1) output[i] = a[i] + b[i];
}

function xSub(output, a, b) {
  for (let i = 0; i < 16; i += 1) output[i] = a[i] - b[i];
}

function xMul(output, a, b) {
  const product = new Float64Array(31);
  for (let i = 0; i < 16; i += 1) {
    for (let j = 0; j < 16; j += 1) product[i + j] += a[i] * b[j];
  }
  for (let i = 0; i < 15; i += 1) product[i] += 38 * product[i + 16];
  for (let i = 0; i < 16; i += 1) output[i] = product[i];
  xCar(output);
  xCar(output);
}

function xSquare(output, value) {
  xMul(output, value, value);
}

function xInverse(output, input) {
  const value = xGf(input);
  for (let exponent = 253; exponent >= 0; exponent -= 1) {
    xSquare(value, value);
    if (exponent !== 2 && exponent !== 4) xMul(value, value, input);
  }
  for (let i = 0; i < 16; i += 1) output[i] = value[i];
}

function x25519(secret, point) {
  if (!(secret instanceof Uint8Array) || secret.length !== 32) {
    throw new Error("X25519 私钥必须是 32 bytes");
  }
  if (!(point instanceof Uint8Array) || point.length !== 32) {
    throw new Error("X25519 公钥必须是 32 bytes");
  }

  const scalar = new Uint8Array(secret);
  const x = xGf();
  const a = xGf();
  const b = xGf();
  const c = xGf();
  const d = xGf();
  const e = xGf();
  const f = xGf();

  scalar[0] &= 248;
  scalar[31] = (scalar[31] & 127) | 64;
  xUnpack(x, point);
  for (let i = 0; i < 16; i += 1) {
    b[i] = x[i];
    a[i] = 0;
    c[i] = 0;
    d[i] = 0;
  }
  a[0] = 1;
  d[0] = 1;

  for (let bit = 254; bit >= 0; bit -= 1) {
    const selected = (scalar[bit >>> 3] >>> (bit & 7)) & 1;
    xSwap(a, b, selected);
    xSwap(c, d, selected);
    xAdd(e, a, c);
    xSub(a, a, c);
    xAdd(c, b, d);
    xSub(b, b, d);
    xSquare(d, e);
    xSquare(f, a);
    xMul(a, c, a);
    xMul(c, b, e);
    xAdd(e, a, c);
    xSub(a, a, c);
    xSquare(b, a);
    xSub(c, d, f);
    xMul(a, c, X25519_121665);
    xAdd(a, a, d);
    xMul(c, c, a);
    xMul(a, d, f);
    xMul(d, b, x);
    xSquare(b, e);
    xSwap(a, b, selected);
    xSwap(c, d, selected);
  }

  xInverse(c, c);
  xMul(a, a, c);
  const output = new Uint8Array(32);
  xPack(output, a);
  return output;
}

function deriveSessionKeys(cid, sharedSecret) {
  const info = stringToUtf8Bytes("hdh/v1");
  const prk = hmacSha256(stringToUtf8Bytes(cid), sharedSecret);
  const responseKey = hmacSha256(prk, concatBytes(info, new Uint8Array([1])));
  const requestKey = hmacSha256(prk, concatBytes(responseKey, info, new Uint8Array([2])));
  return { requestKey, responseKey };
}

function createSecurityClient(seed) {
  let privateKey = seed ? new Uint8Array(seed) : null;
  let publicKey = null;
  let session = null;

  if (privateKey && privateKey.length !== 32) {
    throw new Error("HDHive 客户端私钥长度错误");
  }

  return {
    init: function () {
      if (!privateKey) privateKey = randomBytes(32);
      if (!publicKey) publicKey = x25519(privateKey, X25519_BASEPOINT);
      return new Uint8Array(publicKey);
    },
    finalizeHandshake: function (cid, serverPublicKey, kid) {
      if (!privateKey) throw new Error("HDHive 安全握手尚未初始化");
      if (!cid) throw new Error("HDHive 安全会话缺少 cid");

      const sharedSecret = x25519(privateKey, serverPublicKey);
      let allZero = true;
      for (let i = 0; i < sharedSecret.length; i += 1) {
        if (sharedSecret[i] !== 0) {
          allZero = false;
          break;
        }
      }
      if (allZero) throw new Error("HDHive 服务端公钥无效");

      const keys = deriveSessionKeys(String(cid), sharedSecret);
      session = {
        cid: String(cid),
        kid: Number(kid),
        requestKey: keys.requestKey
      };
      privateKey.fill(0);
      privateKey = null;
    },
    signRequest: function (method, path, timestamp, nonce, bodyBytes, userId) {
      if (!session) throw new Error("HDHive 安全会话尚未建立");
      const bodyHash = bytesToHex(sha256Bytes(bodyBytes));
      const canonical = [
        method,
        path,
        timestamp,
        nonce,
        bodyHash,
        session.cid,
        userId,
        String(session.kid)
      ].join("\n");
      return bytesToHex(hmacSha256(session.requestKey, stringToUtf8Bytes(canonical)));
    }
  };
}

function resetSecureSession() {
  _securityClient = null;
  _secureSession = null;
  _secureSessionPromise = null;
}

async function getSecureSession(cookieString) {
  const now = Date.now();
  if (_secureSession && _secureSession.expiresAt - 60000 > now) return _secureSession;
  if (_secureSessionPromise) return await _secureSessionPromise;

  _secureSessionPromise = createSecureSession(cookieString).finally(() => {
    _secureSessionPromise = null;
  });
  return await _secureSessionPromise;
}

async function createSecureSession(cookieString) {
  console.log("[HDHive] 正在初始化纯 JavaScript 签名组件");
  const security = createSecurityClient();
  const clientPublicKey = security.init();
  console.log("[HDHive] 签名组件初始化完成");

  const now = Date.now();
  const payload = {
    client_pub: base64EncodeBytes(clientPublicKey),
    ua_fingerprint: sha256Hex(`${USER_AGENT}|${LANGUAGE_FINGERPRINT}`),
    ts: now
  };

  console.log("[HDHive] 正在建立安全会话");
  const response = await Widget.http.post(
    `${BASE_URL}/api/public/security/session/handshake`,
    JSON.stringify(payload),
    {
      headers: buildHeaders(cookieString, {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      })
    }
  );
  const json = safeParseJSON(response && response.data);

  if (!json || json.success !== true || !json.data || !json.data.cid || !json.data.server_pub) {
    throw new Error("HDHive 安全握手失败");
  }

  const serverPublicKey = base64DecodeBytes(json.data.server_pub);
  if (serverPublicKey.length !== 32) throw new Error("HDHive 服务端公钥长度错误");
  security.finalizeHandshake(json.data.cid, serverPublicKey, 1);

  const expiresValue = Number(json.data.expires_at || 0);
  const expiresAt = expiresValue > 1000000000000 ? expiresValue : expiresValue * 1000;
  _securityClient = security;
  _secureSession = {
    cid: String(json.data.cid),
    kid: 1,
    expiresAt
  };
  console.log("[HDHive] 安全会话建立完成");
  return _secureSession;
}

async function fetchSignedMovieList(page, cookieString, retrying) {
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const query = `page_size=${PAGE_SIZE}&page=${pageNumber}&share_num_gt=0`;
  const url = `${BASE_URL}${MOVIE_API_PATH}?${query}`;
  const session = await getSecureSession(cookieString);
  const timestamp = String(Date.now());
  const nonce = bytesToHex(randomBytes(16));
  const userId = getUserIdFromCookie(cookieString);
  const signature = _securityClient.signRequest(
    "GET",
    MOVIE_API_PATH,
    timestamp,
    nonce,
    new Uint8Array(),
    userId
  );

  try {
    console.log(`[HDHive] 正在请求第 ${pageNumber} 页电影列表`);
    const response = await Widget.http.get(url, {
      headers: buildHeaders(cookieString, {
        "Accept": "application/json, text/plain, */*",
        "X-HDH-Cid": session.cid,
        "X-HDH-TS": timestamp,
        "X-HDH-Nonce": nonce,
        "X-HDH-Sig": signature,
        "X-HDH-Kid": String(session.kid)
      })
    });
    const result = safeParseJSON(response && response.data);
    if (!result || result.success !== true || !Array.isArray(result.data)) {
      throw new Error("HDHive 电影列表响应格式异常");
    }
    console.log(`[HDHive] 第 ${pageNumber} 页接口响应完成`);
    return result;
  } catch (error) {
    if (!retrying) {
      console.warn("[HDHive] 安全会话可能已失效，正在重新握手");
      resetSecureSession();
      return await fetchSignedMovieList(pageNumber, cookieString, true);
    }
    throw error;
  }
}

function normalizeMovieItem(item) {
  if (!item || (item.type !== "movie" && item.record_type !== "movie")) return null;

  const tmdbId = item.tmdb_id ? Number(item.tmdb_id) : 0;
  if (!tmdbId) {
    console.log(`[HDHive] “${item.title || ""}”缺少 tmdb_id，已跳过`);
    return null;
  }

  return {
    id: tmdbId,
    type: "tmdb",
    title: item.title || "",
    releaseDate: item.release_date || "",
    posterPath: item.poster_path || "",
    backdropPath: item.backdrop_path || "",
    rating: item.tmdb_rating || item.douban_rating || item.imdb_rating || 0,
    mediaType: "movie"
  };
}

async function recentMovies(params = {}) {
  const page = Number(params.page || 1);
  console.log(`[HDHive] 模块已启动，准备加载第 ${page} 页`);

  try {
    const cookieString = parseCookieInput(params.cookie || "");
    let response;
    try {
      response = await fetchSignedMovieList(page, cookieString, false);
    } catch (error) {
      if (!cookieString) throw error;
      console.warn("[HDHive] Cookie 已失效或与安全会话不匹配，改用匿名公开接口重试");
      resetSecureSession();
      response = await fetchSignedMovieList(page, "", false);
    }
    const results = response.data.map(normalizeMovieItem).filter(Boolean);

    if (results.length === 0) {
      console.error("[HDHive] 电影列表为空或解析失败");
    } else {
      console.log(`[HDHive] 第 ${page} 页返回 ${results.length} 部电影`);
    }
    return results;
  } catch (error) {
    console.error(`[HDHive] 加载失败：${error && error.message ? error.message : error}`);
    return [];
  }
}
