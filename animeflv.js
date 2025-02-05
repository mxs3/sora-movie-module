async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://www3.animeflv.net/browse?q=${encodedKeyword}`);
        const html = await response.text();

        const results = [];
        const baseUrl = "https://www3.animeflv.net/";

        const animeBlocks = html.match(/<article class="Anime">[\s\S]*?<\/article>/g) || [];

        animeBlocks.forEach(block => {
            const titleMatch = block.match(/<a href="([^"]+)" title="([^"]+)"/);
            const imageMatch = block.match(/<img src="([^"]+)"/);
            
            if (titleMatch) {
                results.push({
                    title: titleMatch[2].trim(),
                    image: imageMatch ? imageMatch[1] : "",
                    href: baseUrl + titleMatch[1],
                });
            }
        });

        return results.length > 0 ? results : [{ title: "No results found", image: "", href: "" }];
    } catch (error) {
        console.error("Search Error:", error);
        return [{ title: "Error", image: "", href: "" }];
    }
}

async function extractDetails(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        const titleMatch = html.match(/<h1 class="Title">([^<]+)<\/h1>/);
        const coverMatch = html.match(/<div class="Image"><img src="([^"]+)"/);
        const synopsisMatch = html.match(/<div class="Description">([^<]+)<\/div>/);
        const typeMatch = html.match(/<span class="Type">([^<]+)<\/span>/);
        const genreMatch = html.match(/<span class="generos">([^<]+)<\/span>/);
        const statusMatch = html.match(/<span class="fa-play-circle">([^<]+)<\/span>/);

        return {
            title: titleMatch ? titleMatch[1].trim() : "Unknown Title",
            cover: coverMatch ? coverMatch[1] : "",
            synopsis: synopsisMatch ? synopsisMatch[1].trim() : "No description available",
            type: typeMatch ? typeMatch[1].trim() : "Unknown",
            genres: genreMatch ? genreMatch[1].trim() : "Unknown",
            status: statusMatch ? statusMatch[1].trim() : "Unknown",
        };
    } catch (error) {
        console.error("Details Error:", error);
        return { title: "Error", cover: "", synopsis: "Error loading details" };
    }
}

async function extractEpisodes(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const episodes = [];
        const baseUrl = "https://www3.animeflv.net/";

        const episodeBlocks = html.match(/<li><a href="([^"]+)">([^<]+)<\/a><\/li>/g) || [];

        episodeBlocks.forEach(block => {
            const match = block.match(/href="([^"]+)">([^<]+)<\/a>/);
            if (match) {
                episodes.push({
                    href: baseUrl + match[1],
                    number: match[2],
                });
            }
        });

        return episodes.reverse();
    } catch (error) {
        console.error("Episodes Error:", error);
        return [];
    }
}

async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const match = html.match(/<source src="([^"]+)" type="application\/x-mpegURL"/);
        return match ? match[1] : null;
    } catch (error) {
        console.error("Stream URL Error:", error);
        return null;
    }
}

export { searchResults, extractDetails, extractEpisodes, extractStreamUrl };
