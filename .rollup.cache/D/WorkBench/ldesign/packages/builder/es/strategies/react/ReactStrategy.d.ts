/**
 * React 策略
 * 使用 esbuild 处理 TS/TSX，postcss 处理样式，rollup 输出 ESM/CJS
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
export declare class ReactStrategy implements ILibraryStrategy {
    readonly name = "react";
    readonly supportedTypes: LibraryType[];
    readonly priority = 10;
    applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
    isApplicable(config: BuilderConfig): boolean;
    getDefaultConfig(): Partial<BuilderConfig>;
    getRecommendedPlugins(_config: BuilderConfig): any[];
    validateConfig(_config: BuilderConfig): any;
    private buildPlugins;
    private buildOutputConfig;
    private createWarningHandler;
    /**
     * 解析入口配置
     * - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
     * - 若用户传入 glob 模式的数组，则解析为多入口
     * - 若用户传入单个文件或对象，则直接返回
     */
    private resolveInputEntries;
    /**
     * 自动发现入口文件
     */
    private autoDiscoverEntries;
    /**
     * 解析glob模式的入口配置
     */
    private resolveGlobEntries;
    /**
     * 合并 external 配置，确保 React 相关依赖被标记为外部
     */
    private mergeExternal;
}
