// Searches for anime using the Animeflv API with the provided JSON structure
async function searchResults(keyword) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`);
      const json = JSON.parse(response);
  
      // Check if the API call was successful
      if (!json.success) {
        throw new Error('API response indicates failure');
      }
  
      // The "media" array holds the search results
      const media = json.data.media;
  
      // Map the media items to your desired format
      const transformedResults = media.map(item => ({
        title: item.title,         // e.g. "Naruto"
        image: item.cover,         // e.g. "https://animeflv.net/uploads/animes/covers/2.jpg"
        href: item.url             // e.g. "https://www3.animeflv.net/anime/naruto"
      }));
  
      return JSON.stringify(transformedResults);
    } catch (error) {
      console.error('Search fetch error:', error);
      return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
  }
  
  
  async function extractDetails(url) {
    try {
        const match = url.match(/https?:\/\/(?:www\d*\.)?animeflv\.net\/anime\/(.+)$/);
        if (!match) throw new Error('Invalid URL format');
        const slug = match[1];

        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.success) {
            throw new Error('API response indicates failure');
        }

        // Access the nested data correctly
        const animeData = data.data || {};

        // Handle potential snake_case keys from the API
        const synopsis = animeData.synopsis || animeData.sypnosis || 'No description available';
        const altTitles = animeData.altTitles || animeData.alt_titles || [];
        const releaseDate = animeData.releaseDate || animeData.release_date || 'Unknown';

        const transformedResults = [{
            description: synopsis,
            aliases: altTitles.join(', ') || 'No alternative titles',
            airdate: releaseDate
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error('Details fetch error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'No alternative titles',
            airdate: 'Unknown'
        }]);
    }
}

  
  // Extract the list of episodes for an anime
  async function extractEpisodes(url) {
    try {
      // Again, assume the anime URL follows the pattern: https://animeflv.ahmedrangel.com/anime/{slug}
      const match = url.match(/https:\/\/animeflv\.ahmedrangel\.com\/anime\/(.+)$/);
      if (!match) throw new Error('Invalid URL format');
      const slug = match[1];
  
      // Fetch episodes via the provided endpoint.
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${slug}`);
      const data = await response.json();
  
      // Assume data.episodes is an array with episode details.
      // For each episode, we expect a number or identifier that we can use to build its URL.
      const transformedResults = data.episodes.map(episode => ({
        href: `https://animeflv.ahmedrangel.com/anime/${slug}/episode/${episode.number}`,
        number: episode.number
      }));
  
      return JSON.stringify(transformedResults);
    } catch (error) {
      console.log('Episodes fetch error:', error);
      return JSON.stringify([]);
    }
  }
  
  // Extract the streaming URL for an episode
  async function extractStreamUrl(url) {
    try {
      // Assume the episode URL follows the pattern: https://animeflv.ahmedrangel.com/anime/{slug}/episode/{number}
      const match = url.match(/https:\/\/animeflv\.ahmedrangel\.com\/anime\/(.+)\/episode\/(.+)$/);
      if (!match) throw new Error('Invalid URL format');
      const slug = match[1];
      const number = match[2];
  
      // Fetch streaming information via the corresponding endpoint.
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episode/${number}`);
      const data = await response.json();
  
      // Assume data.sources is an array containing streaming sources.
      // Here we look for an HLS source.
      const hlsSource = data.sources && data.sources.find(source => source.type === 'hls');
  
      return hlsSource ? hlsSource.url : null;
    } catch (error) {
      console.log('Stream URL fetch error:', error);
      return null;
    }
  }
  