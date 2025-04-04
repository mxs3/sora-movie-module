async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`https://api.themoviedb.org/3/search/multi?api_key=653bb8af90162bd98fc7ee32bcbbfb3d&query=${encodedKeyword}`);
        const data = await responseText.json();

        // Filter results to include only movies
        const transformedResults = data.results
            .filter(result => result.media_type === "movie") // Ensure only movies
            .map(result => ({
                title: result.title || result.name,
                image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                href: `https://ableflix.cc/movie/${result.id}`
            }));


        // const transformedResults = data.results.map(result => {
        //     // For movies, TMDB returns "title" and media_type === "movie"
        //     if(result.media_type === "movie" || result.title) {
        //         return {
        //             title: result.title || result.name,
        //             image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
        //             href: `https://ableflix.xyz/watch/movie/${result.id}`
        //         };
        //     } else if(result.media_type === "tv" || result.name) {
        //         // For TV shows, TMDB returns "name" and media_type === "tv"
        //         return {
        //             title: result.name || result.title,
        //             image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
        //             href: `https://ableflix.xyz/watch/${result.id}`
        //         };
        //     } else {
        //         // Fallback if media_type is not defined
        //         return {
        //             title: result.title || result.name || "Untitled",
        //             image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
        //             href: `https://ableflix.xyz/watch/${result.id}`
        //         };
        //     }
        // });

        console.log('Search results:', transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        if(url.includes('/movie/')) {
            const match = url.match(/https:\/\/ableflix\.cc\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];
            const responseText = await fetchv2(`https://api.themoviedb.org/3/movie/${movieId}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
            const data = await responseText.json();

            const transformedResults = [{
                description: data.overview || 'No description available',
                aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
                airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
            }];

            console.log('Details:', transformedResults);
            return JSON.stringify(transformedResults);
        } 
        // else if(url.includes('/watch/')) {
        //     const match = url.match(/https:\/\/ableflix\.xyz\/watch\/([^\/]+)/);
        //     if (!match) throw new Error("Invalid URL format");

        //     const showId = match[1];
        //     const responseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
        //     const data = JSON.parse(responseText);

        //     const transformedResults = [{
        //         description: data.overview || 'No description available',
        //         aliases: `Duration: ${data.episode_run_time && data.episode_run_time.length ? data.episode_run_time.join(', ') + " minutes" : 'Unknown'}`,
        //         airdate: `Aired: ${data.first_air_date ? data.first_air_date : 'Unknown'}`
        //     }];

        //     return JSON.stringify(transformedResults);
        // } 
        else {
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
        if(url.includes('/movie/')) {
            const match = url.match(/https:\/\/ableflix\.cc\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];

            const result = JSON.stringify([
                { href: `https://ableflix.cc/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);

            console.log('Episodes:', result);
            return result;
        } 
        // else if(url.includes('/watch/')) {
        //     const match = url.match(/https:\/\/ableflix\.xyz\/watch\/([^\/]+)/);
        //     if (!match) throw new Error("Invalid URL format");
        //     const showId = match[1];
            
        //     const showResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
        //     const showData = JSON.parse(showResponseText);
            
        //     let allEpisodes = [];
        //     for (const season of showData.seasons) {
        //         const seasonNumber = season.season_number;

        //         if(seasonNumber === 0) continue;
                
        //         const seasonResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
        //         const seasonData = JSON.parse(seasonResponseText);
                
        //         if (seasonData.episodes && seasonData.episodes.length) {
        //             const episodes = seasonData.episodes.map(episode => ({
        //                 href: `https://ableflix.xyz/watch/${showId}`,
        //                 number: episode.episode_number,
        //                 title: episode.name || ""
        //             }));
        //             allEpisodes = allEpisodes.concat(episodes);
        //         }
        //     }
            
        //     return JSON.stringify(allEpisodes);
        // } 
        else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    const endpoints = [
        "https://moviekex.online/embed/api/fastfetch/",
    ];

    const servers = [
        "?sr=0",
        "?sr=1",
        "?sr=2",
        "?sr=3",
    ];

    try {
        if (url.includes('/movie/')) {
            const match = url.match(/https:\/\/ableflix\.cc\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];

            for (let j = 0; j < servers.length; j++) {
                try {
                    let apiUrl = `https://moviekex.online/embed/api/fastfetch/${movieId}${servers[j]}`;

                    const responseText = await fetch(apiUrl);
                    const data = await responseText.json();

                    const subtitles = data.tracks?.find(track => track.lang === 'English');

                    const preferredQualities = ['1080', '720', '480', '360'];
                    let mp4Source;

                    for (const quality of preferredQualities) {
                        mp4Source = data?.url?.find(source => source.type === 'MP4' && source.lang === 'English' && source.resulation === quality);
                        if (mp4Source) {
                            console.log(`Found MP4 source with quality ${quality}:`, mp4Source);
                            break;
                        };
                    }

                    if (!mp4Source) {
                        mp4Source = data?.url?.find(source => source.format === 'MP4' && source.lang === 'English');
                    }

                    if (mp4Source && mp4Source.link) {
                        const result = {
                            stream: mp4Source.link || "",
                            subtitles: subtitles ? subtitles.url : ""
                        };
                        
                        console.log(result);
                        return JSON.stringify(result);
                    }

                    // Fallback to HLS if no MP4 source is found
                    const hlsSource = data.url?.find(source => source.type === 'hls');

                    if (hlsSource && hlsSource.link) {
                        const result = {
                            stream: hlsSource.link || "",
                            subtitles: subtitles ? subtitles.url : ""
                        };
                        
                        console.log(result);
                        return JSON.stringify(result);
                    }
                } catch (err) {
                    console.log(`Fetch error on endpoint ${endpoints[i]} for movie ${movieId}:`, err);
                }
            }
        } 
        // else if (url.includes('/watch/')) {
        //     const match = url.match(/https:\/\/ableflix\.xyz\/watch\/([^\/]+)/);
        //     if (!match) throw new Error("Invalid URL format");

        //     const showId = match[1];

        //     for (let i = 0; i < servers.length; i++) {
        //         try {
        //             const responseText = await fetch(`https://moviekex.online/embed/api/fastfetch/${showId}/${seasonNumber}/${episodeNumber}${servers[i]}`);
        //             const data = JSON.parse(responseText);

        //             if (data) {
        //                 const hlsSource = data.url.find(source => source.type === 'hls');
                        
        //                 if (hlsSource && hlsSource.link) return hlsSource.link;
        //             }
        //         } catch (err) {
        //             console.log(`Fetch error on endpoint https://moviekex.online/embed/api/fastfetch/ for TV show ${showId} S${seasonNumber}E${episodeNumber}:`, err);
        //         }
        //     }
        //     return null;
        // } 
        else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}