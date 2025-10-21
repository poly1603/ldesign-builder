/*!
 * *******************************************
 * @ldesign/vue2-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:31:49         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import { createElementBlock, openBlock, normalizeClass, createCommentVNode, createElementVNode, renderSlot, createTextVNode, toDisplayString } from 'vue';

const _hoisted_1 = ["disabled"];
const _hoisted_2 = {
  key: 0,
  class: "l-button__loading"
};
const _hoisted_3 = {
  key: 2,
  class: "l-button__text"
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("button", {
    class: normalizeClass($options.buttonClasses),
    disabled: $props.disabled || $props.loading,
    onClick: _cache[0] || (_cache[0] = (...args) => ($options.handleClick && $options.handleClick(...args)))
  }, [
    ($props.loading)
      ? (openBlock(), createElementBlock("span", _hoisted_2, [...(_cache[1] || (_cache[1] = [
          createElementVNode("svg", {
            class: "l-button__loading-icon",
            viewBox: "0 0 24 24"
          }, [
            createElementVNode("circle", {
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              "stroke-width": "2",
              fill: "none",
              "stroke-dasharray": "31.416",
              "stroke-dashoffset": "31.416"
            }, [
              createElementVNode("animate", {
                attributeName: "stroke-dasharray",
                dur: "2s",
                values: "0 31.416;15.708 15.708;0 31.416",
                repeatCount: "indefinite"
              }),
              createElementVNode("animate", {
                attributeName: "stroke-dashoffset",
                dur: "2s",
                values: "0;-15.708;-31.416",
                repeatCount: "indefinite"
              })
            ])
          ], -1 /* CACHED */)
        ]))]))
      : createCommentVNode("v-if", true),
    ($props.icon && !$props.loading)
      ? (openBlock(), createElementBlock("span", {
          key: 1,
          class: normalizeClass(['l-button__icon', `l-button__icon--${$props.iconPosition}`])
        }, [
          renderSlot(_ctx.$slots, "icon", {}, () => [
            createTextVNode(toDisplayString($props.icon), 1 /* TEXT */)
          ])
        ], 2 /* CLASS */))
      : createCommentVNode("v-if", true),
    (_ctx.$slots.default)
      ? (openBlock(), createElementBlock("span", _hoisted_3, [
          renderSlot(_ctx.$slots, "default")
        ]))
      : createCommentVNode("v-if", true)
  ], 10 /* CLASS, PROPS */, _hoisted_1))
}

export { render };
//# sourceMappingURL=Button.vue3.js.map
