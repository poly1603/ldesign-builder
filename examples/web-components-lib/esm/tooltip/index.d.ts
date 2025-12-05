export declare class LTooltip extends HTMLElement {
    static observedAttributes: string[];
    private tooltipEl;
    constructor();
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get placement(): string;
    set placement(v: string);
    get content(): string;
    set content(v: string);
}
export declare function defineLTooltip(tagName?: string): void;
//# sourceMappingURL=index.d.ts.map