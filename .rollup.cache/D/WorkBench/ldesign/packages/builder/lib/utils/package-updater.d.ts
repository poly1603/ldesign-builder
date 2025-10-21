/**
 * Package.json 自动更新工具
 *
 * 负责在构建完成后自动更新 package.json 的 exports、main、module、types、files 等字段
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { Logger } from './logger';
/**
 * Package.json 更新配置
 */
export interface PackageUpdaterConfig {
    /** 项目根目录 */
    projectRoot: string;
    /** 源码目录，默认为 'src' */
    srcDir?: string;
    /** 输出目录配置 */
    outputDirs?: {
        /** ESM 输出目录，默认为 'es' */
        esm?: string;
        /** CJS 输出目录，默认为 'lib' */
        cjs?: string;
        /** UMD 输出目录，默认为 'dist' */
        umd?: string;
        /** 类型声明目录，默认为 'types' 或与 esm 相同 */
        types?: string;
    };
    /** 是否启用自动 exports 生成 */
    autoExports?: boolean;
    /** 是否更新 main/module/types 字段 */
    updateEntryPoints?: boolean;
    /** 是否更新 files 字段 */
    updateFiles?: boolean;
    /** 自定义 exports 配置 */
    customExports?: Record<string, any>;
    /** 日志记录器 */
    logger?: Logger;
}
/**
 * Package.json 更新器
 */
export declare class PackageUpdater {
    private config;
    private logger;
    constructor(config: PackageUpdaterConfig);
    /**
     * 执行 package.json 更新
     */
    update(): Promise<void>;
    /**
     * 扫描 src 目录并生成 exports 配置
     */
    private generateExports;
    /**
     * 创建单个 export 条目
     */
    private createExportEntry;
    /**
     * 创建通配符 export 条目（支持 package/utils/* 导入）
     */
    private createWildcardExportEntry;
    /**
     * 扫描 src 下的直接子目录（不递归）
     */
    private scanDirectDirectories;
    /**
     * 检查目录是否有 index 文件
     */
    private hasIndexFile;
    /**
     * 检查目录是否包含 TypeScript 文件
     */
    private hasTypeScriptFiles;
    /**
     * 更新入口点字段
     */
    private updateEntryPoints;
    /**
     * 生成 files 字段
     */
    private generateFiles;
    /**
     * 读取 package.json
     */
    private readPackageJson;
    /**
     * 检查文件是否存在（同步）
     */
    private fileExistsSync;
    /**
     * 写入 package.json
     */
    private writePackageJson;
    /**
     * 按照最佳实践排序 package.json 字段
     */
    private sortPackageJsonFields;
    /**
     * 检测并添加CSS文件exports
     */
    private addCssExports;
    /**
     * 在指定目录中查找CSS文件
     */
    private findCssFiles;
}
/**
 * 创建 Package 更新器的便捷函数
 */
export declare function createPackageUpdater(config: PackageUpdaterConfig): PackageUpdater;
