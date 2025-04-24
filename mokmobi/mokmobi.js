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
                    href: `https://rivestream.org/watch?type=movie&id=${result.id}`
                };
            } else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title || result.original_name || result.original_title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://rivestream.org/watch?type=tv&id=${result.id}&season=1&episode=1`
                };
            } else {
                return {
                    title: result.title || result.name || result.original_name || result.original_title || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://rivestream.org/watch?type=tv&id=${result.id}&season=1&episode=1`
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
        if(url.includes('movie')) {
            const match = url.match(/https:\/\/rivestream\.org\/watch\?type=movie&id=([^\/]+)/);
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
        } else if(url.includes('tv')) {
            const match = url.match(/https:\/\/rivestream\.org\/watch\?type=tv&id=([^\/]+)&season=([^\/]+)&episode=([^\/]+)/);
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
        if(url.includes('movie')) {
            const match = url.match(/https:\/\/rivestream\.org\/watch\?type=movie&id=([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const movieId = match[1];
            
            return JSON.stringify([
                { href: `https://rivestream.org/watch?type=movie&id=${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('tv')) {
            const match = url.match(/https:\/\/rivestream\.org\/watch\?type=tv&id=([^\/]+)&season=([^\/]+)&episode=([^\/]+)/);
            
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
                        href: `https://rivestream.org/watch?type=tv&id=${showId}&season=${seasonNumber}&episode=${episode.episode_number}`,
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
        if (url.includes('movie')) {
            const match = url.match(/https:\/\/rivestream\.org\/watch\?type=movie&id=([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];

            const responseText = await fetchv2(`https://www.mokmobi.ovh/api/stream/movie/${movieId}?server=VIDSRCSU&Autonext=1&Autoplay=1`);
            const dataText = await responseText.json();

            const response = await fetchv2(dataText.stream_url);
            const data = await response.text();

            const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"encoding"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;

            const serverMatches = [...data.matchAll(/^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm)];

            const subtitleMatches = [];
            let subtitleMatch;
            while ((subtitleMatch = subtitleRegex.exec(data)) !== null) {
                subtitleMatches.push({
                    url: subtitleMatch[1],
                    format: subtitleMatch[2],
                    encoding: subtitleMatch[3],
                    display: subtitleMatch[4],
                    language: subtitleMatch[5]
                });
            }

            console.log("Subtitle Matches:", subtitleMatches);

            const serverUrls = serverMatches.map(match => match[2]);
            const subtitleUrls = subtitleMatches.map(item => item.url);

            console.log("Server URLs:", serverUrls);
            console.log("Subtitle URLs:", subtitleUrls);

            // const firstServer = serverUrls.find(server => server.trim() !== "");

            let firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'ASCII' || subtitle.encoding === 'UTF-8'));

            if (!firstSubtitle) {
                firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP1252'));
            }

            if (!firstSubtitle) {
                firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP850'));
            }

            const streams = serverUrls.map(server => server.trim()).filter(server => server !== "");

            const result = {
                streams,
                subtitles: firstSubtitle ? firstSubtitle.url : ""
            };

            console.log("Result:", result);
            return JSON.stringify(result);
        } else if (url.includes('tv')) {
            const match = url.match(/https:\/\/rivestream\.org\/watch\?type=tv&id=([^\/]+)&season=([^\/]+)&episode=([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];

            const responseText = await fetchv2(`https://www.mokmobi.ovh/api/stream/tv/${showId}?server=VIDSRCSU&season=${seasonNumber}&episode=${episodeNumber}&Autonext=1&Autoplay=1`);
            const dataText = await responseText.json();

            const response = await fetchv2(dataText.stream_url);
            const data = await response.text();

            const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"encoding"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;

            const serverMatches = [...data.matchAll(/^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm)];

            const subtitleMatches = [];
            let subtitleMatch;
            while ((subtitleMatch = subtitleRegex.exec(data)) !== null) {
                subtitleMatches.push({
                    url: subtitleMatch[1],
                    format: subtitleMatch[2],
                    encoding: subtitleMatch[3],
                    display: subtitleMatch[4],
                    language: subtitleMatch[5]
                });
            }

            console.log("Subtitle Matches:", subtitleMatches);

            const serverUrls = serverMatches.map(match => match[2]);
            const subtitleUrls = subtitleMatches.map(item => item.url);

            console.log("Server URLs:", serverUrls);
            console.log("Subtitle URLs:", subtitleUrls);

            // const firstServer = serverUrls.find(server => server.trim() !== "");
            let firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'ASCII' || subtitle.encoding === 'UTF-8'));

            if (!firstSubtitle) {
                firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP1252'));
            }

            if (!firstSubtitle) {
                firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP850'));
            }
            
            const streams = serverUrls.map(server => server.trim()).filter(server => server !== "");

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