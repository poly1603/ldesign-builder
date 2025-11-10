import { component$, Slot, type QwikIntrinsicElements } from '@builder.io/qwik'
import './button.less'

export interface ButtonProps extends QwikIntrinsicElements['button'] {
  type?: 'primary' | 'default' | 'danger'
  size?: 'small' | 'medium' | 'large'
}

export const Button = component$<ButtonProps>(({ type = 'default', size = 'medium', ...props }) => {
  const buttonClasses = [
    'ldesign-button',
    `ldesign-button--${type}`,
    `ldesign-button--${size}`,
    props.disabled && 'ldesign-button--disabled'
  ].filter(Boolean).join(' ')

  return (
    <button class={buttonClasses} {...props}>
      <Slot />
    </button>
  )
})

