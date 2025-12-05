/**
 * Button 类型定义
 * 类似 TDesign 的 props 定义方式
 */

import type { PropType, ExtractPropTypes } from 'vue'

export type TdButtonTheme = 'default' | 'primary' | 'danger' | 'warning' | 'success'
export type TdButtonVariant = 'base' | 'outline' | 'dashed' | 'text'
export type TdButtonSize = 'small' | 'medium' | 'large'
export type TdButtonShape = 'rectangle' | 'square' | 'round' | 'circle'

export const buttonProps = {
  /** 按钮内容 */
  content: {
    type: [String, Function] as PropType<string | (() => any)>,
    default: ''
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否为加载状态 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 按钮形状 */
  shape: {
    type: String as PropType<TdButtonShape>,
    default: 'rectangle'
  },
  /** 按钮尺寸 */
  size: {
    type: String as PropType<TdButtonSize>,
    default: 'medium'
  },
  /** 按钮主题 */
  theme: {
    type: String as PropType<TdButtonTheme>,
    default: 'default'
  },
  /** 按钮形式 */
  variant: {
    type: String as PropType<TdButtonVariant>,
    default: 'base'
  },
  /** 是否为块级元素 */
  block: {
    type: Boolean,
    default: false
  },
  /** 是否为幽灵按钮 */
  ghost: {
    type: Boolean,
    default: false
  },
  /** 原生 type */
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  },
  /** 跳转地址 */
  href: String,
  /** 图标 */
  icon: Function as PropType<() => any>,
  /** 后置图标 */
  suffix: Function as PropType<() => any>
}

export type ButtonProps = ExtractPropTypes<typeof buttonProps>

export interface TdButtonProps {
  content?: string | (() => any)
  disabled?: boolean
  loading?: boolean
  shape?: TdButtonShape
  size?: TdButtonSize
  theme?: TdButtonTheme
  variant?: TdButtonVariant
  block?: boolean
  ghost?: boolean
  type?: 'button' | 'submit' | 'reset'
  href?: string
  icon?: () => any
  suffix?: () => any
  onClick?: (e: MouseEvent) => void
}
