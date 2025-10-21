/**
 * Angular（基础）策略
 * 仅提供最小可用的 TS 打包（推荐使用 ng-packagr 进行完整 Angular 库打包）
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
export declare class AngularStrategy implements ILibraryStrategy {
    readonly name = "angular";
    readonly supportedTypes: LibraryType[];
    readonly priority = 7;
    applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
    isApplicable(config: BuilderConfig): boolean;
    getDefaultConfig(): Partial<BuilderConfig>;
    getRecommendedPlugins(_config: BuilderConfig): any[];
    validateConfig(_config: BuilderConfig): any;
    private buildPlugins;
    private buildOutputConfig;
    private createWarningHandler;
    /**
     * 合并 external 配置，确保 Angular 相关依赖被标记为外部
     */
    private mergeExternal;
}
