/**
 * Svelte 策略
 * 使用 @sveltejs/rollup-plugin-svelte + esbuild 处理 TS/JS，postcss 处理样式
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
export declare class SvelteStrategy implements ILibraryStrategy {
    readonly name = "svelte";
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
     * 合并 external 配置，确保 Svelte 相关依赖被标记为外部
     */
    private mergeExternal;
}
