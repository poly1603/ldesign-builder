/**
 * 插件管理器
 *
 * 负责插件的加载、管理和执行
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
import type { UnifiedPlugin, PluginManagerOptions, PluginLoadResult, PluginPerformanceStats } from '../types/plugin';
/**
 * 插件管理器类
 */
export declare class PluginManager extends EventEmitter {
    private logger;
    private options;
    private plugins;
    private performanceStats;
    constructor(options?: PluginManagerOptions);
    /**
     * 加载插件
     */
    loadPlugin(plugin: UnifiedPlugin): Promise<PluginLoadResult>;
    /**
     * 批量加载插件
     */
    loadPlugins(plugins: UnifiedPlugin[]): Promise<PluginLoadResult[]>;
    /**
     * 获取插件
     */
    getPlugin(name: string): UnifiedPlugin | undefined;
    /**
     * 获取所有插件
     */
    getAllPlugins(): UnifiedPlugin[];
    /**
     * 移除插件
     */
    removePlugin(name: string): Promise<boolean>;
    /**
     * 清空所有插件
     */
    clear(): Promise<void>;
    /**
     * 获取插件性能统计
     */
    getPerformanceStats(name?: string): PluginPerformanceStats | PluginPerformanceStats[];
    /**
     * 验证插件
     */
    private validatePlugin;
    /**
     * 销毁资源
     */
    dispose(): Promise<void>;
}
