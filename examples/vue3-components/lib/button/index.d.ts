/**
 * Button 按钮组件模块 - Vue3 版本
 * 导出按钮组件和相关类型定义
 */
import Button from './Button.vue';
export type { ButtonProps, ButtonEmits } from './Button.vue';
export interface ButtonSlots {
    /** 默认插槽 - 按钮文本内容 */
    default?: () => any;
    /** 图标插槽 */
    icon?: () => any;
}
export default Button;
export { Button };
export declare const BUTTON_COMPONENT_NAME = "LButton";
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
 * <script setup lang="ts">
 * import { Button } from '@ldesign/vue3-components-example/button'
 *
 * const handleClick = (event: Event) => {
 *   console.log('按钮被点击了', event)
 * }
 * </script>
 * ```
 *
 * @example
 * ```typescript
 * // 在 Composition API 中使用
 * import { ref } from 'vue'
 * import { Button } from '@ldesign/vue3-components-example/button'
 *
 * export default {
 *   components: {
 *     LButton: Button
 *   },
 *   setup() {
 *     const loading = ref(false)
 *
 *     const handleAsyncAction = async () => {
 *       loading.value = true
 *       try {
 *         // 执行异步操作
 *         await someAsyncOperation()
 *       } finally {
 *         loading.value = false
 *       }
 *     }
 *
 *     return {
 *       loading,
 *       handleAsyncAction
 *     }
 *   }
 * }
 * ```
 */
