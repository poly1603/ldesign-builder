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

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Button 按钮组件
 * 
 * 提供多种样式和状态的按钮组件
 * 支持图标、加载状态、禁用状态等功能
 */
var script = {
  name: 'LButton',

  props: {
    /**
     * 按钮类型
     * @type {'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'text'}
     */
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'text'].includes(value)
    },

    /**
     * 按钮尺寸
     * @type {'small' | 'medium' | 'large'}
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },

    /**
     * 是否为块级按钮
     */
    block: {
      type: Boolean,
      default: false
    },

    /**
     * 是否为圆形按钮
     */
    round: {
      type: Boolean,
      default: false
    },

    /**
     * 是否为圆角按钮
     */
    circle: {
      type: Boolean,
      default: false
    },

    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * 是否加载中
     */
    loading: {
      type: Boolean,
      default: false
    },

    /**
     * 图标
     */
    icon: {
      type: String,
      default: ''
    },

    /**
     * 图标位置
     * @type {'left' | 'right'}
     */
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    }
  },

  computed: {
    /**
     * 按钮样式类名
     */
    buttonClasses() {
      return [
        'l-button',
        `l-button--${this.type}`,
        `l-button--${this.size}`,
        {
          'l-button--block': this.block,
          'l-button--round': this.round,
          'l-button--circle': this.circle,
          'l-button--disabled': this.disabled,
          'l-button--loading': this.loading
        }
      ]
    }
  },

  methods: {
    /**
     * 处理点击事件
     */
    handleClick(event) {
      if (this.disabled || this.loading) {
        return
      }

      /**
       * 点击事件
       * @event click
       * @param {Event} event - 原生点击事件
       */
      this.$emit('click', event);
    }
  }
};

exports.default = script;
//# sourceMappingURL=Button.vue2.cjs.map
