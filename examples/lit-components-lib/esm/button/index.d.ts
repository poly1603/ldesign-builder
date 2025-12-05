/**
 * Lit Button Component
 */
import { LitElement } from 'lit';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export declare class LitButton extends LitElement {
    static styles: import("lit").CSSResult;
    variant: ButtonVariant;
    size: ButtonSize;
    disabled: boolean;
    loading: boolean;
    private handleClick;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'lit-button': LitButton;
    }
}
//# sourceMappingURL=index.d.ts.map