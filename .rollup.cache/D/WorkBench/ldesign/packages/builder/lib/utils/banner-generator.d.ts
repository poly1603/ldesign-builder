/**
 * Banner 生成器
 *
 * 为打包产物生成标识 banner
 *
 * @author LDesign Team
 * @version 1.0.0
 */
export interface BannerOptions {
    /** 打包工具名称 */
    bundler: string;
    /** 打包工具版本 */
    bundlerVersion?: string;
    /** 项目名称 */
    projectName?: string;
    /** 项目版本 */
    projectVersion?: string;
    /** 项目描述 */
    projectDescription?: string;
    /** 项目作者 */
    projectAuthor?: string;
    /** 项目许可证 */
    projectLicense?: string;
    /** 构建时间 */
    buildTime?: Date;
    /** 构建模式 */
    buildMode?: string;
    /** 是否压缩 */
    minified?: boolean;
    /** 自定义信息 */
    customInfo?: Record<string, string>;
    /** Banner 样式 */
    style?: 'default' | 'compact' | 'detailed';
}
export declare class BannerGenerator {
    /**
     * 生成 banner 字符串
     */
    static generate(options: BannerOptions): string;
    /**
     * 生成默认样式的 banner
     */
    private static generateDefaultBanner;
    /**
     * 生成紧凑样式的 banner
     */
    private static generateCompactBanner;
    /**
     * 生成详细样式的 banner
     */
    private static generateDetailedBanner;
    /**
     * 获取正确的构建时间（修复系统时间错误）
     */
    private static getCorrectBuildTime;
    /**
     * 格式化构建时间为友好格式
     */
    private static formatBuildTime;
    /**
     * 从 package.json 获取项目信息
     */
    static getProjectInfo(packageJsonPath?: string): Promise<Partial<BannerOptions>>;
    /**
     * 获取打包工具版本
     */
    static getBundlerVersion(bundler: string): Promise<string | undefined>;
    /**
     * 创建 Rollup banner 函数
     */
    static createRollupBanner(options?: Partial<BannerOptions>): () => Promise<string>;
    /**
     * 创建 Rolldown banner 函数
     */
    static createRolldownBanner(options?: Partial<BannerOptions>): () => Promise<string>;
    /**
     * 创建通用 banner 函数
     */
    static createBanner(bundler: string, options?: Partial<BannerOptions>): () => Promise<string>;
}
