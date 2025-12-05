export declare class LButton extends HTMLElement {
    static observedAttributes: string[];
    private button;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private handleClick;
    get variant(): string;
    set variant(v: string);
    get size(): string;
    set size(v: string);
    get disabled(): boolean;
    set disabled(v: boolean);
}
export declare function defineLButton(tagName?: string): void;
//# sourceMappingURL=index.d.ts.map