/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import { defineComponent, computed, createElementBlock, openBlock, normalizeClass, createCommentVNode, createElementVNode, renderSlot, createTextVNode, toDisplayString } from 'vue';

const _hoisted_1 = ["disabled"];
const _hoisted_2 = {
  key: 0,
  class: "l-button__loading"
};
const _hoisted_3 = {
  key: 2,
  class: "l-button__text"
};
var script = /* @__PURE__ */ defineComponent({
  ...{
    name: "LButton"
  },
  __name: "Button",
  props: {
    type: {
      type: String,
      required: false,
      default: "primary"
    },
    size: {
      type: String,
      required: false,
      default: "medium"
    },
    block: {
      type: Boolean,
      required: false,
      default: false
    },
    round: {
      type: Boolean,
      required: false,
      default: false
    },
    circle: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    icon: {
      type: String,
      required: false,
      default: ""
    },
    iconPosition: {
      type: String,
      required: false,
      default: "left"
    }
  },
  emits: ["click"],
  setup(__props, {
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;
    const buttonClasses = computed(() => ["l-button", `l-button--${props.type}`, `l-button--${props.size}`, {
      "l-button--block": props.block,
      "l-button--round": props.round,
      "l-button--circle": props.circle,
      "l-button--disabled": props.disabled,
      "l-button--loading": props.loading
    }]);
    const handleClick = (event) => {
      if (props.disabled || props.loading) {
        return;
      }
      emit("click", event);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("button", {
        class: normalizeClass(buttonClasses.value),
        disabled: _ctx.disabled || _ctx.loading,
        onClick: handleClick
      }, [_ctx.loading ? (openBlock(), createElementBlock("span", _hoisted_2, [..._cache[0] || (_cache[0] = [createElementVNode(
        "svg",
        {
          class: "l-button__loading-icon",
          viewBox: "0 0 24 24"
        },
        [createElementVNode("circle", {
          cx: "12",
          cy: "12",
          r: "10",
          stroke: "currentColor",
          "stroke-width": "2",
          fill: "none",
          "stroke-dasharray": "31.416",
          "stroke-dashoffset": "31.416"
        }, [createElementVNode("animate", {
          attributeName: "stroke-dasharray",
          dur: "2s",
          values: "0 31.416;15.708 15.708;0 31.416",
          repeatCount: "indefinite"
        }), createElementVNode("animate", {
          attributeName: "stroke-dashoffset",
          dur: "2s",
          values: "0;-15.708;-31.416",
          repeatCount: "indefinite"
        })])],
        -1
        /* CACHED */
      )])])) : createCommentVNode("v-if", true), _ctx.icon && !_ctx.loading ? (openBlock(), createElementBlock(
        "span",
        {
          key: 1,
          class: normalizeClass(["l-button__icon", `l-button__icon--${_ctx.iconPosition}`])
        },
        [renderSlot(_ctx.$slots, "icon", {}, () => [createTextVNode(
          toDisplayString(_ctx.icon),
          1
          /* TEXT */
        )])],
        2
        /* CLASS */
      )) : createCommentVNode("v-if", true), _ctx.$slots.default ? (openBlock(), createElementBlock("span", _hoisted_3, [renderSlot(_ctx.$slots, "default")])) : createCommentVNode("v-if", true)], 10, _hoisted_1);
    };
  }
});

export { script as default };
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=Button.vue2.js.map
