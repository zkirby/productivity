// ==UserScript==
// @name         Youtube Regulator
// @namespace    http://tampermonkey.net/
// @version      2024-01-12
// @description  Regulate your Youtube usage to only the subscriptions page on weekdays.
// @author       zkirby
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /**
     * Selectors for the elements we want to manipulate. YouTube's custom element names
     * have a convention of always starting with 'ytd-'.
     */
    var SELECTORS = {
        shorts: "ytd-rich-shelf-renderer[is-shorts]",
        videoLinks: "ytd-thumbnail a#thumbnail",
        relatedVideos: "#related",
        title: "ytd-watch-metadata #title",
        description: "ytd-watch-metadata #description",
    };

    /**
     * Add one video link to the allowed videos
     */
    function add(key, link) {
        var links = load(key);
        links.push(link);
        localStorage.setItem("tm-links-".concat(key), JSON.stringify(links));
    }
    /**
     * Gets all of the video links from local storage
     */
    function load(key) {
        var _a;
        return JSON.parse((_a = localStorage.getItem("tm-links-".concat(key))) !== null && _a !== void 0 ? _a : "[]");
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
     * Blackouts the screen when for when not visiting a direct video link
     */
    function buildBlackoutScene() {
        var overlayElement = buildOverlay();
        var messageElement = buildText("This Page Is Not Allowed");
        overlayElement.appendChild(messageElement);
        document.body.innerHTML = "";
        document.body.appendChild(overlayElement);
    }
    /**
     * A small indicator if the video is allowed or not (mostly for debugging purposes)
     */
    function buildIndicator(content) {
        var detailsBox = document.getElementById("tm-weekend-video-counter");
        if (!detailsBox) {
            detailsBox = document.createElement("div");
            detailsBox.id = "tm-weekend-video-counter";
            detailsBox.style.position = "fixed";
            detailsBox.style.bottom = "20px";
            detailsBox.style.right = "20px";
            detailsBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            detailsBox.style.color = "white";
            detailsBox.style.padding = "10px";
            detailsBox.style.borderRadius = "5px";
            detailsBox.style.zIndex = "1000";
            document.body.appendChild(detailsBox);
        }
        detailsBox.textContent = content;
    }

    var VIDEO_LINKS_KEY = "sub-video-links";
    var PROMPT = "\nYou are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.\nRight now I am learning about:\n- Transformers, LLMs, Linear Algebra, and other related topics.\n- React, TypeScript, and other related topics.\n- WebGl, Three.js, and other related topics. \n\nYou may respond with one of the following and **nothing else**:\n\"Yes\" - if the video is allowed\n\"No\" - if the video is not allowed\n";

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    /** @class */ ((function (_super) {
        __extends(YoutubeTranscriptError, _super);
        function YoutubeTranscriptError(message) {
            return _super.call(this, "[YoutubeTranscript] \uD83D\uDEA8 " + message) || this;
        }
        return YoutubeTranscriptError;
    })(Error));

    var SCRIPT_ID = "tm-transformers";
    var TRANSFORMER_EVENTS = {
        REQUEST: "tm-transformer-request",
        RESPONSE: "tm-transformer-response",
        LOADED: "tm-transformer-loaded",
    };
    var MODEL = "Xenova/LaMini-Flan-T5-783M";
    function run$1() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var title, description, videoMetaData;
            return __generator(this, function (_c) {
                title = (_a = document.querySelector(SELECTORS.title)) === null || _a === void 0 ? void 0 : _a.textContent;
                description = (_b = document.querySelector(SELECTORS.description)) === null || _b === void 0 ? void 0 : _b.textContent;
                videoMetaData = "\nHere is the video contents:\n### VIDEO TITLE\n".concat(title, "\n\n### VIDEO DESCRIPTION\n").concat(description, "\n\nHere is my response about if the video should be allowed:\n   ");
                window.dispatchEvent(new CustomEvent(TRANSFORMER_EVENTS.REQUEST, {
                    detail: {
                        text: "".concat(PROMPT).concat(videoMetaData),
                    },
                }));
                return [2 /*return*/];
            });
        });
    }
    /**
     * Bootstraps the transformers library and sets up a local pipeline
     *
     * NOTE: Implementing this as a script tag is possibly not the most ideal
     * but it is the quickest and easiest relative to using a service worker or
     * spinning up a backend.
     */
    function init() {
        return __awaiter(this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                if (document.getElementById(SCRIPT_ID))
                    return [2 /*return*/];
                script = document.createElement("script");
                script.type = "module";
                script.crossOrigin = "anonymous";
                script.id = SCRIPT_ID;
                script.innerHTML = "\n      import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';\n    \n      async function run() {\n        env.allowLocalModels = false;\n        // Enable for debugging\n        // env.useFSCache = false;\n        // env.useBrowserCache = false;\n  \n        const classifier = await pipeline('text2text-generation', '".concat(MODEL, "');\n       \n        window.addEventListener(\"").concat(TRANSFORMER_EVENTS.REQUEST, "\", async (e) => {\n            const { text } = e.detail;\n            const response = await classifier(text);\n        \n            console.log(response[0].generated_text);\n            window.dispatchEvent(\n                new CustomEvent(\"").concat(TRANSFORMER_EVENTS.RESPONSE, "\", {\n                detail: {\n                    result: response[0].generated_text.slice(-50),\n                },\n            }));\n        });\n\n        window.dispatchEvent(new CustomEvent(\"").concat(TRANSFORMER_EVENTS.LOADED, "\"));\n      }\n      run().catch(console.error);\n      ");
                window.addEventListener(TRANSFORMER_EVENTS.RESPONSE, function (e) {
                    // @ts-expect-error
                    var isAllowed = e.detail.result.includes("Yes");
                    if (isAllowed) {
                        buildIndicator("Status: Allowed");
                        add(VIDEO_LINKS_KEY, window.location.href);
                    }
                    else {
                        buildBlackoutScene();
                        return;
                    }
                });
                document.body.appendChild(script);
                window.addEventListener(TRANSFORMER_EVENTS.LOADED, run$1);
                return [2 /*return*/];
            });
        });
    }
    var LocalRunner = {
        run: run$1,
        init: init,
    };

    var Runner = LocalRunner ;
    // ---------- Main ------------
    function run() {
        return __awaiter(this, void 0, void 0, function () {
            var currentURL, isAllowed;
            return __generator(this, function (_a) {
                currentURL = window.location.href;
                if (!currentURL.includes("watch"))
                    return [2 /*return*/];
                buildIndicator("loading....");
                isAllowed = load(VIDEO_LINKS_KEY).some(function (link) {
                    return currentURL.endsWith(link);
                });
                if (isAllowed)
                    return [2 /*return*/];
                Runner.run();
                return [2 /*return*/];
            });
        });
    }
    Runner.init();
    // Perform the check on every new page.
    // See this stack overflow post for why it's done this way
    // https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
    window.addEventListener("yt-navigate-start", run);

})();
