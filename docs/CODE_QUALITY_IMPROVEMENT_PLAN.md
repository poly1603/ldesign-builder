# 代码质量提升方案

> **@ldesign/builder 代码质量系统性提升计划**

---

## 🎯 质量目标

| 指标 | 当前 | 目标 | 提升 |
|------|------|------|------|
| **类型安全** | 中 | 高 | 显著 |
| **测试覆盖率** | <60% | >80% | +33% |
| **圈复杂度** | 8-12 | <8 | -33% |
| **代码重复率** | 5% | <3% | -40% |
| **技术债务** | 中 | 低 | -60% |

---

## 📋 优化清单

### 1. 类型安全提升 ⭐⭐⭐⭐⭐

#### 1.1 消除 any 类型

**问题代码：**
```typescript
// ❌ 当前代码（不推荐）
protected currentStats: any = null
protected currentMetrics: any = null
private plugins: any[] = []

function processData(data: any): any {
  return data.value
}
```

**优化后代码：**
```typescript
// ✅ 优化后（推荐）
protected currentStats: BuildStats | null = null
protected currentMetrics: PerformanceMetrics | null = null
private plugins: UnifiedPlugin[] = []

function processData<T extends { value: unknown }>(data: T): T['value'] {
  return data.value
}
```

#### 1.2 添加严格的泛型约束

**问题代码：**
```typescript
// ❌ 当前代码（过于宽松）
class Builder<T> {
  build(config: T): Promise<BuildResult> {
    // T 可以是任何类型
  }
}
```

**优化后代码：**
```typescript
// ✅ 优化后（严格约束）
interface BuildableConfig {
  input: string
  output: OutputConfig
}

class Builder<T extends BuildableConfig> {
  build(config: T): Promise<BuildResult<T>> {
    // T 必须包含必要的配置项
  }
}
```

#### 1.3 使用类型守卫

**优化方案：**
```typescript
/**
 * 类型守卫函数集合
 */

// 检查是否为 BuildResult
export function isBuildResult(obj: unknown): obj is BuildResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    'outputs' in obj &&
    typeof (obj as any).success === 'boolean' &&
    Array.isArray((obj as any).outputs)
  )
}

// 检查是否为 BuilderConfig
export function isBuilderConfig(obj: unknown): obj is BuilderConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('input' in obj || 'output' in obj)
  )
}

// 检查是否为 Error
export function isError(obj: unknown): obj is Error {
  return obj instanceof Error
}

// 使用示例
function processResult(result: unknown): void {
  if (isBuildResult(result)) {
    // TypeScript 知道这里 result 是 BuildResult 类型
    console.log(result.outputs.length)
  }
}
```

#### 1.4 使用 TypeScript 5.x 新特性

**const 类型参数：**
```typescript
// TypeScript 5.0+
function createConfig<const T extends BuilderConfig>(config: T): T {
  return config
}

// 使用
const config = createConfig({
  input: 'src/index.ts',
  output: { dir: 'dist' }
})
// config 的类型是精确的字面量类型，不是泛型的 BuilderConfig
```

**satisfies 运算符：**
```typescript
// TypeScript 4.9+
const config = {
  input: 'src/index.ts',
  output: { dir: 'dist' },
  minify: true
} satisfies BuilderConfig
// 既保证类型正确，又保留字面量类型
```

---

### 2. 错误处理优化 ⭐⭐⭐⭐⭐

#### 2.1 统一错误创建

**问题代码：**
```typescript
// ❌ 分散的错误创建方式
throw new Error('配置无效')
throw new BuilderError(ErrorCode.CONFIG_INVALID, '配置无效')
if (!config) {
  return { error: '缺少配置' }
}
```

**优化后代码：**
```typescript
// ✅ 统一使用 ErrorHandler
class SomeClass {
  constructor(private errorHandler: ErrorHandler) {}
  
  someMethod() {
    // 统一的错误创建
    this.errorHandler.throwError(
      ErrorCode.CONFIG_INVALID,
      '配置无效',
      {
        phase: 'validation',
        suggestion: '请检查配置文件'
      }
    )
  }
}
```

#### 2.2 错误分类体系

**设计方案：**
```typescript
/**
 * 错误分类枚举
 */
export enum ErrorCategory {
  // 配置相关
  CONFIG = 'config',
  
  // 构建相关
  BUILD = 'build',
  
  // 插件相关
  PLUGIN = 'plugin',
  
  // 系统相关
  SYSTEM = 'system',
  
  // 网络相关
  NETWORK = 'network',
  
  // 文件系统相关
  FILESYSTEM = 'filesystem'
}

/**
 * 分类错误类
 */
export class CategorizedError extends BuilderError {
  public readonly category: ErrorCategory
  
  constructor(
    code: ErrorCode,
    category: ErrorCategory,
    message: string,
    options?: BuilderErrorOptions
  ) {
    super(code, message, options)
    this.category = category
  }
}

// 使用示例
throw new CategorizedError(
  ErrorCode.CONFIG_INVALID,
  ErrorCategory.CONFIG,
  '配置文件格式错误'
)
```

#### 2.3 错误恢复策略

**优化方案：**
```typescript
/**
 * 错误恢复策略注册表
 */
class ErrorRecoveryRegistry {
  private strategies = new Map<ErrorCode, RecoveryStrategy>()
  
  /**
   * 注册恢复策略
   */
  register(code: ErrorCode, strategy: RecoveryStrategy): void {
    this.strategies.set(code, strategy)
  }
  
  /**
   * 执行恢复
   */
  async recover(error: BuilderError): Promise<any> {
    const strategy = this.strategies.get(error.code)
    
    if (strategy) {
      return await strategy.execute(error)
    }
    
    throw error
  }
}

// 注册常见错误的恢复策略
registry.register(ErrorCode.OUT_OF_MEMORY, {
  async execute(error) {
    // 清理缓存
    await clearCache()
    
    // 触发 GC
    if (global.gc) global.gc()
    
    // 减少并发数
    reduceParallelism()
    
    // 重试
    return await retryBuild()
  }
})
```

---

### 3. 代码复用提升 ⭐⭐⭐⭐⭐

#### 3.1 提取公共逻辑

**问题：重复的 package.json 读取代码**
```typescript
// ❌ 多处重复
// File1.ts
const pkgPath = path.join(projectRoot, 'package.json')
if (await fs.pathExists(pkgPath)) {
  const pkg = await fs.readJson(pkgPath)
}

// File2.ts
const packageJsonPath = path.join(cwd, 'package.json')
if (await fs.pathExists(packageJsonPath)) {
  const packageJson = await fs.readJson(packageJsonPath)
}
```

**优化：提取为工具类**
```typescript
// ✅ 工具类
// src/utils/packageJson.ts
/**
 * Package.json 读取器
 */
export class PackageJsonReader {
  /**
   * 读取 package.json
   */
  static async read(projectRoot: string): Promise<PackageJson> {
    const filePath = path.join(projectRoot, 'package.json')
    
    if (!await fs.pathExists(filePath)) {
      throw new BuilderError(
        ErrorCode.FILE_NOT_FOUND,
        'package.json 不存在'
      )
    }
    
    return await fs.readJson(filePath)
  }
  
  /**
   * 安全读取（失败返回 null）
   */
  static async readSafe(projectRoot: string): Promise<PackageJson | null> {
    try {
      return await this.read(projectRoot)
    } catch {
      return null
    }
  }
  
  /**
   * 获取依赖列表
   */
  static async getDependencies(projectRoot: string): Promise<Record<string, string>> {
    const pkg = await this.read(projectRoot)
    return {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    }
  }
}

// 使用
const pkg = await PackageJsonReader.read(projectRoot)
const deps = await PackageJsonReader.getDependencies(projectRoot)
```

#### 3.2 提取配置合并逻辑

**优化方案：**
```typescript
/**
 * 通用配置合并器
 */
export class ConfigMerger {
  /**
   * 深度合并对象
   */
  static deepMerge<T extends object>(
    base: T,
    override: Partial<T>,
    options: MergeOptions = {}
  ): T {
    const result = { ...base }
    
    for (const [key, value] of Object.entries(override)) {
      if (value === undefined) continue
      
      const baseValue = (result as any)[key]
      
      if (this.isObject(value) && this.isObject(baseValue)) {
        // 递归合并对象
        (result as any)[key] = this.deepMerge(baseValue, value, options)
      } else if (Array.isArray(value) && Array.isArray(baseValue)) {
        // 数组合并策略
        (result as any)[key] = this.mergeArray(baseValue, value, options.arrayStrategy)
      } else {
        // 基本类型直接覆盖
        (result as any)[key] = value
      }
    }
    
    return result
  }
  
  /**
   * 合并数组
   */
  private static mergeArray<T>(
    base: T[],
    override: T[],
    strategy: 'replace' | 'concat' | 'unique' = 'replace'
  ): T[] {
    switch (strategy) {
      case 'concat':
        return [...base, ...override]
      case 'unique':
        return [...new Set([...base, ...override])]
      case 'replace':
      default:
        return override
    }
  }
  
  private static isObject(obj: unknown): obj is object {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
  }
}
```

#### 3.3 提取文件操作逻辑

**优化方案：**
```typescript
/**
 * 文件系统工具类
 */
export class FileSystemUtils {
  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath)
  }
  
  /**
   * 安全删除文件/目录
   */
  static async remove(targetPath: string): Promise<void> {
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath)
    }
  }
  
  /**
   * 复制文件/目录
   */
  static async copy(
    src: string,
    dest: string,
    options?: fs.CopyOptions
  ): Promise<void> {
    await fs.copy(src, dest, options)
  }
  
  /**
   * 读取 JSON 文件（类型安全）
   */
  static async readJson<T = any>(filePath: string): Promise<T> {
    return await fs.readJson(filePath)
  }
  
  /**
   * 写入 JSON 文件
   */
  static async writeJson(
    filePath: string,
    data: any,
    options?: fs.WriteOptions
  ): Promise<void> {
    await fs.writeJson(filePath, data, { spaces: 2, ...options })
  }
  
  /**
   * 递归查找文件
   */
  static async findFiles(
    dir: string,
    pattern: string | RegExp
  ): Promise<string[]> {
    const files = await fg(pattern, { cwd: dir, absolute: true })
    return files
  }
}
```

---

### 4. 测试覆盖率提升 ⭐⭐⭐⭐⭐

#### 4.1 单元测试补充

**测试策略：**
```typescript
/**
 * Logger 类完整测试
 */
describe('Logger', () => {
  let logger: Logger
  
  beforeEach(() => {
    logger = new Logger({ level: 'info' })
  })
  
  describe('基础日志方法', () => {
    it('应该正确记录 info 日志', () => {
      const spy = jest.spyOn(console, 'log')
      logger.info('test message')
      expect(spy).toHaveBeenCalled()
    })
    
    it('应该正确记录 error 日志', () => {
      const spy = jest.spyOn(console, 'log')
      logger.error('error message')
      expect(spy).toHaveBeenCalled()
    })
    
    it('应该遵守日志级别', () => {
      logger.setLevel('error')
      const spy = jest.spyOn(console, 'log')
      logger.info('should not log')
      expect(spy).not.toHaveBeenCalled()
    })
  })
  
  describe('日志格式化', () => {
    it('应该包含时间戳', () => {
      logger = new Logger({ timestamp: true })
      const spy = jest.spyOn(console, 'log')
      logger.info('test')
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\]/)
      )
    })
  })
  
  describe('子日志器', () => {
    it('应该正确创建子日志器', () => {
      const child = logger.child('Module')
      expect(child).toBeInstanceOf(Logger)
    })
  })
})
```

**目标：**
- Logger 测试覆盖率：>90%
- ErrorHandler 测试覆盖率：>90%
- BuildCache 测试覆盖率：>85%

#### 4.2 集成测试补充

**测试策略：**
```typescript
/**
 * 完整构建流程集成测试
 */
describe('Build Integration', () => {
  it('应该成功构建 TypeScript 库', async () => {
    const builder = new LibraryBuilder()
    
    const result = await builder.build({
      input: 'fixtures/ts-lib/src/index.ts',
      output: { dir: 'fixtures/ts-lib/dist' }
    })
    
    expect(result.success).toBe(true)
    expect(result.outputs.length).toBeGreaterThan(0)
    
    // 验证输出文件存在
    expect(await fs.pathExists('fixtures/ts-lib/dist/index.js')).toBe(true)
  })
  
  it('应该成功构建 Vue 3 库', async () => {
    const builder = new LibraryBuilder()
    
    const result = await builder.build({
      input: 'fixtures/vue3-lib/src/index.ts',
      output: { dir: 'fixtures/vue3-lib/dist' }
    })
    
    expect(result.success).toBe(true)
    expect(result.libraryType).toBe(LibraryType.VUE3)
  })
  
  it('应该正确处理构建错误', async () => {
    const builder = new LibraryBuilder()
    
    await expect(
      builder.build({
        input: 'non-existent.ts',
        output: { dir: 'dist' }
      })
    ).rejects.toThrow()
  })
})
```

#### 4.3 E2E 测试补充

**测试策略：**
```typescript
/**
 * CLI 端到端测试
 */
describe('CLI E2E', () => {
  it('应该通过 CLI 成功构建', async () => {
    const { stdout, exitCode } = await execCommand(
      'ldesign-builder build -i src/index.ts -o dist'
    )
    
    expect(exitCode).toBe(0)
    expect(stdout).toContain('构建完成')
    expect(await fs.pathExists('dist/index.js')).toBe(true)
  })
  
  it('应该支持监听模式', async () => {
    const proc = spawn('ldesign-builder', ['build', '--watch'])
    
    // 等待初始构建完成
    await waitFor(() => fs.pathExists('dist/index.js'))
    
    // 修改源文件
    await fs.writeFile('src/index.ts', '// modified')
    
    // 等待重新构建
    await waitFor(() => checkFileModified('dist/index.js'))
    
    // 清理
    proc.kill()
  })
})
```

---

### 5. 代码复杂度降低 ⭐⭐⭐⭐

#### 5.1 拆分复杂方法

**问题代码：**
```typescript
// ❌ 圈复杂度 = 15（过高）
async function complexBuild(config: BuilderConfig): Promise<BuildResult> {
  if (!config.input) {
    throw new Error('missing input')
  }
  
  if (config.mode === 'production') {
    if (config.minify) {
      // ...
    } else {
      // ...
    }
  } else {
    if (config.sourcemap) {
      // ...
    } else {
      // ...
    }
  }
  
  if (config.cache && await cacheExists()) {
    // ...
  } else {
    // ...
  }
  
  // ... 更多嵌套逻辑
}
```

**优化后代码：**
```typescript
// ✅ 圈复杂度 = 3（优秀）
async function optimizedBuild(config: BuilderConfig): Promise<BuildResult> {
  // 验证配置
  this.validateConfig(config)
  
  // 检查缓存
  const cached = await this.checkCache(config)
  if (cached) {
    return cached
  }
  
  // 执行构建
  return await this.executeBuild(config)
}

// 拆分为小方法
private validateConfig(config: BuilderConfig): void {
  if (!config.input) {
    throw new Error('missing input')
  }
}

private async checkCache(config: BuilderConfig): Promise<BuildResult | null> {
  if (!config.cache) return null
  if (!await this.cacheExists()) return null
  return await this.loadCache()
}

private async executeBuild(config: BuilderConfig): Promise<BuildResult> {
  const strategy = this.selectStrategy(config)
  return await strategy.build(config)
}
```

#### 5.2 使用策略模式替代条件分支

**问题代码：**
```typescript
// ❌ 大量 if-else
function getBundler(type: string) {
  if (type === 'rollup') {
    return new RollupAdapter()
  } else if (type === 'rolldown') {
    return new RolldownAdapter()
  } else if (type === 'esbuild') {
    return new EsbuildAdapter()
  } else if (type === 'swc') {
    return new SwcAdapter()
  } else {
    throw new Error('Unknown bundler')
  }
}
```

**优化后代码：**
```typescript
// ✅ 策略模式
class BundlerFactory {
  private static adapters = new Map<string, () => IBundlerAdapter>([
    ['rollup', () => new RollupAdapter()],
    ['rolldown', () => new RolldownAdapter()],
    ['esbuild', () => new EsbuildAdapter()],
    ['swc', () => new SwcAdapter()]
  ])
  
  static create(type: string): IBundlerAdapter {
    const factory = this.adapters.get(type)
    
    if (!factory) {
      throw new Error(`Unknown bundler: ${type}`)
    }
    
    return factory()
  }
  
  // 支持注册自定义适配器
  static register(type: string, factory: () => IBundlerAdapter): void {
    this.adapters.set(type, factory)
  }
}
```

---

### 6. 依赖管理优化 ⭐⭐⭐⭐

#### 6.1 循环依赖检测和解决

**检测工具：**
```typescript
/**
 * 循环依赖检测器
 * 
 * 使用深度优先搜索检测循环依赖
 */
class CircularDependencyDetector {
  private graph = new Map<string, string[]>()
  
  /**
   * 构建依赖图
   */
  async buildGraph(entryPoint: string): Promise<void> {
    await this.scanFile(entryPoint, new Set())
  }
  
  private async scanFile(
    file: string,
    visited: Set<string>
  ): Promise<void> {
    if (visited.has(file)) return
    visited.add(file)
    
    // 分析文件的导入语句
    const imports = await this.extractImports(file)
    this.graph.set(file, imports)
    
    // 递归扫描依赖
    for (const imp of imports) {
      await this.scanFile(imp, visited)
    }
  }
  
  /**
   * 检测循环
   */
  detect(): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const path: string[] = []
    
    for (const node of this.graph.keys()) {
      this.dfs(node, visited, path, cycles)
    }
    
    return cycles
  }
  
  private dfs(
    node: string,
    visited: Set<string>,
    path: string[],
    cycles: string[][]
  ): void {
    if (path.includes(node)) {
      // 发现循环
      const cycleStart = path.indexOf(node)
      cycles.push([...path.slice(cycleStart), node])
      return
    }
    
    if (visited.has(node)) return
    
    visited.add(node)
    path.push(node)
    
    const deps = this.graph.get(node) || []
    for (const dep of deps) {
      this.dfs(dep, visited, path, cycles)
    }
    
    path.pop()
  }
}
```

**使用：**
```bash
# 检测循环依赖
ldesign-builder analyze:circular

# 输出
🔍 检测循环依赖...
⚠️ 发现 2 个循环依赖：
  1. A.ts → B.ts → C.ts → A.ts
  2. X.ts → Y.ts → X.ts

💡 建议：
  - 将共享逻辑提取到独立模块
  - 使用依赖注入打破循环
```

---

## 📊 代码质量指标

### 静态分析指标

```typescript
/**
 * 代码质量分析器
 */
class CodeQualityAnalyzer {
  async analyze(sourceDir: string): Promise<QualityReport> {
    return {
      // 圈复杂度
      complexity: await this.analyzeComplexity(sourceDir),
      
      // 代码重复率
      duplication: await this.analyzeDuplication(sourceDir),
      
      // 代码行数分布
      linesDistribution: await this.analyzeLines(sourceDir),
      
      // 依赖深度
      dependencyDepth: await this.analyzeDependencies(sourceDir),
      
      // 类型覆盖率
      typeCoverage: await this.analyzeTypes(sourceDir)
    }
  }
}
```

### 质量门禁

```typescript
/**
 * 质量门禁检查
 */
class QualityGate {
  private thresholds = {
    complexity: 10,         // 最大圈复杂度
    duplication: 3,         // 最大重复率（%）
    maxFileLines: 500,      // 最大文件行数
    typeCoverage: 90,       // 最小类型覆盖率（%）
    testCoverage: 80        // 最小测试覆盖率（%）
  }
  
  /**
   * 检查是否通过
   */
  async check(sourceDir: string): Promise<GateResult> {
    const report = await analyzer.analyze(sourceDir)
    const violations: string[] = []
    
    // 检查圈复杂度
    if (report.complexity.max > this.thresholds.complexity) {
      violations.push(
        `圈复杂度过高: ${report.complexity.max} > ${this.thresholds.complexity}`
      )
    }
    
    // 检查重复率
    if (report.duplication.rate > this.thresholds.duplication) {
      violations.push(
        `代码重复率过高: ${report.duplication.rate}% > ${this.thresholds.duplication}%`
      )
    }
    
    // 检查文件大小
    const largeFiles = report.linesDistribution.files.filter(
      f => f.lines > this.thresholds.maxFileLines
    )
    if (largeFiles.length > 0) {
      violations.push(
        `${largeFiles.length} 个文件超过行数限制`
      )
    }
    
    return {
      passed: violations.length === 0,
      violations,
      report
    }
  }
}
```

**在 CI/CD 中使用：**
```yaml
# .github/workflows/quality-gate.yml
- name: 代码质量检查
  run: |
    npm run quality:check
    if [ $? -ne 0 ]; then
      echo "❌ 代码质量不达标"
      exit 1
    fi
```

---

## 🎯 实施计划

### Week 1：类型安全提升
- Day 1-2: 消除 any 类型
- Day 3-4: 添加泛型约束
- Day 5: 实现类型守卫
- Day 6-7: 测试和验证

### Week 2：错误处理优化
- Day 1-2: 统一错误创建
- Day 3-4: 实现错误分类
- Day 5: 完善恢复策略
- Day 6-7: 测试和验证

### Week 3：代码复用提升
- Day 1-2: 提取公共逻辑
- Day 3-4: 创建工具类
- Day 5: 重构重复代码
- Day 6-7: 测试和验证

### Week 4：测试覆盖率提升
- Day 1-3: 补充单元测试
- Day 4-5: 补充集成测试
- Day 6: E2E 测试
- Day 7: 生成覆盖率报告

---

## ✅ 验收标准

### 代码质量标准

- [ ] 所有文件通过 Lint 检查
- [ ] 圈复杂度 <10
- [ ] 代码重复率 <3%
- [ ] 类型覆盖率 >95%
- [ ] 测试覆盖率 >80%

### 性能标准

- [ ] 无性能退化
- [ ] 构建速度不降低
- [ ] 内存占用不增加

### 文档标准

- [ ] 所有公共 API 有文档
- [ ] 所有复杂逻辑有注释
- [ ] 更新相关文档

---

## 📚 参考资料

- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [代码复杂度](https://en.wikipedia.org/wiki/Cyclomatic_complexity)

---

**文档版本：** 1.0.0  
**最后更新：** 2024-01-01  
**状态：** 📝 规划完成，待实施

