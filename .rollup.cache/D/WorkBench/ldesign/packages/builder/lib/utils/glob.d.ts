/**
 * 通配符解析工具函数
 *
 * 提供文件路径模式匹配和解析功能
 */
/**
 * 解析输入模式
 *
 * 将通配符模式转换为实际的文件路径列表
 *
 * @param input - 输入模式（支持字符串、数组、对象）
 * @param rootDir - 根目录
 * @returns 解析后的文件路径
 */
export declare function resolveInputPatterns(input: string | string[] | Record<string, string>, rootDir?: string): Promise<string | string[] | Record<string, string>>;
/**
 * 规范化入口配置
 *
 * 将各种输入格式标准化为 Rollup/Rolldown 可接受的格式
 *
 * @param input - 原始输入配置
 * @param rootDir - 根目录
 * @param exclude - 排除模式数组
 * @returns 规范化后的输入配置
 */
export declare function normalizeInput(input: string | string[] | Record<string, string> | undefined, rootDir?: string, exclude?: string[]): Promise<string | string[] | Record<string, string>>;
/**
 * 获取输出目录列表
 *
 * 从配置中提取所有的输出目录
 *
 * @param config - 构建配置
 * @returns 输出目录列表
 */
export declare function getOutputDirs(config: any): string[];
