async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`https://uaserial.me/search?query=${encodedKeyword}`);
        const html = await responseText.text();

        const regex = /<a\s+href="([^"]+)"\s+title="([^"]+)">[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<\/a>/g;

        const results = [];
        let match;

        while ((match = regex.exec(html)) !== null) {
            results.push({
                title: match[2].trim(),
                image: `https://uaserial.me${match[3].trim()}`,
                href: `https://uaserial.me${match[1].trim()}`
            });
        }

        console.log(results);
        return JSON.stringify(results);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const response = await fetchv2(url);
        const htmlText = await response.text();

        const descriptionMatch = htmlText.match(/<div class="player__description description bordered">[\s\S]*?<div class="text">([\s\S]*?)<\/div>/);
        const description = descriptionMatch ? descriptionMatch[1].replace(/<br\s*\/?>/g, '\n').trim() : 'No description available';

        const airdateMatch = htmlText.match(/<div class="movie-data-item movie-data-item--date flex start">[\s\S]*?<span>(\d{1,2}\s[^\s<]+)<\/span>[\s\S]*?selection\/anime\/year-(\d{4})/);
        const airdate = airdateMatch ? `Дата релізу: ${airdateMatch[1]} ${airdateMatch[2]}` : 'Дата релізу: Unknown';

        const countryMatch = htmlText.match(/<div class="type color-text">Країна:<\/div>\s*<div class="value">\s*<a [^>]+>(.*?)<\/a>/);
        const studioMatch = htmlText.match(/<div class="type color-text">Студія:<\/div>\s*<div class="value">(.*?)<\/div>/);
        const timeMatch = htmlText.match(/<div class="type color-text">Час:<\/div>\s*<div class="value">(.*?)<\/div>/);
        const statusMatch = htmlText.match(/<div class="type color-text">Статус:<\/div>\s*<div class="value">(.*?)<\/div>/);
        const ratingMatch = htmlText.match(/<div class="type color-text">Рейтинг:<\/div>\s*<div class="value">(.*?)<\/div>/);

        const aliases = `
Країна: ${countryMatch ? countryMatch[1] : 'Unknown'}
Студія: ${studioMatch ? studioMatch[1] : 'Unknown'}
Час: ${timeMatch ? timeMatch[1] : 'Unknown'}
Статус: ${statusMatch ? statusMatch[1] : 'Unknown'}
Рейтинг: ${ratingMatch ? ratingMatch[1] : 'Unknown'}
        `.trim();

        const transformedResults = [{
            description,
            aliases,
            airdate
        }];

        console.log(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Unknown',
            airdate: 'Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const episodeOptions = [...html.matchAll(
            /<option[^>]*?data-series-number="(\d+)"[^>]*?value="([^"]+)"[^>]*?>([^<]+)<\/option>/g
        )];

        if (episodeOptions.length > 0) {
            const episodes = episodeOptions.map(([, number, value, label]) => ({
                href: value.startsWith('http') ? value : `https://uaserial.me${value}`,
                number: parseInt(number, 10),
                title: label.trim()
            }));

            console.log("Extracted from <option>:", episodes);
            return JSON.stringify(episodes);
        }

        const iframeMatch = html.match(/<iframe[^>]+src="([^"]+\/episode-\d+)"[^>]*>/);
        if (iframeMatch) {
            const href = iframeMatch[1].startsWith('http') 
                ? iframeMatch[1] 
                : `https://uaserial.me${iframeMatch[1]}`;

            const numberMatch = href.match(/episode-(\d+)/);
            const number = numberMatch ? parseInt(numberMatch[1], 10) : 1;

            const singleEpisode = [{
                href,
                number,
                title: `Серія ${number}`
            }];

            console.log("Fallback to iframe:", singleEpisode);
            return JSON.stringify(singleEpisode);
        }

        console.log("No episodes found.");
        return JSON.stringify([]);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        const responseText = await fetchv2(url);
        const htmlText = await responseText.text();

        const episodesMatch = htmlText.match(/episodes\s*:\s*(\[[\s\S]*?\])\s*,?\s*\n/);
        if (!episodesMatch) {
            console.log("No episodes block found.");
            return null;
        }

        let rawJson = episodesMatch[1];

        rawJson = rawJson
            .replace(/\\'/g, "'")
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']');

        const episodes = JSON.parse(rawJson);

        const ashdiUrl = episodes?.[0]?.src?.ashdi?.[0]?.link;
        if (!ashdiUrl) {
            console.log("No ashdi.vip link found.");
            return null;
        }

        const streamResponse = await fetchv2(ashdiUrl);
        const streamHtml = await streamResponse.text();

        const fileMatch = streamHtml.match(/file\s*:\s*"([^"]+\.m3u8[^"]*)"/);
        const subtitleMatch = streamHtml.match(/subtitle\s*:\s*"([^"]*)"/);

        const streamUrl = fileMatch ? fileMatch[1] : null;
        const subtitleUrl = subtitleMatch ? subtitleMatch[1] : null;

        const result = {
            stream: streamUrl ? streamUrl : "",
            subtitles: subtitleUrl ? subtitleUrl : ""
        };

        console.log(result);
        return JSON.stringify(result);
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}