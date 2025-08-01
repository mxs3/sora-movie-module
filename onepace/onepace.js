async function searchResults(keyword) {
    const results = [];
    const response = await soraFetch(`https://onepace.net/en/watch`);
    const html = await response.text();

    // First, extract all images in order
    const allImages = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/g)].map(m => m[1])
                      .concat([...html.matchAll(/background-image:\s*url\(['"]([^'"]+)['"]\)/g)].map(m => m[1]));
    
    const arcSections = html.split('<h2');
    
    results.push({
        title: "Use «all» or «everything» to get all content.",
        href: "",
        image: "https://raw.githubusercontent.com/xibrox/sora-movie-module/refs/heads/main/onepace/onepaceEngInstructions.jpg"
    });

    // Process each arc section starting from index 1 (skip the first split result)
    for (let i = 1; i < arcSections.length; i++) {
        const currentSection = arcSections[i];
        
        // Extract title from current section
        const titleMatch = currentSection.match(/>([^<]+)<\/a>/);
        if (!titleMatch) continue;
        let arcTitle = titleMatch[1].trim()
            .replace(/&#x27;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');
        
        // Get image for this arc - shifted by 1 to align correctly
        let arcImage = '';
        if (allImages[i]) {  // Using i instead of i-1 to shift image index forward
            arcImage = allImages[i].replace(/&amp;/g, '&');
            if (arcImage.startsWith('/_next')) {
                arcImage = 'https://onepace.net' + arcImage;
            }
        }
        
        // For the last arc, use the last image from the array
        if (i === arcSections.length - 1 && allImages[0]) {
            arcImage = allImages[0].replace(/&amp;/g, '&');
            if (arcImage.startsWith('/_next')) {
                arcImage = 'https://onepace.net' + arcImage;
            }
        }

        const episodeBlocks = currentSection.split('<span class="flex-1">');
        for (let j = 1; j < episodeBlocks.length; j++) {
            const block = episodeBlocks[j];
            
            let type = '';
            if (block.includes('English Subtitles')) {
                type = 'English Subtitles';
                if (block.includes('Extended')) {
                    type += ', Extended';
                }
                if (block.includes('Alternate')) {
                    type += ', Alternate';
                }
            } else if (block.includes('English Dub with Closed Captions')) {
                type = 'English Dub with Closed Captions';
                if (block.includes('Extended')) {
                    type += ', Extended';
                }
                if (block.includes('Alternate')) {
                    type += ', Alternate';
                }
            } else if (block.includes('English Dub')) {
                type = 'English Dub';
                if (block.includes('Extended')) {
                    type += ', Extended';
                }
                if (block.includes('Alternate')) {
                    type += ', Alternate';
                }
            } else {
                continue;
            }

            // Get quality-specific links
            let qualityLinks = new Map();
            const qualityMatches = [...block.matchAll(/>\s*(480p|720p|1080p)\s*</g)];
            const linkMatches = [...block.matchAll(/href="(https:\/\/pixeldrain\.net\/l\/[^"]+)"/g)];
            
            // Match links with qualities in order
            if (qualityMatches.length > 0 && linkMatches.length > 0) {
                // Make sure we have at most one link per quality
                const uniqueQualities = [...new Set(qualityMatches.map(m => m[1]))];
                uniqueQualities.forEach((quality, index) => {
                    if (index < linkMatches.length) {
                        qualityLinks.set(quality, linkMatches[index][1]);
                    }
                });
            }
            
            // Add entries for all found qualities
            for (const [quality, href] of qualityLinks) {
                const title = `${arcTitle}, ${type}, ${quality.trim()}`;
                if (!keyword || title.toLowerCase().includes(keyword.toLowerCase()) || 
                    keyword.toLowerCase() === 'all' || 
                    keyword.toLowerCase() === 'everything') {
                    results.push({
                        title: title,
                        href: href,
                        image: arcImage
                    });
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

// searchResults("all");
// extractDetails("https://pixeldrain.net/l/sT25hhHR");
// extractEpisodes("https://pixeldrain.net/l/sT25hhHR");

async function extractStreamUrl(url) {
    if (!_0xCheck()) return 'https://files.catbox.moe/avolvc.mp4';

    return `https://pixeldrain.net/api/file/${url}?download`;
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
