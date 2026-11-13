WidgetMetadata = {
  id: "forward.subtitle.stremio.local",
  title: "Stremio 本地字幕",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "连接现有 Stremio 字幕中转，保留英文、AI 翻译和已完成标签；仅在选字幕后由播放器下载。",
  author: "鹈鹕",
  site: "https://github.com/InchStudio/ForwardWidgets",
  globalParams: [
    {
      name: "server", title: "字幕中转地址", type: "input",
      value: "http://192.168.3.50:21112",
      description: "填写中转地址或完整 manifest.json 地址，不是 NAS 登录地址。"
    }
  ],
  modules: [
    { id: "loadSubtitle", title: "加载字幕", functionName: "loadSubtitle",
      type: "subtitle", cacheDuration: 0, requiresWebView: false, params: [] }
  ]
};

function stremioBase(value) {
  var base = String(value || "http://192.168.3.50:21112").trim();
  if (!/^https?:\/\/[^/?#\s]+(?:\/[^?#\s]*)?$/i.test(base)) {
    throw new Error("字幕中转地址需要以 http:// 或 https:// 开头，不能带查询参数。");
  }
  return base.replace(/\/manifest\.json\/?$/i, "").replace(/\/+$/, "");
}

function stremioParseId(value, numericTmdb) {
  var text = String(value == null ? "" : value).trim();
  var match = /^(tt\d+)(?::(\d+):(\d+))?$/i.exec(text);
  if (match) return { id: match[1].toLowerCase(), season: match[2], episode: match[3] };
  match = /^tmdb:(\d+)(?::(\d+):(\d+))?$/i.exec(text);
  if (match) return { id: "tmdb:" + match[1], season: match[2], episode: match[3] };
  match = /^(movie|tv)[.:](\d+)$/i.exec(text);
  if (match) return { id: "tmdb:" + match[2], type: match[1].toLowerCase() };
  if (numericTmdb && /^\d+$/.test(text) && Number(text) > 0) return { id: "tmdb:" + text };
  return null;
}

function stremioVideo(params) {
  var media = stremioParseId(params.imdbId, false) ||
    stremioParseId(params.tmdbId, true) || stremioParseId(params.id, false);
  if (!media) throw new Error("当前影片缺少 IMDb/TMDB 片号，不能只凭名字猜字幕。");
  var type = String(params.type || params.mediaType || media.type || "").toLowerCase();
  var hasSeason = params.season !== undefined && params.season !== null && params.season !== "";
  var hasEpisode = params.episode !== undefined && params.episode !== null && params.episode !== "";
  if (!type) type = media.episode !== undefined || hasSeason || hasEpisode ? "tv" : "movie";
  if (type === "series") type = "tv";
  if (type !== "movie" && type !== "tv" && type !== "anime") throw new Error("不支持的影片类型：" + type);
  if (media.type && media.type !== type) throw new Error("片号类型和当前影片类型不一致。");
  var series = type === "tv" || (type === "anime" && (hasSeason || media.episode !== undefined));
  if (!series) {
    if (media.episode !== undefined || hasSeason || hasEpisode) throw new Error("电影不能带剧集编号，请检查当前影片信息。");
    return { type: type, id: media.id };
  }
  var season = hasSeason ? params.season : media.season;
  var episode = hasEpisode ? params.episode : media.episode;
  if (!/^\d+$/.test(String(season)) || !/^\d+$/.test(String(episode)) || Number(episode) < 1) {
    throw new Error("电视剧需要正确的季数和集数（特别篇可用第 0 季），不能默认猜第 1 集。");
  }
  if ((media.season !== undefined && Number(media.season) !== Number(season)) ||
      (media.episode !== undefined && Number(media.episode) !== Number(episode))) {
    throw new Error("片号里的季集和当前播放季集不一致。");
  }
  return { type: type === "anime" ? "anime" : "series", id: media.id + ":" + Number(season) + ":" + Number(episode) };
}

async function stremioResolveVideo(media) {
  var match = /^tmdb:(\d+)(:\d+:\d+)?$/.exec(media.id);
  if (!match || !Widget.tmdb || typeof Widget.tmdb.get !== "function") return media;
  try {
    var type = media.type === "series" || match[2] ? "tv" : "movie";
    var ids = await Widget.tmdb.get(type + "/" + match[1] + "/external_ids");
    if (ids && /^tt\d+$/.test(ids.imdb_id || "")) {
      return { type: media.type, id: ids.imdb_id + (match[2] || "") };
    }
  } catch (_) {
    // 映射暂不可用时仍使用上游声明支持的 TMDB 片号，不按片名乱猜。
  }
  return media;
}

function stremioSubtitleUrl(value, base) {
  var url = String(value || "").trim();
  if (/^https?:\/\/[^/\s]+/i.test(url)) return url;
  var origin = /^(https?:\/\/[^/]+)/i.exec(base)[1];
  if (url.indexOf("//") === 0) return base.split(":")[0] + ":" + url;
  if (url.charAt(0) === "/") return origin + url;
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
  return base + "/" + url;
}

async function loadSubtitle(params) {
  params = params || {};
  var base = stremioBase(params.server);
  var media = await stremioResolveVideo(stremioVideo(params));
  var response = await Widget.http.get(base + "/subtitles/" + media.type + "/" + encodeURIComponent(media.id) + ".json", {
    headers: { Accept: "application/json", "Cache-Control": "no-cache" }
  });
  if (!response || (response.status && Number(response.status) >= 400)) throw new Error("字幕中转请求失败，请检查服务是否在线。");
  var data = response.data;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch (_) { throw new Error("字幕中转没有返回正确的字幕列表。"); }
  }
  if (!data || !Array.isArray(data.subtitles)) throw new Error("字幕中转没有返回 subtitles 列表，请检查地址和服务配置。");
  var result = [];
  var seen = {};
  for (var i = 0; i < data.subtitles.length; i++) {
    var sub = data.subtitles[i];
    if (!sub || typeof sub.url !== "string") continue;
    if (/\/error-subtitle\/no-subtitles-found\.srt(?:[?#]|$)/i.test(sub.url)) continue;
    var url = stremioSubtitleUrl(sub.url, base);
    if (!url) continue;
    var title = String(sub.name || sub.title || sub.id || sub.lang || "字幕");
    var id = String(sub.id || "subtitle-" + (i + 1));
    while (Object.prototype.hasOwnProperty.call(seen, id)) id += "-" + (i + 1);
    seen[id] = true;
    var row = { id: id, title: title, lang: String(sub.lang || "und"), url: url };
    if (typeof sub.count === "number" && sub.count >= 0) row.count = sub.count;
    result.push(row);
  }
  return result;
}
