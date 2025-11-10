import { h, FunctionComponent } from 'preact'
import './Button.less'

export interface ButtonProps {
  type?: 'primary' | 'default' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
  children?: any
}

export const Button: FunctionComponent<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  children
}) => {
  const buttonClasses = [
    'ldesign-button',
    `ldesign-button--${type}`,
    `ldesign-button--${size}`,
    disabled && 'ldesign-button--disabled'
  ].filter(Boolean).join(' ')

  return (
    <button class={buttonClasses} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

