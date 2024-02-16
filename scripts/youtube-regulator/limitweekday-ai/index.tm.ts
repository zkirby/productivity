import buildButton from "../../../lib/elements/buildButton";
import buildContainer from "../../../lib/elements/buildContainer";
import buildOverlay from "../../../lib/elements/buildOverlay";
import buildText from "../../../lib/elements/buildText";
import isWeekend from "../../../lib/isWeekend";
import checkIsSubscriptionPage from "../lib/checkIsSubscriptionPage";
import buildChatMessage from "../lib/elements/buildChatMessage";
import {
  load as loadVideoLinks,
  set as setVideoLinks,
} from "../lib/videoLinks";
import { SELECTORS } from "../lib/youtube.constants";

// ---------- Constants ----------
const VIDEO_LINKS_KEY = "subVideoLinks";

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

// ---------- Main ------------
function run() {
  // Allow for unrestricted Youtube access on the weekends.
  if (isWeekend()) return;

  // We *must* navigate to the subscriptions page to be allowed to view
  // a video since we're only allowed to view videos from the subscriptions page.
  // While we're on the page, we'll collect all of the valid video links.
  // NOTE: Edge case where we have more valid videos than what's rendered, not a big deal.
  const isSubscriptionPage = checkIsSubscriptionPage();
  if (isSubscriptionPage) {
    // HACK: Need to wait for the videos to load... couldn't find a better way to do this.
    setTimeout(() => setVideoLinks(VIDEO_LINKS_KEY), 1000);
  }

  const currentURL = window.location.href;
  const isSubVideoLink = loadVideoLinks(VIDEO_LINKS_KEY).some((link) =>
    currentURL.endsWith(link)
  );
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
run();
window.addEventListener("yt-navigate-start", run);

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
