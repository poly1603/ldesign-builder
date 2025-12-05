/**
 * Button 组件实现
 * 使用 TSX 格式，类似 TDesign Vue Next
 */

import { defineComponent, computed } from 'vue'
import { buttonProps } from './type'
import { usePrefixClass } from '../hooks/useConfig'

export default defineComponent({
  name: 'TButton',
  props: buttonProps,
  emits: ['click'],

  setup(props, { slots, emit }) {
    const COMPONENT_NAME = usePrefixClass('button')

    const buttonClass = computed(() => {
      return [
        COMPONENT_NAME.value,
        `${COMPONENT_NAME.value}--theme-${props.theme}`,
        `${COMPONENT_NAME.value}--variant-${props.variant}`,
        `${COMPONENT_NAME.value}--size-${props.size}`,
        `${COMPONENT_NAME.value}--shape-${props.shape}`,
        {
          [`${COMPONENT_NAME.value}--disabled`]: props.disabled,
          [`${COMPONENT_NAME.value}--loading`]: props.loading,
          [`${COMPONENT_NAME.value}--block`]: props.block,
          [`${COMPONENT_NAME.value}--ghost`]: props.ghost,
        }
      ]
    })

    const handleClick = (e: MouseEvent) => {
      if (props.disabled || props.loading) {
        e.preventDefault()
        return
      }
      emit('click', e)
    }

    const renderContent = () => {
      const content = slots.default?.() ?? props.content
      return typeof content === 'function' ? content() : content
    }

    const renderIcon = () => {
      if (props.loading) {
        return <span class={`${COMPONENT_NAME.value}__loading`}></span>
      }
      if (props.icon) {
        return <span class={`${COMPONENT_NAME.value}__icon`}>{props.icon()}</span>
      }
      return null
    }

    const renderSuffix = () => {
      if (props.suffix) {
        return <span class={`${COMPONENT_NAME.value}__suffix`}>{props.suffix()}</span>
      }
      return null
    }

    return () => {
      const Tag = props.href ? 'a' : 'button'
      const buttonProps: Record<string, any> = {
        class: buttonClass.value,
        disabled: props.disabled,
        onClick: handleClick,
      }

      if (props.href) {
        buttonProps.href = props.disabled ? undefined : props.href
      } else {
        buttonProps.type = props.type
      }

      return (
        <Tag {...buttonProps}>
          {renderIcon()}
          <span class={`${COMPONENT_NAME.value}__text`}>{renderContent()}</span>
          {renderSuffix()}
        </Tag>
      )
    }
  }
})
