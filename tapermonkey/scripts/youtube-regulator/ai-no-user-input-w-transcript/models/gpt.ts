import {
  INCLUDE_TRANSCRIPT,
  MODEL,
  PROMPT,
  VIDEO_LINKS_KEY,
} from "../constants";
import { YoutubeTranscript } from "youtube-transcript";
import {
  buildAskForAPIKeyScene,
  buildBlackoutScene,
  buildIndicator,
} from "../scenes";
import { SELECTORS } from "../../lib/youtube.constants";
import { add as addVideoLink } from "../../lib/videoLinks";

async function getTranscript(url: string) {
  if (!INCLUDE_TRANSCRIPT) return "No Transcript";

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    return transcript.map((t) => t.text).join();
  } catch {
    return "No Transcript";
  }
}

function askGPT(key: string, messages: { role: string; content: string }[]) {
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

async function run() {
  const currentURL = window.location.href;

  buildAskForAPIKeyScene(async (key: string) => {
    // Start the messaging scene loop with the prompt.
    const title = document.querySelector(SELECTORS.title)?.textContent;
    const description = document.querySelector(
      SELECTORS.description
    )?.textContent;
    const transcript = await getTranscript(currentURL);

    const videoMetaData = `
   ### VIDEO TITLE
   ${title}
  
   ### VIDEO DESCRIPTION
   ${description}
  
   ### VIDEO TRANSCRIPT
   ${transcript}
   `;

    const message = await askGPT(key, [
      {
        role: "system",
        content: `${PROMPT}${videoMetaData}`,
      },
    ]);

    const isAllowed = message.includes("Yes");

    if (isAllowed) {
      buildIndicator(`Status: Allowed`);
      addVideoLink(VIDEO_LINKS_KEY, currentURL);
    } else {
      buildBlackoutScene();
      return;
    }
  });
}

export default {
  run,
  init: () => {
    // TODO: Come up with a cleaner way
    // to ensure yt components are loaded.
    setTimeout(() => run(), 2000);
  },
};
