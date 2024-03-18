import buildButton from "../../../lib/elements/buildButton";
import buildContainer from "../../../lib/elements/buildContainer";
import buildOverlay from "../../../lib/elements/buildOverlay";
import buildText from "../../../lib/elements/buildText";
import buildInput from "../../../lib/elements/buildInput";
import { load as loadVideoLinks, add as addVideoLink } from "../lib/videoLinks";
import { SELECTORS } from "../lib/youtube.constants";
import { YoutubeTranscript } from "youtube-transcript";

// ---------- Constants ----------
const VIDEO_LINKS_KEY = "subVideoLinks";
const INCLUDE_TRANSCRIPT = true;
const MODEL = "gpt-3.5-turbo";
const PROMPT = `
Pretend that I am a child and I want to watch a video. 
You are my parent and are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.
Right now I am learning about:
- Transformers, LLMs, Linear Algebra, and other related topics.
- React, TypeScript, and other related topics.
- WebGl, Three.js, and other related topics. 

You may respond with one of the following and **nothing else**:
"Yes" - if the video is allowed
"No" - if the video is not allowed
`;

// ---------- Helpers ---------
function askAI(key: string, messages: { role: string; content: string }[]) {
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
      return message;
    });
}

async function getTranscript(url) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    return transcript.map((t) => t.text).join();
  } catch {
    return "No Transcript";
  }
}

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
 * Blackouts the screen when for when not visiting a direct video link
 */
function buildBlackoutScene() {
  const overlayElement = buildOverlay();

  const messageElement = buildText("This Page Is Not Allowed");
  overlayElement.appendChild(messageElement);

  document.body.innerHTML = "";
  document.body.appendChild(overlayElement);
}

/**
 * A small indicator if the video is allowed or not (mostly for debugging purposes)
 */
function buildIndicatorScene(content: string) {
  let detailsBox = document.getElementById("tm-weekend-video-counter");
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
async function run() {
  const currentURL = window.location.href;
  if (!currentURL.includes("watch")) return;
  buildIndicatorScene("loading....");

  const isAllowed = loadVideoLinks(VIDEO_LINKS_KEY).some((link) =>
    currentURL.endsWith(link)
  );
  if (isAllowed) return;

  // Ensure OPEN API KEY is loaded (otherwise can't engage with the AI).
  setTimeout(
    () =>
      buildAskForAPIKeyScene(async (key: string) => {
        // Start the messaging scene loop with the prompt.
        const title = document.querySelector(SELECTORS.title)?.textContent;
        const description = document.querySelector(
          SELECTORS.description
        )?.textContent;
        const transcript = INCLUDE_TRANSCRIPT
          ? await getTranscript(currentURL)
          : "No Transcript";

        const videoMetaData = `
      ### VIDEO TITLE
      ${title}

      ### VIDEO DESCRIPTION
      ${description}

      ### VIDEO TRANSCRIPT
      ${transcript}
      `;

        const message = await askAI(key, [
          {
            role: "system",
            content: `${PROMPT}${videoMetaData}`,
          },
        ]);
        const isAllowed = message.includes("Yes");

        if (isAllowed) {
          buildIndicatorScene(`Status: Allowed`);
          addVideoLink(VIDEO_LINKS_KEY, currentURL);
        } else {
          buildBlackoutScene();
          return;
        }
      }),
    2000
  );

  // If it happens to be a valid page or the AI allows me to view it,
  // disable some of the more distracting elements.
  document.querySelector(SELECTORS.relatedVideos)?.remove();
}

// Perform the check on every new page.
// See this stack overflow post for why it's done this way
// https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
run();
window.addEventListener("yt-navigate-start", run);
