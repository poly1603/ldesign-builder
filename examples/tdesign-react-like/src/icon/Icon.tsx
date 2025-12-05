import React, { useMemo } from 'react'
import classNames from '../_util/classNames'

export type IconSize = 'small' | 'medium' | 'large' | string | number

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string
  size?: IconSize
  color?: string
  spin?: boolean
  rotate?: number
}

const SIZE_MAP: Record<string, string> = {
  small: '16px',
  medium: '20px',
  large: '24px'
}

const Icon: React.FC<IconProps> = (props) => {
  const { name, size = 'medium', color, spin, rotate, className, style, ...rest } = props

  const iconSize = useMemo(() => {
    if (typeof size === 'number') return `${size}px`
    return SIZE_MAP[size] || size
  }, [size])

  const iconClass = classNames(
    't-icon',
    `t-icon-${name}`,
    { 't-icon--spin': spin },
    className
  )

  const iconStyle: React.CSSProperties = {
    fontSize: iconSize,
    color,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
    ...style
  }

  return <i className={iconClass} style={iconStyle} {...rest} />
}

Icon.displayName = 'TIcon'
export default Icon
