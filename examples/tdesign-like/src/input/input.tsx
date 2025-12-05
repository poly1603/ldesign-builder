import { defineComponent, ref, computed } from 'vue'
import { inputProps } from './type'
import { usePrefixClass } from '../hooks/useConfig'

export default defineComponent({
  name: 'TInput',
  props: inputProps,
  emits: ['update:modelValue', 'input', 'focus', 'blur', 'clear'],
  setup(props, { emit }) {
    const COMPONENT_NAME = usePrefixClass('input')
    const focused = ref(false)

    const inputClass = computed(() => [
      COMPONENT_NAME.value,
      `${COMPONENT_NAME.value}--size-${props.size}`,
      `${COMPONENT_NAME.value}--status-${props.status}`,
      { [`${COMPONENT_NAME.value}--disabled`]: props.disabled, [`${COMPONENT_NAME.value}--focused`]: focused.value }
    ])

    const handleInput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value
      emit('update:modelValue', val)
      emit('input', val, e)
    }

    return () => (
      <div class={inputClass.value}>
        {props.prefixIcon && <span class={`${COMPONENT_NAME.value}__prefix`}>{props.prefixIcon()}</span>}
        <input
          class={`${COMPONENT_NAME.value}__inner`}
          value={props.modelValue}
          placeholder={props.placeholder}
          disabled={props.disabled}
          readonly={props.readonly}
          maxlength={props.maxlength}
          onInput={handleInput}
          onFocus={() => { focused.value = true; emit('focus') }}
          onBlur={() => { focused.value = false; emit('blur') }}
        />
        {props.clearable && props.modelValue && (
          <span class={`${COMPONENT_NAME.value}__clear`} onClick={() => { emit('update:modelValue', ''); emit('clear') }}>×</span>
        )}
        {props.suffixIcon && <span class={`${COMPONENT_NAME.value}__suffix`}>{props.suffixIcon()}</span>}
      </div>
    )
  }
})
