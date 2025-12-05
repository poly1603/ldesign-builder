/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function round(value, decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function lerp(start, end, t) {
  return start + (end - start) * t;
}
function degToRad(deg) {
  return deg * (Math.PI / 180);
}
function radToDeg(rad) {
  return rad * (180 / Math.PI);
}
function percentage(value, total) {
  return total === 0 ? 0 : value / total * 100;
}
function divide(a, b, defaultValue = 0) {
  return b === 0 ? defaultValue : a / b;
}

export { clamp, degToRad, divide, lerp, percentage, radToDeg, randomFloat, randomInt, round };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
