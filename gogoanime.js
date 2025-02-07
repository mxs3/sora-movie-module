async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://api.amvstr.me/api/v2/search?q=${encodedKeyword}`);
        const data = await response.json();

        // Try to retrieve results from either "results" or "data.results"
        const results = data.results || (data.data && data.data.results);
        if (!results) throw new Error("No results field found in response");

        const transformedResults = results.map(anime => ({
            title: (anime.title && (anime.title.english || anime.title.romaji || anime.title.userPreferred)) || anime.title || "No Title",
            image: (anime.coverImage && (anime.coverImage.large || anime.coverImage.medium)) || anime.coverImage || "",
            href: `https://api.amvstr.me/api/v2/info/${anime.id}`
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        // Extract the anime ID from a URL like:
        // https://api.amvstr.me/api/v2/info/<animeId>
        const animeIdMatch = url.match(/amvstr\.me\/api\/v2\/info\/([^?]+)/);
        if (!animeIdMatch) throw new Error("Invalid URL format for details extraction");
        const animeId = animeIdMatch[1];

        const response = await fetch(`https://api.amvstr.me/api/v2/info/${animeId}`);
        const data = await response.json();

        return JSON.stringify([{
            description: (data.data && data.data.description) || 'No description available',
            aliases: `Duration: ${(data.data && data.data.duration) || 'Unknown'}`,
            airdate: `Aired: ${(data.data && data.data.aired) || 'Unknown'}`
        }]);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        // Extract the anime ID from the info URL:
        // https://api.amvstr.me/api/v2/info/<animeId>
        const animeIdMatch = url.match(/amvstr\.me\/api\/v2\/info\/([^?]+)/);
        if (!animeIdMatch) throw new Error("Invalid URL format for episodes extraction");
        const animeId = animeIdMatch[1];

        const response = await fetch(`https://api.amvstr.me/api/v2/episodes/${animeId}`);
        const data = await response.json();

        // Assuming the API returns an array in data.results
        const transformedResults = data.results.map(episode => ({
            href: episode.url.replace(/\/\/+/g, '/'),
            number: episode.number
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Episodes error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        // Extract the episode ID from a URL like:
        // https://api.amvstr.me/api/v2/stream/<episodeId>
        const episodeIdMatch = url.match(/amvstr\.me\/api\/v2\/stream\/([^?]+)/);
        if (!episodeIdMatch) throw new Error("Invalid URL format for stream extraction");
        const episodeId = episodeIdMatch[1];

        const response = await fetch(`https://api.amvstr.me/api/v2/stream/${episodeId}`);
        const data = await response.json();

        // Look for the HLS source among the returned sources
        const hlsSource = data.data.sources.find(source => source.type === 'hls');
        return hlsSource ? hlsSource.url : null;
    } catch (error) {
        console.log('Stream error:', error);
        return null;
    }
}
