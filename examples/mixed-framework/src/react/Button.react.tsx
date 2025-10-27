/**
 * React Button 组件
 */

import React, { type FC, type MouseEvent } from 'react'
import type { ButtonProps } from '../shared/types'

export const ReactButton: FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  children
}) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(event)
    }
  }

  const classNames = [
    'btn',
    `btn--${type}`,
    `btn--${size}`,
    disabled && 'btn--disabled'
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classNames}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

ReactButton.displayName = 'ReactButton'

