async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://api.amvstr.me/api/v2/search?q=${encodedKeyword}`);
        const data = await response.json();

        // Transform the API response based on its structure
        const transformedResults = data.results.map(anime => ({
            title: anime.title.english || anime.title.romaji || anime.title.userPreferred,
            image: anime.coverImage.large || anime.coverImage.medium,
            // Use the info endpoint to maintain consistency
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
        // Extract the anime ID from the info URL.
        // Adjusted regex to match URLs like: https://api.amvstr.me/api/v2/info/<animeId>
        const animeId = url.match(/amvstr\.me\/api\/v2\/info\/([^?]+)/)[1];
        // Use the info endpoint for details
        const response = await fetch(`https://api.amvstr.me/api/v2/info/${animeId}`);
        const data = await response.json();

        return JSON.stringify([{
            description: data.data.description || 'No description available',
            aliases: `Duration: ${data.data.duration || 'Unknown'}`,
            airdate: `Aired: ${data.data.aired || 'Unknown'}`
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
        // Extract the anime ID from the info URL.
        const animeId = url.match(/amvstr\.me\/api\/v2\/info\/([^?]+)/)[1];
        const response = await fetch(`https://api.amvstr.me/api/v2/episodes/${animeId}`);
        const data = await response.json();

        const transformedResults = data.results.map(episode => ({
            // Fix any double slashes in the URL
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
        const episodeId = url.match(/amvstr\.me\/api\/v2\/stream\/([^?]+)/)[1];
        const response = await fetch(`https://api.amvstr.me/api/v2/stream/${episodeId}`);
        const data = await response.json();

        // Look for the HLS source among the returned sources
        const hlsSource = data.data.sources.find(source => source.type === 'hls');
        return hlsSource?.url || null;
    } catch (error) {
        console.log('Stream error:', error);
        return null;
    }
}
