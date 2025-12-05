/*!
 * ***********************************
 * @examples/icon-font-lib v1.0.0  *
 * Built with rollup               *
 * Build time: 2024-12-05 18:15:03 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
const icons = [
  "close",
  "check",
  "info",
  "warning",
  "error",
  "loading",
  "search",
  "plus",
  "minus",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrow-down",
  "home",
  "user",
  "setting",
  "menu",
  "more",
  "edit",
  "delete",
  "copy",
  "folder",
  "file",
  "download",
  "upload",
  "link",
  "star",
  "heart",
  "share"
];
function getIconClass(name) {
  return `ti ti-${name}`;
}

export { getIconClass, icons };
/*! End of @examples/icon-font-lib | Powered by @ldesign/builder */
