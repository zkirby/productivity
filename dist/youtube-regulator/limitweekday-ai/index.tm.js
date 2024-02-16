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
        chatContainer.style.height = "800px"; // Adjust as needed
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
    // ---------- Scenes ----------
    /**
     * Ask for the users OPEN_API_KEY to be able to engage with the AI.
     */
    function buildAskForAPIKeyScene() {
        var APIKEY = localStorage.getItem("OPENAI_API_KEY");
        if (APIKEY)
            return APIKEY;
        var overlayElement = buildOverlay();
        var containerElement = buildContainer();
        var messageElement = buildText("Please Enter Your OpenAI API Key");
        var inputElement = buildInput();
        var buttonElement = buildButton("Submit", {
            onClick: function () {
                var apiKey = inputElement.value.trim();
                if (apiKey) {
                    // Save the API key and reload the page.
                    localStorage.setItem("OPENAI_API_KEY", apiKey);
                    window.location.reload();
                }
            },
        });
        containerElement.appendChild(messageElement);
        containerElement.appendChild(inputElement);
        containerElement.appendChild(buttonElement);
        overlayElement.appendChild(containerElement);
        return localStorage.getItem("OPENAI_API_KEY");
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
    // ---------- Main ------------
    function run() {
        var _a;
        // Allow for unrestricted Youtube access on the weekends.
        if (isWeekend())
            return;
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
        if (!isAllowed) {
            // Ensure OPEN API KEY is loaded (otherwise can't engage with the AI).
            var key_1 = buildAskForAPIKeyScene();
            // Start the messaging scene loop.
            var messages_1 = [];
            var add_1 = buildAskAIScene(function (content) {
                var MODEL = "gpt-3.5-turbo";
                return fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer ".concat(key_1),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        temperature: 0,
                        messages: [
                            {
                                role: "system",
                                content: "pretend to be a cat",
                            },
                            { role: "user", content: content },
                        ],
                    }),
                })
                    .then(function (res) { return res.json(); })
                    .then(function (res) {
                    messages_1 = res.choices[0].message;
                    add_1(messages_1);
                });
            });
        }
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
