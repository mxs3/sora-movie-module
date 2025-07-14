function searchResults(html) {
    const results = [];

    const itemBlocks = html.match(/<div class="MovieItem">[\s\S]*?<h4>(.*?)<\/h4>[\s\S]*?<\/a>/g);

    if (!itemBlocks) return results;

    itemBlocks.forEach(block => {
        const hrefMatch = block.match(/<a href="([^"]+)"/);
        const titleMatch = block.match(/<h4>(.*?)<\/h4>/);
        const imgMatch = block.match(/background-image:\s*url\(([^)]+)\)/);

        if (hrefMatch && titleMatch && imgMatch) {
            const href = hrefMatch[1].trim();
            const title = titleMatch[1].trim();
            const image = imgMatch[1].trim();

            results.push({ title, image, href });
        }
    });

    console.log(results);
    return results;
}

function decodeHTMLEntities(text) {
    return text
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function extractEpisodes(html) {
    const episodes = [];

    const episodeRegex = /<a[^>]+href="([^"]+)">[^<]*الحلقة\s*<em>(\d+)<\/em>/g;
    let match;

    while ((match = episodeRegex.exec(html)) !== null) {
        const href = match[1].trim() + "/watch/";
        const number = match[2].trim();

        episodes.push({
            href: href,
            number: number
        });
    }

    if (episodes.length > 0 && episodes[0].number !== "1") {
        episodes.reverse();
    }

    return episodes;
}

async function extractDetails(html, url) {
    const details = {
        description: '',
        airdate: '',
        alias: '',
        episodes: []
    };

    // ✅ الوصف
    const descriptionMatch = html.match(/<p[^>]*>(.*?)<\/p>/s);
    details.description = descriptionMatch 
        ? decodeHTMLEntities(descriptionMatch[1].trim()) 
        : 'N/A';

    // ✅ مدة العرض
    const aliasMatch = html.match(/<i class="far fa-clock"><\/i>[^<]*<\/div>\s*<span>[^<]*<\/span>\s*<a[^>]*>([^<]+)<\/a>/);
    details.alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    // ✅ سنة الإصدار
    const airdateMatch = html.match(/<i class="far fa-calendar"><\/i>[^<]*<\/div>\s*<span>[^<]*<\/span>\s*<a[^>]*>(\d{4})<\/a>/);
    details.airdate = airdateMatch ? airdateMatch[1].trim() : 'N/A';

    // ✅ استخراج المواسم
    const seasonRegex = /<a[^>]+data-season="(\d+)"[^>]*>([^<]+)<\/a>/g;
    const seasons = [];
    let seasonMatch;
    while ((seasonMatch = seasonRegex.exec(html)) !== null) {
        seasons.push({
            id: seasonMatch[1].trim(),
            title: decodeHTMLEntities(seasonMatch[2].trim())
        });
    }

    // ✅ fallback لو مفيش مواسم
    if (seasons.length === 0) {
        seasons.push({
            id: null,
            title: "Main"
        });
    }

    // ✅ تحميل الحلقات لكل موسم
    for (const season of seasons) {
        let seasonHtml = html;

        if (season.id) {
            const form = new URLSearchParams();
            form.append("action", "season_data");
            form.append("season_id", season.id);

            try {
                const res = await soraFetch("https://ristoanime.net/wp-admin/admin-ajax.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Referer": url,
                        "User-Agent": "Mozilla/5.0"
                    },
                    body: form.toString()
                });

                seasonHtml = await res.text();
            } catch (e) {
                console.warn(`Error loading season ${season.id}`, e);
                continue;
            }
        }

        const eps = extractEpisodes(seasonHtml);
        details.episodes.push({
            seasonId: season.id,
            seasonTitle: season.title,
            episodes: eps
        });
    }

    return details;
}

async function extractStreamUrl(html) {
    if (!_0xCheck()) return 'https://files.catbox.moe/avolvc.mp4';

    const serverMatch = html.match(/<li[^>]+data-watch="([^"]+mp4upload\.com[^"]+)"/);
    const embedUrl = serverMatch ? serverMatch[1].trim() : 'N/A';

    let streamUrl = "";

    if (embedUrl !== 'N/A') {
        const response = await soraFetch(embedUrl);
        const fetchedHtml = await response.text();
        
        const streamMatch = fetchedHtml.match(/player\.src\(\{\s*type:\s*["']video\/mp4["'],\s*src:\s*["']([^"']+)["']\s*\}\)/i);
        if (streamMatch) {
            streamUrl = streamMatch[1].trim();
        }
    }

    console.log(streamUrl);
    return streamUrl;
}

function decodeHTMLEntities(text) {
    text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    
    const entities = {
        '&quot;': '"',
        '&amp;': '&',
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>'
    };
    
    for (const entity in entities) {
        text = text.replace(new RegExp(entity, 'g'), entities[entity]);
    }

    return text;
}

async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            return null;
        }
    }
}

function _0xCheck() {
    var _0x1a = typeof _0xB4F2 === 'function';
    var _0x2b = typeof _0x7E9A === 'function';
    return _0x1a && _0x2b ? (function(_0x3c) {
        return _0x7E9A(_0x3c);
    })(_0xB4F2()) : !1;
}

function _0x7E9A(_){return((___,____,_____,______,_______,________,_________,__________,___________,____________)=>(____=typeof ___,_____=___&&___[String.fromCharCode(...[108,101,110,103,116,104])],______=[...String.fromCharCode(...[99,114,97,110,99,105])],_______=___?[...___[String.fromCharCode(...[116,111,76,111,119,101,114,67,97,115,101])]()]:[],(________=______[String.fromCharCode(...[115,108,105,99,101])]())&&_______[String.fromCharCode(...[102,111,114,69,97,99,104])]((_________,__________)=>(___________=________[String.fromCharCode(...[105,110,100,101,120,79,102])](_________))>=0&&________[String.fromCharCode(...[115,112,108,105,99,101])](___________,1)),____===String.fromCharCode(...[115,116,114,105,110,103])&&_____===16&&________[String.fromCharCode(...[108,101,110,103,116,104])]===0))(_)}
