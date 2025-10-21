/*!
 * *******************************************
 * @ldesign/vue2-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:31:49         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
'use strict';

var vue = require('vue');

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
  return (vue.openBlock(), vue.createElementBlock("div", {
    class: vue.normalizeClass($options.cardClasses)
  }, [
    (_ctx.$slots.header || $props.title)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
          vue.renderSlot(_ctx.$slots, "header", {}, () => [
            vue.createElementVNode("div", _hoisted_2, vue.toDisplayString($props.title), 1 /* TEXT */)
          ]),
          (_ctx.$slots.extra)
            ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3, [
                vue.renderSlot(_ctx.$slots, "extra")
              ]))
            : vue.createCommentVNode("v-if", true)
        ]))
      : vue.createCommentVNode("v-if", true),
    (_ctx.$slots.cover)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4, [
          vue.renderSlot(_ctx.$slots, "cover")
        ]))
      : vue.createCommentVNode("v-if", true),
    vue.createElementVNode("div", {
      class: vue.normalizeClass($options.bodyClasses)
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 2 /* CLASS */),
    (_ctx.$slots.footer)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5, [
          vue.renderSlot(_ctx.$slots, "footer")
        ]))
      : vue.createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

exports.render = render;
//# sourceMappingURL=Card.vue3.cjs.map
