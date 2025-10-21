/**
 * 样式库构建策略
 *
 * 为样式库提供完整的构建策略，包括：
 * - Less/Sass 预处理器支持
 * - CSS 压缩和优化
 * - 自动添加浏览器前缀
 * - CSS 变量和主题支持
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
/**
 * 样式库构建策略
 */
export declare class StyleStrategy implements ILibraryStrategy {
    readonly name = "style";
    readonly supportedTypes: LibraryType[];
    readonly priority = 8;
    /**
     * 应用样式策略
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
     * 获取 PostCSS 插件
     */
    private getPostCSSPlugins;
    /**
     * 获取 PostCSS 选项
     */
    private getPostCSSOptions;
    /**
     * 获取 Less 选项
     */
    private getLessOptions;
    /**
     * 获取 Sass 选项
     */
    private getSassOptions;
    /**
     * 检查是否应该使用 Less
     */
    private shouldUseLess;
    /**
     * 检查是否应该使用 Sass
     */
    private shouldUseSass;
    /**
     * 创建警告处理器
     */
    private createWarningHandler;
    /**
     * 解析入口配置
     * - 若用户未传入 input，则将 src 下所有样式文件作为入口
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
}
