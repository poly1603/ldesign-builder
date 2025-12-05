/**
 * Solid.js Button Component
 */
import { Component, JSX, splitProps, mergeProps } from 'solid-js'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children?: JSX.Element
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-blue-600 hover:bg-blue-50'
}

export const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps(
    { variant: 'primary' as ButtonVariant, size: 'md' as ButtonSize },
    props
  )

  const [local, rest] = splitProps(merged, [
    'variant',
    'size',
    'loading',
    'disabled',
    'children',
    'class'
  ])

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      {...rest}
      disabled={local.disabled || local.loading}
      class={`${baseClasses} ${sizeClasses[local.size]} ${variantClasses[local.variant]} ${local.class || ''}`}
    >
      {local.loading && (
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {local.children}
    </button>
  )
}
