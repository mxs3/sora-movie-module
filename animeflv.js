// Search for anime based on keyword
async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?search=${encodedKeyword}`);
        const data = await response.json();
        
        const transformedResults = data.animes.map(anime => ({
            title: anime.title,
            image: anime.img,
            href: `https://animeflv.ahmedrangel.com/anime/${anime.id}`
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

// Extract detailed information about the anime
async function extractDetails(id) {
    try {
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${id}`);
        const data = await response.json();
        
        const animeInfo = data;
        const transformedResults = [{
            description: animeInfo.description || 'No description available',
            aliases: animeInfo.aliases || 'No aliases available',
            airdate: animeInfo.airdate || 'Unknown airdate'
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

// Extract episode details based on anime ID
async function extractEpisodes(id) {
    try {
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${id}/episodes`);
        const data = await response.json();
        
        const transformedResults = data.episodes.map(episode => ({
            href: `https://animeflv.ahmedrangel.com/anime/${id}/episode/${episode.id}`,
            number: episode.episode_number
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Episodes error:', error);
        return JSON.stringify([]);
    }
}

// Extract stream URL for a given episode
async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/animeflv\.ahmedrangel\.com\/anime\/(.+)\/episode\/(.+)$/);
        const animeID = match[1];
        const episodeID = match[2];
        
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${animeID}/episode/${episodeID}/streams`);
        const data = await response.json();
        
        const streamUrl = data.streams.find(stream => stream.type === 'video/mp4');
        
        return streamUrl ? streamUrl.url : null;
    } catch (error) {
        console.log('Stream URL error:', error);
        return null;
    }
}
