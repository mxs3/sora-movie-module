async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=71fdb081b0133511ac14ac0cc10fd307&query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        const transformedResults = data.results.map(result => {
            // For movies, TMDB returns "title" and media_type === "movie"
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://hexa.watch/watch/movie/${result.id}`
                };
            }
            // For TV shows, TMDB returns "name" and media_type === "tv"
            else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    // Using default season/episode numbers (1/1)
                    href: `https://hexa.watch/watch/tv/${result.id}/1/1`
                };
            } else {
                // Fallback if media_type is not defined
                return {
                    title: result.title || result.name || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://hexa.watch/watch/tv/${result.id}/1/1`
                };
            }
        });

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        if(url.includes('/watch/movie/')) {
            // Extract movie id from URL: e.g. https://hexa.watch/watch/movie/1241982
            const match = url.match(/https:\/\/hexa\.watch\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];
            const responseText = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=71fdb081b0133511ac14ac0cc10fd307&append_to_response=videos,credits`);
            const data = JSON.parse(responseText);
            const transformedResults = [{
                description: data.overview || 'No description available',
                // Movies use runtime (in minutes)
                aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
                airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
            }];
            return JSON.stringify(transformedResults);
        } else if(url.includes('/watch/tv/')) {
            // Extract show id from URL: e.g. https://hexa.watch/watch/tv/(ID)/1/1
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
        } else {
            throw new Error("Invalid URL format");
        }
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
        // This function is applicable only to TV shows.
        const regex = /https:\/\/hexa\.watch\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
        const match = url.match(regex);
        if (!match) throw new Error("Invalid URL format");
        const showId = match[1];
        const seasonNumber = match[2];
        
        // Fetch season details from TMDB.
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
        if(url.includes('/watch/movie/')) {
            // For movies, extract the movie id from the URL.
            const match = url.match(/https:\/\/hexa\.watch\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];
            // Assumed endpoint for movies – adjust if the actual endpoint differs.
            const responseText = await fetch(`https://fishstick.hexa.watch/api/hexa1/movie/${movieId}`);
            const data = JSON.parse(responseText);
            // Find the HLS stream in the stream array.
            const hlsSource = data.stream.find(source => source.type === 'hls');
            return hlsSource ? hlsSource.url : null;
        } else if(url.includes('/watch/tv/')) {
            // For TV shows, extract show id, season number, and episode number.
            const regex = /https:\/\/hexa\.watch\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
            const match = url.match(regex);
            if (!match) throw new Error("Invalid URL format");
            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];
            const responseText = await fetch(`https://fishstick.hexa.watch/api/hexa1/${showId}/${seasonNumber}/${episodeNumber}`);
            const data = JSON.parse(responseText);
            const hlsSource = data.stream.find(source => source.type === 'hls');
            return hlsSource ? hlsSource.url : null;
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}
