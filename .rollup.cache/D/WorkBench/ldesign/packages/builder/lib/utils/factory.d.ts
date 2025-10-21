/**
 * 工厂函数 - 便捷创建构建器实例
 */
import { LibraryBuilder } from '../core/LibraryBuilder';
import type { BuilderOptions } from '../types/builder';
import type { BuilderConfig } from '../types/config';
/**
 * 创建构建器实例的便捷函数
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createBuilder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建开发模式构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createDevBuilder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建生产模式构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createProdBuilder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建 TypeScript 库构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createTypeScriptBuilder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建 Vue3 组件库构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createVue3Builder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建样式库构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createStyleBuilder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建快速构建器（最小配置）
 *
 * @param input 入口文件
 * @param output 输出目录
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createQuickBuilder(input: string, output?: string, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 创建监听模式构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createWatchBuilder(config?: BuilderConfig, options?: Omit<BuilderOptions, 'config'>): LibraryBuilder;
/**
 * 从 package.json 创建构建器
 *
 * @param packageJsonPath package.json 文件路径
 * @param options 构建器选项
 * @returns 构建器实例
 */
export declare function createBuilderFromPackage(packageJsonPath?: string, options?: Omit<BuilderOptions, 'config'>): Promise<LibraryBuilder>;
/**
 * 批量创建构建器
 *
 * @param configs 配置数组
 * @param options 构建器选项
 * @returns 构建器实例数组
 */
export declare function createBuilders(configs: BuilderConfig[], options?: Omit<BuilderOptions, 'config'>): LibraryBuilder[];
/**
 * 创建构建器池
 *
 * @param configs 配置数组
 * @param options 构建器选项
 * @returns 构建器池
 */
export declare function createBuilderPool(configs: BuilderConfig[], options?: Omit<BuilderOptions, 'config'>): {
    builders: LibraryBuilder[];
    buildAll: () => Promise<any[]>;
    disposeAll: () => Promise<void>;
};
