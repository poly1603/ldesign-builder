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
  class: "l-input__required"
};
const _hoisted_2 = {
  key: 0,
  class: "l-input__prefix"
};
const _hoisted_3 = {
  key: 0,
  class: "l-input__icon"
};
const _hoisted_4 = ["type", "value", "placeholder", "disabled", "readonly", "maxlength", "minlength", "max", "min", "step", "autocomplete"];
const _hoisted_5 = {
  key: 1,
  class: "l-input__suffix"
};
const _hoisted_6 = {
  key: 0,
  class: "l-input__icon"
};
const _hoisted_7 = {
  key: 1,
  class: "l-input__count"
};
const _hoisted_8 = {
  key: 2,
  class: "l-input__error"
};
const _hoisted_9 = {
  key: 3,
  class: "l-input__help"
};
var script = /* @__PURE__ */ vue.defineComponent({
  ...{
    name: "LInput"
  },
  __name: "Input",
  props: {
    modelValue: {
      type: [String, Number],
      required: false,
      default: ""
    },
    type: {
      type: String,
      required: false,
      default: "text"
    },
    size: {
      type: String,
      required: false,
      default: "medium"
    },
    label: {
      type: String,
      required: false,
      default: ""
    },
    placeholder: {
      type: String,
      required: false,
      default: ""
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    clearable: {
      type: Boolean,
      required: false,
      default: false
    },
    showWordCount: {
      type: Boolean,
      required: false,
      default: false
    },
    maxlength: {
      type: Number,
      required: false
    },
    minlength: {
      type: Number,
      required: false
    },
    max: {
      type: Number,
      required: false
    },
    min: {
      type: Number,
      required: false
    },
    step: {
      type: Number,
      required: false
    },
    autocomplete: {
      type: String,
      required: false,
      default: "off"
    },
    prefixIcon: {
      type: String,
      required: false,
      default: ""
    },
    suffixIcon: {
      type: String,
      required: false,
      default: ""
    },
    errorMessage: {
      type: String,
      required: false,
      default: ""
    },
    helpText: {
      type: String,
      required: false,
      default: ""
    }
  },
  emits: ["update:modelValue", "input", "change", "focus", "blur", "keydown", "keyup", "keypress", "clear"],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;
    const inputRef = vue.ref();
    const focused = vue.ref(false);
    const inputId = `l-input-${Math.random().toString(36).substr(2, 9)}`;
    const currentLength = vue.computed(() => {
      return String(props.modelValue || "").length;
    });
    const wrapperClasses = vue.computed(() => ["l-input", `l-input--${props.size}`, {
      "l-input--disabled": props.disabled,
      "l-input--readonly": props.readonly,
      "l-input--focused": focused.value,
      "l-input--error": !!props.errorMessage
    }]);
    const labelClasses = vue.computed(() => ["l-input__label", {
      "l-input__label--required": props.required
    }]);
    const inputWrapperClasses = vue.computed(() => ["l-input__wrapper", {
      "l-input__wrapper--prefix": props.prefixIcon || !!props.$slots?.prefix,
      "l-input__wrapper--suffix": props.suffixIcon || !!props.$slots?.suffix || showClearIcon.value
    }]);
    const inputClasses = vue.computed(() => ["l-input__inner"]);
    const showClearIcon = vue.computed(() => {
      return props.clearable && props.modelValue && !props.disabled && !props.readonly;
    });
    const handleInput = (event) => {
      const target = event.target;
      const value = target.value;
      emit("update:modelValue", value);
      emit("input", value);
    };
    const handleChange = (event) => {
      const target = event.target;
      emit("change", target.value);
    };
    const handleFocus = (event) => {
      focused.value = true;
      emit("focus", event);
    };
    const handleBlur = (event) => {
      focused.value = false;
      emit("blur", event);
    };
    const handleKeydown = (event) => {
      emit("keydown", event);
    };
    const handleKeyup = (event) => {
      emit("keyup", event);
    };
    const handleKeypress = (event) => {
      emit("keypress", event);
    };
    const handleClear = () => {
      emit("update:modelValue", "");
      emit("input", "");
      emit("change", "");
      emit("clear");
      vue.nextTick(() => {
        inputRef.value?.focus();
      });
    };
    const focus = () => {
      inputRef.value?.focus();
    };
    const blur = () => {
      inputRef.value?.blur();
    };
    const select = () => {
      inputRef.value?.select();
    };
    __expose({
      focus,
      blur,
      select
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock(
        "div",
        {
          class: vue.normalizeClass(wrapperClasses.value)
        },
        [_ctx.label ? (vue.openBlock(), vue.createElementBlock(
          "label",
          {
            key: 0,
            class: vue.normalizeClass(labelClasses.value),
            for: inputId
          },
          [vue.createTextVNode(
            vue.toDisplayString(_ctx.label) + " ",
            1
            /* TEXT */
          ), _ctx.required ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_1, "*")) : vue.createCommentVNode("v-if", true)],
          2
          /* CLASS */
        )) : vue.createCommentVNode("v-if", true), vue.createElementVNode(
          "div",
          {
            class: vue.normalizeClass(inputWrapperClasses.value)
          },
          [_ctx.prefixIcon || _ctx.$slots.prefix ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_2, [vue.renderSlot(_ctx.$slots, "prefix", {}, () => [_ctx.prefixIcon ? (vue.openBlock(), vue.createElementBlock(
            "span",
            _hoisted_3,
            vue.toDisplayString(_ctx.prefixIcon),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)])])) : vue.createCommentVNode("v-if", true), vue.createElementVNode("input", {
            id: inputId,
            ref_key: "inputRef",
            ref: inputRef,
            class: vue.normalizeClass(inputClasses.value),
            type: _ctx.type,
            value: _ctx.modelValue,
            placeholder: _ctx.placeholder,
            disabled: _ctx.disabled,
            readonly: _ctx.readonly,
            maxlength: _ctx.maxlength,
            minlength: _ctx.minlength,
            max: _ctx.max,
            min: _ctx.min,
            step: _ctx.step,
            autocomplete: _ctx.autocomplete,
            onInput: handleInput,
            onChange: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onKeydown: handleKeydown,
            onKeyup: handleKeyup,
            onKeypress: handleKeypress
          }, null, 42, _hoisted_4), _ctx.suffixIcon || _ctx.$slots.suffix || showClearIcon.value ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_5, [showClearIcon.value ? (vue.openBlock(), vue.createElementBlock("span", {
            key: 0,
            class: "l-input__clear",
            onClick: handleClear
          }, " \u2715 ")) : vue.createCommentVNode("v-if", true), vue.renderSlot(_ctx.$slots, "suffix", {}, () => [_ctx.suffixIcon ? (vue.openBlock(), vue.createElementBlock(
            "span",
            _hoisted_6,
            vue.toDisplayString(_ctx.suffixIcon),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)])])) : vue.createCommentVNode("v-if", true)],
          2
          /* CLASS */
        ), _ctx.showWordCount ? (vue.openBlock(), vue.createElementBlock(
          "div",
          _hoisted_7,
          vue.toDisplayString(currentLength.value) + vue.toDisplayString(_ctx.maxlength ? `/${_ctx.maxlength}` : ""),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true), _ctx.errorMessage ? (vue.openBlock(), vue.createElementBlock(
          "div",
          _hoisted_8,
          vue.toDisplayString(_ctx.errorMessage),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true), _ctx.helpText ? (vue.openBlock(), vue.createElementBlock(
          "div",
          _hoisted_9,
          vue.toDisplayString(_ctx.helpText),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)],
        2
        /* CLASS */
      );
    };
  }
});

exports.default = script;
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=Input.vue2.cjs.map
