/**
 * @ldesign/vue3-components-example
 *
 * Vue3 组件库示例
 * 展示如何使用 @ldesign/builder 打包 Vue3 组件库
 * 使用 Composition API 和现代 Vue3 特性
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { App } from 'vue';
import Button from './button';
import Input from './input';
import Modal from './modal';
import './styles/variables.less';
/**
 * 组件库版本信息
 */
export declare const VERSION = "1.0.0";
/**
 * 组件库信息
 */
export declare const LIBRARY_INFO: {
    readonly name: "@ldesign/vue3-components-example";
    readonly version: "1.0.0";
    readonly description: "Vue3 组件库示例 - 展示如何使用 @ldesign/builder 打包 Vue3 组件库";
    readonly author: "LDesign Team";
    readonly license: "MIT";
    readonly repository: "https://github.com/ldesign/ldesign";
    readonly homepage: "https://ldesign.dev";
};
/**
 * 安装函数 - 支持 app.use() 全局安装
 * @param app Vue 应用实例
 * @param options 安装选项
 */
declare function install(app: App, options?: any): void;
export { Button, Input, Modal };
export { BUTTON_COMPONENT_NAME } from './button';
export { INPUT_COMPONENT_NAME } from './input';
export { MODAL_COMPONENT_NAME } from './modal';
export type { ButtonProps, ButtonEmits } from './button';
export type { InputProps, InputEmits, InputInstance } from './input';
export type { ModalProps, ModalEmits } from './modal';
/**
 * 获取库信息
 * @returns 库信息对象
 * @example
 * ```typescript
 * import { getLibraryInfo } from '@ldesign/vue3-components-example'
 *
 * const info = getLibraryInfo()
 * console.log(info.name) // '@ldesign/vue3-components-example'
 * ```
 */
export declare function getLibraryInfo(): {
    readonly name: "@ldesign/vue3-components-example";
    readonly version: "1.0.0";
    readonly description: "Vue3 组件库示例 - 展示如何使用 @ldesign/builder 打包 Vue3 组件库";
    readonly author: "LDesign Team";
    readonly license: "MIT";
    readonly repository: "https://github.com/ldesign/ldesign";
    readonly homepage: "https://ldesign.dev";
};
/**
 * 打印库信息到控制台
 * @example
 * ```typescript
 * import { printLibraryInfo } from '@ldesign/vue3-components-example'
 *
 * printLibraryInfo()
 * // 输出库的详细信息
 * ```
 */
export declare function printLibraryInfo(): void;
declare const _default: {
    install: typeof install;
    VERSION: string;
    LIBRARY_INFO: {
        readonly name: "@ldesign/vue3-components-example";
        readonly version: "1.0.0";
        readonly description: "Vue3 组件库示例 - 展示如何使用 @ldesign/builder 打包 Vue3 组件库";
        readonly author: "LDesign Team";
        readonly license: "MIT";
        readonly repository: "https://github.com/ldesign/ldesign";
        readonly homepage: "https://ldesign.dev";
    };
    getLibraryInfo: typeof getLibraryInfo;
    printLibraryInfo: typeof printLibraryInfo;
    Button: any;
    Input: any;
    Modal: any;
};
export default _default;
/**
 * 组件库使用示例
 *
 * @example
 * ```typescript
 * // 方式1：全局安装
 * import { createApp } from 'vue'
 * import Vue3Components from '@ldesign/vue3-components-example'
 *
 * const app = createApp(App)
 * app.use(Vue3Components)
 *
 * // 方式2：按需引入
 * import { Button, Input, Modal } from '@ldesign/vue3-components-example'
 *
 * export default {
 *   components: {
 *     LButton: Button,
 *     LInput: Input,
 *     LModal: Modal
 *   }
 * }
 *
 * // 方式3：单个组件安装
 * import { Button } from '@ldesign/vue3-components-example'
 *
 * app.use(Button)
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 触发模态框的按钮 -->
 *     <l-button @click="showModal">打开登录框</l-button>
 *
 *     <!-- 登录模态框 -->
 *     <l-modal
 *       v-model:visible="visible"
 *       title="用户登录"
 *       width="400px"
 *       centered
 *     >
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
 *         style="margin-top: 16px;"
 *       />
 *
 *       <template #footer>
 *         <l-button @click="visible = false">取消</l-button>
 *         <l-button type="primary" :loading="loading" @click="handleLogin">
 *           登录
 *         </l-button>
 *       </template>
 *     </l-modal>
 *   </div>
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 *
 * const visible = ref(false)
 * const loading = ref(false)
 * const username = ref('')
 * const password = ref('')
 *
 * const showModal = () => {
 *   visible.value = true
 * }
 *
 * const handleLogin = async () => {
 *   loading.value = true
 *   try {
 *     // 模拟登录请求
 *     await new Promise(resolve => setTimeout(resolve, 2000))
 *     console.log('登录成功', { username: username.value, password: password.value })
 *     visible.value = false
 *   } finally {
 *     loading.value = false
 *   }
 * }
 * </script>
 * ```
 */
