/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import { defineComponent, computed, watch, nextTick, createBlock, openBlock, Teleport, createVNode, Transition, withCtx, createElementBlock, createCommentVNode, normalizeClass, createElementVNode, withModifiers, renderSlot, toDisplayString } from 'vue';

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
var script = /* @__PURE__ */ defineComponent({
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
    const modalClasses = computed(() => ["l-modal", {
      "l-modal--centered": props.centered,
      "l-modal--fullscreen": props.fullscreen
    }]);
    const dialogClasses = computed(() => ["l-modal__dialog", `l-modal__dialog--${props.size}`, {
      "l-modal__dialog--fullscreen": props.fullscreen
    }]);
    const bodyClasses = computed(() => ["l-modal__body", {
      "l-modal__body--no-padding": !props.bodyPadding
    }]);
    computed(() => {
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
    watch(() => props.visible, (newVisible, oldVisible) => {
      if (newVisible && !oldVisible) {
        emit("open");
        nextTick(() => {
          emit("opened");
        });
      } else if (!newVisible && oldVisible) {
        nextTick(() => {
          emit("closed");
        });
      }
    });
    const handleKeydown = (event) => {
      if (event.key === "Escape" && props.closable) {
        handleClose();
      }
    };
    watch(() => props.visible, (visible) => {
      if (visible) {
        document.addEventListener("keydown", handleKeydown);
        document.body.style.overflow = "hidden";
      } else {
        document.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, {
        to: "body"
      }, [createVNode(Transition, {
        name: "l-modal",
        appear: ""
      }, {
        default: withCtx(() => [_ctx.visible ? (openBlock(), createElementBlock(
          "div",
          {
            key: 0,
            class: normalizeClass(modalClasses.value),
            onClick: handleMaskClick
          },
          [createElementVNode(
            "div",
            {
              class: normalizeClass(dialogClasses.value),
              onClick: _cache[0] || (_cache[0] = withModifiers(() => {
              }, ["stop"]))
            },
            [_ctx.$slots.header || _ctx.title || _ctx.closable ? (openBlock(), createElementBlock("div", _hoisted_1, [renderSlot(_ctx.$slots, "header", {}, () => [createElementVNode(
              "div",
              _hoisted_2,
              toDisplayString(_ctx.title),
              1
              /* TEXT */
            )]), _ctx.closable ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "l-modal__close",
              onClick: handleClose
            }, " \u2715 ")) : createCommentVNode("v-if", true)])) : createCommentVNode("v-if", true), createElementVNode(
              "div",
              {
                class: normalizeClass(bodyClasses.value)
              },
              [renderSlot(_ctx.$slots, "default")],
              2
              /* CLASS */
            ), _ctx.$slots.footer ? (openBlock(), createElementBlock("div", _hoisted_3, [renderSlot(_ctx.$slots, "footer")])) : createCommentVNode("v-if", true)],
            2
            /* CLASS */
          )],
          2
          /* CLASS */
        )) : createCommentVNode("v-if", true)]),
        _: 3
        /* FORWARDED */
      })]);
    };
  }
});

export { script as default };
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=Modal.vue2.js.map
