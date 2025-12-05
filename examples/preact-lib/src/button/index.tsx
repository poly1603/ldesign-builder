/**
 * Preact Button Component
 */
import { h, FunctionComponent } from 'preact'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children?: preact.ComponentChildren
  className?: string
}

const sizeStyles = {
  sm: { padding: '6px 12px', fontSize: '12px' },
  md: { padding: '8px 16px', fontSize: '14px' },
  lg: { padding: '12px 24px', fontSize: '16px' }
}

const variantStyles = {
  primary: { background: '#0066ff', color: 'white', border: 'none' },
  secondary: { background: '#6c757d', color: 'white', border: 'none' },
  outline: { background: 'transparent', color: '#0066ff', border: '1px solid #0066ff' },
  ghost: { background: 'transparent', color: '#0066ff', border: 'none' }
}

export const Button: FunctionComponent<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = ''
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant]
  }

  return (
    <button
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
    >
      {loading && (
        <span style={{
          width: '14px',
          height: '14px',
          border: '2px solid currentColor',
          borderRightColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          marginRight: '8px'
        }} />
      )}
      {children}
    </button>
  )
}
