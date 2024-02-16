import { SELECTORS } from "./youtube.constants";

/**
 * Puts the URLs of all the non-shorts videos on a page into local storage
 *
 * @param key - The key to store the videos under in local storage
 */
export function set(key: string) {
  // First, remove the shorts - those don't count.
  const shorts = document.querySelector(SELECTORS.shorts);
  shorts?.remove();

  const links = Array.from(document.querySelectorAll(SELECTORS.videoLinks)).map(
    (a) => a.getAttribute("href")
  );

  localStorage.setItem(`tm-links-${key}`, JSON.stringify(links));
}

/**
 * Gets all of the video links from local storage
 */
export function load(key: string) {
  return JSON.parse(localStorage.getItem(`tm-links-${key}`) ?? "[]");
}
