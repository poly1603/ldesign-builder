/**
 * 构建产物清单生成器
 *
 * 负责生成详细的构建产物清单，支持多种格式输出
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { Logger } from '../utils/logger';
import type { BuildResult } from '../types/builder';
import type { BuilderConfig } from '../types/config';
export interface ManifestFile {
    /** 文件路径 */
    path: string;
    /** 文件名 */
    name: string;
    /** 文件大小（字节） */
    size: number;
    /** 格式化的文件大小 */
    formattedSize: string;
    /** 文件类型 */
    type: 'js' | 'css' | 'map' | 'dts' | 'other';
    /** 文件格式 */
    format?: 'esm' | 'cjs' | 'umd' | 'iife';
    /** 文件哈希 */
    hash: string;
    /** 创建时间 */
    createdAt: string;
    /** 是否为入口文件 */
    isEntry: boolean;
    /** 是否为 chunk */
    isChunk: boolean;
    /** 依赖的文件 */
    dependencies?: string[];
}
export interface BuildManifest {
    /** 构建信息 */
    build: {
        /** 构建ID */
        id: string;
        /** 构建时间戳 */
        timestamp: number;
        /** 格式化的构建时间 */
        formattedTime: string;
        /** 构建持续时间（毫秒） */
        duration: number;
        /** 格式化的构建持续时间 */
        formattedDuration: string;
        /** 打包工具 */
        bundler: string;
        /** 打包工具版本 */
        bundlerVersion?: string;
        /** 构建模式 */
        mode: string;
        /** 是否成功 */
        success: boolean;
    };
    /** 项目信息 */
    project: {
        /** 项目名称 */
        name: string;
        /** 项目版本 */
        version: string;
        /** 项目描述 */
        description?: string;
        /** 项目作者 */
        author?: string;
    };
    /** 构建配置 */
    config: {
        /** 入口文件 */
        input: string | string[] | Record<string, string>;
        /** 输出目录 */
        outputDir: string;
        /** 输出格式 */
        formats: string[];
        /** 是否启用 sourcemap */
        sourcemap: boolean;
        /** 是否压缩 */
        minify: boolean;
        /** 外部依赖 */
        external: string[];
    };
    /** 文件列表 */
    files: ManifestFile[];
    /** 统计信息 */
    stats: {
        /** 总文件数 */
        totalFiles: number;
        /** 总大小（字节） */
        totalSize: number;
        /** 格式化的总大小 */
        formattedTotalSize: string;
        /** 按类型分组的统计 */
        byType: Record<string, {
            count: number;
            size: number;
            formattedSize: string;
        }>;
        /** 按格式分组的统计 */
        byFormat: Record<string, {
            count: number;
            size: number;
            formattedSize: string;
        }>;
        /** 最大文件 */
        largestFile: {
            name: string;
            size: number;
            formattedSize: string;
        };
        /** 最小文件 */
        smallestFile: {
            name: string;
            size: number;
            formattedSize: string;
        };
    };
}
export type ManifestFormat = 'json' | 'markdown' | 'html';
export declare class BuildManifestGenerator {
    private logger;
    constructor(logger?: Logger);
    /**
     * 生成构建清单
     */
    generateManifest(buildResult: BuildResult, config: BuilderConfig, outputDir: string): Promise<BuildManifest>;
    /**
     * 保存清单到文件
     */
    saveManifest(manifest: BuildManifest, outputDir: string, formats?: ManifestFormat[]): Promise<void>;
    /**
     * 格式化清单内容
     */
    private formatManifest;
    /**
     * 格式化为 Markdown
     */
    private formatMarkdown;
    /**
     * 格式化为 HTML
     */
    private formatHTML;
    /**
     * 扫描输出文件
     */
    private scanOutputFiles;
    /**
     * 生成统计信息
     */
    private generateStats;
    /**
     * 获取项目信息
     */
    private getProjectInfo;
    /**
     * 获取打包工具版本
     */
    private getBundlerVersion;
    /**
     * 获取文件类型
     */
    private getFileType;
    /**
     * 获取文件格式
     */
    private getFileFormat;
    /**
     * 判断是否为入口文件
     */
    private isEntryFile;
    /**
     * 判断是否为 chunk 文件
     */
    private isChunkFile;
    /**
     * 格式化字节大小
     */
    private formatBytes;
    /**
     * 格式化持续时间
     */
    private formatDuration;
}
