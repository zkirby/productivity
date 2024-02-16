/**
 * Check if today is the weekend
 */
export default function isWeekend() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}
