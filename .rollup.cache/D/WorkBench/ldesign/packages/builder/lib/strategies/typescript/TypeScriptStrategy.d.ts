/**
 * TypeScript 策略
 *
 * 为 TypeScript 库提供完整的构建策略，包括：
 * - TypeScript 编译和类型检查
 * - 声明文件生成
 * - 多格式输出支持
 * - Tree Shaking 优化
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
/**
 * TypeScript 库构建策略
 */
export declare class TypeScriptStrategy implements ILibraryStrategy {
    readonly name = "typescript";
    readonly supportedTypes: LibraryType[];
    readonly priority = 10;
    /**
     * 应用 TypeScript 策略
     */
    applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
    /**
     * 检查策略是否适用
     */
    isApplicable(config: BuilderConfig): boolean;
    /**
     * 获取默认配置
     */
    getDefaultConfig(): Partial<BuilderConfig>;
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
     * 获取推荐插件
     */
    getRecommendedPlugins(config: BuilderConfig): any[];
    /**
     * 验证配置
     */
    validateConfig(config: BuilderConfig): any;
    /**
     * 构建输出配置
     */
    private buildOutputConfig;
    /**
     * 构建插件配置
     */
    private buildPlugins;
    /**
     * 获取 TypeScript 选项
     */
    private getTypeScriptOptions;
    /**
     * 创建警告处理器
     */
    private createWarningHandler;
}
