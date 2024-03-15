// ==UserScript==
// @name         Diet Reddit
// @namespace    http://tampermonkey.net/
// @version      2024-01-12
// @description  Regulate your Reddit usage to only subscribed to
// @author       zkirby
// @match        https://www.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    function run() {
        var _a, _b, _c;
        // Remove everything but the subscription feed.
        // Remove search
        (_a = document.querySelector(".reddit-search-bar")) === null || _a === void 0 ? void 0 : _a.remove();
        // Remove left sidebar
        (_b = document.querySelector("#left-sidebar")) === null || _b === void 0 ? void 0 : _b.remove();
        // Remove right sidebar
        (_c = document.querySelector("#right-sidebar-container")) === null || _c === void 0 ? void 0 : _c.remove();
    }
    run();
    document.addEventListener("DOMContentLoaded", run);
    document.addEventListener("load", run);

})();
