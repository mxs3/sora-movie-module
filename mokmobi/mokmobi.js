async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`https://api.themoviedb.org/3/search/multi?api_key=68e094699525b18a70bab2f86b1fa706&query=${encodedKeyword}`);
        const data = await responseText.json();

        const transformedResults = data.results.map(result => {
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name || result.original_title || result.original_name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://bingeflex.vercel.app/movie/${result.id}`
                };
            } else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title || result.original_name || result.original_title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://bingeflex.vercel.app/tv/${result.id}`
                };
            } else {
                return {
                    title: result.title || result.name || result.original_name || result.original_title || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://bingeflex.vercel.app/tv/${result.id}`
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
        if(url.includes('/movie/')) {
            const match = url.match(/https:\/\/bingeflex\.vercel\.app\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];
            const responseText = await fetchv2(`https://api.themoviedb.org/3/movie/${movieId}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
            const data = await responseText.json();

            const transformedResults = [{
                description: data.overview || 'No description available',
                aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
                airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
            }];

            return JSON.stringify(transformedResults);
        } else if(url.includes('/tv/')) {
            const match = url.match(/https:\/\/bingeflex\.vercel\.app\/tv\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const responseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
            const data = await responseText.json();

            const transformedResults = [{
                description: data.overview || 'No description available',
                aliases: `Duration: ${data.episode_run_time && data.episode_run_time.length ? data.episode_run_time.join(', ') + " minutes" : 'Unknown'}`,
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
        if(url.includes('/movie/')) {
            const match = url.match(/https:\/\/bingeflex\.vercel\.app\/movie\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const movieId = match[1];
            
            return JSON.stringify([
                { href: `https://bingeflex.vercel.app/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('/tv/')) {
            const match = url.match(/https:\/\/bingeflex\.vercel\.app\/tv\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const showId = match[1];
            
            const showResponseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
            const showData = await showResponseText.json();
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;

                if(seasonNumber === 0) continue;
                
                const seasonResponseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
                const seasonData = await seasonResponseText.json();
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map(episode => ({
                        href: `https://bingeflex.vercel.app/tv/${showId}?season=${seasonNumber}&episode=${episode.episode_number}`,
                        number: episode.episode_number,
                        title: episode.name || ""
                    }));
                    allEpisodes = allEpisodes.concat(episodes);
                }
            }
            
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
        if (url.includes('/movie/')) {
            const match = url.match(/https:\/\/bingeflex\.vercel\.app\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];

            const response = await fetchv2(`https://vidsrc.su/embed/movie/${movieId}`);
            const data = await response.text();

            const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;

            const serverMatches = [...data.matchAll(/^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm)];

            const subtitleMatches = [];
            let subtitleMatch;
            while ((subtitleMatch = subtitleRegex.exec(data)) !== null) {
                subtitleMatches.push({
                    url: subtitleMatch[1],
                    format: subtitleMatch[2],
                    display: subtitleMatch[3],
                    language: subtitleMatch[4]
                });
            }

            console.log("Subtitle Matches:", subtitleMatches);

            const serverUrls = serverMatches.map(match => match[2]);
            const subtitleUrls = subtitleMatches.map(item => item.url);

            console.log("Server URLs:", serverUrls);
            console.log("Subtitle URLs:", subtitleUrls);

            const firstServer = serverUrls.find(server => server.trim() !== "");

            const firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English'));

            const result = {
                stream: firstServer ? firstServer : "",
                subtitles: firstSubtitle ? firstSubtitle.url : ""
            };

            console.log("Result:", result);
            return JSON.stringify(result);
        } else if (url.includes('/tv/')) {
            const match = url.match(/https:\/\/bingeflex\.vercel\.app\/tv\/([^\/]+)\?season=([^\/]+)&episode=([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];

            const response = await fetchv2(`https://vidsrc.su/embed/tv/${showId}/${seasonNumber}/${episodeNumber}`);
            const data = await response.text();

            const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;

            const serverMatches = [...data.matchAll(/^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm)];

            const subtitleMatches = [];
            let subtitleMatch;
            while ((subtitleMatch = subtitleRegex.exec(data)) !== null) {
                subtitleMatches.push({
                    url: subtitleMatch[1],
                    format: subtitleMatch[2],
                    display: subtitleMatch[3],
                    language: subtitleMatch[4]
                });
            }

            console.log("Subtitle Matches:", subtitleMatches);

            const serverUrls = serverMatches.map(match => match[2]);
            const subtitleUrls = subtitleMatches.map(item => item.url);

            console.log("Server URLs:", serverUrls);
            console.log("Subtitle URLs:", subtitleUrls);

            const firstServer = serverUrls.find(server => server.trim() !== "");
            const firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English'));

            const result = {
                stream: firstServer ? firstServer : "",
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