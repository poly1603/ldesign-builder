/**
 * 路径处理工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
/**
 * 路径工具类
 */
export declare class PathUtils {
    /**
     * 规范化路径（统一使用正斜杠）
     */
    static normalize(filePath: string): string;
    /**
     * 解析绝对路径
     */
    static resolve(...paths: string[]): string;
    /**
     * 获取相对路径
     */
    static relative(from: string, to: string): string;
    /**
     * 连接路径
     */
    static join(...paths: string[]): string;
    /**
     * 获取目录名
     */
    static dirname(filePath: string): string;
    /**
     * 获取文件名（包含扩展名）
     */
    static basename(filePath: string, ext?: string): string;
    /**
     * 获取文件扩展名
     */
    static extname(filePath: string): string;
    /**
     * 获取文件名（不包含扩展名）
     */
    static filename(filePath: string): string;
    /**
     * 判断路径是否为绝对路径
     */
    static isAbsolute(filePath: string): boolean;
    /**
     * 转换为绝对路径
     */
    static toAbsolute(filePath: string, basePath?: string): string;
    /**
     * 转换为相对路径
     */
    static toRelative(filePath: string, basePath?: string): string;
    /**
     * 替换文件扩展名
     */
    static replaceExt(filePath: string, newExt: string): string;
    /**
     * 添加后缀到文件名
     */
    static addSuffix(filePath: string, suffix: string): string;
    /**
     * 获取路径的各个部分
     */
    static parse(filePath: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    };
    /**
     * 从路径部分构建路径
     */
    static format(pathObject: {
        root?: string;
        dir?: string;
        base?: string;
        ext?: string;
        name?: string;
    }): string;
    /**
     * 检查路径是否在指定目录内
     */
    static isInside(filePath: string, dirPath: string): boolean;
    /**
     * 获取两个路径的公共父目录
     */
    static getCommonParent(path1: string, path2: string): string;
    /**
     * 获取路径深度
     */
    static getDepth(filePath: string): number;
    /**
     * 匹配路径模式
     */
    static matchPattern(filePath: string, pattern: string): boolean;
    /**
     * 获取文件的 URL 路径
     */
    static toFileURL(filePath: string): string;
    /**
     * 从文件 URL 获取路径
     */
    static fromFileURL(fileURL: string): string;
    /**
     * 获取项目根目录
     */
    static findProjectRoot(startPath?: string): string;
    /**
     * 获取相对于项目根目录的路径
     */
    static getProjectRelativePath(filePath: string, projectRoot?: string): string;
    /**
     * 清理路径（移除多余的分隔符和相对路径符号）
     */
    static clean(filePath: string): string;
    /**
     * 确保路径以指定字符结尾
     */
    static ensureTrailingSlash(dirPath: string): string;
    /**
     * 确保路径不以指定字符结尾
     */
    static removeTrailingSlash(dirPath: string): string;
    /**
     * 获取路径的所有父目录
     */
    static getParents(filePath: string): string[];
    /**
     * 检查路径是否为隐藏文件或目录
     */
    static isHidden(filePath: string): boolean;
    /**
     * 获取平台特定的路径分隔符
     */
    static get sep(): string;
    /**
     * 获取平台特定的路径定界符
     */
    static get delimiter(): string;
}
export declare const normalize: typeof PathUtils.normalize, resolve: typeof PathUtils.resolve, relative: typeof PathUtils.relative, join: typeof PathUtils.join, dirname: typeof PathUtils.dirname, basename: typeof PathUtils.basename, extname: typeof PathUtils.extname, filename: typeof PathUtils.filename, isAbsolute: typeof PathUtils.isAbsolute, toAbsolute: typeof PathUtils.toAbsolute, toRelative: typeof PathUtils.toRelative, replaceExt: typeof PathUtils.replaceExt, addSuffix: typeof PathUtils.addSuffix, parse: typeof PathUtils.parse, format: typeof PathUtils.format, isInside: typeof PathUtils.isInside, getCommonParent: typeof PathUtils.getCommonParent, getDepth: typeof PathUtils.getDepth, matchPattern: typeof PathUtils.matchPattern, toFileURL: typeof PathUtils.toFileURL, fromFileURL: typeof PathUtils.fromFileURL, findProjectRoot: typeof PathUtils.findProjectRoot, getProjectRelativePath: typeof PathUtils.getProjectRelativePath, clean: typeof PathUtils.clean, ensureTrailingSlash: typeof PathUtils.ensureTrailingSlash, removeTrailingSlash: typeof PathUtils.removeTrailingSlash, getParents: typeof PathUtils.getParents, isHidden: typeof PathUtils.isHidden;
