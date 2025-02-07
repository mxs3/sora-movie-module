function searchResults(html) {
    const results = [];
    // Use a more restrictive regex that ensures we match the <a> tag properly.
    const itemRegex = /<a\b(?=[^>]*\bclass="sc-blHHSb tMXgB")(?=[^>]*\bhref="([^"]+)")[^>]*>([\s\S]*?)<\/a>/g;
    let match;
  
    while ((match = itemRegex.exec(html)) !== null) {
      const href = match[1].trim();
      const innerHtml = match[2];
  
      // Extract title from an inner <h5> element (if present)
      let title = '';
      const titleRegex = /<h5\b[^>]*\btitle="Title:\s*([^"]+)"[^>]*>[\s\S]*?<\/h5>/;
      const titleMatch = titleRegex.exec(innerHtml);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // Fallback: use the <a> tag's title attribute.
        const aTitleRegex = /<a\b[^>]*\btitle="([^"]+)"[^>]*>/;
        const aTitleMatch = aTitleRegex.exec(match[0]);
        if (aTitleMatch) {
          title = aTitleMatch[1].trim();
        }
      }
  
      // Extract image URL from an <img> tag inside the <a>
      let image = '';
      const imgRegex = /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/;
      const imgMatch = imgRegex.exec(match[0]);
      if (imgMatch) {
        image = imgMatch[1].trim();
      }
  
      if (title && href) {
        results.push({ title, image, href });
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