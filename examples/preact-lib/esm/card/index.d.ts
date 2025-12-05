/**
 * Preact Card Component
 */
import { FunctionComponent } from 'preact';
export interface CardProps {
    title?: string;
    bordered?: boolean;
    shadow?: boolean;
    children?: preact.ComponentChildren;
    footer?: preact.ComponentChildren;
    extra?: preact.ComponentChildren;
    className?: string;
}
export declare const Card: FunctionComponent<CardProps>;
//# sourceMappingURL=index.d.ts.map