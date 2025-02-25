// ==UserScript==
// @name         mb. CAA LINKS
// @version      2022.9.26.1
// @description  musicbrainz.org: Linkifies cover art edit “Filenames” (as specified in http://musicbrainz.org/edit/42525958)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_CAA-LINKS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_CAA-LINKS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2017-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @match        *://*.musicbrainz.org/*/*/edits*
// @match        *://*.musicbrainz.org/*/*/open_edits*
// @match        *://*.musicbrainz.org/edit/*
// @match        *://*.musicbrainz.org/search/edits*
// @match        *://*.musicbrainz.org/user/*/edits/open*
// @run-at       document-end
// ==/UserScript==
"use strict";
var coverArtFilenames = document.querySelectorAll("table.details[class$='cover-art'] > tbody code");
for (var filename = 0; filename < coverArtFilenames.length; filename++) {
	var mbid = coverArtFilenames[filename].textContent.match(/^mbid-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-\d+\.\w+$/);
	if (mbid) {
		var a = document.createElement("a");
		a.setAttribute("href", "//archive.org/0/items/mbid-" + mbid[1] + "/" + coverArtFilenames[filename].textContent);
		a.classList.add("jesus2099CAALink");
		a.appendChild(coverArtFilenames[filename].parentNode.replaceChild(a, coverArtFilenames[filename]));
		var linksRow = getParent(coverArtFilenames[filename], "tbody").insertRow(-1);
		linksRow.appendChild(createTag("th", {}, "Cool links:"));
		linksRow.appendChild(createTag("td", {}, [
			createTag("a", {a: {href: "/release/" + mbid[1] + "/cover-art", class: "jesus2099CAALink_skip"}}, "Cover Art tab"),
			" | ",
			createTag("a", {a: {href: "//archive.org/details/mbid-" + mbid[1]}}, "Archive release page"),
			" | ",
			createTag("a", {a: {href: "//archive.org/download/mbid-" + mbid[1]}}, "Archive file list")
		]));
	}
}
if (document.getElementsByClassName("jesus2099CAALink").length > 0) {
	setInterval(showThumbnails, 2000);
}
function showThumbnails() {
	var failedCAAImages = document.querySelectorAll("table.details[class$='cover-art'] > tbody a[href$='/cover-art']:not(.jesus2099CAALink_skip)");
	for (var image = 0; image < failedCAAImages.length; image++) {
		failedCAAImages[image].classList.add("jesus2099CAALink_skip");
		var associatedCAALink = failedCAAImages[image].parentNode.parentNode.parentNode.parentNode.querySelector("a.jesus2099CAALink");
		if (associatedCAALink) {
			var thumbnail = document.createElement("img");
			thumbnail.setAttribute("title", "unlinked image, still in CAA, cf. filename link above");
			thumbnail.style.setProperty("float", "left");
			thumbnail.style.setProperty("margin-right", "1em");
			thumbnail.style.setProperty("max-width", "600px");
			thumbnail.style.setProperty("border", "thick solid red");
			var CAAurls = [associatedCAALink.getAttribute("href")];
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb500$1"));
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb250$1"));
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_itemimage$1")); // same as _thumb below but less frequent
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb$1")); // will try this first then fallback to above
			failedCAAImages[image].parentNode.parentNode.insertBefore(thumbnail, failedCAAImages[image].parentNode);
			fallbackImageLoader(thumbnail, CAAurls);
		}
	}
}
function fallbackImageLoader(imgNode, srcs) {
	imgNode.addEventListener("error", function(event) {
		if (srcs.length > 1) {
			// removing event listener(s) with cloneNode
			var newImgNode = imgNode.cloneNode(false);
			newImgNode.removeAttribute("src");
			imgNode.parentNode.replaceChild(newImgNode, imgNode);
			fallbackImageLoader(newImgNode, srcs.slice(1));
		} else {
			imgNode.setAttribute("alt", "Error loading unlinked images.");
			imgNode.style.removeProperty("float");
			imgNode.style.setProperty("display", "block");
		}
	});
	imgNode.setAttribute("alt", srcs[0].match(/[^/]+\.\w+$/));
	imgNode.setAttribute("src", srcs[0]);
}
