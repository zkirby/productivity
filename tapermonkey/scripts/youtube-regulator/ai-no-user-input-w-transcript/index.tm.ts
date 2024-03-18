import { load as loadVideoLinks } from "../lib/videoLinks";
import { buildIndicator } from "./scenes";
import { MODEL, VIDEO_LINKS_KEY } from "./constants";
import GPTRunner from "./models/gpt";
import LocalRunner from "./models/local";

const Runner = MODEL === "local" ? LocalRunner : GPTRunner;

// ---------- Main ------------
async function run() {
  const currentURL = window.location.href;
  if (!currentURL.includes("watch")) return;
  buildIndicator("loading....");

  const isAllowed = loadVideoLinks(VIDEO_LINKS_KEY).some((link) =>
    currentURL.endsWith(link)
  );
  if (isAllowed) return;
  Runner.run();
}

Runner.init();
// Perform the check on every new page.
// See this stack overflow post for why it's done this way
// https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
window.addEventListener("yt-navigate-start", run);
