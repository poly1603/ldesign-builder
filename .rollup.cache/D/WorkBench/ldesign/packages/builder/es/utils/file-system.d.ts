/**
 * 文件系统操作工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
import type { FileInfo } from '../types/common';
/**
 * 文件系统工具类
 */
export declare class FileSystem {
    /**
     * 检查文件或目录是否存在
     */
    static exists(filePath: string): Promise<boolean>;
    /**
     * 同步检查文件或目录是否存在
     */
    static existsSync(filePath: string): boolean;
    /**
     * 读取文件内容
     */
    static readFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
    /**
     * 写入文件内容
     */
    static writeFile(filePath: string, content: string, encoding?: BufferEncoding): Promise<void>;
    /**
     * 复制文件
     */
    static copyFile(src: string, dest: string): Promise<void>;
    /**
     * 删除文件
     */
    static removeFile(filePath: string): Promise<void>;
    /**
     * 创建目录
     */
    static ensureDir(dirPath: string): Promise<void>;
    /**
     * 删除目录
     */
    static removeDir(dirPath: string): Promise<void>;
    /**
     * 清空目录
     */
    static emptyDir(dirPath: string): Promise<void>;
    /**
     * 获取文件统计信息
     */
    static stat(filePath: string): Promise<FileInfo>;
    /**
     * 读取目录内容
     */
    static readDir(dirPath: string): Promise<string[]>;
    /**
     * 递归读取目录内容
     */
    static readDirRecursive(dirPath: string): Promise<string[]>;
    /**
     * 使用 glob 模式查找文件
     */
    static glob(pattern: string | string[], options?: {
        cwd?: string;
        ignore?: string[];
        absolute?: boolean;
        onlyFiles?: boolean;
        onlyDirectories?: boolean;
    }): Promise<string[]>;
    /**
     * 查找文件
     */
    static findFiles(patterns: string[], options?: {
        cwd?: string;
        ignore?: string[];
        maxDepth?: number;
    }): Promise<string[]>;
    /**
     * 查找目录
     */
    static findDirs(patterns: string[], options?: {
        cwd?: string;
        ignore?: string[];
        maxDepth?: number;
    }): Promise<string[]>;
    /**
     * 获取文件大小
     */
    static getFileSize(filePath: string): Promise<number>;
    /**
     * 获取目录大小
     */
    static getDirSize(dirPath: string): Promise<number>;
    /**
     * 检查路径是否为文件
     */
    static isFile(filePath: string): Promise<boolean>;
    /**
     * 检查路径是否为目录
     */
    static isDirectory(dirPath: string): Promise<boolean>;
    /**
     * 获取文件的修改时间
     */
    static getModifiedTime(filePath: string): Promise<Date>;
    /**
     * 比较文件修改时间
     */
    static isNewer(file1: string, file2: string): Promise<boolean>;
    /**
     * 创建临时文件
     */
    static createTempFile(prefix?: string, suffix?: string): Promise<string>;
    /**
     * 创建临时目录
     */
    static createTempDir(prefix?: string): Promise<string>;
    /**
     * 获取文件类型
     */
    private static getFileType;
}
export declare const exists: typeof FileSystem.exists, existsSync: typeof FileSystem.existsSync, readFile: typeof FileSystem.readFile, writeFile: typeof FileSystem.writeFile, copyFile: typeof FileSystem.copyFile, removeFile: typeof FileSystem.removeFile, ensureDir: typeof FileSystem.ensureDir, removeDir: typeof FileSystem.removeDir, emptyDir: typeof FileSystem.emptyDir, stat: typeof FileSystem.stat, readDir: typeof FileSystem.readDir, readDirRecursive: typeof FileSystem.readDirRecursive, findDirs: typeof FileSystem.findDirs, getFileSize: typeof FileSystem.getFileSize, getDirSize: typeof FileSystem.getDirSize, isFile: typeof FileSystem.isFile, isDirectory: typeof FileSystem.isDirectory, getModifiedTime: typeof FileSystem.getModifiedTime, isNewer: typeof FileSystem.isNewer, createTempFile: typeof FileSystem.createTempFile, createTempDir: typeof FileSystem.createTempDir;
export declare const findFiles: typeof FileSystem.findFiles;
