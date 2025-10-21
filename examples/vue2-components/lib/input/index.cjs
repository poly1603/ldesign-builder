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

require('./Input.vue.cjs');
var Input_vue_vue_type_script_lang = require('./Input.vue2.cjs');

/**
 * Input 输入框组件模块
 * 导出输入框组件和相关类型定义
 */

// import { VueConstructor } from 'vue'

// 注意：Vue2 环境下类型定义通过组件本身提供

// 为组件添加 install 方法，支持 Vue.use() 安装
Input_vue_vue_type_script_lang.default.install = function (Vue) {
  Vue.component(Input_vue_vue_type_script_lang.default.name || 'LInput', Input_vue_vue_type_script_lang.default);
};

// 导出组件名称常量
const INPUT_COMPONENT_NAME = 'LInput';

/**
 * 输入框组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 基础输入框 -->
 *     <l-input v-model="value" placeholder="请输入内容" />
 *     
 *     <!-- 带标签的输入框 -->
 *     <l-input
 *       v-model="username"
 *       label="用户名"
 *       placeholder="请输入用户名"
 *       required
 *     />
 *     
 *     <!-- 不同尺寸的输入框 -->
 *     <l-input v-model="value" size="small" placeholder="小尺寸" />
 *     <l-input v-model="value" size="medium" placeholder="中尺寸" />
 *     <l-input v-model="value" size="large" placeholder="大尺寸" />
 *     
 *     <!-- 带图标的输入框 -->
 *     <l-input
 *       v-model="search"
 *       prefix-icon="🔍"
 *       placeholder="搜索"
 *       clearable
 *     />
 *     
 *     <!-- 密码输入框 -->
 *     <l-input
 *       v-model="password"
 *       type="password"
 *       label="密码"
 *       placeholder="请输入密码"
 *       show-word-count
 *       maxlength="20"
 *     />
 *     
 *     <!-- 数字输入框 -->
 *     <l-input
 *       v-model="number"
 *       type="number"
 *       label="数量"
 *       :min="1"
 *       :max="100"
 *       :step="1"
 *     />
 *     
 *     <!-- 带验证的输入框 -->
 *     <l-input
 *       v-model="email"
 *       type="email"
 *       label="邮箱"
 *       placeholder="请输入邮箱地址"
 *       :error-message="emailError"
 *       help-text="请输入有效的邮箱地址"
 *     />
 *     
 *     <!-- 禁用和只读状态 -->
 *     <l-input v-model="value" disabled placeholder="禁用状态" />
 *     <l-input v-model="value" readonly placeholder="只读状态" />
 *   </div>
 * </template>
 * 
 * <script>
 * import { Input } from '@ldesign/vue2-components-example/input'
 * 
 * export default {
 *   components: {
 *     LInput: Input
 *   },
 *   data() {
 *     return {
 *       value: '',
 *       username: '',
 *       search: '',
 *       password: '',
 *       number: 1,
 *       email: '',
 *       emailError: ''
 *     }
 *   },
 *   watch: {
 *     email(newValue) {
 *       // 简单的邮箱验证
 *       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *       this.emailError = newValue && !emailRegex.test(newValue) ? '请输入有效的邮箱地址' : ''
 *     }
 *   }
 * }
 * </script>
 * ```
 */

exports.Input = Input_vue_vue_type_script_lang.default;
exports.default = Input_vue_vue_type_script_lang.default;
exports.INPUT_COMPONENT_NAME = INPUT_COMPONENT_NAME;
//# sourceMappingURL=index.cjs.map
