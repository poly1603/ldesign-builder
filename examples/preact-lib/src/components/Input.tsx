import { h, FunctionComponent } from 'preact'
import './Input.less'

export interface InputProps {
  type?: 'text' | 'password' | 'email'
  size?: 'small' | 'medium' | 'large'
  value?: string
  placeholder?: string
  disabled?: boolean
  onInput?: (event: Event) => void
}

export const Input: FunctionComponent<InputProps> = ({
  type = 'text',
  size = 'medium',
  value,
  placeholder,
  disabled = false,
  onInput
}) => {
  const inputClasses = [
    'ldesign-input',
    `ldesign-input--${size}`,
    disabled && 'ldesign-input--disabled'
  ].filter(Boolean).join(' ')

  return (
    <input
      class={inputClasses}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onInput={onInput}
    />
  )
}

