/**
 * Selectors for the elements we want to manipulate. YouTube's custom element names
 * have a convention of always starting with 'ytd-'.
 */
export const SELECTORS = {
  shorts: "ytd-rich-shelf-renderer[is-shorts]",
  videoLinks: "ytd-thumbnail a#thumbnail",
  relatedVideos: "#related",
  title: "ytd-watch-metadata #title",
  description: "ytd-watch-metadata #description",
};
