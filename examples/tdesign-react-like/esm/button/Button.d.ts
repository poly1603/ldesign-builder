import React from 'react';
export type ButtonTheme = 'default' | 'primary' | 'danger' | 'warning' | 'success';
export type ButtonVariant = 'base' | 'outline' | 'dashed' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    theme?: ButtonTheme;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    block?: boolean;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export default Button;
//# sourceMappingURL=Button.d.ts.map