async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=71fdb081b0133511ac14ac0cc10fd307&query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        const transformedResults = data.results.map(movie => ({
            title: movie.name,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            href: `https://hexa.watch/watch/tv/${movie.id}/1/1`
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/anitaku\.bz\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        const encodedID = match[1];
        const responseText = await fetch(`https://api.amvstr.me/api/v1/info/${encodedID}`);
        const data = JSON.parse(responseText);
        
        const transformedResults = [{
            description: data.synopsis || 'No description available',
            aliases: `Duration: Unknown`,
            airdate: `Aired: ${data.released ? data.released : 'Unknown'}`
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
        const match = url.match(/https:\/\/anitaku\.bz\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        const encodedID = match[1];
        const responseText = await fetch(`https://api.amvstr.me/api/v1/episode/${encodedID}`);
        const data = JSON.parse(responseText);

        console.log(match);
        console.log(match[1]);

        const transformedResults = data.episodes.map(episode => {
            return {
                href: `https://anitaku.bz/${episode.id}`,
                number: episode.episode
            };
        });
        
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
       const match = url.match(/https:\/\/anitaku\.bz\/(.+)$/);
       if (!match) throw new Error("Invalid URL format");
       const encodedID = match[1];
       const responseText = await fetch(`https://api.amvstr.me/api/v1/episode/sources?animeEpisodeId=${encodedID}&category=dub`);
       const data = JSON.parse(responseText);
       
       // Look for the HLS source in the returned sources list.
       const hlsSource = data.data.sources.find(source => source.type === 'hls');
       return hlsSource ? hlsSource.url : null;
    } catch (error) {
       console.log('Fetch error in extractStreamUrl:', error);
       return null;
    }
}
