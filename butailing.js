WidgetMetadata = {
    id: "forward.butailing",
    title: "不太冷影视",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    description: "获取 mukaku.com 影视数据，支持类型/地区/年份/画质/评分等多维筛选，通过 TMDB 补全元数据",
    author: "Antigravity",
    site: "https://web5.mukaku.com",
    globalParams: [],
    modules: [
        {
            id: "movies",
            title: "电影大全",
            functionName: "getMovies",
            params: [
                { name: "page", title: "页码", type: "page" },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    enumOptions: [
                        { title: "更新时间", value: "1" },
                        { title: "添加时间", value: "3" },
                        { title: "上映时间", value: "4" },
                        { title: "评分最高", value: "5" },
                        { title: "评分人数", value: "6" },
                    ],
                },
                {
                    name: "genre",
                    title: "类型",
                    type: "enumeration",
                    enumOptions: [
                        { title: "不限", value: "" },
                        { title: "喜剧", value: "喜剧" },
                        { title: "剧情", value: "剧情" },
                        { title: "动作", value: "动作" },
                        { title: "爱情", value: "爱情" },
                        { title: "科幻", value: "科幻" },
                        { title: "动画", value: "动画" },
                        { title: "悬疑", value: "悬疑" },
                        { title: "惊悚", value: "惊悚" },
                        { title: "恐怖", value: "恐怖" },
                        { title: "犯罪", value: "犯罪" },
                        { title: "同性", value: "同性" },
                        { title: "音乐", value: "音乐" },
                        { title: "歌舞", value: "歌舞" },
                        { title: "传记", value: "传记" },
                        { title: "历史", value: "历史" },
                        { title: "战争", value: "战争" },
                        { title: "西部", value: "西部" },
                        { title: "奇幻", value: "奇幻" },
                        { title: "冒险", value: "冒险" },
                        { title: "灾难", value: "灾难" },
                        { title: "武侠", value: "武侠" },
                        { title: "真人秀", value: "真人秀" },
                        { title: "纪录片", value: "纪录片" },
                    ],
                },
                {
                    name: "area",
                    title: "地区",
                    type: "enumeration",
                    enumOptions: [
                        { title: "不限", value: "" },
                        { title: "大陆", value: "大陆" },
                        { title: "欧美", value: "欧美" },
                        { title: "美国", value: "美国" },
                        { title: "香港", value: "香港" },
                        { title: "台湾", value: "台湾" },
                        { title: "日本", value: "日本" },
                        { title: "韩国", value: "韩国" },
                        { title: "英国", value: "英国" },
                        { title: "法国", value: "法国" },
                        { title: "德国", value: "德国" },
                        { title: "西班牙", value: "西班牙" },
                        { title: "印度", value: "印度" },
                        { title: "泰国", value: "泰国" },
                        { title: "俄罗斯", value: "俄罗斯" },
                        { title: "加拿大", value: "加拿大" },
                        { title: "澳大利亚", value: "澳大利亚" },
                        { title: "瑞典", value: "瑞典" },
                        { title: "巴西", value: "巴西" },
                    ],
                },
                {
                    name: "year",
                    title: "年份",
                    type: "enumeration",
                    enumOptions: [
                        { title: "不限", value: "" },
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
                        { title: "2015", value: "2015" },
                        { title: "20年代", value: "20年代" },
                        { title: "10年代", value: "10年代" },
                        { title: "00年代", value: "00年代" },
                        { title: "90年代", value: "90年代" },
                        { title: "80年代", value: "80年代" },
                        { title: "更早", value: "更早" },
                    ],
                },
                {
                    name: "quality",
                    title: "画质",
                    type: "enumeration",
                    enumOptions: [
                        { title: "不限", value: "" },
                        { title: "HDTV", value: "HDTV" },
                        { title: "WEB-1080P", value: "WEB-1080P" },
                        { title: "WEB-4K", value: "WEB-4K" },
                        { title: "1080P蓝光", value: "1080P蓝光" },
                        { title: "1080P-Remux", value: "1080P-Remux" },
                        { title: "4K蓝光", value: "4K蓝光" },
                        { title: "4K-Remux", value: "4K-Remux" },
                        { title: "3D", value: "3D" },
                        { title: "杜比视界", value: "杜比视界" },
                        { title: "蓝光原盘", value: "蓝光原盘" },
                        { title: "4K蓝光原盘", value: "4K蓝光原盘" },
                        { title: "枪版", value: "枪版" },
                    ],
                },
                {
                    name: "pfrs",
                    title: "评分人数",
                    type: "enumeration",
                    enumOptions: [
                        { title: "不限", value: "0" },
                        { title: "2000人以上", value: "2000" },
                        { title: "4000人以上", value: "4000" },
                        { title: "6000人以上", value: "6000" },
                        { title: "8000人以上", value: "8000" },
                        { title: "1万人以上", value: "10000" },
                        { title: "2万人以上", value: "20000" },
                        { title: "5万人以上", value: "50000" },
                        { title: "10万人以上", value: "100000" },
                        { title: "20万人以上", value: "200000" },
                        { title: "50万人以上", value: "500000" },
                    ],
                },
                {
                    name: "pfqj",
                    title: "评分区间",
                    type: "enumeration",
                    enumOptions: [
                        { title: "全部 (0-10)", value: "0x10" },
                        { title: "1分以上", value: "1.0x10.0" },
                        { title: "2分以上", value: "2.0x10.0" },
                        { title: "3分以上", value: "3.0x10.0" },
                        { title: "4分以上", value: "4.0x10.0" },
                        { title: "5分以上", value: "5.0x10.0" },
                        { title: "6分以上", value: "6.0x10.0" },
                        { title: "7分以上", value: "7.0x10.0" },
                        { title: "8分以上", value: "8.0x10.0" },
                        { title: "9分以上", value: "9.0x10.0" },
                        { title: "仅10分", value: "10.0x10.0" },
                    ],
                },
            ],
        },
    ],
};
// TV 剧集模块：参数与电影完全相同，仅内容类型 (sa=2) 不同
WidgetMetadata.modules.push({
    id: "tvseries",
    title: "剧集大全",
    functionName: "getTVSeries",
    params: WidgetMetadata.modules[0].params,  // 共用电影的所有参数
});


const BASE_URL = "https://web5.mukaku.com";
const API_BASE = `${BASE_URL}/prod/api/v1/getVideoMovieList`;
// 这两个值为静态 API 凭证（从前端 JS 中提取，无需登录）
const APP_ID = "83768d9ad4";
const IDENTITY = "23734adac0301bccdcb107c4aa21f96c";

/**
 * 剧集标题清理：去掉季数/年番/数字后缀，避免 TMDB 搜索首播季失败
 * 例：德黑兰 第三季  → 德黑兰
 * 例：大主宰 年番2   → 大主宰
 * 例：大主宰 年番 2  → 大主宰
 * 例：斗破苍穹 2     → 斗破苍穹
 */
function cleanSeriesTitle(title) {
    return title
        // 去掉 "第X季" / "第X期"（中文数字或阿拉伯数字）及之后所有内容
        .replace(/\s*第[一二三四五六七八九十百千0-9]+[季期].*$/, "")
        // 去掉 "Season N"
        .replace(/\s*Season\s*\d+.*$/i, "")
        // 去掉 "年番 N" 或 "年番N"（含空格变体）
        .replace(/\s*年番\s*\d+.*$/, "")
        // 兜底：去掉末尾的 "空格 + 纯数字"（如 "大主宰 2"）
        .replace(/\s+\d+(\s.*)?$/, "")
        .trim();
}

/**
 * 调用 mukaku API 获取影视列表
 * 参数说明（经浏览器抓包确认）：
 *   sa=1 → 内容类型（1=电影）
 *   sc   → 类型（genre）
 *   sd   → 地区（area）
 *   se   → 年份（year）
 *   sf   → 画质（quality）
 *   sg   → 排序（sort）
 *   pfrs → 最低评分人数
 *   pfqj → 评分区间（如 6.0x10.0）
 */
async function fetchMukaku(params, contentType = "1") {
    const page = params.page || 1;
    const sort = params.sort_by || "1";
    const genre = params.genre || "";
    const area = params.area || "";
    const year = params.year || "";
    const quality = params.quality || "";
    const pfrs = params.pfrs || "0";
    const pfqj = params.pfqj || "0x10";

    const url = `${API_BASE}?sa=${contentType}&sb=&sc=${encodeURIComponent(genre)}&sct=&scn=0` +
        `&sd=${encodeURIComponent(area)}&sdt=&sdn=` +
        `&se=${encodeURIComponent(year)}&set=&sen=` +
        `&sf=${encodeURIComponent(quality)}&sft=&sfn=` +
        `&sg=${sort}&sh=&sht=&shn=0` +
        `&page=${page}` +
        `&pfrs=${pfrs}&pfrst=&pfrsn=` +
        `&pfqj=${encodeURIComponent(pfqj)}&pfqjt=&pfqjn=` +
        `&imdb=0&imdbt=&imdbn=&iswp=0&iswpt=&iswpn=` +
        `&app_id=${APP_ID}&identity=${IDENTITY}`;

    try {
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Referer": `${BASE_URL}/`,
            }
        });
        return response.data || null;
    } catch (err) {
        console.error(`请求 mukaku API 失败: ${err}`);
        return null;
    }
}

/**
 * 通过标题 + 年份搜索 TMDB，返回第一个匹配结果
 */
async function searchTMDB(title, year, mediaType) {
    try {
        const api = mediaType === "tv" ? "search/tv" : "search/movie";
        const searchParams = { query: title, language: "zh-CN" };
        const parsedYear = parseInt(year);
        if (parsedYear > 1900) {
            searchParams[mediaType === "tv" ? "first_air_date_year" : "year"] = parsedYear;
        }
        const response = await Widget.tmdb.get(api, { params: searchParams });
        if (response && response.results && response.results.length > 0) {
            return response.results[0];
        }
    } catch (err) {
        console.error(`TMDB 搜索 "${title}" (${year}) 失败: ${err}`);
    }
    return null;
}

/**
 * 通用的影视列表获取逻辑：拉取 API → 并行 TMDB 匹配
 */
async function fetchAndEnrich(params, mediaType, contentType = "1") {
    const raw = await fetchMukaku(params, contentType);
    if (!raw || !raw.data || !raw.data.list) {
        console.error("获取数据失败，请检查网络或参数");
        return [];
    }

    const items = raw.data.list;
    const total = raw.data.total || 0;
    console.log(`第 ${params.page || 1} 页 / 共 ${total} 部，获取到 ${items.length} 部，开始并行 TMDB 匹配...`);

    const searchPromises = items.map(async item => {
        const siteRating = parseFloat(item.edbf) || 0;  // 豆瓣评分
        const posterFallback = item.epic || "";           // 网站自带封面
        const year = item.niandai || "";           // 年份
        const searchTitle = mediaType === "tv" ? cleanSeriesTitle(item.title) : item.title;

        let tmdb = await searchTMDB(searchTitle, year, mediaType);

        // 兜底：中文标题搜不到时，用豆瓣 ID 查豆瓣 API 取原始标题（英文）再搜一次
        if (!tmdb && item.doub_id) {
            try {
                const doubanRes = await Widget.http.get(
                    `https://m.douban.com/rexxar/api/v2/subject/${item.doub_id}`,
                    {
                        headers: {
                            "Referer": "https://movie.douban.com/explore",
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        }
                    }
                );
                const originalTitle = doubanRes?.data?.original_title;
                if (originalTitle && originalTitle !== item.title) {
                    console.log(`"${item.title}" 中文搜索失败，用原始标题 "${originalTitle}" 重试...`);
                    tmdb = await searchTMDB(originalTitle, year, mediaType);
                }
            } catch (e) {
                console.error(`豆瓣 API 查询 ${item.doub_id} 失败`, e);
            }
        }

        if (tmdb) {
            return {
                id: tmdb.id,
                type: "tmdb",
                title: tmdb.title || tmdb.name || item.title,
                originalTitle: tmdb.original_title || tmdb.original_name || "",
                description: tmdb.overview || "",
                releaseDate: tmdb.release_date || tmdb.first_air_date || "",
                posterPath: tmdb.poster_path || posterFallback,
                backdropPath: tmdb.backdrop_path || "",
                rating: tmdb.vote_average || siteRating,
                mediaType: mediaType,
            };
        } else {
            console.log(`"${item.title}" 中英文均未在 TMDB 找到匹配，降级使用站内数据`);
            return {
                id: `douban_${item.doub_id || item.title}`,
                type: "movie",
                title: item.title,
                posterPath: posterFallback,
                rating: siteRating,
            };
        }
    });

    const results = await Promise.all(searchPromises);
    console.log(`返回 ${results.length} 部`);
    return results;
}

async function getMovies(params) {
    return await fetchAndEnrich(params, "movie", "1");
}

async function getTVSeries(params) {
    // 剧集使用 sa=2；TMDB 搜索时不传年份（网站展示的是当年播出年份而非首播年）
    return await fetchAndEnrich(params, "tv", "2");
}
