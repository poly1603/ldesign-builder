import React from 'react';
export type InputSize = 'small' | 'medium' | 'large';
export type InputStatus = 'default' | 'success' | 'warning' | 'error';
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
    size?: InputSize;
    status?: InputStatus;
    clearable?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    onClear?: () => void;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export default Input;
//# sourceMappingURL=Input.d.ts.map