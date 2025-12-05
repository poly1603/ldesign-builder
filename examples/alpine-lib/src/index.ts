/**
 * Alpine.js 组件库入口
 */
export { tooltipPlugin, type TooltipOptions } from './plugins/tooltip'
export { modalPlugin, type ModalOptions } from './plugins/modal'
export { clipboardDirective } from './directives/clipboard'
export { intersectDirective } from './directives/intersect'

// 导出所有插件的注册函数
export function registerAll(Alpine: any) {
  Alpine.plugin(tooltipPlugin)
  Alpine.plugin(modalPlugin)
  Alpine.directive('clipboard', clipboardDirective)
  Alpine.directive('intersect', intersectDirective)
}
