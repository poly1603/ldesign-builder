/**
 * 格式化工具函数
 */
/**
 * 格式化文件大小
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 格式化持续时间
 */
export declare function formatDuration(ms: number): string;
/**
 * 格式化百分比
 */
export declare function formatPercentage(value: number, total: number): string;
/**
 * 格式化数字
 */
export declare function formatNumber(num: number): string;
/**
 * 格式化内存使用
 */
export declare function formatMemory(bytes: number): string;
/**
 * 格式化时间戳
 */
export declare function formatTimestamp(timestamp: number): string;
/**
 * 格式化相对时间
 */
export declare function formatRelativeTime(timestamp: number): string;
/**
 * 格式化路径（缩短显示）
 */
export declare function formatPath(filePath: string, maxLength?: number): string;
/**
 * 格式化版本号
 */
export declare function formatVersion(version: string): string;
/**
 * 格式化构建状态
 */
export declare function formatBuildStatus(status: string): string;
export { formatError } from './error-handler';
/**
 * 格式化配置对象
 */
export declare function formatConfig(config: any, indent?: number): string;
/**
 * 格式化列表
 */
export declare function formatList(items: string[], separator?: string): string;
/**
 * 格式化表格数据
 */
export declare function formatTable(data: Array<Record<string, any>>, columns?: string[]): string;
/**
 * 格式化进度条
 */
export declare function formatProgressBar(current: number, total: number, width?: number, char?: string): string;
/**
 * 格式化键值对
 */
export declare function formatKeyValue(obj: Record<string, any>, separator?: string, indent?: string): string;
/**
 * 截断文本
 */
export declare function truncateText(text: string, maxLength: number, suffix?: string): string;
/**
 * 首字母大写
 */
export declare function capitalize(text: string): string;
/**
 * 驼峰转短横线
 */
export declare function camelToKebab(text: string): string;
/**
 * 短横线转驼峰
 */
export declare function kebabToCamel(text: string): string;
