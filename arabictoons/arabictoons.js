async function searchResults(keyword) {
    const results = [];

    const response = await soraFetch(`https://www.arabic-toons.com/livesearch.php?q=${keyword}`);
    const html = await response.text();

    const responseForMovies = await soraFetch(`https://www.arabic-toons.com/livesearch.php?m=&q=${keyword}`);
    const htmlForMovies = await responseForMovies.text();

    const regex = /<a class="list-group-item list-group-item-action (?:active)?" href="([^"]+)">\s*([\s\S]*?)<span class="badge">(\d+)<\/span><\/a>/gu;

    let match;
    while ((match = regex.exec(html)) !== null) {
        const rawTitle = match[2]
            .replace(/<span[^>]*>.*?<\/span>/, '')
            .replace(/\s+/g, ' ')
            .trim();

        results.push({
            title: rawTitle,
            href: match[1].trim(),
            image: ""
        });
    }

    let match2;
    while ((match2 = regex.exec(htmlForMovies)) !== null) {
        const rawTitle = match2[2]
            .replace(/<span[^>]*>.*?<\/span>/, '')
            .replace(/\s+/g, ' ')
            .trim();

        results.push({
            title: rawTitle,
            href: match2[1].trim(),
            image: ""
        });
    }

    console.log('Search Results: ' + results);
    return JSON.stringify(results);
}

searchResults(`ناروتو`)

async function extractDetails(url) {
    const results = [];
    const response = await soraFetch(url);
    const html = await response.text();

    const match = html.match(/<h1[^>]*?>قصة الكرتون\s*\/\s*الأنمي<\/h1>\s*<div[^>]*?>([\s\S]*?)<\/div>/);
    const description = match ? match[1].trim().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ') : 'N/A';

    results.push({
        description: description,
        aliases: 'N/A',
        airdate: 'N/A'
    });

    console.log('Details: ' + results);
    return JSON.stringify(results);
}

async function extractEpisodes(url) {
    const results = [];
    const response = await soraFetch(url);
    const html = await response.text();

    const regex = /<a[^>]+href="([^"]+)"[^>]*?>[\s\S]*?<div[^>]*class="badge-overd[^>]*>\s*الحلقة\s+(\d+)/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        results.push({
            href: match[1].trim(),
            number: parseInt(match[2], 10)
        });
    }

    console.log('Episodes: ' + results);
    return JSON.stringify(results);
}

async function extractStreamUrl(url) {
    const response = await soraFetch(url);
    const html = await response.text();

    const regex = /jC1kO:\s*"(.*?)",\s*hF3nV:\s*"(.*?)",\s*iA5pX:\s*"(.*?)",\s*tN4qY:\s*"(.*?)"/;
    const match = regex.exec(html);

    if (match) {
        const protocol = match[1];
        const host = match[2];
        const path = match[3];
        const query = match[4];

        const fullUrl = `${protocol}://${host}/${path}?${query}`;
        return fullUrl;
    }

    return "";
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