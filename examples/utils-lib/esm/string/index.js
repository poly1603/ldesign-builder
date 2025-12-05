/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function capitalize(str) {
  if (!str)
    return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function pascalCase(str) {
  return capitalize(camelCase(str));
}
function truncate(str, length, suffix = "...") {
  if (str.length <= length)
    return str;
  return str.slice(0, length - suffix.length) + suffix;
}
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "");
}
function escapeHtml(str) {
  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
}
function randomString(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function template(str, data) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
}
function padStart(str, length, char = " ") {
  return str.padStart(length, char);
}
function padEnd(str, length, char = " ") {
  return str.padEnd(length, char);
}

export { camelCase, capitalize, escapeHtml, kebabCase, padEnd, padStart, pascalCase, randomString, stripHtml, template, truncate };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
