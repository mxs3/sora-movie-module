// Search for anime by keyword
async function searchResults(keyword) {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const searchUrl = `https://anime.uniquestream.net/api/v1/search?query=${encodedKeyword}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    // Assume that the search API returns an array directly.
    // If not, adjust this line (e.g., const seriesArray = data.results || data.series;)
    const seriesArray = Array.isArray(data) ? data : data.series;
    
    // Create an array of URLs to fetch the first episode details for each series.
    const firstEpisodesOfResults = seriesArray.map(item =>
      `https://anime.uniquestream.net/api/v1/series/${item.content_id}`
    );
    
    // Fetch all series details in parallel.
    const firstEpisodesResponses = await Promise.all(
      firstEpisodesOfResults.map(url => fetch(url))
    );
    const firstEpisodesData = await Promise.all(
      firstEpisodesResponses.map(response => response.json())
    );
    
    // Map over the series array using the index to get the corresponding episode data.
    const transformedResults = seriesArray.map((item, index) => {
      // Check that firstEpisodesData[index] has an "episode" property.
      const episodeData = firstEpisodesData[index];
      const episodeId = episodeData && episodeData.episode 
                        ? episodeData.episode.content_id 
                        : item.content_id; // fallback
      
      return {
        title: item.title,
        image: item.image,
        href: `https://anime.uniquestream.net/watch/${episodeId}`
      };
    });
    
    return JSON.stringify(transformedResults);
  } catch (error) {
    console.error('Search fetch error:', error);
    return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
  }
}

// Extract content/episode details
async function extractDetails(url) {
  try {
    // Extract the content_id from a URL like "https://anime.uniquestream.net/watch/Y98VK4SD"
    const match = url.match(/https:\/\/anime\.uniquestream\.net\/watch\/(.+)$/);
    if (!match) throw new Error('Invalid URL');
    const content_id = match[1];

    const detailsUrl = `https://anime.uniquestream.net/api/v1/content/${content_id}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    // Transform details into our desired format.
    const transformed = [{
      title: data.title,
      description: data.description || 'No description available',
      episodeNumber: data.episode_number,
      duration: `${Math.floor(data.duration_ms / 60000)} min`,
      seriesTitle: data.series_title,
      seasonTitle: data.season_title,
      image: data.image
    }];
    
    return JSON.stringify(transformed);
  } catch (error) {
    console.error('Details fetch error:', error);
    return JSON.stringify([{
      title: '',
      description: 'Error loading description',
      episodeNumber: null,
      duration: 'Unknown',
      seriesTitle: '',
      seasonTitle: '',
      image: ''
    }]);
  }
}

// Extract a list of episodes (current and next) from the content details
async function extractEpisodes(url) {
  try {
    const match = url.match(/https:\/\/anime\.uniquestream\.net\/watch\/(.+)$/);
    if (!match) throw new Error('Invalid URL');
    const content_id = match[1];

    const detailsUrl = `https://anime.uniquestream.net/api/v1/content/${content_id}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    let episodes = [];
    // Current episode
    episodes.push({
      href: url,
      number: data.episode_number,
      title: data.title
    });
    
    // If there is a "next" episode provided, add it.
    if (data.next) {
      episodes.push({
        href: `https://anime.uniquestream.net/watch/${data.next.content_id}`,
        number: data.next.episode_number,
        title: data.next.title
      });
    }
    
    return JSON.stringify(episodes);
  } catch (error) {
    console.error('Episodes fetch error:', error);
    return JSON.stringify([]);
  }
}

// Extract the DASH stream URL for an episode.
// The locale parameter defaults to "ja-JP".
async function extractStreamUrl(url, locale = 'ja-JP') {
  try {
    const match = url.match(/https:\/\/anime\.uniquestream\.net\/watch\/(.+)$/);
    if (!match) throw new Error('Invalid URL');
    const content_id = match[1];

    const mediaUrl = `https://anime.uniquestream.net/api/v1/episode/${content_id}/media/dash/${locale}`;
    const response = await fetch(mediaUrl);
    const data = await response.json();
    
    // Return the main DASH playlist URL if available.
    return data.dash ? data.dash.playlist : null;
  } catch (error) {
    console.error('Stream URL fetch error:', error);
    return null;
  }
}
