/*!
 * ********************************************
 * @ldesign/typescript-utils-example v1.0.0 *
 * Built with rollup                        *
 * Build time: 2024-09-29 15:03:11          *
 * Build mode: production                   *
 * Minified: No                             *
 * ********************************************
 */
'use strict';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
function isValidIdCard(idCard) {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (!idCardRegex.test(idCard)) {
    return false;
  }
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  const checkCode = checkCodes[sum % 11];
  return checkCode === idCard[17].toUpperCase();
}
function validatePassword(password, options = {}) {
  const { minLength = 8, requireUppercase = true, requireLowercase = true, requireNumbers = true, requireSpecialChars = true } = options;
  const issues = [];
  let score = 0;
  if (password.length < minLength) {
    issues.push(`\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11\u9700\u8981${minLength}\u4F4D`);
  } else {
    score++;
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    issues.push("\u5BC6\u7801\u9700\u8981\u5305\u542B\u5927\u5199\u5B57\u6BCD");
  } else if (/[A-Z]/.test(password)) {
    score++;
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    issues.push("\u5BC6\u7801\u9700\u8981\u5305\u542B\u5C0F\u5199\u5B57\u6BCD");
  } else if (/[a-z]/.test(password)) {
    score++;
  }
  if (requireNumbers && !/\d/.test(password)) {
    issues.push("\u5BC6\u7801\u9700\u8981\u5305\u542B\u6570\u5B57");
  } else if (/\d/.test(password)) {
    score++;
  }
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push("\u5BC6\u7801\u9700\u8981\u5305\u542B\u7279\u6B8A\u5B57\u7B26");
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  }
  let strength;
  if (score <= 2) {
    strength = "weak";
  } else if (score <= 3) {
    strength = "medium";
  } else {
    strength = "strong";
  }
  return {
    strength,
    isValid: issues.length === 0,
    score,
    issues
  };
}
function isNumeric(str) {
  return /^\d+$/.test(str);
}
function isAlpha(str) {
  return /^[a-zA-Z]+$/.test(str);
}
function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

exports.isAlpha = isAlpha;
exports.isAlphanumeric = isAlphanumeric;
exports.isNumeric = isNumeric;
exports.isValidEmail = isValidEmail;
exports.isValidIdCard = isValidIdCard;
exports.isValidPhone = isValidPhone;
exports.isValidUrl = isValidUrl;
exports.validatePassword = validatePassword;
//# sourceMappingURL=validate.cjs.map
