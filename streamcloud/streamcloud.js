async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const apiUrl = `https://streamcloud.sx/data/browse/?lang=2&keyword=${encodedKeyword}`;

        const responseText = await soraFetch(apiUrl);
        const data = await responseText.json();

        const transformedResults = data.movies.map(result => {
            const slug = generateSlug(result.title);

            const title = result.title;
            const href = `https://streamcloud.sx/watch/${slug}/${result._id}/1`;
            const image = `https://image.tmdb.org/t/p/w500${result.poster_path}`;

            return { title, image, href };
        });

        sendLog(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        sendLog('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/streamcloud\.sx\/watch\/([^\/]+)\/([^\/]+)\/1/);
        if (!match) throw new Error("Invalid URL format");

        const slug = match[1];
        const movieId = match[2];
        const apiUrl = `https://streamcloud.sx/data/watch/?_id=${movieId}`;

        const responseText = await soraFetch(apiUrl);
        const data = await responseText.json();

        const aliases = `
Country: ${data.country ? data.country : 'Unknown'}
Genres: ${data.genres ? data.genres : 'Unknown'}
Directors: ${data.directors ? data.directors : 'Unknown'}
        `.trim();

        const description = data.storyline || 'No description available';
        const airdate = `Released: ${data.air_date_season ? data.air_date_season : 'Unknown'}`;

        const transformedResults = [{
            description,
            aliases,
            airdate
        }];

        sendLog(transformedResults);
        return JSON.stringify(transformedResults);
    } catch (error) {
        sendLog('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired/Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/streamcloud\.sx\/watch\/([^\/]+)\/([^\/]+)\/1/);
        if (!match) throw new Error("Invalid URL format");

        const slug = match[1];
        const movieId = match[2];

        const apiUrl = `https://streamcloud.sx/data/watch/?_id=${movieId}`;

        const responseText = await soraFetch(apiUrl);
        const data = await responseText.json();
        
        if(data.tv === 0) {
            const movie = [{ href: `https://streamcloud.sx/watch/${slug}/${movieId}/1`, number: 1, title: "Full Movie" }];

            sendLog(movie);
            return JSON.stringify(movie);
        } else if(data.tv === 1) {            
            let allEpisodes = [];
            for (const episode of data.tmdb.tv.tv_seasons_details.episodes) {
                allEpisodes.push({
                    href: `https://streamcloud.sx/watch/${slug}/${movieId}/${episode.episode_number}`,
                    number: episode.episode_number,
                    title: episode.name
                });
            }
            
            sendLog(allEpisodes);
            return JSON.stringify(allEpisodes);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        sendLog('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/streamcloud\.sx\/watch\/([^\/]+)\/([^\/]+)\/1/);
        if (!match) throw new Error("Invalid URL format");

        const slug = match[1];
        const movieId = match[2];

        const apiUrl = `https://streamcloud.sx/data/watch/?_id=${movieId}`;

        const response = await soraFetch(apiUrl);
        const data = await response.json();

        let providers = {};

        for (const stream of data.streams) {
          // if stream has deleted and deleted is 1, skip it
          if (stream.deleted === 1 || stream.e == 1) {
            sendLog(`Skipping deleted or expired stream: ${stream.stream}`);
            continue;
          }
            const streamUrl = stream.stream;
            // get the hostname of the stream URL using regex, but without the extension
            const hostnameMatch = streamUrl.match(/https?:\/\/([^\/]+)/);
            if (!hostnameMatch) {
              sendLog(`Invalid stream URL: ${streamUrl}`);
              continue;
            }
                        // remove the extension from the hostname
            let hostname = hostnameMatch[1].replace(/\.[^/.]+$/, "");

            // if is dood, its doodstream
            if (hostname.includes("dood")) {
                // hostname = "doodstream";
            }


            providers[streamUrl] = hostname;
        }

        sendLog("Providers found: " + JSON.stringify(providers));
        if (Object.keys(providers).length === 0) {
            sendLog("No valid providers found, returning error");
            return JSON.stringify([{ provider: "Error", link: "" }]);
        }

        let streams = [];
        try {
            streams = await multiExtractor(providers);
            let returnedStreams = {
                streams: streams,
            };
            
            sendLog(returnedStreams);
            return JSON.stringify(returnedStreams);
        } catch (error) {
            return JSON.stringify([{ provider: "Error2", link: "" }]);
        }
    } catch (error) {
        sendLog('Fetch error in extractStreamUrl:', error);
        return null;
    }
}


function generateSlug(title) {
    return title
        .toLowerCase()                      // Convert to lowercase
        .normalize('NFD')                   // Normalize accented characters
        .replace(/[\u0300-\u036f]/g, '')    // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '')       // Remove non-alphanumeric characters except spaces and hyphens
        .trim()                             // Remove leading/trailing whitespace
        .replace(/\s+/g, '-')               // Replace spaces with hyphens
        .replace(/-+/g, '-');               // Collapse multiple hyphens
}


// Debugging function to send logs
async function sendLog(message) {
    // send http://192.168.2.130/sora-module/log.php?action=add&message=message
    console.log(message);

    await fetch('http://192.168.2.130/sora-module/log.php?action=add&message=' + encodeURIComponent(message))
    .catch(error => {
        console.error('Error sending log:', error);
    });
}

/* Replace your extractStreamUrl function with the script below */

/**
 * @name global_extractor.js
 * @description Global extractor to be used in Sora Modules
 * @author Cufiy
 * @license MIT
 * @date 2025-05-30 23:32:41
 * @note This file is automatically generated.
 */


function globalExtractor(providers) {
  for (const [url, provider] of Object.entries(providers)) {
    try {
      const streamUrl = extractStreamUrlByProvider(url, provider);
      // check if streamUrl is not null, a string, and starts with http or https
      if (streamUrl && typeof streamUrl === "string" && (streamUrl.startsWith("http"))) {
        return streamUrl;
      }
    } catch (error) {
      // Ignore the error and try the next provider
    }
  }
  return null;
}

async function multiExtractor(providers) {
  /* this scheme should be returned as a JSON object
  {
  "streams": [
    "FileMoon",
    "https://filemoon.example/stream1.m3u8",
    "StreamWish",
    "https://streamwish.example/stream2.m3u8",
    "Okru",
    "https://okru.example/stream3.m3u8",
    "MP4",
    "https://mp4upload.example/stream4.mp4",
    "Default",
    "https://default.example/stream5.m3u8"
  ]
}
  */
  const streams = [];
  const providersCount = {};
  for (const [url, provider] of Object.entries(providers)) {
    // if streams is bigger than 10, return it
    // if (streams.length >= 5) {
    //   sendLog("Streams array is full, returning...");
    //   return streams;
    // }
    try {
      const streamUrl = await extractStreamUrlByProvider(url, provider);
      // check if streamUrl is not null, a string, and starts with http or https
      if (streamUrl && typeof streamUrl === "string" && (streamUrl.startsWith("http"))) {
        // check if provider is already in streams, if it is, add a number to it
        if (providersCount[provider]) {
          providersCount[provider]++;
          streams.push(`${provider} (${providersCount[provider]})`, streamUrl);
        } else {
          providersCount[provider] = 1;
          streams.push(provider, streamUrl);
        }
      } else {
        // sendLog(`Stream URL for provider ${provider} is not valid: ${streamUrl}`);
      }
    } catch (error) {
      // Ignore the error and try the next provider
    }
  }
  return streams;
}


async function extractStreamUrlByProvider(url, provider) {

    if (eval(`typeof ${provider}Extractor`) !== "function") {
      // skip if the extractor is not defined
      // sendLog(`Extractor for provider ${provider} is not defined, skipping...`);
      return null;
    }

  let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": url,
    "Connection": "keep-alive",
    "x-Requested-With": "XMLHttpRequest"
  };

  // fetch the url
  // and pass the response to the extractor function
  sendLog("Fetching URL: " + url);
  const response = await soraFetch(url, {
      headers
  });

  sendLog("Response: " + response.status);
  let html = response.text ? await response.text() : response;
  // if title contains redirect, then get the redirect url
  const title = html.match(/<title>(.*?)<\/title>/);
  if (title && title[1].toLowerCase().includes("redirect")) {
    const redirectUrl = html.match(/<meta http-equiv="refresh" content="0;url=(.*?)"/);
    const redirectUrl2 = html.match(/window\.location\.href\s*=\s*["'](.*?)["']/);
    const redirectUrl3 = html.match(/window\.location\.replace\s*\(\s*["'](.*?)["']\s*\)/);
    if (redirectUrl) {
      sendLog("Redirect URL: " + redirectUrl[1]);
      url = redirectUrl[1];
      html = await soraFetch(url, {
        headers
      });
      html = html.text ? await html.text() : html;

    } else if (redirectUrl2) {
      sendLog("Redirect URL 2: " + redirectUrl2[1]);
      url = redirectUrl2[1];
      html = await soraFetch(url, {
        headers
      });
      html = html.text ? await html.text() : html;
    } else if (redirectUrl3) {
      sendLog("Redirect URL 3: " + redirectUrl3[1]);
      url = redirectUrl3[1];
      html = await soraFetch(url, {
        headers
      });
      html = html.text ? await html.text() : html;
    } else {
      sendLog("No redirect URL found");
    }
  }

  // sendLog("HTML: " + html);
  switch (provider) {
    case "doodstream":
      try {
         return await doodstreamExtractor(html, url);
      } catch (error) {
         sendLog("Error extracting stream URL from doodstream: " + error);
         return null;
      }
    case "mp4upload":
      try {
         return await mp4uploadExtractor(html, url);
      } catch (error) {
         sendLog("Error extracting stream URL from mp4upload: " + error);
         return null;
      }
    case "speedfiles":
      try {
         return await speedfilesExtractor(html, url);
      } catch (error) {
         sendLog("Error extracting stream URL from speedfiles: " + error);
         return null;
      }
    case "vidmoly":
      try {
         return await vidmolyExtractor(html, url);
      } catch (error) {
         sendLog("Error extracting stream URL from vidmoly: " + error);
         return null;
      }
    case "vidoza":
      try {
         return await vidozaExtractor(html, url);
      } catch (error) {
         sendLog("Error extracting stream URL from vidoza: " + error);
         return null;
      }
    case "voe":
      try {
         return await voeExtractor(html, url);
      } catch (error) {
         sendLog("Error extracting stream URL from voe: " + error);
         return null;
      }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}





/**
 * Uses Sora's fetchv2 on ipad, fallbacks to regular fetch on Windows
 * @author ShadeOfChaos
 *
 * @param {string} url The URL to make the request to.
 * @param {object} [options] The options to use for the request.
 * @param {object} [options.headers] The headers to send with the request.
 * @param {string} [options.method='GET'] The method to use for the request.
 * @param {string} [options.body=null] The body of the request.
 *
 * @returns {Promise<Response|null>} The response from the server, or null if the
 * request failed.
 */
async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            return null;
        }
    }
}

////////////////////////////////////////////////
//                 EXTRACTORS                 //
////////////////////////////////////////////////

// DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING //


/* --- doodstream --- */

/**
 * @name doodstreamExtractor
 * @author Cufiy
 */
async function doodstreamExtractor(html, url = null) {
    sendLog("DoodStream extractor called");
    sendLog("DoodStream extractor URL: " + url);
        const streamDomain = url.match(/https:\/\/(.*?)\//, url)[0].slice(8, -1);
        const md5Path = html.match(/'\/pass_md5\/(.*?)',/, url)[0].slice(11, -2);
        const token = md5Path.substring(md5Path.lastIndexOf("/") + 1);
        const expiryTimestamp = new Date().valueOf();
        const random = randomStr(10);
        const passResponse = await fetch(`https://${streamDomain}/pass_md5/${md5Path}`, {
            headers: {
                "Referer": url,
            },
        });
        sendLog("DoodStream extractor response: " + passResponse.status);
        const responseData = await passResponse.text();
        const videoUrl = `${responseData}${random}?token=${token}&expiry=${expiryTimestamp}`;
        sendLog("DoodStream extractor video URL: " + videoUrl);
        return videoUrl;
}
function randomStr(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


/* --- mp4upload --- */

/**
 * @name mp4uploadExtractor
 * @author Cufiy
 */
async function mp4uploadExtractor(html, url = null) {
    // src: "https://a4.mp4upload.com:183/d/xkx3b4etz3b4quuo66rbmyqtjjoivahfxp27f35pti45rzapbvj5xwb4wuqtlpewdz4dirfp/video.mp4"  
    const regex = /src:\s*"([^"]+)"/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  } else {
    sendLog("No match found for mp4upload extractor");
    return null;
  }
}


/* --- speedfiles --- */

/**
 * @name speedfilesExtractor
 * @author Cufiy
 */
function speedfilesExtractor(sourcePageHtml) {
  // get var _0x5opu234 = "THIS_IS_AN_ENCODED_STRING"
  const REGEX = /var\s+_0x5opu234\s*=\s*"([^"]+)"/;
  const match = sourcePageHtml.match(REGEX);
  if (match == null || match[1] == null) {
    sendLog("Could not extract from Speedfiles source");
    return null;
  }
  const encodedString = match[1];
  sendLog("Encoded String:" + encodedString);
  // Step 1: Base64 decode the initial string
  let step1 = atob(encodedString);
  // Step 2: Swap character cases and reverse
  let step2 = step1
    .split("")
    .map((c) =>
      /[a-zA-Z]/.test(c)
        ? c === c.toLowerCase()
          ? c.toUpperCase()
          : c.toLowerCase()
        : c
    )
    .join("");
  let step3 = step2.split("").reverse().join("");
  // Step 3: Base64 decode again and reverse
  let step4 = atob(step3);
  let step5 = step4.split("").reverse().join("");
  // Step 4: Hex decode pairs
  let step6 = "";
  for (let i = 0; i < step5.length; i += 2) {
    step6 += String.fromCharCode(parseInt(step5.substr(i, 2), 16));
  }
  // Step 5: Subtract 3 from character codes
  let step7 = step6
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) - 3))
    .join("");
  // Step 6: Final case swap, reverse, and Base64 decode
  let step8 = step7
    .split("")
    .map((c) =>
      /[a-zA-Z]/.test(c)
        ? c === c.toLowerCase()
          ? c.toUpperCase()
          : c.toLowerCase()
        : c
    )
    .join("");
  let step9 = step8.split("").reverse().join("");
  // return atob(step9);
  let decodedUrl = atob(step9);
  return decodedUrl;
}


/* --- vidmoly --- */

/**
 * @name vidmolyExtractor
 * @author Ibro
 */
async function vidmolyExtractor(html, url = null) {
  const regexSub = /<option value="([^"]+)"[^>]*>\s*SUB - Omega\s*<\/option>/;
  const regexFallback = /<option value="([^"]+)"[^>]*>\s*Omega\s*<\/option>/;
  const fallback =
    /<option value="([^"]+)"[^>]*>\s*SUB v2 - Omega\s*<\/option>/;
  let match =
    html.match(regexSub) || html.match(regexFallback) || html.match(fallback);
  if (match) {
    const decodedHtml = atob(match[1]); // Decode base64
    const iframeMatch = decodedHtml.match(/<iframe\s+src="([^"]+)"/);
    if (!iframeMatch) {
      sendLog("Vidmoly extractor: No iframe match found");
      return null;
    }
    const streamUrl = iframeMatch[1].startsWith("//")
      ? "https:" + iframeMatch[1]
      : iframeMatch[1];
    const responseTwo = await fetchv2(streamUrl);
    const htmlTwo = await responseTwo.text();
    const m3u8Match = htmlTwo.match(/sources:\s*\[\{file:"([^"]+\.m3u8)"/);
    return m3u8Match ? m3u8Match[1] : null;
  } else {
    sendLog("Vidmoly extractor: No match found, using fallback");
    //  regex the sources: [{file:"this_is_the_link"}]
    const sourcesRegex = /sources:\s*\[\{file:"(https?:\/\/[^"]+)"\}/;
    const sourcesMatch = html.match(sourcesRegex);
    let sourcesString = sourcesMatch
      ? sourcesMatch[1].replace(/'/g, '"')
      : null;
    return sourcesString;
  }
}


/* --- vidoza --- */

/**
 * @name vidozaExtractor
 * @author Cufiy
 */
async function vidozaExtractor(html, url = null) {
  const regex = /<source src="([^"]+)" type='video\/mp4'>/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  } else {
    sendLog("No match found for vidoza extractor");
    return null;
  }
}


/* --- voe --- */

/**
 * @name voeExtractor
 * @author Cufiy
 */
function voeExtractor(html, url = null) {
// Extract the first <script type="application/json">...</script>
    const jsonScriptMatch = html.match(
      /<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (!jsonScriptMatch) {
      sendLog("No application/json script tag found");
      return null;
    }

    const obfuscatedJson = jsonScriptMatch[1].trim();
  let data;
  try {
    data = JSON.parse(obfuscatedJson);
  } catch (e) {
    throw new Error("Invalid JSON input.");
  }
  if (!Array.isArray(data) || typeof data[0] !== "string") {
    throw new Error("Input doesn't match expected format.");
  }
  let obfuscatedString = data[0];
  // Step 1: ROT13
  let step1 = voeRot13(obfuscatedString);
  // Step 2: Remove patterns
  let step2 = voeRemovePatterns(step1);
  // Step 3: Base64 decode
  let step3 = voeBase64Decode(step2);
  // Step 4: Subtract 3 from each char code
  let step4 = voeShiftChars(step3, 3);
  // Step 5: Reverse string
  let step5 = step4.split("").reverse().join("");
  // Step 6: Base64 decode again
  let step6 = voeBase64Decode(step5);
  // Step 7: Parse as JSON
  let result;
  try {
    result = JSON.parse(step6);
  } catch (e) {
    throw new Error("Final JSON parse error: " + e.message);
  }
  // sendLog("Decoded JSON: " + result);
  // check if direct_access_url is set, not null and starts with http
  if (result && typeof result === "object") {
    const streamUrl =
      result.direct_access_url ||
      result.source
        .map((source) => source.direct_access_url)
        .find((url) => url && url.startsWith("http"));
    if (streamUrl) {
      sendLog("Voe Stream URL: " + streamUrl);
      return streamUrl;
    } else {
      sendLog("No stream URL found in the decoded JSON");
    }
  }
  return result;
}
function voeRot13(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    return String.fromCharCode(
      (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13)
        ? c
        : c - 26
    );
  });
}
function voeRemovePatterns(str) {
  const patterns = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
  let result = str;
  for (const pat of patterns) {
    result = result.split(pat).join("");
  }
  return result;
}
function voeBase64Decode(str) {
  // atob is available in browsers and Node >= 16
  if (typeof atob === "function") {
    return atob(str);
  }
  // Node.js fallback
  return Buffer.from(str, "base64").toString("utf-8");
}
function voeShiftChars(str, shift) {
  return str
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) - shift))
    .join("");
}




// if is node, test
if (typeof module !== 'undefined' && module.exports) {
const startTime = new Date().getTime();

    try {
        sendLog("Testing searchResults function...");
        let streamsLol = extractStreamUrl("https://streamcloud.sx/watch/the-last-of-us-staffel-2/6805c802f425fc1d6849427c/1")
        .then((result) => {
            // sendLog("Result: " + JSON.parse(result));
            const endTime = new Date().getTime();
            sendLog(`Execution time: ${endTime - startTime} ms`);
        });



    } catch (error) {
        console.error("Error testing searchResults function: " + error);
    }
  }
// extractStreamUrl("");
