/**
 * 基础适配器样式处理器
 * 
 * 提供通用的样式文件处理功能（Less/SCSS/CSS）
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import { Logger } from '../../utils/logger'

/**
 * 样式处理配置
 */
export interface StyleOptions {
  /** 是否提取 CSS 到独立文件 */
  extract?: boolean
  /** CSS 文件名 */
  fileName?: string
  /** 是否压缩 CSS */
  minify?: boolean
  /** 是否生成 source map */
  sourceMap?: boolean
  /** Less 配置 */
  less?: {
    javascriptEnabled?: boolean
    modifyVars?: Record<string, string>
    paths?: string[]
  }
  /** SCSS 配置 */
  scss?: {
    includePaths?: string[]
    data?: string
  }
  /** PostCSS 配置 */
  postcss?: {
    plugins?: any[]
    config?: string | boolean
  }
  /** 是否自动添加前缀 */
  autoprefixer?: boolean | object
}

/**
 * 编译后的样式结果
 */
export interface CompiledStyle {
  css: string
  map?: string
  sourceFile: string
}

/**
 * 基础适配器样式处理器
 */
export class BaseAdapterStyleHandler {
  private logger: Logger
  private collectedStyles: Map<string, CompiledStyle> = new Map()
  private less: any = null
  private sass: any = null
  private postcss: any = null

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
  }

  /**
   * 检查是否为样式文件
   */
  isStyleFile(id: string): boolean {
    return /\.(less|scss|sass|css|styl)$/.test(id)
  }

  /**
   * 编译样式文件
   */
  async compileStyle(filePath: string, options: StyleOptions = {}): Promise<CompiledStyle | null> {
    if (!await fs.pathExists(filePath)) {
      this.logger.warn(`样式文件不存在: ${filePath}`)
      return null
    }

    const content = await fs.readFile(filePath, 'utf-8')
    const ext = path.extname(filePath).toLowerCase()

    try {
      let css = content
      let map: string | undefined

      // Less 编译
      if (ext === '.less') {
        const result = await this.compileLess(content, filePath, options.less)
        css = result.css
        map = result.map
      }
      // SCSS/Sass 编译
      else if (ext === '.scss' || ext === '.sass') {
        const result = await this.compileScss(filePath, options.scss)
        css = result.css
        map = result.map
      }

      // PostCSS 处理
      if (options.postcss || options.autoprefixer) {
        const result = await this.processPostCss(css, filePath, options)
        css = result.css
        if (result.map) map = result.map
      }

      // 压缩
      if (options.minify) {
        css = await this.minifyCss(css)
      }

      return { css, map, sourceFile: filePath }

    } catch (error) {
      this.logger.warn(`编译样式失败: ${filePath} - ${(error as Error).message}`)
      return null
    }
  }

  /**
   * 编译 Less
   */
  private async compileLess(
    content: string,
    filename: string,
    options: StyleOptions['less'] = {}
  ): Promise<{ css: string; map?: string }> {
    if (!this.less) {
      try {
        this.less = await import('less')
      } catch {
        throw new Error('Less 编译器未安装，请运行: npm install less')
      }
    }

    const result = await this.less.default.render(content, {
      filename,
      paths: options?.paths || [path.dirname(filename)],
      javascriptEnabled: options?.javascriptEnabled ?? true,
      modifyVars: options?.modifyVars || {},
      sourceMap: { sourceMapFileInline: true }
    })

    return {
      css: result.css,
      map: result.map
    }
  }

  /**
   * 编译 SCSS
   */
  private async compileScss(
    filename: string,
    options: StyleOptions['scss'] = {}
  ): Promise<{ css: string; map?: string }> {
    if (!this.sass) {
      try {
        this.sass = await import('sass')
      } catch {
        throw new Error('Sass 编译器未安装，请运行: npm install sass')
      }
    }

    const result = this.sass.compile(filename, {
      loadPaths: options?.includePaths || [],
      sourceMap: true
    })

    return {
      css: result.css,
      map: result.sourceMap ? JSON.stringify(result.sourceMap) : undefined
    }
  }

  /**
   * PostCSS 处理
   */
  private async processPostCss(
    css: string,
    from: string,
    options: StyleOptions
  ): Promise<{ css: string; map?: string }> {
    if (!this.postcss) {
      try {
        const postcssModule = await import('postcss')
        this.postcss = postcssModule.default
      } catch {
        this.logger.debug('PostCSS 未安装，跳过处理')
        return { css }
      }
    }

    const plugins: any[] = options.postcss?.plugins || []

    // 自动添加 autoprefixer
    if (options.autoprefixer !== false) {
      try {
        const autoprefixer = await import('autoprefixer')
        const autoprefixerOptions = typeof options.autoprefixer === 'object' 
          ? options.autoprefixer 
          : {}
        plugins.push(autoprefixer.default(autoprefixerOptions))
      } catch {
        this.logger.debug('autoprefixer 未安装，跳过前缀处理')
      }
    }

    if (plugins.length === 0) {
      return { css }
    }

    const result = await this.postcss(plugins).process(css, {
      from,
      map: { inline: false }
    })

    return {
      css: result.css,
      map: result.map?.toString()
    }
  }

  /**
   * 压缩 CSS
   */
  private async minifyCss(css: string): Promise<string> {
    try {
      // @ts-ignore - Optional dependency
      const CleanCSS = await import('clean-css')
      const result = new CleanCSS.default({
        level: 2,
        returnPromise: true
      }).minify(css)
      return (await result).styles
    } catch {
      // 如果 clean-css 不可用，尝试简单压缩
      return css
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .trim()
    }
  }

  /**
   * 收集样式
   */
  collectStyle(id: string, compiled: CompiledStyle): void {
    this.collectedStyles.set(id, compiled)
  }

  /**
   * 获取所有收集的样式
   */
  getCollectedStyles(): Map<string, CompiledStyle> {
    return this.collectedStyles
  }

  /**
   * 合并所有样式
   */
  getCombinedCss(): string {
    return Array.from(this.collectedStyles.values())
      .map(s => s.css)
      .join('\n\n')
  }

  /**
   * 清除收集的样式
   */
  clearCollectedStyles(): void {
    this.collectedStyles.clear()
  }

  /**
   * 输出样式文件
   */
  async outputStyleFile(
    outputDir: string,
    fileName: string = 'index.css',
    options: StyleOptions = {}
  ): Promise<string | null> {
    if (this.collectedStyles.size === 0) {
      return null
    }

    let css = this.getCombinedCss()

    if (options.minify) {
      css = await this.minifyCss(css)
    }

    const outputPath = path.join(outputDir, fileName)
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, css)

    this.logger.info(`✅ 样式文件已生成: ${outputPath} (${this.collectedStyles.size} 个文件)`)

    return outputPath
  }

  /**
   * 创建样式处理插件（用于打包器）
   */
  createStylePlugin(outputDir: string, options: StyleOptions = {}): any {
    const self = this

    return {
      name: 'base-adapter-style-plugin',

      async load(id: string) {
        if (!self.isStyleFile(id)) {
          return null
        }

        self.logger.debug(`处理样式文件: ${id}`)

        const compiled = await self.compileStyle(id, options)
        if (compiled) {
          self.collectStyle(id, compiled)
        }

        // 返回空模块，样式通过 generateBundle 输出
        return {
          code: `/* Style: ${path.basename(id)} */\nexport default "";`,
          map: null
        }
      },

      async generateBundle() {
        await self.outputStyleFile(outputDir, options.fileName || 'index.css', options)
      }
    }
  }

  /**
   * 创建 ESM 样式清理插件
   * ESM 产物不包含 style/ 目录
   */
  createEsmStyleCleanupPlugin(esmDir: string): any {
    const self = this

    return {
      name: 'esm-style-cleanup-plugin',

      async writeBundle() {
        const styleDir = path.join(esmDir, 'style')
        
        if (await fs.pathExists(styleDir)) {
          await fs.remove(styleDir)
          self.logger.debug(`已删除 ESM 产物中的样式目录: ${styleDir}`)
        }
      }
    }
  }

  /**
   * 复制样式文件到多个目录
   */
  async copyStylesTo(sourceDir: string, targetDirs: string[]): Promise<void> {
    if (!await fs.pathExists(sourceDir)) {
      return
    }

    for (const targetDir of targetDirs) {
      try {
        await fs.copy(sourceDir, targetDir, {
          filter: (src) => {
            const stat = fs.statSync(src)
            return stat.isDirectory() || this.isStyleFile(src) || src.endsWith('.css')
          }
        })
        this.logger.debug(`已复制样式文件到: ${targetDir}`)
      } catch (error) {
        this.logger.warn(`复制样式失败: ${(error as Error).message}`)
      }
    }
  }
}
