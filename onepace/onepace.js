async function searchResults(keyword) {
    const results = [];
    const response = await soraFetch(`https://onepace.net/en/watch`);
    const html = await response.text();
    // const regex = /<h2[^>]*>\s*<a[^>]*>([^<]+)<\/a>\s*<\/h2>|"([^"]*0bbcd6da[^"]*)"|(https:\/\/pixeldrain\.net\/l\/[^"]+)/g;
    const regex = /(https:\/\/pixeldrain\.net\/l\/[^"]+)/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
            console.log(`Links: ${match[1]}`);
            const match2 = match[1].match(/https:\/\/pixeldrain\.net\/l\/([^\/]+)/);
            if (!match2) throw new Error("Invalid URL format");

            const arcId = match2[1];
            const response2 = await soraFetch(`https://pixeldrain.net/api/list/${arcId}`);
            const data = await response2.json();

            const image = data.files[0].thumbnail_href ? `https://pixeldrain.net/api${data.files[0].thumbnail_href}` : "";
            const title = data.title;

            if (!keyword || title.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({
                    title: title,
                    image: image,
                    href: match[1].trim()
                });
            }
        }
    }
    
    console.log(`Search Results: ${JSON.stringify(results)}`);
    return JSON.stringify(results);
}

async function extractDetails(url) {
    const match = url.match(/https:\/\/pixeldrain\.net\/l\/([^\/]+)/);
    if (!match) throw new Error("Invalid URL format");
            
    const arcId = match[1];

    const response = await soraFetch(`https://pixeldrain.net/api/list/${arcId}`);
    const data = await response.json();    

    const transformedResults = [{
        description: `Title: ${data.title}\nFile Count: ${data.file_count}`,
        aliases: `Title: ${data.title}\nFile Count: ${data.file_count}`,
        airdate: ''
    }];

    console.log(`Details: ${JSON.stringify(transformedResults)}`);
    return JSON.stringify(transformedResults);
}

async function extractEpisodes(url) {
    const match = url.match(/https:\/\/pixeldrain\.net\/l\/([^\/]+)/);
    if (!match) throw new Error("Invalid URL format");
            
    const arcId = match[1];

    const response = await soraFetch(`https://pixeldrain.net/api/list/${arcId}`);
    const data = await response.json();

    const transformedResults = data.files.map((result, index) => {
        return {
            href: `${result.id}`,
            number: index + 1,
        };
    });

    console.log(`Episodes: ${JSON.stringify(transformedResults)}`);
    return JSON.stringify(transformedResults);
}

// searchResults("romance");
// extractDetails("https://pixeldrain.net/l/sT25hhHR");
// extractEpisodes("https://pixeldrain.net/l/sT25hhHR");

async function extractStreamUrl(url) {
    return `https://pixeldrain.net/api/file/${url}`;
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