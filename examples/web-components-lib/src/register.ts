/**
 * 注册所有组件
 */
import { defineLButton } from './button'
import { defineLModal } from './modal'
import { defineLTooltip } from './tooltip'

export function defineAllComponents(prefix = 'l') {
  defineLButton(`${prefix}-button`)
  defineLModal(`${prefix}-modal`)
  defineLTooltip(`${prefix}-tooltip`)
}
