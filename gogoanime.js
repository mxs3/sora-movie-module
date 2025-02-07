async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://api.amvstr.me/api/v2/search?q=${encodedKeyword}&type=anime`);
        const data = await response.json();

        const transformedResults = data.data.map(anime => ({
            title: anime.title,
            image: anime.poster,
            href: `https://amvstr.me/anime/${anime.id}`
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const animeId = url.match(/amvstr\.me\/anime\/([^?]+)/)[1];
        const response = await fetch(`https://api.amvstr.me/api/v2/anime/${animeId}`);
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
        const animeId = url.match(/amvstr\.me\/anime\/([^?]+)/)[1];
        const response = await fetch(`https://api.amvstr.me/api/v2/episodes/${animeId}`);
        const data = await response.json();

        const transformedResults = data.data.episodes
            .filter(episode => episode.language === 'dub')
            .map(episode => ({
                href: `https://amvstr.me/watch/${episode.id}`,
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
        const episodeId = url.match(/amvstr\.me\/watch\/([^?]+)/)[1];
        const response = await fetch(`https://api.amvstr.me/api/v2/stream/${episodeId}`);
        const data = await response.json();

        const hlsSource = data.data.sources.find(source => source.type === 'hls');
        return hlsSource?.url || null;
    } catch (error) {
        console.log('Stream error:', error);
        return null;
    }
}