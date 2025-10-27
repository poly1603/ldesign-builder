/**
 * Vue Card 组件（使用 TSX）
 */

import { defineComponent, type PropType } from 'vue'
import type { CardProps } from '../shared/types'

export default defineComponent({
  name: 'VueCard',

  props: {
    title: {
      type: String,
      required: true
    },
    bordered: {
      type: Boolean,
      default: true
    },
    hoverable: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click'],

  setup(props, { slots, emit }) {
    const handleClick = (event: MouseEvent) => {
      if (props.hoverable) {
        emit('click', event)
      }
    }

    return () => (
      <div
        class={{
          'card': true,
          'card--bordered': props.bordered,
          'card--hoverable': props.hoverable
        }}
        onClick={handleClick}
      >
        <div class="card__header">
          <h3 class="card__title">{props.title}</h3>
        </div>
        <div class="card__body">
          {slots.default?.()}
        </div>
        {slots.footer && (
          <div class="card__footer">
            {slots.footer()}
          </div>
        )}
      </div>
    )
  }
})

