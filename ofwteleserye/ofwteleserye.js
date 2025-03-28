function searchResults(html) {
    const results = [];
    // Match each article with class "post-item"
    const itemBlocks = html.match(/<article\s+class="post-item[\s\S]*?<\/article>/gi);
    if (!itemBlocks) return results;
  
    itemBlocks.forEach(block => {
        // Extract the href and title from the <h2 class="post-title"> block
        const hrefMatch = block.match(/<h2\s+class="post-title">[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
        // Extract the image URL from the <div class="post-thumbnail"> block
        const imgMatch = block.match(/<div\s+class="post-thumbnail">[\s\S]*?<img[^>]+src="([^"]+)"/i);
    
        if (hrefMatch && imgMatch) {
            const href = hrefMatch[1].trim();
            const title = hrefMatch[2].trim();
            const image = imgMatch[1].trim();
    
            results.push({ title, image, href });
        }
    });
  
    console.log("sdasd");
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
        const fetchedHtml = await response;
        
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

searchResults(`<main id="main" class="site-main" role="main">
                            <header class="search-header">
                                <h1 class="search-title">
                                    Search Results for: <span>ss</span>
                                </h1>
                            </header>
                            <!-- END .search-header -->
                            <article id="post-273206" class="post-item post-273206 post type-post status-publish format-standard has-post-thumbnail hentry category-tv-patrol-express tag-tv-patrol-express">
                                <div class="right">
                                    <div class="post-thumbnail">
                                        <img width="320" height="320" src="https://www.ofwteleserye.su/wp-content/uploads/2024/12/xTV-Patrol-Express-320x320.jpg.pagespeed.ic.iEaVYNNxwB.webp" class="attachment-post-thumbnail size-post-thumbnail wp-post-image" alt="" decoding="async" fetchpriority="high" srcset="https://www.ofwteleserye.su/wp-content/uploads/2024/12/TV-Patrol-Express-320x320.jpg 320w, https://www.ofwteleserye.su/wp-content/uploads/2024/12/TV-Patrol-Express-150x150.jpg 150w" sizes="(max-width: 320px) 100vw, 320px" data-pagespeed-url-hash="2136403535" onload="pagespeed.CriticalImages.checkImageForCriticality(this);"/>
                                    </div>
                                    <!-- END .post-thumbnail -->
                                </div>
                                <!-- END .right -->
                                <div class="left">
                                    <div class="post-meta category-links">
                                        <a href="https://www.ofwteleserye.su/category/tv-patrol-express/" title="View all posts in TV Patrol Express">TV Patrol Express</a>
                                    </div>
                                    <!-- END .post-meta -->
                                    <h2 class="post-title">
                                        <a href="https://www.ofwteleserye.su/tv-patrol-express-march-27-2025/" title="TV Patrol Express March 27, 2025" rel="bookmark">TV Patrol Express March 27, 2025</a>
                                    </h2>
                                    <!-- END .post-excerpt -->
                                </div>
                                <!-- END .left -->
                            </article>
                            <!-- END .post-item -->
                            <article id="post-273003" class="post-item post-273003 post type-post status-publish format-standard has-post-thumbnail hentry category-tv-patrol-express tag-tv-patrol-express">
                                <div class="right">
                                    <div class="post-thumbnail">
                                        <img width="320" height="320" src="https://www.ofwteleserye.su/wp-content/uploads/2024/12/xTV-Patrol-Express-320x320.jpg.pagespeed.ic.iEaVYNNxwB.webp" class="attachment-post-thumbnail size-post-thumbnail wp-post-image" alt="" decoding="async" srcset="https://www.ofwteleserye.su/wp-content/uploads/2024/12/TV-Patrol-Express-320x320.jpg 320w, https://www.ofwteleserye.su/wp-content/uploads/2024/12/TV-Patrol-Express-150x150.jpg 150w" sizes="(max-width: 320px) 100vw, 320px" data-pagespeed-url-hash="2136403535" onload="pagespeed.CriticalImages.checkImageForCriticality(this);"/>
                                    </div>
                                    <!-- END .post-thumbnail -->
                                </div>
                                <!-- END .right -->
                                <div class="left">
                                    <div class="post-meta category-links">
                                        <a href="https://www.ofwteleserye.su/category/tv-patrol-express/" title="View all posts in TV Patrol Express">TV Patrol Express</a>
                                    </div>
                                    <!-- END .post-meta -->
                                    <h2 class="post-title">
                                        <a href="https://www.ofwteleserye.su/tv-patrol-express-march-26-2025/" title="TV Patrol Express March 26, 2025" rel="bookmark">TV Patrol Express March 26, 2025</a>
                                    </h2>
                                    <!-- END .post-excerpt -->
                                </div>
                                <!-- END .left -->
                            </article>
                            <!-- END .post-item -->
                            <article id="post-272803" class="post-item post-272803 post type-post status-publish format-standard has-post-thumbnail hentry category-tv-patrol-express tag-tv-patrol-express">
                                <div class="right">
                                    <div class="post-thumbnail">
                                        <img width="320" height="320" src="https://www.ofwteleserye.su/wp-content/uploads/2024/12/xTV-Patrol-Express-320x320.jpg.pagespeed.ic.iEaVYNNxwB.webp" class="attachment-post-thumbnail size-post-thumbnail wp-post-image" alt="" decoding="async" srcset="https://www.ofwteleserye.su/wp-content/uploads/2024/12/TV-Patrol-Express-320x320.jpg 320w, https://www.ofwteleserye.su/wp-content/uploads/2024/12/TV-Patrol-Express-150x150.jpg 150w" sizes="(max-width: 320px) 100vw, 320px" data-pagespeed-url-hash="2136403535" onload="pagespeed.CriticalImages.checkImageForCriticality(this);"/>
                                    </div>
                                    <!-- END .post-thumbnail -->
                                </div>
                                <!-- END .right -->
                                <div class="left">
                                    <div class="post-meta category-links">
                                        <a href="https://www.ofwteleserye.su/category/tv-patrol-express/" title="View all posts in TV Patrol Express">TV Patrol Express</a>
                                    </div>
                                    <!-- END .post-meta -->
                                    <h2 class="post-title">
                                        <a href="https://www.ofwteleserye.su/tv-patrol-express-march-25-2025/" title="TV Patrol Express March 25, 2025" rel="bookmark">TV Patrol Express March 25, 2025</a>
                                    </h2>
                                    <!-- END .post-excerpt -->
                                </div>
                                <!-- END .left -->
                            </article>
                            <!-- END .post-item -->`);