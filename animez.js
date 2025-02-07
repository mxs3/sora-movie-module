function searchResults(html) {
    const results = [];
    
    // Regex to capture each list item containing a search result.
    const liRegex = /<li\s+class="TPostMv">([\s\S]*?)<\/li>/g;
    let liMatch;
    
    while ((liMatch = liRegex.exec(html)) !== null) {
      const liContent = liMatch[0];
      
      // Extract the <a> tag's href and title attributes.
      const aRegex = /<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
      const aMatch = liContent.match(aRegex);
      
      if (aMatch) {
        let href = aMatch[1].trim();
        const title = aMatch[2].trim();
        
        // Prepend the base URL if href is relative.
        if (!/^https?:\/\//i.test(href)) {
          href = "https://animez.org" + (href.startsWith("/") ? "" : "/") + href;
        }
        
        // Extract image URL from the <img> tag.
        const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
        const imgMatch = liContent.match(imgRegex);
        let imageUrl = imgMatch ? imgMatch[1].trim() : '';
        
        // Prepend the base URL for relative image URLs.
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          imageUrl = "https://animez.org" + (imageUrl.startsWith("/") ? "" : "/") + imageUrl;
        }
        
        results.push({
          title: title,
          image: imageUrl,
          href: href
        });
      }
    }
    
    return results;
}
  
function extractDetails(html) {
    const details = [];
    // Extract the description from the div with id "summary_shortened"
    const descriptionMatch = html.match(/<div\s+id="summary_shortened"[^>]*>([\s\S]*?)<\/div>/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // AnimeZ example does not provide an airdate, so we'll use "N/A"
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
  
function extractEpisodes(html) {
    const episodes = [];
    // Use a regex to match each <li> element for episodes.
    // The pattern grabs the href from the <a> tag and its inner text (the episode number)
    const liRegex = /<li\s+class="wp-manga-chapter[^"]*"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
    let match;
    while ((match = liRegex.exec(html)) !== null) {
      let href = match[1].trim();
      // Prepend the base URL if href is relative.
      if (!/^https?:\/\//i.test(href)) {
        href = "https://animez.org" + (href.startsWith("/") ? "" : "/") + href;
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
  
function extractStreamUrl(html) {
    // Look for the <source> element inside the <video> that contains a .m3u8 file.
    const sourceMatch = html.match(/<source\s+src="([^"]+\.m3u8)"\s+type="application\/x-mpegURL"/i);
    let streamUrl = sourceMatch ? sourceMatch[1].trim() : null;
    // Prepend the base URL if the stream URL is relative.
    if (streamUrl && !/^https?:\/\//i.test(streamUrl)) {
      streamUrl = "https://animez.org" + (streamUrl.startsWith("/") ? "" : "/") + streamUrl;
    }
    console.log(streamUrl);
    return streamUrl;
}