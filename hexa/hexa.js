async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=71fdb081b0133511ac14ac0cc10fd307&query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        const transformedResults = data.results.map(movie => ({
            title: movie.title || movie.name,
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
        // Extract the show ID from the URL.
        const match = url.match(/https:\/\/hexa\.watch\/watch\/tv\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");
        const showId = match[1];

        const responseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=71fdb081b0133511ac14ac0cc10fd307&append_to_response=seasons`);
        const data = JSON.parse(responseText);
        
        const transformedResults = [{
            description: data.overview || 'No description available',
            aliases: `Duration: ${data.episode_run_time && data.episode_run_time.length ? data.episode_run_time.join(', ') : 'Unknown'}`,
            airdate: `Aired: ${data.first_air_date ? data.first_air_date : 'Unknown'}`
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
        // Extract show ID, season number, and episode number (if needed) from the URL.
        const regex = /https:\/\/hexa\.watch\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
        const match = url.match(regex);
        if (!match) throw new Error("Invalid URL format");
        const showId = match[1];
        const seasonNumber = match[2];
        
        // Fetch the season details from TMDB.
        const responseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=71fdb081b0133511ac14ac0cc10fd307`);
        const data = JSON.parse(responseText);

        const transformedResults = data.episodes.map(episode => ({
            href: `https://hexa.watch/watch/tv/${showId}/${episode.season_number}/${episode.episode_number}`,
            number: episode.episode_number
        }));
        
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        // Extract show ID, season number, and episode number from the URL.
        const regex = /https:\/\/hexa\.watch\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
        const match = url.match(regex);
        if (!match) throw new Error("Invalid URL format");
        const showId = match[1];
        const seasonNumber = match[2];
        const episodeNumber = match[3];

        // Build the endpoint dynamically using the extracted values.
        const responseText = await fetch(`https://fishstick.hexa.watch/api/hexa1/${showId}/${seasonNumber}/${episodeNumber}`);
        const data = JSON.parse(responseText);
       
        // Look for the HLS source in the returned sources list.
        const hlsSource = data.data.sources.find(source => source.type === 'hls');
        return hlsSource ? hlsSource.url : null;
    } catch (error) {
       console.log('Fetch error in extractStreamUrl:', error);
       return null;
    }
}
