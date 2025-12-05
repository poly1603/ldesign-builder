import { defineComponent, computed } from 'vue'
import { iconProps } from './type'
import { usePrefixClass } from '../hooks/useConfig'

const SIZE_MAP: Record<string, string> = { small: '16px', medium: '20px', large: '24px' }

export default defineComponent({
  name: 'TIcon',
  props: iconProps,
  setup(props) {
    const COMPONENT_NAME = usePrefixClass('icon')

    const iconSize = computed(() => {
      if (typeof props.size === 'number') return `${props.size}px`
      return SIZE_MAP[props.size] || props.size
    })

    const iconStyle = computed(() => ({
      fontSize: iconSize.value,
      color: props.color,
      transform: props.rotate ? `rotate(${props.rotate}deg)` : undefined,
    }))

    const iconClass = computed(() => [
      COMPONENT_NAME.value,
      `${COMPONENT_NAME.value}-${props.name}`,
      { [`${COMPONENT_NAME.value}--spin`]: props.spin }
    ])

    return () => <i class={iconClass.value} style={iconStyle.value} />
  }
})
