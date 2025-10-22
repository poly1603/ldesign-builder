/**
 * 友好的错误处理器
 * 
 * 提供清晰的错误信息和自动修复建议
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { Logger } from './logger'
import chalk from 'chalk'

/**
 * 错误类型
 */
export enum ErrorType {
  MISSING_DEPENDENCY = 'MISSING_DEPENDENCY',
  CONFIG_ERROR = 'CONFIG_ERROR',
  BUILD_ERROR = 'BUILD_ERROR',
  TYPE_ERROR = 'TYPE_ERROR',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 解决方案接口
 */
export interface Solution {
  title: string
  description: string
  command?: string
  config?: string
  link?: string
}

/**
 * 友好错误信息
 */
export interface FriendlyError {
  type: ErrorType
  title: string
  message: string
  solutions: Solution[]
  originalError?: Error
}

/**
 * 友好错误处理器
 */
export class FriendlyErrorHandler {
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
  }

  /**
   * 处理错误并提供友好提示
   */
  handle(error: Error | string, context?: any): FriendlyError {
    const errorMessage = typeof error === 'string' ? error : error.message
    const friendlyError = this.analyze(errorMessage, error instanceof Error ? error : undefined, context)

    this.display(friendlyError)

    return friendlyError
  }

  /**
   * 分析错误并生成友好信息
   */
  private analyze(message: string, originalError?: Error, context?: any): FriendlyError {
    // 缺少依赖
    if (this.isMissingDependency(message)) {
      return this.handleMissingDependency(message, originalError, context)
    }

    // 配置错误
    if (this.isConfigError(message)) {
      return this.handleConfigError(message, originalError, context)
    }

    // 类型错误
    if (this.isTypeError(message)) {
      return this.handleTypeError(message, originalError, context)
    }

    // 语法错误
    if (this.isSyntaxError(message)) {
      return this.handleSyntaxError(message, originalError, context)
    }

    // 版本冲突
    if (this.isVersionConflict(message)) {
      return this.handleVersionConflict(message, originalError, context)
    }

    // 文件未找到
    if (this.isFileNotFound(message)) {
      return this.handleFileNotFound(message, originalError, context)
    }

    // 未知错误
    return this.handleUnknownError(message, originalError, context)
  }

  /**
   * 检测：缺少依赖
   */
  private isMissingDependency(message: string): boolean {
    return /cannot find module|module not found|enoent/i.test(message)
  }

  /**
   * 处理：缺少依赖
   */
  private handleMissingDependency(message: string, originalError?: Error, context?: any): FriendlyError {
    // 尝试提取缺少的包名
    const packageMatch = message.match(/['"]([^'"]+)['"]/) || message.match(/module[:\s]+([^\s]+)/)
    const packageName = packageMatch ? packageMatch[1] : 'unknown'

    const solutions: Solution[] = []

    // 提供安装命令
    if (packageName !== 'unknown') {
      solutions.push({
        title: '安装缺少的依赖',
        description: `使用包管理器安装 ${packageName}`,
        command: `npm install ${packageName} --save-dev`,
      })

      solutions.push({
        title: '使用 pnpm（推荐）',
        description: '如果使用 pnpm workspace',
        command: `pnpm add ${packageName} -D`,
      })

      // 特定包的建议
      if (packageName.includes('esbuild')) {
        solutions.push({
          title: '或使用其他打包引擎',
          description: 'esbuild 是可选的，可以使用 rollup',
          config: `export default { bundler: 'rollup' }`
        })
      }

      if (packageName.includes('@swc/core')) {
        solutions.push({
          title: '或使用其他打包引擎',
          description: 'swc 是可选的，可以使用 rollup',
          config: `export default { bundler: 'rollup' }`
        })
      }
    }

    return {
      type: ErrorType.MISSING_DEPENDENCY,
      title: '缺少依赖包',
      message: `无法找到模块 "${packageName}"`,
      solutions,
      originalError
    }
  }

  /**
   * 检测：配置错误
   */
  private isConfigError(message: string): boolean {
    return /config|configuration|invalid.*option/i.test(message)
  }

  /**
   * 处理：配置错误
   */
  private handleConfigError(message: string, originalError?: Error, context?: any): FriendlyError {
    const solutions: Solution[] = [
      {
        title: '检查配置文件',
        description: '确保 .ldesign/builder.config.ts 语法正确',
        link: 'https://github.com/ldesign/builder/docs/configuration.md'
      },
      {
        title: '使用零配置',
        description: '尝试删除配置文件，让工具自动检测',
        command: 'rm .ldesign/builder.config.ts'
      },
      {
        title: '使用最小配置',
        description: '只保留必要的配置项',
        config: `export default {\n  name: 'MyLib',\n  external: ['vue']\n}`
      }
    ]

    return {
      type: ErrorType.CONFIG_ERROR,
      title: '配置错误',
      message: '配置文件存在问题',
      solutions,
      originalError
    }
  }

  /**
   * 检测：类型错误
   */
  private isTypeError(message: string): boolean {
    return /type.*error|cannot find name|property.*does not exist/i.test(message)
  }

  /**
   * 处理：类型错误
   */
  private handleTypeError(message: string, originalError?: Error, context?: any): FriendlyError {
    const solutions: Solution[] = [
      {
        title: '安装类型声明',
        description: '安装 @types 包',
        command: 'npm install @types/node --save-dev'
      },
      {
        title: '检查 tsconfig.json',
        description: '确保类型声明路径正确',
        config: `{\n  "compilerOptions": {\n    "types": ["node"],\n    "skipLibCheck": true\n  }\n}`
      },
      {
        title: '跳过类型检查（临时方案）',
        description: '在构建时跳过类型检查',
        config: `export default {\n  typescript: {\n    skipLibCheck: true\n  }\n}`
      }
    ]

    return {
      type: ErrorType.TYPE_ERROR,
      title: 'TypeScript 类型错误',
      message: '类型检查失败',
      solutions,
      originalError
    }
  }

  /**
   * 检测：语法错误
   */
  private isSyntaxError(message: string): boolean {
    return /syntax.*error|unexpected.*token|unexpected.*identifier/i.test(message)
  }

  /**
   * 处理：语法错误
   */
  private handleSyntaxError(message: string, originalError?: Error, context?: any): FriendlyError {
    const solutions: Solution[] = [
      {
        title: '检查代码语法',
        description: '确保代码没有语法错误'
      },
      {
        title: '检查文件编码',
        description: '确保文件使用 UTF-8 编码'
      },
      {
        title: '更新 TypeScript',
        description: '升级到最新版本',
        command: 'npm install typescript@latest --save-dev'
      }
    ]

    return {
      type: ErrorType.SYNTAX_ERROR,
      title: '语法错误',
      message: '代码存在语法错误',
      solutions,
      originalError
    }
  }

  /**
   * 检测：版本冲突
   */
  private isVersionConflict(message: string): boolean {
    return /version.*conflict|peer.*dep|incompatible/i.test(message)
  }

  /**
   * 处理：版本冲突
   */
  private handleVersionConflict(message: string, originalError?: Error, context?: any): FriendlyError {
    const solutions: Solution[] = [
      {
        title: '检查 peerDependencies',
        description: '确保依赖版本兼容',
        command: 'npm ls'
      },
      {
        title: '更新依赖',
        description: '升级到兼容版本',
        command: 'npm update'
      },
      {
        title: '清理重装',
        description: '删除 node_modules 并重新安装',
        command: 'rm -rf node_modules && npm install'
      }
    ]

    return {
      type: ErrorType.VERSION_CONFLICT,
      title: '版本冲突',
      message: '依赖版本不兼容',
      solutions,
      originalError
    }
  }

  /**
   * 检测：文件未找到
   */
  private isFileNotFound(message: string): boolean {
    return /enoent|no such file|cannot find.*file/i.test(message)
  }

  /**
   * 处理：文件未找到
   */
  private handleFileNotFound(message: string, originalError?: Error, context?: any): FriendlyError {
    const solutions: Solution[] = [
      {
        title: '检查文件路径',
        description: '确保文件存在且路径正确'
      },
      {
        title: '检查入口文件',
        description: '确保 src/index.ts 存在',
        command: 'ls -la src/'
      },
      {
        title: '使用自动检测',
        description: '让工具自动查找入口文件',
        config: `export default {\n  // 不指定 input，自动检测\n}`
      }
    ]

    return {
      type: ErrorType.FILE_NOT_FOUND,
      title: '文件未找到',
      message: '无法找到指定的文件',
      solutions,
      originalError
    }
  }

  /**
   * 处理：未知错误
   */
  private handleUnknownError(message: string, originalError?: Error, context?: any): FriendlyError {
    const solutions: Solution[] = [
      {
        title: '查看完整错误信息',
        description: '使用调试模式获取详细信息',
        command: 'ldesign-builder build --debug'
      },
      {
        title: '清理缓存',
        description: '删除缓存文件后重试',
        command: 'rm -rf node_modules/.cache'
      },
      {
        title: '提交问题',
        description: '如果问题持续存在，请提交 Issue',
        link: 'https://github.com/ldesign/builder/issues'
      }
    ]

    return {
      type: ErrorType.UNKNOWN,
      title: '构建错误',
      message: message || '发生未知错误',
      solutions,
      originalError
    }
  }

  /**
   * 显示友好的错误信息
   */
  private display(error: FriendlyError): void {
    console.log('\n')
    console.log(chalk.red.bold('❌ ' + error.title))
    console.log(chalk.gray('─'.repeat(60)))
    console.log(chalk.white('\n' + error.message))

    if (error.solutions.length > 0) {
      console.log(chalk.cyan.bold('\n💡 解决方案：'))

      error.solutions.forEach((solution, index) => {
        console.log(chalk.white(`\n${index + 1}. ${chalk.bold(solution.title)}`))
        console.log(chalk.gray(`   ${solution.description}`))

        if (solution.command) {
          console.log(chalk.green(`\n   $ ${solution.command}`))
        }

        if (solution.config) {
          console.log(chalk.yellow('\n   配置示例：'))
          console.log(chalk.gray('   ' + solution.config.split('\n').join('\n   ')))
        }

        if (solution.link) {
          console.log(chalk.blue(`\n   📖 ${solution.link}`))
        }
      })
    }

    if (error.originalError && error.originalError.stack) {
      console.log(chalk.gray('\n\n详细错误信息：'))
      console.log(chalk.gray(error.originalError.stack))
    }

    console.log('\n')
  }

  /**
   * 尝试自动修复
   */
  async autoFix(error: FriendlyError): Promise<boolean> {
    // 自动修复逻辑（可选）
    // 例如：自动安装缺少的依赖

    if (error.type === ErrorType.MISSING_DEPENDENCY) {
      // 可以实现自动 npm install
      this.logger.info('提示：运行以下命令安装缺少的依赖')
      if (error.solutions[0]?.command) {
        console.log(chalk.green(`  $ ${error.solutions[0].command}`))
      }
      return false
    }

    return false
  }
}

/**
 * 创建友好错误处理器
 */
export function createFriendlyErrorHandler(logger?: Logger): FriendlyErrorHandler {
  return new FriendlyErrorHandler(logger)
}

/**
 * 快速处理错误
 */
export function handleError(error: Error | string, context?: any): FriendlyError {
  const handler = createFriendlyErrorHandler()
  return handler.handle(error, context)
}



