/**
 * 字符串格式化工具函数
 * 提供各种字符串格式化功能
 */
/**
 * 将字符串转换为驼峰命名法
 * @param str 输入字符串
 * @returns 驼峰命名法字符串
 * @example
 * ```typescript
 * import { toCamelCase } from '@ldesign/typescript-utils-example/string'
 *
 * const result = toCamelCase('hello-world') // 'helloWorld'
 * const result2 = toCamelCase('hello_world') // 'helloWorld'
 * ```
 */
export declare function toCamelCase(str: string): string;
/**
 * 将字符串转换为帕斯卡命名法（大驼峰）
 * @param str 输入字符串
 * @returns 帕斯卡命名法字符串
 * @example
 * ```typescript
 * import { toPascalCase } from '@ldesign/typescript-utils-example/string'
 *
 * const result = toPascalCase('hello-world') // 'HelloWorld'
 * ```
 */
export declare function toPascalCase(str: string): string;
/**
 * 将字符串转换为短横线命名法
 * @param str 输入字符串
 * @returns 短横线命名法字符串
 * @example
 * ```typescript
 * import { toKebabCase } from '@ldesign/typescript-utils-example/string'
 *
 * const result = toKebabCase('helloWorld') // 'hello-world'
 * ```
 */
export declare function toKebabCase(str: string): string;
/**
 * 将字符串转换为下划线命名法
 * @param str 输入字符串
 * @returns 下划线命名法字符串
 * @example
 * ```typescript
 * import { toSnakeCase } from '@ldesign/typescript-utils-example/string'
 *
 * const result = toSnakeCase('helloWorld') // 'hello_world'
 * ```
 */
export declare function toSnakeCase(str: string): string;
/**
 * 将字符串首字母大写
 * @param str 输入字符串
 * @returns 首字母大写的字符串
 * @example
 * ```typescript
 * import { capitalize } from '@ldesign/typescript-utils-example/string'
 *
 * const result = capitalize('hello world') // 'Hello world'
 * ```
 */
export declare function capitalize(str: string): string;
/**
 * 将字符串每个单词首字母大写
 * @param str 输入字符串
 * @returns 每个单词首字母大写的字符串
 * @example
 * ```typescript
 * import { capitalizeWords } from '@ldesign/typescript-utils-example/string'
 *
 * const result = capitalizeWords('hello world') // 'Hello World'
 * ```
 */
export declare function capitalizeWords(str: string): string;
/**
 * 截断字符串并添加省略号
 * @param str 输入字符串
 * @param maxLength 最大长度
 * @param suffix 后缀（默认为'...'）
 * @returns 截断后的字符串
 * @example
 * ```typescript
 * import { truncate } from '@ldesign/typescript-utils-example/string'
 *
 * const result = truncate('Hello World', 8) // 'Hello...'
 * ```
 */
export declare function truncate(str: string, maxLength: number, suffix?: string): string;
/**
 * 移除字符串两端的空白字符
 * @param str 输入字符串
 * @returns 去除空白字符的字符串
 * @example
 * ```typescript
 * import { trim } from '@ldesign/typescript-utils-example/string'
 *
 * const result = trim('  hello world  ') // 'hello world'
 * ```
 */
export declare function trim(str: string): string;
/**
 * 填充字符串到指定长度
 * @param str 输入字符串
 * @param targetLength 目标长度
 * @param padString 填充字符（默认为空格）
 * @param padStart 是否从开头填充（默认为true）
 * @returns 填充后的字符串
 * @example
 * ```typescript
 * import { pad } from '@ldesign/typescript-utils-example/string'
 *
 * const result = pad('5', 3, '0') // '005'
 * const result2 = pad('5', 3, '0', false) // '500'
 * ```
 */
export declare function pad(str: string, targetLength: number, padString?: string, padStart?: boolean): string;
