function searchResults(html) {
    const results = [];
    // Capture from the beginning of the item block up to the <div class="fixyear"> sibling
    const filmListRegex = /<div id="mt-\d+" class="item">([\s\S]*?)(?=<div class="fixyear">)/g;
    const items = html.matchAll(filmListRegex);

    for (const item of items) {
        const itemHtml = item[1];

        const hrefMatch = itemHtml.match(/<a href="([^"]+)"/);

        // Extract title from <span class="tt">TITLE</span>
        const titleMatch = itemHtml.match(/<span class="tt">([\s\S]*?)<\/span>/);

        // Extract image URL from <img ... src="...">
        const imgMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/);

        if (hrefMatch && titleMatch && imgMatch) {
            const href = hrefMatch[1];
            const title = titleMatch[1];
            const imageUrl = imgMatch[1];
        
            results.push({
                title: title.trim(),
                image: imageUrl.trim(),
                href: href.trim(),
            });
        }
    }

    console.log(results);
    return results;
}

function extractDetails(html) {
    const details = [];

    // Extract description from the <div itemprop="description"> and remove any HTML tags
    const descriptionMatch = html.match(/<div itemprop="description">([\s\S]*?)<\/div>/);
    let description = descriptionMatch 
        ? descriptionMatch[1].replace(/<[^>]+>/g, '').trim() 
        : 'N/A';

    // Extract original name (alias) from its corresponding div
    const aliasMatch = html.match(/<div class="metadatac"><b>Firt air date<\/b><span[^>]*>([^<]+)<\/span>/);
    let alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    // Extract airdate from the "Firt air date" field
    const airdateMatch = html.match(/<b>Firt air date<\/b><span[^>]*>([^<]+)<\/span>/);
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

    // Attempt to extract episodes from the <ul class="episodios"> list
    const episodesMatch = html.match(/<ul class="episodios">([\s\S]*?)<\/ul>/);

    if (episodesMatch) {
        // Match all <li> items within the episodios list
        const liMatches = episodesMatch[1].match(/<li>([\s\S]*?)<\/li>/g);
        
        if (liMatches) {
            liMatches.forEach(li => {
                // Extract the href from the <a> tag
                const hrefMatch = li.match(/<a href="([^"]+)"/);
                // Extract the episode number from the <div class="numerando">
                const numMatch = li.match(/<div class="numerando">(\d+)<\/div>/);
                if (hrefMatch && numMatch) {
                    episodes.push({
                        href: hrefMatch[1].trim(),
                        number: numMatch[1].trim()
                    });
                }
            });
        }
    }

    // Reverse the order so episodes are in ascending order (if needed)
    episodes.reverse();

    console.log(episodes);
    return episodes;
}


function extractStreamUrl(html) {
    // Match the stream URL until the next double quote
    const streamMatch = html.match(/<li>\s*Right click and choose "Save link as\.\.\." :\s*&nbsp;?\s*<a [^>]*href="([^"]+)"/);
    const stream = streamMatch ? streamMatch[1].trim() : 'N/A';

    // Match the subtitles URL until the next double quote
    const subtitlesMatch = html.match(/Download Subtitle :&nbsp;?\s*<a [^>]*href="([^"]+)"/);
    const subtitles = subtitlesMatch ? subtitlesMatch[1].trim() : 'N/A';

    const result = {
        stream: stream,
        subtitles: subtitles,
    };

    console.log(result);
    return result;
}
