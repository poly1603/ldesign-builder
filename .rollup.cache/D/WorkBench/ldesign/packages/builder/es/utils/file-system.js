/**
 * 文件系统操作工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
import { promises as fs } from 'fs';
import path from 'path';
import fastGlob from 'fast-glob';
/**
 * 文件系统工具类
 */
export class FileSystem {
    /**
     * 检查文件或目录是否存在
     */
    static async exists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 同步检查文件或目录是否存在
     */
    static existsSync(filePath) {
        try {
            // 使用显式导入而不是 require
            const { accessSync } = require('fs');
            accessSync(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 读取文件内容
     */
    static async readFile(filePath, encoding = 'utf8') {
        return fs.readFile(filePath, encoding);
    }
    /**
     * 写入文件内容
     */
    static async writeFile(filePath, content, encoding = 'utf8') {
        // 确保目录存在
        await this.ensureDir(path.dirname(filePath));
        return fs.writeFile(filePath, content, encoding);
    }
    /**
     * 复制文件
     */
    static async copyFile(src, dest) {
        // 确保目标目录存在
        await this.ensureDir(path.dirname(dest));
        return fs.copyFile(src, dest);
    }
    /**
     * 删除文件
     */
    static async removeFile(filePath) {
        if (await this.exists(filePath)) {
            return fs.unlink(filePath);
        }
    }
    /**
     * 创建目录
     */
    static async ensureDir(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            // 忽略目录已存在的错误
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
    /**
     * 删除目录
     */
    static async removeDir(dirPath) {
        if (await this.exists(dirPath)) {
            return fs.rmdir(dirPath, { recursive: true });
        }
    }
    /**
     * 清空目录
     */
    static async emptyDir(dirPath) {
        if (await this.exists(dirPath)) {
            const files = await fs.readdir(dirPath);
            await Promise.all(files.map(async (file) => {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    await this.removeDir(filePath);
                }
                else {
                    await this.removeFile(filePath);
                }
            }));
        }
    }
    /**
     * 获取文件统计信息
     */
    static async stat(filePath) {
        const stats = await fs.stat(filePath);
        const ext = path.extname(filePath);
        return {
            path: filePath,
            size: stats.size,
            type: stats.isDirectory() ? 'directory' : this.getFileType(ext)
        };
    }
    /**
     * 读取目录内容
     */
    static async readDir(dirPath) {
        return fs.readdir(dirPath);
    }
    /**
     * 递归读取目录内容
     */
    static async readDirRecursive(dirPath) {
        const files = [];
        const traverse = async (currentPath) => {
            const items = await fs.readdir(currentPath);
            for (const item of items) {
                const itemPath = path.join(currentPath, item);
                const stat = await fs.stat(itemPath);
                if (stat.isDirectory()) {
                    await traverse(itemPath);
                }
                else {
                    files.push(itemPath);
                }
            }
        };
        await traverse(dirPath);
        return files;
    }
    /**
     * 使用 glob 模式查找文件
     */
    static async glob(pattern, options = {}) {
        return fastGlob(pattern, {
            cwd: options.cwd || process.cwd(),
            ignore: options.ignore || [],
            absolute: options.absolute ?? true,
            onlyFiles: options.onlyFiles ?? true,
            onlyDirectories: options.onlyDirectories ?? false
        });
    }
    /**
     * 查找文件
     */
    static async findFiles(patterns, options = {}) {
        return this.glob(patterns, {
            cwd: options.cwd,
            ignore: options.ignore,
            onlyFiles: true
        });
    }
    /**
     * 查找目录
     */
    static async findDirs(patterns, options = {}) {
        return this.glob(patterns, {
            cwd: options.cwd,
            ignore: options.ignore,
            onlyDirectories: true
        });
    }
    /**
     * 获取文件大小
     */
    static async getFileSize(filePath) {
        const stats = await fs.stat(filePath);
        return stats.size;
    }
    /**
     * 获取目录大小
     */
    static async getDirSize(dirPath) {
        let totalSize = 0;
        const traverse = async (currentPath) => {
            const items = await fs.readdir(currentPath);
            for (const item of items) {
                const itemPath = path.join(currentPath, item);
                const stat = await fs.stat(itemPath);
                if (stat.isDirectory()) {
                    await traverse(itemPath);
                }
                else {
                    totalSize += stat.size;
                }
            }
        };
        await traverse(dirPath);
        return totalSize;
    }
    /**
     * 检查路径是否为文件
     */
    static async isFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    /**
     * 检查路径是否为目录
     */
    static async isDirectory(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    /**
     * 获取文件的修改时间
     */
    static async getModifiedTime(filePath) {
        const stats = await fs.stat(filePath);
        return stats.mtime;
    }
    /**
     * 比较文件修改时间
     */
    static async isNewer(file1, file2) {
        if (!(await this.exists(file1)))
            return false;
        if (!(await this.exists(file2)))
            return true;
        const time1 = await this.getModifiedTime(file1);
        const time2 = await this.getModifiedTime(file2);
        return time1 > time2;
    }
    /**
     * 创建临时文件
     */
    static async createTempFile(prefix = 'temp', suffix = '.tmp') {
        const tempDir = require('os').tmpdir();
        const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${suffix}`;
        return path.join(tempDir, fileName);
    }
    /**
     * 创建临时目录
     */
    static async createTempDir(prefix = 'temp') {
        const tempDir = require('os').tmpdir();
        const dirName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempDirPath = path.join(tempDir, dirName);
        await this.ensureDir(tempDirPath);
        return tempDirPath;
    }
    /**
     * 获取文件类型
     */
    static getFileType(extension) {
        const typeMap = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'jsx',
            '.tsx': 'tsx',
            '.vue': 'vue',
            '.css': 'css',
            '.less': 'less',
            '.scss': 'scss',
            '.sass': 'sass',
            '.json': 'json',
            '.md': 'markdown',
            '.html': 'html',
            '.xml': 'xml',
            '.svg': 'svg',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.gif': 'image',
            '.webp': 'image'
        };
        return typeMap[extension.toLowerCase()] || 'unknown';
    }
}
// 导出便捷函数
export const { exists, existsSync, readFile, writeFile, copyFile, removeFile, ensureDir, removeDir, emptyDir, stat, readDir, readDirRecursive, findDirs, getFileSize, getDirSize, isFile, isDirectory, getModifiedTime, isNewer, createTempFile, createTempDir } = FileSystem;
// 单独导出 findFiles 以保持正确的 this 上下文
export const findFiles = FileSystem.findFiles.bind(FileSystem);
//# sourceMappingURL=file-system.js.map