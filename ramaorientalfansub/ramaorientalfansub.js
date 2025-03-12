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
    const descriptionMatch = html.match(/<div[^>]*data-synopsis[^>]*class="line-clamp-3"[^>]*>([\s\S]*?)<\/div>/);
    let description = descriptionMatch 
        ? descriptionMatch[1].replace(/<[^>]+>/g, '').trim() 
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
    
    // Capture the content inside the swiper-wrapper
    const wrapperMatch = html.match(/<div class="swiper-wrapper">([\s\S]*?)<\/div>/);
    if (wrapperMatch) {
        const wrapperContent = wrapperMatch[1];
        // Match all swiper-slide blocks
        const slideRegex = /<div class="swiper-slide[^"]*"[\s\S]*?<\/div>\s*(?=<div|$)/g;
        const slides = wrapperContent.match(slideRegex);
        
        if (slides) {
            slides.forEach(slide => {
                // Extract the href attribute from the <a> tag
                const hrefMatch = slide.match(/<a href="([^"]+)"/);
                // Look for text that contains "episodio" followed by a number (case-insensitive)
                const epNumMatch = slide.match(/episodio\s*(\d+)/i);
                
                if (hrefMatch && epNumMatch) {
                    episodes.push({
                        href: hrefMatch[1].trim(),
                        number: epNumMatch[1].trim()
                    });
                }
            });
        }
    }
    
    // Reverse the order if needed
    episodes.reverse();
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