const SUBSCRIPTIONS_URL_REGEX =
  /^https:\/\/www\.youtube\.com\/feed\/subscriptions/;

/**
 * Check if the current page is the 'subscriptions' page
 */
export default function checkIsSubscriptionPage(currentURL: string) {
  return SUBSCRIPTIONS_URL_REGEX.test(currentURL);
}
