async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const apiUrl = `https://api2.mangalib.me/api/anime?q=${encodedKeyword}`;

        const responseText = await fetchv2(apiUrl);
        const data = await responseText.json();

        const transformedResults = data.data.map(result => {
            return {
                title: result.rus_name || result.eng_name || result.name,
                image: result.cover.default,
                href: `https://anilib.me/ru/anime/${result.slug_url}`
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
        const match = url.match(/https:\/\/anilib\.me\/ru\/anime\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const animeSlug = match[1];

        const responseText = await fetchv2(`https://api2.mangalib.me/api/anime/${animeSlug}?fields[]=background&fields[]=eng_name&fields[]=otherNames&fields[]=summary&fields[]=releaseDate&fields[]=type_id&fields[]=caution&fields[]=views&fields[]=close_view&fields[]=rate_avg&fields[]=rate&fields[]=genres&fields[]=tags&fields[]=teams&fields[]=user&fields[]=franchise&fields[]=authors&fields[]=publisher&fields[]=userRating&fields[]=moderated&fields[]=metadata&fields[]=metadata.count&fields[]=metadata.close_comments&fields[]=anime_status_id&fields[]=time&fields[]=episodes&fields[]=episodes_count&fields[]=episodesSchedule`);
        const animeData = await responseText.json();

        const data = animeData.data;

        const transformedResults = [{
            description: data.summary || 'Без описания',
            aliases: `Длительность: ${data.time.formated}` || 'Без длительности',
            airdate: `Дата выхода: ${data.releaseDateString ? data.releaseDateString : 'Без даты'}`,
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
        const match = url.match(/https:\/\/anilib\.me\/ru\/anime\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const animeSlug = match[1];

        const responseText = await fetchv2(`https://api2.mangalib.me/api/episodes?anime_id=${animeSlug}`);
        const data = await responseText.json();

        const transformedResults = data.data.map(result => {
            return {
                href: `https://anilib.me/ru/anime/20591--ore-dake-level-up-na-ken-anime/watch?episode=${result.id}`,
                number: result.item_number,
                title: result.name
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
        const match = url.match(/https:\/\/anilib\.me\/ru\/anime\/([^\/]+)\/watch\?episode=([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        // const animeSlug = match[1];
        const episodeId = match[2];

        const responseText = await fetch(`https://api2.mangalib.me/api/episodes/${episodeId}`);
        const data = await responseText.json();

        const animePlayers = data.data.players;

        let streams = [];
        const subtitles = animePlayers[0].subtitles.find(subtitle => subtitle.format === "vtt");

        for (let i = 0; i < animePlayers.length; i++) {
            if (animePlayers[i].player === "Animelib" && animePlayers[i].translation_type.label === "Субтитры") {
                streams.push(animePlayers[i].src);
                break;
            }
        }

        const result = {
            stream: streams,
            subtitles: subtitles ? subtitles.src : ""
        };

        console.log(result);
        return JSON.stringify(result);
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}

extractStreamUrl(`https://anilib.me/ru/anime/20591--ore-dake-level-up-na-ken-anime/watch?episode=116858`);