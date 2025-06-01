async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const apiUrl = `https://yummy-anime.ru/api/search?q=${encodedKeyword}&limit=20&offset=0`;

        const responseText = await fetchv2(apiUrl);
        const data = await responseText.json();

        const transformedResults = data.response.map(result => {
            return {
                title: result.title,
                image: `https:${result.poster.fullsize}`,
                href: `https://yummy-anime.ru/catalog/item/${result.anime_url}?id=${result.anime_id}`,
            };
        });

        console.log(JSON.stringify(transformedResults));
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/yummy-anime\.ru\/catalog\/item\/([^\/]+)\?id=([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const animeSlug = match[1];
        const animeId = match[2];

        const responseText = await fetchv2(`https://yummy-anime.ru/api/anime/${animeId}`);
        const animeData = await responseText.json();

        const data = animeData.response;

        const transformedResults = [{
            description: data.description || 'Без описания',
            aliases: `Все названия: ${data.other_titles.join(', ')}` || 'Без дополнительных названий',
            airdate: `Год выхода: ${data.year ? data.year : 'Без года выхода'}`,
        }];

        console.log(JSON.stringify(transformedResults));
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
        const match = url.match(/https:\/\/yummy-anime\.ru\/catalog\/item\/([^\/]+)\?id=([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const animeSlug = match[1];
        const animeId = match[2];

        const responseText = await fetchv2(`https://yummy-anime.ru/api/anime/${animeId}/videos`);
        const animeData = await responseText.json();

        const data = animeData.response.filter(result => result.data.dubbing === "Субтитры SovetRomantica");

        console.log(data);

        const transformedResults = data.map(result => {
            const episodeNumber = result.number;

            const epNum = parseInt(episodeNumber);

            return {
                href: `https:${result.iframe_url}`,
                number: epNum
            };
        });

        console.log(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        const responseText = await fetchv2(url);
        const data = await responseText.text();

        const regex = /"file":"(https:\/\/scu\d+\.sovetromantica\.com\/anime\/[^"]+\.m3u8)"/g;

        const matches = Array.from(data.matchAll(regex), m => m[1]);

        console.log(matches);
        return JSON.stringify("https://rr1---sn-vgqsknzr.googlevideo.com/videoplayback?expire=1748821083&ei=23M8aPaSB5frir4P57DYqQo&ip=104.224.88.15&id=f2cbe37e767fd2f0&itag=22&source=blogger&xpc=Egho7Zf3LnoBAQ%3D%3D&met=1748792283,&mh=5F&mm=31&mn=sn-vgqsknzr&ms=au&mv=m&mvi=1&pl=24&rms=au,au&susc=bl&eaua=Thhe-PGQWk0&mime=video/mp4&vprv=1&rqh=1&dur=1440.101&lmt=1744496454606743&mt=1748791754&txp=1311224&sparams=expire,ei,ip,id,itag,source,xpc,susc,eaua,mime,vprv,rqh,dur,lmt&sig=AJfQdSswRgIhAPMuo9c9fy53Os9t1wTMWdQMuj7Ci-bQdt5TmA1uHVUJAiEAsbayGFtNcM09NhiairbQJf6GCninJ6Xgqb-IxebHwok%3D&lsparams=met,mh,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIhAIvYFyNLxO91NnPhStfNx-5Kj1iaryyInBFE7ZRfTMtOAiAUdUpRho8KwgQ3tW-bik0jqgRjRwLPj0i8SqpiiovvAA%3D%3D");
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}