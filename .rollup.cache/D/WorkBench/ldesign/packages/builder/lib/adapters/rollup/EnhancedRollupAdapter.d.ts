/**
 * 增强版 Rollup 适配器
 *
 * 提供更强大的 Rollup 打包器适配实现，确保打包产物的正确性
 *
 * @author LDesign Team
 * @version 2.0.0
 */
import type { IBundlerAdapter, UnifiedConfig, AdapterOptions, BundlerSpecificConfig, BundlerSpecificPlugin, BundlerFeature, FeatureSupportMap } from '../../types/adapter';
import type { BuildResult, BuildWatcher } from '../../types/builder';
import type { PerformanceMetrics } from '../../types/performance';
/**
 * 增强版 Rollup 适配器类
 */
export declare class EnhancedRollupAdapter implements IBundlerAdapter {
    readonly name: "rollup";
    readonly version: string;
    readonly available: boolean;
    private logger;
    private performanceMonitor;
    private multiConfigs?;
    private pluginCache;
    private outputCache;
    private rollupInstance;
    constructor(options?: Partial<AdapterOptions>);
    /**
     * 执行构建（增强版）
     */
    build(config: UnifiedConfig): Promise<BuildResult>;
    /**
     * 启动监听模式（增强版）
     */
    watch(config: UnifiedConfig): Promise<BuildWatcher>;
    /**
     * 转换配置（增强版）
     */
    transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig>;
    /**
     * 处理输出配置
     */
    private processOutputConfig;
    /**
     * 创建格式配置
     */
    private createFormatConfig;
    /**
     * 获取增强的基础插件
     */
    private getEnhancedBasePlugins;
    /**
     * 验证配置
     */
    private validateConfig;
    /**
     * 验证插件
     */
    private validatePlugin;
    /**
     * 验证单个配置
     */
    private validateSingleConfig;
    /**
     * 生成和写入输出
     */
    private generateAndWriteOutputs;
    /**
     * 验证输出
     */
    private validateOutputs;
    /**
     * 增强输出结果
     */
    private enhanceOutputs;
    /**
     * 生成构建统计
     */
    private generateBuildStats;
    /**
     * 验证构建产物
     */
    private validateBuildOutputs;
    /**
     * 增强错误信息
     */
    private enhanceError;
    /**
     * 获取格式特定插件
     */
    private getFormatSpecificPlugins;
    /**
     * 处理外部依赖配置
     */
    private processExternal;
    /**
     * 获取入口文件名
     */
    private getEntryFileName;
    /**
     * 获取代码块文件名
     */
    private getChunkFileName;
    /**
     * 创建增强的 UMD 配置
     */
    private createEnhancedUMDConfig;
    /**
     * 检查是否有 TypeScript 文件
     */
    private hasTypeScriptFiles;
    /**
     * 查找 tsconfig.json
     */
    private findTsConfig;
    /**
     * 检查是否有样式文件
     */
    private hasStyleFiles;
    /**
     * 检查是否有 Sass 文件
     */
    private hasSassFiles;
    /**
     * 检查是否有 Less 文件
     */
    private hasLessFiles;
    /**
     * 检查是否有 Stylus 文件
     */
    private hasStylusFiles;
    /**
     * 检查是否是多入口构建
     */
    private isMultiEntryBuild;
    /**
     * 映射格式
     */
    private mapFormat;
    /**
     * 转换插件
     */
    transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]>;
    /**
     * 获取 Acorn 插件
     */
    private getAcornPlugins;
    /**
     * 加载 Rollup
     */
    private loadRollup;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
    supportsFeature(feature: BundlerFeature): boolean;
    getFeatureSupport(): FeatureSupportMap;
}
