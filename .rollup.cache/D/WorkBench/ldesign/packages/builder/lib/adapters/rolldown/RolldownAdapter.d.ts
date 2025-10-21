/**
 * Rolldown 适配器
 *
 * 提供 Rolldown 打包器的适配实现
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { IBundlerAdapter, UnifiedConfig, AdapterOptions, BundlerSpecificConfig, BundlerSpecificPlugin } from '../../types/adapter';
import type { BuildResult, BuildWatcher } from '../../types/builder';
import type { PerformanceMetrics } from '../../types/performance';
/**
 * Rolldown 适配器类
 */
export declare class RolldownAdapter implements IBundlerAdapter {
    readonly name: "rolldown";
    readonly version: string;
    readonly available: boolean;
    private logger;
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
     * 清理资源
     */
    dispose(): Promise<void>;
    /**
     * 确保 Rolldown 已加载（支持异步）
     */
    private ensureRolldownLoaded;
    /**
     * 加载 Rolldown（同步方式）
     */
    private loadRolldown;
    /**
     * 转换 Rollup 插件为 Rolldown 格式
     */
    private convertRollupPlugin;
}
