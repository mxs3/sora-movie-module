// Search for anime by keyword
async function searchResults(keyword) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const searchUrl = `https://anime.uniquestream.net/api/v1/search?query=${encodedKeyword}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      const firstEpisodeUrl = `https://anime.uniquestream.net/api/v1/series/${data.series[0].content_id}`;
      const firstEpisodeResponse = await fetch(firstEpisodeUrl);
      const firstEpisodeData = await firstEpisodeResponse.json();

      const transformedResults = data.series.map(item => ({
        title: item.title,
        image: item.image,
        href: `https://anime.uniquestream.net/watch/${firstEpisodeData.episode.content_id}`
      }));
      
      return JSON.stringify(transformedResults);
    } catch (error) {
      console.error('Search fetch error:', error);
      return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}