/**
 * 公共类型定义
 */

export type TdSize = 'small' | 'medium' | 'large'
export type TdStatus = 'default' | 'success' | 'warning' | 'error'

export interface TdCommonProps {
  size?: TdSize
  disabled?: boolean
}

export type TNode = string | (() => any)
