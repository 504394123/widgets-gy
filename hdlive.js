WidgetMetadata = {
  id: "forward.hdlive",
  title: "HDHive影视",
  version: "1.2.7",
  requiredVersion: "0.0.1",
  description: "获取 HDHive 真实电影分页列表，不解析顶部轮播",
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
// SHA-256: 174d4a64e1208ffa79956f84712e0e113de174a80b0bd86fad152a572aefaf03
const SECURITY_WASM_TEXT_URL = "https://raw.githubusercontent.com/504394123/widgets-gy/main/hdh_security_bg.wasm.b64";
const PAGE_SIZE = 40;
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const LANGUAGE_FINGERPRINT = "zh-CN,zh;q=0.9,en;q=0.8";

let _securityWasm = null;
let _securityWasmPromise = null;
let _secureSession = null;
let _secureSessionPromise = null;

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

function parseCookieMap(cookieString) {
  const map = {};
  if (!cookieString) return map;

  cookieString.split(";").forEach(part => {
    const index = part.indexOf("=");
    if (index === -1) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
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
    const payload = JSON.parse(base64DecodeString(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload.user_id || payload.sub;
    if (typeof userId === "number" && userId > 0) return String(userId);
    if (typeof userId === "string" && /^\d+$/.test(userId)) return userId;
  } catch (err) {}

  return "0";
}

function getGlobalObject() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  return {};
}

function ensureCrypto() {
  const root = getGlobalObject();
  if (root.crypto && typeof root.crypto.getRandomValues === "function") return root.crypto;

  const fallbackCrypto = {
    getRandomValues: function (array) {
      for (let i = 0; i < array.length; i += 1) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  };

  try {
    if (!root.crypto) root.crypto = fallbackCrypto;
  } catch (err) {}

  return root.crypto || fallbackCrypto;
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  ensureCrypto().getRandomValues(bytes);
  return new Uint8Array(bytes);
}

function bytesToHex(bytes) {
  let output = "";
  for (let i = 0; i < bytes.length; i += 1) {
    output += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
  }
  return output;
}

function stringToUtf8Bytes(input) {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(input);

  const encoded = unescape(encodeURIComponent(input));
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i += 1) bytes[i] = encoded.charCodeAt(i);
  return new Uint8Array(bytes);
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
  const normalized = String(input || "").replace(/\s/g, "");
  const clean = normalized.replace(/=+$/, "");
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
  } catch (err) {
    return null;
  }
}

function sha256Hex(input) {
  const bytes = stringToUtf8Bytes(input);
  const words = [];
  const bitLength = bytes.length * 8;

  for (let i = 0; i < bytes.length; i += 1) {
    words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }

  words[bitLength >> 5] |= 0x80 << (24 - bitLength % 32);
  words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Array(64);

  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t += 1) w[t] = words[i + t] | 0;
    for (let t = 16; t < 64; t += 1) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (let t = 0; t < 64; t += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[t] + w[t]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

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

  return hash.map(value => (value >>> 0).toString(16).padStart(8, "0")).join("");
}

async function loadSecurityWasm(cookieString) {
  if (_securityWasm) return _securityWasm;
  if (_securityWasmPromise) return await _securityWasmPromise;
  _securityWasmPromise = loadSecurityWasmInner(cookieString).catch(err => {
    _securityWasmPromise = null;
    throw err;
  });
  return await _securityWasmPromise;
}

async function loadSecurityWasmInner(cookieString) {
  if (typeof WebAssembly === "undefined") {
    throw new Error("当前 Forward 运行环境不支持 WebAssembly，无法生成 HDHive 接口签名");
  }

  ensureCrypto();
  console.log("[HDHive] 正在加载签名组件");
  const response = await Widget.http.get(SECURITY_WASM_TEXT_URL, {
    headers: {
      "Accept": "text/plain, */*"
    }
  });
  const encodedWasm = response && typeof response.data === "string"
    ? response.data
    : "";
  const wasmBytes = base64DecodeBytes(encodedWasm);

  if (!wasmBytes || wasmBytes.length !== 52613) {
    throw new Error(`HDHive 签名组件数据损坏（${wasmBytes ? wasmBytes.length : 0} bytes）`);
  }

  const state = createWasmState();
  const instance = await WebAssembly.instantiate(wasmBytes, createWasmImports(state));
  state.wasm = instance.instance ? instance.instance.exports : instance.exports;
  console.log(`[HDHive] 签名组件加载完成（${wasmBytes.length} bytes）`);

  _securityWasm = {
    init: function () {
      return wasmInit(state);
    },
    finalizeHandshake: function (cid, serverPubBytes, kid) {
      return wasmFinalizeHandshake(state, cid, serverPubBytes, kid);
    },
    signRequest: function (method, path, ts, nonce, bodyBytes, userId) {
      return wasmSignRequest(state, method, path, ts, nonce, bodyBytes, userId);
    }
  };

  return _securityWasm;
}

function createWasmState() {
  const values = new Array(1024).fill(undefined);
  values.push(undefined, null, true, false);
  return {
    wasm: null,
    cacheU8: null,
    cacheView: null,
    values: values,
    nextValue: values.length,
    stringLength: 0
  };
}

function wasmMemoryBytes(state) {
  if (!state.cacheU8 || state.cacheU8.byteLength === 0) {
    state.cacheU8 = new Uint8Array(state.wasm.memory.buffer);
  }
  return state.cacheU8;
}

function wasmDataView(state) {
  if (!state.cacheView || state.cacheView.buffer !== state.wasm.memory.buffer) {
    state.cacheView = new DataView(state.wasm.memory.buffer);
  }
  return state.cacheView;
}

function wasmAddValue(state, value) {
  if (state.nextValue === state.values.length) state.values.push(state.values.length + 1);
  const index = state.nextValue;
  state.nextValue = state.values[index];
  state.values[index] = value;
  return index;
}

function wasmTakeValue(state, index) {
  const value = state.values[index];
  if (index >= 1028) {
    state.values[index] = state.nextValue;
    state.nextValue = index;
  }
  return value;
}

function wasmGetString(state, pointer, length) {
  return bytesToUtf8String(wasmMemoryBytes(state).subarray(pointer >>> 0, (pointer >>> 0) + length));
}

function wasmPassBytes(state, bytes, malloc) {
  const pointer = malloc(bytes.length, 1) >>> 0;
  wasmMemoryBytes(state).set(bytes, pointer);
  state.stringLength = bytes.length;
  return pointer;
}

function wasmPassString(state, value, malloc, realloc) {
  const bytes = stringToUtf8Bytes(value);
  let pointer = malloc(bytes.length, 1) >>> 0;
  wasmMemoryBytes(state).subarray(pointer, pointer + bytes.length).set(bytes);
  state.stringLength = bytes.length;
  return pointer;
}

function createWasmImports(state) {
  return {
    "./hdh_security_bg.js": {
      __wbg_Error_ef53bc310eb298a0: function (pointer, length) {
        return wasmAddValue(state, Error(wasmGetString(state, pointer, length)));
      },
      __wbg___wbindgen_is_function_754e9f305ff6029e: function (index) {
        return typeof state.values[index] === "function";
      },
      __wbg___wbindgen_is_object_56732c2bc353f41d: function (index) {
        const value = state.values[index];
        return typeof value === "object" && value !== null;
      },
      __wbg___wbindgen_is_string_c236cabd84a4d769: function (index) {
        return typeof state.values[index] === "string";
      },
      __wbg___wbindgen_is_undefined_67b456be8673d3d7: function (index) {
        return state.values[index] === undefined;
      },
      __wbg___wbindgen_throw_1506f2235d1bdba0: function (pointer, length) {
        throw Error(wasmGetString(state, pointer, length));
      },
      __wbg_call_9c758de292015997: function (fnIndex, thisIndex, argIndex) {
        try {
          return wasmAddValue(state, state.values[fnIndex].call(state.values[thisIndex], state.values[argIndex]));
        } catch (err) {
          state.wasm.__wbindgen_export(wasmAddValue(state, err));
        }
      },
      __wbg_crypto_38df2bab126b63dc: function (index) {
        return wasmAddValue(state, state.values[index].crypto);
      },
      __wbg_getRandomValues_c44a50d8cfdaebeb: function (cryptoIndex, arrayIndex) {
        try {
          state.values[cryptoIndex].getRandomValues(state.values[arrayIndex]);
        } catch (err) {
          state.wasm.__wbindgen_export(wasmAddValue(state, err));
        }
      },
      __wbg_length_4a591ecaa01354d9: function (index) {
        return state.values[index].length;
      },
      __wbg_msCrypto_bd5a034af96bcba6: function (index) {
        return wasmAddValue(state, state.values[index].msCrypto);
      },
      __wbg_new_with_length_36a4998e27b014c5: function (length) {
        return wasmAddValue(state, new Uint8Array(length >>> 0));
      },
      __wbg_node_84ea875411254db1: function (index) {
        return wasmAddValue(state, state.values[index].node);
      },
      __wbg_process_44c7a14e11e9f69e: function (index) {
        return wasmAddValue(state, state.values[index].process);
      },
      __wbg_prototypesetcall_3249fc62a0fafa30: function (pointer, length, arrayIndex) {
        Uint8Array.prototype.set.call(wasmMemoryBytes(state).subarray(pointer >>> 0, (pointer >>> 0) + length), state.values[arrayIndex]);
      },
      __wbg_randomFillSync_6c25eac9869eb53c: function () {},
      __wbg_require_b4edbdcf3e2a1ef0: function () {
        return 0;
      },
      __wbg_static_accessor_GLOBAL_9d53f2689e622ca1: function () {
        return wasmAddValue(state, getGlobalObject());
      },
      __wbg_static_accessor_GLOBAL_THIS_a1a35cec07001a8a: function () {
        return wasmAddValue(state, getGlobalObject());
      },
      __wbg_static_accessor_SELF_4c59f6c7ea29a144: function () {
        return typeof self === "undefined" ? 0 : wasmAddValue(state, self);
      },
      __wbg_static_accessor_WINDOW_e70ae9f2eb052253: function () {
        return typeof window === "undefined" ? 0 : wasmAddValue(state, window);
      },
      __wbg_subarray_4aa221f6a4f5ab22: function (index, start, end) {
        return wasmAddValue(state, state.values[index].subarray(start >>> 0, end >>> 0));
      },
      __wbg_versions_276b2795b1c6a219: function (index) {
        return wasmAddValue(state, state.values[index].versions);
      },
      __wbindgen_cast_0000000000000001: function (pointer, length) {
        return wasmAddValue(state, wasmMemoryBytes(state).subarray(pointer >>> 0, (pointer >>> 0) + length));
      },
      __wbindgen_cast_0000000000000002: function (pointer, length) {
        return wasmAddValue(state, wasmGetString(state, pointer, length));
      },
      __wbindgen_object_clone_ref: function (index) {
        return wasmAddValue(state, state.values[index]);
      },
      __wbindgen_object_drop_ref: function (index) {
        wasmTakeValue(state, index);
      }
    }
  };
}

function wasmInit(state) {
  try {
    const stack = state.wasm.__wbindgen_add_to_stack_pointer(-16);
    state.wasm.init(stack);
    const view = wasmDataView(state);
    const pointer = view.getInt32(stack + 0, true);
    const length = view.getInt32(stack + 4, true);
    const errorIndex = view.getInt32(stack + 8, true);
    if (view.getInt32(stack + 12, true)) throw wasmTakeValue(state, errorIndex);
    const bytes = wasmMemoryBytes(state).subarray(pointer >>> 0, (pointer >>> 0) + length).slice();
    state.wasm.__wbindgen_export4(pointer, length, 1);
    return bytes;
  } finally {
    state.wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

function wasmFinalizeHandshake(state, cid, serverPubBytes, kid) {
  try {
    const stack = state.wasm.__wbindgen_add_to_stack_pointer(-16);
    const cidPointer = wasmPassString(state, cid, state.wasm.__wbindgen_export2, state.wasm.__wbindgen_export3);
    const cidLength = state.stringLength;
    const pubPointer = wasmPassBytes(state, serverPubBytes, state.wasm.__wbindgen_export2);
    const pubLength = state.stringLength;
    state.wasm.finalizeHandshake(stack, cidPointer, cidLength, pubPointer, pubLength, kid);
    const errorIndex = wasmDataView(state).getInt32(stack + 0, true);
    if (wasmDataView(state).getInt32(stack + 4, true)) throw wasmTakeValue(state, errorIndex);
  } finally {
    state.wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

function wasmSignRequest(state, method, path, ts, nonce, bodyBytes, userId) {
  let resultPointer = 0;
  let resultLength = 0;

  try {
    const stack = state.wasm.__wbindgen_add_to_stack_pointer(-16);
    const methodPointer = wasmPassString(state, method, state.wasm.__wbindgen_export2, state.wasm.__wbindgen_export3);
    const methodLength = state.stringLength;
    const pathPointer = wasmPassString(state, path, state.wasm.__wbindgen_export2, state.wasm.__wbindgen_export3);
    const pathLength = state.stringLength;
    const tsPointer = wasmPassString(state, ts, state.wasm.__wbindgen_export2, state.wasm.__wbindgen_export3);
    const tsLength = state.stringLength;
    const noncePointer = wasmPassString(state, nonce, state.wasm.__wbindgen_export2, state.wasm.__wbindgen_export3);
    const nonceLength = state.stringLength;
    const bodyPointer = wasmPassBytes(state, bodyBytes, state.wasm.__wbindgen_export2);
    const bodyLength = state.stringLength;
    const userPointer = wasmPassString(state, userId, state.wasm.__wbindgen_export2, state.wasm.__wbindgen_export3);
    const userLength = state.stringLength;

    state.wasm.signRequest(
      stack,
      methodPointer, methodLength,
      pathPointer, pathLength,
      tsPointer, tsLength,
      noncePointer, nonceLength,
      bodyPointer, bodyLength,
      userPointer, userLength
    );

    const view = wasmDataView(state);
    resultPointer = view.getInt32(stack + 0, true);
    resultLength = view.getInt32(stack + 4, true);
    const errorIndex = view.getInt32(stack + 8, true);
    if (view.getInt32(stack + 12, true)) {
      resultPointer = 0;
      resultLength = 0;
      throw wasmTakeValue(state, errorIndex);
    }

    return wasmGetString(state, resultPointer, resultLength);
  } finally {
    state.wasm.__wbindgen_add_to_stack_pointer(16);
    if (resultPointer && resultLength) state.wasm.__wbindgen_export4(resultPointer, resultLength, 1);
  }
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
  const now = Date.now();
  const security = await loadSecurityWasm(cookieString);
  const clientPub = security.init();
  const payload = {
    client_pub: base64EncodeBytes(clientPub),
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

  security.finalizeHandshake(json.data.cid, base64DecodeBytes(json.data.server_pub), 1);
  console.log("[HDHive] 安全会话建立完成");
  _secureSession = {
    cid: json.data.cid,
    expiresAt: Math.floor(Number(json.data.expires_at || 0) * 1000)
  };

  return _secureSession;
}

async function fetchSignedMovieList(page, cookieString, retrying) {
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const query = `page_size=${PAGE_SIZE}&page=${pageNumber}&share_num_gt=0`;
  const url = `${BASE_URL}${MOVIE_API_PATH}?${query}`;
  const security = await loadSecurityWasm(cookieString);
  const session = await getSecureSession(cookieString);
  const timestamp = String(Date.now());
  const nonce = bytesToHex(randomBytes(16));
  const userId = getUserIdFromCookie(cookieString);
  const signature = security.signRequest("GET", MOVIE_API_PATH, timestamp, nonce, new Uint8Array(), userId);

  try {
    console.log(`[HDHive] 正在请求第 ${pageNumber} 页电影列表`);
    const response = await Widget.http.get(url, {
      headers: buildHeaders(cookieString, {
        "Accept": "application/json, text/plain, */*",
        "X-HDH-Cid": session.cid,
        "X-HDH-TS": timestamp,
        "X-HDH-Nonce": nonce,
        "X-HDH-Sig": signature,
        "X-HDH-Kid": "1"
      })
    });
    const result = safeParseJSON(response && response.data);
    console.log(`[HDHive] 第 ${pageNumber} 页接口响应完成`);
    return result;
  } catch (err) {
    if (!retrying) {
      _secureSession = null;
      return await fetchSignedMovieList(page, cookieString, true);
    }
    console.error(`HDHive 真实列表接口请求失败: ${url}`, err);
    return null;
  }
}

function normalizeMovieItem(item) {
  if (!item || (item.type !== "movie" && item.record_type !== "movie")) {
    return null;
  }

  const tmdbIdNum = item.tmdb_id ? Number(item.tmdb_id) : 0;
  if (!tmdbIdNum) {
    console.log(`"${item.title || ""}" 缺少 tmdb_id，跳过`);
    return null;
  }

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

async function recentMovies(params = {}) {
  const page = params.page || 1;
  console.log(`[HDHive] 模块已启动，准备加载第 ${page} 页`);
  const cookieString = parseCookieInput(params.cookie || "");
  const response = await fetchSignedMovieList(page, cookieString, false);
  const items = response && Array.isArray(response.data) ? response.data : [];
  const results = items.map(normalizeMovieItem).filter(Boolean);

  if (results.length === 0) {
    console.error("HDHive 真实电影列表为空或解析失败");
  } else {
    console.log(`HDHive 第 ${page} 页真实列表返回 ${results.length} 部电影`);
  }

  return results;
}
