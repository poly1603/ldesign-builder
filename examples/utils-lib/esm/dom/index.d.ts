/**
 * DOM 工具函数
 */
/** 获取元素 */
export declare function $(selector: string, parent?: Element | Document): Element | null;
/** 获取多个元素 */
export declare function $$(selector: string, parent?: Element | Document): Element[];
/** 添加事件监听 */
export declare function on<K extends keyof HTMLElementEventMap>(el: HTMLElement, event: K, handler: (e: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
/** 添加类名 */
export declare function addClass(el: HTMLElement, ...classes: string[]): void;
/** 移除类名 */
export declare function removeClass(el: HTMLElement, ...classes: string[]): void;
/** 切换类名 */
export declare function toggleClass(el: HTMLElement, className: string, force?: boolean): boolean;
/** 是否有类名 */
export declare function hasClass(el: HTMLElement, className: string): boolean;
/** 获取/设置样式 */
export declare function css(el: HTMLElement, prop: string): string;
export declare function css(el: HTMLElement, prop: string, value: string): void;
export declare function css(el: HTMLElement, styles: Record<string, string>): void;
/** 获取元素位置 */
export declare function getRect(el: HTMLElement): DOMRect;
/** 滚动到元素 */
export declare function scrollTo(el: HTMLElement, options?: ScrollIntoViewOptions): void;
/** 复制到剪贴板 */
export declare function copyToClipboard(text: string): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map