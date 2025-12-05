/*!
 * ***************************************
 * @examples/tdesign-react-like v1.0.0 *
 * Built with rollup                   *
 * Build time: 2024-12-05 18:15:45     *
 * Build mode: production              *
 * Minified: No                        *
 * ***************************************
 */
import { jsxs, jsx } from 'react/jsx-runtime';
import { forwardRef, useState, useMemo } from 'react';
import classNames from '../_util/classNames.js';

const Input = forwardRef((props, ref) => {
  const { size = "medium", status = "default", disabled, clearable, prefix, suffix, value, className, onClear, onFocus, onBlur, ...rest } = props;
  const [focused, setFocused] = useState(false);
  const wrapperClass = useMemo(() => classNames("t-input", `t-input--size-${size}`, `t-input--status-${status}`, {
    "t-input--disabled": disabled,
    "t-input--focused": focused
  }, className), [size, status, disabled, focused, className]);
  return jsxs("div", { className: wrapperClass, children: [prefix && jsx("span", { className: "t-input__prefix", children: prefix }), jsx("input", { ref, className: "t-input__inner", disabled, value, onFocus: (e) => {
    setFocused(true);
    onFocus?.(e);
  }, onBlur: (e) => {
    setFocused(false);
    onBlur?.(e);
  }, ...rest }), clearable && value && jsx("span", { className: "t-input__clear", onClick: onClear, children: "\xD7" }), suffix && jsx("span", { className: "t-input__suffix", children: suffix })] });
});
Input.displayName = "TInput";

export { Input as default };
/*! End of @examples/tdesign-react-like | Powered by @ldesign/builder */
