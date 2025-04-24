async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`https://api.themoviedb.org/3/search/multi?api_key=9801b6b0548ad57581d111ea690c85c8&query=${encodedKeyword}&include_adult=false`);
        const data = await responseText.json();

        const transformedResults = data.results.map(result => {
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name || result.original_title || result.original_name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://net3lix.world/watch/movie/${result.id}`
                };
            } else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title || result.original_name || result.original_title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://net3lix.world/watch/tv/${result.id}/1/1`
                };
            } else {
                return {
                    title: result.title || result.name || result.original_name || result.original_title || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://net3lix.world/watch/tv/${result.id}/1/1`
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
            const match = url.match(/https:\/\/net3lix\.world\/watch\/movie\/([^\/]+)/);
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
            const match = url.match(/https:\/\/net3lix\.world\/watch\/tv\/([^\/]+)/);
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
            const match = url.match(/https:\/\/net3lix\.world\/watch\/movie\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const movieId = match[1];
            
            return JSON.stringify([
                { href: `https://net3lix.world/watch/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('/tv/')) {
            const match = url.match(/https:\/\/net3lix\.world\/watch\/tv\/([^\/]+)/);
            
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
                        href: `https://net3lix.world/watch/tv/${showId}/${seasonNumber}/${episode.episode_number}`,
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
            const match = url.match(/https:\/\/net3lix\.world\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];

            const subtitleTrackResponse = await fetchv2(`https://sub.wyzie.ru/search?id=${movieId}`);
            const subtitleTrackData = await subtitleTrackResponse.json();

            let subtitleTrack = subtitleTrackData.find(track =>
                track.display.includes('English') && (track.encoding === 'ASCII' || track.encoding === 'UTF-8' || track.encoding === 'CP850')
            );

            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP1252'));
            }
    
            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP850'));
            }

            const C = movieId
                .toString()
                .split("")
                .map((digit) => {
                    const encoding = "abcdefghij";
                    return encoding[parseInt(digit)];
                })
                .join("");
            const B = C.split("").reverse().join("");
            const A = btoa(B);
            const D = btoa(A);
            const urlovo = `https://api.vid3c.site/allmvse2e.php?id=${D}`;
            const response = await fetchv2(urlovo);
            const data = await response.json();

            console.log(JSON.stringify(data));

            const sourceKeys = ["source4", "source1", "source2", "source5"];
            const streams = [];

            for (let key of sourceKeys) {
                const currentSource = data[key];

                if (currentSource && currentSource.url && currentSource.language === "English") {
                    if (currentSource.url !== "https://vid3c.site/stream/file2/video.mp4") {
                        streams.push(currentSource.url);
                    }
                }
            }

            const result = {
                streams: streams,
                subtitles: subtitleTrack ? subtitleTrack.url : ""
            };

            console.log(JSON.stringify(result));
            return JSON.stringify(result);
        } else if (url.includes('/tv/')) {
            const match = url.match(/https:\/\/net3lix\.world\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];

            const subtitleTrackResponse = await fetchv2(`https://sub.wyzie.ru/search?id=${showId}&season=${seasonNumber}&episode=${episodeNumber}`);
            const subtitleTrackData = await subtitleTrackResponse.json();

            let subtitleTrack = subtitleTrackData.find(track =>
                track.display.includes('English') && (track.encoding === 'ASCII' || track.encoding === 'UTF-8' || track.encoding === 'CP850')
            );

            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP1252'));
            }
    
            if (!subtitleTrack) {
                subtitleTrack = subtitleTrackData.find(track => track.display.includes('English') && (track.encoding === 'CP850'));
            }

            const formattedString = `${showId}-${seasonNumber}-${episodeNumber}`;
            const reversedString = formattedString.split('').reverse().join('');
            const firstBase64 = btoa(reversedString);
            const secondBase64 = btoa(firstBase64);
            const url2 = `https://api.vid3c.site/alltvse2e.php?id=${secondBase64}`;
            const response = await fetchv2(url2);
            const data = await response.json();

            console.log("URL:" + JSON.stringify(url2));
            console.log(JSON.stringify(data));

            const sourceKeys = ["source4", "source1", "source2", "source5"];
            const streams = [];

            for (let key of sourceKeys) {
                const currentSource = data[key];

                if (currentSource && currentSource.url && currentSource.language === "English") {
                    if (currentSource.url !== "https://vid3c.site/stream/file2/video.mp4") {
                        streams.push(currentSource.url);
                    }
                }
            }

            const result = {
                streams: streams,
                subtitles: subtitleTrack ? subtitleTrack.url : ""
            };

            console.log(JSON.stringify(result));
            return JSON.stringify(result);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}

function btoa(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input);
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
        str.charAt(i | 0) || (map = '=', i % 1);
        output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))) {
        charCode = str.charCodeAt(i += 3 / 4);
        if (charCode > 0xFF) {
            throw new Error("btoa failed: The string contains characters outside of the Latin1 range.");
        }
        block = (block << 8) | charCode;
    }

    return output;
}