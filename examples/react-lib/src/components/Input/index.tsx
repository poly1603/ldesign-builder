import React, { forwardRef } from 'react'
import './style.less'

export interface InputProps {
  /**
   * 输入框类型
   */
  type?: 'text' | 'password' | 'email' | 'number'
  
  /**
   * 输入框大小
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 输入框值
   */
  value?: string
  
  /**
   * 默认值
   */
  defaultValue?: string
  
  /**
   * 占位符
   */
  placeholder?: string
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 是否只读
   */
  readOnly?: boolean
  
  /**
   * 值变化回调
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  
  /**
   * 获得焦点回调
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  
  /**
   * 失去焦点回调
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * Input 组件
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  size = 'medium',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  onChange,
  onFocus,
  onBlur,
  className = ''
}, ref) => {
  const classNames = [
    'ldesign-input',
    `ldesign-input--${size}`,
    disabled && 'ldesign-input--disabled',
    readOnly && 'ldesign-input--readonly',
    className
  ].filter(Boolean).join(' ')

  return (
    <input
      ref={ref}
      type={type}
      className={classNames}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
})

Input.displayName = 'Input'

