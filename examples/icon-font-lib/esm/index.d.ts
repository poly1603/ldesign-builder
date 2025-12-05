/**
 * 图标字体库入口
 */
import './index.less';
export declare const icons: readonly ["close", "check", "info", "warning", "error", "loading", "search", "plus", "minus", "arrow-left", "arrow-right", "arrow-up", "arrow-down", "home", "user", "setting", "menu", "more", "edit", "delete", "copy", "folder", "file", "download", "upload", "link", "star", "heart", "share"];
export type IconName = typeof icons[number];
export declare function getIconClass(name: IconName): string;
//# sourceMappingURL=index.d.ts.map