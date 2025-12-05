/**
 * Lit Card Component
 */
import { LitElement } from 'lit';
export interface CardProps {
    title?: string;
    bordered?: boolean;
    shadow?: boolean;
}
export declare class LitCard extends LitElement {
    static styles: import("lit").CSSResult;
    cardTitle: string;
    bordered: boolean;
    shadow: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'lit-card': LitCard;
    }
}
//# sourceMappingURL=index.d.ts.map