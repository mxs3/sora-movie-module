function searchResults(html) {
    const results = [];
    // Match all <a> tags (non-greedy match for inner content)
    const aRegex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
    let match;
  
    while ((match = aRegex.exec(html)) !== null) {
      const aTag = match[0];
      
      // Only process this <a> if it contains the required class string.
      if (!aTag.includes('class="sc-blHHSb tMXgB"')) continue;
      
      // Extract the href attribute from the <a> tag.
      const hrefMatch = /href="([^"]+)"/i.exec(aTag);
      const href = hrefMatch ? hrefMatch[1].trim() : '';
      
      // Extract the title.
      // First, try to extract from an inner <h5> tag with title="Title: ..."
      let title = "";
      const h5Match = /<h5\b[^>]*\btitle="Title:\s*([^"]+)"[^>]*>/i.exec(aTag);
      if (h5Match) {
        title = h5Match[1].trim();
      } else {
        // Fallback: use the <a> tag's own title attribute.
        const aTitleMatch = /title="([^"]+)"/i.exec(aTag);
        if (aTitleMatch) {
          title = aTitleMatch[1].trim();
        }
      }
      
      // Extract the image source from an <img> tag inside the <a>
      let image = "";
      const imgMatch = /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/i.exec(aTag);
      if (imgMatch) {
        image = imgMatch[1].trim();
      }
      
      // Only add entries that have both a title and an href.
      if (title && href) {
        results.push({
          title: title,
          image: image,
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