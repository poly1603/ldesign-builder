/*!
 * *******************************************
 * @ldesign/vue2-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:31:49         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import { createElementBlock, openBlock, normalizeClass, createCommentVNode, createElementVNode, createTextVNode, toDisplayString, renderSlot } from 'vue';

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
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass($options.wrapperClasses)
  }, [
    ($props.label)
      ? (openBlock(), createElementBlock("label", {
          key: 0,
          class: normalizeClass($options.labelClasses),
          for: $data.inputId
        }, [
          createTextVNode(toDisplayString($props.label) + " ", 1 /* TEXT */),
          ($props.required)
            ? (openBlock(), createElementBlock("span", _hoisted_2, "*"))
            : createCommentVNode("v-if", true)
        ], 10 /* CLASS, PROPS */, _hoisted_1))
      : createCommentVNode("v-if", true),
    createElementVNode("div", {
      class: normalizeClass($options.inputWrapperClasses)
    }, [
      ($props.prefixIcon || _ctx.$slots.prefix)
        ? (openBlock(), createElementBlock("span", _hoisted_3, [
            renderSlot(_ctx.$slots, "prefix", {}, () => [
              ($props.prefixIcon)
                ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString($props.prefixIcon), 1 /* TEXT */))
                : createCommentVNode("v-if", true)
            ])
          ]))
        : createCommentVNode("v-if", true),
      createElementVNode("input", {
        id: $data.inputId,
        ref: "input",
        class: normalizeClass($options.inputClasses),
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
        ? (openBlock(), createElementBlock("span", _hoisted_6, [
            ($options.showClearIcon)
              ? (openBlock(), createElementBlock("span", {
                  key: 0,
                  class: "l-input__clear",
                  onClick: _cache[7] || (_cache[7] = (...args) => ($options.handleClear && $options.handleClear(...args)))
                }, " ✕ "))
              : createCommentVNode("v-if", true),
            renderSlot(_ctx.$slots, "suffix", {}, () => [
              ($props.suffixIcon)
                ? (openBlock(), createElementBlock("span", _hoisted_7, toDisplayString($props.suffixIcon), 1 /* TEXT */))
                : createCommentVNode("v-if", true)
            ])
          ]))
        : createCommentVNode("v-if", true)
    ], 2 /* CLASS */),
    ($props.showWordCount)
      ? (openBlock(), createElementBlock("div", _hoisted_8, toDisplayString($data.currentValue.length) + toDisplayString($props.maxlength ? `/${$props.maxlength}` : ''), 1 /* TEXT */))
      : createCommentVNode("v-if", true),
    ($props.errorMessage)
      ? (openBlock(), createElementBlock("div", _hoisted_9, toDisplayString($props.errorMessage), 1 /* TEXT */))
      : createCommentVNode("v-if", true),
    ($props.helpText)
      ? (openBlock(), createElementBlock("div", _hoisted_10, toDisplayString($props.helpText), 1 /* TEXT */))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

export { render };
//# sourceMappingURL=Input.vue3.js.map
