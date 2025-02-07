function searchResults(html) {
    // Create a new DOMParser instance to convert the HTML string into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const results = [];
  
    // Select all <a> elements with the specified classes.
    // Note: This selector matches <a> tags that have both "sc-blHHSb" and "tMXgB" classes.
    const items = doc.querySelectorAll('a.sc-blHHSb.tMXgB');
  
    items.forEach(item => {
      // Get the href attribute from the <a> tag
      const href = item.getAttribute('href');
      
      // Look for an <h5> element inside the <a> that has a title attribute starting with "Title:"
      let title = '';
      const h5 = item.querySelector('h5[title^="Title:"]');
      if (h5) {
        // Remove the "Title: " prefix from the title attribute value
        title = h5.getAttribute('title').replace('Title: ', '').trim();
      } else {
        // Fallback: Use the <a> tag's own title attribute if available
        title = item.getAttribute('title') || '';
      }
  
      // Look for an <img> element inside the <a> to get the image source
      const img = item.querySelector('img');
      const image = img ? img.getAttribute('src') : '';
  
      // Only push items that have both a title and a href
      if (title && href) {
        results.push({ title, image, href });
      }
    });
  
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