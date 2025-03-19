async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=adc48d20c0956934fb224de5c40bb85d&query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        const transformedResults = data.results.map(result => {
            // For movies, TMDB returns "title" and media_type === "movie"
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://flickystream.com/watch/movie/${result.id}`
                };
            }
            // For TV shows, TMDB returns "name" and media_type === "tv"
            else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    // Using default season/episode numbers (1/1)
                    href: `https://flickystream.com/watch/tv/${result.id}?s=1&ep=1`
                };
            } else {
                // Fallback if media_type is not defined
                return {
                    title: result.title || result.name || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://flickystream.com/watch/tv/${result.id}?s=1&ep=1`
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
            const match = url.match(/https:\/\/flickystream\.com\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];
            const responseText = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=adc48d20c0956934fb224de5c40bb85d&append_to_response=videos,credits`);
            const data = JSON.parse(responseText);

            const transformedResults = [{
                description: data.overview || 'No description available',
                // Movies use runtime (in minutes)
                aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
                airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
            }];

            return JSON.stringify(transformedResults);
        } else if(url.includes('/watch/tv/')) {
            const match = url.match(/https:\/\/flickystream\.com\/watch\/tv\/([^\/]+)\?s=([^&]+)&ep=([^&]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const responseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=adc48d20c0956934fb224de5c40bb85d&append_to_response=seasons`);
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
        if(url.includes('/watch/movie/')) {
            const match = url.match(/https:\/\/flickystream\.com\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];
            return JSON.stringify([
                { href: `https://flickystream.com/watch/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('/watch/tv/')) {
            const match = url.match(/https:\/\/flickystream\.com\/watch\/tv\/([^\/]+)\?s=([^&]+)&ep=([^&]+)/);
            if (!match) throw new Error("Invalid URL format");
            const showId = match[1];
            
            const showResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=adc48d20c0956934fb224de5c40bb85d`);
            const showData = JSON.parse(showResponseText);
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;

                if(seasonNumber === 0) continue;
                
                const seasonResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=adc48d20c0956934fb224de5c40bb85d`);
                const seasonData = JSON.parse(seasonResponseText);
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map(episode => ({
                        href: `https://flickystream.com/watch/tv/${showId}?s=${seasonNumber}&ep=${episode.episode_number}`,
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
        if (url.includes('/watch/movie/')) {
            const match = url.match(/https:\/\/flickystream\.com\/watch\/movie\/([^\/]+)/);

            if (!match) throw new Error("Invalid URL format");
            
            const movieId = match[1];

            const apiUrl = `https://vidjoy.pro/embed/api/fastfetch/${movieId}?sr=0`;

            const response = await fetch(apiUrl, { headers: { 'Referer': `https://vidjoy.pro/embed/movie/${movieId}?adFree=true` } });
            const data = await response.json();

            const hlsSource = data.url?.find(source => source.type === 'hls');
            
            if (!hlsSource) throw new Error("HLS source not found");
            
            // Fetch the HLS playlist text.
            const hlsResponse = await fetch(hlsSource.link);
            const hlsSourceText = await hlsResponse.text();
            
            console.log("HLS Playlist Text:\n" + hlsSourceText);
            
            let finalStreamUrl = "";
            
            // Check if it's a master playlist (contains multiple stream options).
            if (hlsSourceText.includes("#EXT-X-STREAM-INF:")) {
                // This regex matches the resolution from the EXT-X-STREAM-INF line and then captures the URL in the next line.
                const streamRegex = /^#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x\d+).*$(?:\r?\n)(.*)/gm;
                
                let highestStreamUrl = null;
                let highestPixels = 0;
                let regexMatch;
                
                while ((regexMatch = streamRegex.exec(hlsSourceText)) !== null) {
                    const resolutionStr = regexMatch[1];
                    const urlLine = regexMatch[2].trim();

                    const [width, height] = resolutionStr.split('x').map(Number);
                    const pixels = width * height;

                    if (pixels > highestPixels) {
                        highestPixels = pixels;
                        highestStreamUrl = urlLine;
                    }
                }
                
                if (highestStreamUrl) {
                    finalStreamUrl = "https://vidjoy.pro" + highestStreamUrl;
                } else {
                    console.log("No stream found in master playlist.");
                    return null;
                }
            } else {
                // Media playlist (with TS segments) – use the original HLS source link.
                finalStreamUrl = hlsSource.link;
            }
            
            const subtitleTrackResponse = await fetch(`https://sub.wyzie.ru/search?id=${movieId}`);
            const subtitleTrackData = await subtitleTrackResponse.json();

            const subtitleTrack = subtitleTrackData.find(track =>
                track.display.startsWith('English')
            );

            const result = {
                stream: finalStreamUrl,
                subtitles: subtitleTrack ? subtitleTrack.url : ""
            };
            
            console.log("Final result:", result);
            return JSON.stringify(result);
        } else if (url.includes('/watch/tv/')) {
            const match = url.match(/https:\/\/flickystream\.com\/watch\/tv\/([^\/]+)\?s=([^&]+)&ep=([^&]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];

            const response = await fetch(apiUrl, { headers: { 'Referer': `https://vidjoy.pro/embed/movie/${showId}?adFree=true` } });
            const data = await response.json();

            const hlsSource = data.url?.find(source => source.type === 'hls');
            
            if (!hlsSource) throw new Error("HLS source not found");
            
            // Fetch the HLS playlist text.
            const hlsResponse = await fetch(hlsSource.link);
            const hlsSourceText = await hlsResponse.text();
            
            console.log("HLS Playlist Text:\n", hlsSourceText);
            
            let finalStreamUrl = "";
            
            // Check if it's a master playlist (contains multiple stream options).
            if (hlsSourceText.includes("#EXT-X-STREAM-INF:")) {
                // This regex matches the resolution from the EXT-X-STREAM-INF line and then captures the URL in the next line.
                const streamRegex = /^#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x\d+).*$(?:\r?\n)(.*)/gm;
                
                let highestStreamUrl = null;
                let highestPixels = 0;
                let regexMatch;
                
                while ((regexMatch = streamRegex.exec(hlsSourceText)) !== null) {
                    const resolutionStr = regexMatch[1];
                    const urlLine = regexMatch[2].trim();

                    const [width, height] = resolutionStr.split('x').map(Number);
                    const pixels = width * height;

                    if (pixels > highestPixels) {
                        highestPixels = pixels;
                        highestStreamUrl = urlLine;
                    }
                }
                
                if (highestStreamUrl) {
                    finalStreamUrl = "https://vidjoy.pro" + highestStreamUrl;
                } else {
                    console.log("No stream found in master playlist.");
                    return null;
                }
            } else {
                // Media playlist (with TS segments) – use the original HLS source link.
                finalStreamUrl = hlsSource.link;
            }
            
            const subtitleTrackResponse = await fetch(`https://sub.wyzie.ru/search?id=${movieId}`);
            const subtitleTrackData = await subtitleTrackResponse.json();

            const subtitleTrack = subtitleTrackData.find(track =>
                track.display.startsWith('English')
            );

            const result = {
                stream: finalStreamUrl,
                subtitles: subtitleTrack ? subtitleTrack.url : ""
            };
            
            console.log("Final result:", result);
            return JSON.stringify(result);
        } else {
            throw new Error("Invalid URL format");
        }

        // const response = await fetch(apiUrl, { headers: { 'Referer': "https://www.vidsrc.wtf/" } });
        // const data = JSON.parse(response);
        
        // const hlsSource = data.url?.find(source => source.type === 'hls');
        // const subtitleTrack = data.tracks?.find(track =>
        //     track.lang.startsWith('English')
        // );
        
        // if (!hlsSource) throw new Error("HLS source not found");
        
        // // Fetch the HLS playlist text.
        // const hlsResponse = await fetch(hlsSource.link);
        // const hlsSourceText = await hlsResponse;
        
        // console.log("HLS Playlist Text:\n", hlsSourceText);
        
        // let finalStreamUrl = "";
        
        // // Check if it's a master playlist (contains multiple stream options).
        // if (hlsSourceText.includes("#EXT-X-STREAM-INF:")) {
        //     // This regex matches the resolution from the EXT-X-STREAM-INF line and then captures the URL in the next line.
        //     const streamRegex = /^#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x\d+).*$(?:\r?\n)(.*)/gm;
            
        //     let highestStreamUrl = null;
        //     let highestPixels = 0;
        //     let regexMatch;
            
        //     while ((regexMatch = streamRegex.exec(hlsSourceText)) !== null) {
        //         const resolutionStr = regexMatch[1];
        //         const urlLine = regexMatch[2].trim();

        //         const [width, height] = resolutionStr.split('x').map(Number);
        //         const pixels = width * height;

        //         if (pixels > highestPixels) {
        //             highestPixels = pixels;
        //             highestStreamUrl = urlLine;
        //         }
        //     }
            
        //     if (highestStreamUrl) {
        //         finalStreamUrl = "https://vidjoy.pro" + highestStreamUrl;
        //     } else {
        //         console.log("No stream found in master playlist.");
        //         return null;
        //     }
        // } else {
        //     // Media playlist (with TS segments) – use the original HLS source link.
        //     finalStreamUrl = hlsSource.link;
        // }
        
        // const result = {
        //     stream: finalStreamUrl,
        //     subtitles: subtitleTrack ? subtitleTrack.url : ""
        // };
        
        // console.log("Final result:", result);
        // return JSON.stringify(result);

        // // Fetch API data and parse as JSON.
        // const response = await fetch(apiUrl);
        // const data = JSON.parse(response);
        
        // const hlsSource = data.url?.find(source => source.type === 'hls');
        // const subtitleTrack = data.tracks?.find(track =>
        //     track.lang.startsWith('English')
        // );
        
        // if (!hlsSource) throw new Error("HLS source not found");
        
        // // Fetch the HLS playlist text.
        // const hlsResponse = await fetch(hlsSource.link);
        // const hlsSourceText = await hlsResponse;
        
        // console.log("HLS Playlist Text:\n", hlsSourceText);
        
        // let finalStreamUrl = "";
        
        // // Check if it's a master playlist (contains multiple stream options).
        // if (hlsSourceText.includes("#EXT-X-STREAM-INF:")) {
        //     // This regex matches the resolution from the EXT-X-STREAM-INF line and then captures the URL in the next line.
        //     const streamRegex = /^#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x\d+).*$(?:\r?\n)(.*)/gm;
            
        //     let highestStreamUrl = null;
        //     let highestPixels = 0;
        //     let regexMatch;
            
        //     while ((regexMatch = streamRegex.exec(hlsSourceText)) !== null) {
        //         const resolutionStr = regexMatch[1];
        //         const urlLine = regexMatch[2].trim();

        //         const [width, height] = resolutionStr.split('x').map(Number);
        //         const pixels = width * height;

        //         if (pixels > highestPixels) {
        //             highestPixels = pixels;
        //             highestStreamUrl = urlLine;
        //         }
        //     }
            
        //     if (highestStreamUrl) {
        //         finalStreamUrl = "https://vidjoy.pro" + highestStreamUrl;
        //     } else {
        //         console.log("No stream found in master playlist.");
        //         return null;
        //     }
        
        // for (const apiUrl of apiUrls) {
        //     if (apiUrl.includes("https://api.rgshows.me")) {
        //         const response = await fetch(apiUrl, { headers: { 'Referer': "https://www.vidsrc.wtf/" } });
        //         const data = await response.json();
                
        //         const hlsSource = data.stream?.url;
        //         const subtitleTrack = `https://sub.wyzie.ru/search?id=696506`
                
        //         const result = {
        //             stream: hlsSource,
        //             subtitles: subtitleTrack
        //         };
                
        //         console.log("Result: ", result);
        //         return JSON.stringify(result);
        //     } else if (apiUrl.includes("https://vidjoy.pro")) {    
        //         // Fetch API data and parse as JSON.
        //         const response = await fetch(apiUrl);
        //         const data = JSON.parse(response);
                
        //         const hlsSource = data.url?.find(source => source.type === 'hls');
        //         const subtitleTrack = data.tracks?.find(track =>
        //             track.lang.startsWith('English')
        //         );
                
        //         if (!hlsSource) throw new Error("HLS source not found");
                
        //         // Fetch the HLS playlist text.
        //         const hlsResponse = await fetch(hlsSource.link);
        //         const hlsSourceText = await hlsResponse;
                
        //         console.log("HLS Playlist Text:\n", hlsSourceText);
                
        //         let finalStreamUrl = "";
                
        //         // Check if it's a master playlist (contains multiple stream options).
        //         if (hlsSourceText.includes("#EXT-X-STREAM-INF:")) {
        //             // This regex matches the resolution from the EXT-X-STREAM-INF line and then captures the URL in the next line.
        //             const streamRegex = /^#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x\d+).*$(?:\r?\n)(.*)/gm;
                    
        //             let highestStreamUrl = null;
        //             let highestPixels = 0;
        //             let regexMatch;
                    
        //             while ((regexMatch = streamRegex.exec(hlsSourceText)) !== null) {
        //                 const resolutionStr = regexMatch[1];
        //                 const urlLine = regexMatch[2].trim();
    
        //                 const [width, height] = resolutionStr.split('x').map(Number);
        //                 const pixels = width * height;
    
        //                 if (pixels > highestPixels) {
        //                     highestPixels = pixels;
        //                     highestStreamUrl = urlLine;
        //                 }
        //             }
                    
        //             if (highestStreamUrl) {
        //                 finalStreamUrl = "https://vidjoy.pro" + highestStreamUrl;
        //             } else {
        //                 console.log("No stream found in master playlist.");
        //                 return null;
        //             }
        //         } else {
        //             // Media playlist (with TS segments) – use the original HLS source link.
        //             finalStreamUrl = hlsSource.link;
        //         }
                
        //         const result = {
        //             stream: finalStreamUrl,
        //             subtitles: subtitleTrack ? subtitleTrack.url : ""
        //         };
                
        //         console.log("Final result:", result);
        //         return JSON.stringify(result);
        //     } else if (apiUrl.includes("https://vidzee.wtf")) {
        //         const response = await fetch(apiUrl, { headers: { 'Referer': apiUrl } });
        //         const text = await response.text();
                
        //         // Extract the stream URL from the Artplayer config (first .mp4 URL)
        //         const streamUrlMatch = text.match(/url\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
        //         const extractedStreamUrl = streamUrlMatch ? streamUrlMatch[1].trim() : "";
                
        //         // Extract the subtitle URL from the subtitle options block (first .srt URL)
        //         const subtitleUrlMatch = text.match(/"url"\s*:\s*"([^"]+\.srt[^"]*)"/i);
        //         const extractedSubtitleUrl = subtitleUrlMatch ? subtitleUrlMatch[1].trim() : "";
                
        //         const result = {
        //             stream: extractedStreamUrl,
        //             subtitles: extractedSubtitleUrl
        //         };
                
        //         console.log("Final result from vidzee:", result);
        //         return JSON.stringify(result);
        //     } else {
        //         throw new Error("Invalid URL format");
        //     }
        // }
    } catch (error) {
        console.log("Error in extractStreamUrl:", error);
        return null;
    }
}

extractStreamUrl(`https://flickystream.com/watch/movie/696506`);