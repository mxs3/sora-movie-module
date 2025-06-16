async function searchResults(keyword) {
    const results = [];
    const response = await soraFetch(`https://onepace.net/en/watch`);
    const html = await response.text();

    const arcSections = html.split('<h2');

    for (let i = 1; i < arcSections.length; i++) {
        const section = arcSections[i];
        
        const titleMatch = section.match(/>([^<]+)<\/a>/);
        if (!titleMatch) continue;
        const arcTitle = titleMatch[1].trim();
        
        let arcImage = '';
        const bgImageMatch = section.match(/background-image:\s*url\(['"]([^'"]+)['"]\)/);
        const imgMatch = section.match(/<img[^>]+src=["']([^"']+)["']/);
        arcImage = bgImageMatch ? bgImageMatch[1] : imgMatch ? imgMatch[1] : '';
        arcImage = arcImage.replace(/&amp;/g, '&');
        
        const episodeBlocks = section.split('<span class="flex-1">');
        
        for (let j = 1; j < episodeBlocks.length; j++) {
            const block = episodeBlocks[j];
            
            let versionInfo = '';
            if (block.includes('English Subtitles')) {
                versionInfo = 'English Subtitles';
                const extraInfo = block.match(/<span class="font-normal">,\s*<!--\s*-->([^<]+)/);
                if (extraInfo) {
                    versionInfo += `, ${extraInfo[1].trim()}`;
                }
            } else if (block.includes('English Dub')) {
                versionInfo = 'English Dub';
                if (block.includes('with Closed Captions')) {
                    versionInfo += ' with Closed Captions';
                } else {
                    const extraInfo = block.match(/<span class="font-normal">,\s*<!--\s*-->([^<]+)/);
                    if (extraInfo) {
                        versionInfo += `, ${extraInfo[1].trim()}`;
                    }
                }
            }

            const qualityMatches = [...block.matchAll(/>\s*(480p|720p|1080p)\s*<\/span>/g)];
            const linkMatches = [...block.matchAll(/https:\/\/pixeldrain\.net\/l\/[^"]+/g)];
            
            for (let k = 0; k < qualityMatches.length && k < linkMatches.length; k++) {
                const quality = qualityMatches[k][1];
                const link = linkMatches[k][0];
                
                if (link && quality && versionInfo) {
                    const title = `${arcTitle} ${versionInfo} ${quality}`.trim();
                    
                    if (!keyword || title.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase() === 'all') {
                        results.push({
                            title: title,
                            href: link,
                            image: `https://onepace.net${arcImage}`
                        });
                    }
                }
            }
        }
    }

    console.log(`Results: ${JSON.stringify(results)}`);
    return JSON.stringify(results);
}

async function extractDetails(url) {
    const match = url.match(/https:\/\/pixeldrain\.net\/l\/([^\/]+)/);
    if (!match) throw new Error("Invalid URL format");
            
    const arcId = match[1];

    const response = await soraFetch(`https://pixeldrain.net/api/list/${arcId}`);
    const data = await response.json();    

    const transformedResults = [{
        description: `Title: ${data.title}\nFile Count: ${data.file_count}`,
        aliases: `Title: ${data.title}\nFile Count: ${data.file_count}`,
        airdate: ''
    }];

    console.log(`Details: ${JSON.stringify(transformedResults)}`);
    return JSON.stringify(transformedResults);
}

async function extractEpisodes(url) {
    const match = url.match(/https:\/\/pixeldrain\.net\/l\/([^\/]+)/);
    if (!match) throw new Error("Invalid URL format");
            
    const arcId = match[1];

    const response = await soraFetch(`https://pixeldrain.net/api/list/${arcId}`);
    const data = await response.json();

    const transformedResults = data.files.map((result, index) => {
        return {
            href: `${result.id}`,
            number: index + 1,
        };
    });

    console.log(`Episodes: ${JSON.stringify(transformedResults)}`);
    return JSON.stringify(transformedResults);
}

// searchResults("wano");
// extractDetails("https://pixeldrain.net/l/sT25hhHR");
// extractEpisodes("https://pixeldrain.net/l/sT25hhHR");

async function extractStreamUrl(url) {
    return `https://pixeldrain.net/api/file/${url}`;
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