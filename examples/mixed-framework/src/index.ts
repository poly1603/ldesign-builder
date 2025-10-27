/**
 * 混合框架示例项目入口
 * 
 * 导出 Vue 和 React 组件
 */

// Vue 组件
export { default as VueButton } from './vue/Button.vue'
export { default as VueCard } from './vue/Card.vue'
export * from './vue/composables'

// React 组件
export { ReactButton } from './react/Button'
export { ReactCard } from './react/Card'
export * from './react/hooks'

// 共享工具
export * from './shared/utils'
export * from './shared/types'

// 版本信息
export const version = '1.0.0'

