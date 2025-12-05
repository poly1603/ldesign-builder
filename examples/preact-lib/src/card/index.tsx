/**
 * Preact Card Component
 */
import { h, FunctionComponent, Fragment } from 'preact'

export interface CardProps {
  title?: string
  bordered?: boolean
  shadow?: boolean
  children?: preact.ComponentChildren
  footer?: preact.ComponentChildren
  extra?: preact.ComponentChildren
  className?: string
}

export const Card: FunctionComponent<CardProps> = ({
  title,
  bordered = true,
  shadow = false,
  children,
  footer,
  extra,
  className = ''
}) => {
  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    border: bordered ? '1px solid #e5e7eb' : 'none',
    boxShadow: shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb'
  }

  const titleStyle = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937'
  }

  const bodyStyle = {
    padding: '16px'
  }

  const footerStyle = {
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb'
  }

  return (
    <div style={cardStyle} className={className}>
      {title && (
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={bodyStyle}>{children}</div>
      {footer && <div style={footerStyle}>{footer}</div>}
    </div>
  )
}
