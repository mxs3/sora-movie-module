async function searchResults(keyword) {
    const results = [];

    const response = await soraFetch(`https://www.arabic-toons.com/livesearch.php?q=${keyword}`);
    const html = await response.text();

    const responseForMovies = await soraFetch(`https://www.arabic-toons.com/livesearch.php?m=&q=${keyword}`);
    const htmlForMovies = await responseForMovies.text();

    const regex = /<a class="list-group-item list-group-item-action (?:active)?" href="([^"]+)">\s*([\s\S]*?)<span class="badge">(\d+)<\/span><\/a>/gu;

    let match;
    while ((match = regex.exec(html)) !== null) {
        const rawTitle = match[2]
            .replace(/<span[^>]*>.*?<\/span>/, '')
            .replace(/\s+/g, ' ')
            .trim();

        results.push({
            title: rawTitle,
            href: `https://www.arabic-toons.com/${match[1].trim()}`,
            image: ""
        });
    }

    let match2;
    while ((match2 = regex.exec(htmlForMovies)) !== null) {
        const rawTitle = match2[2]
            .replace(/<span[^>]*>.*?<\/span>/, '')
            .replace(/\s+/g, ' ')
            .trim();

        results.push({
            title: rawTitle,
            href: `https://www.arabic-toons.com/${match2[1].trim()}`,
            image: ""
        });
    }

    console.log(`Search Results: ${JSON.stringify(results)}`);
    return JSON.stringify(results);
}

// searchResults(`ناروتو`);
// extractDetails(`https://www.arabic-toons.com/naruto-s1-1405905015-anime-streaming.html`);
// extractEpisodes(`https://www.arabic-toons.com/naruto-s1-1405905015-anime-streaming.html`);
extractStreamUrl(`https://www.arabic-toons.com/naruto-s1-1405905015-23354.html#sets`);

async function extractDetails(url) {
    console.log('Extracting details from: ' + url);

    const results = [];
    const response = await soraFetch(url);
    const html = await response.text();

    const match = html.match(/<h1[^>]*?>قصة الكرتون\s*\/\s*الأنمي<\/h1>\s*<div[^>]*?>([\s\S]*?)<\/div>/);
    const description = match ? match[1].trim().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ') : 'N/A';

    results.push({
        description: description,
        aliases: '',
        airdate: ''
    });

    console.log(`Details: ${JSON.stringify(results)}`);
    return JSON.stringify(results);
}

async function extractEpisodes(url) {
    const results = [];
    const response = await soraFetch(url);
    const html = await response.text();

    const regex = /<a[^>]+href="([^"]+\.html#sets)"[^>]*>[\s\S]*?<div[^>]*class="badge-overd[^>]*>\s*الحلقة\s+(\d+)/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
        results.push({
            href: `https://www.arabic-toons.com/${match[1].trim()}`,
            number: parseInt(match[2], 10)
        });
    }

    console.log(`Episodes: ${JSON.stringify(results)}`);
    return JSON.stringify(results);
}


async function extractStreamUrl(url) {
    if (!_0xCheck()) return 'https://files.catbox.moe/avolvc.mp4';

    const response = await soraFetch(url);
    const html = await response.text();

    const regex = /jC1kO:\s*"(.*?)",\s*hF3nV:\s*"(.*?)",\s*iA5pX:\s*"(.*?)",\s*tN4qY:\s*"(.*?)"/;
    const match = regex.exec(html);

    if (match) {
        const protocol = match[1];
        const host = match[2];
        const path = match[3];
        const query = match[4];

        const fullUrl = `${protocol}://${host}/${path}?${query}`;

        console.log(`Stream URL: ${fullUrl}`);
        return fullUrl;
    }

    console.log('Stream URL not found');
    return "";
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
