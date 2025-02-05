// AnimeFLV.js

// 1. Search Results
// Input: search keyword (string)
// Output: JSON stringified array of objects, each with keys: title, image, href
async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`, {
            headers: { "Accept": "application/json" }
        });
        // Instead of response.json(), use response.text() then JSON.parse()
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Expected response structure:
        // { success: true, data: { currentPage, hasNextPage, ..., media: [ { title, cover, synopsis, rating, slug, type, url }, ... ] } }
        if (!data.success || !data.data || !Array.isArray(data.data.media)) {
            return JSON.stringify([{ title: "No results found", image: "", href: "" }]);
        }
        
        const results = data.data.media.map(anime => ({
            title: anime.title || "Unknown Title",
            image: anime.cover || "",
            href: anime.url || ""
        }));
        return JSON.stringify(results);
    } catch (error) {
        return JSON.stringify([{ title: "Error: " + error.message, image: "", href: "" }]);
    }
}

// 2. Extract Details
// Input: URL in the form "https://www3.animeflv.net/anime/{slug}"
// Output: JSON stringified array with one object having keys: description, aliases, airdate
async function extractDetails(url) {
    try {
        // Extract the slug from the URL (assumes format "https://www3.animeflv.net/anime/{slug}")
        const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        const slug = match[1];
        
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`, {
            headers: { "Accept": "application/json" }
        });
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Expected details response structure:
        // { success: true, data: { anime: { description, aliases, airdate, ... } } }
        if (!data.success || !data.data || !data.data.anime) {
            return JSON.stringify([{ description: "No details found", aliases: "N/A", airdate: "Unknown" }]);
        }
        
        const anime = data.data.anime;
        const details = {
            description: anime.description || "No description available",
            aliases: anime.aliases || "No aliases available",
            airdate: anime.airdate || "Unknown"
        };
        return JSON.stringify([details]);
    } catch (error) {
        return JSON.stringify([{ description: "Error: " + error.message, aliases: "N/A", airdate: "Unknown" }]);
    }
}

// 3. Extract Episodes
// Input: URL in the form "https://www3.animeflv.net/anime/{slug}"
// Output: JSON stringified array of episode objects, each with keys: href, number
async function extractEpisodes(url) {
    try {
        // Extract the slug from the URL
        const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        const slug = match[1];
        
        // Use the episodes endpoint: /api/anime/episode/{slug}
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${slug}`, {
            headers: { "Accept": "application/json" }
        });
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Expected episodes response structure:
        // { success: true, data: { episodes: [ { number, ... }, ... ] } }
        if (!data.success || !data.data || !Array.isArray(data.data.episodes)) {
            return JSON.stringify([]);
        }
        
        const episodes = data.data.episodes.map(ep => ({
            href: `https://www3.animeflv.net/anime/${slug}/episode/${ep.number}`,
            number: ep.number
        }));
        return JSON.stringify(episodes);
    } catch (error) {
        return JSON.stringify([]);
    }
}

// 4. Extract Stream URL
// Input: URL in the form "https://www3.animeflv.net/anime/{slug}/episode/{number}"
// Output: The stream URL as a string (or null if not found)
async function extractStreamUrl(url) {
    try {
        // Extract slug and episode number from the URL
        const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)\/episode\/(\d+)$/);
        if (!match) throw new Error("Invalid URL format");
        const slug = match[1];
        const episodeNumber = match[2];
        
        // Use the stream endpoint: /api/anime/{slug}/episode/{number}
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episode/${episodeNumber}`, {
            headers: { "Accept": "application/json" }
        });
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Expected stream response structure:
        // { success: true, data: { sources: [ { type, url, ... }, ... ] } }
        if (!data.success || !data.data || !Array.isArray(data.data.sources)) {
            return null;
        }
        
        // Find a source with type 'hls' (adjust if needed)
        const hlsSource = data.data.sources.find(source => source.type === 'hls');
        return hlsSource ? hlsSource.url : null;
    } catch (error) {
        return null;
    }
}
