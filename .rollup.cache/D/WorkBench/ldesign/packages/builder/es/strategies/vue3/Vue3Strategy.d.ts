/**
 * Vue 3 组件库构建策略
 *
 * 为 Vue 3 组件库提供完整的构建策略，包括：
 * - Vue SFC 单文件组件编译
 * - TypeScript 支持
 * - 样式提取和处理
 * - 组件类型定义生成
 * - 插件式安装支持
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { ILibraryStrategy } from '../../types/strategy';
import { LibraryType } from '../../types/library';
import type { BuilderConfig } from '../../types/config';
import type { UnifiedConfig } from '../../types/adapter';
/**
 * Vue 3 组件库构建策略
 */
export declare class Vue3Strategy implements ILibraryStrategy {
    readonly name = "vue3";
    readonly supportedTypes: LibraryType[];
    readonly priority = 10;
    /**
     * 应用 Vue 3 策略
     */
    applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
    /**
     * 应用多格式构建策略（TDesign 风格）
     */
    applyMultiFormatStrategy(config: BuilderConfig): Promise<UnifiedConfig>;
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
     * 构建外部依赖配置
     */
    private buildExternals;
    /**
     * 获取 Vue 选项
     */
    private getVueOptions;
    /**
     * 获取 TypeScript 选项
     */
    private getTypeScriptOptions;
    /**
     * 获取 PostCSS 选项
     */
    private getPostCSSOptions;
    /**
     * 获取 rollup-plugin-styles 选项
     */
    private getStylesOptions;
    /**
     * 创建 DTS 文件生成插件
     */
    private createDtsCopyPlugin;
    /**
     * 使用 TypeScript 编译器生成 DTS 文件
     */
    private generateDtsFiles;
    /**
     * 创建警告处理器
     */
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
     * 构建多格式输出配置（TDesign 风格）
     */
    private buildMultiFormatOutputs;
    /**
     * 构建多格式插件配置（TDesign 风格）
     */
    private buildMultiFormatPlugins;
    /**
     * 构建 CSS 策略插件（TDesign 风格）
     */
    private buildCSSStrategyPlugins;
}
