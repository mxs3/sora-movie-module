async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`);
        const data = await response.json();

        console.log("Raw API Response:", data); // Debugging output

        if (data.success && data.data && Array.isArray(data.data.media) && data.data.media.length > 0) {
            const transformedResults = data.data.media.map(anime => ({
                title: anime.title,
                image: anime.cover,
                synopsis: anime.synopsis || "No description available",
                rating: anime.rating || "N/A",
                href: anime.url  // Using direct animeflv URL
            }));
            return JSON.stringify(transformedResults);
        } else {
            return JSON.stringify([{ title: 'No results found', image: '', href: '' }]);
        }
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error occurred', image: '', href: '' }]);
    }
}

async function extractDetails(slug) {
    try {
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`);
        const data = await response.json();

        console.log("Raw Anime Details:", data);

        if (data.success && data.data) {
            const animeInfo = data.data;
            return JSON.stringify({
                title: animeInfo.title,
                cover: animeInfo.cover,
                synopsis: animeInfo.synopsis || "No description available",
                type: animeInfo.type || "Unknown",
                genres: animeInfo.genres ? animeInfo.genres.join(", ") : "Unknown",
                status: animeInfo.status || "Unknown",
                episodes: animeInfo.episodes.length
            });
        } else {
            return JSON.stringify({ title: "Anime not found", cover: "", synopsis: "", type: "", genres: "", status: "", episodes: 0 });
        }
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify({ title: "Error occurred", cover: "", synopsis: "", type: "", genres: "", status: "", episodes: 0 });
    }
}

async function extractEpisodes(slug) {
    try {
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`);
        const data = await response.json();

        console.log("Raw Episodes Data:", data);

        if (data.success && data.data && Array.isArray(data.data.episodes)) {
            const transformedResults = data.data.episodes.map(episode => ({
                number: episode.number,
                href: `https://animeflv.net/anime/${slug}/episode/${episode.number}`
            }));
            return JSON.stringify(transformedResults);
        } else {
            return JSON.stringify([{ number: "No episodes found", href: "" }]);
        }
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ number: "Error occurred", href: "" }]);
    }
}

async function extractStreamUrl(slug, episodeNumber) {
    try {
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episode/${episodeNumber}`);
        const data = await response.json();

        console.log("Raw Stream Data:", data);

        if (data.success && data.data && Array.isArray(data.data.sources)) {
            const hlsSource = data.data.sources.find(source => source.type === 'hls');
            return hlsSource ? hlsSource.url : null;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Fetch error:', error);
        return null;
    }
}

export { searchResults, extractDetails, extractEpisodes, extractStreamUrl };
