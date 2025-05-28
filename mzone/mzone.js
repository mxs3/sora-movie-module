async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`https://api.themoviedb.org/3/search/multi?api_key=8d6d91941230817f7807d643736e8a49&query=${encodedKeyword}`);
        const data = await responseText.json();

        const transformedResults = data.results.map(result => {
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name || result.original_title || result.original_name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://m-zone.org/details/movie/${result.id}`
                };
            } else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title || result.original_name || result.original_title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://m-zone.org/details/tv/${result.id}`
                };
            } else {
                return {
                    title: result.title || result.name || result.original_name || result.original_title || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://m-zone.org/details/tv/${result.id}`
                };
            }
        });

        console.log(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        if(url.includes('movie')) {
            const match = url.match(/https:\/\/m-zone\.org\/details\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];
            const responseText = await fetchv2(`https://api.themoviedb.org/3/movie/${movieId}?api_key=8d6d91941230817f7807d643736e8a49`);
            const data = await responseText.json();

            const transformedResults = [{
                description: data.overview || 'No description available',
                aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
                airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
            }];

            console.log(transformedResults);
            return JSON.stringify(transformedResults);
        } else if(url.includes('tv')) {
            const match = url.match(/https:\/\/m-zone\.org\/details\/tv\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const responseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}?api_key=8d6d91941230817f7807d643736e8a49`);
            const data = await responseText.json();

            const transformedResults = [{
                description: data.overview || 'No description available',
                aliases: `Duration: ${data.episode_run_time && data.episode_run_time.length ? data.episode_run_time.join(', ') + " minutes" : 'Unknown'}`,
                airdate: `Aired: ${data.first_air_date ? data.first_air_date : 'Unknown'}`
            }];

            console.log(transformedResults);
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
        if(url.includes('movie')) {
            const match = url.match(/https:\/\/m-zone\.org\/details\/movie\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const movieId = match[1];
            
            const movie = [
                { href: `https://m-zone.org/watch/movie/${movieId}`, number: 1, title: "Full Movie" }
            ];

            console.log(movie);
            return JSON.stringify(movie);
        } else if(url.includes('tv')) {
            const match = url.match(/https:\/\/m-zone\.org\/details\/tv\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const showId = match[1];
            
            const showResponseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}?api_key=8d6d91941230817f7807d643736e8a49`);
            const showData = await showResponseText.json();
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;

                if(seasonNumber === 0) continue;
                
                const seasonResponseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=8d6d91941230817f7807d643736e8a49`);
                const seasonData = await seasonResponseText.json();
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map(episode => ({
                        href: `https://m-zone.org/watch/tv/${showId}?season=${seasonNumber}&episode=${episode.episode_number}`,
                        number: episode.episode_number,
                        title: episode.name || ""
                    }));
                    allEpisodes = allEpisodes.concat(episodes);
                }
            }
            
            console.log(allEpisodes);
            return JSON.stringify(allEpisodes);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        if (url.includes('movie')) {
            const match = url.match(/https:\/\/m-zone\.org\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];

            let streams = [];

            const embedUrl = `https://vidsrc.su/embed/movie/${movieId}`
            const data1 = await fetchv2(embedUrl).then(res => res.text());

            const urlRegex = /^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm;
            const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;
            
            const streams2 = Array.from(data1.matchAll(urlRegex), m => m[2].trim()).filter(Boolean);

            for (let i = 0; i < streams2.length; i++) {
                const currentStream = streams2[i];

                if (currentStream) {
                    streams.push(currentStream);
                }
            }

            let subtitle = '';

            const subtitleTrackResponse = await fetchv2(`https://sub.wyzie.ru/search?id=${movieId}`);
            const subtitleTrackData = await subtitleTrackResponse.json();

            let subtitleTrack = subtitleTrackData.find(track =>
                track.display.includes('English') && (track.encoding === 'ASCII' || track.encoding === 'UTF-8')
            );

            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP1252'));
            }

            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP1250'));
            }
    
            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP850'));
            }

            subtitle = subtitleTrack ? subtitleTrack.url : '';

            const result = {
                streams,
                subtitles: subtitle
            };

            console.log("Result:", result);
            return JSON.stringify(result);
        } else if (url.includes('tv')) {
            const match = url.match(/https:\/\/m-zone\.org\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];

            let streams = [];
                
            const embedUrl = `https://vidsrc.su/embed/tv/${showId}/${seasonNumber}/${episodeNumber}`
            const data1 = await fetchv2(embedUrl).then(res => res.text());
            
            const urlRegex = /^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm;
            const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;
            
            const streams2 = Array.from(data1.matchAll(urlRegex), m => m[2].trim()).filter(Boolean);
            
            for (let i = 0; i < streams2.length; i++) {
                const currentStream = streams2[i];

                if (currentStream) {
                    streams.push(currentStream);
                }
            }
            
            let subtitle = '';

            const subtitleTrackResponse = await fetchv2(`https://sub.wyzie.ru/search?id=${showId}&season=${seasonNumber}&episode=${episodeNumber}`);
            const subtitleTrackData = await subtitleTrackResponse.json();

            let subtitleTrack = subtitleTrackData.find(track =>
                track.display.includes('English') && (track.encoding === 'ASCII' || track.encoding === 'UTF-8')
            );

            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP1252'));
            }

            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP1250'));
            }
    
            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP850'));
            }

            subtitle = subtitleTrack ? subtitleTrack.url : '';

            const result = {
                streams,
                subtitles: firstSubtitle ? firstSubtitle.url : ""
            };
        
            console.log("Result:", result);
            return JSON.stringify(result);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}

extractStreamUrl("https://rivestream.org/watch?type=movie&id=238")