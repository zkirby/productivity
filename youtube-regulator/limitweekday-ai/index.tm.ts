import buildButton from "../../lib/elements/buildButton";
import buildContainer from "../../lib/elements/buildContainer";
import buildOverlay from "../../lib/elements/buildOverlay";
import buildText from "../../lib/elements/buildText";
import isWeekend from "../../lib/isWeekend";
import checkIsSubscriptionPage from "../lib/checkIsSubscriptionPage";
import buildChatMessage from "../lib/elements/buildChatMessage";
import { SELECTORS } from "../lib/youtube.constants";

// ---------- Constants ----------
const AI = {
  prompt: `
      Pretend I am a child asking for permission to view a video. You are my parent and are responsible for my well-being.
      As such, you must ensure that I only view videos that are educational and not distracting from my work or studies.
    `,
};

// ---------- Scene ----------
/**
 * Blackouts the screen and shows the input prompt to ask
 * the AI overlord if I may pretty please view this video.
 */
function buildAskAIScene() {
  const overlayElement = buildOverlay();
  const containerElement = buildContainer();

  const messageElement = buildText("This Video Is Not Allowed");
  const buttonElement = buildButton("Okay", {
    onClick: () => window.close(),
  });

  const chatMessageElement = buildChatMessage();

  containerElement.appendChild(messageElement);
  containerElement.appendChild(buttonElement);

  overlayElement.appendChild(containerElement);
  overlayElement.appendChild(chatMessageElement);

  document.body.innerHTML = "";
  document.body.appendChild(overlayElement);
}

// async function askAI(content: string) {
//   const API_KEY = process.env.OPENAI_API_KEY;
//   const MODEL = "gpt-3.5-turbo";

//   return fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: MODEL,
//       temperature: 0,
//       messages: [
//         {
//           role: "system",
//           content: AI.prompt,
//         },
//         { role: "user", content },
//       ],
//     }),
//   });
// }

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
  if (!isAllowed) buildAskAIScene();

  // If it happens to be a valid page or the AI allows me to view it,
  // disable some of the more distracting elements.
  document.querySelector(SELECTORS.relatedVideos)?.remove();
}

// Perform the check on every new page.
// See this stack overflow post for why it's done this way
// https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
check();
window.addEventListener("yt-navigate-start", check);
