/*!
 * ***************************************
 * @examples/tdesign-react-like v1.0.0 *
 * Built with rollup                   *
 * Build time: 2024-12-05 18:15:45     *
 * Build mode: production              *
 * Minified: No                        *
 * ***************************************
 */
import { jsx } from 'react/jsx-runtime';
import { useMemo } from 'react';
import classNames from '../_util/classNames.js';

const SIZE_MAP = {
  small: "16px",
  medium: "20px",
  large: "24px"
};
const Icon = (props) => {
  const { name, size = "medium", color, spin, rotate, className, style, ...rest } = props;
  const iconSize = useMemo(() => {
    if (typeof size === "number")
      return `${size}px`;
    return SIZE_MAP[size] || size;
  }, [size]);
  const iconClass = classNames("t-icon", `t-icon-${name}`, { "t-icon--spin": spin }, className);
  const iconStyle = {
    fontSize: iconSize,
    color,
    transform: rotate ? `rotate(${rotate}deg)` : void 0,
    ...style
  };
  return jsx("i", { className: iconClass, style: iconStyle, ...rest });
};
Icon.displayName = "TIcon";

export { Icon as default };
/*! End of @examples/tdesign-react-like | Powered by @ldesign/builder */
