// ==UserScript==
// @name         Blanket Ban
// @version      2023-03-07
// @description  Blanket Bans access to a specific site.
// @author       zkirby
// @match        https://www.facebook.com/*
// @match        https://twitter.com/*
// @match        https://www.instagram.com/*
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

    function run() {
        if (isWeekend())
            return;
        var overlayElement = buildOverlay();
        var messageElement = buildText("Sorry friend... Get back to work.");
        var buttonElement = buildButton("Okay", {
            onClick: function () { return window.close(); },
        });
        setTimeout(function () {
            overlayElement.appendChild(messageElement);
            overlayElement.appendChild(buttonElement);
            document.body.innerHTML = "";
            document.body.appendChild(overlayElement);
        }, 1000);
    }
    run();

})();
