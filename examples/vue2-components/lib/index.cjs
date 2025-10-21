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

var index$1 = require('./button/index.cjs');
var index$2 = require('./input/index.cjs');
var index$3 = require('./card/index.cjs');
require('./button/Button.vue.cjs');
var Button_vue_vue_type_script_lang = require('./button/Button.vue2.cjs');
require('./input/Input.vue.cjs');
var Input_vue_vue_type_script_lang = require('./input/Input.vue2.cjs');
require('./card/Card.vue.cjs');
var Card_vue_vue_type_script_lang = require('./card/Card.vue2.cjs');

/**
 * @ldesign/vue2-components-example
 * 
 * Vue2 组件库示例
 * 展示如何使用 @ldesign/builder 打包 Vue2 组件库
 * 
 * @author LDesign Team
 * @version 1.0.0
 */


// 样式暂时移除，等待 rollup-plugin-vue 版本兼容性问题解决
// import './styles/variables.less'

// 组件列表
const components = [
  Button_vue_vue_type_script_lang.default,
  Input_vue_vue_type_script_lang.default,
  Card_vue_vue_type_script_lang.default
];

/**
 * 组件库版本信息
 */
const VERSION = '1.0.0';

/**
 * 组件库信息
 */
const LIBRARY_INFO = {
  name: '@ldesign/vue2-components-example',
  version: VERSION,
  description: 'Vue2 组件库示例 - 展示如何使用 @ldesign/builder 打包 Vue2 组件库',
  author: 'LDesign Team',
  license: 'MIT',
  repository: 'https://github.com/ldesign/ldesign',
  homepage: 'https://ldesign.dev'
};

/**
 * 安装函数 - 支持 Vue.use() 全局安装
 * @param Vue Vue 构造函数
 * @param options 安装选项
 */
function install(Vue, options = {}) {
  // 避免重复安装
  if (install.installed) {
    return
  }
  install.installed = true;

  // 注册所有组件
  components.forEach(component => {
    if (component.install) {
      component.install(Vue);
    } else if (component.name) {
      Vue.component(component.name, component);
    }
  });

  // 在 Vue 原型上添加库信息（可选）
  if (options.addLibraryInfo !== false) {
    Vue.prototype.$LDESIGN_VUE2_COMPONENTS = LIBRARY_INFO;
  }
}

// 自动安装（如果在浏览器环境中通过 script 标签引入）
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

// 注意：Vue2 环境下类型定义通过组件本身提供

/**
 * 获取库信息
 * @returns 库信息对象
 * @example
 * ```typescript
 * import { getLibraryInfo } from '@ldesign/vue2-components-example'
 * 
 * const info = getLibraryInfo()
 * console.log(info.name) // '@ldesign/vue2-components-example'
 * ```
 */
function getLibraryInfo() {
  return LIBRARY_INFO
}

/**
 * 打印库信息到控制台
 * @example
 * ```typescript
 * import { printLibraryInfo } from '@ldesign/vue2-components-example'
 * 
 * printLibraryInfo()
 * // 输出库的详细信息
 * ```
 */
function printLibraryInfo() {
  console.log(`
╭─────────────────────────────────────────────────────────────╮
│                   Vue2 Components Example                   │
├─────────────────────────────────────────────────────────────┤
│ Name:        ${LIBRARY_INFO.name.padEnd(43)} │
│ Version:     ${LIBRARY_INFO.version.padEnd(43)} │
│ Description: ${LIBRARY_INFO.description.slice(0, 43).padEnd(43)} │
│ Author:      ${LIBRARY_INFO.author.padEnd(43)} │
│ License:     ${LIBRARY_INFO.license.padEnd(43)} │
╰─────────────────────────────────────────────────────────────╯
  `);
}

// 默认导出：包含 install 方法的对象
var index = {
  install,
  VERSION,
  LIBRARY_INFO,
  getLibraryInfo,
  printLibraryInfo,

  // 组件
  Button: Button_vue_vue_type_script_lang.default,
  Input: Input_vue_vue_type_script_lang.default,
  Card: Card_vue_vue_type_script_lang.default
};

/**
 * 组件库使用示例
 * 
 * @example
 * ```typescript
 * // 方式1：全局安装
 * import Vue from 'vue'
 * import Vue2Components from '@ldesign/vue2-components-example'
 * 
 * Vue.use(Vue2Components)
 * 
 * // 方式2：按需引入
 * import { Button, Input, Card } from '@ldesign/vue2-components-example'
 * 
 * export default {
 *   components: {
 *     LButton: Button,
 *     LInput: Input,
 *     LCard: Card
 *   }
 * }
 * 
 * // 方式3：单个组件安装
 * import { Button } from '@ldesign/vue2-components-example'
 * 
 * Vue.use(Button)
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <l-card title="用户登录">
 *       <l-input
 *         v-model="username"
 *         label="用户名"
 *         placeholder="请输入用户名"
 *         prefix-icon="👤"
 *       />
 *       <l-input
 *         v-model="password"
 *         type="password"
 *         label="密码"
 *         placeholder="请输入密码"
 *         prefix-icon="🔒"
 *       />
 *       <template #footer>
 *         <l-button type="primary" block @click="handleLogin">
 *           登录
 *         </l-button>
 *       </template>
 *     </l-card>
 *   </div>
 * </template>
 * 
 * <script>
 * export default {
 *   data() {
 *     return {
 *       username: '',
 *       password: ''
 *     }
 *   },
 *   methods: {
 *     handleLogin() {
 *       console.log('登录', { username: this.username, password: this.password })
 *     }
 *   }
 * }
 * </script>
 * ```
 */

exports.BUTTON_COMPONENT_NAME = index$1.BUTTON_COMPONENT_NAME;
exports.INPUT_COMPONENT_NAME = index$2.INPUT_COMPONENT_NAME;
exports.CARD_COMPONENT_NAME = index$3.CARD_COMPONENT_NAME;
exports.Button = Button_vue_vue_type_script_lang.default;
exports.Input = Input_vue_vue_type_script_lang.default;
exports.Card = Card_vue_vue_type_script_lang.default;
exports.LIBRARY_INFO = LIBRARY_INFO;
exports.VERSION = VERSION;
exports.default = index;
exports.getLibraryInfo = getLibraryInfo;
exports.printLibraryInfo = printLibraryInfo;
//# sourceMappingURL=index.cjs.map
