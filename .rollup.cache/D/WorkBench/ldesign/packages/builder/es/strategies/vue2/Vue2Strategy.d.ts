/**
 * Vue2 策略
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
export declare class Vue2Strategy implements ILibraryStrategy {
    readonly name = "vue2";
    readonly supportedTypes: LibraryType[];
    readonly priority = 10;
    applyStrategy(config: BuilderConfig): Promise<any>;
    isApplicable(config: BuilderConfig): boolean;
    getDefaultConfig(): Partial<BuilderConfig>;
    getRecommendedPlugins(_config: BuilderConfig): any[];
    validateConfig(_config: BuilderConfig): any;
}
