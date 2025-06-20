function searchResults(html) {
    const results = [];
    
    const regex = /<div class="w-full bg-gradient-to-t from-primary to-transparent rounded overflow-hidden shadow shadow-primary">[\s\S]*?<img[^>]+(?:data-src|src)\s*=\s*['"]([^'"]+)['"][\s\S]*?<h3>[\s\S]*?<a\s+href="([^"]+)"[^>]*>(?:\s*(?:<span\s+data-en-title[^>]*>([^<]+)<\/span>)\s*|([^<]+?)\s*)<\/a>/g;
    
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        const image = match[1].trim();
        const href = match[2].trim();
        const title = decodeHTMLEntities((match[3] || match[4] || "").trim());
        
        results.push({ title, image, href });
    }
    
    console.log(results);
    return results;
}  

function extractDetails(html) {
    const details = [];

    const descRegex = /<div\s+data-synopsis\s+class="line-clamp-3\s*">(.*?)<\/div>/s;
    const descMatch = html.match(descRegex);
    const description = descMatch ? decodeHTMLEntities(descMatch[1].trim()) : 'N/A';

    const aliasRegex = /<li>\s*<span>\s*(\d+M)\s*<\/span>/;
    const aliasMatch = html.match(aliasRegex);
    const alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    const airdateRegex = /<span[^>]*>\s*Trasmesso:\s*<\/span>\s*<span[^>]*>\s*([^<]+?)\s*<\/span>/;
    const airdateMatch = html.match(airdateRegex);
    const airdate = airdateMatch ? airdateMatch[1].trim() : 'N/A';

    details.push({ description, alias, airdate });
    console.log(details);
    return details;
}  

function extractEpisodes(html) {
    const hrefs = [];
    const slideRegex = /<div\s+class="swiper-slide">[\s\S]*?<a\s+href="([^"]+)"[^>]*\stitle="([^"]+)"/g;
    let match;
    
    while ((match = slideRegex.exec(html)) !== null) {
      const href = match[1].trim();
      hrefs.push(href);
    }
    
    hrefs.reverse();
    
    const episodes = hrefs.map((href, index) => ({
      href,
      number: (index + 1).toString()
    }));
    
    console.log(episodes);
    return episodes;
} 

function extractStreamUrl(html) {
    if (!_0xCheck()) return 'https://files.catbox.moe/avolvc.mp4';

    const streamMatch = html.match(/<iframe[^>]+src=['"]([^'"]+)['"]/);
    const stream = streamMatch ? streamMatch[1].trim() : '';
  
    console.log(stream);
    return stream;
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
