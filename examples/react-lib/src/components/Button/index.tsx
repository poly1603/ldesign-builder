import React from 'react'
import './style.less'

export interface ButtonProps {
  /**
   * 按钮类型
   */
  type?: 'primary' | 'default' | 'danger'
  
  /**
   * 按钮大小
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 按钮文本
   */
  children?: React.ReactNode
  
  /**
   * 点击事件
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * Button 组件
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  children,
  onClick,
  className = ''
}) => {
  const classNames = [
    'ldesign-button',
    `ldesign-button--${type}`,
    `ldesign-button--${size}`,
    disabled && 'ldesign-button--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classNames}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

Button.displayName = 'Button'

