const SUBSCRIPTIONS_URL_REGEX =
  /^https:\/\/www\.youtube\.com\/feed\/subscriptions/;

/**
 * Check if the current page is the 'subscriptions' page
 */
export default function checkIsSubscriptionPage() {
  return SUBSCRIPTIONS_URL_REGEX.test(window.location.href);
}
