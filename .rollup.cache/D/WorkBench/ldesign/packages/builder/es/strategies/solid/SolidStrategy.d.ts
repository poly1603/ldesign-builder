/**
 * Solid 策略
 * 使用 rollup-plugin-solid 处理 JSX/TSX，postcss 可选
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
export declare class SolidStrategy implements ILibraryStrategy {
    readonly name = "solid";
    readonly supportedTypes: LibraryType[];
    readonly priority = 9;
    applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
    isApplicable(config: BuilderConfig): boolean;
    getDefaultConfig(): Partial<BuilderConfig>;
    getRecommendedPlugins(_config: BuilderConfig): any[];
    validateConfig(_config: BuilderConfig): any;
    private buildPlugins;
    private buildOutputConfig;
    private createWarningHandler;
    /**
     * 合并 external 配置，确保 Solid 相关依赖被标记为外部
     */
    private mergeExternal;
}
