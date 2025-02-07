const cheerio = require('cheerio');

async function searchResults(query) {
    const url = `https://www.miruro.tv/search?query=${encodeURIComponent(query)}`;
    const html = await fetchHTML(url); // Use fetchHTML function from earlier

    const $ = cheerio.load(html);
    const results = [];

    // Adjust selectors based on actual search results structure
    $('.anime-card').each((i, el) => {
        results.push({
            title: $(el).find('.title').text().trim(),
            image: $(el).find('img').attr('src'),
            href: $(el).find('a').attr('href'),
            id: $(el).find('a').attr('href').split('id=')[1] // Extract ID from URL
        });
    });

    return results;
}

async function extractDetails(id) {
    const url = `https://www.miruro.tv/info?id=${id}`;
    const html = await fetchHTML(url);

    const $ = cheerio.load(html);
    const details = {};

    // Extract metadata
    details.title = $('h1.title').text().trim();
    details.description = $('.synopsis').text().trim();
    details.genres = $('.genre-tag').map((i, el) => $(el).text()).get();
    details.episodes = $('.episode-list').length;

    return details;
}

async function extractEpisodes(id) {
    const url = `https://www.miruro.tv/watch?id=${id}`;
    const html = await fetchHTML(url);

    const $ = cheerio.load(html);
    const episodes = [];

    $('.episode-item').each((i, el) => {
        episodes.push({
            number: $(el).find('.episode-num').text().replace('Episode', '').trim(),
            href: $(el).find('a').attr('href'),
            id: $(el).find('a').attr('href').split('id=')[1] // Extract episode ID
        });
    });

    return episodes;
}

async function extractStreamUrl(episodeId) {
    const url = `https://www.miruro.tv/watch?id=${episodeId}`;
    const html = await fetchHTML(url);

    const $ = cheerio.load(html);
    const videoSrc = $('video source').attr('src');

    if (!videoSrc) {
        // Handle embedded players (e.g., iframes)
        const iframeSrc = $('iframe.video-embed').attr('src');
        return iframeSrc;
    }

    return videoSrc;
}

module.exports = { searchResults, extractDetails, extractEpisodes, extractStreamUrl };