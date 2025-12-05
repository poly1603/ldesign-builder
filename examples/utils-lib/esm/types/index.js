/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function isString(val) {
  return typeof val === "string";
}
function isNumber(val) {
  return typeof val === "number" && !Number.isNaN(val);
}
function isBoolean(val) {
  return typeof val === "boolean";
}
function isArray(val) {
  return Array.isArray(val);
}
function isObject(val) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}
function isFunction(val) {
  return typeof val === "function";
}
function isNull(val) {
  return val === null;
}
function isUndefined(val) {
  return typeof val === "undefined";
}
function isNullOrUndefined(val) {
  return isNull(val) || isUndefined(val);
}
function isDefined(val) {
  return !isNullOrUndefined(val);
}

export { isArray, isBoolean, isDefined, isFunction, isNull, isNullOrUndefined, isNumber, isObject, isString, isUndefined };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
