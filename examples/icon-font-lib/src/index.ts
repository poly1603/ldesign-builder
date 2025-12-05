/**
 * 图标字体库入口
 */
import './index.less'

export const icons = [
  'close', 'check', 'info', 'warning', 'error', 'loading',
  'search', 'plus', 'minus', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
  'home', 'user', 'setting', 'menu', 'more', 'edit', 'delete', 'copy',
  'folder', 'file', 'download', 'upload', 'link', 'star', 'heart', 'share'
] as const

export type IconName = typeof icons[number]

export function getIconClass(name: IconName): string {
  return `ti ti-${name}`
}
