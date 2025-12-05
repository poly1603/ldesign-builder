/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
function isPhone(str) {
  return /^1[3-9]\d{9}$/.test(str);
}
function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
function isIdCard(str) {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(str);
}
function isNumeric(str) {
  return /^\d+$/.test(str);
}
function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}
function isChinese(str) {
  return /^[\u4e00-\u9fa5]+$/.test(str);
}
function isIP(str) {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(str);
}
function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8)
    score++;
  if (password.length >= 12)
    score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password))
    score++;
  if (/\d/.test(password))
    score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password))
    score++;
  if (score <= 2)
    return "weak";
  if (score <= 4)
    return "medium";
  return "strong";
}
function required(value) {
  if (value === null || value === void 0)
    return false;
  if (typeof value === "string")
    return value.trim().length > 0;
  if (Array.isArray(value))
    return value.length > 0;
  return true;
}
function length(value, min, max) {
  const len = value.length;
  if (max === void 0)
    return len >= min;
  return len >= min && len <= max;
}

export { isAlphanumeric, isChinese, isEmail, isIP, isIdCard, isNumeric, isPhone, isUrl, length, passwordStrength, required };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
