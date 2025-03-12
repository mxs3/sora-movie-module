function searchResults(html) {
    const results = [];
    // Split by the unique item container start.
    const itemBlocks = html.split('<div class="w-full bg-gradient-to-t from-primary to-transparent rounded overflow-hidden shadow shadow-primary">');
    
    // Remove the first element as it contains content before the first item.
    itemBlocks.shift();
    
    itemBlocks.forEach(block => {
        // Extract the title from the same <a> element.
        const titleMatch = block.match(/<h3>[\s\S]*?<a [^>]+>([\s\S]*?)<\/a>/);
        // Extract the image URL from the first <img> tag.
        const imgMatch = block.match(/<img[^>]*src="([^"]+)"/);
        // Extract the href from the <h3> tag's <a> element.
        const hrefMatch = block.match(/<h3>[\s\S]*?<a href="([^"]+)"/);

        if (hrefMatch && titleMatch && imgMatch) {
            const href = hrefMatch[1];
            const title = titleMatch[1];
            const imageUrl = imgMatch[1];
            
            results.push({
                title: title.trim(),
                image: imageUrl.trim(),
                href: href.trim()
            });
        }
    });
    
    console.log(results);
    return results;
}

function extractDetails(html) {
    const details = [];

    // Extract description from the synopsis div (data-synopsis attribute)
    const descriptionMatch = html.match(/<span class="block w-full max-h-24 overflow-scroll mlb-3 overflow-x-hidden text-xs text-gray-200">([^<]+)<\/span>/);
    let description = descriptionMatch 
        ? decodeHTMLEntities(descriptionMatch[1].trim())
        : 'N/A';

    // Extract the duration (alias) from the metadata list (e.g. "24M")
    const aliasMatch = html.match(/<li>\s*<span>\s*(\d+M)\s*<\/span>/);
    let alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    // Airdate is not available in this HTML so we use 'N/A'
    let airdate = 'N/A';

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
    // Regex to match each swiper-slide block with an <a> tag containing an href and title.
    const slideRegex = /<div class="swiper-slide[^"]*"[\s\S]*?<a href="([^"]+)"[^>]*title="([^"]+)"/g;
    let match;
    
    while ((match = slideRegex.exec(html)) !== null) {
        const href = match[1].trim();
        const title = match[2].trim();
        // Extract episode number from the title (e.g., "Episodio 3" or "episodio 3")
        const epNumMatch = title.match(/episodio\s*(\d+)/i);
        if (epNumMatch) {
            episodes.push({
                href: href,
                number: epNumMatch[1].trim()
            });
        }
    }

    if (episodes[0].number !== "1") {
        episodes.reverse();
    }

    console.log(episodes);
    return episodes;
}


function extractStreamUrl(html) {
    // Match the iframe tag and extract the src attribute.
    const streamMatch = html.match(/<iframe[^>]+src=['"]([^'"]+)['"]/);
    const stream = streamMatch ? streamMatch[1].trim() : 'N/A';

    console.log(stream);
    return stream;
}

function decodeHTMLEntities(text) {
    // Replace numeric entities (e.g., &#039;) with the corresponding character.
    text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    // Replace some common named entities.
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
