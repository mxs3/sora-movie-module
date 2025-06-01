async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetchv2(`https://anibunker.com/search?q=${encodedKeyword}`);
        const html = await response.text();

        const results = [];

        const articleRegex = /<article[^>]+title="([^"]+)"[^>]*>[\s\S]*?<a href="([^"]+)">[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<\/article>/g;

        let match;
        while ((match = articleRegex.exec(html)) !== null) {
            const title = match[1];
            const href = `https://anibunker.com/${match[2]}`;
            const image = match[3];

            results.push({
                title: title.trim(),
                href: href.trim(),
                image: image.trim()
            });
        }

        console.log(results);
        return JSON.stringify(results);
    } catch (error) {
        console.error('Fetch error in searchResults:', error);
        return [{ title: 'Error', image: '', href: '' }];
    }
}

async function extractDetails(url) {
    try {
        const responseText = await fetchv2(url);
        const html = await responseText.text();

        const details = [];

        const descriptionMatch = html.match(/<p class="small">([\s\S]*?)<\/p>/i);
        const description = descriptionMatch 
            ? descriptionMatch[1].replace(/<[^>]+>/g, '').trim()
            : 'N/A';

        const extractField = (label) => {
            const regex = new RegExp(`<strong>${label}:\\s*<\\/strong>([\\s\\S]*?)<\\/div>`, 'i');
            const match = html.match(regex);
            return match
                ? match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
                : 'N/A';
        };

        const producers = extractField("Produtores");
        const studios = extractField("Estúdios");
        const directors = extractField("Diretores");

        const alias = `Produtores: ${producers} | Estúdios: ${studios} | Diretores: ${directors}`;

        const airdateMatch = html.match(/<strong>Ano:\s*<\/strong>\s*(\d{4})/i);
        const airdate = airdateMatch ? airdateMatch[1].trim() : 'N/A';

        details.push({
            description,
            alias,
            airdate
        });

        console.log(details);
        return JSON.stringify(details);
    } catch (error) {
        console.log('Details error:', error);
        return [{
            description: 'Error loading description',
            alias: 'N/A',
            airdate: 'N/A'
        }];
    }
}

async function extractEpisodes(url) {
    try {
        const responseText = await fetchv2(url);
        const html = await responseText.text();

        const episodes = [];

        const episodeBlocks = html.match(/<a href="([^"]+)">\s*<div class="card">([\s\S]*?)<\/div>\s*<\/a>/g);

        if (episodeBlocks) {
            episodeBlocks.forEach(block => {
                const hrefMatch = block.match(/<a href="([^"]+)"/);
                const numberMatch = block.match(/<div class="ep_number">(\d+)<\/div>/);
                const titleMatch = block.match(/<div class="title full--text">([^<]+)<\/div>/);

                if (hrefMatch && numberMatch) {
                    episodes.push({
                        href: `https://anibunker.com${hrefMatch[1].trim()}`,
                        number: numberMatch[1].trim(),
                        title: titleMatch ? titleMatch[1].trim() : ''
                    });
                }
            });
        }

        episodes.reverse();

        console.log(episodes);
        return JSON.stringify(episodes);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return [];
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/anibunker\.com\/anime\/([^\/]+)/);
            
        if (!match) throw new Error("Invalid URL format");
        
        const movieId = match[1];

        const responseText = await fetchv2(`https://anibunker.com/anime/${movieId}`);
        const html = await responseText.text();

        const matchId = html.match(/data-video-id="(\d+)"/);
        const videoId = matchId[1];

        const playerId1 = "url_hd_1";
        const playerId2 = "url_hd_2";

        const postData = {
            player_id: playerId2,
            video_id: videoId
        };

        const headers = {
            'Origin': 'https://anibunker.com'
        };

        const loader = await fetchv2(`https://anibunker.com/php/loader.php`, headers, "POST", postData);
        const loaderJSON = await loader.json();

        console.log(loaderJSON);
        return JSON.stringify(loaderJSON.url);
    } catch (error) {
        console.error('extractStreamUrl error:', error);
        return null;
    }
}

// extractStreamUrl("https://anibunker.com/anime/hibi-wa-sugiredo-meshi-umashi-episodio-1-legendado");