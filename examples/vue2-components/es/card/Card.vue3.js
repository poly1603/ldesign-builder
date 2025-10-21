/*!
 * *******************************************
 * @ldesign/vue2-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:31:49         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import { createElementBlock, openBlock, normalizeClass, createCommentVNode, createElementVNode, renderSlot, toDisplayString } from 'vue';

const _hoisted_1 = {
  key: 0,
  class: "l-card__header"
};
const _hoisted_2 = { class: "l-card__title" };
const _hoisted_3 = {
  key: 0,
  class: "l-card__extra"
};
const _hoisted_4 = {
  key: 1,
  class: "l-card__cover"
};
const _hoisted_5 = {
  key: 2,
  class: "l-card__footer"
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass($options.cardClasses)
  }, [
    (_ctx.$slots.header || $props.title)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            createElementVNode("div", _hoisted_2, toDisplayString($props.title), 1 /* TEXT */)
          ]),
          (_ctx.$slots.extra)
            ? (openBlock(), createElementBlock("div", _hoisted_3, [
                renderSlot(_ctx.$slots, "extra")
              ]))
            : createCommentVNode("v-if", true)
        ]))
      : createCommentVNode("v-if", true),
    (_ctx.$slots.cover)
      ? (openBlock(), createElementBlock("div", _hoisted_4, [
          renderSlot(_ctx.$slots, "cover")
        ]))
      : createCommentVNode("v-if", true),
    createElementVNode("div", {
      class: normalizeClass($options.bodyClasses)
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 2 /* CLASS */),
    (_ctx.$slots.footer)
      ? (openBlock(), createElementBlock("div", _hoisted_5, [
          renderSlot(_ctx.$slots, "footer")
        ]))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

export { render };
//# sourceMappingURL=Card.vue3.js.map
