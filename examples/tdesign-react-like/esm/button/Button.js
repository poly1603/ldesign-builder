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
import { forwardRef, useMemo } from 'react';
import classNames from '../_util/classNames.js';

const Button = forwardRef((props, ref) => {
  const { theme = "default", variant = "base", size = "medium", loading = false, block = false, disabled, icon, suffix, children, className, ...rest } = props;
  const buttonClass = useMemo(() => classNames("t-button", `t-button--theme-${theme}`, `t-button--variant-${variant}`, `t-button--size-${size}`, {
    "t-button--disabled": disabled,
    "t-button--loading": loading,
    "t-button--block": block
  }, className), [theme, variant, size, disabled, loading, block, className]);
  return jsxs("button", { ref, className: buttonClass, disabled: disabled || loading, ...rest, children: [loading && jsx("span", { className: "t-button__loading" }), !loading && icon && jsx("span", { className: "t-button__icon", children: icon }), jsx("span", { className: "t-button__text", children }), suffix && jsx("span", { className: "t-button__suffix", children: suffix })] });
});
Button.displayName = "TButton";

export { Button as default };
/*! End of @examples/tdesign-react-like | Powered by @ldesign/builder */
