import type { PropType, ExtractPropTypes } from 'vue'

export type TdInputSize = 'small' | 'medium' | 'large'
export type TdInputStatus = 'default' | 'success' | 'warning' | 'error'

export const inputProps = {
  modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  size: { type: String as PropType<TdInputSize>, default: 'medium' },
  status: { type: String as PropType<TdInputStatus>, default: 'default' },
  clearable: { type: Boolean, default: false },
  maxlength: Number,
  prefixIcon: Function as PropType<() => any>,
  suffixIcon: Function as PropType<() => any>,
}

export type InputProps = ExtractPropTypes<typeof inputProps>
