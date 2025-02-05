async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.animeflv.net/search?q=${encodedKeyword}`);
        const data = await responseText.json();

        const transformedResults = data.results.map(anime => ({
            title: anime.title,
            image: anime.image,
            href: `https://animeflv.net/anime/${anime.id}`
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/animeflv\.net\/anime\/(.+)$/);
        const animeID = match[1];
        const response = await fetch(`https://api.animeflv.net/anime/${animeID}`);
        const data = await response.json();

        const animeInfo = data.anime;
        
        const transformedResults = [{
            description: animeInfo.description || 'No description available',
            aliases: `Duration: ${animeInfo.duration || 'Unknown'}`,
            airdate: `Aired: ${animeInfo.airdate || 'Unknown'}`
        }];
        
        return JSON.stringify(transformedResults);
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
        const match = url.match(/https:\/\/animeflv\.net\/anime\/(.+)$/);
        const animeID = match[1];
        const response = await fetch(`https://api.animeflv.net/anime/${animeID}/episodes`);
        const data = await response.json();

        const transformedResults = data.episodes.map(episode => ({
            href: `https://animeflv.net/anime/${animeID}?ep=${episode.id}`,
            number: episode.number
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/animeflv\.net\/anime\/(.+)$/);
        const animeID = match[1];
        const episodeID = new URL(url).searchParams.get('ep');
        
        const response = await fetch(`https://api.animeflv.net/episode/${episodeID}`);
        const data = await response.json();
        
        const streamUrl = data.sources.find(source => source.type === 'video').url;
        
        return streamUrl ? streamUrl : null;
    } catch (error) {
        console.log('Fetch error:', error);
        return null;
    }
}
