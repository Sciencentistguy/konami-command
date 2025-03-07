// ==UserScript==
// @name         mb. ALL LINKS
// @version      2022.12.5
// @description  Hidden links include fanpage, social network, etc. (NO duplicates) Generated autolinks (configurable) includes plain web search, auto last.fm, Discogs and Genius searches, etc. Shows begin/end dates on URL and provides edit link. Expands Wikidata links to wikipedia articles.
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ALL-LINKS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALL-LINKS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-08-02; https://web.archive.org/web/20131103162328/userscripts.org/scripts/show/108889 / https://web.archive.org/web/20141011084020/userscripts-mirror.org/scripts/show/108889
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @match        *://*.musicbrainz.org/area/*
// @match        *://*.musicbrainz.org/artist/*
// @match        *://*.musicbrainz.org/event/*
// @match        *://*.musicbrainz.org/instrument/*
// @match        *://*.musicbrainz.org/label/*
// @match        *://*.musicbrainz.org/place/*
// @match        *://*.musicbrainz.org/recording/*
// @match        *://*.musicbrainz.org/release/*
// @match        *://*.musicbrainz.org/release-group/*
// @match        *://*.musicbrainz.org/series/*
// @match        *://*.musicbrainz.org/url/*
// @match        *://*.musicbrainz.org/work/*
// @exclude      *.org/*/*/*annotat*
// @exclude      *.org/*/*/*create*
// @exclude      *.org/*/*/*delete*
// @exclude      *.org/*/*/*edit*
// @exclude      *.org/*/*/*merge*
// @exclude      *.org/*/*/*remove*
// @exclude      *.org/*/*/*split*
// @exclude      *.org/*/*/add-alias*
// @exclude      *.org/*/*annotat*
// @exclude      *.org/*/*create*
// @exclude      *.org/*/*delete*
// @exclude      *.org/*/*edit*
// @exclude      *.org/*/*merge*
// @exclude      *.org/*/*remove*
// @exclude      *.org/*/*split*
// @exclude      *.org/release/add
// @exclude      *.org/release/add?*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* hint for Opera 12 users allow opera:config#UserPrefs|Allowscripttolowerwindow and opera:config#UserPrefs|Allowscripttoraisewindow */
var userjs = "jesus2099_all-links_";
var nonLatinName = /[\u0384-\u1cf2\u1f00-\uffff]/; // U+2FA1D is currently out of js range
var rawLanguages = JSON.parse(localStorage.getItem(userjs + "languages")) || ["navigator", "musicbrainz"];
// Available tokens:
// - for all entity pages: %entity-type% %entity-mbid% %entity-name%
// - for artist entity pages: %artist-sort-name% %artist-family-name-first% %artist-latin-script-name%
// - for release entity pages: %release-barcode%
// - for that type entity pages: %that-mbid% %that-name% where "that" is an entity type in the above @include list
var autolinks = {
	user: JSON.parse(localStorage.getItem(userjs + "user-autolinks")) || {},
	default: {
		"Web pages": "//duckduckgo.com/?q=%entity-name%",
		"Web pages (strict)": "//duckduckgo.com/?q=%2B%22%entity-name%%22",
		"Images": "//duckduckgo.com/?q=%entity-name%+!i",
		"Videos": "//duckduckgo.com/?q=%entity-name%+!v",
		"Credits": null,
		"SACEM (Interprète)": {
			acceptCharset: "ISO-8859-1",
			action: "http://www.sacem.fr/oeuvres/oeuvre/rechercheOeuvre.do",
			parameters: {
				"ftin": "true",
				"tiers": "%artist-name%"
			}
		},
		"SACEM (Auteur‐Compositeur‐Éditeur)": {
			acceptCharset: "ISO-8859-1",
			action: "http://www.sacem.fr/oeuvres/oeuvre/rechercheOeuvre.do",
			parameters: {
				"ftad": "true",
				"tiers": "%artist-name%"
			}
		},
		"JASRAC（アーティスト）": {
			title: "requires JASRAC direct link",
			method: "post",
			acceptCharset: "Shift_JIS",
			enctype: "multipart/form-data",
			action: "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3",
			parameters: {
				"IN_ARTIST_NAME_OPTION1": "0",
				"IN_ARTIST_NAME1": "%artist-name%",
				"IN_DEFAULT_WORKS_KOUHO_MAX": "100",
				"IN_DEFAULT_WORKS_KOUHO_SEQ": "1",
				"IN_DEFAULT_SEARCH_WORKS_NAIGAI": "0",
				"RESULT_CURRENT_PAGE": "1"
			}
		},
		"JASRAC（著作者）": {
			title: "requires JASRAC direct link",
			method: "post",
			acceptCharset: "Shift_JIS",
			enctype: "multipart/form-data",
			action: "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3",
			parameters: {
				"IN_KEN_NAME_OPTION1": "0",
				"IN_KEN_NAME1": "%artist-family-name-first%",
				"IN_KEN_NAME_JOB1": "0",
				"IN_DEFAULT_WORKS_KOUHO_MAX": "100",
				"IN_DEFAULT_WORKS_KOUHO_SEQ": "1",
				"IN_DEFAULT_SEARCH_WORKS_NAIGAI": "0",
				"RESULT_CURRENT_PAGE": "1"
			}
		},
		"音楽の森（アーティスト）": "//www.minc.gr.jp/db/ArtNmSrch.aspx?ArtNm=%artist-name%",
		"音楽の森（著作者）": "//www.minc.gr.jp/db/KenriSrch.aspx?KENRISYANM=%artist-family-name-first%",
		"Lyrics": null,
		"Genius": "//genius.com/search?q=%artist-name%",
		"うたまっぷ（アーティスト）": {
			acceptCharset: "euc-jp",
			action: "http://www.utamap.com/searchkasi.php",
			parameters: {
				"searchname": "artist",
				"word": "%artist-name%"
			}
		},
		"うたまっぷ（作詞者）": {
			acceptCharset: "euc-jp",
			action: "http://www.utamap.com/searchkasi.php",
			parameters: {
				"searchname": "sakusi",
				"word": "%artist-name%"
			}
		},
		"うたまっぷ（作曲者）": {
			acceptCharset: "euc-jp",
			action: "http://www.utamap.com/searchkasi.php",
			parameters: {
				"searchname": "sakyoku",
				"word": "%artist-name%"
			}
		},
		"J-Lyric（歌手）": "http://j-lyric.net/index.php?ka=%artist-name%",
		"歌詞タイム": "//duckduckgo.com/?q=site%3Akasi-time.com+subcat+intitle:%artist-name%",
		"Japanese stuff": null,
		"VGMdb": "http://vgmdb.net/search?q=%artist-name%",
		"ja.Wikipedia": "//ja.wikipedia.org/w/index.php?search=%artist-name%",
		"CDJournal search": {
			acceptCharset: "euc-jp",
			action: "https://cdjournal.com/search/do/",
			parameters: {
				"k": "%artist-name%",
				"target": "a"
			}
		},
		"Joshinweb search": {
			acceptCharset: "Shift_JIS",
			action: "//joshinweb.jp/cdshops/Dps",
			parameters: {
				"KEY": "ARTIST",
				"FM": "0",
				"KEYWORD": "%artist-name%"
			}
		},
		"Yunisan":            "//duckduckgo.com/?q=site:www22.big.or.jp+%22%2F%7Eyunisan%2Fvi%2F%22+%artist-name%",
		"VKDB":               "//duckduckgo.com/?q=site:vkdb.jp+%artist-name%",
		"Vietnamese stuff":   null,
		"vi.Wikipedia":       "//vi.wikipedia.org/w/index.php?search=%artist-name%",
		"nhạc số":            "http://nhacso.net/tim-kiem-nghe-si.html?keyName=%artist-name%",
		"Korean stuff":       null,
		"maniadb":            "http://www.maniadb.com/search/%artist-name%/?sr=P",
		"Other databases":    null,
		"AllMusic":           "http://www.allmusic.com/search/artist/%artist-name%",
		"Discogs":            "http://www.discogs.com/search?q=%artist-name%&type=artist",
		"Discogs (barcode)":  "https://www.discogs.com/search/?q=%release-barcode%&type=release",
		"IFPI (barcode)":     "https://isrcsearch.ifpi.org/#!/search?upcCode=%release-barcode%&tab=lookup&showReleases&start=0&number=100",
		"IMDb":               "//www.imdb.com/find?q=%artist-name%&s=nm",
		"ISNI":               "http://isni.oclc.nl/xslt/CMD?ACT=SRCHA&IKT=8006&TRM=%artist-name%",
		"Rate Your Music":    "//rateyourmusic.com/search?searchtype=a&searchterm=%artist-name%",
		"Second hand songs":  "http://secondhandsongs.com/search?search_text=%artist-name%",
		"VIAF":               "//viaf.org/viaf/search?query=local.names+all+%22%artist-name%%22",
		"WhoSampled":         "//www.whosampled.com/search/artists/?h=1&q=%artist-name%",
		"Stores & streaming": null,
		"Amazon (barcode)":   "https://www.amazon.com/s?k=%release-barcode%",
		"Bandcamp":           "//bandcamp.com/search?q=%artist-name%",
		"Deezer":             "//www.deezer.com/search/%artist-name%",
		"Spotify":            "//open.spotify.com/search/%artist-name%",
		"Spotify (barcode)":  "//open.spotify.com/search/upc:%release-barcode%",
		"SoundCloud":         "//soundcloud.com/search/people?q=%artist-name%",
		"Social media":       null,
		"Facebook":           "//www.facebook.com/search/pages/?q=%artist-name%",
		"Twitter":            "//twitter.com/search?f=users&q=%artist-name%",
		"YouTube":            "//www.youtube.com/results?search_query=%artist-name%&sp=EgIQAg%253D%253D",
		"Other stuff":        null,
		"en.Wikipedia":       "//en.wikipedia.org/w/index.php?search=%artist-name%",
		"*.Wikipedia":        "//duckduckgo.com/?q=site:wikipedia.org+%22%artist-name%%22",
		"Lastfm (mbid)":      "http://last.fm/mbid/%artist-id%",
		"Lastfm (name)":      "http://last.fm/music/%artist-name%",
		"BBC Music":          "http://www.bbc.co.uk/music/artists/%artist-id%",
	}
};
var enabledDefaultAutolinks = {};
var loadedSettings = JSON.parse(localStorage.getItem(userjs + "enabled-default-autolinks")) || {};
for (let link in autolinks.default) if (Object.prototype.hasOwnProperty.call(autolinks.default, link)) {
	enabledDefaultAutolinks[link] = typeof loadedSettings[link] != "undefined" ? loadedSettings[link] : true;
}
var FAVICON_CLASSES = { // from https://github.com/metabrainz/musicbrainz-server/blob/62d70e6e702d2f083bbdfe9f6a6056703a64ed30/root/static/scripts/common/constants.js#L53-L229
	"45cat.com": "fortyfivecat",
	"45worlds.com": "fortyfiveworlds",
	"abc.net.au/triplejunearthed": "triplejunearthed",
	"adp.library.ucsb.edu": "dahr",
	"allmusic.com": "allmusic",
	"animenewsnetwork.com": "animenewsnetwork",
	"anison.info": "anisongeneration",
	"archive.org": "archive",
	"audiomack.com": "audiomack",
	"baidu.com": "baidu",
	"bandcamp.com": "bandcamp",
	"bandsintown.com": "bandsintown",
	"bbc.co.uk": "bbc",
	"beatport.com": "beatport",
	"bibliotekapiosenki.pl": "piosenki",
	"bigcartel.com": "bigcartel",
	"bookbrainz.org": "bookbrainz",
	"books.apple.com": "applebooks",
	"boomplay.com": "boomplay",
	"cancioneros.si": "cancioneros",
	"castalbums.org": "castalbums",
	"catalogue.bnf.fr": "bnfcatalogue",
	"cbfiddle.com/rx/": "cbfiddlerx",
	"ccmixter.org": "ccmixter",
	"cdjapan.co.jp": "cdjapan",
	"changetip.com": "changetip",
	"ci.nii.ac.jp": "cinii",
	"classicalarchives.com": "classicalarchives",
	"cpdl.org": "cpdl",
	"d-nb.info": "dnb",
	"dailymotion.com": "dailymotion",
	"deezer.com": "deezer",
	"dhhu.dk": "dhhu",
	"directlyrics.com": "directlyrics",
	"discogs.com": "discogs",
	"dogmazic.net": "dogmazic",
	"dramonline.org": "dram",
	"encyclopedisque.fr": "encyclopedisque",
	"ester.ee": "ester",
	"facebook.com": "facebook",
	"finna.fi": "finna",
	"finnmusic.net": "finnmusic",
	"flattr.com": "flattr",
	"fono.fi": "fonofi",
	"generasia.com/wiki": "generasia",
	"genius.com": "genius",
	"geonames.org": "geonames",
	"gutenberg.org": "gutenberg",
	"hoick.jp": "hoick",
	"ibdb.com": "ibdb",
	"idref.fr": "idref",
	"imdb.com": "imdb",
	"imslp.org": "imslp",
	"imvdb.com": "imvdb",
	"indiegogo.com": "indiegogo",
	"instagram.com": "instagram",
	"ircam.fr": "ircam",
	"irishtune.info": "irishtune",
	"iss.ndl.go.jp": "ndl",
	"itunes.apple.com": "itunes",
	"j-lyric.net": "jlyric",
	"jazzmusicarchives.com": "jazzmusicarchives",
	"joysound.com": "joysound",
	"junodownload.com": "junodownload",
	"kashinavi.com": "kashinavi",
	"kget.jp": "kget",
	"kickstarter.com": "kickstarter",
	"ko-fi.com": "kofi",
	"laboiteauxparoles.com": "laboiteauxparoles",
	"lantis.jp": "lantis",
	"last.fm": "lastfm",
	"lieder.net": "lieder",
	"linkedin.com": "linkedin",
	"livefans.jp": "livefans",
	"loc.gov": "loc",
	"loudr.fm": "loudr",
	"lyric.evesta.jp": "evestalyric",
	"mainlynorfolk.info": "mainlynorfolk",
	"melon.com": "melon",
	"metal-archives.com": "metalarchives",
	"mixcloud.com": "mixcloud",
	"mora.jp": "mora",
	"music.amazon": "amazonmusic",
	"music.apple.com": "applemusic",
	"music.bugs.co.kr": "bugs",
	"music.migu.cn": "migumusic",
	"music.youtube.com": "youtubemusic",
	"musicapopular.cl": "musicapopularcl",
	"musik-sammler.de": "musiksammler",
	"musixmatch.com": "musixmatch",
	"musopen.org": "musopen",
	"muziekweb.nl": "muziekweb",
	"muzikum.eu": "muzikum",
	"myspace.com": "myspace",
	"napster.com": "napster",
	"nicovideo.jp": "niconicovideo",
	"nla.gov.au": "trove",
	"ocremix.org": "ocremix",
	"offiziellecharts.de": "offiziellecharts",
	"online-bijbel.nl": "onlinebijbel",
	"opac.kbr.be": "kbr",
	"openlibrary.org": "openlibrary",
	"operabase.com": "operabase",
	"overture.doremus.org": "overture",
	"patreon.com": "patreon",
	"paypal.me": "paypal",
	"petitlyrics.com": "petitlyrics",
	"pinterest.com": "pinterest",
	"progarchives.com": "progarchives",
	"psydb.net": "psydb",
	"qim.com": "quebecinfomusique",
	"qobuz.com": "qobuz",
	"ra.co": "residentadvisor",
	"rateyourmusic.com": "rateyourmusic",
	"recochoku.jp": "recochoku",
	"reverbnation.com": "reverbnation",
	"rock.com.ar": "rockcomar",
	"rockensdanmarkskort.dk": "rockensdanmarkskort",
	"rockinchina.com": "ric",
	"rockipedia.no": "rockipedia",
	"rolldabeats.com": "rolldabeats",
	"runeberg.org": "runeberg",
	"saisaibatake.ame-zaiku.com/gakki": "gakki",
	"saisaibatake.ame-zaiku.com/musical": "gakki",
	"saisaibatake.ame-zaiku.com/musical_instrument": "gakki",
	"secondhandsongs.com": "secondhandsongs",
	"setlist.fm": "setlistfm",
	"smdb.kb.se": "smdb",
	"snaccooperative.org": "snac",
	"songfacts.com": "songfacts",
	"songkick.com": "songkick",
	"soundcloud.com": "soundcloud",
	"spirit-of-metal.com": "spiritofmetal",
	"spirit-of-rock.com": "spiritofrock",
	"spotify.com": "spotify",
	"stage48.net": "stage48",
	"target.com": "target",
	"tedcrane.com/DanceDB": "dancedb",
	"theatricalia.com": "theatricalia",
	"thedancegypsy.com": "thedancegypsy",
	"thesession.org": "thesession",
	"tidal.com": "tidal",
	"tiktok.com": "tiktok",
	"tipeee.com": "tipeee",
	"tobarandualchais.co.uk": "tobar",
	"touhoudb.com": "touhoudb",
	"tower.jp": "tower",
	"traxsource.com": "traxsource",
	"triplejunearthed.com": "triplejunearthed",
	"tunearch.org": "tunearch",
	"twitch.tv": "twitch",
	"twitter.com": "twitter",
	"uta-net.com": "utanet",
	"utaitedb.net": "utaitedb",
	"utamap.com": "utamap",
	"utaten.com": "utaten",
	"vgmdb.net": "vgmdb",
	"viaf.org": "viaf",
	"videogam.in": "videogamin",
	"vimeo.com/ondemand": "vimeoondemand",
	"vimeo.com": "vimeo",
	"vk.com": "vk",
	"vkdb.jp": "vkdb",
	"vocadb.net": "vocadb",
	"weibo.com": "weibo",
	"whosampled.com": "whosampled",
	"wikidata.org": "wikidata",
	"wikipedia.org": "wikipedia",
	"wikisource.org": "wikisource",
	"worldcat.org": "worldcat",
	"www.amazon": "amazon",
	"www.youtube.com": "youtube",
	"www5.atwiki.jp/hmiku/": "hmikuwiki",
	"yesasia.com": "yesasia",
};
var favicons = {
	"deezer.com":    "//e-cdns-files.dzcdn.net/cache/images/common/favicon/favicon-16x16.526cde4edf20647be4ee32cdf35c1c13.png",
	"lastfm.":       "//musicbrainz.org/static/images/favicons/lastfm-16.png",
	"rakuten.co.jp": "//plaza.rakuten.co.jp/favicon.ico",
};
var favicontry = [];
var guessOtherFavicons = true;
var sidebar = document.getElementById("sidebar");
var tokenValues = {};
var entityUrlRelsWS = self.location.protocol + "//" + self.location.host + "/ws/2/%entity-type%/%entity-mbid%?inc=url-rels";
var extlinks;
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
j2css.insertRule("ul.external_links > li.defaultAutolink > input[type='checkbox'] { display: none; }", 0);
j2css.insertRule("ul.external_links > li.defaultAutolink.disabled { text-decoration: line-through; display: none; }", 0);
j2css.insertRule("ul.external_links.configure > li.defaultAutolink.disabled { display: list-item; }", 0);
j2css.insertRule("ul.external_links.configure > li.defaultAutolink > input[type='checkbox'] { display: inline; }", 0);
main();
function main() {
	if (sidebar) {
		var entityMatch = self.location.href.match(/\/([a-z-]*)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/i);
		var entityType = tokenValues["%entity-type%"] = entityMatch[1];
		var entityMBID = tokenValues["%entity-mbid%"] = entityMatch[2];
		tokenValues["%" + entityType + "-mbid%"] = entityMBID;
		/* Hidden links and autolinks */
		if (entityType && entityMBID) {
			// Tokens for autolinks
			var entityHeaderClass = (entityType === "release-group" ? "rg" : entityType) + "header";
			var entityNameNode = document.querySelector("div#content > div." + entityHeaderClass + " > h1 a, div#content > div." + entityHeaderClass + " > h1 span[href]"); /* for compatibilly with https://gist.github.com/jesus2099/4111760 */
			if (entityNameNode) {
				var entityName = tokenValues["%entity-name%"] = entityNameNode.textContent.trim();
				tokenValues["%" + entityType + "-name%"] = entityName;
				if (entityType == "artist") {
					// var artistid = tokenValues["%artist-id"] = entityMBID; /* for user links backward compatibility */
					var artistname = entityName;
					var artistsortname, artistsortnameSwapped = "";
					artistsortname = tokenValues["%artist-sort-name%"] = entityNameNode.getAttribute("title");
					if (!artistname.match(nonLatinName)) {
						tokenValues["%artist-family-name-first%"] = artistsortname;
						tokenValues["%artist-latin-script-name%"] = artistname;
					} else {
						var tmpsn = artistsortname.split(",");
						for (let isn = tmpsn.length - 1; isn >= 0; isn--) {
							artistsortnameSwapped += tmpsn[isn].trim();
							if (isn != 0) {
								artistsortnameSwapped += " ";
							}
						}
						tokenValues["%artist-family-name-first%"] = artistname;
						tokenValues["%artist-latin-script-name%"] = artistsortnameSwapped;
					}
				}
			} else if (entityType === "release") {
				let barcodeNode = document.querySelector("#sidebar .barcode");
				if (barcodeNode) {
					tokenValues["%release-barcode%"] = barcodeNode.textContent;
				}
			}
			extlinks = sidebar.querySelector(".external_links");
			if (!extlinks) {
				sidebar.appendChild(createTag("h2", {a: {class: "external-links"}}, "External links"));
				extlinks = sidebar.appendChild(createTag("ul", {a: {class: "external_links"}}, createTag("li", {}, "No white‐listed links yet.")));
			}
			// Hidden links
			entityUrlRelsWS = entityUrlRelsWS.replace(/%entity-type%/, entityType).replace(/%entity-mbid%/, entityMBID);
			addHiddenLinks();
			// Autolinks
			for (let defaultOrUser in autolinks) if (Object.prototype.hasOwnProperty.call(autolinks, defaultOrUser)) {
				var haslinks = false;
				for (let link in autolinks[defaultOrUser]) if (Object.prototype.hasOwnProperty.call(autolinks[defaultOrUser], link)) {
					var target = autolinks[defaultOrUser][link];
					var sntarget = null;
					if (target) {
						if (typeof target == "string") {
							if (target.match(/%artist-name%/) && artistname != artistsortnameSwapped && artistname.match(nonLatinName)) {
								sntarget = target.replace(/%artist-name%/, encodeURIComponent(artistsortnameSwapped));
							}
							target = replaceAllTokens(target, true);
							if (!target) continue;
						} else {
							var latinScriptOnly = target.acceptCharset.match(/iso-8859/i);
							var skippedToken = false;
							for (let param in target.parameters) if (Object.prototype.hasOwnProperty.call(target.parameters, param)) {
								if (latinScriptOnly) {
									target.parameters[param] = target.parameters[param].replace(/%artist-name%/, "%artist-latin-script-name%");
								}
								target.parameters[param] = replaceAllTokens(target.parameters[param]);
								if (!target.parameters[param]) {
									skippedToken = true;
									break;
								}
							}
							if (skippedToken) continue;
						}
					}
					if (addExternalLink({text: link, target: target, sntarget: sntarget, enabledDefaultAutolink: enabledDefaultAutolinks[link]})) {
						if (!haslinks) {
							haslinks = true;
							addExternalLink({text: " " + defaultOrUser.substr(0, 1).toUpperCase() + defaultOrUser.substr(1).toLowerCase() + " autolinks"});
							extlinks.lastChild.previousSibling.appendChild(document.createTextNode(" "));
							extlinks.lastChild.previousSibling.appendChild(createTag("div", {a: {class: "icon img"}, s: {backgroundImage: "url(/static/images/icons/cog.png)"}}, createTag("a", {a: {title: "configure " + defaultOrUser + " autolinks"}, s: {color: "transparent"}, e: {click: configureModule}}, "configure")));
						}
					}
				}
			}
		}
		/* Wikidata to Wikipedia */
		if (rawLanguages && Array.isArray(rawLanguages) && rawLanguages.length > 0) {
			var languages = parseLanguages(rawLanguages);
			var wikidatas = sidebar.querySelectorAll("ul.external_links > li a[href*='wikidata.org/wiki/Q']");
			for (let wd = 0; wd < wikidatas.length; wd++) {
				var wikidataID = wikidatas[wd].getAttribute("href").match(/Q\d+$/);
				if (wikidataID) {
					if (!wikidatas[wd].parentNode.querySelector("a.edit-languages")) {
						addAfter(createTag("div", {a: {class: "icon img"}, s: {backgroundImage: "url(/static/images/icons/cog.png)", opacity: ".5"}}, createTag("a", {a: {class: "edit-languages", title: "choose languages"}, s: {color: "transparent"}, e: {click: configureModule}}, "choose languages")), wikidatas[wd]);
						addAfter(document.createTextNode(" "), wikidatas[wd]);
					}
					var xhr = new XMLHttpRequest();
					xhr.id = wikidataID[0];
					getParent(wikidatas[wd], "li").classList.add(userjs + "-wd-" + xhr.id);
					wikidatas[wd].parentNode.appendChild(createTag("img", {a: {alt: "checking available wikipedia languages…", src: "/static/images/icons/loading.gif"}}));
					xhr.addEventListener("load", function(event) {
						var wikidataListItem = sidebar.querySelector("ul.external_links > li." + userjs + "-wd-" + this.id);
						removeNode(wikidataListItem.querySelector("img[src$='loading.gif']"));
						var wikidata = JSON.parse(this.responseText);
						if (wikidata && wikidata.entities && (wikidata = wikidata.entities[this.id])) {
							for (let languageCode = 0; languageCode < languages.length; languageCode++) {
								var wikiEntry = wikidata.sitelinks[languages[languageCode] + "wiki"];
								if (wikiEntry) {
									var href = wikiEntry.url.replace(/^https?:/, "");
									var ul;
									if (!sidebar.querySelector("ul.external_links > li a[href$='" + href + "']")) {
										if (!ul) {
											ul = wikidataListItem.appendChild(createTag("ul", {s: {listStyle: "none"}}));
										}
										ul.appendChild(createTag("li", {a: {class: "wikipedia-favicon"}, s: {marginLeft: "-22px"}}, [languages[languageCode], ": ", createTag("a", {a: {href: href}}, wikiEntry.title)]));
									}
								}
							}
						}
					});
					xhr.open("get", "https://www.wikidata.org/wiki/Special:EntityData/" + xhr.id + ".json", true);
					xhr.send(null);
				}
			}
		}
	}
}
function addExternalLink(parameters /* text, target, begin, end, sntarget, mbid, enabledDefaultAutolink */) {
	var newLink = true;
	let li;
	if (parameters.target) {
		// This is a link
		if (typeof parameters.target != "string") {
			var form = createTag("form", {a: {action: parameters.target.action}});
			if (parameters.target.title) {
				form.style.setProperty("cursor", "help");
			}
			var info = "\n" + parameters.target.action;
			for (let attr in parameters.target) if (Object.prototype.hasOwnProperty.call(parameters.target, attr)) {
				if (attr == "parameters") {
					for (let param in parameters.target.parameters) if (Object.prototype.hasOwnProperty.call(parameters.target.parameters, param)) {
						info += "\n" + param + "=" + parameters.target.parameters[param];
						form.appendChild(createTag("input", {a: {name: param, type: "hidden", value: parameters.target.parameters[param]}}));
					}
				} else {
					if (attr.match(/acceptCharset|enctype|method/)) {
						info = parameters.target[attr] + " " + info;
					}
					form.setAttribute(attr.replace(/[A-Z]/g, "-$&").toLowerCase(), parameters.target[attr]);
				}
			}
			form.appendChild(createTag("a", {a: {title: info}, e: {
				click: function(event) {
					if (event.button == 0) {
						/* lame browsers ;) */
						if (typeof opera == "undefined") {
							if (event.shiftKey) {
								this.parentNode.setAttribute("target", "_blank");
							} else if (event.ctrlKey) {
								this.parentNode.setAttribute("target", weirdobg());
							}
						}
						this.parentNode.submit();
					}
				},
				mousedown: function(event) {
					event.preventDefault();
					if (event.button == 1) {
						this.parentNode.setAttribute("target", weirdobg());
						this.parentNode.submit();
					}
				}
			}}, parameters.text));
			form.appendChild(document.createTextNode("*"));
			li = createTag("li", {a: {ref: parameters.text}}, form);
		} else {
			var escapedTarget = parameters.target.replace(/'/g, "\\'");
			var existingLink =
				sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "']")
				// MBS adds a trailing code to ASIN URL https://github.com/metabrainz/musicbrainz-server/blob/7b16dfae25fef7ef570bbc96e2d7cb71f123139e/lib/DBDefs/Default.pm#L318-L328
				|| parameters.target.match(/\bamazon\.ca\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=music0b72-20']")
				|| parameters.target.match(/\bamazon\.co\.jp\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=musicbrainzjp-22']")
				|| parameters.target.match(/\bamazon\.co\.uk\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=music080d-21']")
				|| parameters.target.match(/\bamazon\.com\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=musicbrainz0d-20']")
				|| parameters.target.match(/\bamazon\.de\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=music059-21']")
				|| parameters.target.match(/\bamazon\.fr\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=music083d-21']")
				|| parameters.target.match(/\bamazon\.it\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=music084d-21']")
				|| parameters.target.match(/\bamazon\.es\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "?tag=music02e-21']")
				// MBS adds a trailing slash to viaf URL https://github.com/jesus2099/konami-command/issues/293#issuecomment-376875307
				|| parameters.target.match(/\bviaf\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + escapedTarget.replace(/^https?:/, "") + "/']");
			if (existingLink) {
				newLink = false;
				li = getParent(existingLink, "li");
			} else {
				li = createTag("li", {a: {ref: parameters.text}}, createTag("a", {a: {href: parameters.target}}, parameters.text));
			}
			if (parameters.sntarget && newLink) {
				li.appendChild(document.createTextNode(" ("));
				li.appendChild(createTag("a", {a: {href: parameters.sntarget, title: "search with latin name"}}, "lat."));
				li.appendChild(document.createTextNode(")"));
			}
			if (parameters.begin || parameters.end) {
				var ardates = createTag("span", {s: {whiteSpace: "nowrap"}}, " (");
				if (!parameters.begin && parameters.end == "????") {
					ardates.appendChild(archivedDate(parameters.end, parameters.target));
				} else {
					if (parameters.begin) { ardates.appendChild(archivedDate(parameters.begin, parameters.target)); }
					if (parameters.begin != parameters.end) { ardates.appendChild(document.createTextNode("—")); }
					if (parameters.end && parameters.begin != parameters.end) { ardates.appendChild(archivedDate(parameters.end, parameters.target)); }
				}
				ardates.appendChild(document.createTextNode(")"));
				ardates.normalize();
				li.appendChild(ardates);
			}
			if (parameters.mbid) {
				addAfter(createTag("div", {a: {class: "icon img edit-item"}, s: {opacity: ".5"}}, createTag("a", {a: {title: "edit this URL relationship", href: "/url/" + parameters.mbid + "/edit"}, s: {color: "transparent"}}, "edit")), li.querySelector("a"));
				addAfter(document.createTextNode(" "), li.querySelector("a"));
			}
		}
		if (typeof parameters.enabledDefaultAutolink != "undefined") {
			li.classList.add("defaultAutolink");
			var cb = li.appendChild(createTag("input", {a: {type: "checkbox"}, e: {click: function(event) {
				this.parentNode.classList.toggle("disabled", !this.checked);
				var loadedSettings = JSON.parse(localStorage.getItem(userjs + "enabled-default-autolinks")) || {};
				if (this.checked) {
					delete loadedSettings[this.parentNode.getAttribute("ref")];
				} else {
					loadedSettings[this.parentNode.getAttribute("ref")] = false;
				}
				localStorage.setItem(userjs + "enabled-default-autolinks", JSON.stringify(loadedSettings));
			}}}));
			if (parameters.enabledDefaultAutolink === true) {
				cb.checked = true;
			} else if (parameters.enabledDefaultAutolink === false) {
				li.classList.add("disabled");
				cb.checked = false;
			}
		}
		setFavicon(li, (typeof parameters.target == "string") ? parameters.target : parameters.target.action);
	} else {
		// This is a header
		li = createTag("li", {s: {fontWeight: "bold"}, a: {class: "separator"}}, createTag("span", {}, parameters.text));
		if (parameters.text.indexOf(" ") === 0) {
			// Level 1 header
			li.style.setProperty("padding-top", "0px");
			extlinks.insertBefore(li, extlinks.lastChild);
		} else {
			// Level 2 header
			li.style.setProperty("padding", "0px");
			li.firstChild.style.setProperty("float", "right");
			extlinks.appendChild(li);
		}
	}
	if (newLink) {
		if (!parameters.mbid) { li.style.setProperty("opacity", ".5"); }
		if (parameters.target) { extlinks.appendChild(li); }
	}
	return newLink;
}
function addHiddenLinks() {
	loading(true);
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(event) {
		if (this.readyState == 4) {
			if (this.status == 200) {
				loading(false);
				var res = this.responseXML;
				var url, urls = res.evaluate("//mb:relation-list[@target-type='url']/mb:relation", res, nsr, XPathResult.ANY_TYPE, null);
				var haslinks = false;
				while ((url = urls.iterateNext()) !== null) {
					var target = res.evaluate("./mb:target", url, nsr, XPathResult.ANY_TYPE, null);
					target = target.iterateNext();
					var begin, end;
					if ((begin = res.evaluate("./mb:begin", url, nsr, XPathResult.ANY_TYPE, null).iterateNext()) !== null) {
						begin = begin.textContent;
					}
					if ((end = res.evaluate("./mb:end", url, nsr, XPathResult.ANY_TYPE, null).iterateNext()) !== null) {
						end = end.textContent;
					} else if (res.evaluate("./mb:ended", url, nsr, XPathResult.ANY_TYPE, null).iterateNext()) {
						end = "????";
					}
					if (target) {
						if (addExternalLink({text: url.getAttribute("type"), target: target.textContent, mbid: target.getAttribute("id"), begin: begin, end: end})) {
							if (!haslinks) {
								haslinks = true;
								addExternalLink({text: " Hidden links"});
							}
						}
					}
				}
			} else if (this.status >= 400 || this.status == 0) {
				var txt = this.responseText.match(/<error><text>(.+)<\/text><text>/);
				txt = txt ? txt[1] : "";
				error(this.status, txt);
			}
		}
	};
	xhr.open("GET", entityUrlRelsWS, true);
	xhr.send(null);
}
function replaceAllTokens(string, encode) {
	var stringTokens = string.match(/%[a-z]+(?:-[a-z]+)+%/g);
	if (stringTokens) for (let t = 0; t < stringTokens.length; t++) {
		var token = stringTokens[t];
		if (!Object.prototype.hasOwnProperty.call(tokenValues, token)) return false;
		string = string.replace(token, encode ? encodeURIComponent(tokenValues[token]) : tokenValues[token]);
	}
	return string;
}
function setFavicon(li, url) {
	var favclass = "no";
	// MusicBrainz cached favicon CSS classes
	var searchdomain = url.match(/site:([^+]*)\+/);
	var urldomain = searchdomain ? searchdomain[1] : url.split("/")[2];
	for (let classdomain in FAVICON_CLASSES) if (Object.prototype.hasOwnProperty.call(FAVICON_CLASSES, classdomain)) {
		if (urldomain.match(classdomain)) {
			favclass = FAVICON_CLASSES[classdomain];
			break;
		}
	}
	if (favclass != "no") {
		li.classList.add(favclass + "-favicon");
	} else {
		// Static favicon URL dictionary
		var favurlfound = false;
		for (let part in favicons) if (Object.prototype.hasOwnProperty.call(favicons, part)) {
			if (url.indexOf(part) != -1) {
				favurlfound = favicons[part];
				break;
			}
		}
		if (!guessOtherFavicons && !favurlfound) {
			li.classList.add("no-favicon");
		} else {
			// arbitrary /favicon.ico load try out
			if (guessOtherFavicons && !favurlfound) {
				favurlfound = url.match(/(\/\/[^/]+)\//)[1] + "/favicon.ico";
			}
			var ifit = favicontry.length;
			favicontry[ifit] = new Image();
			favicontry[ifit].addEventListener("error", function (event) {
				this.li.classList.add("no-favicon");
			});
			favicontry[ifit].addEventListener("load", function (event) {
				clearTimeout(this.to);
				this.li.style.setProperty("background-image", "url(" + this.src + ")");
				this.li.style.setProperty("background-size", "16px 16px");
			});
			favicontry[ifit].li = li;
			favicontry[ifit].src = favurlfound;
			favicontry[ifit].to = setTimeout(function() {
				// don’t wait for more than 5 seconds
				favicontry[ifit].src = "";
				favicontry[ifit].li.classList.add("no-favicon");
			}, 5000);
		}
	}
}
function weirdobg() {
	var weirdo = userjs + (new Date().getTime());
	try { open("", weirdo).blur(); } catch (error) {}
	self.focus();
	return weirdo;
}
function error(code, text) {
	var ldng = document.getElementById(userjs + "-loading");
	if (ldng) {
		ldng.setAttribute("id", userjs + "-error");
		ldng.style.setProperty("background", "pink");
		ldng.replaceChild(document.createTextNode("Error " + code), ldng.firstChild);
		ldng.appendChild(createTag("a", {a: {href: entityUrlRelsWS}}, "*"));
		ldng.appendChild(document.createTextNode(" in "));
		ldng.appendChild(createTag("a", {a: {href: GM_info.script.supportURL}}, GM_info.script.name));
		ldng.appendChild(document.createTextNode(" ("));
		ldng.appendChild(createTag("a", {e: {click: function(event) {
			var err = document.getElementById(userjs + "-error");
			if (err) { err.parentNode.removeChild(err); }
			addHiddenLinks();
		}}}, "retry"));
		ldng.appendChild(document.createTextNode(")"));
		ldng.appendChild(document.createElement("br"));
		ldng.appendChild(createTag("i", {}, text));
	} else {
		loading(true);
		error(code, text);
	}
}
function loading(on) {
	var ldng = document.getElementById(userjs + "-loading");
	if (on && !ldng) {
		extlinks.appendChild(createTag("li", {a: {id: userjs + "-loading"}}, createTag("img", {a: {alt: "loading all links…", src: "/static/images/icons/loading.gif"}})));
		var li = extlinks.querySelector("ul.external_links > li.all-relationships");
		if (li) {
			li.style.setProperty("display", "none");
		}
	} else if (ldng && !on) {
		ldng.parentNode.removeChild(ldng);
	}
}
function archivedDate(date, url) {
	var text = date == "????" ? "ended" : date.replace(/-/g, "‐");
	if (!url.match(/\.archive\.org\//)) {
		var archiveStamp = "*";
		if (date != "????") {
			archiveStamp = date.replace(/\D/g, "");
			while (archiveStamp.length < 14) archiveStamp += "0";
		}
		return createTag("a", {a: {href: "//wayback.archive.org/web/" + archiveStamp + "/" + url.replace(/https?:\/\//, ""), title: "Internet Archive Wayback Machine capture"}}, text);
	} else {
		return document.createTextNode(text);
	}
}
function nsr(prefix) {
	switch (prefix) {
		case "mb":
			return "http://musicbrainz.org/ns/mmd-2.0#";
		default:
			return null;
	}
}
function guessNavigatorLanguages() {
	if (Array.isArray(navigator.languages)) {
		return navigator.languages;
	} else {
		var language = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage;
		if (language) {
			return [language];
		} else {
			return [];
		}
	}
}
function parseLanguages(inputLanguages) {
	var detectedLanguages = [];
	for (let il = 0; il < inputLanguages.length; il++) {
		let nextLanguage = inputLanguages[il];
		switch (nextLanguage) {
			case "navigator":
				detectedLanguages = detectedLanguages.concat(guessNavigatorLanguages());
				break;
			case "musicbrainz":
				detectedLanguages.push(document.documentElement.getAttribute("lang") || "en");
				break;
			default:
				detectedLanguages.push(nextLanguage);
		}
	}
	var outputLanguages = [];
	for (let dl = 0; dl < detectedLanguages.length; dl++) {
		let nextLanguage = detectedLanguages[dl];
		if (outputLanguages.indexOf(nextLanguage) < 0) {
			outputLanguages.push(nextLanguage);
			if (nextLanguage.match("-")) {
				var splitLanguage = nextLanguage.split("-")[0];
				if (outputLanguages.indexOf(splitLanguage) < 0) {
					outputLanguages.push(splitLanguage);
				}
			}
		}
	}
	return outputLanguages;
}
function configureModule(event) {
	switch (event.target.getAttribute("title")) {
		case "configure user autolinks":
			// TODO: provide a real editor
			var loadedUserAutolinks = localStorage.getItem(userjs + "user-autolinks") || {};
			var newUserAutolinks = prompt("Edit your user autolinks\nCopy/paste in a real editor\nSorry for such an awful prompt\n\nAvailable variables:\n- for all entity pages: %entity-type%, %entity-mbid% and %entity-name%\n- for \"foobar\" entity pages: %foobar-mbid% and %foobar-name% where \"foobar\" is an entity type.\n- for artist entity pages: %artist-sort-name%, %artist-family-name-first% and %artist-latin-script-name%\n\nExample: {\"Search for reviews\": \"//duckduckgo.com/?q=%entity-name%+reviews\",\n\"Search for fans\": \"//duckduckgo.com/?q=%artist-name%+fans\",\n\"Works\": \"/ws/2/artist/%artist-mbid%?inc=works\",\n\"La FNAC\": \"http://recherche.fnac.com/SearchResult/ResultList.aspx?SCat=3%211&Search=%release-name%&sft=1&sa=0\"}", loadedUserAutolinks);
			if (newUserAutolinks && newUserAutolinks != loadedUserAutolinks && JSON.stringify(newUserAutolinks)) {
				localStorage.setItem(userjs + "user-autolinks", newUserAutolinks);
			}
			break;
		case "configure default autolinks":
			// TODO: refresh default autolink statuses
			extlinks.classList.toggle("configure");
			break;
		case "choose languages":
			var defaultLanguages = parseLanguages(["navigator", "musicbrainz"]);
			var navigatorLanguages = guessNavigatorLanguages();
			var musicbrainzLanguage = document.documentElement.getAttribute("lang") || "en";
			var loadedLanguages = (localStorage.getItem(userjs + "languages") || JSON.stringify(rawLanguages)).replace(/,/g, "$& ");
			var newLanguages = prompt("Choose your favourite language(s)\n\nType a language array: [\"favourite language\", \"second favourite\", …, \"least favourite\"]\n\nTwo meta languages can be used:\n- \"navigator\" for navigator settings, currently " + (navigatorLanguages.length > 0 ? "detected as " + JSON.stringify(navigatorLanguages).replace(/,/g, "$& ") : "undetected") + "\n- \"musicbrainz\" for selected MusicBrainz UI language, currently " + (musicbrainzLanguage ? "detected as [" + JSON.stringify(musicbrainzLanguage) + "]" : "undetected") + "\n\nDefault:\n- [\"navigator\", \"musicbrainz\"], currently expands to " + JSON.stringify(defaultLanguages).replace(/,/g, "$& ") + "\n\nSome examples:\n- [\"musicbrainz\", \"fr-FR\", \"en-GB\", \"vi\", \"ja\", \"navigator\"]\n- [\"fr\", \"en\", \"vi\", \"ja\"]\n- [\"en-GB\"]\n- [\"fr-FR\", \"navigator\", \"en-GB\", \"musicbrainz\"]\n- []" + "\n\nCurrent setting expands to " + JSON.stringify(parseLanguages(JSON.parse(loadedLanguages))).replace(/,/g, "$& "), loadedLanguages);
			if (
				newLanguages
				&& (newLanguages = newLanguages.match(/\[(\s*["'](navigator|musicbrainz|\w{2}(-\w{2,}(-\w{2,})?)?)['"]\s*,?\s*)*]/))
				&& (newLanguages = newLanguages[0])
				&& newLanguages != loadedLanguages
				&& JSON.parse(newLanguages)
			) {
				localStorage.setItem(userjs + "languages", newLanguages);
				rawLanguages = JSON.parse(newLanguages);
			}
			break;
	}
}
