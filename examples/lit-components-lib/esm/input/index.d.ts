/**
 * Lit Input Component
 */
import { LitElement } from 'lit';
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
export declare class LitInput extends LitElement {
    static styles: import("lit").CSSResult;
    type: InputType;
    value: string;
    placeholder: string;
    label: string;
    helper: string;
    error: string;
    disabled: boolean;
    required: boolean;
    private focused;
    private handleInput;
    private handleChange;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'lit-input': LitInput;
    }
}
//# sourceMappingURL=index.d.ts.map