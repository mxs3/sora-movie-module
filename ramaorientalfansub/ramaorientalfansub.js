function searchResults(html) {
    const results = [];

    const itemBlocks = html.split('<div class="w-full bg-gradient-to-t from-primary to-transparent rounded overflow-hidden shadow shadow-primary">');
    
    itemBlocks.forEach(block => {
        const titleMatch = block.match(/<h3>[\s\S]*?<a [^>]+>([\s\S]*?)<\/a>/);
        const imgMatch = block.match(/<img[^>]*src="([^"]+)"/);
        const hrefMatch = block.match(/<h3>[\s\S]*?<a href="([^"]+)"/);

        if (hrefMatch && titleMatch && imgMatch) {
            const href = hrefMatch[1].trim();
            const title = decodeHTMLEntities(titleMatch[1].trim());
            const imageUrl = imgMatch[1].trim();
            
            results.push({
                title: title,
                image: imageUrl,
                href: href
            });
        }
    });
    
    console.log(results);
    return results;
}

function extractDetails(html) {
    const details = [];

    const descriptionMatch = html.match(/<span class="block w-full max-h-24 overflow-scroll mlb-3 overflow-x-hidden text-xs text-gray-200">([^<]+)<\/span>/);
    let description = descriptionMatch 
        ? decodeHTMLEntities(descriptionMatch[1].trim())
        : 'N/A';

    const aliasMatch = html.match(/<li>\s*<span>\s*(\d+M)\s*<\/span>/);
    let alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    let airdate = 'N/A';

    details.push({
        description: description,
        alias: alias,
        airdate: airdate
    });

    console.log(details);
    return details;
}

function extractEpisodes(html) {
    const episodes = [];

    const slideRegex = /<div class="swiper-slide[^"]*"[\s\S]*?<a href="([^"]+)"[^>]*title="([^"]+)"/g;
    let match;
    
    while ((match = slideRegex.exec(html)) !== null) {
        const href = match[1].trim();
        const title = match[2].trim();

        const epNumMatch = title.match(/episodio\s*(\d+)/i);
        
        if (epNumMatch) {
            episodes.push({
                href: href,
                number: epNumMatch[1].trim()
            });
        }
    }

    if (episodes[0].number !== "1") {
        episodes.reverse();
    }

    console.log(episodes);
    return episodes;
}


function extractStreamUrl(html) {
    const streamMatch = html.match(/<iframe[^>]+src=['"]([^'"]+)['"]/);
    const stream = streamMatch ? streamMatch[1].trim() : 'N/A';

    console.log(stream);
    return stream;
}

function decodeHTMLEntities(text) {
    text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    
    const entities = {
        '&quot;': '"',
        '&amp;': '&',
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>'
    };
    
    for (const entity in entities) {
        text = text.replace(new RegExp(entity, 'g'), entities[entity]);
    }

    return text;
}

searchResults(`<div class="kira-grid" style="grid-template-columns: repeat(5, 1fr);">	<div class="w-full bg-gradient-to-t from-primary to-transparent rounded overflow-hidden shadow shadow-primary">
		<div class="block relative w-full group kira-anime add-rem overflow-hidden" style="padding-block-end: calc(35% + 166px);">
								<div class="status_show" style="background-color: var(--completed-status)">
						<span>Completato</span>
					</div>
								<img width="320" height="480" data-src="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29-320x480.jpg" class="absolute inset-0 object-cover w-full h-full rounded shadow ls-is-cached lazyloaded" alt="" decoding="async" loading="lazy" data-srcset="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29-320x480.jpg 320w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29-96x144.jpg 96w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29.jpg 1000w" data-sizes="auto, (max-width: 320px) 100vw, 320px" sizes="auto, (max-width: 320px) 100vw, 320px" srcset="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29-320x480.jpg 320w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29-96x144.jpg 96w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29.jpg 1000w" src="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/z5hWZAnMnvVJS8K6NNrbUbl8W29-320x480.jpg">
			<div class="absolute inset-0 top-1/4" style="
					background: linear-gradient(0deg, rgba(var(--overlay-color), 1) 0, rgba(42, 44, 49, 0) 76%);
				"></div>
			<div class="flex items-center justify-between pli-3 pbe2 absolute bottom-0 inset-x-0">
				<!-- attribute -->
									<div class="min-w-max">
						<span class="text-text-accent block bg-accent-2/80 h-[25px] rounded-md text-[11px] p-1 mie-px font-medium">
							HD 1080/SUB						</span>
					</div>
								<!-- episode -->
									<span class="text-[11px] pli-2 plb-1 rounded-md font-medium h-[25px] text-text-accent bg-accent-3 mis-auto">
					E 1					</span>
							</div>
			<a data-tippy-trigger="" data-tippy-content-to="19308" href="https://ramaorientalfansub.tv/drama/my-roommate-is-a-gumiho-01/" class="group-hover:bg-opacity-75 bg-overlay hidden group-hover:flex items-center justify-center absolute inset-0" aria-expanded="false">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-8 h-8">
					<path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>
				</svg>
			</a>
					</div>

		<div style="min-height: 4.906rem" class="flex h-auto md:h-24 lg:h-24 flex-col justify-between p-2 bg-overlay relative">
			<!-- Title -->
			<h3>			<a href="https://ramaorientalfansub.tv/drama/my-roommate-is-a-gumiho-01/" class="text-sm line-clamp-2 font-medium leading-snug lg:leading-normal">
									My Roommate Is a Gumiho (2021)							</a>
			</h3>
			<!-- type and length -->
			<div class="text-xs text-text-color w-full line-clamp-1 absolute bottom-1 text-opacity-75">
				<span class="inline-block md:mlb-3 uppercase">Tv</span>
				<span class="inline-block bg-gray-600 w-1 h-1 mli-2"></span>
				<span class="inline-block md:mlb-3">
				24M				</span>
			</div>
		</div>
	</div>
	<div class="w-full bg-gradient-to-t from-primary to-transparent rounded overflow-hidden shadow shadow-primary">
		<div class="block relative w-full group kira-anime add-rem overflow-hidden" style="padding-block-end: calc(35% + 166px);">
								<div class="status_show" style="background-color: var(--completed-status)">
						<span>Completato</span>
					</div>
								<img width="320" height="480" data-src="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF-320x480.jpg" class="absolute inset-0 object-cover w-full h-full rounded shadow lazyloaded" alt="" decoding="async" loading="lazy" data-srcset="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF-320x480.jpg 320w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF-96x144.jpg 96w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF.jpg 620w" data-sizes="auto, (max-width: 320px) 100vw, 320px" sizes="auto, (max-width: 320px) 100vw, 320px" srcset="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF-320x480.jpg 320w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF-96x144.jpg 96w, https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF.jpg 620w" src="https://ramaorientalfansub.tv/wp-content/uploads/2023/08/m1SZ5tpfjh2IGWUKhXnQhrmhAgF-320x480.jpg">
			<div class="absolute inset-0 top-1/4" style="
					background: linear-gradient(0deg, rgba(var(--overlay-color), 1) 0, rgba(42, 44, 49, 0) 76%);
				"></div>
			<div class="flex items-center justify-between pli-3 pbe2 absolute bottom-0 inset-x-0">
				<!-- attribute -->
									<div class="min-w-max">
						<span class="text-text-accent block bg-accent-2/80 h-[25px] rounded-md text-[11px] p-1 mie-px font-medium">
							SUB						</span>
					</div>
								<!-- episode -->
									<span class="text-[11px] pli-2 plb-1 rounded-md font-medium h-[25px] text-text-accent bg-accent-3 mis-auto">
					E 1					</span>
							</div>
			<a data-tippy-trigger="" data-tippy-content-to="19251" href="https://ramaorientalfansub.tv/drama/my-romantic-some-recipe/" class="group-hover:bg-opacity-75 bg-overlay hidden group-hover:flex items-center justify-center absolute inset-0" aria-expanded="false">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-8 h-8">
					<path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>
				</svg>
			</a>
					</div>

		<div style="min-height: 4.906rem" class="flex h-auto md:h-24 lg:h-24 flex-col justify-between p-2 bg-overlay relative">
			<!-- Title -->
			<h3>			<a href="https://ramaorientalfansub.tv/drama/my-romantic-some-recipe/" class="text-sm line-clamp-2 font-medium leading-snug lg:leading-normal">
									My Romantic Some Recipe (2016)							</a>
			</h3>
			<!-- type and length -->
			<div class="text-xs text-text-color w-full line-clamp-1 absolute bottom-1 text-opacity-75">
				<span class="inline-block md:mlb-3 uppercase">Tv</span>
				<span class="inline-block bg-gray-600 w-1 h-1 mli-2"></span>
				<span class="inline-block md:mlb-3">
				24M				</span>
			</div>
		</div>
	</div>
</div>`);