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


    function __awaiter$1(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator$1(thisArg, body) {
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
            while (_) try {
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

    var RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    var USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';
    var YoutubeTranscriptError = /** @class */ (function (_super) {
        __extends(YoutubeTranscriptError, _super);
        function YoutubeTranscriptError(message) {
            return _super.call(this, "[YoutubeTranscript] \uD83D\uDEA8 " + message) || this;
        }
        return YoutubeTranscriptError;
    }(Error));
    /**
     * Class to retrieve transcript if exist
     */
    var YoutubeTranscript = /** @class */ (function () {
        function YoutubeTranscript() {
        }
        /**
         * Fetch transcript from YTB Video
         * @param videoId Video url or video identifier
         * @param config Get transcript in another country and language ISO
         */
        YoutubeTranscript.fetchTranscript = function (videoId, config) {
            return __awaiter(this, void 0, void 0, function () {
                var identifier, videoPageResponse, videoPageBody, innerTubeApiKey, transcriptResponse, body, transcripts, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            identifier = this.retrieveVideoId(videoId);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, fetch("https://www.youtube.com/watch?v=" + identifier, {
                                    headers: {
                                        'User-Agent': USER_AGENT,
                                    },
                                })];
                        case 2:
                            videoPageResponse = _a.sent();
                            return [4 /*yield*/, videoPageResponse.text()];
                        case 3:
                            videoPageBody = _a.sent();
                            innerTubeApiKey = videoPageBody
                                .split('"INNERTUBE_API_KEY":"')[1]
                                .split('"')[0];
                            if (!(innerTubeApiKey && innerTubeApiKey.length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, fetch("https://www.youtube.com/youtubei/v1/get_transcript?key=" + innerTubeApiKey, {
                                    method: 'POST',
                                    body: JSON.stringify(this.generateRequest(videoPageBody, config)),
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'User-Agent': USER_AGENT,
                                    },
                                })];
                        case 4:
                            transcriptResponse = _a.sent();
                            return [4 /*yield*/, transcriptResponse.json()];
                        case 5:
                            body = _a.sent();
                            if (body.responseContext) {
                                if (!body.actions) {
                                    throw new Error('Transcript is disabled on this video');
                                }
                                transcripts = body.actions[0].updateEngagementPanelAction.content
                                    .transcriptRenderer.body.transcriptBodyRenderer.cueGroups;
                                return [2 /*return*/, transcripts.map(function (cue) { return ({
                                        text: cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
                                            .cue.simpleText,
                                        duration: parseInt(cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
                                            .durationMs),
                                        offset: parseInt(cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
                                            .startOffsetMs),
                                    }); })];
                            }
                            _a.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            e_1 = _a.sent();
                            throw new YoutubeTranscriptError(e_1);
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Generate tracking params for YTB API
         * @param page
         * @param config
         */
        YoutubeTranscript.generateRequest = function (page, config) {
            var _a, _b, _c, _d;
            var params = (_a = page.split('"serializedShareEntity":"')[1]) === null || _a === void 0 ? void 0 : _a.split('"')[0];
            var visitorData = (_b = page.split('"VISITOR_DATA":"')[1]) === null || _b === void 0 ? void 0 : _b.split('"')[0];
            var sessionId = (_c = page.split('"sessionId":"')[1]) === null || _c === void 0 ? void 0 : _c.split('"')[0];
            var clickTrackingParams = (_d = page === null || page === void 0 ? void 0 : page.split('"clickTrackingParams":"')[1]) === null || _d === void 0 ? void 0 : _d.split('"')[0];
            return {
                context: {
                    client: {
                        hl: (config === null || config === void 0 ? void 0 : config.lang) || 'en',
                        gl: (config === null || config === void 0 ? void 0 : config.country) || 'US',
                        visitorData: visitorData,
                        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)',
                        clientName: 'WEB',
                        clientVersion: '2.20200925.01.00',
                        osName: 'Macintosh',
                        osVersion: '10_15_4',
                        browserName: 'Chrome',
                        browserVersion: '85.0f.4183.83',
                        screenWidthPoints: 1440,
                        screenHeightPoints: 770,
                        screenPixelDensity: 2,
                        utcOffsetMinutes: 120,
                        userInterfaceTheme: 'USER_INTERFACE_THEME_LIGHT',
                        connectionType: 'CONN_CELLULAR_3G',
                    },
                    request: {
                        sessionId: sessionId,
                        internalExperimentFlags: [],
                        consistencyTokenJars: [],
                    },
                    user: {},
                    clientScreenNonce: this.generateNonce(),
                    clickTracking: {
                        clickTrackingParams: clickTrackingParams,
                    },
                },
                params: params,
            };
        };
        /**
         *  'base.js' function
         */
        YoutubeTranscript.generateNonce = function () {
            var rnd = Math.random().toString();
            var alphabet = 'ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghjijklmnopqrstuvwxyz0123456789';
            var jda = [
                alphabet + '+/=',
                alphabet + '+/',
                alphabet + '-_=',
                alphabet + '-_.',
                alphabet + '-_',
            ];
            var b = jda[3];
            var a = [];
            for (var i = 0; i < rnd.length - 1; i++) {
                a.push(rnd[i].charCodeAt(i));
            }
            var c = '';
            var d = 0;
            var m, n, q, r, f, g;
            while (d < a.length) {
                f = a[d];
                g = d + 1 < a.length;
                if (g) {
                    m = a[d + 1];
                }
                else {
                    m = 0;
                }
                n = d + 2 < a.length;
                if (n) {
                    q = a[d + 2];
                }
                else {
                    q = 0;
                }
                r = f >> 2;
                f = ((f & 3) << 4) | (m >> 4);
                m = ((m & 15) << 2) | (q >> 6);
                q &= 63;
                if (!n) {
                    q = 64;
                    if (!q) {
                        m = 64;
                    }
                }
                c += b[r] + b[f] + b[m] + b[q];
                d += 3;
            }
            return c;
        };
        /**
         * Retrieve video id from url or string
         * @param videoId video url or video id
         */
        YoutubeTranscript.retrieveVideoId = function (videoId) {
            if (videoId.length === 11) {
                return videoId;
            }
            var matchId = videoId.match(RE_YOUTUBE);
            if (matchId && matchId.length) {
                return matchId[1];
            }
            throw new YoutubeTranscriptError('Impossible to retrieve Youtube video ID.');
        };
        return YoutubeTranscript;
    }());

    // ---------- Constants ----------
    var VIDEO_LINKS_KEY = "subVideoLinks";
    var MODEL = "gpt-3.5-turbo";
    var PROMPT = "\nPretend that I am a child and I want to watch a video. \nYou are my parent and are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.\nRight now I am learning about:\n- Transformers, LLMs, Linear Algebra, and other related topics.\n- React, TypeScript, and other related topics.\n- WebGl, Three.js, and other related topics. \n\nYou may respond with one of the following and **nothing else**:\n\"Yes\" - if the video is allowed\n\"No\" - if the video is not allowed\n";
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
    function getTranscript(url) {
        return __awaiter$1(this, void 0, void 0, function () {
            var transcript;
            return __generator$1(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, YoutubeTranscript.fetchTranscript(url)];
                    case 1:
                        transcript = _b.sent();
                        return [2 /*return*/, transcript.map(function (t) { return t.text; }).join()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, "No Transcript"];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    // ---------- Scenes ----------
    /**
     * Ask for the users OPEN_API_KEY to be able to engage with the AI.
     */
    function buildAskForAPIKeyScene(next) {
        return __awaiter$1(this, void 0, void 0, function () {
            var API_KEY, overlayElement, containerElement, messageElement, inputElement, buttonElement;
            return __generator$1(this, function (_a) {
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
        return __awaiter$1(this, void 0, void 0, function () {
            var currentURL, isAllowed;
            var _this = this;
            return __generator$1(this, function (_b) {
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
                    return buildAskForAPIKeyScene(function (key) { return __awaiter$1(_this, void 0, void 0, function () {
                        var title, description, transcript, _a, videoMetaData, message, isAllowed;
                        var _b, _c;
                        return __generator$1(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    title = (_b = document.querySelector(SELECTORS.title)) === null || _b === void 0 ? void 0 : _b.textContent;
                                    description = (_c = document.querySelector(SELECTORS.description)) === null || _c === void 0 ? void 0 : _c.textContent;
                                    console.log("getting transcript");
                                    return [4 /*yield*/, getTranscript(currentURL)];
                                case 1:
                                    _a = _d.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = "No Transcript";
                                    _d.label = 3;
                                case 3:
                                    transcript = _a;
                                    console.log("tr", transcript.length);
                                    videoMetaData = "\n      ### VIDEO TITLE\n      ".concat(title, "\n\n      ### VIDEO DESCRIPTION\n      ").concat(description, "\n\n      ### VIDEO TRANSCRIPT\n      ").concat(transcript, "\n      ");
                                    return [4 /*yield*/, askAI(key, [
                                            {
                                                role: "system",
                                                content: "".concat(PROMPT).concat(videoMetaData),
                                            },
                                        ])];
                                case 4:
                                    message = _d.sent();
                                    isAllowed = message.includes("Yes");
                                    console.log("msg", message);
                                    if (isAllowed) {
                                        buildIndicatorScene("Status: Allowed");
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
