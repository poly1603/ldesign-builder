/**
 * ��־ϵͳ���� - �ص���ģ��
 *
 * @deprecated ���ļ��ѷ�������ֱ��ʹ�� './logger/index' �� './logger/Logger'
 * Ϊ�������ݣ����ļ����µ��� logger Ŀ¼�µ���������
 *
 * @example
 * ```typescript
 * // �Ƽ�ʹ�÷�ʽ
 * import { Logger } from './utils/logger/Logger'
 * // ��
 * import { Logger } from './utils/logger'
 *
 * // ���ݾɴ��루���Ƽ���
 * import { Logger } from './utils/logger.ts'
 * ```
 */

// ���µ��� logger Ŀ¼�µ���������
export * from './logger/Logger'
export * from './logger/formatters'
export { default } from './logger/Logger'
