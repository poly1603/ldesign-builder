/**
 * TDesign-like 组件库入口
 * 类似 TDesign Vue Next 的组件库结构
 */

// 组件导出
export { default as Button } from './button'
export * from './button'

export { default as Input } from './input'
export * from './input'

export { default as Icon } from './icon'
export * from './icon'

export { default as Message } from './message'
export * from './message'

// 类型导出
export type * from './common'

// 安装函数
import type { App, Plugin } from 'vue'
import Button from './button'
import Input from './input'
import Icon from './icon'
import Message from './message'

const components: Plugin[] = [Button, Input, Icon, Message]

export function install(app: App): void {
  components.forEach(component => {
    if (component.install) {
      app.use(component)
    }
  })
}

export default {
  install,
  version: '1.0.0'
}
