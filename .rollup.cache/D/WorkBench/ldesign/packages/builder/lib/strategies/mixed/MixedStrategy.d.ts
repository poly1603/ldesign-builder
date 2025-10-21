/**
 * 混合策略
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
export declare class MixedStrategy implements ILibraryStrategy {
    readonly name = "mixed";
    readonly supportedTypes: LibraryType[];
    readonly priority = 5;
    applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
    isApplicable(config: BuilderConfig): boolean;
    getDefaultConfig(): Partial<BuilderConfig>;
    getRecommendedPlugins(_config: BuilderConfig): any[];
    validateConfig(_config: BuilderConfig): any;
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
     * 构建输出配置
     */
    private buildOutputConfig;
    /**
     * 构建插件配置
     */
    private buildPlugins;
    /**
     * 创建警告处理器
     */
    private createWarningHandler;
}
