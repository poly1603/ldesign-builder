export declare class LModal extends HTMLElement {
    static observedAttributes: string[];
    private overlay;
    private closeBtn;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleKeydown;
    open(): void;
    close(): void;
    get isOpen(): boolean;
}
export declare function defineLModal(tagName?: string): void;
//# sourceMappingURL=index.d.ts.map