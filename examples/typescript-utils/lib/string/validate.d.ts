/**
 * 字符串验证工具函数
 * 提供各种字符串验证功能
 */
/**
 * 验证是否为有效的邮箱地址
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 * @example
 * ```typescript
 * import { isValidEmail } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isValidEmail('test@example.com') // true
 * const result2 = isValidEmail('invalid-email') // false
 * ```
 */
export declare function isValidEmail(email: string): boolean;
/**
 * 验证是否为有效的URL
 * @param url URL地址
 * @returns 是否为有效URL
 * @example
 * ```typescript
 * import { isValidUrl } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isValidUrl('https://example.com') // true
 * const result2 = isValidUrl('invalid-url') // false
 * ```
 */
export declare function isValidUrl(url: string): boolean;
/**
 * 验证是否为有效的手机号码（中国大陆）
 * @param phone 手机号码
 * @returns 是否为有效手机号
 * @example
 * ```typescript
 * import { isValidPhone } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isValidPhone('13812345678') // true
 * const result2 = isValidPhone('12345') // false
 * ```
 */
export declare function isValidPhone(phone: string): boolean;
/**
 * 验证是否为有效的身份证号码（中国大陆）
 * @param idCard 身份证号码
 * @returns 是否为有效身份证号
 * @example
 * ```typescript
 * import { isValidIdCard } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isValidIdCard('110101199003077777') // true（示例）
 * ```
 */
export declare function isValidIdCard(idCard: string): boolean;
/**
 * 验证密码强度
 * @param password 密码
 * @param options 验证选项
 * @returns 密码强度等级和是否通过验证
 * @example
 * ```typescript
 * import { validatePassword } from '@ldesign/typescript-utils-example/string'
 *
 * const result = validatePassword('Abc123!@#')
 * // { strength: 'strong', isValid: true, score: 4 }
 * ```
 */
export declare function validatePassword(password: string, options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
}): {
    strength: 'weak' | 'medium' | 'strong';
    isValid: boolean;
    score: number;
    issues: string[];
};
/**
 * 检查字符串是否只包含数字
 * @param str 输入字符串
 * @returns 是否只包含数字
 * @example
 * ```typescript
 * import { isNumeric } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isNumeric('12345') // true
 * const result2 = isNumeric('123abc') // false
 * ```
 */
export declare function isNumeric(str: string): boolean;
/**
 * 检查字符串是否只包含字母
 * @param str 输入字符串
 * @returns 是否只包含字母
 * @example
 * ```typescript
 * import { isAlpha } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isAlpha('hello') // true
 * const result2 = isAlpha('hello123') // false
 * ```
 */
export declare function isAlpha(str: string): boolean;
/**
 * 检查字符串是否只包含字母和数字
 * @param str 输入字符串
 * @returns 是否只包含字母和数字
 * @example
 * ```typescript
 * import { isAlphanumeric } from '@ldesign/typescript-utils-example/string'
 *
 * const result = isAlphanumeric('hello123') // true
 * const result2 = isAlphanumeric('hello-123') // false
 * ```
 */
export declare function isAlphanumeric(str: string): boolean;
