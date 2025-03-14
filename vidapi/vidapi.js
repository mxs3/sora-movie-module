async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=71fdb081b0133511ac14ac0cc10fd307&query=${encodedKeyword}`);
        const data = JSON.parse(responseText);

        const transformedResults = data.results.map(result => {
            // For movies, TMDB returns "title" and media_type === "movie"
            if(result.media_type === "movie" || result.title) {
                return {
                    title: result.title || result.name,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://vidapi.xyz/embed/movie/${result.id}`
                };
            }
            // For TV shows, TMDB returns "name" and media_type === "tv"
            else if(result.media_type === "tv" || result.name) {
                return {
                    title: result.name || result.title,
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    // Using default season/episode numbers (1/1)
                    href: `https://vidapi.xyz/embed/tv/${result.id}&s=1&e=1`
                };
            } else {
                // Fallback if media_type is not defined
                return {
                    title: result.title || result.name || "Untitled",
                    image: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
                    href: `https://vidapi.xyz/embed/tv/${result.id}&s=1&e=1`
                };
            }
        });

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        if(url.includes('/embed/movie/')) {
            const match = url.match(/https:\/\/vidapi\.xyz\/embed\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];
            const responseText = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=71fdb081b0133511ac14ac0cc10fd307&append_to_response=videos,credits`);
            const data = JSON.parse(responseText);

            const transformedResults = [{
                description: data.overview || 'No description available',
                // Movies use runtime (in minutes)
                aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
                airdate: `Released: ${data.release_date ? data.release_date : 'Unknown'}`
            }];

            return JSON.stringify(transformedResults);
        } else if(url.includes('/embed/tv/')) {
            const match = url.match(/https:\/\/vidapi\.xyz\/embed\/tv\/([^\/]+)\&s=([^&]+)\&e=([^&]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const responseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=71fdb081b0133511ac14ac0cc10fd307&append_to_response=seasons`);
            const data = JSON.parse(responseText);

            const transformedResults = [{
                description: data.overview || 'No description available',
                aliases: `Duration: ${data.episode_run_time && data.episode_run_time.length ? data.episode_run_time.join(', ') : 'Unknown'}`,
                airdate: `Aired: ${data.first_air_date ? data.first_air_date : 'Unknown'}`
            }];

            return JSON.stringify(transformedResults);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired/Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        if(url.includes('/embed/movie/')) {
            const match = url.match(/https:\/\/vidapi\.xyz\/embed\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");
            const movieId = match[1];
            return JSON.stringify([
                { href: `https://vidapi.xyz/embed/movie/${movieId}`, number: 1, title: "Full Movie" }
            ]);
        } else if(url.includes('/embed/tv/')) {
            const match = url.match(/https:\/\/vidapi\.xyz\/embed\/tv\/([^\/]+)\&s=([^&]+)\&e=([^&]+)/);
            if (!match) throw new Error("Invalid URL format");
            const showId = match[1];
            
            const showResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=71fdb081b0133511ac14ac0cc10fd307`);
            const showData = JSON.parse(showResponseText);
            
            let allEpisodes = [];
            for (const season of showData.seasons) {
                const seasonNumber = season.season_number;

                if(seasonNumber === 0) continue;
                
                const seasonResponseText = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=71fdb081b0133511ac14ac0cc10fd307`);
                const seasonData = JSON.parse(seasonResponseText);
                
                if (seasonData.episodes && seasonData.episodes.length) {
                    const episodes = seasonData.episodes.map(episode => ({
                        href: `https://vidapi.xyz/embed/tv/${showId}&s=${seasonNumber}&e=${episode.episode_number}`,
                        number: episode.episode_number,
                        title: episode.name || ""
                    }));
                    allEpisodes = allEpisodes.concat(episodes);
                }
            }
            
            return JSON.stringify(allEpisodes);
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }    
}

async function extractStreamUrl(url) {
    try {
        if (url.includes('/embed/movie/')) {
            const match = url.match(/https:\/\/vidapi\.xyz\/embed\/movie\/([^\/]+)/);
            if (!match) throw new Error("Invalid URL format");

            const movieId = match[1];

            try {
                const responseText = await fetch(`https://vidapi.xyz/embed/movie/${movieId}`);
                const data = await responseText.text();

                // 2. Find the iframe and extract its src.
                const iframeMatch = data.match(/<iframe[^>]+src=["']([^"']+)["']/);
                if (!iframeMatch) {
                    throw new Error("No iframe found in the main page.");
                }
                let iframeSrc = iframeMatch[1].trim();
                // If the iframe src is relative, prepend the base URL.
                if (!iframeSrc.startsWith("http")) {
                    iframeSrc = "https://uqloads.xyz/e/" + iframeSrc;
                }

                console.log("Iframe src:", iframeSrc);
                
                // 3. Fetch the HTML from the iframe.
                const iframeResponse = await fetch(iframeSrc);
                const iframeHtml = await iframeResponse.text();

                // 4. Look for the packed script using a regex.
                const packedScriptMatch = iframeHtml.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d[\s\S]*?)<\/script>/);
                if (!packedScriptMatch) {
                    throw new Error("No packed script found in the iframe.");
                }
                const packedScript = packedScriptMatch[1];
                console.log("Packed script found.");

                // 5. Unpack the script using our unpack function.
                const unpackedScript = unpack(packedScript);
                console.log("Unpacked script:", unpackedScript);

                // 6. Extract the stream URL from the unpacked script.
                // For example, assume the URL is defined as file:"https://..."
                const streamMatch = unpackedScript.match(/(?<=file:")[^"]+/);
                const stream = streamMatch ? streamMatch[0].trim() : 'N/A';
                console.log("Stream URL:", stream);

                return stream;
            } catch (err) {
                console.log(`Fetch error on endpoint https://vidapi.xyz/embed/movie/${movieId} for movie ${movieId}:`, err);
            }
        } else if (url.includes('/embed/tv/')) {
            const match = url.match(/https:\/\/vidapi\.xyz\/embed\/tv\/([^\/]+)\&s=([^&]+)\&e=([^&]+)/);
            if (!match) throw new Error("Invalid URL format");

            const showId = match[1];
            const seasonNumber = match[2];
            const episodeNumber = match[3];

            try {
                const responseText = await fetch(`https://vidapi.xyz/embed/tv/${showId}&s=${seasonNumber}&e=${episodeNumber}`);
                const data = await responseText.text();

                let streamUrl = null;
                
                // Try to find and unpack a packed script
                const packedScriptMatch = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d[\s\S]*?)<\/script>/);
                if (packedScriptMatch) {
                    const unpackedScript = unpack(packedScriptMatch[1]);
                    const streamMatch = unpackedScript.match(/(?<=file:")[^"]+/);
                    if (streamMatch) {
                        streamUrl = streamMatch[0].trim();
                    }
                }
                
                // Fallback: if no packed script is found, look for an iframe
                if (!streamUrl) {
                    const iframeMatch = data.match(/<iframe[^>]+src=["']([^"']+)["']/);
                    if (iframeMatch) {
                        let iframeSrc = iframeMatch[1].trim();
                        // If iframeSrc is relative, prepend a base URL (adjust as needed)
                        if (!iframeSrc.startsWith("http")) {
                            iframeSrc = "https://uqloads.xyz/e/" + iframeSrc;
                        }
                        console.log("Fetching iframe URL with headers:", iframeSrc);

                        const iframeResponse = await fetch(`https://decompress-zstd.vercel.app/api/${encodeURIComponent(iframeSrc)}`);
                        const iframeHtml = await iframeResponse.text();

                        console.log("Fetched iframe HTML:", iframeHtml);
                        
                        // Look for a packed script in the iframe HTML and unpack it.
                        const innerPackedScript = iframeHtml.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d[\s\S]*?)<\/script>/);
                        if (innerPackedScript) {
                            const unpackedInnerScript = unpack(innerPackedScript[1]);
                            const streamMatch = unpackedInnerScript.match(/(?<=file:")[^"]+/);
                            if (streamMatch) {
                                streamUrl = streamMatch[0].trim();
                            }
                        } else {
                            // As a fallback, try to extract an iframe URL from within the iframe HTML.
                            const innerIframeMatch = iframeHtml.match(/<iframe[^>]+src=["']([^"']+)["']/);
                            if (innerIframeMatch) {
                                streamUrl = innerIframeMatch[1].trim();
                            }
                        }
                    }
                }

                console.log("Stream URL:", streamUrl);
                
                return streamUrl;
            } catch (err) {
                console.log(`Fetch error on endpoint https://vidapi.xyz/embed/tv/${showId}&s=${seasonNumber}&e=${episodeNumber} for TV show ${showId} S${seasonNumber}E${episodeNumber}:`, err);
            }
        } else {
            throw new Error("Invalid URL format");
        }
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return null;
    }
}

class Unbaser {
    constructor(base) {
        /* Functor for a given base. Will efficiently convert
          strings to natural numbers. */
        this.ALPHABET = {
            62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            95: "' !\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'",
        };
        this.dictionary = {};
        this.base = base;
        // fill elements 37...61, if necessary
        if (36 < base && base < 62) {
            this.ALPHABET[base] = this.ALPHABET[base] ||
                this.ALPHABET[62].substr(0, base);
        }
        // If base can be handled by int() builtin, let it do it for us
        if (2 <= base && base <= 36) {
            this.unbase = (value) => parseInt(value, base);
        }
        else {
            // Build conversion dictionary cache
            try {
                [...this.ALPHABET[base]].forEach((cipher, index) => {
                    this.dictionary[cipher] = index;
                });
            }
            catch (er) {
                throw Error("Unsupported base encoding.");
            }
            this.unbase = this._dictunbaser;
        }
    }
    _dictunbaser(value) {
        /* Decodes a value to an integer. */
        let ret = 0;
        [...value].reverse().forEach((cipher, index) => {
            ret = ret + ((Math.pow(this.base, index)) * this.dictionary[cipher]);
        });
        return ret;
    }
}

function detect(source) {
    /* Detects whether `source` is P.A.C.K.E.R. coded. */
    return source.replace(" ", "").startsWith("eval(function(p,a,c,k,e,");
}

function unpack(source) {
    /* Unpacks P.A.C.K.E.R. packed js code. */
    let { payload, symtab, radix, count } = _filterargs(source);
    if (count != symtab.length) {
        throw Error("Malformed p.a.c.k.e.r. symtab.");
    }
    let unbase;
    try {
        unbase = new Unbaser(radix);
    }
    catch (e) {
        throw Error("Unknown p.a.c.k.e.r. encoding.");
    }
    function lookup(match) {
        /* Look up symbols in the synthetic symtab. */
        const word = match;
        let word2;
        if (radix == 1) {
            //throw Error("symtab unknown");
            word2 = symtab[parseInt(word)];
        }
        else {
            word2 = symtab[unbase.unbase(word)];
        }
        return word2 || word;
    }
    source = payload.replace(/\b\w+\b/g, lookup);
    return _replacestrings(source);
    function _filterargs(source) {
        /* Juice from a source file the four args needed by decoder. */
        const juicers = [
            /}\('(.*)', *(\d+|\[\]), *(\d+), *'(.*)'\.split\('\|'\), *(\d+), *(.*)\)\)/,
            /}\('(.*)', *(\d+|\[\]), *(\d+), *'(.*)'\.split\('\|'\)/,
        ];
        for (const juicer of juicers) {
            //const args = re.search(juicer, source, re.DOTALL);
            const args = juicer.exec(source);
            if (args) {
                let a = args;
                if (a[2] == "[]") {
                    //don't know what it is
                    // a = list(a);
                    // a[1] = 62;
                    // a = tuple(a);
                }
                try {
                    return {
                        payload: a[1],
                        symtab: a[4].split("|"),
                        radix: parseInt(a[2]),
                        count: parseInt(a[3]),
                    };
                }
                catch (ValueError) {
                    throw Error("Corrupted p.a.c.k.e.r. data.");
                }
            }
        }
        throw Error("Could not make sense of p.a.c.k.e.r data (unexpected code structure)");
    }
    function _replacestrings(source) {
        /* Strip string lookup table (list) and replace values in source. */
        /* Need to work on this. */
        return source;
    }
}

class zstdDecompressor {
    constructor() {
        this.decompressor = new ZstdDecompressor();
    }
    
    decompress(data) {
        return this.decompressor.decompress(data);
    }
} 

extractStreamUrl(`https://vidapi.xyz/embed/tv/60735&s=9&e=1`);