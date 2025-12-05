/**
 * 组件库样式处理器
 * 
 * 在 Rollup 构建完成后，处理组件库的样式文件：
 * 1. 编译 Less 到 CSS
 * 2. 复制样式文件到输出目录
 * 3. 生成样式入口文件 (index.js, css.js)
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import less from 'less'
import type { Logger } from '../utils/logger'
import type { BuilderConfig } from '../types/config'

export interface OutputDirConfig {
  /** 输出目录 */
  dir: string
  /** 是否保留 Less 源文件 (不编译) */
  preserveLessSource?: boolean
}

export interface StyleProcessorOptions {
  /** 源目录 */
  srcDir: string
  /** 输出目录列表 (字符串或配置对象) */
  outputDirs: (string | OutputDirConfig)[]
  /** 是否编译 Less (默认 true) */
  compileLess?: boolean
  /** 日志记录器 */
  logger?: Logger
}

/**
 * 组件库样式处理器
 */
export class StyleProcessor {
  private srcDir: string
  private outputDirs: OutputDirConfig[]
  private compileLess: boolean
  private logger?: Logger
  private less: any = less

  constructor(options: StyleProcessorOptions) {
    this.srcDir = options.srcDir
    // 标准化输出目录配置
    this.outputDirs = options.outputDirs.map(dir =>
      typeof dir === 'string' ? { dir, preserveLessSource: false } : dir
    )
    this.compileLess = options.compileLess !== false
    this.logger = options.logger
  }

  private log(message: string, ...args: any[]) {
    if (this.logger) {
      this.logger.info(message, ...args)
    } else {
      console.log(message, ...args)
    }
  }

  /**
   * 检测是否是组件库结构
   */
  async detectComponentLibrary(): Promise<{
    isComponentLibrary: boolean
    components: string[]
  }> {
    const result = {
      isComponentLibrary: false,
      components: [] as string[]
    }

    if (!await fs.pathExists(this.srcDir)) {
      return result
    }

    const entries = await fs.readdir(this.srcDir, { withFileTypes: true })

    // 跳过的非组件目录
    const skipDirs = ['style', 'styles', 'utils', 'hooks', 'common', 'types', 'shared', '_utils', '_common', 'locale', 'locales']

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (skipDirs.includes(entry.name)) continue

      const componentDir = path.join(this.srcDir, entry.name)
      const styleDir = path.join(componentDir, 'style')
      const hasIndex = await fs.pathExists(path.join(componentDir, 'index.ts')) ||
        await fs.pathExists(path.join(componentDir, 'index.tsx'))
      const hasStyleDir = await fs.pathExists(styleDir)

      if (hasIndex && hasStyleDir) {
        result.components.push(entry.name)
      }
    }

    // 至少有2个组件才认为是组件库
    result.isComponentLibrary = result.components.length >= 2
    return result
  }

  /**
   * 处理样式
   */
  async process(): Promise<void> {
    this.log('[StyleProcessor] 开始处理组件库样式...')

    // 检测组件库结构
    const { isComponentLibrary, components } = await this.detectComponentLibrary()

    if (!isComponentLibrary) {
      this.log('[StyleProcessor] 未检测到组件库结构，跳过样式处理')
      return
    }

    this.log(`[StyleProcessor] 检测到 ${components.length} 个组件: ${components.join(', ')}`)

    // 加载 Less 编译器
    if (this.compileLess) {
      if (this.less) {
        this.log(`[StyleProcessor] Less 编译器版本: ${this.less.version.join('.')}`)
      } else {
        this.log('[StyleProcessor] ⚠️ 未检测到 Less 编译器，仅支持样式复制')
      }
    }

    // 为每个输出目录处理样式
    for (const outputConfig of this.outputDirs) {
      const { dir: outputDir, preserveLessSource } = outputConfig

      if (!await fs.pathExists(outputDir)) {
        // 如果目录不存在但配置了 preserveLessSource，尝试从 es 目录镜像
        if (preserveLessSource) {
          // 计算对应的 es 目录路径
          const dirBasename = path.basename(outputDir)
          const dirParent = path.dirname(outputDir)
          // 如果目录名是 esm，尝试从同级的 es 目录镜像
          const esDir = dirBasename === 'esm'
            ? path.join(dirParent, 'es')
            : outputDir.replace(/esm/g, 'es')

          if (await fs.pathExists(esDir)) {
            this.log(`[StyleProcessor] 从 ${esDir} 镜像到 ${outputDir}`)
            await fs.copy(esDir, outputDir, { overwrite: true })
          } else {
            this.log(`[StyleProcessor] 输出目录不存在且无法镜像，跳过: ${outputDir}`)
            continue
          }
        } else {
          this.log(`[StyleProcessor] 输出目录不存在，跳过: ${outputDir}`)
          continue
        }
      }

      const mode = preserveLessSource ? '保留 Less 源文件' : '编译为 CSS'
      this.log(`[StyleProcessor] 处理输出目录: ${outputDir} (${mode})`)

      // 处理每个组件的样式
      for (const component of components) {
        await this.processComponentStyle(component, outputDir, preserveLessSource)
      }

      // 处理全局样式目录
      const globalStyleSrc = path.join(this.srcDir, 'style')
      if (await fs.pathExists(globalStyleSrc)) {
        await this.processGlobalStyle(globalStyleSrc, path.join(outputDir, 'style'), preserveLessSource)
      }
    }

    this.log('[StyleProcessor] 样式处理完成')
  }

  /**
   * 处理单个组件的样式
   * @param component 组件名
   * @param outputDir 输出目录
   * @param preserveLessSource 是否保留 Less 源文件
   */
  private async processComponentStyle(component: string, outputDir: string, preserveLessSource?: boolean): Promise<void> {
    const srcStyleDir = path.join(this.srcDir, component, 'style')
    const outStyleDir = path.join(outputDir, component, 'style')

    if (!await fs.pathExists(srcStyleDir)) {
      return
    }

    // 创建输出目录
    await fs.ensureDir(outStyleDir)

    const styleFiles = await fs.readdir(srcStyleDir)
    let mainLessFile: string | null = null
    let mainCssFile: string | null = null

    // 查找主要的样式文件
    for (const file of styleFiles) {
      if (file.endsWith('.less') && !mainLessFile) {
        mainLessFile = file
      }
      if (file.endsWith('.css') && !mainCssFile) {
        mainCssFile = file
      }
    }

    let outputStyleFile: string | null = null

    // 根据模式处理样式文件
    if (preserveLessSource && mainLessFile) {
      // 模式1: 保留 Less 源文件 (用于 esm 目录，支持用户定制变量)
      // 复制所有 Less 文件
      for (const file of styleFiles) {
        if (file.endsWith('.less')) {
          await fs.copy(
            path.join(srcStyleDir, file),
            path.join(outStyleDir, file)
          )
        }
      }
      outputStyleFile = mainLessFile
      this.log(`[StyleProcessor] ✓ 复制 Less: ${component}/style/${mainLessFile}`)
    } else if (mainLessFile && this.less) {
      // 模式2: 编译 Less 为 CSS (用于 es/lib 目录)
      const lessPath = path.join(srcStyleDir, mainLessFile)
      const cssFileName = mainLessFile.replace('.less', '.css')
      const cssPath = path.join(outStyleDir, cssFileName)

      try {
        const lessContent = await fs.readFile(lessPath, 'utf-8')
        const result = await this.less.render(lessContent, {
          filename: lessPath,
          paths: [srcStyleDir, this.srcDir, path.join(this.srcDir, 'style')]
        })
        await fs.writeFile(cssPath, result.css, 'utf-8')
        outputStyleFile = cssFileName
        this.log(`[StyleProcessor] ✓ 编译 Less: ${component}/style/${mainLessFile} -> ${cssFileName}`)
      } catch (e: any) {
        this.log(`[StyleProcessor] ✗ Less 编译失败 (${component}): ${e.message}`)
        // 尝试复制已存在的 CSS 文件
        if (mainCssFile) {
          await fs.copy(
            path.join(srcStyleDir, mainCssFile),
            path.join(outStyleDir, mainCssFile)
          )
          outputStyleFile = mainCssFile
        }
      }
    } else if (mainCssFile) {
      // 模式3: 直接复制 CSS 文件
      await fs.copy(
        path.join(srcStyleDir, mainCssFile),
        path.join(outStyleDir, mainCssFile)
      )
      outputStyleFile = mainCssFile
      this.log(`[StyleProcessor] ✓ 复制 CSS: ${component}/style/${mainCssFile}`)
    }

    // 生成样式入口文件
    if (outputStyleFile) {
      const indexJsContent = `import './${outputStyleFile}';\n`

      // style/index.js - 导入样式 (Less 或 CSS)
      await fs.writeFile(path.join(outStyleDir, 'index.js'), indexJsContent, 'utf-8')

      // style/css.js - 对于保留 Less 的情况，仍然生成 (用户可能也需要)
      // 对于编译 CSS 的情况，指向 CSS 文件
      if (preserveLessSource && mainLessFile) {
        // esm 模式: css.js 也导入 less (用户需要自行配置 less-loader)
        await fs.writeFile(path.join(outStyleDir, 'css.js'), indexJsContent, 'utf-8')
      } else {
        await fs.writeFile(path.join(outStyleDir, 'css.js'), indexJsContent, 'utf-8')
      }
    }
  }

  /**
   * 处理全局样式目录
   * @param srcStyleDir 源样式目录
   * @param outStyleDir 输出样式目录
   * @param preserveLessSource 是否保留 Less 源文件
   */
  private async processGlobalStyle(srcStyleDir: string, outStyleDir: string, preserveLessSource?: boolean): Promise<void> {
    if (!await fs.pathExists(srcStyleDir)) {
      return
    }

    await fs.ensureDir(outStyleDir)

    const files = await fs.readdir(srcStyleDir)

    for (const file of files) {
      const srcFile = path.join(srcStyleDir, file)
      const outFile = path.join(outStyleDir, file)
      const stat = await fs.stat(srcFile)

      if (stat.isDirectory()) {
        await this.processGlobalStyle(srcFile, outFile, preserveLessSource)
      } else if (file.endsWith('.less')) {
        if (preserveLessSource) {
          // 保留 Less 源文件
          await fs.copy(srcFile, outFile)
        } else if (this.less) {
          // 编译 Less 为 CSS
          try {
            const lessContent = await fs.readFile(srcFile, 'utf-8')
            const result = await this.less.render(lessContent, {
              filename: srcFile,
              paths: [srcStyleDir, path.dirname(srcStyleDir)]
            })
            const cssFile = outFile.replace('.less', '.css')
            await fs.writeFile(cssFile, result.css, 'utf-8')
          } catch (e: any) {
            this.log(`[StyleProcessor] ✗ Less 编译失败: ${e.message}`)
          }
        }
      } else if (file.endsWith('.css') || file.endsWith('.js')) {
        await fs.copy(srcFile, outFile)
      }
    }
  }
}

/**
 * 从构建配置中获取输出目录列表
 * 
 * TDesign 风格的目录结构：
 * - es/   - ES modules，编译后的 CSS (快速使用)
 * - esm/  - ES modules，保留 Less 源文件 (支持定制变量)
 * - lib/  - CommonJS，编译后的 CSS
 */
export function getOutputDirsFromConfig(config: BuilderConfig): OutputDirConfig[] {
  console.log('[DEBUG] getOutputDirsFromConfig received output:', JSON.stringify(config.output))
  const dirs: OutputDirConfig[] = []
  const output = config.output

  if (Array.isArray(output)) {
    for (const item of output) {
      if (item.dir && !['umd', 'iife'].includes(item.format || '')) {
        // 检测是否需要保留 Less 源文件
        const preserveLessSource = item.dir === 'esm' || (item as any).preserveLessSource === true
        dirs.push({ dir: item.dir, preserveLessSource })
      }
    }
  } else if (output && typeof output === 'object') {
    // 检查是否是类数组对象 (由 defu 合并导致，包含数字键)
    const keys = Object.keys(output)
    const numericKeys = keys.filter(k => !isNaN(Number(k)))

    if (numericKeys.length > 0) {
      // 优先处理类数组对象（用户配置的数组被合并成了对象）
      for (const key of numericKeys) {
        const item = (output as any)[key]
        if (item.dir && !['umd', 'iife'].includes(item.format || '')) {
          const preserveLessSource = item.dir === 'esm' || (item as any).preserveLessSource === true
          dirs.push({ dir: item.dir, preserveLessSource })
        }
      }
    } else {
      // 原有的对象格式处理: { es: {...}, esm: {...}, cjs: {...} }
      const formatConfigs = ['es', 'esm', 'cjs', 'lib'] as const
      for (const format of formatConfigs) {
        const formatConfig = (output as any)[format]
        if (formatConfig && formatConfig !== false) {
          const dir = typeof formatConfig === 'object' ? formatConfig.dir : format
          // 检查实际的目录名，而不是格式键
          const preserveLessSource = dir === 'esm' ||
            (typeof formatConfig === 'object' && formatConfig.preserveLessSource === true)
          if (dir) dirs.push({ dir, preserveLessSource })
        }
      }
    }
  }

  // 默认目录: es (编译CSS) 和 lib (编译CSS)
  if (dirs.length === 0) {
    dirs.push({ dir: 'es', preserveLessSource: false })
    dirs.push({ dir: 'lib', preserveLessSource: false })
  }

  // 去重 (基于 dir)
  const seen = new Set<string>()
  return dirs.filter(cfg => {
    if (seen.has(cfg.dir)) return false
    seen.add(cfg.dir)
    return true
  })
}

export default StyleProcessor
