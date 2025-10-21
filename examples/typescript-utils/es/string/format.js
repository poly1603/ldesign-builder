/*!
 * ********************************************
 * @ldesign/typescript-utils-example v1.0.0 *
 * Built with rollup                        *
 * Build time: 2024-09-29 15:03:11          *
 * Build mode: production                   *
 * Minified: No                             *
 * ********************************************
 */
function toCamelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : "").replace(/^[A-Z]/, (char) => char.toLowerCase());
}
function toPascalCase(str) {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}
function toSnakeCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
}
function capitalize(str) {
  if (!str)
    return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function capitalizeWords(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
function truncate(str, maxLength, suffix = "...") {
  if (str.length <= maxLength)
    return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}
function trim(str) {
  return str.trim();
}
function pad(str, targetLength, padString = " ", padStart = true) {
  if (str.length >= targetLength)
    return str;
  if (padStart) {
    return str.padStart(targetLength, padString);
  } else {
    return str.padEnd(targetLength, padString);
  }
}

export { capitalize, capitalizeWords, pad, toCamelCase, toKebabCase, toPascalCase, toSnakeCase, trim, truncate };
//# sourceMappingURL=format.js.map
