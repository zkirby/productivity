import buildButton from "../../../lib/elements/buildButton";
import buildContainer from "../../../lib/elements/buildContainer";
import buildOverlay from "../../../lib/elements/buildOverlay";
import buildText from "../../../lib/elements/buildText";
import buildInput from "../../../lib/elements/buildInput";
import isWeekend from "../../../lib/isWeekend";
import checkIsSubscriptionPage from "../lib/checkIsSubscriptionPage";
import buildChatMessage from "../lib/elements/buildChatMessage";
import {
  load as loadVideoLinks,
  set as setVideoLinks,
  add as addVideoLink,
} from "../lib/videoLinks";
import { SELECTORS } from "../lib/youtube.constants";

// ---------- Constants ----------
const VIDEO_LINKS_KEY = "subVideoLinks";
const PROMPT = `
Pretend that I am a child and I want to watch a video. 
You are my parent and are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.
I'm going to try to convince you that I should be allowed to watch the video in question.
You are responsible for making the final decision.
If you determine that I should be allowed to watch the video, respond with exactly "I'll allow it" and nothing else.
`;

// ---------- Scenes ----------
/**
 * Ask for the users OPEN_API_KEY to be able to engage with the AI.
 */
async function buildAskForAPIKeyScene(next) {
  const API_KEY = localStorage.getItem("OPENAI_API_KEY");
  if (API_KEY) {
    next(API_KEY);
    return;
  }

  const overlayElement = buildOverlay();
  const containerElement = buildContainer();

  const messageElement = buildText("Please Enter Your OpenAI API Key");
  const inputElement = buildInput();

  const buttonElement = buildButton("Submit", {
    onClick: () => {
      const apiKey = inputElement.value.trim();
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
}

/**
 * Blackouts the screen and shows the input prompt to ask
 * the AI overlord if I may pretty please view this video.
 */
function buildAskAIScene(onSubmit) {
  const overlayElement = buildOverlay();
  const containerElement = buildContainer();

  const messageElement = buildText("This Video Is Not Allowed");
  const buttonElement = buildButton("Okay", {
    onClick: () => window.close(),
  });

  const [chatMessageElement, add] = buildChatMessage(onSubmit);

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
  const overlayElement = buildOverlay();

  const messageElement = buildText("This Page Is Not Allowed");
  overlayElement.appendChild(messageElement);

  document.body.innerHTML = "";
  document.body.appendChild(overlayElement);
}

// ---------- Main ------------
async function run() {
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
  if (!isAllowed) {
    // Only *direct* video links are allowed
    if (!currentURL.includes("/watch?v=")) {
      buildBlackoutScene();
      return;
    }

    // Ensure OPEN API KEY is loaded (otherwise can't engage with the AI).
    setTimeout(
      () =>
        buildAskForAPIKeyScene((key: string) => {
          // Start the messaging scene loop.
          const videoTitle = document.querySelector(
            SELECTORS.title
          )?.textContent;
          const videoDescription = document.querySelector(
            SELECTORS.description
          )?.textContent;
          const videoMetaData = `
      ### VIDEO TITLE
      ${videoTitle}

      ### VIDEO DESCRIPTION
      ${videoDescription}
      `;

          let messages = [
            {
              role: "system",
              content: `${PROMPT}${videoMetaData}`,
            },
          ];

          const add = buildAskAIScene((content) => {
            const MODEL = "gpt-3.5-turbo";
            messages.push({ role: "user", content });

            return fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: MODEL,
                temperature: 0,
                messages,
              }),
            })
              .then((res) => res.json())
              .then((res) => {
                const message = res.choices[0].message?.content;
                add(message);
                if (message.includes("I'll allow it")) {
                  addVideoLink(VIDEO_LINKS_KEY, currentURL);
                  window.location.reload();
                }
              });
          });
        }),
      2000
    );
  }

  // If it happens to be a valid page or the AI allows me to view it,
  // disable some of the more distracting elements.
  document.querySelector(SELECTORS.relatedVideos)?.remove();
}

// Perform the check on every new page.
// See this stack overflow post for why it's done this way
// https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
run();
window.addEventListener("yt-navigate-start", run);
