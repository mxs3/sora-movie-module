// 1. Search Results
async function searchResults(keyword) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`, {
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Search API Response:", data); // Debug log
      
      if (!data.success || !data.data || !Array.isArray(data.data.media)) {
        throw new Error("Unexpected response structure");
      }
      
      const transformedResults = data.data.media.map(anime => ({
        title: anime.title || "Unknown Title",
        image: anime.cover || "",
        href: anime.url || "#"
      }));
      
      if (transformedResults.length === 0) {
        return JSON.stringify([{ title: "No results found", image: "", href: "" }]);
      }
      
      return JSON.stringify(transformedResults);
      
    } catch (error) {
      console.error("Search error:", error);
      // Return the error message as the title so you can see what's failing.
      return JSON.stringify([{ title: error.message, image: "", href: "" }]);
    }
  }
  
  // 2. Extract Details
  async function extractDetails(url) {
    try {
      // Expecting a URL like: https://www3.animeflv.net/anime/{slug}
      const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
      if (!match) {
        throw new Error("Invalid URL format");
      }
      const slug = match[1];
      
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}`, {
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Details API Response:", data);
      
      if (!data.success || !data.data || !data.data.anime) {
        throw new Error("Unexpected details response structure");
      }
      
      const anime = data.data.anime;
      const details = {
        description: anime.description || "No description available",
        aliases: anime.aliases || "No aliases available",
        airdate: anime.airdate || "Unknown airdate"
      };
      
      return JSON.stringify([details]);
    } catch (error) {
      console.error("Details error:", error);
      return JSON.stringify([{ description: error.message, aliases: "N/A", airdate: "Unknown" }]);
    }
  }
  
  // 3. Extract Episodes
  async function extractEpisodes(url) {
    try {
      // Expecting a URL like: https://www3.animeflv.net/anime/{slug}
      const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
      if (!match) {
        throw new Error("Invalid URL format");
      }
      const slug = match[1];
      
      // According to the docs, use the endpoint: /api/anime/episode/{slug}
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${slug}`, {
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Episodes API Response:", data);
      
      if (!data.success || !data.data || !Array.isArray(data.data.episodes)) {
        throw new Error("Unexpected episodes response structure");
      }
      
      const transformedResults = data.data.episodes.map(episode => ({
        href: `https://www3.animeflv.net/anime/${slug}/episode/${episode.number}`,
        number: episode.number
      }));
      
      return JSON.stringify(transformedResults);
      
    } catch (error) {
      console.error("Episodes error:", error);
      return JSON.stringify([]);
    }
  }
  
  // 4. Extract Stream URL
  async function extractStreamUrl(url) {
    try {
      // Expecting a URL like: https://www3.animeflv.net/anime/{slug}/episode/{number}
      const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)\/episode\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid URL format");
      }
      const slug = match[1];
      const episodeNumber = match[2];
      
      // Use the endpoint: /api/anime/{slug}/episode/{number}
      const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${slug}/episode/${episodeNumber}`, {
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Stream API Response:", data);
      
      if (!data.success || !data.data || !Array.isArray(data.data.sources)) {
        throw new Error("Unexpected stream response structure");
      }
      
      // Find an HLS source (adjust the source type if needed)
      const hlsSource = data.data.sources.find(source => source.type === 'hls');
      return hlsSource ? hlsSource.url : null;
    } catch (error) {
      console.error("Stream URL error:", error);
      return null;
    }
  }
  