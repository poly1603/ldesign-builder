/**
 * React Card 组件
 */

import React, { type FC, type MouseEvent, type ReactNode } from 'react'
import type { CardProps } from '../shared/types'

interface ReactCardProps extends CardProps {
  children: ReactNode
  footer?: ReactNode
}

export const ReactCard: FC<ReactCardProps> = ({
  title,
  bordered = true,
  hoverable = false,
  onClick,
  children,
  footer
}) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (hoverable && onClick) {
      onClick(event)
    }
  }

  const classNames = [
    'card',
    bordered && 'card--bordered',
    hoverable && 'card--hoverable'
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} onClick={handleClick}>
      <div className="card__header">
        <h3 className="card__title">{title}</h3>
      </div>
      <div className="card__body">
        {children}
      </div>
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  )
}

ReactCard.displayName = 'ReactCard'

