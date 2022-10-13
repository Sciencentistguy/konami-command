// ==UserScript==
// @name         ymail-basic. ADVANCED TURBO
// @version      2022.9.26
// @description  Make BASIC Yahoo! MAIL more ADVANCED, SHIFT+CLICK for range-(un)select e-mails / TURBO select all / TURBO actions (e-mail moves, star/read/unread flags, etc.) will trigger immediately upon select / keyboard shortcuts (CTRL+A, DEL, ←, →) / Remove ads crap
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/ymail-basic_ADVANCED-TURBO
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/ymail-basic_ADVANCED-TURBO.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2013-09-12 https://web.archive.org/web/20140328200919/userscripts.org/scripts/show/177655 / https://web.archive.org/web/20141011084019/userscripts-mirror.org/scripts/show/177655
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224#workaround-github.com/violentmonkey/violentmonkey/issues/1581-ymail-basic_ADVANCED-TURBO
// @grant        none
// @include      /^https?://mail.yahoo.com/b/.*/
// @run-at       document-end
// ==/UserScript==
"use strict";
// ---CONFIG---
var KEYBOARD_SHORTCUTS = true; // CTRL+A: select all, DEL: delete e-mail, LEFT ARROW: previous message, RIGHT ARROW: next message
var REMOVE_CRAP = true; // FULL SCREEN DISPLAY. removes various distracting craps (ads, etc.)
// ---CONFIG---
var userjs = {key: 177655, name: "ymail-basic. ADVANCED TURBO"};
var DEBUG = localStorage.getItem("jesus2099debug");
var selectAllSelector = "div#selectAllButton > button[name='action'][type='submit'][value='selectAll']";
var shortcuts = {
	"Escape": {key: "ESC", button: "#content > table > tbody table[data-test-id='message-toolbar'] > tbody td > a:not([href*='/messages/'])"},
	"ArrowLeft": {key: "←", button: "#content > table > tbody table[data-test-id='message-toolbar'] > tbody td > a[href*='/messages/']:first-child, #content table > tbody table > tbody div[data-test-id='pagination'] > a[href*='offset=']:nth-child(2)"},
	"ArrowRight": {key: "→", button: "#content > table > tbody table[data-test-id='message-toolbar'] > tbody td > a[href*='/messages/']:nth-child(2), #content table > tbody table > tbody div[data-test-id='pagination'] > a[href*='offset=']:nth-child(4)"},
	"Delete": {key: "DEL", button: "#content table > tbody table > tbody button[name='action'][value='moveToFolder']"},
	"ctrl+a": {noreload: true, button: selectAllSelector},
	"a": {button: "#content table > tbody table > tbody button[name='action'][value='replyAll']"},
	"f": {button: "#content table > tbody table > tbody button[name='action'][value='forward']"},
	"i": {button: "#content > table > tbody div[data-test-id='blocked-images'] > a[href$='unblockNow=true']"},
	"m": {button: "#content table > tbody table > tbody span[data-test-id='toolbar-dropdown'] > select[name='toolbar_option[top]'] > option[value='flag']"},
	"n": {button: "#app table > tbody table > tbody a[data-test-id='compose-button']"},
	"r": {button: "#content table > tbody table > tbody button[name='action'][value='reply']"},
	"s": {button: "#content table > tbody table > tbody button[name='action'][value='markAsSpam'], #content table > tbody table > tbody button[name='action'][value='markAsNotSpam']"},
	"u": {button: "#content table > tbody table > tbody span[data-test-id='toolbar-dropdown'] > select[name='toolbar_option[top]'] > option[value='markAsUnread']"},
};
var emails = document.querySelectorAll("table#datatable > tbody > tr > td > h2 > a.mlink");
if (emails) {
	// select multiple e-mails with shift+click first last (range click)
	var lastemcb = -1;
	var emcbs = document.querySelectorAll("table#messageListContainer > tbody > tr > td > input[type='checkbox'][name='mids[]']");
	var selectall = document.querySelector(selectAllSelector);
	if (selectall && emcbs) {
		hackit(selectall, "(TURBO)");
		selectall.addEventListener("click", function(event) {
			stop(event);
			if (emcbs.length > 0) {
				sendEvent(emcbs[0], "ctrl+click");
			}
		}, false);
	}
	for (var emcb = 0; emcb < emcbs.length; emcb++) {
		hackit(emcbs[emcb], "SHIFT+CLICK for range-(un)select\nCTRL+CLICK for (un)select all");
		emcbs[emcb].addEventListener("click", function(event) {
			if (event.ctrlKey || event.shiftKey && lastemcb > -1) {
				var i = 0;
				var max = emcbs.length;
				if (!event.ctrlKey) {
					i = indexOf(this, emcbs);
					max = Math.max(lastemcb, i);
					i = Math.min(lastemcb, i);
				}
				for (; i < max; i++) {
					if (emcbs[i].checked != this.checked) {
						emcbs[i].checked = this.checked;
					}
				}
				lastemcb = -1;
			} else {
				lastemcb = indexOf(this, emcbs);
			}
		}, false);
	}
	// auto apply actions (star/read/unread flags, move, etc.)
	var autofire = [
		{triggers: "#content table > tbody table > tbody span[data-test-id='toolbar-dropdown'] > select[name='toolbar_option[top]']", submit: "#content table > tbody table > tbody span[data-test-id='toolbar-dropdown'] > select[name='toolbar_option[top]'] + button[type='submit'][name='toolbar_action'][value='top']" },
		{triggers: "#content table > tbody table > tbody span[data-test-id='toolbar-dropdown'] > select[name='toolbar_option[bottom]']", submit: "#content table > tbody table > tbody span[data-test-id='toolbar-dropdown'] > select[name='toolbar_option[bottom]'] + button[type='submit'][name='toolbar_action'][value='bottom']" },
		{triggers: "#content table > tbody table > tbody select[name='sort_option[bottom]']", submit: "#content table > tbody table > tbody select[name='sort_option[bottom]'] + button[type='submit'][name='sort_action'][value='bottom']" },
	];
	for (var af = 0; af < autofire.length; af++) {
		var triggers = document.querySelectorAll(autofire[af].triggers);
		if (triggers.length > 0 && document.querySelector(autofire[af].submit)) {
			for (var tr = 0; tr < triggers.length; tr++) {
				hackit(triggers[tr], "(Action will trigger immediately uppon select)");
				triggers[tr].setAttribute("afsbmt", autofire[af].submit);
				triggers[tr].addEventListener("change", function(event) {
					try {
						doThis(document.querySelector(this.getAttribute("afsbmt")));
					} catch (error) {}
				}, false);
			}
		}
	}
	// keyboard shortcuts
	if (KEYBOARD_SHORTCUTS) {
		document.addEventListener("keydown", interceptKeys, false);
		document.addEventListener("keyup", interceptKeys, false);
		for (var sc in shortcuts) if (Object.prototype.hasOwnProperty.call(shortcuts, sc)) {
			try {
				hackit(shortcuts[sc].button, "", "[" + (shortcuts[sc].key || sc.toUpperCase()) + "]");
			} catch (error) {}
		}
	}
	// remove crap
	if (REMOVE_CRAP) {
		var j2delcrapss = document.createElement("style");
		j2delcrapss.setAttribute("type", "text/css");
		document.head.appendChild(j2delcrapss);
		j2delcrapss = j2delcrapss.sheet;
		j2delcrapss.insertRule([
			"#app > div > table > tbody > tr > td[rowspan='2']",
			"a[href$='relevantads.html']",
			"a[href*='//beap.adss.yahoo.com/']",
			"a[href*='//beap.gemini.yahoo.com/mbclk']",
			"div.left_mb",
			"div[class$='-ad']",
			"div[class^='ad-']",
			"div[data-test-id='pencil-ad']",
			"img[src*='//beap.adss.yahoo.com/']",
			"td.sky-ad",
			"tr.layoutfixer td.c3",
			"div#video-player.M_A"
		].join(", ") + "{ display: none; }", 0);
		try {
			getParent(document.querySelector("table.tbl tr > td.spnsr"), "tr").style.setProperty("display", "none");
		} catch (error) {}
	}
}
function hackit(_obj, title, text) {
	var obj = findNode(_obj);
	obj.style.setProperty("background-color", "#cfc");
	obj.style.setProperty("color", "#030");
	obj.style.setProperty("cursor", "help");
	obj.setAttribute("title", (obj.getAttribute("title") ? obj.getAttribute("title") + " " : "") + title);
	if (text) {
		if (obj.tagName && obj.tagName == "INPUT") {
			obj.setAttribute("value", obj.getAttribute("value") + " " + text);
		} else if (obj.tagName && obj.textContent.match(/\w+/)) {
			var label = obj.firstChild.tagName ? obj.firstChild : obj;
			label.appendChild(document.createTextNode(" " + text));
		}
	}
}
function findNode(argh) {
	if (typeof argh == "string") {
		return document.querySelector(argh);
	} else if (argh.tagName) {
		return argh;
	} else if (argh.length) {
		for (var vrouf, paf = 0; paf < argh.length; paf++) {
			if ((vrouf = document.querySelector(argh[paf]))) {
				return vrouf;
			}
		}
	}
}
function interceptKeys(event) {
	var key = (event.ctrlKey ? "ctrl+" : "") + event.key;
	try {
		if (DEBUG) console.log(userjs.name + " key " + key + (shortcuts[key] ? " on " + event.target + ".\n" + key + " (custom key: " + shortcuts[key].key + ") → " + shortcuts[key].button : ""));
		if (!event.target || !event.target.tagName || !event.target.tagName.match(/input|select|textarea/i) || event.target.tagName.match(/input/i) && event.target.getAttribute("type") && !event.target.getAttribute("type").match(/password|text/i)) {
			if (event.type == "keydown") {
				doThis(shortcuts[key].button, shortcuts[key].noreload);
			}
			return stop(event);
		}
	} catch (error) {}
}
function doThis(butt, noreload) {
	var button = findNode(butt);
	var opt = (button.tagName == "OPTION");
	var inp = opt ? button.parentNode : button;
	if (opt) {
		inp.selectedIndex = button.index;
	}
	if (!noreload) {
		inp.style.setProperty("background-color", "gold");
	}
	sendEvent(inp, opt ? "change" : "click");
}
function indexOf(element, array) {
	var i = -1;
	for (var a = 0; a < array.length; a++) {
		if (array[a] == element) {
			i = a;
			break;
		}
	}
	return i;
}
