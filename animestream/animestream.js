// Search for anime by keyword
async function searchResults(keyword) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const searchUrl = `https://anime.uniquestream.net/api/v1/search?query=${encodedKeyword}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      const firstEpisodesOfResults = data.series.map(item => `https://anime.uniquestream.net/api/v1/series/${item.content_id}`);
      const firstEpisodesResponses = await Promise.all(firstEpisodesOfResults.map(url => fetch(url)));
      const firstEpisodesData = await Promise.all(firstEpisodesResponses.map(response => response.json()));

      const transformedResults = data.series.map(item => ({
        title: item.title,
        image: item.image,
        href: `https://anime.uniquestream.net/watch/${firstEpisodesData.episode.content_id}`
      }));
      
      return JSON.stringify(transformedResults);
    } catch (error) {
      console.error('Search fetch error:', error);
      return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}