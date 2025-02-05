function cleanText(text) {
    return text
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, "-")
        .replace(/&#[0-9]+;/g, "")
        .trim();
}

// 📌 **Function to Search Anime**
function searchResults(html) {
    const results = [];
    const baseUrl = "https://www3.animeflv.net/";

    const animeBlocks = html.match(/<article class="Anime">[\s\S]*?<\/article>/g) || [];

    animeBlocks.forEach(block => {
        const titleMatch = block.match(/<a href="([^"]+)" title="([^"]+)"/);
        const imageMatch = block.match(/<img src="([^"]+)"/);
        const synopsisMatch = block.match(/<div class="Description">([^<]+)<\/div>/);
        
        if (titleMatch) {
            results.push({
                title: cleanText(titleMatch[2]),
                image: imageMatch ? imageMatch[1] : "",
                href: baseUrl + titleMatch[1],
                synopsis: synopsisMatch ? cleanText(synopsisMatch[1]) : "No description available",
            });
        }
    });

    return results.length > 0 ? results : [{ title: "No results found", image: "", href: "" }];
}

// 📌 **Function to Extract Anime Details**
function extractDetails(html) {
    const details = {};

    const titleMatch = html.match(/<h1 class="Title">([^<]+)<\/h1>/);
    const coverMatch = html.match(/<div class="Image"><img src="([^"]+)"/);
    const synopsisMatch = html.match(/<div class="Description">([^<]+)<\/div>/);
    const typeMatch = html.match(/<span class="Type">([^<]+)<\/span>/);
    const genreMatch = html.match(/<span class="generos">([^<]+)<\/span>/);
    const statusMatch = html.match(/<span class="fa-play-circle">([^<]+)<\/span>/);

    details.title = titleMatch ? cleanText(titleMatch[1]) : "Unknown Title";
    details.cover = coverMatch ? coverMatch[1] : "";
    details.synopsis = synopsisMatch ? cleanText(synopsisMatch[1]) : "No description available";
    details.type = typeMatch ? cleanText(typeMatch[1]) : "Unknown";
    details.genres = genreMatch ? cleanText(genreMatch[1]) : "Unknown";
    details.status = statusMatch ? cleanText(statusMatch[1]) : "Unknown";

    return details;
}

// 📌 **Function to Extract Episodes List**
function extractEpisodes(html) {
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
}

// 📌 **Function to Extract Streaming URL**
function extractStreamUrl(html) {
    const match = html.match(/<source src="([^"]+)" type="application\/x-mpegURL"/);
    return match ? match[1] : null;
}

export { searchResults, extractDetails, extractEpisodes, extractStreamUrl };
