/**
 * 验证工具函数
 */
/** 邮箱验证 */
export declare function isEmail(str: string): boolean;
/** 手机号验证（中国） */
export declare function isPhone(str: string): boolean;
/** URL 验证 */
export declare function isUrl(str: string): boolean;
/** 身份证验证（中国） */
export declare function isIdCard(str: string): boolean;
/** 纯数字 */
export declare function isNumeric(str: string): boolean;
/** 字母数字 */
export declare function isAlphanumeric(str: string): boolean;
/** 中文 */
export declare function isChinese(str: string): boolean;
/** IP 地址 */
export declare function isIP(str: string): boolean;
/** 密码强度 */
export declare function passwordStrength(password: string): 'weak' | 'medium' | 'strong';
/** 必填验证 */
export declare function required(value: any): boolean;
/** 长度验证 */
export declare function length(value: string, min: number, max?: number): boolean;
//# sourceMappingURL=index.d.ts.map