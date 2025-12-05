import type { PropType, ExtractPropTypes } from 'vue'

export type TdIconSize = 'small' | 'medium' | 'large' | string | number

export const iconProps = {
  name: { type: String, required: true as const },
  size: { type: [String, Number] as PropType<TdIconSize>, default: 'medium' },
  color: String,
  rotate: Number,
  spin: { type: Boolean, default: false },
}

export type IconProps = ExtractPropTypes<typeof iconProps>
