import buildButton from "../../../lib/elements/buildButton";
import buildOverlay from "../../../lib/elements/buildOverlay";
import buildText from "../../../lib/elements/buildText";
import isWeekend from "../../../lib/isWeekend";
import checkIsSubscriptionPage from "../lib/checkIsSubscriptionPage";
import {
  load as loadVideoLinks,
  set as setVideoLinks,
} from "../lib/videoLinks";
import { SELECTORS } from "../lib/youtube.constants";
import WeekendVideoCounter from "../lib/WeekendVideoCounter";

// ---------- Constants ----------
const VIDEO_LINKS_KEY = "subVideoLinks";

function buildRestrictionScene() {
  const overlayElement = buildOverlay();

  const messageElement = buildText("Sorry friend... Get back to work.");
  const buttonElement = buildButton("Okay :(", {
    onClick: () => window.close(),
  });

  overlayElement.appendChild(messageElement);
  overlayElement.appendChild(buttonElement);

  document.body.innerHTML = "";
  document.body.appendChild(overlayElement);
}

function run() {
  if (isWeekend()) WeekendVideoCounter.init();

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
    // Allow for up to 10 non-subscription Youtube videos on the weekends.
    if (isWeekend()) {
      // Only count actual videos watched.
      if (!currentURL.includes("/watch?v=")) return;

      const weekendCount = WeekendVideoCounter.get();
      if (weekendCount.count <= 6) {
        WeekendVideoCounter.increment();
        return;
      }
    }

    buildRestrictionScene();
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
