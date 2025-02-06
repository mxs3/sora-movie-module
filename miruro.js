const cheerio = require('cheerio'); // For HTML parsing

// 1. Search Results Scraper
function searchResults(html) {
    const $ = cheerio.load(html);
    const results = [];

    // Adjust selector based on actual structure
    $('.anime-card').each((i, el) => { // Common class for anime cards
        results.push({
            title: $(el).find('.title').text().trim(),
            image: $(el).find('img').attr('src'),
            href: $(el).find('a').attr('href'),
            rating: $(el).find('.rating').text().trim()
        });
    });

    return results;
}

// 2. Anime Details Scraper
function extractDetails(html) {
    const $ = cheerio.load(html);
    const details = {};

    // Adjust selectors based on actual page structure
    details.description = $('#synopsis').text().trim();
    details.genres = $('.genre-tag').map((i, el) => $(el).text()).get();
    details.episodes = $('.episode-list').length;
    details.status = $('.status').text().trim();

    return details;
}

// 3. Episode List Scraper
function extractEpisodes(html) {
    const $ = cheerio.load(html);
    const episodes = [];

    // Common pattern for episode lists
    $('.episode-item').each((i, el) => {
        episodes.push({
            number: $(el).find('.episode-num').text().replace('Episode', '').trim(),
            href: $(el).find('a').attr('href'),
            date: $(el).find('.air-date').text().trim()
        });
    });

    return episodes;
}

// 4. Video Source Extractor
async function extractStreamUrl(html) {
    const $ = cheerio.load(html);
    
    // Common video embed patterns
    const iframeSrc = $('iframe.video-embed').attr('src');
    // Add logic to handle iframe content if needed
    
    // Alternative: Direct video source
    const directSource = $('video source').attr('src');
    
    return directSource || iframeSrc;
}

module.exports = { searchResults, extractDetails, extractEpisodes, extractStreamUrl };