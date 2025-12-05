/**
 * Solid.js Button Component
 */
import { Component, JSX } from 'solid-js';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children?: JSX.Element;
}
export declare const Button: Component<ButtonProps>;
//# sourceMappingURL=index.d.ts.map