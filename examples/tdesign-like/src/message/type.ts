import type { PropType, ExtractPropTypes } from 'vue'

export type TdMessageTheme = 'info' | 'success' | 'warning' | 'error' | 'loading'

export const messageProps = {
  theme: { type: String as PropType<TdMessageTheme>, default: 'info' },
  content: { type: [String, Function] as PropType<string | (() => any)>, default: '' },
  duration: { type: Number, default: 3000 },
  closable: { type: Boolean, default: false },
  icon: Function as PropType<() => any>,
}

export type MessageProps = ExtractPropTypes<typeof messageProps>

export interface MessageOptions {
  theme?: TdMessageTheme
  content: string | (() => any)
  duration?: number
  closable?: boolean
  onClose?: () => void
}
