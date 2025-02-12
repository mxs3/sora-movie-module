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
        if(url.includes('/watch/movie/')) {
            const match = url.match(/https:\/\/hexa\.watch\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];
            return JSON.stringify([
                { href: `https://hexa.watch/watch/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('/watch/tv/')) {
            const match = url.match(/https:\/\/hexa\.watch\/watch\/tv\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const showId = match[1];
            
            const showResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=71fdb081b0133511ac14ac0cc10fd307`);
            const showData = JSON.parse(showResponseText);
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;

                if(seasonNumber === 0) continue;
                
                const seasonResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=71fdb081b0133511ac14ac0cc10fd307`);
                const seasonData = JSON.parse(seasonResponseText);
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map(episode => ({
                        href: `https://hexa.watch/watch/tv/${showId}/${seasonNumber}/${episode.episode_number}`,
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
    const endpoints = [
        "https://fishstick.hexa.watch/api/hexa1/",
        "https://fishstick.hexa.watch/api/hexa4/",
        "https://fishstick.hexa.watch/api/hexa2/",
        "https://fishstick.hexa.watch/api/hexa3/"
    ];

    // Configure browser-like headers
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://hexa.watch/'
    };

    // Rotating proxy configuration (add your proxies here)
    const proxies = [
        // 'http://user:pass@proxy1:port',
        // 'http://user:pass@proxy2:port'
    ];

    try {
        if (url.includes('/watch/movie/')) {
            const match = url.match(/https:\/\/hexa\.watch\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];

            for (let i = 0; i < endpoints.length; i++) {
                try {
                    const endpoint = endpoints[i];
                    const fetchOptions = {
                        headers: headers,
                        // proxy: proxies[i % proxies.length] // Uncomment if using proxies
                    };

                    // First attempt
                    let response = await fetch(`${endpoint}${movieId}`, fetchOptions);
                    let responseText = await response.text();

                    // Check for Cloudflare challenge
                    if (response.status === 403 && responseText.includes('CAPTCHA')) {
                        // Solve CAPTCHA and retry with clearance cookie
                        const cfCookie = await solveCloudflareChallenge(endpoint);
                        fetchOptions.headers.Cookie = `cf_clearance=${cfCookie}`;
                        
                        response = await fetch(`${endpoint}${movieId}`, fetchOptions);
                        responseText = await response.text();
                    }

                    const data = JSON.parse(responseText);
                    if (data?.stream?.length) {
                        const hlsSource = data.stream.find(s => s.type === 'hls');
                        if (hlsSource?.url) return await processHlsUrl(hlsSource.url);
                    }
                } catch (err) {
                    console.log(`Endpoint ${endpoints[i]} failed:`, err.message);
                }
            }
            return null;

        } else if (url.includes('/watch/tv/')) {
            // Similar TV show handling (omitted for brevity)
            // Add the same CAPTCHA handling logic as movie section
        }
    } catch (error) {
        console.log('Main error:', error);
        return null;
    }
}

// CAPTCHA solving integration
async function solveCloudflareChallenge(url) {
    // Use Capsolver API or alternative service
    try {
        const response = await fetch('https://api.capsolver.com/createTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY' // Replace with your key
            },
            body: JSON.stringify({
                task: {
                    type: 'AntiCloudflareTask',
                    websiteURL: url,
                    proxy: proxies[Math.floor(Math.random() * proxies.length)]
                }
            })
        });
        
        const task = await response.json();
        return task.solution.cookie;
    } catch (error) {
        console.error('CAPTCHA solve failed:', error);
        throw error;
    }
}

// HLS Proxy wrapper to bypass CORS/headers
async function processHlsUrl(hlsUrl) {
    // Use local proxy or CORS-anywhere service
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    return `${proxyUrl}${encodeURIComponent(hlsUrl)}`;
}