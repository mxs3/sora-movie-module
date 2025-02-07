function searchResults(html) {
    const results = [];
    
    // Match each list item that contains a search result.
    const liRegex = /<li\s+class="TPostMv">([\s\S]*?)<\/li>/g;
    let liMatch;
    
    while ((liMatch = liRegex.exec(html)) !== null) {
      const liContent = liMatch[0];
      
      // Extract the <a> tag inside the list item.
      // This regex grabs the href and title from the <a> tag.
      const aRegex = /<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
      const aMatch = liContent.match(aRegex);
      
      if (aMatch) {
        const href = aMatch[1].trim();
        const title = aMatch[2].trim();
        
        // Extract image URL from the <img> tag inside the <a>.
        const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
        const imgMatch = liContent.match(imgRegex);
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
  
function extractDetails(html) {
   const details = [];

   const descriptionMatch = html.match(/<p class="sm:text-\[1\.05rem\] leading-loose text-justify">([\s\S]*?)<\/p>/);
   let description = descriptionMatch ? descriptionMatch[1].trim() : '';

   const airdateMatch = html.match(/<td[^>]*title="([^"]+)">[^<]+<\/td>/);
   let airdate = airdateMatch ? airdateMatch[1].trim() : '';

   if (description && airdate) {
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
    const htmlRegex = /<a\s+[^>]*href="([^"]*?\/episode\/[^"]*?)"[^>]*>[\s\S]*?الحلقة\s+(\d+)[\s\S]*?<\/a>/gi;
    const plainTextRegex = /الحلقة\s+(\d+)/g;

    let matches;

    if ((matches = html.match(htmlRegex))) {
        matches.forEach(link => {
            const hrefMatch = link.match(/href="([^"]+)"/);
            const numberMatch = link.match(/الحلقة\s+(\d+)/);
            if (hrefMatch && numberMatch) {
                const href = hrefMatch[1];
                const number = numberMatch[1];
                episodes.push({
                    href: href,
                    number: number
                });
            }
        });
    } 
    else if ((matches = html.match(plainTextRegex))) {
        matches.forEach(match => {
            const numberMatch = match.match(/\d+/);
            if (numberMatch) {
                episodes.push({
                    href: null, 
                    number: numberMatch[0]
                });
            }
        });
    }

    console.log(episodes);
    return episodes;
}

async function extractStreamUrl(html) {
    try {
        const sourceMatch = html.match(/data-source="([^"]+)"/);
        const embedUrl = sourceMatch?.[1]?.replace(/&amp;/g, '&');
        if (!embedUrl) return null;

        const response = await fetch(embedUrl);
        const data = await response;
        const videoUrl = data.match(/src:\s*'(https:\/\/[^']+\.mp4[^']*)'/)?.[1];
        console.log(videoUrl);
        return videoUrl || null;
    } catch (error) {
        return null;
    }
}