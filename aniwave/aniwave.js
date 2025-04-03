let keyword2 = "";

async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);

        keyword2 = keyword;

        const responseText = await fetchv2(`https://aniwave.se/filter?keyword=${encodedKeyword}`);
        const html = await responseText.text();

        const regex = /<div\s+class="item\s*">[\s\S]*?<a\s+href="([^"]+)">[\s\S]*?<img\s+src="([^"]+)"[^>]*>[\s\S]*?<a\s+class="name\s+d-title"[^>]*>([^<]+)<\/a>/g;

        const results = [];
        let match;

        while ((match = regex.exec(html)) !== null) {
        results.push({
            title: match[3].trim(),
            image: match[2].trim(),
            href: `https://aniwave.se${match[1].trim()}`
        });
        }

        console.log(results);
        return JSON.stringify(results);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const responseText = await fetchv2(url);
        const html = await responseText.text();

        const descriptionMatch = html.match(/<div class="synopsis mb-3">[\s\S]*?<div class="content">(.*?)<\/div>/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description available';

        const aliasesMatch = html.match(/<div class="names font-italic mb-2">(.*?)<\/div>/);
        const aliases = aliasesMatch ? aliasesMatch[1].trim() : 'No aliases available';

        const airdateMatch = html.match(/Date aired:\s*<span><span[^>]*>(.*?)<\/span>/);
        const airdate = airdateMatch ? `Aired: ${airdateMatch[1].trim()}` : 'Aired: Unknown';

        const transformedResults = [{
            description,
            aliases,
            airdate
        }];

        console.log(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired/Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const responseText = await fetchv2(url);
        const html = await responseText.text();

        const episodesMatch = html.match(/Episodes:\s*<span>(\d+)<\/span>/);
        const episodesCount = episodesMatch ? parseInt(episodesMatch[1], 10) : 0;

        const transformedResults = [];

        if (episodesCount > 0) {
            for (let i = 1; i <= episodesCount; i++) {
                transformedResults.push({
                    href: `${url}/ep-${i}`,
                    number: i
                });
            }
        } else {
            const response = await fetchv2(`https://aniwave.se/filter?keyword=${keyword2}`);
            const data = await response.text();

            const episodesMatch2 = data.match(/<span>Ep:\s*(\d+)<\/span>/);
            const episodesCount2 = episodesMatch2 ? parseInt(episodesMatch2[1], 10) : 0;

            for (let i = 1; i <= episodesCount2; i++) {
                transformedResults.push({
                    href: `${url}/ep-${i}`,
                    number: i
                });
            }
        }

        console.log(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/aniwave\.se\/anime-watch\/([^\/]+)\/ep-([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const animeSlug = match[1];
        const episodeNumber = match[2];

        const hlsSource = `https://hlsx3cdn.echovideo.to/${animeSlug}/${episodeNumber}/master.m3u8`;
        
        console.log(`HLS Source: ${hlsSource}`);
        return hlsSource;
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}