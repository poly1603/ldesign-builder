/**
 * 配置文件加载器
 */
import type { BuilderConfig, ConfigFileInfo } from '../../types/config';
/**
 * 配置文件加载器类
 */
export declare class ConfigLoader {
    /**
     * 查找配置文件
     */
    findConfigFile(startDir?: string): Promise<string | null>;
    /**
     * 获取配置文件信息
     */
    getConfigFileInfo(configPath: string): Promise<ConfigFileInfo>;
    /**
     * 加载配置文件
     */
    loadConfigFile(configPath: string): Promise<BuilderConfig>;
    /**
     * 加载 JavaScript/TypeScript 配置
     */
    private loadJSConfig;
    /**
     * 加载 JSON 配置
     */
    private loadJSONConfig;
    /**
     * 加载多个配置文件并合并
     */
    loadMultipleConfigs(configPaths: string[]): Promise<BuilderConfig>;
    /**
     * 监听配置文件变化
     */
    watchConfigFile(configPath: string, callback: (config: BuilderConfig) => void): Promise<() => void>;
    /**
     * 获取所有可能的配置文件路径
     */
    getAllConfigPaths(baseDir?: string): string[];
    /**
     * 检查配置文件是否存在
     */
    hasConfigFile(baseDir?: string): Promise<boolean>;
    /**
     * 获取配置文件的优先级
     */
    getConfigFilePriority(configPath: string): number;
    /**
     * 选择最高优先级的配置文件
     */
    selectBestConfigFile(baseDir?: string): Promise<string | null>;
}
/**
 * 默认配置加载器实例
 */
export declare const configLoader: ConfigLoader;
/**
 * 便捷函数：查找配置文件
 */
export declare function findConfigFile(startDir?: string): Promise<string | null>;
/**
 * 便捷函数：加载配置文件
 */
export declare function loadConfigFile(configPath: string): Promise<BuilderConfig>;
/**
 * 定义配置的上下文参数
 */
export interface DefineConfigContext {
    mode: 'development' | 'production' | string;
    bundler: 'rollup' | 'rolldown';
    env: Record<string, string>;
}
/**
 * 便捷函数：定义配置
 *
 * @param config - 构建配置对象或返回配置的函数
 * @returns 配置对象或函数
 *
 * @example
 * // 对象配置
 * export default defineConfig({
 *   input: 'src/index.ts',
 *   output: {
 *     esm: true,
 *     cjs: true,
 *     umd: { name: 'MyLib' }
 *   }
 * })
 *
 * @example
 * // 函数配置
 * export default defineConfig((context) => ({
 *   input: 'src/index.ts',
 *   minify: context.mode === 'production'
 * }))
 */
export declare function defineConfig(config: BuilderConfig | ((context: DefineConfigContext) => BuilderConfig | Promise<BuilderConfig>)): BuilderConfig | ((context: DefineConfigContext) => BuilderConfig | Promise<BuilderConfig>);
/**
 * 便捷函数：定义异步配置
 * 用于异步计算配置（例如读取远程/本地元数据后生成配置）
 */
export declare function defineAsyncConfig(config: Promise<BuilderConfig> | ((context: DefineConfigContext) => Promise<BuilderConfig> | BuilderConfig)): Promise<BuilderConfig> | ((context: DefineConfigContext) => Promise<BuilderConfig> | BuilderConfig);
