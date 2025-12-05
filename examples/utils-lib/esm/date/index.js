/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return format.replace("YYYY", String(d.getFullYear())).replace("MM", pad(d.getMonth() + 1)).replace("DD", pad(d.getDate())).replace("HH", pad(d.getHours())).replace("mm", pad(d.getMinutes())).replace("ss", pad(d.getSeconds()));
}
function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0)
    return `${days}\u5929\u524D`;
  if (hours > 0)
    return `${hours}\u5C0F\u65F6\u524D`;
  if (minutes > 0)
    return `${minutes}\u5206\u949F\u524D`;
  return "\u521A\u521A";
}
function getDateRange(start, end) {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
function isSameDay(d1, d2) {
  return d1.toDateString() === d2.toDateString();
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export { addDays, formatDate, getDateRange, isSameDay, timeAgo };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
