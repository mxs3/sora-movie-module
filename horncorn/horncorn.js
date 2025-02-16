async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=aad3fab1607b552befd9a2ac37e556af&query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        // Filter results to include only movies
        const transformedResults = data.results
            .filter(result => result.media_type === "movie") // Ensure only movies
            .map(result => ({
                title: result.title || result.name,
                image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                href: `https://c.hopmarks.com/movie/${result.id}`
            }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/c\.hopmarks\.com\/movie\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const movieId = match[1];
        const responseText = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=aad3fab1607b552befd9a2ac37e556af`);
        const data = JSON.parse(responseText);

        const transformedResults = [{
            description: data.overview || 'No description available',
            aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
            airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired/Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/c\.hopmarks\.com\/movie\/([^\/]+)/);
        
        if (!match) throw new Error("Invalid URL format");
        
        const movieId = match[1];
        
        return JSON.stringify([
            { href: `https://c.hopmarks.com/movie/${movieId}`, number: 1, title: "Full Movie" }
        ]);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    const services = [
        "guru",
        "halo",
        "alpha",
        "g1",
        "g2",
        "ghost",
        "fastx",
        "astra",
        "anime",
        "ninja",
        "catflix",
        "hyvax",
        "vidcloud",
        "filmxyz",
        "shadow",
        "kaze",
        "asiacloud",
        "zenith",
        "kage",
        "filmecho",
        "kinoecho",
        "ee3",
        "putafilme",
        "ophim",
    ];

    const secretKey = ["I", "3LZu", "M2V3", "4EXX", "s4", "yRy", "oqMz", "ysE", "RT", "iSI", "zlc", "H", "YNp", "5vR6", "h9S", "R", "jo", "F", "h2", "W8", "i", "sz09", "Xom", "gpU", "q", "6Qvg", "Cu", "5Zaz", "VK", "od", "FGY4", "eu", "D5Q", "smH", "11eq", "QrXs", "3", "L3", "YhlP", "c", "Z", "YT", "bnsy", "5", "fcL", "L22G", "r8", "J", "4", "gnK"];

    try {
        const match = url.match(/https:\/\/c\.hopmarks\.com\/movie\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const movieId = match[1];

        for (let i = 0; i < services.length; i++) {
            for (let j = 0; j < secretKey.length; j++) {
                try {
                    let apiUrl = `https://rivestream.live/api/backendfetch?requestID=movieVideoProvider&id=${movieId}&service=${services[i]}&secretKey=${secretKey[j]}&proxyMode=noProxy`;

                    const responseText = await fetch(apiUrl);
                    const data = JSON.parse(responseText);

                    if (data) {
                        const hlsSource = data.data?.sources?.find(source => source.format === 'hls');
                        if (hlsSource?.url) return hlsSource.url;
                    }
                } catch (err) {
                    console.log(`Fetch error on endpoint https://rivestream.live/api/backendfetch?requestID=movieVideoProvider&id=${movieId}&service=${services[i]}&secretKey=${secretKey[j]}&proxyMode=noProxy for movie ${movieId}:`, err);
                }
            }
        }

        return null;
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}
