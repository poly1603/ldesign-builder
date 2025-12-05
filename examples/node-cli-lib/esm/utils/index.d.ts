/**
 * 确保目录存在
 */
export declare function ensureDir(dir: string): void;
/**
 * 写入文件（自动创建目录）
 */
export declare function writeFile(filePath: string, content: string): void;
/**
 * 读取 JSON 文件
 */
export declare function readJSON<T = any>(filePath: string): T;
/**
 * 写入 JSON 文件
 */
export declare function writeJSON(filePath: string, data: any, pretty?: boolean): void;
/**
 * 计算文件哈希
 */
export declare function hashContent(content: string, algorithm?: string): string;
/**
 * 解析路径别名
 */
export declare function resolvePath(base: string, ...paths: string[]): string;
/**
 * 格式化字节大小
 */
export declare function formatBytes(bytes: number): string;
/**
 * 延迟执行
 */
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map