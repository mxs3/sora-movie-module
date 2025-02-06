const BASE_URL = "https://animeflv.ahmedrangel.com/api";

async function searchResults(keyword) {
    try {
        const response = await fetch(`${BASE_URL}/api/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: keyword })
        });
        const data = await response.json();

        const transformedResults = data.results.map(anime => ({
            title: anime.title,
            image: anime.poster,
            href: `${BASE_URL}/api/anime/${anime.slug}`
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error("Search Error:", error);
        return JSON.stringify([{ title: "Error", image: "", href: "" }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/\/api\/anime\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        const slug = match[1];

        const response = await fetch(`${BASE_URL}/api/anime/${slug}`);
        const data = await response.json();

        const animeInfo = data.anime;

        const transformedResults = [{
            description: animeInfo.synopsis || "No description available",
            aliases: `Episodes: ${animeInfo.totalEpisodes || "Unknown"}`,
            airdate: `Aired: ${animeInfo.releaseDate || "Unknown"}`
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error("Details Error:", error);
        return JSON.stringify([{ description: "Error loading details", aliases: "Unknown", airdate: "Unknown" }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/\/api\/anime\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");
        const slug = match[1];

        const response = await fetch(`${BASE_URL}/api/anime/episode/${slug}`);
        const data = await response.json();

        const transformedResults = data.episodes.map(episode => ({
            href: `${BASE_URL}/api/anime/${slug}/episode/${episode.number}`,
            number: episode.number
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error("Episodes Error:", error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/\/api\/anime\/(.+)\/episode\/(\d+)$/);
        if (!match) throw new Error("Invalid URL format");
        const slug = match[1];
        const number = match[2];

        const response = await fetch(`${BASE_URL}/api/anime/${slug}/episode/${number}`);
        const data = await response.json();

        return data.videoUrl || null;
    } catch (error) {
        console.error("Stream URL Error:", error);
        return null;
    }
}
