async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.result) && data.result.length > 0) {
            const transformedResults = data.result.map(anime => ({
                title: anime.title,
                image: anime.image,
                href: `https://animeflv.net/anime/${anime.slug}`
            }));
            return JSON.stringify(transformedResults);
        } else {
            return JSON.stringify([{ title: 'No results found', image: '', href: '' }]);
        }
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error occurred', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/animeflv\.net\/anime\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        
        const slug = match[1];
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`);
        const data = await response.json();

        if (data.success && data.anime) {
            const animeInfo = data.anime;

            return JSON.stringify([{
                description: animeInfo.description || 'No description available',
                aliases: `Duration: ${animeInfo.duration || 'Unknown'}`,
                airdate: `Aired: ${animeInfo.airdate || 'Unknown'}`
            }]);
        } else {
            return JSON.stringify([{ description: 'No details found', aliases: 'Unknown', airdate: 'Unknown' }]);
        }
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{ description: 'Error loading details', aliases: 'Unknown', airdate: 'Unknown' }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/animeflv\.net\/anime\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");

        const slug = match[1];
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episodes`);
        const data = await response.json();

        if (data.success && Array.isArray(data.episodes) && data.episodes.length > 0) {
            const transformedResults = data.episodes.map(episode => ({
                href: `https://animeflv.net/anime/${slug}/episode/${episode.number}`,
                number: episode.number
            }));

            return JSON.stringify(transformedResults);
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('Episodes error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/animeflv\.net\/anime\/(.+)\/episode\/(\d+)$/);
        if (!match) throw new Error("Invalid URL format");

        const slug = match[1];
        const episodeNumber = match[2];
        
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episode/${episodeNumber}`);
        const data = await response.json();

        if (data.success && data.sources) {
            const streamUrl = data.sources.find(source => source.type === 'video')?.url;
            return streamUrl || null;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Stream URL error:', error);
        return null;
    }
}

export { searchResults, extractDetails, extractEpisodes, extractStreamUrl };
