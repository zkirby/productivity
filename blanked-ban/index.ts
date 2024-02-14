// ==UserScript==
// @name         Blanket Ban
// @version      2023-03-07
// @description  Blanket Bans access to a specific site.
// @author       zkirby
// @match        https://www.instagram.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  document.documentElement.style.display = "none";
  document.addEventListener("DOMContentLoaded", () => {
    document.body.innerHTML =
      '<h1 style="text-align: center; margin-top: 20%;">This site has been disabled.</h1>';
  });
})();
