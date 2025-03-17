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

function extractDetails(html) {
    const details = [];

    const descriptionMatch = html.match(/<p[^>]*>(.*?)<\/p>/s);
    let description = descriptionMatch 
        ? decodeHTMLEntities(descriptionMatch[1].trim()) 
        : 'N/A';

    const aliasMatch = html.match(/<li>\s*<div class="icon">\s*<i class="far fa-clock"><\/i>\s*<\/div>\s*<span>\s*مدة العرض\s*:\s*<\/span>\s*<a[^>]*>\s*(\d+)\s*<\/a>/);
    let alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    const airdateMatch = html.match(/<li>\s*<div class="icon">\s*<i class="far fa-calendar"><\/i>\s*<\/div>\s*<span>\s*تاريخ الاصدار\s*:\s*<\/span>\s*<a[^>]*?>\s*(\d{4})\s*<\/a>/);
    let airdate = airdateMatch ? airdateMatch[1].trim() : 'N/A';

    details.push({
        description: description,
        alias: alias,
        airdate: airdate
    });

    console.log(details);
    return details;
}

function extractEpisodes(html) {
    const episodes = [];

    const episodeRegex = /<a href="([^"]+)">\s*الحلقة\s*<em>(\d+)<\/em>\s*<\/a>/g;
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

    console.log(episodes);
    return episodes;
}

async function extractStreamUrl(html) {
    const serverMatch = html.match(/<li[^>]+data-watch="([^"]+mp4upload\.com[^"]+)"/);
    const embedUrl = serverMatch ? serverMatch[1].trim() : 'N/A';

    let streamUrl = "";

    if (embedUrl !== 'N/A') {
        const response = await fetch(embedUrl);
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

extractStreamUrl(`<ul id="watch"><li data-watch="https://vidmoly.to/embed-tg3m13b6h3mp.html" class=""><span>0</span>سيرفر 1 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://mega.nz/embed/E1wTyKqB#QNWmdJu1MofT6cBAbgsVt53dXmJFHGmZpbMHeZ7jfbo.html" class=""><span>1</span>سيرفر 1.2 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://video.sibnet.ru/shell.php?videoid=5801147.html" class=""><span>2</span>سيرفر 2 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://sendvid.com/embed/s6b587n6.html" class=""><span>3</span>سيرفر 3.1 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://listeamed.net/e/3Q0lxBbjj8nxj1J" class=""><span>4</span>سيرفر 3 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://www.mp4upload.com/embed-7zgvunri22wk.html" class=""><span>5</span>سيرفر 4 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://uqload.net/embed-u9qr2bk48203.html" class="ISActive"><span>6</span>سيرفر 5 <noscript><iframe src="" allowfullscreen></iframe></noscript></li><li data-watch="https://ghbrisk.com/e/oqis9bikzybm.html" class=""><span>7</span>سيرفر احتياطي 1 <noscript><iframe src="" allowfullscreen></iframe></noscript></li></ul>`);