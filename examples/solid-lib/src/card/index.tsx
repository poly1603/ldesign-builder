/**
 * Solid.js Card Component
 */
import { Component, JSX, splitProps, Show } from 'solid-js'

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  title?: string
  bordered?: boolean
  shadow?: boolean
  children?: JSX.Element
  footer?: JSX.Element
  extra?: JSX.Element
}

export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'title',
    'bordered',
    'shadow',
    'children',
    'footer',
    'extra',
    'class'
  ])

  const cardClasses = () => {
    const classes = ['bg-white rounded-lg overflow-hidden']
    if (local.bordered) classes.push('border border-gray-200')
    if (local.shadow) classes.push('shadow-md')
    if (local.class) classes.push(local.class)
    return classes.join(' ')
  }

  return (
    <div {...rest} class={cardClasses()}>
      <Show when={local.title}>
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{local.title}</h3>
          <Show when={local.extra}>
            <div>{local.extra}</div>
          </Show>
        </div>
      </Show>

      <div class="p-4">
        {local.children}
      </div>

      <Show when={local.footer}>
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {local.footer}
        </div>
      </Show>
    </div>
  )
}
