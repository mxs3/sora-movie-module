async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await soraFetch(`https://api.themoviedb.org/3/search/multi?api_key=9801b6b0548ad57581d111ea690c85c8&query=${encodedKeyword}&include_adult=false`);
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

        console.log('Transformed Results:', transformedResults);
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
            const responseText = await soraFetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
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
            const responseText = await soraFetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
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
            
            const showResponseText = await soraFetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
            const showData = await showResponseText.json();
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;
                
                const seasonResponseText = await soraFetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=ad301b7cc82ffe19273e55e4d4206885`);
                const seasonData = await seasonResponseText.json();
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map((episode, i) => {
                        const episodeNumber = i + 1;

                        return {
                            href: `https://net3lix.world/watch/tv/${showId}/${seasonNumber}/${episode.episode_number}`,
                            number: episodeNumber,
                            title: episode.name || ""
                        };
                    });
                    allEpisodes = allEpisodes.concat(episodes);
                }
            }
            
            console.log('All Episodes:', allEpisodes);
            return JSON.stringify(allEpisodes);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

// searchResults('One piece');
// extractDetails('https://net3lix.world/watch/tv/37854/1/1');
// extractEpisodes('https://net3lix.world/watch/tv/37854/1/1');
// extractStreamUrl('https://net3lix.world/watch/tv/37854/2/65');

async function extractStreamUrl(url) {
    try {
        const match = url.match(/net3lix\.world\/watch\/(movie|tv)\/(.+)/);
        if (!match) throw new Error('Invalid URL format');
        const [, type, path] = match;

        const embedUrl = type === 'movie'
        ? `https://vidsrc.su/embed/movie/${path}`
        : (() => {
            const [showId, season, episode] = path.split('/');
            return `https://vidsrc.su/embed/tv/${showId}/${season}/${episode}`;
            })();

        const data = await soraFetch(embedUrl).then(res => res.text());

        console.log('Embed URL:', embedUrl);
        console.log('Data:', data);

        const urlRegex = /^(?!\s*\/\/).*url:\s*(['"])(.*?)\1/gm;
        const subtitleRegex = /"url"\s*:\s*"([^"]+)"[^}]*"format"\s*:\s*"([^"]+)"[^}]*"encoding"\s*:\s*"([^"]+)"[^}]*"display"\s*:\s*"([^"]+)"[^}]*"language"\s*:\s*"([^"]+)"/g;

        const streams = Array.from(data.matchAll(urlRegex), m => m[2].trim()).filter(Boolean);

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

        const subtitleUrls = subtitleMatches.map(item => item.url);
        console.log("Subtitle URLs:", subtitleUrls);

        let firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'ASCII' || subtitle.encoding === 'UTF-8'));

        if (!firstSubtitle) {
            firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP1252'));
        }

        if (!firstSubtitle) {
            firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP1250'));
        }

        if (!firstSubtitle) {
            firstSubtitle = subtitleMatches.find(subtitle => subtitle.display.includes('English') && (subtitle.encoding === 'CP850'));
        }

        const result = {
            streams,
            subtitles: firstSubtitle ? firstSubtitle.url : ""
        }

        console.log('Result:', result);
        return JSON.stringify(result);
    } catch (error) {
        console.error('extractStreamUrl error:', error);
        return null;
    }
}

async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            return null;
        }
    }
}