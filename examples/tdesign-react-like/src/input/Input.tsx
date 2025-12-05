import React, { forwardRef, useState, useMemo } from 'react'
import classNames from '../_util/classNames'

export type InputSize = 'small' | 'medium' | 'large'
export type InputStatus = 'default' | 'success' | 'warning' | 'error'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: InputSize
  status?: InputStatus
  clearable?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onClear?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size = 'medium',
    status = 'default',
    disabled,
    clearable,
    prefix,
    suffix,
    value,
    className,
    onClear,
    onFocus,
    onBlur,
    ...rest
  } = props

  const [focused, setFocused] = useState(false)

  const wrapperClass = useMemo(() => classNames(
    't-input',
    `t-input--size-${size}`,
    `t-input--status-${status}`,
    {
      't-input--disabled': disabled,
      't-input--focused': focused,
    },
    className
  ), [size, status, disabled, focused, className])

  return (
    <div className={wrapperClass}>
      {prefix && <span className="t-input__prefix">{prefix}</span>}
      <input
        ref={ref}
        className="t-input__inner"
        disabled={disabled}
        value={value}
        onFocus={(e) => { setFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        {...rest}
      />
      {clearable && value && (
        <span className="t-input__clear" onClick={onClear}>×</span>
      )}
      {suffix && <span className="t-input__suffix">{suffix}</span>}
    </div>
  )
})

Input.displayName = 'TInput'
export default Input
