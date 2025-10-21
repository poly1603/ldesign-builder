/**
 * 适配器工厂
 *
 * 负责创建和管理不同的打包器适配器
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { IBundlerAdapter, AdapterOptions } from '../../types/adapter';
import type { BundlerType } from '../../types/bundler';
/**
 * 适配器工厂类
 */
export declare class BundlerAdapterFactory {
    private static adapters;
    private static instances;
    /**
     * 注册适配器
     */
    static register(bundler: BundlerType, adapterClass: new (options: AdapterOptions) => IBundlerAdapter): void;
    /**
     * 创建适配器实例
     */
    static create(bundler: BundlerType, options?: Partial<AdapterOptions>): IBundlerAdapter;
    /**
     * 获取可用的适配器列表
     */
    static getAvailableAdapters(): BundlerType[];
    /**
     * 检查适配器是否可用
     */
    static isAvailable(bundler: BundlerType): boolean;
    /**
     * 清理所有实例
     */
    static dispose(): Promise<void>;
    /**
     * 获取适配器信息
     */
    static getAdapterInfo(bundler: BundlerType): {
        name: BundlerType;
        version: string;
        available: boolean;
    };
}
