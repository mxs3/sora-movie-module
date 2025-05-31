async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`https://api.themoviedb.org/3/search/multi?api_key=653bb8af90162bd98fc7ee32bcbbfb3d&query=${encodedKeyword}&include_adult=false`);
        const data = await responseText.json();

        const transformedResults = data.results.map(result => {
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name || result.original_title || result.original_name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://ableflix.cc/movie/${result.id}`
                };
            } else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title || result.original_name || result.original_title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://ableflix.cc/tv/${result.id}`
                };
            } else {
                return {
                    title: result.title || result.name || result.original_name || result.original_title || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://ableflix.cc/tv/${result.id}`
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

            return JSON.stringify(transformedResults);
        } else if(url.includes('tv')) {
            const match = url.match(/https:\/\/ableflix\.cc\/tv\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const responseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
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
            const match = url.match(/https:\/\/ableflix\.cc\/movie\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const movieId = match[1];
            
            return JSON.stringify([
                { href: `https://ableflix.cc/watch/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('tv')) {
            const match = url.match(/https:\/\/ableflix\.cc\/tv\/([^\/]+)/);
            
            if (!match) throw new Error("Invalid URL format");
            
            const showId = match[1];
            
            const showResponseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
            const showData = await showResponseText.json();
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;

                if(seasonNumber === 0) continue;
                
                const seasonResponseText = await fetchv2(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=653bb8af90162bd98fc7ee32bcbbfb3d`);
                const seasonData = await seasonResponseText.json();
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map(episode => ({
                        href: `https://ableflix.cc/watch/tv/${showId}/${seasonNumber}/${episode.episode_number}`,
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
        const isMovie = url.includes('movie');
        const isTV = url.includes('tv');

        if (!isMovie && !isTV) throw new Error("Invalid URL format");

        let embedUrl;

        if (isMovie) {
            const match = url.match(/https:\/\/ableflix\.cc\/watch\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid movie URL format");

            const movieId = match[1];
            embedUrl = `https://vidsrc.icu/embed/movie/${movieId}`;
        } else {
            const match = url.match(/https:\/\/ableflix\.cc\/watch\/tv\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
            if (!match) throw new Error("Invalid TV URL format");

            const [_, showId, season, episode] = match;
            embedUrl = `https://vidsrc.icu/embed/tv/${showId}/${season}/${episode}`;
        }

        const responseText = await fetchv2(embedUrl);
        const html = await responseText.text();

        const videoMatch = html.match(/iframe id="videoIframe" src="([\s\S]+?)"/);
        if (!videoMatch) throw new Error("Video iframe not found");

        const videoUrl = videoMatch[1];
        const videoResponse = await fetchv2(videoUrl);
        const videoHtml = await videoResponse.text();

        const iframeMatch = videoHtml.match(/id="player_iframe"[\s\S]+?src="([\s\S]+?)"/);
        if (!iframeMatch) throw new Error("Player iframe not found");

        const iframeFullUrl = 'https:' + iframeMatch[1];
        const iframeResponse = await fetchv2(iframeFullUrl);
        const iframeHtml = await iframeResponse.text();

        const iframe2Match = iframeHtml.match(/src: '([\s\S]+?)'/);
        if (!iframe2Match) throw new Error("Second iframe src not found");

        const baseUrl = iframeFullUrl.split('/rcp')[0];
        const iframe2Url = baseUrl + iframe2Match[1];

        const iframe2Response = await fetchv2(iframe2Url, {
            headers: { Referer: iframeFullUrl }
        });
        const iframe2Html = await iframe2Response.text();

        const sourceMatch = iframe2Html.match(/id:"player_parent", file: '([\s\S]+?)'/);
        if (!sourceMatch) throw new Error("Stream source not found");

        const streamUrl = sourceMatch[1];

        const results = {
            streams: [
                {
                    title: "",
                    streamUrl,
                    headers: {
                        origin: "https://cloudnestra.com",
                        referrer: "https://cloudnestra.com/"
                    }
                }
            ],
            subtitles: ""
        };

        console.log(results);
        return JSON.stringify(results);
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}

// extractStreamUrl(`https://ableflix.cc/watch/tv/1396/1/1`);