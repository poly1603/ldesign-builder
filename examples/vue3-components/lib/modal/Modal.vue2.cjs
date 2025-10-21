/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

const _hoisted_1 = {
  key: 0,
  class: "l-modal__header"
};
const _hoisted_2 = {
  class: "l-modal__title"
};
const _hoisted_3 = {
  key: 1,
  class: "l-modal__footer"
};
var script = /* @__PURE__ */ vue.defineComponent({
  ...{
    name: "LModal"
  },
  __name: "Modal",
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
    title: {
      type: String,
      required: false,
      default: ""
    },
    width: {
      type: [String, Number],
      required: false,
      default: "520px"
    },
    size: {
      type: String,
      required: false,
      default: "medium"
    },
    closable: {
      type: Boolean,
      required: false,
      default: true
    },
    maskClosable: {
      type: Boolean,
      required: false,
      default: true
    },
    centered: {
      type: Boolean,
      required: false,
      default: false
    },
    fullscreen: {
      type: Boolean,
      required: false,
      default: false
    },
    bodyPadding: {
      type: Boolean,
      required: false,
      default: true
    },
    zIndex: {
      type: Number,
      required: false,
      default: 1e3
    }
  },
  emits: ["update:visible", "close", "open", "opened", "closed"],
  setup(__props, {
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;
    const modalClasses = vue.computed(() => ["l-modal", {
      "l-modal--centered": props.centered,
      "l-modal--fullscreen": props.fullscreen
    }]);
    const dialogClasses = vue.computed(() => ["l-modal__dialog", `l-modal__dialog--${props.size}`, {
      "l-modal__dialog--fullscreen": props.fullscreen
    }]);
    const bodyClasses = vue.computed(() => ["l-modal__body", {
      "l-modal__body--no-padding": !props.bodyPadding
    }]);
    vue.computed(() => {
      const style = {
        zIndex: props.zIndex
      };
      if (!props.fullscreen && props.width) {
        style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
      }
      return style;
    });
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };
    const handleMaskClick = () => {
      if (props.maskClosable) {
        handleClose();
      }
    };
    vue.watch(() => props.visible, (newVisible, oldVisible) => {
      if (newVisible && !oldVisible) {
        emit("open");
        vue.nextTick(() => {
          emit("opened");
        });
      } else if (!newVisible && oldVisible) {
        vue.nextTick(() => {
          emit("closed");
        });
      }
    });
    const handleKeydown = (event) => {
      if (event.key === "Escape" && props.closable) {
        handleClose();
      }
    };
    vue.watch(() => props.visible, (visible) => {
      if (visible) {
        document.addEventListener("keydown", handleKeydown);
        document.body.style.overflow = "hidden";
      } else {
        document.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
      }
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.Teleport, {
        to: "body"
      }, [vue.createVNode(vue.Transition, {
        name: "l-modal",
        appear: ""
      }, {
        default: vue.withCtx(() => [_ctx.visible ? (vue.openBlock(), vue.createElementBlock(
          "div",
          {
            key: 0,
            class: vue.normalizeClass(modalClasses.value),
            onClick: handleMaskClick
          },
          [vue.createElementVNode(
            "div",
            {
              class: vue.normalizeClass(dialogClasses.value),
              onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
              }, ["stop"]))
            },
            [_ctx.$slots.header || _ctx.title || _ctx.closable ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [vue.renderSlot(_ctx.$slots, "header", {}, () => [vue.createElementVNode(
              "div",
              _hoisted_2,
              vue.toDisplayString(_ctx.title),
              1
              /* TEXT */
            )]), _ctx.closable ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 0,
              class: "l-modal__close",
              onClick: handleClose
            }, " \u2715 ")) : vue.createCommentVNode("v-if", true)])) : vue.createCommentVNode("v-if", true), vue.createElementVNode(
              "div",
              {
                class: vue.normalizeClass(bodyClasses.value)
              },
              [vue.renderSlot(_ctx.$slots, "default")],
              2
              /* CLASS */
            ), _ctx.$slots.footer ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3, [vue.renderSlot(_ctx.$slots, "footer")])) : vue.createCommentVNode("v-if", true)],
            2
            /* CLASS */
          )],
          2
          /* CLASS */
        )) : vue.createCommentVNode("v-if", true)]),
        _: 3
        /* FORWARDED */
      })]);
    };
  }
});

exports.default = script;
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=Modal.vue2.cjs.map
