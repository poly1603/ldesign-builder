# RollupAdapter 拆分重构计划

> 📅 创建时间: 2025-11-17  
> 🎯 目标: 将 2082 行的 RollupAdapter.ts 拆分为多个职责单一的模块  
> 📊 当前状态: 规划中

---

## 📋 当前问题

### 文件规模
- **总行数**: 2,082 行
- **公共方法**: 7 个
- **私有方法**: 27 个
- **问题**: 严重违反单一职责原则，难以维护和测试

### 职责混乱
RollupAdapter 类承担了太多职责：
1. 构建执行和监听
2. 配置转换和生成
3. 插件管理和转换
4. Banner/Footer 生成
5. 缓存管理
6. DTS 文件处理
7. 样式文件重组

---

## 🎯 拆分方案

### 模块 1: RollupCacheManager.ts (~200 行)

**职责**: 缓存管理

**包含方法**:
- `isCacheEnabled(config): boolean`
- `validateOutputArtifacts(config): Promise<boolean>`
- `checkSourceFilesModified(config, cachedResult): Promise<boolean>`
- `resolveCacheOptions(config): CacheOptions`

**导出**:
```typescript
export class RollupCacheManager {
  constructor(private logger: Logger)
  
  isCacheEnabled(config: any): boolean
  async validateOutputArtifacts(config: any): Promise<boolean>
  async checkSourceFilesModified(config: any, cachedResult: BuildResult): Promise<boolean>
  resolveCacheOptions(config: any): CacheOptions
}
```

---

### 模块 2: RollupBannerGenerator.ts (~300 行)

**职责**: Banner/Footer/Intro/Outro 生成

**包含方法**:
- `resolveBanner(bannerConfig, config): Promise<string | undefined>`
- `resolveFooter(bannerConfig): Promise<string | undefined>`
- `resolveIntro(bannerConfig): Promise<string | undefined>`
- `resolveOutro(bannerConfig): Promise<string | undefined>`
- `generateCopyright(copyrightConfig): string`
- `generateBuildInfo(buildInfoConfig): Promise<string>`

**导出**:
```typescript
export class RollupBannerGenerator {
  constructor(private logger: Logger)
  
  async resolveBanner(bannerConfig: any, config?: any): Promise<string | undefined>
  async resolveFooter(bannerConfig: any): Promise<string | undefined>
  async resolveIntro(bannerConfig: any): Promise<string | undefined>
  async resolveOutro(bannerConfig: any): Promise<string | undefined>
  generateCopyright(copyrightConfig: any): string
  async generateBuildInfo(buildInfoConfig: any): Promise<string>
}
```

---

### 模块 3: RollupPluginManager.ts (~500 行)

**职责**: 插件管理和转换

**包含方法**:
- `transformPlugins(plugins): Promise<BundlerSpecificPlugin[]>`
- `transformPluginsForFormat(plugins, outputDir, options): Promise<BundlerSpecificPlugin[]>`
- `getBasePlugins(config): Promise<BundlerSpecificPlugin[]>`
- `getBabelPlugin(config): Promise<BundlerSpecificPlugin | null>`
- `getTerserPlugin(): Promise<any>`
- `getAcornPlugins(): Promise<any[]>`
- `wrapPluginWithProgress(plugin, taskName): any`
- `createStyleReorganizePlugin(outputDir): any`
- `createEsmStyleCleanupPlugin(outputDir): any`

**导出**:
```typescript
export class RollupPluginManager {
  constructor(private logger: Logger)
  
  async transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]>
  async transformPluginsForFormat(plugins: any[], outputDir: string, options?: PluginOptions): Promise<BundlerSpecificPlugin[]>
  async getBasePlugins(config: UnifiedConfig): Promise<BundlerSpecificPlugin[]>
  async getBabelPlugin(config: UnifiedConfig): Promise<BundlerSpecificPlugin | null>
  async getTerserPlugin(): Promise<any>
  async getAcornPlugins(): Promise<any[]>
}
```

---

### 模块 4: RollupConfigGenerator.ts (~400 行)

**职责**: Rollup 配置生成

**包含方法**:
- `transformConfig(config): Promise<BundlerSpecificConfig>`
- `createUMDConfig(config, filteredInput): Promise<any[]>`
- `mapFormat(format): string`
- `isMultiEntryBuild(input): boolean`
- `generateUMDName(packageName): string`
- `getOnWarn(config): Function`

**导出**:
```typescript
export class RollupConfigGenerator {
  constructor(
    private logger: Logger,
    private pluginManager: RollupPluginManager,
    private bannerGenerator: RollupBannerGenerator
  )
  
  async transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig>
  async createUMDConfig(config: UnifiedConfig, filteredInput?: string | string[] | Record<string, string>): Promise<any[]>
  mapFormat(format: any): string
  isMultiEntryBuild(input: any): boolean
  generateUMDName(packageName: string): string
}
```

---

### 模块 5: RollupDtsHandler.ts (~150 行)

**职责**: DTS 文件处理

**包含方法**:
- `copyDtsFiles(config): Promise<void>`
- `findDtsFiles(dir): Promise<string[]>`

**导出**:
```typescript
export class RollupDtsHandler {
  constructor(private logger: Logger)
  
  async copyDtsFiles(config: BuilderConfig): Promise<void>
  async findDtsFiles(dir: string): Promise<string[]>
}
```

---

### 模块 6: RollupAdapter.ts (~500 行)

**职责**: 主适配器类，协调各个模块

**保留方法**:
- `constructor(options)`
- `build(config): Promise<BuildResult>`
- `watch(config): Promise<BuildWatcher>`
- `dispose(): Promise<void>`
- `supportsFeature(feature): boolean`
- `getFeatureSupport(): FeatureSupport`
- `getPerformanceMetrics(): PerformanceMetrics`
- `loadRollup(): Promise<any>`

**依赖注入**:
```typescript
export class RollupAdapter implements IBundlerAdapter {
  private cacheManager: RollupCacheManager
  private bannerGenerator: RollupBannerGenerator
  private pluginManager: RollupPluginManager
  private configGenerator: RollupConfigGenerator
  private dtsHandler: RollupDtsHandler
  
  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.cacheManager = new RollupCacheManager(this.logger)
    this.bannerGenerator = new RollupBannerGenerator(this.logger)
    this.pluginManager = new RollupPluginManager(this.logger)
    this.configGenerator = new RollupConfigGenerator(this.logger, this.pluginManager, this.bannerGenerator)
    this.dtsHandler = new RollupDtsHandler(this.logger)
  }
}
```

---

## 📊 拆分后统计

| 模块 | 预计行数 | 职责 |
|------|----------|------|
| RollupCacheManager | ~200 | 缓存管理 |
| RollupBannerGenerator | ~300 | Banner 生成 |
| RollupPluginManager | ~500 | 插件管理 |
| RollupConfigGenerator | ~400 | 配置生成 |
| RollupDtsHandler | ~150 | DTS 处理 |
| RollupAdapter | ~500 | 主适配器 |
| **总计** | **~2,050** | **6 个模块** |

---

## ✅ 拆分收益

1. **单一职责**: 每个模块职责明确
2. **易于测试**: 可以独立测试每个模块
3. **易于维护**: 修改某个功能只需关注对应模块
4. **易于扩展**: 新增功能时知道应该放在哪个模块
5. **代码复用**: 其他适配器可以复用这些模块

---

## 🚀 执行步骤

1. ✅ 创建拆分计划文档
2. ⏳ 创建 RollupCacheManager.ts
3. ⏳ 创建 RollupBannerGenerator.ts
4. ⏳ 创建 RollupPluginManager.ts
5. ⏳ 创建 RollupConfigGenerator.ts
6. ⏳ 创建 RollupDtsHandler.ts
7. ⏳ 重构 RollupAdapter.ts 使用新模块
8. ⏳ 运行测试确保功能正常
9. ⏳ 更新文档

---

**准备开始拆分！** 🎯

