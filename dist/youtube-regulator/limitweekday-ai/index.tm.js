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

    function createChatBubble(message, isSender) {
        var bubble = document.createElement("div");
        bubble.textContent = message;
        bubble.style.maxWidth = "60%";
        bubble.style.padding = "10px";
        bubble.style.borderRadius = "20px";
        bubble.style.marginBottom = "5px";
        if (isSender) {
            bubble.style.backgroundColor = "#DCF8C6";
            bubble.style.marginLeft = "auto";
        }
        else {
            bubble.style.backgroundColor = "#ECECEC";
        }
        return bubble;
    }
    function buildChatMessage(onSubmit) {
        // Create main chat container
        var chatContainer = document.createElement("div");
        chatContainer.style.display = "flex";
        chatContainer.style.flexDirection = "column";
        chatContainer.style.height = "400px"; // Adjust as needed
        chatContainer.style.width = "800px"; // Adjust as needed
        chatContainer.style.border = "1.5px solid #ccc";
        chatContainer.style.padding = "10px";
        // Create container for chat bubbles
        var bubblesContainer = document.createElement("div");
        bubblesContainer.style.overflowY = "scroll";
        bubblesContainer.style.flexGrow = "1";
        bubblesContainer.style.display = "flex";
        bubblesContainer.style.flexDirection = "column";
        bubblesContainer.style.gap = "10px";
        bubblesContainer.style.padding = "5px";
        // Create input container
        var inputContainer = document.createElement("div");
        inputContainer.style.display = "flex";
        inputContainer.style.gap = "10px";
        // Create text input
        var textInput = document.createElement("input");
        textInput.type = "text";
        textInput.style.flexGrow = "1";
        // Create submit button
        var submitButton = document.createElement("button");
        submitButton.textContent = "Send";
        submitButton.onclick = function () {
            var message = textInput.value.trim();
            if (message) {
                // Assume sender
                var bubble = createChatBubble(message, true);
                bubblesContainer.appendChild(bubble);
                textInput.value = ""; // Clear input after sending
                bubblesContainer.scrollTop = bubblesContainer.scrollHeight; // Scroll to bottom
                onSubmit(message);
            }
        };
        // Append input and button to input container
        inputContainer.appendChild(textInput);
        inputContainer.appendChild(submitButton);
        // Append bubbles container and input container to main chat container
        chatContainer.appendChild(bubblesContainer);
        chatContainer.appendChild(inputContainer);
        return [
            chatContainer,
            function (msg) {
                var bubble = createChatBubble(msg, false);
                bubblesContainer.appendChild(bubble);
                bubblesContainer.scrollTop = bubblesContainer.scrollHeight; // Scroll to bottom
            },
        ];
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
    var PROMPT = "\nPretend that I am a child and I want to watch a video. \nYou are my parent and are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.\nI'm going to try to convince you that I should be allowed to watch the video in question.\nYou are responsible for making the final decision.\nIf you determine that I should be allowed to watch the video, respond with exactly \"I'll allow it\" and nothing else.\n";
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
     * Blackouts the screen and shows the input prompt to ask
     * the AI overlord if I may pretty please view this video.
     */
    function buildAskAIScene(onSubmit) {
        var overlayElement = buildOverlay();
        var containerElement = buildContainer();
        var messageElement = buildText("This Video Is Not Allowed");
        var buttonElement = buildButton("Okay", {
            onClick: function () { return window.close(); },
        });
        var _a = buildChatMessage(onSubmit), chatMessageElement = _a[0], add = _a[1];
        containerElement.appendChild(messageElement);
        containerElement.appendChild(buttonElement);
        overlayElement.appendChild(containerElement);
        overlayElement.appendChild(chatMessageElement);
        document.body.innerHTML = "";
        document.body.appendChild(overlayElement);
        return add;
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
    // ---------- Main ------------
    function run() {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var isSubscriptionPage, currentURL, isSubVideoLink, isAllowed;
            return __generator(this, function (_b) {
                // Allow for unrestricted Youtube access on the weekends.
                if (isWeekend())
                    return [2 /*return*/];
                isSubscriptionPage = checkIsSubscriptionPage();
                if (isSubscriptionPage) {
                    // HACK: Need to wait for the videos to load... couldn't find a better way to do this.
                    setTimeout(function () { return set(VIDEO_LINKS_KEY); }, 1000);
                }
                currentURL = window.location.href;
                isSubVideoLink = load(VIDEO_LINKS_KEY).some(function (link) {
                    return currentURL.endsWith(link);
                });
                isAllowed = isSubscriptionPage || isSubVideoLink;
                // Immediately blackout any screen that isn't the subscriptions page
                // or a video from the subscriptions page. Let the AI decide if I can view it.
                if (!isAllowed) {
                    // Only *direct* video links are allowed
                    if (!currentURL.includes("/watch?v=")) {
                        buildBlackoutScene();
                        return [2 /*return*/];
                    }
                    // Ensure OPEN API KEY is loaded (otherwise can't engage with the AI).
                    setTimeout(function () {
                        return buildAskForAPIKeyScene(function (key) {
                            var _a, _b;
                            // Start the messaging scene loop.
                            var videoTitle = (_a = document.querySelector(SELECTORS.title)) === null || _a === void 0 ? void 0 : _a.textContent;
                            var videoDescription = (_b = document.querySelector(SELECTORS.description)) === null || _b === void 0 ? void 0 : _b.textContent;
                            var videoMetaData = "\n      ### VIDEO TITLE\n      ".concat(videoTitle, "\n\n      ### VIDEO DESCRIPTION\n      ").concat(videoDescription, "\n      ");
                            var messages = [
                                {
                                    role: "system",
                                    content: "".concat(PROMPT).concat(videoMetaData),
                                },
                            ];
                            var add$1 = buildAskAIScene(function (content) {
                                var MODEL = "gpt-3.5-turbo";
                                messages.push({ role: "user", content: content });
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
                                    add$1(message);
                                    if (message.includes("I'll allow it")) {
                                        add(VIDEO_LINKS_KEY, currentURL);
                                        window.location.reload();
                                    }
                                });
                            });
                        });
                    }, 2000);
                }
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
