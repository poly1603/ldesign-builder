/**
 * 打包器相关类型定义
 */
/**
 * 打包器状态
 */
export var BundlerStatus;
(function (BundlerStatus) {
    /** 未初始化 */
    BundlerStatus["UNINITIALIZED"] = "uninitialized";
    /** 初始化中 */
    BundlerStatus["INITIALIZING"] = "initializing";
    /** 就绪 */
    BundlerStatus["READY"] = "ready";
    /** 构建中 */
    BundlerStatus["BUILDING"] = "building";
    /** 监听中 */
    BundlerStatus["WATCHING"] = "watching";
    /** 错误状态 */
    BundlerStatus["ERROR"] = "error";
    /** 已销毁 */
    BundlerStatus["DISPOSED"] = "disposed";
})(BundlerStatus || (BundlerStatus = {}));
// BundlerFeature 已在 adapter.ts 中定义，这里导入
export { BundlerFeature } from './adapter';
//# sourceMappingURL=bundler.js.map