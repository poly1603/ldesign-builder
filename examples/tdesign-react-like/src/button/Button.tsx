import React, { forwardRef, useMemo } from 'react'
import classNames from '../_util/classNames'

export type ButtonTheme = 'default' | 'primary' | 'danger' | 'warning' | 'success'
export type ButtonVariant = 'base' | 'outline' | 'dashed' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ButtonTheme
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  block?: boolean
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    theme = 'default',
    variant = 'base',
    size = 'medium',
    loading = false,
    block = false,
    disabled,
    icon,
    suffix,
    children,
    className,
    ...rest
  } = props

  const buttonClass = useMemo(() => classNames(
    't-button',
    `t-button--theme-${theme}`,
    `t-button--variant-${variant}`,
    `t-button--size-${size}`,
    {
      't-button--disabled': disabled,
      't-button--loading': loading,
      't-button--block': block,
    },
    className
  ), [theme, variant, size, disabled, loading, block, className])

  return (
    <button ref={ref} className={buttonClass} disabled={disabled || loading} {...rest}>
      {loading && <span className="t-button__loading" />}
      {!loading && icon && <span className="t-button__icon">{icon}</span>}
      <span className="t-button__text">{children}</span>
      {suffix && <span className="t-button__suffix">{suffix}</span>}
    </button>
  )
})

Button.displayName = 'TButton'
export default Button
