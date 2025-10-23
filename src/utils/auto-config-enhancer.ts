/**
 * 自动配置增强器
 * 
 * 自动处理 external、globals、libraryType 和 Vue 插件配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { BuilderConfig } from '../types/config'
import { LibraryType } from '../types/library'
import { Logger } from './logger'

/**
 * 包信息接口
 */
interface PackageInfo {
  name?: string
  type?: string
  bin?: string | Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

/**
 * 已知的全局变量映射
 */
const KNOWN_GLOBALS: Record<string, string> = {
  'vue': 'Vue',
  'react': 'React',
  'react-dom': 'ReactDOM',
  'lodash': '_',
  'lodash-es': '_',
  'jquery': '$',
  'moment': 'moment',
  'dayjs': 'dayjs',
  'axios': 'axios',
  'raf': 'raf',
  '@vue/runtime-core': 'Vue',
  '@vue/runtime-dom': 'Vue',
  '@vue/reactivity': 'Vue',
  '@vue/shared': 'Vue'
}

/**
 * 自动配置增强器类
 */
export class AutoConfigEnhancer {
  private logger: Logger
  private projectPath: string
  private packageInfo?: PackageInfo
  private tsconfigInfo?: any

  constructor(projectPath: string, logger?: Logger) {
    this.projectPath = projectPath
    this.logger = logger || new Logger()
  }

  /**
   * 增强配置
   */
  async enhanceConfig(config: BuilderConfig): Promise<BuilderConfig> {
    this.logger.debug('开始配置自动增强...')
    const enhanced = { ...config }

    // 读取 package.json 和 tsconfig.json
    this.logger.debug('读取项目配置文件...')
    await this.loadPackageInfo()
    await this.loadTsconfig()

    // 自动检测库类型
    this.logger.debug(`当前 libraryType: ${enhanced.libraryType}`)
    if (!enhanced.libraryType || enhanced.libraryType === LibraryType.TYPESCRIPT) {
      this.logger.debug('libraryType 为空或为默认的 TypeScript 类型，开始自动检测...')
      enhanced.libraryType = await this.detectLibraryType()
      this.logger.debug(`自动检测库类型: ${enhanced.libraryType}`)
    } else {
      this.logger.debug('libraryType 已明确设置，跳过自动检测')
    }

    // 智能推断入口文件
    if (!enhanced.input || enhanced.input === 'src/index.ts') {
      enhanced.input = await this.detectEntryFile()
      this.logger.debug(`自动检测入口文件: ${enhanced.input}`)
    }

    // 智能推断输出格式
    if (!enhanced.output || typeof enhanced.output !== 'object') {
      enhanced.output = await this.inferOutputFormats(enhanced.libraryType)
      this.logger.debug(`自动推断输出格式:`, enhanced.output)
    }

    // 自动生成 external
    if (!enhanced.external || (Array.isArray(enhanced.external) && enhanced.external.length === 0)) {
      enhanced.external = this.generateExternal()
    }

    // 自动生成 globals
    if (!enhanced.globals || Object.keys(enhanced.globals).length === 0) {
      enhanced.globals = this.generateGlobals(enhanced.external)
    }

    // 根据 package.json 推断 UMD 名称
    if (enhanced.output && typeof enhanced.output === 'object' && enhanced.output.umd) {
      const umdConfig = enhanced.output.umd
      if (typeof umdConfig === 'object' && (!umdConfig.name || umdConfig.name === 'MyLibrary')) {
        umdConfig.name = this.generateUmdName()
        this.logger.debug(`自动生成 UMD 名称: ${umdConfig.name}`)
      }
    }

    // 自动添加默认的 exclude 配置
    if (!enhanced.exclude || (Array.isArray(enhanced.exclude) && enhanced.exclude.length === 0)) {
      enhanced.exclude = this.generateDefaultExcludes()
    }

    // 根据 tsconfig.json 调整 TypeScript 配置
    if (this.tsconfigInfo) {
      enhanced.typescript = this.enhanceTypescriptConfig(enhanced.typescript || {})
    }

    // 自动添加 Vue 插件
    this.logger.debug(`检查是否需要添加 Vue 插件，libraryType: ${enhanced.libraryType}`)
    if (enhanced.libraryType === LibraryType.VUE3 || enhanced.libraryType === LibraryType.VUE2) {
      this.logger.debug(`检测到 ${enhanced.libraryType} 项目，自动添加 Vue 插件`)
      enhanced.plugins = await this.addVuePlugin(enhanced.plugins || [], enhanced.libraryType)
    } else {
      this.logger.debug('非 Vue 项目，不添加 Vue 插件')
    }

    this.logger.debug('配置自动增强完成')
    return enhanced
  }

  /**
   * 加载 package.json 信息
   */
  private async loadPackageInfo(): Promise<void> {
    try {
      const packagePath = path.join(this.projectPath, 'package.json')
      const content = await fs.readFile(packagePath, 'utf-8')
      this.packageInfo = JSON.parse(content)
    } catch (error) {
      this.logger.warn('无法读取 package.json，将使用默认配置')
      this.packageInfo = {}
    }
  }

  /**
   * 检测库类型
   */
  private async detectLibraryType(): Promise<LibraryType> {
    this.logger.debug('开始检测库类型...')

    if (!this.packageInfo) {
      this.logger.debug('没有 package.json 信息，返回 TypeScript 类型')
      return LibraryType.TYPESCRIPT
    }

    const allDeps = {
      ...this.packageInfo.dependencies,
      ...this.packageInfo.devDependencies,
      ...this.packageInfo.peerDependencies
    }
    this.logger.debug(`所有依赖: ${JSON.stringify(Object.keys(allDeps))}`)

    // 检查是否有 Vue 文件
    const hasVueFiles = await this.hasVueFiles()
    this.logger.debug(`是否有 Vue 文件: ${hasVueFiles}`)

    if (hasVueFiles) {
      // 检查 Vue 版本
      const vueVersion = allDeps.vue
      this.logger.info(`Vue 版本: ${vueVersion}`)

      if (vueVersion && vueVersion.includes('2.')) {
        this.logger.info('检测到 Vue 2 项目')
        return LibraryType.VUE2
      } else {
        this.logger.info('检测到 Vue 3 项目')
        return LibraryType.VUE3
      }
    }

    // 检查 React
    if (allDeps.react) {
      this.logger.info('检测到 React 项目')
      return LibraryType.REACT
    }

    // 检查样式库
    if (allDeps.less || allDeps.sass || allDeps.stylus) {
      this.logger.info('检测到样式库项目')
      return LibraryType.STYLE
    }

    this.logger.info('检测到 TypeScript 项目')
    return LibraryType.TYPESCRIPT
  }

  /**
   * 检查是否有 Vue 文件
   */
  private async hasVueFiles(): Promise<boolean> {
    try {
      const srcPath = path.join(this.projectPath, 'src')
      const files = await this.findVueFiles(srcPath)
      this.logger.debug(`在 ${srcPath} 中找到 ${files.length} 个 Vue 文件: ${files.join(', ')}`)
      return files.length > 0
    } catch (error) {
      this.logger.warn(`检查 Vue 文件时出错: ${error}`)
      return false
    }
  }

  /**
   * 递归查找 Vue 文件
   */
  private async findVueFiles(dir: string): Promise<string[]> {
    const vueFiles: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory() && entry.name !== 'node_modules') {
          const subFiles = await this.findVueFiles(fullPath)
          vueFiles.push(...subFiles)
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
          vueFiles.push(fullPath)
        }
      }
    } catch {
      // 忽略错误
    }

    return vueFiles
  }

  /**
   * 生成 external 配置
   */
  private generateExternal(): string[] {
    if (!this.packageInfo) {
      return []
    }

    const external: string[] = []

    // 添加 peerDependencies
    if (this.packageInfo.peerDependencies) {
      external.push(...Object.keys(this.packageInfo.peerDependencies))
    }

    // 添加常见的外部依赖
    if (this.packageInfo.dependencies) {
      const deps = Object.keys(this.packageInfo.dependencies)
      const commonExternals = ['vue', 'react', 'react-dom', 'lodash', 'lodash-es', 'moment', 'dayjs']

      for (const dep of deps) {
        if (commonExternals.includes(dep)) {
          external.push(dep)
        }
      }
    }

    // 静默处理，不输出日志
    return [...new Set(external)] // 去重
  }

  /**
   * 生成 globals 配置
   */
  private generateGlobals(external: string[] | ((id: string) => boolean) | undefined): Record<string, string> {
    if (!external || typeof external === 'function') {
      return {}
    }

    const globals: Record<string, string> = {}

    for (const dep of external) {
      // 只处理字符串
      if (typeof dep !== 'string') {
        continue
      }

      if (KNOWN_GLOBALS[dep]) {
        globals[dep] = KNOWN_GLOBALS[dep]
      } else {
        // 生成驼峰命名的全局变量名
        globals[dep] = this.toPascalCase(dep)
      }
    }

    // 静默处理，不输出日志
    return globals
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(name: string): string {
    // 移除作用域前缀
    const base = name.replace(/^@[^/]+\//, '')

    return base
      .split(/[\/-]/)
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')
  }

  /**
   * 添加 Vue 插件
   */
  private async addVuePlugin(plugins: any[], libraryType: LibraryType): Promise<any[]> {
    // 检查是否已经有 Vue 插件
    const hasVuePlugin = plugins.some(plugin =>
      plugin && (
        plugin.name === 'vue' ||
        plugin.name === 'rollup-plugin-vue' ||
        (typeof plugin === 'function' && plugin.toString().includes('vue'))
      )
    )

    if (hasVuePlugin) {
      // 静默处理
      return plugins
    }

    try {
      // 动态导入 Vue 插件
      const { default: vue } = await import('rollup-plugin-vue')

      const vuePlugin = vue({
        target: 'browser',
        compileTemplate: true,
        ...(libraryType === LibraryType.VUE2 ? { version: 2 } : {})
      } as any)

      // 静默处理
      return [vuePlugin, ...plugins]
    } catch (error) {
      this.logger.warn('无法加载 Vue 插件，请手动安装 rollup-plugin-vue')
      return plugins
    }
  }

  /**
   * 生成默认的排除配置
   */
  private generateDefaultExcludes(): string[] {
    return [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**',
      '**/examples/**',
      '**/demo/**',
      '**/demos/**',
      '**/*.stories.ts',
      '**/*.stories.tsx'
    ]
  }

  /**
   * 加载 tsconfig.json
   */
  private async loadTsconfig(): Promise<void> {
    try {
      const tsconfigPath = path.join(this.projectPath, 'tsconfig.json')
      const content = await fs.readFile(tsconfigPath, 'utf-8')
      // 移除 JSON 注释
      const cleanedContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      this.tsconfigInfo = JSON.parse(cleanedContent)
    } catch (error) {
      this.logger.debug('无法读取 tsconfig.json')
      this.tsconfigInfo = undefined
    }
  }

  /**
   * 自动检测入口文件
   */
  private async detectEntryFile(): Promise<string> {
    const possibleEntries = [
      'src/index.ts',
      'src/index.tsx',
      'src/index.js',
      'src/index.jsx',
      'src/index.vue',
      'src/main.ts',
      'src/main.js',
      'index.ts',
      'index.js',
      'lib/index.ts',
      'lib/index.js'
    ]

    for (const entry of possibleEntries) {
      const fullPath = path.join(this.projectPath, entry)
      try {
        await fs.access(fullPath)
        this.logger.info(`自动检测到入口文件: ${entry}`)
        return entry
      } catch {
        // 继续查找
      }
    }

    // 默认返回
    return 'src/index.ts'
  }

  /**
   * 推断输出格式
   */
  private async inferOutputFormats(libraryType?: LibraryType): Promise<any> {
    const packageJson = this.packageInfo

    // 根据 package.json 的 type 字段判断
    const isEsModule = packageJson?.type === 'module'

    // 判断是否是组件库
    const isComponentLib = libraryType && [
      LibraryType.VUE2,
      LibraryType.VUE3,
      LibraryType.REACT,
      LibraryType.SVELTE,
      LibraryType.SOLID,
      LibraryType.PREACT,
      LibraryType.LIT
    ].includes(libraryType as LibraryType)

    // 判断是否有 bin 字段（CLI 工具）
    const isCli = !!packageJson?.bin

    // CLI 工具通常只需要 CJS 格式
    if (isCli) {
      return {
        format: ['cjs'],
        cjs: {
          dir: 'lib',
          format: 'cjs',
          preserveStructure: false,
          dts: true
        }
      }
    }

    // 组件库通常需要 ESM + CJS + UMD
    if (isComponentLib) {
      return {
        format: ['esm', 'cjs', 'umd'],
        esm: {
          dir: 'es',
          format: 'esm',
          preserveStructure: true,
          dts: true
        },
        cjs: {
          dir: 'lib',
          format: 'cjs',
          preserveStructure: true,
          dts: true
        },
        umd: {
          dir: 'dist',
          format: 'umd',
          minify: true,
          sourcemap: true
        }
      }
    }

    // 普通库：ESM + CJS
    return {
      format: ['esm', 'cjs'],
      esm: {
        dir: 'es',
        format: 'esm',
        preserveStructure: true,
        dts: true
      },
      cjs: {
        dir: 'lib',
        format: 'cjs',
        preserveStructure: true,
        dts: true
      }
    }
  }

  /**
   * 生成 UMD 名称
   */
  private generateUmdName(): string {
    if (!this.packageInfo?.name) {
      return 'MyLibrary'
    }

    let name = this.packageInfo.name

    // 移除 scope
    name = name.replace(/^@[^/]+\//, '')

    // 转换为 PascalCase
    return this.toPascalCase(name)
  }

  /**
   * 增强 TypeScript 配置
   */
  private enhanceTypescriptConfig(tsConfig: any): any {
    const enhanced = { ...tsConfig }

    if (this.tsconfigInfo?.compilerOptions) {
      const compilerOptions = this.tsconfigInfo.compilerOptions

      // 如果 tsconfig 指定了 target，使用它
      if (compilerOptions.target && !enhanced.target) {
        enhanced.target = compilerOptions.target
      }

      // 如果 tsconfig 指定了 module，使用它
      if (compilerOptions.module && !enhanced.module) {
        enhanced.module = compilerOptions.module
      }

      // 如果 tsconfig 启用了 strict，确保我们的配置也使用 strict
      if (compilerOptions.strict !== undefined && enhanced.strict === undefined) {
        enhanced.strict = compilerOptions.strict
      }
    }

    return enhanced
  }
}

/**
 * 创建自动配置增强器
 */
export function createAutoConfigEnhancer(projectPath: string, logger?: Logger): AutoConfigEnhancer {
  return new AutoConfigEnhancer(projectPath, logger)
}
