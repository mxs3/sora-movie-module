// Search Results – Extracts title, image, and href from each search result item.
function searchResults(html) {
  const results = [];
  // Match each result item container. (AnimeOwl search results are wrapped in a div with class "result-item position-relative anime-vertical")
  const itemRegex = /<div\s+class="result-item\s+position-relative\s+anime-vertical">([\s\S]*?)<\/div>/g;
  let match;
  
  while ((match = itemRegex.exec(html)) !== null) {
    const itemContent = match[0];
    
    // Extract the anime URL and title from the anchor with class "title-link"
    // Example:
    // <a class="title-link ..."
    //    href="https://animeowl.live/anime/naruto" title="Watch Naruto on animeowl">
    //    <h3 class="anime-title ...">Naruto</h3>
    // </a>
    const titleAnchorRegex = /<a\s+class="title-link[^"]*"\s+href="([^"]+)"\s+title="[^"]*"[^>]*>[\s\S]*?<h3\s+class="anime-title[^"]*">([\s\S]*?)<\/h3>/i;
    const titleMatch = itemContent.match(titleAnchorRegex);
    
    if (titleMatch) {
      const href = titleMatch[1].trim(); // Full URL should already be provided.
      const title = titleMatch[2].trim();
      
      // Extract the image URL from the "post-thumb" anchor.
      // Example:
      // <a class="post-thumb ...">
      //    <img ... data-src="https://animeowl.live/thumbnail/naruto.jpg?v=1725958145" ...>
      // </a>
      const imgRegex = /<a\s+class="post-thumb[^"]*">[\s\S]*?<img\s+[^>]*(?:data-src|src)="([^"]+)"[^>]*>/i;
      const imgMatch = itemContent.match(imgRegex);
      const imageUrl = imgMatch ? imgMatch[1].trim() : '';
      
      results.push({
        title: title,
        image: imageUrl,
        href: href
      });
    }
  }
  
  return results;
}
  
// Details – Extracts the description from the details page.
// (If AnimeOwl’s details page uses a different structure than AnimeZ, adjust this regex accordingly.)
function extractDetails(html) {
  const details = [];
  // Look for the description inside a div with id "summary_shortened"
  const descriptionMatch = html.match(/<div\s+id=["']summary_shortened["'][^>]*>([\s\S]*?)<\/div>/i);
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
  
  // AnimeOwl pages might not provide an airdate – so we use "N/A"
  const airdate = "N/A";
  
  if (description) {
    details.push({
      description: description,
      aliases: 'N/A',
      airdate: airdate
    });
  }
  console.log(details);
  return details;
}
  
// Episodes – Extracts episode links and numbers from the episodes list.
// (If the details page’s episodes list structure differs from AnimeZ, adjust the regex accordingly.)
function extractEpisodes(html) {
  const episodes = [];
  // This regex targets each list item for an episode.
  // Example expected format:
  // <li class="wp-manga-chapter"><a href="/naruto-9467/epi-1-116552/">1</a>...</li>
  const liRegex = /<li\s+class=["']wp-manga-chapter[^"']*["'][^>]*>[\s\S]*?<a\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
  let match;
  
  while ((match = liRegex.exec(html)) !== null) {
    let href = match[1].trim();
    // Prepend the AnimeOwl base URL if the href is relative.
    if (!/^https?:\/\//i.test(href)) {
      href = "https://animeowl.live" + (href.startsWith("/") ? "" : "/") + href;
    }
    const number = match[2].trim();
    episodes.push({
      href: href,
      number: number
    });
  }
  console.log(episodes);
  return episodes;
}
  
// Stream URL – Extracts the .m3u8 URL from a <source> element inside a <video> tag.
// Adjusts the URL by prepending the base URL if necessary.
async function extractStreamUrl(html) {
  try {
    // Look for a <source> element with a .m3u8 file.
    const sourceMatch = html.match(/<source\s+src=["']([^"']+\.m3u8)["']\s+type=["']application\/x-mpegURL["']/i);
    let streamUrl = sourceMatch ? sourceMatch[1].trim() : null;
    
    // Prepend AnimeOwl's base URL if the stream URL is relative.
    if (streamUrl && !/^https?:\/\//i.test(streamUrl)) {
      streamUrl = "https://animeowl.live" + (streamUrl.startsWith("/") ? "" : "/") + streamUrl;
    }
    
    console.log(streamUrl);
    return streamUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}
