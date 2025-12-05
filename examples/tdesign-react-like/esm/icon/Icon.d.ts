import React from 'react';
export type IconSize = 'small' | 'medium' | 'large' | string | number;
export interface IconProps extends React.HTMLAttributes<HTMLElement> {
    name: string;
    size?: IconSize;
    color?: string;
    spin?: boolean;
    rotate?: number;
}
declare const Icon: React.FC<IconProps>;
export default Icon;
//# sourceMappingURL=Icon.d.ts.map