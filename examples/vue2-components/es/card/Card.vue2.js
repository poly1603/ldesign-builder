/*!
 * *******************************************
 * @ldesign/vue2-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:31:49         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
/**
 * Card 卡片组件
 * 
 * 提供通用的卡片容器，支持标题、封面、内容和底部区域
 * 可用于展示信息、操作面板等场景
 */
var script = {
  name: 'LCard',

  props: {
    /**
     * 卡片标题
     */
    title: {
      type: String,
      default: ''
    },

    /**
     * 卡片尺寸
     * @type {'small' | 'medium' | 'large'}
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },

    /**
     * 是否有边框
     */
    bordered: {
      type: Boolean,
      default: true
    },

    /**
     * 是否有阴影
     */
    shadow: {
      type: [Boolean, String],
      default: 'hover',
      validator: (value) => [true, false, 'always', 'hover', 'never'].includes(value)
    },

    /**
     * 是否可悬停
     */
    hoverable: {
      type: Boolean,
      default: false
    },

    /**
     * 内容区域是否有内边距
     */
    bodyPadding: {
      type: Boolean,
      default: true
    },

    /**
     * 是否加载中
     */
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * 卡片样式类名
     */
    cardClasses() {
      return [
        'l-card',
        `l-card--${this.size}`,
        {
          'l-card--bordered': this.bordered,
          'l-card--shadow-always': this.shadow === true || this.shadow === 'always',
          'l-card--shadow-hover': this.shadow === 'hover',
          'l-card--shadow-never': this.shadow === false || this.shadow === 'never',
          'l-card--hoverable': this.hoverable,
          'l-card--loading': this.loading
        }
      ]
    },

    /**
     * 内容区域样式类名
     */
    bodyClasses() {
      return [
        'l-card__body',
        {
          'l-card__body--no-padding': !this.bodyPadding
        }
      ]
    }
  }
};

export { script as default };
//# sourceMappingURL=Card.vue2.js.map
