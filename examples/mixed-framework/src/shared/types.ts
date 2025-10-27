/**
 * 共享类型定义
 */

import type { MouseEvent } from 'react'

/**
 * 按钮属性
 */
export interface ButtonProps {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 点击事件处理器 */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  /** 子元素 */
  children?: any
}

/**
 * 卡片属性
 */
export interface CardProps {
  /** 标题 */
  title: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否可悬停 */
  hoverable?: boolean
  /** 点击事件处理器 */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

