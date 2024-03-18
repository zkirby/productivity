import { buildBlackoutScene, buildIndicator } from "../scenes";
import { add as addVideoLink } from "../../lib/videoLinks";
import { PROMPT, VIDEO_LINKS_KEY } from "../constants";
import { SELECTORS } from "../../lib/youtube.constants";

const SCRIPT_ID = "tm-transformers";
const TRANSFORMER_EVENTS = {
  REQUEST: "tm-transformer-request",
  RESPONSE: "tm-transformer-response",
  LOADED: "tm-transformer-loaded",
};
const MODEL = "Xenova/LaMini-Flan-T5-783M";

async function run() {
  const title = document.querySelector(SELECTORS.title)?.textContent;
  const description = document.querySelector(
    SELECTORS.description
  )?.textContent;

  const videoMetaData = `
Here is the video contents:
### VIDEO TITLE
${title}

### VIDEO DESCRIPTION
${description}

Here is my response about if the video should be allowed:
   `;

  window.dispatchEvent(
    new CustomEvent(TRANSFORMER_EVENTS.REQUEST, {
      detail: {
        text: `${PROMPT}${videoMetaData}`,
      },
    })
  );
}

/**
 * Bootstraps the transformers library and sets up a local pipeline
 *
 * NOTE: Implementing this as a script tag is possibly not the most ideal
 * but it is the quickest and easiest relative to using a service worker or
 * spinning up a backend.
 */
async function init() {
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.type = "module";
  script.crossOrigin = "anonymous";
  script.id = SCRIPT_ID;
  script.innerHTML = `
      import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';
    
      async function run() {
        env.allowLocalModels = false;
        // Enable for debugging
        // env.useFSCache = false;
        // env.useBrowserCache = false;
  
        const classifier = await pipeline('text2text-generation', '${MODEL}');
       
        window.addEventListener("${TRANSFORMER_EVENTS.REQUEST}", async (e) => {
            const { text } = e.detail;
            const response = await classifier(text);
        
            window.dispatchEvent(
                new CustomEvent("${TRANSFORMER_EVENTS.RESPONSE}", {
                detail: {
                    result: response[0].generated_text.slice(-50),
                },
            }));
        });

        window.dispatchEvent(new CustomEvent("${TRANSFORMER_EVENTS.LOADED}"));
      }
      run().catch(console.error);
      `;

  window.addEventListener(TRANSFORMER_EVENTS.RESPONSE, (e) => {
    // @ts-expect-error
    const isAllowed = e.detail.result.includes("Yes");
    if (isAllowed) {
      buildIndicator(`Status: Allowed`);
      addVideoLink(VIDEO_LINKS_KEY, window.location.href);
    } else {
      buildBlackoutScene();
      return;
    }
  });

  document.body.appendChild(script);
  window.addEventListener(TRANSFORMER_EVENTS.LOADED, run);
}

export default {
  run,
  init,
};
