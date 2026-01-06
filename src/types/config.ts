/**
 * 配置相关类型定义
 * 
 * @description 提供构建器的核心配置接口定义，支持多种构建场景
 * @author LDesign Team
 * @version 1.0.0
 * @module types/config
 */

import type {
  LogLevel,
  BuildMode,
  FilePath,
  ValidationResult,
  ConfigSchema,
  CacheOptions,
  WatchOptions,
  EnvironmentVariables,
  KeyValueMap
} from './common'
import type { ExternalOption } from './adapter'
import type { BundlerType } from './bundler'
import type {
  LibraryType,
  TypeScriptLibraryConfig,
  VueLibraryConfig,
  VueJsxConfig,
  StyleLibraryConfig,
  LibraryBuildOptions
} from './library'
import type { OutputConfig, SourcemapType } from './output'
import type { PerformanceConfig } from './performance'
import type { UnifiedPlugin } from './plugin'
import type { PostBuildValidationConfig } from './validation'
import type { MinifyOptions } from './minify'
import type { MixedFrameworkConfig } from '../strategies/mixed/MixedFrameworkStrategy'

/**
 * 构建器主配置接口
 */
export interface BuilderConfig {
  /** 项目/库名称 */
  name?: string

  /** 入口文件（可选；未提供时将根据策略自动发现或使用默认值） */
  input?: string | string[] | Record<string, string>

  /** 入口文件别名（与 input 相同，更符合其他工具习惯） */
  entry?: string | string[] | Record<string, string>

  /** 路径别名 */
  alias?: Record<string, string>

  /** 输出配置 */
  output?: OutputConfig

  /** 输出目录（简化配置，等同于 output.dir）
   * @example 'dist'
   */
  outDir?: string

  /** 输出格式（简化配置，等同于 output.format）
   * @example ['esm', 'cjs', 'umd']
   */
  formats?: ('esm' | 'cjs' | 'umd' | 'iife')[]

  /** 是否生成类型声明文件（顶层开关，具体格式可覆盖） */
  dts?: boolean

  /** 是否生成 sourcemap（顶层开关，具体格式可覆盖） */
  sourcemap?: SourcemapType

  /** 构建目标（ES 版本或运行时版本）
   * @example 'es2020', 'esnext', 'node16', 'chrome90'
   */
  target?: string | string[]

  /** 打包核心选择 */
  bundler?: BundlerType

  /** 构建模式 */
  mode?: BuildMode

  /** 库类型（自动检测或手动指定） */
  libraryType?: LibraryType

  /** 是否启用 bundleless 模式 */
  bundleless?: boolean

  /** 保持模块结构（bundleless 别名，更直观）
   * @description 启用后每个源文件单独编译，不进行打包合并
   */
  preserveModules?: boolean

  /** 代码分割
   * @description 启用后会自动分割代码，生成多个 chunk
   */
  splitting?: boolean

  /** Tree Shaking（简化配置）
   * @description 启用后会移除未使用的代码
   */
  treeshake?: boolean | {
    /** 模块副作用配置 */
    moduleSideEffects?: boolean | 'no-external' | string[] | ((id: string) => boolean | null | undefined)
    /** 是否优化属性访问 */
    propertyReadSideEffects?: boolean | 'always'
    /** 是否优化注解 */
    annotations?: boolean
  }

  /** 外部依赖 */
  external?: ExternalOption

  /** 全局变量映射 */
  globals?: Record<string, string>

  /** 排除的文件模式 */
  exclude?: string[]

  /** 插件配置 */
  plugins?: UnifiedPlugin[]

  /** 压缩配置 */
  minify?: boolean | MinifyOptions

  /** UMD 构建配置 */
  umd?: UMDConfig

  /** Babel 转换配置 */
  babel?: BabelConfig

  /** Banner 和 Footer 配置 */
  banner?: BannerConfig

  /** 是否清理输出目录 */
  clean?: boolean

  /** TypeScript 配置 */
  typescript?: TypeScriptLibraryConfig

  /** Vue 配置 */
  vue?: VueLibraryConfig

  /** Vue JSX 配置 */
  vueJsx?: VueJsxConfig

  /** 样式配置 */
  style?: StyleLibraryConfig

  /** Qwik 配置 */
  qwik?: import('./library').QwikLibraryConfig

  /** 性能配置 */
  performance?: PerformanceConfig

  /** 调试配置 */
  debug?: boolean

  /** 环境特定配置 */
  env?: Record<string, Partial<BuilderConfig>>

  /** 缓存配置 */
  cache?: CacheOptions

  /** 监听配置 */
  watch?: WatchOptions

  /** 自定义环境变量 */
  define?: EnvironmentVariables

  /** 工作目录 */
  cwd?: FilePath

  /** 项目路径 */
  projectPath?: FilePath

  /** 目标平台 */
  platform?: 'browser' | 'node' | 'neutral'

  /** 配置文件路径 */
  configFile?: FilePath

  /** 日志级别 */
  logLevel?: LogLevel

  /** 库构建选项 */
  library?: LibraryBuildOptions

  /** 打包后验证配置 */
  postBuildValidation?: PostBuildValidationConfig

  /** Package.json 自动更新配置 */
  packageUpdate?: PackageUpdateConfig

  /** 混合框架配置 */
  mixedFramework?: MixedFrameworkConfig

  /** 自动检测框架 */
  autoDetectFramework?: boolean

  /** React 配置 */
  react?: {
    /** JSX 转换模式 */
    jsx?: 'classic' | 'automatic'
    /** JSX 导入源 */
    jsxImportSource?: string
    /** 运行时模式 */
    runtime?: 'automatic' | 'classic'
    /** React 刷新插件（开发模式） */
    refresh?: boolean
  }

  /** 优化配置 */
  optimization?: {
    /** 代码分割 */
    splitChunks?: boolean
    /** 最小化体积 */
    minimize?: boolean
    /** Tree Shaking */
    treeShaking?: boolean
    /** 公共依赖提取 */
    commonChunks?: boolean
    /** 作用域提升（Rollup scope hoisting） */
    scopeHoisting?: boolean
    /** 死代码消除 */
    deadCodeElimination?: boolean
    /** 常量折叠 */
    constantFolding?: boolean
  }

  /** 构建生命周期钩子 */
  hooks?: BuildHooksConfig

  /** 高级构建选项 */
  advanced?: AdvancedBuildOptions

  // ==================== 简化配置（常用快捷方式） ====================

  /** JSX 处理模式（简化配置）
   * @example 'react', 'vue', 'preserve', 'react-jsx'
   */
  jsx?: 'react' | 'vue' | 'preserve' | 'react-jsx' | 'react-jsxdev'

  /** JSX 工厂函数
   * @example 'React.createElement', 'h'
   */
  jsxFactory?: string

  /** JSX Fragment
   * @example 'React.Fragment', 'Fragment'
   */
  jsxFragment?: string

  /** ESM/CJS 互操作垫片
   * @description 启用后会自动添加 __dirname, __filename, require 等 shims
   */
  shims?: boolean

  /** 静态文件复制配置 */
  copy?: CopyPattern[]

  /** 资产处理配置 */
  assets?: {
    /** 内联大小阈值（字节），小于此值的资产会被内联为 base64 */
    inlineLimit?: number
    /** 资产输出目录 */
    outDir?: string
    /** 文件名模式 */
    fileNames?: string
  }

  /** 代码注入（头部）
   * @description 在每个输出文件头部添加的代码或注释
   * @example '/* eslint-disable *\/'
   */
  inject?: string | string[]

  /** 替换配置（编译时常量替换）
   * @example { 'process.env.NODE_ENV': '"production"' }
   */
  replace?: Record<string, string>
}

/**
 * 复制文件模式
 */
export interface CopyPattern {
  /** 源文件或目录（支持 glob） */
  from: string
  /** 目标目录 */
  to?: string
  /** 是否扁平化（不保留目录结构） */
  flatten?: boolean
  /** 排除模式 */
  exclude?: string[]
}

/**
 * 配置管理器选项
 */
export interface ConfigManagerOptions {
  /** 配置文件路径 */
  configFile?: string

  /** 是否监听配置文件变化 */
  watch?: boolean

  /** 配置验证模式 */
  schema?: ConfigSchema

  /** 是否在加载时验证 */
  validateOnLoad?: boolean

  /** 是否冻结配置 */
  freezeConfig?: boolean

  /** 日志记录器 */
  logger?: any

  /** 缓存目录 */
  cacheDir?: string

  /** 环境变量前缀 */
  envPrefix?: string
}

/**
 * 配置加载选项
 */
export interface ConfigLoadOptions {
  /** 配置文件路径 */
  configFile?: string

  /** 是否合并环境变量 */
  mergeEnv?: boolean

  /** 是否应用环境特定配置 */
  applyEnvConfig?: boolean

  /** 是否验证配置 */
  validate?: boolean

  /** 是否使用缓存 */
  useCache?: boolean

  /** 是否自动增强配置（自动检测 libraryType、external、globals 等） */
  autoEnhance?: boolean
}

/**
 * 配置合并选项
 */
export interface ConfigMergeOptions {
  /** 是否深度合并 */
  deep?: boolean

  /** 数组合并策略 */
  arrayMergeStrategy?: 'replace' | 'concat' | 'unique'

  /** 是否合并函数 */
  mergeFunctions?: boolean

  /** 自定义合并函数 */
  customMerger?: (target: any, source: any, key: string) => any
}

/**
 * 配置转换选项
 */
export interface ConfigTransformOptions {
  /** 目标格式 */
  target: 'rollup' | 'rolldown'

  /** 是否保留未知选项 */
  preserveUnknown?: boolean

  /** 是否启用兼容模式 */
  compatMode?: boolean

  /** 自定义转换器 */
  customTransformers?: Record<string, (value: any) => any>
}

/**
 * 配置验证选项
 */
export interface ConfigValidationOptions {
  /** 验证模式 */
  schema?: ConfigSchema

  /** 是否允许额外属性 */
  allowAdditionalProperties?: boolean

  /** 是否启用严格模式 */
  strict?: boolean

  /** 自定义验证器 */
  customValidators?: Record<string, (value: any) => ValidationResult>
}

/**
 * 配置文件类型
 */
export type ConfigFileType = 'ts' | 'js' | 'mjs' | 'json'

/**
 * 配置文件信息
 */
export interface ConfigFileInfo {
  /** 文件路径 */
  path: string

  /** 文件类型 */
  type: ConfigFileType

  /** 是否存在 */
  exists: boolean

  /** 最后修改时间 */
  mtime?: Date

  /** 文件大小 */
  size?: number
}

/**
 * 配置变化回调
 */
export type ConfigChangeCallback = (config: BuilderConfig, configPath: string) => Promise<void> | void

/**
 * 配置预设
 */
export interface ConfigPreset {
  /** 预设名称 */
  name: string

  /** 预设描述 */
  description?: string

  /** 预设配置 */
  config: Partial<BuilderConfig>

  /** 适用条件 */
  condition?: (projectInfo: any) => boolean

  /** 扩展的预设 */
  extends?: string[]
}

/**
 * 配置上下文
 */
export interface ConfigContext {
  /** 当前工作目录 */
  cwd: string

  /** 构建模式 */
  mode: BuildMode

  /** 打包器类型 */
  bundler: 'rollup' | 'rolldown'

  /** 环境变量 */
  env: EnvironmentVariables

  /** 命令行参数 */
  args: KeyValueMap

  /** 项目信息 */
  project?: any
}

/**
 * 配置函数类型
 */
export type ConfigFunction = (context: ConfigContext) => BuilderConfig | Promise<BuilderConfig>

/**
 * 配置定义类型
 */
export type ConfigDefinition = BuilderConfig | ConfigFunction

/**
 * 默认配置
 */
export interface DefaultConfig extends Required<Omit<BuilderConfig, 'env' | 'library'>> {
  env: Record<string, Partial<BuilderConfig>>
  library: Required<LibraryBuildOptions>
}

/**
 * 配置覆盖
 */
export type ConfigOverride = DeepPartial<BuilderConfig>

/**
 * 配置解析结果
 */
export interface ConfigResolveResult {
  /** 解析后的配置 */
  config: BuilderConfig

  /** 配置文件路径 */
  configFile?: string

  /** 配置来源 */
  sources: ConfigSource[]

  /** 验证结果 */
  validation?: ValidationResult
}

/**
 * 配置来源
 */
export interface ConfigSource {
  /** 来源类型 */
  type: 'default' | 'file' | 'env' | 'cli' | 'preset'

  /** 来源路径或名称 */
  source: string

  /** 优先级 */
  priority: number

  /** 配置内容 */
  config: Partial<BuilderConfig>
}

/**
 * UMD 构建配置
 */
export interface UMDConfig {
  /** 是否启用 UMD 构建 */
  enabled?: boolean

  /** UMD 入口文件（默认为 src/index.ts） */
  entry?: string

  /** UMD 全局变量名 */
  name?: string

  /** 是否为多入口项目强制生成 UMD */
  forceMultiEntry?: boolean

  /** UMD 输出文件名 */
  fileName?: string

  /** 外部依赖的全局变量映射 */
  globals?: Record<string, string>

  /** 是否压缩 UMD 文件 */
  minify?: boolean
}

/**
 * Babel 转换配置
 */
export interface BabelConfig {
  /** 是否启用 Babel 转换 */
  enabled?: boolean

  /** Babel 预设 */
  presets?: Array<string | [string, any]>

  /** Babel 插件 */
  plugins?: Array<string | [string, any]>

  /** 目标浏览器 */
  targets?: string | string[] | Record<string, string>

  /** 是否包含 polyfill */
  polyfill?: boolean | 'usage' | 'entry'

  /** 是否启用运行时转换 */
  runtime?: boolean

  /** 自定义 Babel 配置文件路径 */
  configFile?: string | false

  /** 是否忽略 .babelrc 文件 */
  babelrc?: boolean

  /** 排除转换的文件模式 */
  exclude?: string | RegExp | Array<string | RegExp>

  /** 包含转换的文件模式 */
  include?: string | RegExp | Array<string | RegExp>
}

/**
 * Banner 和 Footer 配置
 */
export interface BannerConfig {
  /** 代码前缀（banner） */
  banner?: string | (() => string | Promise<string>)

  /** 代码后缀（footer） */
  footer?: string | (() => string | Promise<string>)

  /** 模块前缀（intro） */
  intro?: string | (() => string | Promise<string>)

  /** 模块后缀（outro） */
  outro?: string | (() => string | Promise<string>)

  /** 是否自动生成版权信息 */
  copyright?: boolean | CopyrightConfig

  /** 是否包含构建信息 */
  buildInfo?: boolean | BuildInfoConfig
}

/**
 * 版权信息配置
 */
export interface CopyrightConfig {
  /** 版权所有者 */
  owner?: string

  /** 版权年份 */
  year?: string | number

  /** 许可证类型 */
  license?: string

  /** 自定义版权模板 */
  template?: string
}

/**
 * 构建信息配置
 */
export interface BuildInfoConfig {
  /** 是否包含版本号 */
  version?: boolean

  /** 是否包含构建时间 */
  buildTime?: boolean

  /** 是否包含构建环境 */
  environment?: boolean

  /** 是否包含 Git 信息 */
  git?: boolean

  /** 自定义构建信息模板 */
  template?: string
}

/**
 * Package.json 自动更新配置
 */
export interface PackageUpdateConfig {
  /** 是否启用 package.json 自动更新 */
  enabled?: boolean

  /** 源码目录，默认为 'src' */
  srcDir?: string

  /** 输出目录配置 */
  outputDirs?: {
    /** ESM 输出目录，默认为 'es' */
    esm?: string
    /** CJS 输出目录，默认为 'lib' */
    cjs?: string
    /** UMD 输出目录，默认为 'dist' */
    umd?: string
    /** 类型声明目录，默认为 'types' 或与 esm 相同 */
    types?: string
  }

  /** 是否启用自动 exports 生成，默认为 true */
  autoExports?: boolean

  /** 是否更新 main/module/types 字段，默认为 true */
  updateEntryPoints?: boolean

  /** 是否更新 files 字段，默认为 true */
  updateFiles?: boolean

  /** 自定义 exports 配置 */
  customExports?: Record<string, any>
}

/**
 * 构建生命周期钩子配置
 * 
 * @description 提供构建过程各阶段的钩子函数，用于扩展和自定义构建行为
 * @example
 * ```typescript
 * export default defineConfig({
 *   hooks: {
 *     beforeBuild: async (ctx) => {
 *       console.log('构建开始:', ctx.buildId)
 *     },
 *     afterBuild: async (ctx, result) => {
 *       console.log('构建完成:', result.duration, 'ms')
 *     }
 *   }
 * })
 * ```
 */
export interface BuildHooksConfig {
  /**
   * 构建开始前钩子
   * 
   * @description 在构建开始前调用，可用于准备工作、验证配置等
   * @param context - 构建上下文
   * @returns void 或 Promise<void>
   */
  beforeBuild?: (context: BuildHookContext) => void | Promise<void>

  /**
   * 构建完成后钩子
   * 
   * @description 在构建成功完成后调用，可用于后处理、报告生成等
   * @param context - 构建上下文
   * @param result - 构建结果
   * @returns void 或 Promise<void>
   */
  afterBuild?: (context: BuildHookContext, result: BuildHookResult) => void | Promise<void>

  /**
   * 构建错误钩子
   * 
   * @description 在构建出错时调用，可用于错误恢复、日志记录等
   * @param context - 构建上下文
   * @param error - 错误信息
   * @returns void 或 Promise<void>
   */
  onError?: (context: BuildHookContext, error: Error) => void | Promise<void>

  /**
   * 文件处理前钩子
   * 
   * @description 在处理每个文件前调用，可用于文件过滤、预处理等
   * @param filePath - 文件路径
   * @param content - 文件内容
   * @returns 返回处理后的内容，或 null 跳过此文件
   */
  transformFile?: (filePath: string, content: string) => string | null | Promise<string | null>

  /**
   * 结果输出前钩子
   * 
   * @description 在写入输出文件前调用，可用于输出内容修改
   * @param output - 输出配置
   * @param content - 输出内容
   * @returns 返回修改后的内容
   */
  beforeWrite?: (output: { path: string; format: string }, content: string) => string | Promise<string>

  /**
   * 监听模式文件变化钩子
   * 
   * @description 在监听模式下检测到文件变化时调用
   * @param event - 变化事件类型
   * @param path - 文件路径
   */
  onWatchChange?: (event: 'add' | 'change' | 'unlink', path: string) => void | Promise<void>

  /**
   * 清理钩子
   * 
   * @description 在构建器销毁时调用，用于资源清理
   */
  cleanup?: () => void | Promise<void>
}

/**
 * 构建钩子上下文
 */
export interface BuildHookContext {
  /** 构建 ID */
  buildId: string
  /** 配置 */
  config: BuilderConfig
  /** 工作目录 */
  cwd: string
  /** 构建模式 */
  mode: BuildMode
  /** 打包器类型 */
  bundler: string
  /** 库类型 */
  libraryType?: string
  /** 开始时间 */
  startTime: number
  /** 日志记录器 */
  logger: any
}

/**
 * 构建钩子结果
 */
export interface BuildHookResult {
  /** 是否成功 */
  success: boolean
  /** 输出文件 */
  outputs: Array<{ path: string; size: number; format: string }>
  /** 耗时（毫秒） */
  duration: number
  /** 警告 */
  warnings: string[]
  /** 错误 */
  errors: string[]
}

/**
 * 高级构建选项
 * 
 * @description 提供高级用户的细粒度控制选项
 */
export interface AdvancedBuildOptions {
  /**
   * 启用并行构建
   * 
   * @description 利用多核 CPU 并行处理文件
   * @default true
   */
  parallel?: boolean | {
    /** Worker 数量，默认为 CPU 核心数 - 1 */
    workers?: number
    /** 每个 Worker 的任务堆栈大小 */
    taskStackSize?: number
  }

  /**
   * 增量构建配置
   * 
   * @description 只重新构建变更的文件，提高构建速度
   */
  incremental?: boolean | {
    /** 缓存目录 */
    cacheDir?: string
    /** 最大缓存大小（字节） */
    maxCacheSize?: number
    /** 缓存 TTL（秒） */
    ttl?: number
  }

  /**
   * 内存优化配置
   * 
   * @description 限制内存使用，防止大项目 OOM
   */
  memory?: {
    /** 最大堆内存（MB） */
    maxHeapSize?: number
    /** 启用 GC 优化 */
    gcOptimization?: boolean
    /** 流式处理阈值（文件大小，字节） */
    streamThreshold?: number
  }

  /**
   * 调试配置
   */
  debug?: {
    /** 打印详细日志 */
    verbose?: boolean
    /** 输出性能报告 */
    profiling?: boolean
    /** 输出中间文件 */
    intermediateFiles?: boolean
    /** 保存 AST 转换结果 */
    saveAst?: boolean
  }

  /**
   * 实验性功能
   * 
   * @description 启用实验性功能，可能不稳定
   */
  experimental?: {
    /** 最小化工具类型 */
    minifier?: 'terser' | 'esbuild' | 'swc'
    /** AST 共享（多输出格式） */
    sharedAst?: boolean
    /** 懒加载插件 */
    lazyPlugins?: boolean
    /** 启用撤回功能 */
    rollback?: boolean
  }

  /**
   * 构建报告配置
   */
  report?: {
    /** 是否生成报告 */
    enabled?: boolean
    /** 报告格式 */
    format?: 'json' | 'html' | 'markdown'
    /** 报告输出路径 */
    output?: string
    /** 是否包含详细性能数据 */
    includePerformance?: boolean
    /** 是否包含 bundle 分析 */
    includeBundleAnalysis?: boolean
  }

  /**
   * 日志配置
   */
  logging?: {
    /** 日志级别 */
    level?: LogLevel
    /** 日志文件路径 */
    file?: string
    /** 是否显示时间戳 */
    timestamps?: boolean
    /** 是否显示颜色 */
    colors?: boolean
  }
}

/**
 * 深度部分类型
 * 
 * @description 将类型 T 的所有属性（包括嵌套属性）变为可选
 * @template T - 源类型
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
