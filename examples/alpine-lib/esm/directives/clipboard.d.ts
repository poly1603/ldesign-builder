/**
 * Alpine.js Clipboard Directive
 * 用法: x-clipboard="textToCopy" 或 x-clipboard="$el.textContent"
 */
export declare function clipboardDirective(el: HTMLElement, { expression }: {
    expression: string;
}, { evaluate, effect }: {
    evaluate: (exp: string) => any;
    effect: (fn: () => void) => void;
}): () => void;
//# sourceMappingURL=clipboard.d.ts.map