/**
 * Preact Button Component
 */
import { FunctionComponent } from 'preact';
export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    children?: preact.ComponentChildren;
    className?: string;
}
export declare const Button: FunctionComponent<ButtonProps>;
//# sourceMappingURL=index.d.ts.map