/**
 * 自动配置增强器
 *
 * 自动处理 external、globals、libraryType 和 Vue 插件配置
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { BuilderConfig } from '../types/config';
import { Logger } from './logger';
/**
 * 自动配置增强器类
 */
export declare class AutoConfigEnhancer {
    private logger;
    private projectPath;
    private packageInfo?;
    constructor(projectPath: string, logger?: Logger);
    /**
     * 增强配置
     */
    enhanceConfig(config: BuilderConfig): Promise<BuilderConfig>;
    /**
     * 加载 package.json 信息
     */
    private loadPackageInfo;
    /**
     * 检测库类型
     */
    private detectLibraryType;
    /**
     * 检查是否有 Vue 文件
     */
    private hasVueFiles;
    /**
     * 递归查找 Vue 文件
     */
    private findVueFiles;
    /**
     * 生成 external 配置
     */
    private generateExternal;
    /**
     * 生成 globals 配置
     */
    private generateGlobals;
    /**
     * 转换为 PascalCase
     */
    private toPascalCase;
    /**
     * 添加 Vue 插件
     */
    private addVuePlugin;
    /**
     * 生成默认的排除配置
     */
    private generateDefaultExcludes;
}
/**
 * 创建自动配置增强器
 */
export declare function createAutoConfigEnhancer(projectPath: string, logger?: Logger): AutoConfigEnhancer;
