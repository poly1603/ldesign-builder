/**
 * TypeScript 声明文件生成器
 * 
 * 使用 TypeScript Compiler API 直接生成 d.ts 文件
 * 不依赖 rollup-plugin-dts 或其他插件，避免版本兼容问题
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'node:fs'
import * as fse from 'fs-extra'
import { glob } from 'glob'
import type { Logger } from '../utils/logger'
import { createLogger } from '../utils/logger'

/**
 * DTS 生成选项
 */
export interface DtsGeneratorOptions {
  /** 源码目录 */
  srcDir: string
  /** 输出目录 */
  outDir: string
  /** tsconfig 文件路径 */
  tsconfig?: string
  /** 是否保持源码目录结构 */
  preserveStructure?: boolean
  /** 是否生成 declarationMap */
  declarationMap?: boolean
  /** 项目根目录 */
  rootDir?: string
  /** 要处理的文件模式 */
  include?: string[]
  /** 要排除的文件模式 */
  exclude?: string[]
  /** 日志记录器 */
  logger?: Logger
}

/**
 * 生成结果
 */
export interface DtsGenerationResult {
  /** 是否成功 */
  success: boolean
  /** 生成的文件列表 */
  files: string[]
  /** 错误信息 */
  errors?: string[]
  /** 警告信息 */
  warnings?: string[]
  /** 耗时（毫秒） */
  duration: number
}

/**
 * TypeScript 声明文件生成器
 */
export class DtsGenerator {
  private logger: Logger
  private options: Required<DtsGeneratorOptions>

  constructor(options: DtsGeneratorOptions) {
    this.logger = options.logger || createLogger()
    this.options = {
      srcDir: options.srcDir,
      outDir: options.outDir,
      tsconfig: options.tsconfig || path.join(process.cwd(), 'tsconfig.json'),
      preserveStructure: options.preserveStructure ?? true,
      declarationMap: options.declarationMap ?? false,
      rootDir: options.rootDir || process.cwd(),
      include: options.include || ['**/*.ts', '**/*.tsx', '**/*.vue'],
      exclude: options.exclude || ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**', '**/node_modules/**'],
      logger: this.logger
    }
  }

  /**
   * 生成声明文件
   */
  async generate(): Promise<DtsGenerationResult> {
    const startTime = Date.now()
    const generatedFiles: string[] = []
    const errors: string[] = []
    const warnings: string[] = []

    try {
      this.logger.debug('开始生成 TypeScript 声明文件...')
      this.logger.debug(`源码目录: ${this.options.srcDir}`)
      this.logger.debug(`输出目录: ${this.options.outDir}`)

      // 确保输出目录存在
      await fse.ensureDir(this.options.outDir)

      // 读取并解析 tsconfig
      const tsconfig = await this.loadTsConfig()

      // 获取要处理的文件列表
      const files = await this.getSourceFiles()
      this.logger.debug(`找到 ${files.length} 个源文件`)

      if (files.length === 0) {
        this.logger.warn('没有找到需要处理的 TypeScript 文件')
        return {
          success: true,
          files: [],
          warnings: ['没有找到需要处理的 TypeScript 文件'],
          duration: Date.now() - startTime
        }
      }

      // 创建编译器配置
      const compilerOptions = this.createCompilerOptions(tsconfig)

      // 创建编译器主机
      const host = this.createCompilerHost(compilerOptions)

      // 创建程序
      const program = ts.createProgram({
        rootNames: files,
        options: compilerOptions,
        host
      })

      // 获取诊断信息（只收集严重错误）
      const diagnostics = ts.getPreEmitDiagnostics(program)

      // 过滤诊断信息
      const filteredDiagnostics = diagnostics.filter(diagnostic => {
        const code = diagnostic.code
        const file = diagnostic.file?.fileName || ''

        // 忽略 .vue 文件相关的错误
        if (file.endsWith('.vue') || file.includes('.vue')) {
          return false
        }

        // 忽略特定的错误码
        const ignoredCodes = [
          2688,  // Cannot find type definition file
          2307,  // Cannot find module
          5096,  // Option conflicts
          6133,  // Unused variable
          7016,  // Could not find declaration file
          2304,  // Cannot find name (通常是全局类型)
        ]

        return !ignoredCodes.includes(code)
      })

      // 如果有严重错误，记录但不终止
      if (filteredDiagnostics.length > 0) {
        filteredDiagnostics.forEach(diagnostic => {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          if (diagnostic.category === ts.DiagnosticCategory.Error) {
            errors.push(message)
          } else {
            warnings.push(message)
          }
        })
      }

      // 生成声明文件
      const emitResult = program.emit(
        undefined,
        (fileName, data) => {
          // 只处理 .d.ts 和 .d.ts.map 文件
          if (fileName.endsWith('.d.ts') || fileName.endsWith('.d.ts.map')) {
            const relativePath = path.relative(compilerOptions.outDir!, fileName)
            const targetPath = path.join(this.options.outDir, relativePath)

            fse.ensureDirSync(path.dirname(targetPath))
            fs.writeFileSync(targetPath, data, 'utf-8')

            if (fileName.endsWith('.d.ts')) {
              generatedFiles.push(targetPath)
              this.logger.debug(`生成: ${relativePath}`)
            }
          }
        },
        undefined,
        true, // 只生成声明文件
        undefined
      )

      // 处理生成错误
      if (emitResult.emitSkipped) {
        this.logger.warn('部分文件生成被跳过')
      }

      const duration = Date.now() - startTime
      this.logger.info(`✅ 生成了 ${generatedFiles.length} 个声明文件 (${duration}ms)`)

      return {
        success: true,
        files: generatedFiles,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('生成声明文件失败:', errorMessage)

      return {
        success: false,
        files: generatedFiles,
        errors: [errorMessage, ...errors],
        warnings: warnings.length > 0 ? warnings : undefined,
        duration
      }
    }
  }

  /**
   * 加载 tsconfig
   */
  private async loadTsConfig(): Promise<any> {
    try {
      const configPath = this.options.tsconfig

      if (!await fse.pathExists(configPath)) {
        this.logger.debug(`tsconfig 不存在: ${configPath}，使用默认配置`)
        return this.getDefaultTsConfig()
      }

      const configFile = ts.readConfigFile(configPath, ts.sys.readFile)

      if (configFile.error) {
        this.logger.warn(`读取 tsconfig 失败: ${configFile.error.messageText}，使用默认配置`)
        return this.getDefaultTsConfig()
      }

      const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        path.dirname(configPath)
      )

      return parsedConfig
    } catch (error) {
      this.logger.warn(`加载 tsconfig 失败，使用默认配置:`, error)
      return this.getDefaultTsConfig()
    }
  }

  /**
   * 获取默认 tsconfig
   */
  private getDefaultTsConfig(): any {
    return {
      options: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        lib: ['ES2020', 'DOM'],
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true
      },
      fileNames: []
    }
  }

  /**
   * 创建编译器选项
   */
  private createCompilerOptions(tsconfig: any): ts.CompilerOptions {
    const baseOptions = tsconfig.options || {}

    return {
      ...baseOptions,
      // 强制设置声明文件生成相关选项
      declaration: true,
      declarationMap: this.options.declarationMap,
      emitDeclarationOnly: true,
      // 输出目录
      outDir: this.options.outDir,
      rootDir: this.options.preserveStructure ? this.options.srcDir : undefined,
      // 跳过库检查以提高性能
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      // 不生成 JS 文件
      noEmit: false,
      // 允许 JS
      allowJs: false,
      // 模块解析
      moduleResolution: baseOptions.moduleResolution || ts.ModuleResolutionKind.Bundler,
      // 不检查未使用的变量（避免不必要的警告）
      noUnusedLocals: false,
      noUnusedParameters: false,
      // 允许合成默认导入
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      // 解析 JSON 模块
      resolveJsonModule: true,
      // 隔离模块（提高性能，但不能用于生成 DTS）
      isolatedModules: false,
      // 增量编译
      incremental: true,
      tsBuildInfoFile: path.join(this.options.outDir, '.tsbuildinfo')
    }
  }

  /**
   * 创建编译器主机
   */
  private createCompilerHost(options: ts.CompilerOptions): ts.CompilerHost {
    const host = ts.createCompilerHost(options)

    // 自定义文件写入，支持保持目录结构
    const originalWriteFile = host.writeFile
    if (originalWriteFile) {
      host.writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
        if (this.options.preserveStructure) {
          // 保持源码目录结构
          const relativePath = path.relative(
            options.rootDir || this.options.srcDir,
            fileName
          )
          const targetPath = path.join(this.options.outDir, relativePath)
          fileName = targetPath
        }

        originalWriteFile(fileName, data, writeByteOrderMark, onError, sourceFiles)
      }
    }

    return host
  }

  /**
   * 获取源文件列表
   */
  private async getSourceFiles(): Promise<string[]> {
    const patterns = this.options.include.map(pattern =>
      path.join(this.options.srcDir, pattern).replace(/\\/g, '/')
    )

    const excludePatterns = this.options.exclude.map(pattern =>
      path.join(this.options.srcDir, pattern).replace(/\\/g, '/')
    )

    const files: string[] = []

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: excludePatterns,
        absolute: true,
        nodir: true
      })

      // 过滤掉 .vue 文件（需要特殊处理）
      const tsFiles = matches.filter(file => {
        const ext = path.extname(file)
        return ext === '.ts' || ext === '.tsx'
      })

      files.push(...tsFiles)
    }

    // 去重
    return Array.from(new Set(files))
  }

  /**
   * 清理输出目录
   */
  async clean(): Promise<void> {
    try {
      if (await fse.pathExists(this.options.outDir)) {
        this.logger.debug(`清理输出目录: ${this.options.outDir}`)
        await fse.emptyDir(this.options.outDir)
      }
    } catch (error) {
      this.logger.warn(`清理输出目录失败:`, error)
    }
  }
}

/**
 * 创建 DTS 生成器
 */
export function createDtsGenerator(options: DtsGeneratorOptions): DtsGenerator {
  return new DtsGenerator(options)
}

/**
 * 快捷生成函数
 */
export async function generateDts(options: DtsGeneratorOptions): Promise<DtsGenerationResult> {
  const generator = createDtsGenerator(options)
  return await generator.generate()
}


