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

    function buildContainer() {
        var container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        return container;
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

    function buildInput() {
        var inputElement = document.createElement("input", { is: "tm-input" });
        inputElement.style.marginTop = "20px";
        inputElement.style.fontSize = "20px";
        inputElement.style.padding = "10px 20px";
        inputElement.style.borderRadius = "5px";
        inputElement.style.border = "none";
        inputElement.style.width = "60%";
        return inputElement;
    }

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

    // ---------- Constants ----------
    var VIDEO_LINKS_KEY = "subVideoLinks";
    var MODEL = "gpt-3.5-turbo";
    var PROMPT = "\nPretend that I am a child and I want to watch a video. \nYou are my parent and are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.\n\nYou may respond with one of the following **and nothing else**:\n\"Yes\" - if the video is allowed\n\"No\" - if the video is not allowed\n";
    // ---------- Helpers ---------
    function askAI(key, messages) {
        return fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: "Bearer ".concat(key),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                temperature: 0,
                messages: messages,
            }),
        })
            .then(function (res) { return res.json(); })
            .then(function (res) {
            var _a;
            var message = (_a = res.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
            return message;
        });
    }
    // ---------- Scenes ----------
    /**
     * Ask for the users OPEN_API_KEY to be able to engage with the AI.
     */
    function buildAskForAPIKeyScene(next) {
        return __awaiter(this, void 0, void 0, function () {
            var API_KEY, overlayElement, containerElement, messageElement, inputElement, buttonElement;
            return __generator(this, function (_a) {
                API_KEY = localStorage.getItem("OPENAI_API_KEY");
                if (API_KEY) {
                    next(API_KEY);
                    return [2 /*return*/];
                }
                overlayElement = buildOverlay();
                containerElement = buildContainer();
                messageElement = buildText("Please Enter Your OpenAI API Key");
                inputElement = buildInput();
                buttonElement = buildButton("Submit", {
                    onClick: function () {
                        var apiKey = inputElement.value.trim();
                        if (apiKey) {
                            // Save the API key and reload the page.
                            localStorage.setItem("OPENAI_API_KEY", apiKey);
                            next(apiKey);
                        }
                    },
                });
                containerElement.appendChild(inputElement);
                containerElement.appendChild(buttonElement);
                overlayElement.appendChild(messageElement);
                overlayElement.appendChild(containerElement);
                document.body.innerHTML = "";
                document.body.appendChild(overlayElement);
                return [2 /*return*/];
            });
        });
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
    function buildIndicatorScene(content) {
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
    // ---------- Main ------------
    function run() {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var currentURL, isAllowed;
            var _this = this;
            return __generator(this, function (_b) {
                currentURL = window.location.href;
                if (!currentURL.includes("watch"))
                    return [2 /*return*/];
                buildIndicatorScene("loading....");
                isAllowed = load(VIDEO_LINKS_KEY).some(function (link) {
                    return currentURL.endsWith(link);
                });
                if (isAllowed)
                    return [2 /*return*/];
                // Ensure OPEN API KEY is loaded (otherwise can't engage with the AI).
                setTimeout(function () {
                    return buildAskForAPIKeyScene(function (key) { return __awaiter(_this, void 0, void 0, function () {
                        var videoTitle, videoDescription, videoMetaData, messages, message, isAllowed;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    videoTitle = (_a = document.querySelector(SELECTORS.title)) === null || _a === void 0 ? void 0 : _a.textContent;
                                    videoDescription = (_b = document.querySelector(SELECTORS.description)) === null || _b === void 0 ? void 0 : _b.textContent;
                                    videoMetaData = "\n      ### VIDEO TITLE\n      ".concat(videoTitle, "\n\n      ### VIDEO DESCRIPTION\n      ").concat(videoDescription, "\n      ");
                                    messages = [
                                        {
                                            role: "system",
                                            content: "".concat(PROMPT).concat(videoMetaData),
                                        },
                                    ];
                                    return [4 /*yield*/, askAI(key, messages)];
                                case 1:
                                    message = _c.sent();
                                    isAllowed = message.includes("Yes");
                                    buildIndicatorScene("Status: ".concat(isAllowed ? "Allowed" : "Not Allowed"));
                                    if (isAllowed) {
                                        add(VIDEO_LINKS_KEY, currentURL);
                                    }
                                    else {
                                        buildBlackoutScene();
                                        return [2 /*return*/];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }, 2000);
                // If it happens to be a valid page or the AI allows me to view it,
                // disable some of the more distracting elements.
                (_a = document.querySelector(SELECTORS.relatedVideos)) === null || _a === void 0 ? void 0 : _a.remove();
                return [2 /*return*/];
            });
        });
    }
    // Perform the check on every new page.
    // See this stack overflow post for why it's done this way
    // https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
    run();
    window.addEventListener("yt-navigate-start", run);

})();
