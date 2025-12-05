/*!
 * ***************************************
 * @examples/tdesign-react-like v1.0.0 *
 * Built with rollup                   *
 * Build time: 2024-12-05 18:15:45     *
 * Build mode: production              *
 * Minified: No                        *
 * ***************************************
 */
function classNames(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg)
      continue;
    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner)
        classes.push(inner);
    } else if (typeof arg === "object") {
      for (const [key, value] of Object.entries(arg)) {
        if (value)
          classes.push(key);
      }
    }
  }
  return classes.join(" ");
}

export { classNames as default };
/*! End of @examples/tdesign-react-like | Powered by @ldesign/builder */
