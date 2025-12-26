/**
 * 智能配置生成命令
 * 
 * 根据项目结构自动生成 .ldesign/builder.config.ts 配置文件
 * 支持交互式问答和自动检测
 */

import { Command } from 'commander'
import { resolve, join, relative, basename, dirname, extname } from 'path'
import { existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { createInterface } from 'readline'
import { logger } from '../../utils/logger'
import { SmartBundlerSelector, type ProjectAnalysis, type BundlerRecommendation } from '../../core/SmartBundlerSelector'
import type { BundlerType } from '../../types/bundler'

// ========== 类型定义 ==========

interface GenerateOptions {
  yes?: boolean
  output?: string
  analyze?: boolean
}

interface GeneratedConfig {
  // 基础配置
  name: string
  libraryType: string
  bundler: BundlerType
  
  // 入口配置
  input: string | string[]
  
  // 输出配置
  outputDir: string
  formats: string[]
  
  // 类型声明
  dts: boolean
  
  // 构建选项
  sourcemap: boolean
  minify: boolean
  clean: boolean
  
  // 外部依赖
  external: string[]
  
  // 框架特定
  framework?: string
  
  // 样式处理
  styles?: {
    extract: boolean
    preprocessor?: string
  }
  
  // 额外选项
  banner?: string
  target?: string
}

// ========== 交互工具 ==========

async function prompt(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    const q = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `
    rl.question(q, (answer) => {
      rl.close()
      resolve(answer.trim() || defaultValue || '')
    })
  })
}

async function select(question: string, options: Array<{ value: string; label: string }>, defaultIndex = 0): Promise<string> {
  console.log(`\n${question}`)
  options.forEach((opt, i) => {
    const marker = i === defaultIndex ? '❯' : ' '
    console.log(`  ${marker} ${i + 1}. ${opt.label}`)
  })
  
  const answer = await prompt(`请选择 [1-${options.length}]`, String(defaultIndex + 1))
  const index = parseInt(answer) - 1
  return options[Math.max(0, Math.min(index, options.length - 1))].value
}

async function multiSelect(question: string, options: Array<{ value: string; label: string }>, defaults: string[] = []): Promise<string[]> {
  console.log(`\n${question} (用逗号分隔多个选项)`)
  options.forEach((opt, i) => {
    const checked = defaults.includes(opt.value) ? '✓' : ' '
    console.log(`  [${checked}] ${i + 1}. ${opt.label}`)
  })
  
  const defaultIndices = defaults.map(d => options.findIndex(o => o.value === d) + 1).filter(i => i > 0).join(',')
  const answer = await prompt(`请选择`, defaultIndices || '1,2')
  
  return answer.split(',')
    .map(n => parseInt(n.trim()) - 1)
    .filter(i => i >= 0 && i < options.length)
    .map(i => options[i].value)
}

async function confirm(question: string, defaultValue = true): Promise<boolean> {
  const hint = defaultValue ? '[Y/n]' : '[y/N]'
  const answer = await prompt(`${question} ${hint}`)
  if (!answer) return defaultValue
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
}

// ========== 项目分析 ==========

function findEntryFiles(projectPath: string): string[] {
  const possibleEntries = [
    'src/index.ts',
    'src/index.tsx',
    'src/index.js',
    'src/main.ts',
    'src/main.tsx',
    'src/main.js',
    'src/lib.ts',
    'src/lib/index.ts',
    'lib/index.ts',
    'index.ts',
    'index.js'
  ]
  
  return possibleEntries.filter(entry => existsSync(resolve(projectPath, entry)))
}

function findAllSourceFiles(projectPath: string, dir: string = 'src'): string[] {
  const files: string[] = []
  const fullDir = resolve(projectPath, dir)
  
  if (!existsSync(fullDir)) return files
  
  try {
    const entries = readdirSync(fullDir)
    for (const entry of entries) {
      const fullPath = join(fullDir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        // 排除常见的非源码目录
        if (!['node_modules', 'dist', 'build', '__tests__', 'tests', 'test'].includes(entry)) {
          files.push(...findAllSourceFiles(projectPath, join(dir, entry)))
        }
      } else {
        const ext = extname(entry).toLowerCase()
        if (['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'].includes(ext)) {
          files.push(join(dir, entry))
        }
      }
    }
  } catch {}
  
  return files
}

function detectStylePreprocessor(projectPath: string): string | undefined {
  const srcDir = resolve(projectPath, 'src')
  if (!existsSync(srcDir)) return undefined
  
  const files = findAllSourceFiles(projectPath)
  const styleExts = files.map(f => extname(f).toLowerCase())
  
  // 检查源文件中的样式导入
  for (const file of files.slice(0, 30)) {
    try {
      const content = readFileSync(resolve(projectPath, file), 'utf-8')
      if (content.includes('.less') || content.includes("from 'less'")) return 'less'
      if (content.includes('.scss') || content.includes('.sass')) return 'scss'
      if (content.includes('.styl')) return 'stylus'
    } catch {}
  }
  
  // 检查样式文件
  const styleFiles = readdirSync(srcDir, { recursive: true })
    .filter(f => typeof f === 'string')
    .map(f => extname(f as string).toLowerCase())
  
  if (styleFiles.includes('.less')) return 'less'
  if (styleFiles.includes('.scss') || styleFiles.includes('.sass')) return 'scss'
  if (styleFiles.includes('.styl')) return 'stylus'
  
  return undefined
}

function getExternalDeps(projectPath: string): string[] {
  const pkgPath = resolve(projectPath, 'package.json')
  if (!existsSync(pkgPath)) return []
  
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const peerDeps = Object.keys(pkg.peerDependencies || {})
    const optionalPeer = Object.keys(pkg.peerDependenciesMeta || {})
    
    // peer dependencies 通常应该是 external
    const externals = [...new Set([...peerDeps, ...optionalPeer])]
    
    // 根据框架添加常见的 external
    if (peerDeps.includes('vue') || pkg.dependencies?.vue) {
      externals.push('vue', '@vue/runtime-core', '@vue/runtime-dom')
    }
    if (peerDeps.includes('react') || pkg.dependencies?.react) {
      externals.push('react', 'react-dom', 'react/jsx-runtime')
    }
    
    return [...new Set(externals)]
  } catch {
    return []
  }
}

// ========== 配置生成 ==========

function generateConfigContent(config: GeneratedConfig): string {
  const lines: string[] = []
  
  lines.push(`import { defineConfig } from '@ldesign/builder'`)
  lines.push('')
  lines.push(`/**`)
  lines.push(` * ${config.name} 构建配置`)
  lines.push(` * `)
  lines.push(` * 由 ldesign-builder generate 自动生成`)
  lines.push(` * 文档: https://github.com/ldesign/packages/builder`)
  lines.push(` */`)
  lines.push(`export default defineConfig({`)
  
  // 基础配置
  lines.push(`  // 📦 项目类型`)
  lines.push(`  libraryType: '${config.libraryType}',`)
  lines.push('')
  
  // 打包引擎
  lines.push(`  // ⚙️ 打包引擎 (自动推荐: ${config.bundler})`)
  lines.push(`  bundler: '${config.bundler}',`)
  lines.push('')
  
  // 入口配置
  lines.push(`  // 📄 入口文件`)
  if (Array.isArray(config.input) && config.input.length > 1) {
    lines.push(`  input: ${JSON.stringify(config.input, null, 4).replace(/\n/g, '\n  ')},`)
  } else {
    const entry = Array.isArray(config.input) ? config.input[0] : config.input
    lines.push(`  input: '${entry}',`)
  }
  lines.push('')
  
  // 输出配置
  lines.push(`  // 📂 输出配置`)
  lines.push(`  output: {`)
  lines.push(`    dir: '${config.outputDir}',`)
  lines.push(`    format: ${JSON.stringify(config.formats)},`)
  lines.push(`  },`)
  lines.push('')
  
  // TypeScript 配置
  lines.push(`  // 📝 TypeScript 类型声明`)
  lines.push(`  dts: ${config.dts},`)
  lines.push('')
  
  // Source Map
  lines.push(`  // 🗺️ Source Map`)
  lines.push(`  sourcemap: ${config.sourcemap},`)
  lines.push('')
  
  // 压缩
  lines.push(`  // 📦 代码压缩`)
  lines.push(`  minify: ${config.minify},`)
  lines.push('')
  
  // 清理
  lines.push(`  // 🧹 构建前清理输出目录`)
  lines.push(`  clean: ${config.clean},`)
  lines.push('')
  
  // 外部依赖
  if (config.external.length > 0) {
    lines.push(`  // 📎 外部依赖 (不打包)`)
    lines.push(`  external: ${JSON.stringify(config.external)},`)
    lines.push('')
  }
  
  // 样式配置
  if (config.styles) {
    lines.push(`  // 🎨 样式处理`)
    lines.push(`  styles: {`)
    lines.push(`    extract: ${config.styles.extract},`)
    if (config.styles.preprocessor) {
      lines.push(`    preprocessor: '${config.styles.preprocessor}',`)
    }
    lines.push(`  },`)
    lines.push('')
  }
  
  // 目标环境
  if (config.target) {
    lines.push(`  // 🎯 目标环境`)
    lines.push(`  target: '${config.target}',`)
    lines.push('')
  }
  
  // Banner
  if (config.banner) {
    lines.push(`  // 📜 文件头注释`)
    lines.push(`  banner: '${config.banner}',`)
    lines.push('')
  }
  
  lines.push(`})`)
  
  return lines.join('\n')
}

function generatePackageScripts(config: GeneratedConfig): Record<string, string> {
  return {
    'build': 'ldesign-builder build',
    'build:watch': 'ldesign-builder watch',
    'build:analyze': 'ldesign-builder analyze',
    'dev': 'ldesign-builder dev',
    'clean': 'ldesign-builder clean'
  }
}

// ========== 主流程 ==========

async function runGenerate(projectPath: string, options: GenerateOptions): Promise<void> {
  console.log('')
  console.log('╭─────────────────────────────────────────────────────╮')
  console.log('│  🔮 LDesign Builder 智能配置生成器                  │')
  console.log('╰─────────────────────────────────────────────────────╯')
  console.log('')
  
  // 1. 分析项目
  console.log('📊 正在分析项目结构...\n')
  
  const selector = new SmartBundlerSelector(projectPath)
  const recommendation = await selector.selectBestBundler()
  const analysis = recommendation.analysis
  
  // 如果只是分析模式
  if (options.analyze) {
    printAnalysisReport(analysis, recommendation)
    return
  }
  
  // 打印分析结果摘要
  console.log('─'.repeat(50))
  console.log(`  项目类型:   ${getProjectTypeLabel(analysis.projectType)}`)
  console.log(`  框架:       ${getFrameworkLabel(analysis.framework)}`)
  console.log(`  语言:       ${analysis.language === 'typescript' ? 'TypeScript' : analysis.language === 'javascript' ? 'JavaScript' : '混合'}`)
  console.log(`  复杂度:     ${analysis.complexity}/100`)
  console.log(`  文件数:     ${analysis.fileStats.total}`)
  console.log(`  推荐引擎:   ${recommendation.bundler} (置信度: ${Math.round(recommendation.confidence * 100)}%)`)
  console.log('─'.repeat(50))
  console.log('')
  
  // 2. 读取 package.json
  const pkgPath = resolve(projectPath, 'package.json')
  let pkg: any = {}
  if (existsSync(pkgPath)) {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  }
  
  // 3. 检查现有配置
  const configDir = resolve(projectPath, '.ldesign')
  const configPath = resolve(configDir, 'builder.config.ts')
  const legacyConfigs = ['builder.config.ts', 'builder.config.js', 'ldesign.config.ts']
    .map(f => resolve(projectPath, f))
    .filter(f => existsSync(f))
  
  if (existsSync(configPath) || legacyConfigs.length > 0) {
    const existingFile = existsSync(configPath) ? '.ldesign/builder.config.ts' : basename(legacyConfigs[0])
    const overwrite = await confirm(`⚠️  已存在配置文件 ${existingFile}，是否覆盖？`, false)
    if (!overwrite) {
      logger.info('已取消生成')
      return
    }
  }
  
  // 4. 交互式配置或自动配置
  let config: GeneratedConfig
  
  if (options.yes) {
    // 自动模式
    config = generateAutoConfig(projectPath, pkg, analysis, recommendation)
  } else {
    // 交互模式
    config = await runInteractiveConfig(projectPath, pkg, analysis, recommendation)
  }
  
  // 5. 确认配置
  console.log('\n📋 配置预览:')
  console.log('─'.repeat(50))
  console.log(`  名称:       ${config.name}`)
  console.log(`  类型:       ${config.libraryType}`)
  console.log(`  引擎:       ${config.bundler}`)
  console.log(`  入口:       ${Array.isArray(config.input) ? config.input.join(', ') : config.input}`)
  console.log(`  输出目录:   ${config.outputDir}`)
  console.log(`  输出格式:   ${config.formats.join(', ')}`)
  console.log(`  类型声明:   ${config.dts ? '是' : '否'}`)
  console.log(`  Source Map: ${config.sourcemap ? '是' : '否'}`)
  console.log(`  压缩:       ${config.minify ? '是' : '否'}`)
  console.log(`  外部依赖:   ${config.external.length ? config.external.join(', ') : '无'}`)
  console.log('─'.repeat(50))
  
  if (!options.yes) {
    const proceed = await confirm('\n✨ 确认生成配置文件?', true)
    if (!proceed) {
      logger.info('已取消')
      return
    }
  }
  
  // 6. 生成文件
  console.log('\n🔧 生成配置文件...\n')
  
  // 创建 .ldesign 目录
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  
  // 写入配置文件
  const configContent = generateConfigContent(config)
  writeFileSync(configPath, configContent)
  logger.success(`✅ ${relative(projectPath, configPath)}`)
  
  // 创建 .gitignore（如果不存在）
  const gitignorePath = resolve(configDir, '.gitignore')
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, `# 缓存文件
.cache/
*.log
`)
    logger.success(`✅ ${relative(projectPath, gitignorePath)}`)
  }
  
  // 7. 更新 package.json
  const scripts = generatePackageScripts(config)
  let scriptsUpdated = false
  
  if (!pkg.scripts) pkg.scripts = {}
  
  for (const [name, cmd] of Object.entries(scripts)) {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = cmd
      scriptsUpdated = true
    }
  }
  
  if (scriptsUpdated) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    logger.success(`✅ package.json (已添加 scripts)`)
  }
  
  // 8. 完成
  console.log('')
  console.log('╭─────────────────────────────────────────────────────╮')
  console.log('│  ✨ 配置生成完成!                                   │')
  console.log('├─────────────────────────────────────────────────────┤')
  console.log('│  配置文件: .ldesign/builder.config.ts               │')
  console.log('│                                                     │')
  console.log('│  下一步:                                            │')
  console.log('│    npm run build       # 构建项目                   │')
  console.log('│    npm run dev         # 开发模式                   │')
  console.log('│    npm run build:watch # 监听模式                   │')
  console.log('╰─────────────────────────────────────────────────────╯')
  console.log('')
}

function generateAutoConfig(
  projectPath: string,
  pkg: any,
  analysis: ProjectAnalysis,
  recommendation: BundlerRecommendation
): GeneratedConfig {
  const entries = findEntryFiles(projectPath)
  const stylePreprocessor = detectStylePreprocessor(projectPath)
  const externals = getExternalDeps(projectPath)
  
  return {
    name: pkg.name || basename(projectPath),
    libraryType: mapProjectTypeToLibraryType(analysis.projectType, analysis.framework),
    bundler: recommendation.bundler,
    input: entries[0] || 'src/index.ts',
    outputDir: 'dist',
    formats: getDefaultFormats(analysis),
    dts: analysis.language === 'typescript' || analysis.language === 'mixed',
    sourcemap: true,
    minify: analysis.projectType !== 'utility-library',
    clean: true,
    external: externals,
    styles: stylePreprocessor ? { extract: true, preprocessor: stylePreprocessor } : undefined,
    target: analysis.projectType === 'node-library' ? 'node16' : 'es2020'
  }
}

async function runInteractiveConfig(
  projectPath: string,
  pkg: any,
  analysis: ProjectAnalysis,
  recommendation: BundlerRecommendation
): Promise<GeneratedConfig> {
  // 项目名称
  const name = await prompt('📦 项目名称', pkg.name || basename(projectPath))
  
  // 打包引擎
  const bundlerOptions = [
    { value: recommendation.bundler, label: `${recommendation.bundler} (推荐: ${recommendation.reason})` },
    ...recommendation.alternatives.slice(0, 3).map(alt => ({
      value: alt.bundler,
      label: `${alt.bundler} (${alt.reason})`
    }))
  ]
  const bundler = await select('⚙️ 选择打包引擎', bundlerOptions, 0) as BundlerType
  
  // 入口文件
  const entries = findEntryFiles(projectPath)
  const entryOptions = entries.length > 0 
    ? entries.map(e => ({ value: e, label: e }))
    : [{ value: 'src/index.ts', label: 'src/index.ts (将创建)' }]
  
  const needMultiEntry = analysis.fileStats.total > 50 && analysis.projectType === 'utility-library'
  let input: string | string[]
  
  if (needMultiEntry && !await confirm('🔀 是否使用单入口文件?', true)) {
    // 多入口模式
    const sourceFiles = findAllSourceFiles(projectPath)
    const indexFiles = sourceFiles.filter(f => f.endsWith('index.ts') || f.endsWith('index.tsx'))
    
    if (indexFiles.length > 1) {
      console.log('\n📁 检测到多个入口文件:')
      indexFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`))
      const answer = await prompt('请选择入口文件 (逗号分隔，或输入 * 全选)', '1')
      
      if (answer === '*') {
        input = indexFiles
      } else {
        input = answer.split(',')
          .map(n => parseInt(n.trim()) - 1)
          .filter(i => i >= 0 && i < indexFiles.length)
          .map(i => indexFiles[i])
      }
      
      if (input.length === 0) input = [entryOptions[0].value]
    } else {
      input = entryOptions[0].value
    }
  } else {
    input = await select('📄 入口文件', entryOptions, 0)
  }
  
  // 输出目录
  const outputDir = await prompt('📂 输出目录', 'dist')
  
  // 输出格式
  const formatOptions = [
    { value: 'esm', label: 'ESM (ES Modules)' },
    { value: 'cjs', label: 'CJS (CommonJS)' },
    { value: 'umd', label: 'UMD (通用模块)' },
    { value: 'iife', label: 'IIFE (立即执行)' }
  ]
  const defaultFormats = getDefaultFormats(analysis)
  const formats = await multiSelect('📤 输出格式', formatOptions, defaultFormats)
  
  // 类型声明
  const dts = await confirm('📝 生成类型声明 (.d.ts)?', analysis.language !== 'javascript')
  
  // Source Map
  const sourcemap = await confirm('🗺️ 生成 Source Map?', true)
  
  // 压缩
  const minify = await confirm('📦 压缩代码?', analysis.projectType !== 'utility-library')
  
  // 外部依赖
  const detectedExternals = getExternalDeps(projectPath)
  let external: string[] = detectedExternals
  
  if (detectedExternals.length > 0) {
    console.log(`\n📎 检测到外部依赖: ${detectedExternals.join(', ')}`)
    const keepExternals = await confirm('是否将这些依赖设为外部依赖 (不打包)?', true)
    if (!keepExternals) {
      external = []
    }
  }
  
  const additionalExternal = await prompt('📎 额外的外部依赖 (逗号分隔，可留空)', '')
  if (additionalExternal) {
    external = [...external, ...additionalExternal.split(',').map(s => s.trim()).filter(Boolean)]
  }
  
  // 样式处理
  const stylePreprocessor = detectStylePreprocessor(projectPath)
  let styles: GeneratedConfig['styles']
  
  if (stylePreprocessor || analysis.fileStats.css > 0 || analysis.fileStats.less > 0 || analysis.fileStats.scss > 0) {
    const extractStyles = await confirm('🎨 是否提取样式到单独文件?', true)
    styles = {
      extract: extractStyles,
      preprocessor: stylePreprocessor
    }
  }
  
  return {
    name,
    libraryType: mapProjectTypeToLibraryType(analysis.projectType, analysis.framework),
    bundler,
    input,
    outputDir,
    formats,
    dts,
    sourcemap,
    minify,
    clean: true,
    external: [...new Set(external)],
    styles,
    target: analysis.projectType === 'node-library' ? 'node16' : 'es2020'
  }
}

// ========== 辅助函数 ==========

function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'component-library': '组件库',
    'utility-library': '工具库',
    'cli-tool': 'CLI 工具',
    'node-library': 'Node 库',
    'style-library': '样式库',
    'application': '应用程序'
  }
  return labels[type] || type
}

function getFrameworkLabel(framework: string): string {
  const labels: Record<string, string> = {
    'vue3': 'Vue 3',
    'vue2': 'Vue 2',
    'react': 'React',
    'svelte': 'Svelte',
    'solid': 'Solid',
    'lit': 'Lit',
    'angular': 'Angular',
    'typescript': 'TypeScript',
    'unknown': '未检测到框架'
  }
  return labels[framework] || framework
}

function mapProjectTypeToLibraryType(projectType: string, framework: string): string {
  if (framework !== 'unknown' && framework !== 'typescript') {
    return framework
  }
  
  switch (projectType) {
    case 'component-library': return 'typescript'
    case 'utility-library': return 'typescript'
    case 'cli-tool': return 'typescript'
    case 'node-library': return 'typescript'
    default: return 'typescript'
  }
}

function getDefaultFormats(analysis: ProjectAnalysis): string[] {
  switch (analysis.projectType) {
    case 'component-library':
      return ['esm', 'cjs', 'umd']
    case 'cli-tool':
    case 'node-library':
      return ['esm', 'cjs']
    case 'application':
      return ['esm']
    default:
      return ['esm', 'cjs']
  }
}

function printAnalysisReport(analysis: ProjectAnalysis, recommendation: BundlerRecommendation): void {
  console.log('')
  console.log('╭─────────────────────────────────────────────────────╮')
  console.log('│  📊 项目分析报告                                    │')
  console.log('╰─────────────────────────────────────────────────────╯')
  console.log('')
  
  console.log('📁 基础信息')
  console.log('─'.repeat(50))
  console.log(`  项目类型:   ${getProjectTypeLabel(analysis.projectType)}`)
  console.log(`  框架:       ${getFrameworkLabel(analysis.framework)}`)
  console.log(`  语言:       ${analysis.language === 'typescript' ? 'TypeScript' : analysis.language === 'javascript' ? 'JavaScript' : '混合'}`)
  console.log(`  复杂度:     ${analysis.complexity}/100`)
  console.log('')
  
  console.log('📊 文件统计')
  console.log('─'.repeat(50))
  console.log(`  总文件数:   ${analysis.fileStats.total}`)
  console.log(`  TypeScript: ${analysis.fileStats.typescript}`)
  console.log(`  JavaScript: ${analysis.fileStats.javascript}`)
  console.log(`  Vue SFC:    ${analysis.fileStats.vue}`)
  console.log(`  JSX:        ${analysis.fileStats.jsx}`)
  console.log(`  TSX:        ${analysis.fileStats.tsx}`)
  console.log(`  CSS:        ${analysis.fileStats.css}`)
  console.log(`  Less:       ${analysis.fileStats.less}`)
  console.log(`  SCSS:       ${analysis.fileStats.scss}`)
  console.log('')
  
  console.log('🔍 特性检测')
  console.log('─'.repeat(50))
  console.log(`  装饰器:     ${analysis.features.hasDecorators ? '✓' : '✗'}`)
  console.log(`  JSX:        ${analysis.features.hasJsx ? '✓' : '✗'}`)
  console.log(`  Vue SFC:    ${analysis.features.hasVueSfc ? '✓' : '✗'}`)
  console.log(`  CSS Modules: ${analysis.features.hasCssModules ? '✓' : '✗'}`)
  console.log(`  Monorepo:   ${analysis.features.hasMonorepo ? '✓' : '✗'}`)
  console.log(`  代码分割:   ${analysis.features.needsCodeSplitting ? '✓' : '✗'}`)
  console.log('')
  
  console.log('📦 依赖检测')
  console.log('─'.repeat(50))
  console.log(`  依赖总数:   ${analysis.dependencies.total}`)
  console.log(`  Vue:        ${analysis.dependencies.hasVue ? '✓' : '✗'}`)
  console.log(`  React:      ${analysis.dependencies.hasReact ? '✓' : '✗'}`)
  console.log(`  Svelte:     ${analysis.dependencies.hasSvelte ? '✓' : '✗'}`)
  console.log(`  Solid:      ${analysis.dependencies.hasSolid ? '✓' : '✗'}`)
  console.log(`  Lit:        ${analysis.dependencies.hasLit ? '✓' : '✗'}`)
  console.log(`  Angular:    ${analysis.dependencies.hasAngular ? '✓' : '✗'}`)
  console.log('')
  
  console.log('⚙️ 引擎推荐')
  console.log('─'.repeat(50))
  console.log(`  推荐引擎:   ${recommendation.bundler}`)
  console.log(`  推荐原因:   ${recommendation.reason}`)
  console.log(`  置信度:     ${Math.round(recommendation.confidence * 100)}%`)
  console.log('')
  console.log('  备选方案:')
  for (const alt of recommendation.alternatives) {
    console.log(`    - ${alt.bundler}: ${alt.reason} (评分: ${alt.score})`)
  }
  console.log('')
}

// ========== 命令定义 ==========

export const generateCommand = new Command('generate')
  .alias('gen')
  .alias('g')
  .description('智能生成 .ldesign/builder.config.ts 配置文件')
  .option('-y, --yes', '跳过交互，使用自动检测的配置')
  .option('-o, --output <path>', '指定配置文件输出路径')
  .option('-a, --analyze', '仅分析项目，不生成配置')
  .action(async (options: GenerateOptions) => {
    try {
      await runGenerate(process.cwd(), options)
    } catch (error) {
      logger.error('配置生成失败:', error)
      process.exit(1)
    }
  })

export function registerGenerateCommand(program: Command): void {
  program.addCommand(generateCommand)
}
