import { Component, JSX, splitProps } from 'solid-js'
import './Button.less'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'primary' | 'default' | 'danger'
  size?: 'small' | 'medium' | 'large'
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ['type', 'size', 'class', 'children'])
  
  const buttonClasses = () => [
    'ldesign-button',
    `ldesign-button--${local.type || 'default'}`,
    `ldesign-button--${local.size || 'medium'}`,
    local.class
  ].filter(Boolean).join(' ')

  return (
    <button class={buttonClasses()} {...others}>
      {local.children}
    </button>
  )
}

