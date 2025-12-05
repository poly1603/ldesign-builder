/**
 * Solid.js Card Component
 */
import { Component, JSX } from 'solid-js';
export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
    title?: string;
    bordered?: boolean;
    shadow?: boolean;
    children?: JSX.Element;
    footer?: JSX.Element;
    extra?: JSX.Element;
}
export declare const Card: Component<CardProps>;
//# sourceMappingURL=index.d.ts.map