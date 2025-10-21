/**
 * TDesign 风格的组件库构建器
 *
 * 参考 TDesign 的构建思路，提供多格式构建和样式处理策略
 * 支持 es, esm, lib, cjs, umd 等多种构建格式
 * 支持 single, multi, source, ignore 等样式处理策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { BuilderConfig } from '../types/config';
import { LibraryBuilder } from './LibraryBuilder';
/**
 * TDesign 风格的构建器
 */
export declare class TDesignStyleBuilder extends LibraryBuilder {
    /**
     * 构建 ES 模块（支持 tree-shaking）
     */
    buildEs(config: BuilderConfig): Promise<void>;
    /**
     * 构建 ESM 模块（保留源码样式引用）
     */
    buildEsm(config: BuilderConfig): Promise<void>;
    /**
     * 构建 Lib 格式
     */
    buildLib(config: BuilderConfig): Promise<void>;
    /**
     * 构建 CJS 格式
     */
    buildCjs(config: BuilderConfig): Promise<void>;
    /**
     * 构建 UMD 格式
     */
    buildUmd(config: BuilderConfig, isMin?: boolean): Promise<void>;
    /**
     * 构建 CSS 文件
     */
    private buildCss;
    /**
     * 替换通用样式导入
     */
    private replaceCommonStyleImports;
    /**
     * 清理不需要的文件
     */
    private cleanupFiles;
    /**
     * 删除输出目录
     */
    deleteOutput(): Promise<void>;
}
