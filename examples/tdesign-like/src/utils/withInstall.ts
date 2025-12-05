/**
 * Vue 组件安装工具
 */
import type { App, Component, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

export function withInstall<T extends Component>(component: T, alias?: string): SFCWithInstall<T> {
  const comp = component as SFCWithInstall<T>
  comp.install = (app: App) => {
    const name = (component as any).name
    if (name) {
      app.component(name, component)
      alias && app.component(alias, component)
    }
  }
  return comp
}
