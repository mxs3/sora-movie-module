async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://api.amvstr.me/api/v2/search?q=${encodedKeyword}`);
        const data = await response.json();

        // Transform the API response based on the log structure
        const transformedResults = data.results.map(anime => ({
            title: anime.title.english || anime.title.romaji || anime.title.userPreferred,
            image: anime.coverImage.large || anime.coverImage.medium,
            href: `https://api.amvstr.me/api/v2/info/${anime.id}`
        }));

        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
  try {
      const animeId = url.match(/amvstr\.me\/anime\/([^?]+)/)[1];
      const response = await fetch(`https://api.amvstr.me/api/v2/anime/${animeId}`);
      const data = await response.json();

      return JSON.stringify([{
          description: data.data.description || 'No description available',
          aliases: `Duration: ${data.data.duration || 'Unknown'}`,
          airdate: `Aired: ${data.data.aired || 'Unknown'}`
      }]);
  } catch (error) {
      console.log('Details error:', error);
      return JSON.stringify([{
          description: 'Error loading description',
          aliases: 'Duration: Unknown',
          airdate: 'Aired: Unknown'
      }]);
  }
}

async function extractEpisodes(url) {
  try {
      const animeId = url.match(/amvstr\.me\/anime\/([^?]+)/)[1];
      const response = await fetch(`https://api.amvstr.me/api/v2/episodes/${animeId}`);
      const data = await response.json();

      const transformedResults = data.data.episodes
          .filter(episode => episode.language === 'dub')
          .map(episode => ({
              href: `https://anitaku.bz/${episode.id}`,
              number: episode.number
          }));

      return JSON.stringify(transformedResults);
  } catch (error) {
      console.log('Episodes error:', error);
      return JSON.stringify([]);
  }
}

async function extractStreamUrl(url) {
  try {
      const episodeId = url.match(/amvstr\.me\/watch\/([^?]+)/)[1];
      const response = await fetch(`https://api.amvstr.me/api/v2/stream/${episodeId}`);
      const data = await response.json();

      const hlsSource = data.data.sources.find(source => source.type === 'hls');
      return hlsSource?.url || null;
  } catch (error) {
      console.log('Stream error:', error);
      return null;
  }
}