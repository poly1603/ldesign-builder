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

require('./Button.vue.cjs');
var Button_vue_vue_type_script_lang = require('./Button.vue2.cjs');

/**
 * Button 按钮组件模块
 * 导出按钮组件和相关类型定义
 */

// import { VueConstructor } from 'vue'

// 注意：Vue2 环境下类型定义通过组件本身提供

// 为组件添加 install 方法，支持 Vue.use() 安装
Button_vue_vue_type_script_lang.default.install = function (Vue) {
  Vue.component(Button_vue_vue_type_script_lang.default.name || 'LButton', Button_vue_vue_type_script_lang.default);
};

// 导出组件名称常量
const BUTTON_COMPONENT_NAME = 'LButton';

/**
 * 按钮组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 基础按钮 -->
 *     <l-button @click="handleClick">默认按钮</l-button>
 *     
 *     <!-- 不同类型的按钮 -->
 *     <l-button type="primary">主要按钮</l-button>
 *     <l-button type="secondary">次要按钮</l-button>
 *     <l-button type="success">成功按钮</l-button>
 *     <l-button type="warning">警告按钮</l-button>
 *     <l-button type="error">错误按钮</l-button>
 *     <l-button type="text">文本按钮</l-button>
 *     
 *     <!-- 不同尺寸的按钮 -->
 *     <l-button size="small">小按钮</l-button>
 *     <l-button size="medium">中按钮</l-button>
 *     <l-button size="large">大按钮</l-button>
 *     
 *     <!-- 带图标的按钮 -->
 *     <l-button icon="🔍">搜索</l-button>
 *     <l-button icon="📁" icon-position="right">文件夹</l-button>
 *     
 *     <!-- 特殊状态的按钮 -->
 *     <l-button disabled>禁用按钮</l-button>
 *     <l-button loading>加载中</l-button>
 *     <l-button block>块级按钮</l-button>
 *     <l-button round>圆形按钮</l-button>
 *     <l-button circle icon="❤️"></l-button>
 *   </div>
 * </template>
 * 
 * <script>
 * import { Button } from '@ldesign/vue2-components-example/button'
 * 
 * export default {
 *   components: {
 *     LButton: Button
 *   },
 *   methods: {
 *     handleClick(event) {
 *       console.log('按钮被点击了', event)
 *     }
 *   }
 * }
 * </script>
 * ```
 */

exports.Button = Button_vue_vue_type_script_lang.default;
exports.default = Button_vue_vue_type_script_lang.default;
exports.BUTTON_COMPONENT_NAME = BUTTON_COMPONENT_NAME;
//# sourceMappingURL=index.cjs.map
