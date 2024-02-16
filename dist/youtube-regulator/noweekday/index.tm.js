// ==UserScript==
// @name         Youtube Regulator
// @namespace    http://tampermonkey.net/
// @version      2024-01-12
// @description  Regulate your Youtube usage, no weekday usage and limited weekend usage.
// @author       zkirby
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function buildButton(msg, _a) {
        var onClick = _a.onClick;
        var buttonElement = document.createElement("button", {
            is: "tm-button",
        });
        buttonElement.textContent = msg;
        buttonElement.style.marginTop = "20px";
        buttonElement.style.fontSize = "20px";
        buttonElement.style.padding = "10px 20px";
        buttonElement.style.border = "none";
        buttonElement.style.borderRadius = "5px";
        buttonElement.style.cursor = "pointer";
        buttonElement.style.backgroundColor = "#202020";
        buttonElement.style.color = "#ffffff";
        buttonElement.onclick = onClick;
        return buttonElement;
    }

    function buildOverlay() {
        var overlayElement = document.createElement("div", {
            is: "tm-overlay",
        });
        overlayElement.style.position = "fixed";
        overlayElement.style.top = "0";
        overlayElement.style.left = "0";
        overlayElement.style.width = "100%";
        overlayElement.style.height = "100%";
        overlayElement.style.backgroundColor = "#0a0a0a";
        overlayElement.style.display = "flex";
        overlayElement.style.flexDirection = "column";
        overlayElement.style.justifyContent = "center";
        overlayElement.style.alignItems = "center";
        overlayElement.style.zIndex = "1000";
        return overlayElement;
    }

    function buildText(msg) {
        var messageElement = document.createElement("div");
        messageElement.style.color = "#ffffff";
        messageElement.style.fontSize = "24px";
        messageElement.textContent = msg;
        return messageElement;
    }

    /**
     * Check if today is the weekend
     */
    function isWeekend() {
        var today = new Date();
        var dayOfWeek = today.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    }

    var SUBSCRIPTIONS_URL_REGEX = /^https:\/\/www\.youtube\.com\/feed\/subscriptions/;
    /**
     * Check if the current page is the 'subscriptions' page
     */
    function checkIsSubscriptionPage() {
        return SUBSCRIPTIONS_URL_REGEX.test(window.location.href);
    }

    /**
     * Selectors for the elements we want to manipulate. YouTube's custom element names
     * have a convention of always starting with 'ytd-'.
     */
    var SELECTORS = {
        shorts: "ytd-rich-shelf-renderer[is-shorts]",
        videoLinks: "ytd-thumbnail a#thumbnail",
        relatedVideos: "#related",
    };

    /**
     * Puts the URLs of all the non-shorts videos on a page into local storage
     *
     * @param key - The key to store the videos under in local storage
     */
    function set(key) {
        // First, remove the shorts - those don't count.
        var shorts = document.querySelector(SELECTORS.shorts);
        shorts === null || shorts === void 0 ? void 0 : shorts.remove();
        var links = Array.from(document.querySelectorAll(SELECTORS.videoLinks)).map(function (a) { return a.getAttribute("href"); });
        localStorage.setItem("tm-links-".concat(key), JSON.stringify(links));
    }
    /**
     * Gets all of the video links from local storage
     */
    function load(key) {
        var _a;
        return JSON.parse((_a = localStorage.getItem("tm-links-".concat(key))) !== null && _a !== void 0 ? _a : "[]");
    }

    // ---------- Constants ----------
    var VIDEO_LINKS_KEY = "subVideoLinks";
    function buildRestrictionScene() {
        var overlayElement = buildOverlay();
        var messageElement = buildText("Sorry friend... Get back to work.");
        var buttonElement = buildButton("Okay :(", {
            onClick: function () { return window.close(); },
        });
        overlayElement.appendChild(messageElement);
        overlayElement.appendChild(buttonElement);
        document.body.innerHTML = "";
        document.body.appendChild(overlayElement);
    }
    function run() {
        var _a;
        // If it's not the weekend, don't allow for any access at all.
        if (!isWeekend()) {
            buildRestrictionScene();
            return;
        }
        // We *must* navigate to the subscriptions page to be allowed to view
        // a video since we're only allowed to view videos from the subscriptions page.
        // While we're on the page, we'll collect all of the valid video links.
        // NOTE: Edge case where we have more valid videos than what's rendered, not a big deal.
        var isSubscriptionPage = checkIsSubscriptionPage();
        if (isSubscriptionPage) {
            // HACK: Need to wait for the videos to load... couldn't find a better way to do this.
            setTimeout(function () { return set(VIDEO_LINKS_KEY); }, 1000);
        }
        var currentURL = window.location.href;
        var isSubVideoLink = load(VIDEO_LINKS_KEY).some(function (link) {
            return currentURL.endsWith(link);
        });
        var isAllowed = isSubscriptionPage || isSubVideoLink;
        // Immediately blackout any screen that isn't the subscriptions page
        // or a video from the subscriptions page. Let the AI decide if I can view it.
        if (!isAllowed)
            buildRestrictionScene();
        // If it happens to be a valid page or the AI allows me to view it,
        // disable some of the more distracting elements.
        (_a = document.querySelector(SELECTORS.relatedVideos)) === null || _a === void 0 ? void 0 : _a.remove();
    }
    // Perform the check on every new page.
    // See this stack overflow post for why it's done this way
    // https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
    run();
    window.addEventListener("yt-navigate-start", run);

})();
