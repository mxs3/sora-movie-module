// 1. Search Results
async function searchResults(keyword) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      // Using the search endpoint with query parameter "query"
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Search API response:", data);
  
      // Expecting the search response to have:
      // { success: true, data: { media: [ { title, cover, url, ... }, ... ] } }
      if (!data.success || !data.data || !Array.isArray(data.data.media)) {
        throw new Error("Unexpected response structure: data.data.media missing");
      }
  
      const transformedResults = data.data.media.map(anime => ({
        title: anime.title,
        image: anime.cover,
        href: anime.url // This URL (e.g., "https://www3.animeflv.net/anime/isekai-quartet-2nd-season") is provided by the API
      }));
  
      return JSON.stringify(transformedResults);
    } catch (error) {
      console.error("Search error:", error.message);
      return JSON.stringify([{ title: "Error", image: "", href: "" }]);
    }
  }
  
  // 2. Extract Details
  async function extractDetails(url) {
    try {
      // Expecting a URL of the form:
      // https://www3.animeflv.net/anime/{slug}
      const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
      if (!match) {
        throw new Error("Invalid URL format");
      }
      const slug = match[1];
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Details API response:", data);
  
      // Expecting the details response structure similar to:
      // { success: true, data: { anime: { description, aliases, airdate, ... } } }
      if (!data.success || !data.data || !data.data.anime) {
        throw new Error("Unexpected details structure");
      }
  
      const anime = data.data.anime;
      const details = {
        description: anime.description || "No description available",
        aliases: anime.aliases || "No aliases available",
        airdate: anime.airdate || "Unknown airdate"
      };
  
      // Return the details in an array (as required)
      return JSON.stringify([details]);
    } catch (error) {
      console.error("Details error:", error.message);
      return JSON.stringify([{ description: "Error loading description", aliases: "N/A", airdate: "Unknown" }]);
    }
  }
  
  // 3. Extract Episodes
  async function extractEpisodes(url) {
    try {
      // Expecting a URL of the form:
      // https://www3.animeflv.net/anime/{slug}
      const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
      if (!match) {
        throw new Error("Invalid URL format");
      }
      const slug = match[1];
      // According to the docs, use the endpoint for episodes:
      // "/api/anime/episode/{slug}"
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Episodes API response:", data);
  
      // Expecting structure like:
      // { success: true, data: { episodes: [ { number, ... }, ... ] } }
      if (!data.success || !data.data || !Array.isArray(data.data.episodes)) {
        throw new Error("Unexpected episodes structure");
      }
  
      const transformedResults = data.data.episodes.map(episode => ({
        href: `https://www3.animeflv.net/anime/${slug}/episode/${episode.number}`,
        number: episode.number
      }));
  
      return JSON.stringify(transformedResults);
    } catch (error) {
      console.error("Episodes error:", error.message);
      return JSON.stringify([]);
    }
  }
  
  // 4. Extract Stream URL
  async function extractStreamUrl(url) {
    try {
      // Expecting a URL of the form:
      // https://www3.animeflv.net/anime/{slug}/episode/{number}
      const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)\/episode\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid URL format");
      }
      const slug = match[1];
      const episodeNumber = match[2];
      // Use the endpoint for a specific episode stream:
      // "/api/anime/{slug}/episode/{number}"
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episode/${episodeNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Stream API response:", data);
  
      // Expecting structure like:
      // { success: true, data: { sources: [ { type, url, ... }, ... ] } }
      if (!data.success || !data.data || !Array.isArray(data.data.sources)) {
        throw new Error("Unexpected stream structure");
      }
  
      // Look for an HLS source (adjust the type as needed)
      const hlsSource = data.data.sources.find(source => source.type === 'hls');
      return hlsSource ? hlsSource.url : null;
    } catch (error) {
      console.error("Stream URL error:", error.message);
      return null;
    }
  }
  