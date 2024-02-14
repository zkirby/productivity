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
  "use strict";

  const SELECTORS = {
    shorts: "ytd-rich-shelf-renderer[is-shorts]",
    videoLinks: "ytd-thumbnail a#thumbnail",
    relatedVideos: "#related",
  };

  function check() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // I allow myself to use Youtube freely on the weekends.
    // I mean, sheesh, live a little...
    if (isWeekend) return;

    // We *must* navigate to the subscriptions page to be allowed to view
    // a video since we're only allowed to view videos from the subscriptions page.
    // While we're on the page, we'll collect all of the valid video links.
    // NOTE: Edge case where we have more valid videos than what's rendered, not a big deal.
    const currentURL = window.location.href;
    const subscriptionsUrlRegex =
      /^https:\/\/www\.youtube\.com\/feed\/subscriptions/;
    const isSubscriptionPage = subscriptionsUrlRegex.test(currentURL);

    if (isSubscriptionPage) {
      // I swear to you I will figure out a better way to do this.
      setTimeout(() => {
        // First, remove the shorts - those don't count.
        const shorts = document.querySelector(SELECTORS.shorts);
        shorts?.remove();

        const validVideoLinks = Array.from(
          document.querySelectorAll(SELECTORS.videoLinks)
        ).map((a) => a.getAttribute("href"));
        localStorage.setItem(
          "validVideoLinks",
          JSON.stringify(validVideoLinks)
        );
      }, 1000);
    }

    const validVideoLinks = JSON.parse(
      localStorage.getItem("validVideoLinks") ?? "[]"
    );
    const isAllowedOnWeekends =
      isSubscriptionPage ||
      validVideoLinks.some((link) => currentURL.endsWith(link));

    // Immediately whiteout any screen that isn't the subscriptions page
    // or a video from the subscriptions page.
    if (!isAllowedOnWeekends) {
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

      overlayElement.appendChild(messageElement);
      overlayElement.appendChild(buttonElement);
      document.body.innerHTML = "";
      document.body.appendChild(overlayElement);
    }

    // If it happens to be a valid page,
    // disable some of the more distracting elements.
    const relatedVideosFeed = document.querySelector(SELECTORS.relatedVideos);
    relatedVideosFeed?.remove();
  }

  // Perform the check on every new page.
  // See this stack overflow post for why it's done this way
  // https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
  check();
  window.addEventListener("yt-navigate-start", check);
})();
