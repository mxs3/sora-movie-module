function searchResults(html) {
    const results = [];
    // Match all items: any div with id starting "mt-" and class "item"
    const filmListRegex = /<div id="mt-\d+" class="item">[\s\S]*?<\/div>/g;
    const items = html.match(filmListRegex) || [];

    items.forEach((itemHtml) => {
        // Extract the first href from an <a> tag
        const hrefMatch = itemHtml.match(/<a href="([^"]+)"/);
        const href = hrefMatch ? hrefMatch[1] : '';

        // Extract title from <span class="tt">TITLE</span>
        const titleMatch = itemHtml.match(/<span class="tt">([\s\S]*?)<\/span>/);
        const title = titleMatch ? titleMatch[1] : '';

        // Extract image URL from <img ... src="...">
        const imgMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        if (title && href) {
            results.push({
                title: title.trim(),
                image: imageUrl.trim(),
                href: href.trim(),
            });
        }
    });

    console.log(results);
    
    return JSON.stringify(results);
}


function extractDetails(html) {
    const details = [];

    // Extract description from the <div itemprop="description"> and remove any HTML tags
    const descriptionMatch = html.match(/<div itemprop="description">([\s\S]*?)<\/div>/);
    let description = descriptionMatch 
        ? descriptionMatch[1].replace(/<[^>]+>/g, '').trim() 
        : '';

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
    return JSON.stringify(details);
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
                        href: "episode: " + hrefMatch[1].trim(),
                        number: numMatch[1].trim()
                    });
                }
            });
        }
    }

    // Reverse the order so episodes are in ascending order (if needed)
    episodes.reverse();

    console.log(episodes);
    return JSON.stringify(episodes);
}


async function extractStreamUrl(html) {
    const streamMatch = html.match(/<li>Right click and choose "Save link as..." : &nbsp <a rel="nofollow" target="_blank" href="([^<]+)"/);
    const stream = streamMatch ? streamMatch[1].trim() : 'N/A';

    const subtitlesMatch = html.match(/Download Subtitle :&nbsp  <a rel="nofollow" target="_blank" href="([^<]+)"/);
    const subtitles = subtitlesMatch ? subtitlesMatch[1].trim() : 'N/A';

    const result = {
        stream: stream,
        subtitles: subtitles,
    };

    console.log(result);
    return JSON.stringify(result);
}