async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://frembed.xyz/api/public/search?query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        console.log(data);

        const movieData = data.movies.map(movie => {
            return {
                title: movie.title || movie.name || movie.original_title,
                image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                href: `https://play.frembed.xyz/api/film.php?id=${movie.id}`
            }
        });

        console.log('Search results:', JSON.stringify(movieData));
        console.log('Search results:', movieData);

        return JSON.stringify(movieData);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/play\.frembed\.xyz\/api\/film\.php\?id=([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");
        const movieId = match[1];
        const responseText = await fetch(`https://frembed.xyz/api/public/movies/${movieId}`);
        const data = JSON.parse(responseText);

        const transformedResults = [{
            description: data.overview || 'N/A',
            aliases: 'N/A',
            airdate: 'N/A'
        }];

        console.log(JSON.stringify(transformedResults));

        return transformedResults;
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
        const match = url.match(/https:\/\/play\.frembed\.xyz\/api\/film\.php\?id=([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");
        const movieId = match[1];

        return JSON.stringify([
            { href: `https://play.frembed.xyz/api/film.php?id=${movieId}`, number: 1, title: "Full Movie" }
        ]);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/play\.frembed\.xyz\/api\/film\.php\?id=([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");
        const movieId = match[1];

        return `https://streamtales.cc:8443/videos/${movieId}.mp4`;
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}
