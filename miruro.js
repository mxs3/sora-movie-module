function searchResults(html) {
    const results = [];
    
    // Use lookahead assertions to ensure the <a> tag contains the class and href attributes,
    // regardless of their order.
    const itemRegex = /<a(?=[^>]*\bclass="sc-blHHSb tMXgB")(?=[^>]*\bhref="([^"]+)")[^>]*>([\s\S]*?)<\/a>/g;
    let match;
  
    while ((match = itemRegex.exec(html)) !== null) {
      // The first capturing group contains the href value.
      const href = match[1].trim();
      // The second capturing group contains the inner HTML of the <a> element.
      const innerHtml = match[2];
  
      // Look for the <h5> element that has a title attribute starting with "Title:"
      const titleRegex = /<h5[^>]*\btitle="Title:\s*([^"]+)"[^>]*>[\s\S]*?<\/h5>/;
      const titleMatch = titleRegex.exec(innerHtml);
      let title = '';
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // Fallback: If no <h5> is found, try to extract the title from the <a> tag itself.
        const aTitleRegex = /<a[^>]*\btitle="([^"]+)"[^>]*>/;
        const aTitleMatch = aTitleRegex.exec(match[0]);
        if (aTitleMatch) {
          title = aTitleMatch[1].trim();
        }
      }
  
      // Look for an <img> element and extract its src attribute
      const imgRegex = /<img[^>]*\bsrc="([^"]+)"[^>]*>/;
      const imgMatch = imgRegex.exec(match[0]);
      const image = imgMatch ? imgMatch[1].trim() : '';
  
      // Only add the result if both title and href exist.
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