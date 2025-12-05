/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}
function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}
function on(el, event, handler, options) {
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}
function addClass(el, ...classes) {
  el.classList.add(...classes);
}
function removeClass(el, ...classes) {
  el.classList.remove(...classes);
}
function toggleClass(el, className, force) {
  return el.classList.toggle(className, force);
}
function hasClass(el, className) {
  return el.classList.contains(className);
}
function css(el, propOrStyles, value) {
  if (typeof propOrStyles === "string") {
    if (value === void 0) {
      return getComputedStyle(el).getPropertyValue(propOrStyles);
    }
    el.style.setProperty(propOrStyles, value);
  } else {
    Object.entries(propOrStyles).forEach(([k, v]) => el.style.setProperty(k, v));
  }
}
function getRect(el) {
  return el.getBoundingClientRect();
}
function scrollTo(el, options) {
  el.scrollIntoView({ behavior: "smooth", ...options });
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand("copy");
    document.body.removeChild(textarea);
    return result;
  }
}

export { $, $$, addClass, copyToClipboard, css, getRect, hasClass, on, removeClass, scrollTo, toggleClass };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
