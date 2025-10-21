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

const _hoisted_1 = ["for"];
const _hoisted_2 = {
  key: 0,
  class: "l-input__required"
};
const _hoisted_3 = {
  key: 0,
  class: "l-input__prefix"
};
const _hoisted_4 = {
  key: 0,
  class: "l-input__icon"
};
const _hoisted_5 = ["id", "type", "value", "placeholder", "disabled", "readonly", "maxlength", "minlength", "max", "min", "step", "autocomplete"];
const _hoisted_6 = {
  key: 1,
  class: "l-input__suffix"
};
const _hoisted_7 = {
  key: 0,
  class: "l-input__icon"
};
const _hoisted_8 = {
  key: 1,
  class: "l-input__count"
};
const _hoisted_9 = {
  key: 2,
  class: "l-input__error"
};
const _hoisted_10 = {
  key: 3,
  class: "l-input__help"
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", {
    class: vue.normalizeClass($options.wrapperClasses)
  }, [
    ($props.label)
      ? (vue.openBlock(), vue.createElementBlock("label", {
          key: 0,
          class: vue.normalizeClass($options.labelClasses),
          for: $data.inputId
        }, [
          vue.createTextVNode(vue.toDisplayString($props.label) + " ", 1 /* TEXT */),
          ($props.required)
            ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_2, "*"))
            : vue.createCommentVNode("v-if", true)
        ], 10 /* CLASS, PROPS */, _hoisted_1))
      : vue.createCommentVNode("v-if", true),
    vue.createElementVNode("div", {
      class: vue.normalizeClass($options.inputWrapperClasses)
    }, [
      ($props.prefixIcon || _ctx.$slots.prefix)
        ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_3, [
            vue.renderSlot(_ctx.$slots, "prefix", {}, () => [
              ($props.prefixIcon)
                ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_4, vue.toDisplayString($props.prefixIcon), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ])
          ]))
        : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("input", {
        id: $data.inputId,
        ref: "input",
        class: vue.normalizeClass($options.inputClasses),
        type: $props.type,
        value: $data.currentValue,
        placeholder: $props.placeholder,
        disabled: $props.disabled,
        readonly: $props.readonly,
        maxlength: $props.maxlength,
        minlength: $props.minlength,
        max: $props.max,
        min: $props.min,
        step: $props.step,
        autocomplete: $props.autocomplete,
        onInput: _cache[0] || (_cache[0] = (...args) => ($options.handleInput && $options.handleInput(...args))),
        onChange: _cache[1] || (_cache[1] = (...args) => ($options.handleChange && $options.handleChange(...args))),
        onFocus: _cache[2] || (_cache[2] = (...args) => ($options.handleFocus && $options.handleFocus(...args))),
        onBlur: _cache[3] || (_cache[3] = (...args) => ($options.handleBlur && $options.handleBlur(...args))),
        onKeydown: _cache[4] || (_cache[4] = (...args) => ($options.handleKeydown && $options.handleKeydown(...args))),
        onKeyup: _cache[5] || (_cache[5] = (...args) => ($options.handleKeyup && $options.handleKeyup(...args))),
        onKeypress: _cache[6] || (_cache[6] = (...args) => ($options.handleKeypress && $options.handleKeypress(...args)))
      }, null, 42 /* CLASS, PROPS, NEED_HYDRATION */, _hoisted_5),
      ($props.suffixIcon || _ctx.$slots.suffix || $options.showClearIcon)
        ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_6, [
            ($options.showClearIcon)
              ? (vue.openBlock(), vue.createElementBlock("span", {
                  key: 0,
                  class: "l-input__clear",
                  onClick: _cache[7] || (_cache[7] = (...args) => ($options.handleClear && $options.handleClear(...args)))
                }, " ✕ "))
              : vue.createCommentVNode("v-if", true),
            vue.renderSlot(_ctx.$slots, "suffix", {}, () => [
              ($props.suffixIcon)
                ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_7, vue.toDisplayString($props.suffixIcon), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ])
          ]))
        : vue.createCommentVNode("v-if", true)
    ], 2 /* CLASS */),
    ($props.showWordCount)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_8, vue.toDisplayString($data.currentValue.length) + vue.toDisplayString($props.maxlength ? `/${$props.maxlength}` : ''), 1 /* TEXT */))
      : vue.createCommentVNode("v-if", true),
    ($props.errorMessage)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9, vue.toDisplayString($props.errorMessage), 1 /* TEXT */))
      : vue.createCommentVNode("v-if", true),
    ($props.helpText)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_10, vue.toDisplayString($props.helpText), 1 /* TEXT */))
      : vue.createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

exports.render = render;
//# sourceMappingURL=Input.vue3.cjs.map
