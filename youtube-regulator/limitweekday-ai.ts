// ==UserScript==
// @name         Youtube Regulator
// @namespace    http://tampermonkey.net/
// @version      2024-01-12
// @description  Regulate your Youtube usage to only the subscriptions page on weekdays. Must ask your 'Parent' to view a video.
// @author       zkirby
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // ---------- Constants ----------
  /**
   * Selectors for the elements we want to manipulate. YouTube's custom element names
   * have a convention of always starting with 'ytd-'.
   */
  const SELECTORS = {
    shorts: "ytd-rich-shelf-renderer[is-shorts]",
    videoLinks: "ytd-thumbnail a#thumbnail",
    relatedVideos: "#related",
  };

  const AI = {
    prompt: `
      Pretend I am a child asking for permission to view a video. You are my parent and are responsible for my well-being.
      As such, you must ensure that I only view videos that are educational and not distracting from my work or studies.
    `,
  };

  // ---------- Helper Functions ----------
  /**
   * Check if today is the weekend
   */
  function isWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  /**
   * Check if the current page is the 'subscriptions' page
   */
  function checkIsSubscriptionPage(currentURL: string) {
    const subscriptionsUrlRegex =
      /^https:\/\/www\.youtube\.com\/feed\/subscriptions/;
    return subscriptionsUrlRegex.test(currentURL);
  }

  /**
   * Blackouts the screen and shows the input prompt to ask
   * the AI overlord if I may pretty please view this video.
   */
  function addBlackoutSceneElements() {
    const overlayElement = document.createElement("div");
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

    const messageElement = document.createElement("div");
    messageElement.style.color = "#ffffff";
    messageElement.style.fontSize = "24px";
    messageElement.textContent = "Sorry friend... Get back to work.";

    const buttonElement = document.createElement("button");
    buttonElement.textContent = "Okay :(";
    buttonElement.style.marginTop = "20px";
    buttonElement.style.fontSize = "20px";
    buttonElement.style.padding = "10px 20px";
    buttonElement.style.border = "none";
    buttonElement.style.borderRadius = "5px";
    buttonElement.style.cursor = "pointer";
    buttonElement.style.backgroundColor = "#202020";
    buttonElement.style.color = "#ffffff";
    buttonElement.onclick = function () {
      window.close();
    };

    const inputElement = document.createElement("input");
    inputElement.style.marginTop = "20px";
    inputElement.style.fontSize = "20px";
    inputElement.style.padding = "10px 20px";
    inputElement.style.borderRadius = "5px";
    inputElement.style.border = "none";
    inputElement.style.width = "60%";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.marginTop = "20px";
    submitButton.style.fontSize = "20px";
    submitButton.style.padding = "10px 20px";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "5px";
    submitButton.style.cursor = "pointer";
    submitButton.style.backgroundColor = "#202020";
    submitButton.style.color = "#ffffff";
    submitButton.onclick = function () {
      askAI(inputElement.value).then(() => window.close());
    };

    overlayElement.appendChild(messageElement);
    overlayElement.appendChild(buttonElement);
    document.body.innerHTML = "";
    document.body.appendChild(overlayElement);
  }

  async function askAI(content: string) {
    const API_KEY = "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";
    const MODEL = "gpt-3.5-turbo";

    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: AI.prompt,
          },
          { role: "user", content },
        ],
      }),
    });
  }

  // ---------- Main Check ------------
  function check() {
    // Allow for unrestricted Youtube access on the weekends.
    if (isWeekend()) return;

    const currentURL = window.location.href;

    // We *must* navigate to the subscriptions page to be allowed to view
    // a video since we're only allowed to view videos from the subscriptions page.
    // While we're on the page, we'll collect all of the valid video links.
    // NOTE: Edge case where we have more valid videos than what's rendered, not a big deal.
    const isSubscriptionPage = checkIsSubscriptionPage(currentURL);
    if (isSubscriptionPage) {
      // TODO: I swear to you I will figure out a better way to do this.
      setTimeout(() => {
        // First, remove the shorts - those don't count.
        const shorts = document.querySelector(SELECTORS.shorts);
        shorts?.remove();

        const subVideoLinks = Array.from(
          document.querySelectorAll(SELECTORS.videoLinks)
        ).map((a) => a.getAttribute("href"));
        localStorage.setItem("subVideoLinks", JSON.stringify(subVideoLinks));
      }, 1000);
    }

    const isSubVideoLink = JSON.parse(
      localStorage.getItem("subVideoLinks") ?? "[]"
    ).some((link) => currentURL.endsWith(link));
    const isAllowed = isSubscriptionPage || isSubVideoLink;

    // Immediately blackout any screen that isn't the subscriptions page
    // or a video from the subscriptions page. Let the AI decide if I can view it.
    if (!isAllowed) addBlackoutSceneElements();

    // If it happens to be a valid page or the AI allows me to view it,
    // disable some of the more distracting elements.
    document.querySelector(SELECTORS.relatedVideos)?.remove();
  }

  // Perform the check on every new page.
  // See this stack overflow post for why it's done this way
  // https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
  check();
  window.addEventListener("yt-navigate-start", check);
})();
