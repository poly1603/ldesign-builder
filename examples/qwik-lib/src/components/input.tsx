import { component$, type QwikIntrinsicElements } from '@builder.io/qwik'
import './input.less'

export interface InputProps extends QwikIntrinsicElements['input'] {
  size?: 'small' | 'medium' | 'large'
}

export const Input = component$<InputProps>(({ size = 'medium', ...props }) => {
  const inputClasses = [
    'ldesign-input',
    `ldesign-input--${size}`,
    props.disabled && 'ldesign-input--disabled'
  ].filter(Boolean).join(' ')

  return <input class={inputClasses} {...props} />
})

