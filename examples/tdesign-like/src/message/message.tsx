import { defineComponent, computed } from 'vue'
import { messageProps } from './type'
import { usePrefixClass } from '../hooks/useConfig'

export default defineComponent({
  name: 'TMessage',
  props: messageProps,
  emits: ['close'],
  setup(props, { emit }) {
    const COMPONENT_NAME = usePrefixClass('message')

    const messageClass = computed(() => [
      COMPONENT_NAME.value,
      `${COMPONENT_NAME.value}--${props.theme}`
    ])

    const renderContent = () => {
      return typeof props.content === 'function' ? props.content() : props.content
    }

    return () => (
      <div class={messageClass.value}>
        {props.icon && <span class={`${COMPONENT_NAME.value}__icon`}>{props.icon()}</span>}
        <span class={`${COMPONENT_NAME.value}__content`}>{renderContent()}</span>
        {props.closable && (
          <span class={`${COMPONENT_NAME.value}__close`} onClick={() => emit('close')}>×</span>
        )}
      </div>
    )
  }
})
