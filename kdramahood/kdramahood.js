function searchResults(html) {
    const results = [];
    // Capture from the beginning of the item block up to the <div class="fixyear"> sibling
    const filmListRegex = /<div id="mt-\d+" class="item">([\s\S]*?)(?=<div class="fixyear">)/g;
    const items = [];
    let match;
    while ((match = filmListRegex.exec(html)) !== null) {
        // match[0] contains the entire matched string (the item block)
        items.push(match[0]);
    }

    items.forEach((itemHtml) => {
        // Extract the first href from an <a> tag
        const hrefMatch = itemHtml.match(/<a href="([^"]+)"/);
        const href = hrefMatch ? hrefMatch[1] : '';

        // Extract title from <span class="tt">TITLE</span>
        const titleMatch = itemHtml.match(/<span class="tt">([\s\S]*?)<\/span>/);
        const title = titleMatch ? titleMatch[1] : '';

        // Extract image URL from <img ... src="...">
        const imgMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        results.push({
            title: title.trim(),
            image: imageUrl.trim(),
            href: href.trim(),
        });
    });

    console.log(results);
    return JSON.stringify(results);
}

function extractDetails(html) {
    const details = [];

    // Extract description from the <div itemprop="description"> and remove any HTML tags
    const descriptionMatch = html.match(/<div itemprop="description">([\s\S]*?)<\/div>/);
    let description = descriptionMatch 
        ? descriptionMatch[1].replace(/<[^>]+>/g, '').trim() 
        : 'N/A';

    // Extract original name (alias) from its corresponding div
    const aliasMatch = html.match(/<div class="metadatac"><b>Firt air date<\/b><span[^>]*>([^<]+)<\/span>/);
    let alias = aliasMatch ? aliasMatch[1].trim() : 'N/A';

    // Extract airdate from the "Firt air date" field
    const airdateMatch = html.match(/<b>Firt air date<\/b><span[^>]*>([^<]+)<\/span>/);
    let airdate = airdateMatch ? airdateMatch[1].trim() : 'N/A';

    details.push({
        description: description,
        alias: alias,
        airdate: airdate
    });

    console.log(details);
    return JSON.stringify(details);
}


function extractEpisodes(html) {
    const episodes = [];

    // Attempt to extract episodes from the <ul class="episodios"> list
    const episodesMatch = html.match(/<ul class="episodios">([\s\S]*?)<\/ul>/);

    if (episodesMatch) {
        // Match all <li> items within the episodios list
        const liMatches = episodesMatch[1].match(/<li>([\s\S]*?)<\/li>/g);
        
        if (liMatches) {
            liMatches.forEach(li => {
                // Extract the href from the <a> tag
                const hrefMatch = li.match(/<a href="([^"]+)"/);
                // Extract the episode number from the <div class="numerando">
                const numMatch = li.match(/<div class="numerando">(\d+)<\/div>/);
                if (hrefMatch && numMatch) {
                    episodes.push({
                        href: "episode: " + hrefMatch[1].trim(),
                        number: numMatch[1].trim()
                    });
                }
            });
        }
    }

    // Reverse the order so episodes are in ascending order (if needed)
    episodes.reverse();

    console.log(episodes);
    return JSON.stringify(episodes);
}


function extractStreamUrl(html) {
    const streamMatch = html.match(/<li>Right click and choose "Save link as..." : &nbsp <a rel="nofollow" target="_blank" href="([^<]+)"/);
    const stream = streamMatch ? streamMatch[1].trim() : 'N/A';

    const subtitlesMatch = html.match(/Download Subtitle :&nbsp  <a rel="nofollow" target="_blank" href="([^<]+)"/);
    const subtitles = subtitlesMatch ? subtitlesMatch[1].trim() : 'N/A';

    const result = {
        stream: stream,
        subtitles: subtitles,
    };

    console.log(result);
    return JSON.stringify(result);
}

extractDetails(`<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="Generator" content="Grifus 4.0.2 and WordPress">
 <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="shortcut icon" href="https://kdramahood.com/wp-content/themes/grifus/assets/images/dramahood_logo-2.png" type="image/x-icon" />
<title>The First Responders &#8211;  Dramahood</title>
<base href="https://kdramahood.com"/>
<meta name="keywords" content="The First Responders &#8211; "/>
<link rel="stylesheet" type="text/css" href="https://kdramahood.com/wp-content/themes/grifus/assets/css/reset.css?ver=4.0.2"/>
<!-- <link rel="stylesheet" type="text/css" href="https://leehyori1122.github.io/css/reset.css?ver=4.0.2"/> -->
<link rel="stylesheet" type="text/css" href="https://kdramahood.com/wp-content/themes/grifus/assets/css/icons/style.css?ver=4.0.3"/>
<!-- <link rel="stylesheet" type="text/css" href="https://leehyori1122.github.io/css/icons/style.css?ver=4.0.3"/> -->
<!-- <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap' rel='stylesheet' type='text/css'> -->
<link rel="stylesheet" type="text/css" href="https://kdramahood.com/wp-content/themes/grifus/assets/dark.style.css?ver=4.0.2"/>
<!-- <link rel="stylesheet" type="text/css" href="https://leehyori1122.github.io/dark.style.css?ver=4.0.2"/> -->
<link rel="stylesheet" type="text/css" href="https://kdramahood.com/wp-content/themes/grifus/assets/css/responsive.min.css?ver=4.0.2"/>
<!-- <link rel="stylesheet" type="text/css" href="https://leehyori1122.github.io/css/responsive.min.css?ver=4.0.2"/> -->
<meta property="og:image" content="https://image.tmdb.org/t/p/w780/vAnA5SsisRSlUCU44r18eKzaDt5.jpg" /><meta name='robots' content='max-image-preview:large' />
<link rel='dns-prefetch' href='//s.w.org' />
<meta property="og:image" content="https://image.tmdb.org/t/p/w185/s5aDuYwUIh2OdcvvDBJ65yQu1o4.jpg" />
<meta property="og:image" content="https://image.tmdb.org/t/p/w780/vAnA5SsisRSlUCU44r18eKzaDt5.jpg" />
<link rel="alternate" type="application/rss+xml" title="Dramahood &raquo; The First Responders Comments Feed" href="https://kdramahood.com/dh/the-first-responders/feed/" />
<link rel="https://api.w.org/" href="https://kdramahood.com/wp-json/" /><link rel="EditURI" type="application/rsd+xml" title="RSD" href="https://kdramahood.com/xmlrpc.php?rsd" />
<link rel="wlwmanifest" type="application/wlwmanifest+xml" href="https://kdramahood.com/wp-includes/wlwmanifest.xml" /> 
<link rel="canonical" href="https://kdramahood.com/dh/the-first-responders/" />
<link rel='shortlink' href='https://kdramahood.com/?p=27496' />


<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-C3P7SY3R8P" type="2532b08f2e8369f8550f13d4-text/javascript"></script>
<script type="2532b08f2e8369f8550f13d4-text/javascript">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-C3P7SY3R8P');
</script>

<style type="text/css">
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(wp-content/themes/grifus/assets/css/icons/fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7l.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

.buscaicon ul li a.buscaboton {background-color:#c76012}
.iteslid ul li a.selected, .filtro_y ul li a:hover {background:#c76012}
.news_home .noticias .new .fecha .mes, .categorias li:hover:before {color:#c76012}
#header .navegador .caja .menu li.current-menu-item a, #slider1 .item .imagens span.imdb b, #slider2 .item .imagens span.imdb b, .items .item .image span.imdb b, .items .item .boxinfo .typepost, #contenedor .contenido .header .buscador .imputo:before, .categorias li.current-cat:before {color:#c76012}
#header .navegador, .rheader {   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02), 0 6px 20px 0 rgba(0, 0, 0, 0.019);} 
#header .navegador .caja .menu li a{  text-shadow: 1px 1px 1.5px #000000;}
#video1 .embed2 {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}
.rheader .box .center{
  width:auto;
}
    #series .ladoB .central .contenidotv p {
    font-size: 16px;
    line-height: 22px;
    color: #b5b7b8;
}
.comment_disq_custom{
	    height: 30px;
    line-height: 28px;
    padding: 0 12px 2px;
    background: #0085ba;
	border-color: #0073aa #006799 #006799;
    font-size: 16px;
	font-weight: 600;
    color: #fff;
	box-shadow: 0 1px 0 #006799;
    border-radius: 4px;
	cursor: pointer;
	border-width: 1px;
	border-style: solid;
	text-shadow: 0 -1px 1px #006799,1px 0 1px #006799,0 1px 1px #006799,-1px 0 1px #006799;
}
#video1 .embed2 iframe{position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;}
  
  
#video2 .embed2 {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}
#video2 .embed2 iframe{position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;}
  
#video3 .embed2 {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}
#video3,#video1 ,#video7 {
  width:100%;
  /* padding-top: 56.25%; */
  display: none;
}



#video3 .embed2 iframe{position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;}
  video::cue {
	  background-color: transparent;
     color: white;
	 font: 1em "Open Sans", sans-serif;
	 font-weight: bold;
	 text-shadow: 3px 3px 3px black;
   }
  #video4 .embed2 {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}
#video4 .embed2 iframe{position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;}

  #video5 .embed2 {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}
#video5 .embed2 iframe{position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;}

  #video6 .embed2 {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}
#video6 .embed2 iframe{position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;}

 #video2 .jwplayer.jw-flag-user-inactive.jw-state-playing .jw-captions {
    max-height: none;
}
#video2 .jwplayer.jw-flag-user-inactive.jw-state-playing video::-webkit-media-text-track-container {
    max-height: none;
}
div#disqus_thread iframe[sandbox] { display: none; }

</style>
<script data-cfasync="false" type="text/javascript" src="//gmxvmvptfm.com/t/9/fret/meow4/1989409/34ae4a1d.js"></script>
</head>
<body id="bodyplus">
<div class="rheader">
<div class="box">
<div class="left">
<a class="rclic"><b class="icon-bars"></b></a>
</div>
<div class="rmenus" >
<ul id="menu-main-menu" class=""><li id="menu-item-340" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-340"><a href="https://kdramahood.com/home2">Home</a></li>
<li id="menu-item-338" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-338"><a href="https://kdramahood.com/dh/">Drama</a></li>
<li id="menu-item-339" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-339"><a href="https://kdramahood.com/movies/">Movies</a></li>
<li id="menu-item-337" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-337"><a href="https://kdramahood.com/nt/">Episodes</a></li>
<li id="menu-item-29215" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-29215"><a target="_blank" rel="noopener" href="https://kshows.in">KSHOWS</a></li>
</ul></div>
<div class="right">
<a class="rclic2"><b class="icon-search"></b></a>
</div>
<div class="rbuscar">
<form method="get" id="searchform" action="https://kdramahood.com">
<div class="textar">
<input class="buscar" type="text" placeholder="Search.." name="s" id="s" value="">
</div>
</form>
</div>
<div class="center ">
<A href="https://kdramahood.com/"><img src="https://kdramahood.com/wp-content/themes/grifus/assets/images/dramahood-2-1.png" width="200" height="25" alt="Dramahood" /></a>
</div>
</div>
</div>
<div id="header" class="">
<div id="cabeza" class="navegador">
<div class="tvshows_single caja">
<div class="logo ">
<A href="https://kdramahood.com/"><img src="https://kdramahood.com/wp-content/themes/grifus/assets/images/dramahood-2-1.png" width="256" height="32" alt="Dramahood" /></a>
</div>
<div class="menu">
<ul id="menu-main-menu-1" class=""><li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-340"><a href="https://kdramahood.com/home2">Home</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-338"><a href="https://kdramahood.com/dh/">Drama</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-339"><a href="https://kdramahood.com/movies/">Movies</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-337"><a href="https://kdramahood.com/nt/">Episodes</a></li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-29215"><a target="_blank" rel="noopener" href="https://kshows.in">KSHOWS</a></li>
</ul></div>
<div class="buscaicon">
<ul>
<li><a class="buscaboton"><i class="icon-search"></i></a></li>
</ul>
</div>
<div class="usermenuadmin">
</div>
</div>
</div>
</div>
<div id="contenedor">
<div class="tvshows_single contenido">
<div class="buscaformulario">
<form method="get" id="searchform" action="https://kdramahood.com">
<input type="text" placeholder="Search.." name="s" id="s" value="">
</form>
</div>
<script type="2532b08f2e8369f8550f13d4-text/javascript" defer src="https://kdramahood.com/wp-content/themes/grifus/assets/js/jquery.min.js?ver=2.1.3"></script>
<script type="2532b08f2e8369f8550f13d4-text/javascript" defer src="https://kdramahood.com/wp-content/themes/grifus/assets/js/jquery.idTabs.min.js?ver=4.0.2"></script>
<!-- <script type="text/javascript" async src="https://leehyori1122.github.io/js/jquery.idTabs.min.js?ver=4.0.2"></script> -->
<script defer src="https://kdramahood.com/wp-content/themes/grifus/assets/js/paginador.js?ver=4.0.2" type="2532b08f2e8369f8550f13d4-text/javascript"></script>
<!-- <script async src="https://leehyori1122.github.io/js/paginador.js?ver=4.0.2" type="text/javascript"></script> -->
<script defer src="https://kdramahood.com/wp-content/themes/grifus/assets/js/owl.carousel.js?ver=4.0.3" type="2532b08f2e8369f8550f13d4-text/javascript"></script>
<!-- <script async src="https://leehyori1122.github.io/js/owl.carousel.js?ver=4.0.2"></script> -->
<div id="series" itemscope itemtype="http://schema.org/TVSeries">
<!-- Micro data -->
<meta itemprop="datePublished" content="2022-11-12T20:51:16+05:30"/>
<meta itemprop="url" content="https://kdramahood.com/dh/the-first-responders/" />
<div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Gong Seung-yeon"><meta itemprop="url" content="https://kdramahood.com/dh-cast/gong-seung-yeon/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Ji-Woo"><meta itemprop="url" content="https://kdramahood.com/dh-cast/ji-woo/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Kang Ki-Doong"><meta itemprop="url" content="https://kdramahood.com/dh-cast/kang-ki-doong/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Kim Rae-won"><meta itemprop="url" content="https://kdramahood.com/dh-cast/kim-rae-won/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Lee Woo-je"><meta itemprop="url" content="https://kdramahood.com/dh-cast/lee-woo-je/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Seo Hyun-Chul"><meta itemprop="url" content="https://kdramahood.com/dh-cast/seo-hyun-chul/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Son Ho-jun"><meta itemprop="url" content="https://kdramahood.com/dh-cast/son-ho-jun/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Son Ji-yoon"><meta itemprop="url" content="https://kdramahood.com/dh-cast/son-ji-yoon/"></div><div itemprop="actors" itemscope itemtype="http://schema.org/Person"><meta itemprop="name" content="Woo Mi-hwa"><meta itemprop="url" content="https://kdramahood.com/dh-cast/woo-mi-hwa/"></div><!-- end Micro data -->
<div class="ladoA">
<div id="fixar">
<div class="imagen">
<img src="https://image.tmdb.org/t/p/w185/s5aDuYwUIh2OdcvvDBJ65yQu1o4.jpg" loading="lazy" width="175" height="263" itemprop="image" alt="The First Responders" />
</div>
<div class="meta-a"><p>소방서 옆 경찰서</p></div><div class="meta-b">
<span class="metx bccx"><i>1</i> Seasons </span><span class="metx"><i>12</i> Episodes </span></div>

</div></div>
<!-- ladoA -->
<div class="ladoB">
<div class="central">


				<link rel="preload" as="image" href="https://image.tmdb.org/t/p/w780/vAnA5SsisRSlUCU44r18eKzaDt5.jpg">
<div class="cover" style="background-image:url(https://image.tmdb.org/t/p/w780/vAnA5SsisRSlUCU44r18eKzaDt5.jpg)">
<span class="status">Ended</span><h1 itemprop="name">The First Responders</h1>
<div class="degradado"></div>
</div>
<!-- cover -->
<div id="metatv" class="metax1">
<div class="imdb_r covete">
</div>
<div class="tvsocial">
<ul>
<li class="fbtv"><a class="radiushare" href="javascript: void(0);" onclick="if (!window.__cfRLUnblockHandlers) return false; window.open ('http://www.facebook.com/sharer.php?u=https://kdramahood.com/dh/the-first-responders/', 'Facebook', 'toolbar=0, status=0, width=650, height=450');" data-cf-modified-2532b08f2e8369f8550f13d4-=""><i class="icon-facebook-f"></i>Share</a></li>
<li><a class="more radiushare"><b class="icon-dots-three-horizontal"></b></a>
<ul class="sub">
<li><a class="twr" href="javascript: void(0);" onclick="if (!window.__cfRLUnblockHandlers) return false; window.open ('https://twitter.com/intent/tweet?text=The First Responders&amp;url=https://kdramahood.com/dh/the-first-responders/', 'Twitter', 'toolbar=0, status=0, width=650, height=450');" data-rurl="https://kdramahood.com/dh/the-first-responders/" data-cf-modified-2532b08f2e8369f8550f13d4-=""><b class="icon-twitter2"></b></a></li>
<li><a class="gog" href="javascript: void(0);" onclick="if (!window.__cfRLUnblockHandlers) return false; window.open ('https://plus.google.com/share?url=https://kdramahood.com/dh/the-first-responders/', 'Google plus', 'toolbar=0, status=0, width=650, height=450');" data-cf-modified-2532b08f2e8369f8550f13d4-=""><b class="icon-google"></b></a></li>
<li><a class="pit" href="javascript: void(0);" onclick="if (!window.__cfRLUnblockHandlers) return false; window.open ('https://pinterest.com/pin/create/button/?url=https://kdramahood.com/dh/the-first-responders/&amp;media=https://image.tmdb.org/t/p/w780/vAnA5SsisRSlUCU44r18eKzaDt5.jpg&amp;description=The First Responders', 'Pinterest', 'toolbar=0, status=0, width=650, height=450');" data-cf-modified-2532b08f2e8369f8550f13d4-=""><b class="icon-pinterest"></b></a></li>
</ul>
<li>
</ul>
</div>
</div>
<!-- rating y social -->
<ul class="navtv idTabs">
<li><a class="info " href="#info">Information</a></li>
<li><a class="episodes selected" href="#seasons">Episodes</a></li>
<li><a class="comentar" href="#trailer">Trailer</a></li>
<li class="restet"><a class="comentar" href="#coments">Reviews</a></li>
</ul>
<!-- Composite Start -->

<!-- Composite End -->

	<div id="seasons">
<h2 class="css3">Episodes</h2>
<div class="se-c">
<div class="se-q"><span class="se-t se-o">1</span>    <span class="title">The First Responders </span></div>
	<div class="se-a" style="display: block">
    
    <div style=" height:300px; margin-top:10px;"><script data-cfasync="false" async type="text/javascript" src="//heardsoppy.com/tNzYHhHWIGOI8/33548"></script></div>
    <!-- <iframe style="margin-right:10px; flex:0 1 250px; padding-top:30px; padding-bottom:30px;" width="300" height="250" src="https://kdramahood.com/source/dbikeinsurance.php" frameborder="0" allowfullscreen="true" scrolling="no"></iframe> -->
<ul class="episodios">
	<li>
<div class="numerando">12</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-12/">
Episode 12</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">11</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-11/">
Episode 11</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">10</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-10/">
Episode 10</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">9</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-9/">
Episode 9</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">8</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-8/">
Episode 8</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">7</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-7/">
Episode 7</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">6</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-6/">
Episode 6</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">5</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-5/">
Episode 5</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">4</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-4/">
Episode 4</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">3</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-3/">
Episode 3</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">2</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-2/">
Episode 2</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

<li>
<div class="numerando">1</div>
<div class="episodiotitle">
<a href="https://kdramahood.com/nt/the-first-responders-ep-1/">
Episode 1</a>
<span class="date">EngSub</span>
<span class="eyes"><i class="icon-eye2"></i></span>
<div>
</li>

</ul>
</div>
</div>
</div>

<div id="info">
<h2 class="css3" style=" line-height: 22px; "> Korean Drama The First Responders With English Subtitles Download and Watch Online . 
</h2>

<div class="metadatac"><b>Original name</b><span itemprop="name">소방서 옆 경찰서</span></div><div class="metadatac"><b>Starring</b><a href="https://kdramahood.com/dh-cast/gong-seung-yeon/" rel="tag">Gong Seung-yeon</a>, <a href="https://kdramahood.com/dh-cast/ji-woo/" rel="tag">Ji-Woo</a>, <a href="https://kdramahood.com/dh-cast/kang-ki-doong/" rel="tag">Kang Ki-Doong</a>, <a href="https://kdramahood.com/dh-cast/kim-rae-won/" rel="tag">Kim Rae-won</a>, <a href="https://kdramahood.com/dh-cast/lee-woo-je/" rel="tag">Lee Woo-je</a>, <a href="https://kdramahood.com/dh-cast/seo-hyun-chul/" rel="tag">Seo Hyun-Chul</a>, <a href="https://kdramahood.com/dh-cast/son-ho-jun/" rel="tag">Son Ho-jun</a>, <a href="https://kdramahood.com/dh-cast/son-ji-yoon/" rel="tag">Son Ji-yoon</a>, <a href="https://kdramahood.com/dh-cast/woo-mi-hwa/" rel="tag">Woo Mi-hwa</a></div>
<!-- <div class="backdropss">
<h2></h2>
<div id="backdrops" class="galeria animax">
</div>
</div>
 -->
<div class="contenidotv">
<h2>Synopsis of The First Responders</h2>
<div itemprop="description">

<p style="font-size=16px "> You can download The First Responders with english subtitles in 720p(HD) quality and 
download the subtitle in srt form. Raw episode is uploaded first and eng subs are added in few hours. Please bookmark our site for regular updates.</p>
</div>
</div>
<div class="metadatac"><b>Airs On</b><span><a href="https://kdramahood.com/drama-networks/sbs/" rel="tag">SBS</a></span></div><div class="metadatac"><b>Production</b><span><a href="https://kdramahood.com/drama-studio/mega-monster/" rel="tag">Mega Monster</a>, <a href="https://kdramahood.com/drama-studio/studio-s/" rel="tag">Studio S</a></span></div><div class="metadatac"><b>Release Year</b><span><a href="https://kdramahood.com/drama-release-year/2022/" rel="tag">2022</a></span></div><div class="metadatac"><b>Firt air date</b><span itemprop="datePublished">2022-11-12</span></div><div class="metadatac"><b>Type</b><span>Scripted</span></div><div class="metadatac"><b>Episode runtime</b><span>65 min</span></div> <div class="metadatac"><b>TV Status</b><span>Ended</span></div></div>


<div id="coments"></div>
<!-- comentarios -->
<div id="trailer">
<h2 class="css3">Videos</h2>
<div class="nodata">No data available</div></div>
<!-- trailer y videos -->

<!-- <h2 class="css3"></h2> -->
<div class="comentarios">

<div style="text-align:center; padding-top:30px; padding-bottom:30px; display:flex; flex-wrap:wrap; justify-content: space-around; gap: 30px 0px;">
								<!-- <iframe width="300" height="300" style="margin-bottom:30px" src="https://kdramahood.com/source/own-damage-car-insurance.php" frameborder="0" allowfullscreen="true" scrolling="no"></iframe> -->
                  <div style="width:280px"><div id="bg_182222609_pre"></div>
<div id="bg_182222609"></div>
<script type="2532b08f2e8369f8550f13d4-text/javascript">(function (){
var urlCB = new Date().getTime();
var sc = window.document.createElement("script");
sc.async = true;sc.defer = true;
sc.src = "//platform.bidgear.com/async.php?domainid=1822&sizeid=2&zoneid=2609&k="+urlCB;
var pr = window.document.getElementById("bg_182222609_pre");
pr.appendChild(sc);})()</script>
 </div>
								<!-- Composite Start display:flex; flex-wrap:wrap; justify-content: space-between; -->
<div style="width:280px">
<script data-cfasync="false" type="text/javascript" src="//lby2kd27c.com/lv/esnk/1989415/code.js" async class="__clb-1989415"></script>
</div>


<!-- Composite End -->
							</div>
 
<div id="disqus_thread">
		</div>



   <!-- Composite Start -->
   <div style="text-align:center; padding-top:30px; padding-bottom:30px; display:flex; flex-wrap:wrap; justify-content: space-between; gap: 40px 0px;">
   
   <!-- <iframe width="300" height="300" style="margin-bottom:30px" src="https://kdramahood.com/source/own-damage-car-insurance.php" frameborder="0" allowfullscreen="true" scrolling="no"></iframe> -->
   


</div>
</div></div>
<!-- central -->
<div class="sidebartv">
<div id="bg_182222609_pre"></div>
<div id="bg_182222609"></div>
<script type="2532b08f2e8369f8550f13d4-text/javascript">(function (){
var urlCB = new Date().getTime();
var sc = window.document.createElement("script");
sc.async = true;sc.defer = true;
sc.src = "//platform.bidgear.com/async.php?domainid=1822&sizeid=2&zoneid=2609&k="+urlCB;
var pr = window.document.getElementById("bg_182222609_pre");
pr.appendChild(sc);})()</script>
<!-- Composite Start -->
<!-- <div style="display:block; height:620px; padding-bottom:30px; ">
						<iframe width="300" height="650" src="https://kdramahood.com/source/car-insurance.php" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>
					</div> -->
					
<!-- Composite End -->
<div id="tv-30886" class="tvitemrel">
<a href="https://kdramahood.com/dh/lovely-runner/">
<div class="imagetvrel"><img src="https://image.tmdb.org/t/p/w185/bpfim0W7nk85vzGLS7sH8cvuNKB.jpg" loading="lazy" width="80" height="113" alt="Lovely Runner" /></div>
<div class="datatvrel">
<h4>Lovely Runner</h4>
<span class="year">2024</span></div>
</a>

</div>
<div id="tv-14869" class="tvitemrel">
<a href="https://kdramahood.com/dh/save-me-2/">
<div class="imagetvrel"><img src="https://i.mydramalist.com/y7yYKc.jpg" loading="lazy" width="80" height="113" alt="Save Me 2" /></div>
<div class="datatvrel">
<h4>Save Me 2</h4>
</div>
</a>

</div>
<div id="tv-31500" class="tvitemrel">
<a href="https://kdramahood.com/dh/serendipitys-embrace/">
<div class="imagetvrel"><img src="https://image.tmdb.org/t/p/w185/a4sw7NrCHrJhQn8HUC4xOhO7cUi.jpg" loading="lazy" width="80" height="113" alt="Serendipity&#8217;s Embrace" /></div>
<div class="datatvrel">
<h4>Serendipity&#8217;s Embrace</h4>
<span class="year">2024</span></div>
</a>

</div>
<div id="tv-1116" class="tvitemrel">
<a href="https://kdramahood.com/dh/i-remember-you/">
<div class="imagetvrel"><img src="https://image.tmdb.org/t/p/w185/eUwu7P08k2hWKOIxSzfD4NoQGrA.jpg" loading="lazy" width="80" height="113" alt="I Remember You" /></div>
<div class="datatvrel">
<h4>I Remember You</h4>
<span class="year">2015</span></div>
</a>

</div>
<div id="tv-30271" class="tvitemrel">
<a href="https://kdramahood.com/dh/between-him-and-her/">
<div class="imagetvrel"><img src="https://image.tmdb.org/t/p/w185/2vW0kD9FG3wSB8fnyDYRpy6WFTJ.jpg" loading="lazy" width="80" height="113" alt="Between Him and Her" /></div>
<div class="datatvrel">
<h4>Between Him and Her</h4>
<span class="year">2023</span></div>
</a>

</div>





</div>

<!-- sidebar -->

</div>
<!-- ladoB -->

</div>
<!-- series -->




<div id="footer" class="tvshows_single ">
<span class="texto">
<B>Dramahood</B> &copy; 2025 All rights reserved</span>
<span class="copyright">
<a<b >Watch and Download Korean Drama Online With English Subtitles</b></a></span>
</div>
</div>
</div>
</div>

<script defer src="https://kdramahood.com/wp-content/themes/grifus/assets/js/functions.min.js?ver=4.0.2" type="2532b08f2e8369f8550f13d4-text/javascript"></script>
<!-- <script async src="https://leehyori1122.github.io/js/functions.min.js?ver=4.0.2"></script> -->
<script defer src="https://kdramahood.com/wp-content/themes/grifus/assets/js/scrollbar.js?ver=4.0.3" type="2532b08f2e8369f8550f13d4-text/javascript"></script>
<!-- <script async src="https://leehyori1122.github.io/js/scrollbar.js?ver=4.0.2"></script> -->



<script type="2532b08f2e8369f8550f13d4-text/javascript" id='dcl_comments-js-extra'>
/* <![CDATA[ */
var countVars = {"disqusShortname":"dramahood"};
var embedVars = {"disqusConfig":{"integration":"wordpress 3.0.21"},"disqusIdentifier":"27496 https:\/\/kdramahood.com\/?post_type=tvshows&p=27496","disqusShortname":"dramahood","disqusTitle":"The First Responders","disqusUrl":"https:\/\/kdramahood.com\/dh\/the-first-responders\/","postId":"27496"};
var dclCustomVars = {"dcl_progress_text":""};
/* ]]> */
</script>
<script type="2532b08f2e8369f8550f13d4-text/javascript" src='https://kdramahood.com/wp-content/plugins/disqus-conditional-load/assets/js/embed-scroll.min.js?ver=11.0.6' id='dcl_comments-js'></script>
<a id="arriba" class="arribatodo" href="#"><b class="icon-chevron-up2"></b></a>

<script src="/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js" data-cf-settings="2532b08f2e8369f8550f13d4-|49" defer></script></body>

</html>
`);