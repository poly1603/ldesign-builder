/**
 * Rollup 适配器
 *
 * 提供 Rollup 打包器的适配实现
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { IBundlerAdapter, UnifiedConfig, AdapterOptions, BundlerSpecificConfig, BundlerSpecificPlugin } from '../../types/adapter';
import type { BuildResult, BuildWatcher } from '../../types/builder';
import type { PerformanceMetrics } from '../../types/performance';
/**
 * Rollup 适配器类
 */
export declare class RollupAdapter implements IBundlerAdapter {
    readonly name: "rollup";
    version: string;
    available: boolean;
    private logger;
    private multiConfigs?;
    constructor(options?: Partial<AdapterOptions>);
    /**
     * 执行构建
     */
    build(config: UnifiedConfig): Promise<BuildResult>;
    /**
     * 启动监听模式
     */
    watch(config: UnifiedConfig): Promise<BuildWatcher>;
    /**
     * 转换配置
     */
    transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig>;
    /**
     * 转换插件
     */
    transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]>;
    /**
     * 为特定格式转换插件，动态设置TypeScript插件的declarationDir
     */
    transformPluginsForFormat(plugins: any[], outputDir: string, options?: {
        emitDts?: boolean;
    }): Promise<BundlerSpecificPlugin[]>;
    /**
     * 检查功能支持
     */
    supportsFeature(feature: any): boolean;
    /**
     * 获取功能支持映射
     */
    getFeatureSupport(): any;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * 判断是否启用构建缓存
     */
    private isCacheEnabled;
    /**
     * 验证输出产物是否存在
     * 检查关键输出文件是否存在，如果不存在则缓存应该失效
     */
    private validateOutputArtifacts;
    /**
     * 解析 config.cache -> RollupCache 选项
     */
    private resolveCacheOptions;
    /**
     * 尝试加载 Acorn 插件（JSX 与 TypeScript），以便 Rollup 在插件转换之前也能解析相应语法
     */
    private getAcornPlugins;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
    /**
     * 加载 Rollup
     */
    private loadRollup;
    /**
     * 获取基础插件（内置）
     * - node-resolve: 解决第三方包解析，并优先浏览器分支
     * - commonjs: 兼容 CommonJS 包
     * - json: 允许 import JSON（如某些包内的 package.json 或配置 JSON）
     */
    private getBasePlugins;
    /**
     * 获取 Babel 插件
     */
    private getBabelPlugin;
    /**
     * 映射输出格式
     */
    private mapFormat;
    /**
     * 检查是否为多入口构建
     */
    private isMultiEntryBuild;
    /**
     * 创建 UMD 配置（返回常规版本和压缩版本的数组）
     */
    private createUMDConfig;
    /**
     * 获取 Terser 压缩插件
     */
    private getTerserPlugin;
    /**
     * 生成 UMD 全局变量名
     */
    private generateUMDName;
    /**
     * 解析 Banner
     */
    private resolveBanner;
    /**
     * 解析 Footer
     */
    private resolveFooter;
    /**
     * 解析 Intro
     */
    private resolveIntro;
    /**
     * 解析 Outro
     */
    private resolveOutro;
    /**
     * 统一的 onwarn 处理：过滤不必要的告警
     */
    private getOnWarn;
    /**
     * 生成版权信息
     */
    private generateCopyright;
    /**
     * 生成构建信息
     */
    private generateBuildInfo;
}
