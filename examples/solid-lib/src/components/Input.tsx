import { Component, JSX, splitProps } from 'solid-js'
import './Input.less'

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  size?: 'small' | 'medium' | 'large'
}

export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ['size', 'class'])
  
  const inputClasses = () => [
    'ldesign-input',
    `ldesign-input--${local.size || 'medium'}`,
    local.class
  ].filter(Boolean).join(' ')

  return <input class={inputClasses()} {...others} />
}

