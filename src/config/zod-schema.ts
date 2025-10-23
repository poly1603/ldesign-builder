/**
 * Zod Schema 配置验证
 * 
 * 使用 Zod 提供类型安全的配置验证
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 动态导入 zod（可选依赖）
let zodInstance: any | null = null

try {
  zodInstance = require('zod').z
} catch {
  console.warn('[Config] Zod 未安装，跳过高级配置验证')
}

// 空的 schema fallback
const emptySchema: any = {
  safeParse: () => ({ success: true, data: {} })
}

// 类型定义（总是导出）
export type InferredBuilderConfig = any

// 如果 Zod 可用，创建真正的 schema 和验证函数
let BuilderConfigSchemaImpl: any = emptySchema
let validateConfigImpl: any
let formatZodErrorsImpl: any
let getConfigDefaultsImpl: any
let mergeConfigWithValidationImpl: any

if (zodInstance) {
  const z = zodInstance

  /**
   * 输出格式 Schema
   */
  const OutputFormatSchema = z.enum(['esm', 'cjs', 'umd', 'iife', 'es', 'commonjs'])

  /**
   * Sourcemap 类型 Schema
   */
  const SourcemapTypeSchema = z.union([
    z.boolean(),
    z.enum(['inline', 'hidden', 'external'])
  ])

  /**
   * 构建模式 Schema
   */
  const BuildModeSchema = z.enum(['development', 'production', 'test'])

  /**
   * 打包器类型 Schema
   */
  const BundlerTypeSchema = z.enum(['rollup', 'rolldown', 'esbuild', 'swc'])

  /**
   * 库类型 Schema
   */
  const LibraryTypeSchema = z.enum([
    'typescript',
    'javascript',
    'vue2',
    'vue3',
    'react',
    'svelte',
    'solid',
    'preact',
    'lit',
    'angular',
    'qwik',
    'style',
    'mixed'
  ])

  /**
   * 单个输出配置 Schema
   */
  const SingleOutputSchema = z.object({
    dir: z.string().optional(),
    format: OutputFormatSchema.optional(),
    preserveStructure: z.boolean().optional(),
    dts: z.boolean().optional(),
    sourcemap: SourcemapTypeSchema.optional(),
    minify: z.boolean().optional(),
    name: z.string().optional(),
    input: z.union([
      z.string(),
      z.array(z.string()),
      z.record(z.string())
    ]).optional()
  })

  /**
   * 输出配置 Schema（支持多种格式）
   */
  const OutputConfigSchema = z.union([
    // 单一输出配置
    SingleOutputSchema,
    // 多格式输出配置
    z.object({
      esm: SingleOutputSchema.optional(),
      cjs: SingleOutputSchema.optional(),
      umd: SingleOutputSchema.optional(),
      iife: SingleOutputSchema.optional()
    })
  ])

  /**
   * TypeScript 配置 Schema
   */
  const TypeScriptConfigSchema = z.object({
    declaration: z.boolean().optional(),
    declarationMap: z.boolean().optional(),
    target: z.string().optional(),
    module: z.string().optional(),
    isolatedDeclarations: z.boolean().optional(),
    skipLibCheck: z.boolean().optional(),
    experimentalDecorators: z.boolean().optional(),
    emitDecoratorMetadata: z.boolean().optional()
  }).optional()

  /**
   * Vue 配置 Schema
   */
  const VueConfigSchema = z.object({
    version: z.union([z.literal(2), z.literal(3)]).optional(),
    onDemand: z.boolean().optional(),
    jsx: z.object({
      enabled: z.boolean().optional()
    }).optional(),
    template: z.object({
      precompile: z.boolean().optional()
    }).optional()
  }).optional()

  /**
   * 样式配置 Schema
   */
  const StyleConfigSchema = z.object({
    extract: z.boolean().optional(),
    minimize: z.boolean().optional(),
    autoprefixer: z.boolean().optional(),
    modules: z.boolean().optional()
  }).optional()

  /**
   * 压缩选项 Schema
   */
  const MinifyOptionsSchema = z.union([
    z.boolean(),
    z.object({
      terser: z.any().optional(),
      esbuild: z.any().optional(),
      swc: z.any().optional()
    })
  ])

  /**
   * 性能配置 Schema
   */
  const PerformanceConfigSchema = z.object({
    incremental: z.boolean().optional(),
    parallel: z.union([
      z.boolean(),
      z.object({
        enabled: z.boolean().optional(),
        maxConcurrency: z.number().int().positive().optional()
      })
    ]).optional(),
    cache: z.union([
      z.boolean(),
      z.object({
        enabled: z.boolean().optional(),
        cacheDir: z.string().optional(),
        ttl: z.number().positive().optional(),
        maxSize: z.number().positive().optional()
      })
    ]).optional(),
    streamProcessing: z.boolean().optional()
  }).optional()

  /**
   * 打包后验证配置 Schema
   */
  const PostBuildValidationSchema = z.object({
    enabled: z.boolean().optional(),
    failOnError: z.boolean().optional(),
    rules: z.array(z.string()).optional()
  }).optional()

  /**
   * Package.json 自动更新配置 Schema
   */
  const PackageUpdateConfigSchema = z.object({
    enabled: z.boolean().optional(),
    srcDir: z.string().optional(),
    outputDirs: z.object({
      esm: z.string().optional(),
      cjs: z.string().optional(),
      umd: z.string().optional(),
      types: z.string().optional()
    }).optional(),
    autoExports: z.boolean().optional(),
    updateEntryPoints: z.boolean().optional(),
    updateFiles: z.boolean().optional(),
    customExports: z.record(z.any()).optional()
  }).optional()

  /**
   * 主配置 Schema
   */
  BuilderConfigSchemaImpl = z.object({
    // 基础配置
    input: z.union([
      z.string(),
      z.array(z.string()),
      z.record(z.string())
    ]).optional(),

    output: OutputConfigSchema.optional(),

    dts: z.boolean().optional(),
    sourcemap: SourcemapTypeSchema.optional(),

    bundler: BundlerTypeSchema.optional(),
    mode: BuildModeSchema.optional(),
    libraryType: LibraryTypeSchema.optional(),
    bundleless: z.boolean().optional(),

    // 依赖配置
    external: z.union([
      z.array(z.string()),
      z.function()
    ]).optional(),

    globals: z.record(z.string()).optional(),
    exclude: z.array(z.string()).optional(),

    // 插件和转换
    plugins: z.array(z.any()).optional(),
    minify: MinifyOptionsSchema.optional(),

    // UMD 配置
    umd: z.object({
      enabled: z.boolean().optional(),
      entry: z.string().optional(),
      name: z.string().optional(),
      forceMultiEntry: z.boolean().optional(),
      fileName: z.string().optional(),
      globals: z.record(z.string()).optional(),
      minify: z.boolean().optional()
    }).optional(),

    // Babel 配置
    babel: z.object({
      enabled: z.boolean().optional(),
      presets: z.array(z.any()).optional(),
      plugins: z.array(z.any()).optional(),
      targets: z.union([
        z.string(),
        z.array(z.string()),
        z.record(z.string())
      ]).optional(),
      polyfill: z.union([
        z.boolean(),
        z.enum(['usage', 'entry'])
      ]).optional(),
      runtime: z.boolean().optional(),
      configFile: z.union([z.string(), z.literal(false)]).optional(),
      babelrc: z.boolean().optional()
    }).optional(),

    // Banner 配置
    banner: z.object({
      banner: z.union([z.string(), z.function()]).optional(),
      footer: z.union([z.string(), z.function()]).optional(),
      intro: z.union([z.string(), z.function()]).optional(),
      outro: z.union([z.string(), z.function()]).optional(),
      copyright: z.union([
        z.boolean(),
        z.object({
          owner: z.string().optional(),
          year: z.union([z.string(), z.number()]).optional(),
          license: z.string().optional(),
          template: z.string().optional()
        })
      ]).optional(),
      buildInfo: z.union([
        z.boolean(),
        z.object({
          version: z.boolean().optional(),
          buildTime: z.boolean().optional(),
          environment: z.boolean().optional(),
          git: z.boolean().optional(),
          template: z.string().optional()
        })
      ]).optional()
    }).optional(),

    clean: z.boolean().optional(),

    // 框架特定配置
    typescript: TypeScriptConfigSchema,
    vue: VueConfigSchema,
    vueJsx: z.any().optional(),
    style: StyleConfigSchema,
    qwik: z.any().optional(),

    // 性能和优化
    performance: PerformanceConfigSchema,

    debug: z.boolean().optional(),

    // 环境配置
    env: z.record(z.any()).optional(),
    cache: z.union([
      z.boolean(),
      z.object({
        enabled: z.boolean().optional(),
        cacheDir: z.string().optional()
      })
    ]).optional(),

    watch: z.object({
      enabled: z.boolean().optional(),
      patterns: z.array(z.string()).optional()
    }).optional(),

    define: z.record(z.any()).optional(),
    cwd: z.string().optional(),
    configFile: z.string().optional(),
    logLevel: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'verbose']).optional(),

    library: z.any().optional(),
    postBuildValidation: PostBuildValidationSchema,
    packageUpdate: PackageUpdateConfigSchema
  })

  /**
   * 验证配置
   */
  validateConfigImpl = function (config: unknown): {
    success: boolean
    data?: InferredBuilderConfig
    errors?: any
  } {
    try {
      const result = BuilderConfigSchemaImpl.safeParse(config)

      if (result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          errors: result.error
        }
      }
    } catch (error) {
      return {
        success: false,
        errors: error as any
      }
    }
  }

  /**
   * 格式化 Zod 错误
   */
  formatZodErrorsImpl = function (errors: any): string[] {
    return errors.errors.map((err: any) => {
      const path = err.path.join('.')
      return `${path ? `[${path}] ` : ''}${err.message}`
    })
  }

  /**
   * 获取配置默认值
   */
  getConfigDefaultsImpl = function (): Partial<InferredBuilderConfig> {
    return {
      bundler: 'rollup',
      mode: 'production',
      dts: true,
      sourcemap: true,
      clean: true,
      minify: false,
      bundleless: false,
      debug: false,
      logLevel: 'info'
    }
  }

  /**
   * 合并配置（带验证）
   */
  mergeConfigWithValidationImpl = function (
    base: unknown,
    override: unknown
  ): {
    success: boolean
    data?: InferredBuilderConfig
    errors?: string[]
  } {
    const merged = {
      ...(base as any),
      ...(override as any)
    }

    const result = validateConfigImpl(merged)

    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        errors: result.errors ? formatZodErrorsImpl(result.errors) : ['未知验证错误']
      }
    }
  }
} else {
  // Zod 不可用时的 fallback 实现
  validateConfigImpl = (config: unknown) => ({ success: true, data: config })
  formatZodErrorsImpl = (errors: any) => []
  getConfigDefaultsImpl = () => ({})
  mergeConfigWithValidationImpl = (base: unknown, override: unknown) => ({
    success: true,
    data: { ...base as any, ...override as any }
  })
}

// 导出
export const BuilderConfigSchema = BuilderConfigSchemaImpl
export const validateConfig = validateConfigImpl
export const formatZodErrors = formatZodErrorsImpl
export const getConfigDefaults = getConfigDefaultsImpl
export const mergeConfigWithValidation = mergeConfigWithValidationImpl
