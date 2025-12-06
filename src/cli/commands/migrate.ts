/**
 * 配置迁移工具
 * 
 * 从其他构建工具迁移配置到 @ldesign/builder
 */

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface MigrationResult {
  success: boolean
  sourceConfig: string
  generatedConfig: string
  warnings: string[]
  notes: string[]
}

// ========== 配置检测 ==========

function detectBuildTool(projectPath: string): string | null {
  const configFiles: Record<string, string> = {
    'vite.config.ts': 'vite',
    'vite.config.js': 'vite',
    'rollup.config.js': 'rollup',
    'rollup.config.ts': 'rollup',
    'rollup.config.mjs': 'rollup',
    'webpack.config.js': 'webpack',
    'webpack.config.ts': 'webpack',
    'esbuild.config.js': 'esbuild',
    'tsup.config.ts': 'tsup',
    'tsup.config.js': 'tsup',
    'unbuild.config.ts': 'unbuild',
    'build.config.ts': 'unbuild',
    'father.config.ts': 'father',
    '.fatherrc.ts': 'father',
    'microbundle.config.js': 'microbundle'
  }

  for (const [file, tool] of Object.entries(configFiles)) {
    if (existsSync(resolve(projectPath, file))) {
      return tool
    }
  }

  return null
}

// ========== Vite 迁移 ==========

function migrateFromVite(projectPath: string): MigrationResult {
  const warnings: string[] = []
  const notes: string[] = []
  
  let config: any = {}
  
  // 读取 Vite 配置 (简化处理)
  const viteConfigPath = existsSync(resolve(projectPath, 'vite.config.ts'))
    ? resolve(projectPath, 'vite.config.ts')
    : resolve(projectPath, 'vite.config.js')
  
  const viteConfig = readFileSync(viteConfigPath, 'utf-8')
  
  // 解析基本配置
  const buildMatch = viteConfig.match(/build\s*:\s*\{([^}]+)\}/)
  const libMatch = viteConfig.match(/lib\s*:\s*\{([^}]+)\}/)
  
  if (libMatch) {
    const entryMatch = libMatch[1].match(/entry\s*:\s*['"]([^'"]+)['"]/)
    if (entryMatch) config.input = entryMatch[1]
    
    const nameMatch = libMatch[1].match(/name\s*:\s*['"]([^'"]+)['"]/)
    if (nameMatch) config.name = nameMatch[1]
    
    const formatsMatch = libMatch[1].match(/formats\s*:\s*\[([^\]]+)\]/)
    if (formatsMatch) {
      const formats = formatsMatch[1].match(/['"](\w+)['"]/g)?.map(f => f.replace(/['"]/g, ''))
      if (formats) config.formats = formats
    }
  }
  
  // 检测外部依赖
  const externalMatch = viteConfig.match(/external\s*:\s*\[([^\]]+)\]/)
  if (externalMatch) {
    const external = externalMatch[1].match(/['"]([^'"]+)['"]/g)?.map(f => f.replace(/['"]/g, ''))
    if (external) config.external = external
  }
  
  // 检测 sourcemap
  if (viteConfig.includes('sourcemap: true') || viteConfig.includes("sourcemap: 'inline'")) {
    config.sourcemap = true
  }
  
  // 检测 minify
  if (viteConfig.includes('minify: true') || viteConfig.includes("minify: 'terser'")) {
    config.minify = true
  }
  
  notes.push('Vite 的某些高级配置可能需要手动调整')
  notes.push('建议检查 rollupOptions 中的自定义配置')
  
  const generatedConfig = generateConfig(config)
  
  return {
    success: true,
    sourceConfig: viteConfigPath,
    generatedConfig,
    warnings,
    notes
  }
}

// ========== Rollup 迁移 ==========

function migrateFromRollup(projectPath: string): MigrationResult {
  const warnings: string[] = []
  const notes: string[] = []
  
  let config: any = {}
  
  const rollupConfigPath = ['rollup.config.ts', 'rollup.config.js', 'rollup.config.mjs']
    .map(f => resolve(projectPath, f))
    .find(f => existsSync(f))!
  
  const rollupConfig = readFileSync(rollupConfigPath, 'utf-8')
  
  // 解析入口
  const inputMatch = rollupConfig.match(/input\s*:\s*['"]([^'"]+)['"]/)
  if (inputMatch) config.input = inputMatch[1]
  
  // 解析输出目录
  const dirMatch = rollupConfig.match(/dir\s*:\s*['"]([^'"]+)['"]/)
  if (dirMatch) config.outDir = dirMatch[1]
  
  // 解析格式
  const formatMatch = rollupConfig.match(/format\s*:\s*['"]([^'"]+)['"]/)
  if (formatMatch) config.formats = [formatMatch[1]]
  
  // 解析外部依赖
  const externalMatch = rollupConfig.match(/external\s*:\s*\[([^\]]+)\]/)
  if (externalMatch) {
    const external = externalMatch[1].match(/['"]([^'"]+)['"]/g)?.map(f => f.replace(/['"]/g, ''))
    if (external) config.external = external
  }
  
  // 检测插件
  if (rollupConfig.includes('typescript')) notes.push('已检测到 TypeScript 插件')
  if (rollupConfig.includes('terser')) config.minify = true
  if (rollupConfig.includes('dts')) config.dts = true
  
  notes.push('Rollup 插件需要在 builder.config.ts 中重新配置')
  
  const generatedConfig = generateConfig(config)
  
  return {
    success: true,
    sourceConfig: rollupConfigPath,
    generatedConfig,
    warnings,
    notes
  }
}

// ========== tsup 迁移 ==========

function migrateFromTsup(projectPath: string): MigrationResult {
  const warnings: string[] = []
  const notes: string[] = []
  
  let config: any = {}
  
  const tsupConfigPath = existsSync(resolve(projectPath, 'tsup.config.ts'))
    ? resolve(projectPath, 'tsup.config.ts')
    : resolve(projectPath, 'tsup.config.js')
  
  const tsupConfig = readFileSync(tsupConfigPath, 'utf-8')
  
  // 解析入口
  const entryMatch = tsupConfig.match(/entry\s*:\s*\[['"]([^'"]+)['"]\]/)
  if (entryMatch) config.input = entryMatch[1]
  
  // 解析格式
  const formatMatch = tsupConfig.match(/format\s*:\s*\[([^\]]+)\]/)
  if (formatMatch) {
    const formats = formatMatch[1].match(/['"](\w+)['"]/g)?.map(f => f.replace(/['"]/g, ''))
    if (formats) config.formats = formats
  }
  
  // dts
  if (tsupConfig.includes('dts: true')) config.dts = true
  
  // sourcemap
  if (tsupConfig.includes('sourcemap: true')) config.sourcemap = true
  
  // minify
  if (tsupConfig.includes('minify: true')) config.minify = true
  
  // clean
  if (tsupConfig.includes('clean: true')) config.clean = true
  
  // external
  const externalMatch = tsupConfig.match(/external\s*:\s*\[([^\]]+)\]/)
  if (externalMatch) {
    const external = externalMatch[1].match(/['"]([^'"]+)['"]/g)?.map(f => f.replace(/['"]/g, ''))
    if (external) config.external = external
  }
  
  notes.push('tsup 配置已成功迁移')
  
  const generatedConfig = generateConfig(config)
  
  return {
    success: true,
    sourceConfig: tsupConfigPath,
    generatedConfig,
    warnings,
    notes
  }
}

// ========== unbuild 迁移 ==========

function migrateFromUnbuild(projectPath: string): MigrationResult {
  const warnings: string[] = []
  const notes: string[] = []
  
  let config: any = {}
  
  const unbuildConfigPath = existsSync(resolve(projectPath, 'build.config.ts'))
    ? resolve(projectPath, 'build.config.ts')
    : resolve(projectPath, 'unbuild.config.ts')
  
  const unbuildConfig = readFileSync(unbuildConfigPath, 'utf-8')
  
  // 解析入口
  const entriesMatch = unbuildConfig.match(/entries\s*:\s*\[([^\]]+)\]/)
  if (entriesMatch) {
    const inputMatch = entriesMatch[1].match(/input\s*:\s*['"]([^'"]+)['"]/)
    if (inputMatch) config.input = inputMatch[1]
  }
  
  // declaration
  if (unbuildConfig.includes('declaration: true')) config.dts = true
  
  // sourcemap
  if (unbuildConfig.includes('sourcemap: true')) config.sourcemap = true
  
  // clean
  if (unbuildConfig.includes('clean: true')) config.clean = true
  
  notes.push('unbuild 的某些高级功能可能需要手动配置')
  
  const generatedConfig = generateConfig(config)
  
  return {
    success: true,
    sourceConfig: unbuildConfigPath,
    generatedConfig,
    warnings,
    notes
  }
}

// ========== 配置生成 ==========

function generateConfig(config: any): string {
  const lines = ['import { defineConfig } from \'@ldesign/builder\'', '', 'export default defineConfig({']
  
  if (config.input) lines.push(`  input: '${config.input}',`)
  
  if (config.formats || config.outDir) {
    lines.push('  output: {')
    if (config.formats) lines.push(`    format: ${JSON.stringify(config.formats)},`)
    if (config.outDir) lines.push(`    dir: '${config.outDir}',`)
    lines.push('  },')
  }
  
  if (config.name) lines.push(`  name: '${config.name}',`)
  if (config.dts !== undefined) lines.push(`  dts: ${config.dts},`)
  if (config.sourcemap !== undefined) lines.push(`  sourcemap: ${config.sourcemap},`)
  if (config.minify !== undefined) lines.push(`  minify: ${config.minify},`)
  if (config.clean !== undefined) lines.push(`  clean: ${config.clean},`)
  if (config.external) lines.push(`  external: ${JSON.stringify(config.external)},`)
  
  lines.push('})')
  
  return lines.join('\n')
}

// ========== 命令定义 ==========

export const migrateCommand = new Command('migrate')
  .description('从其他构建工具迁移配置')
  .option('-f, --from <tool>', '源构建工具 (vite/rollup/tsup/unbuild)')
  .option('--dry-run', '仅预览，不写入文件')
  .option('-y, --yes', '跳过确认')
  .action(async (options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('🔄 配置迁移工具')
    console.log('─'.repeat(50))
    console.log('')

    // 检测或指定源工具
    let sourceTool = options.from
    if (!sourceTool) {
      sourceTool = detectBuildTool(projectPath)
      if (!sourceTool) {
        logger.error('未检测到已知的构建工具配置')
        console.log('支持的工具: vite, rollup, tsup, unbuild')
        console.log('使用 --from <tool> 手动指定')
        process.exit(1)
      }
      console.log(`📦 检测到: ${sourceTool}`)
    }

    // 执行迁移
    let result: MigrationResult
    
    switch (sourceTool) {
      case 'vite':
        result = migrateFromVite(projectPath)
        break
      case 'rollup':
        result = migrateFromRollup(projectPath)
        break
      case 'tsup':
        result = migrateFromTsup(projectPath)
        break
      case 'unbuild':
        result = migrateFromUnbuild(projectPath)
        break
      default:
        logger.error(`不支持的构建工具: ${sourceTool}`)
        console.log('支持的工具: vite, rollup, tsup, unbuild')
        process.exit(1)
    }

    if (!result.success) {
      logger.error('迁移失败')
      process.exit(1)
    }

    console.log(`📄 源配置: ${result.sourceConfig}`)
    console.log('')
    console.log('📝 生成的配置:')
    console.log('─'.repeat(50))
    console.log(result.generatedConfig)
    console.log('─'.repeat(50))

    // 警告
    if (result.warnings.length > 0) {
      console.log('')
      console.log('⚠️  警告:')
      for (const warning of result.warnings) {
        console.log(`   - ${warning}`)
      }
    }

    // 注意事项
    if (result.notes.length > 0) {
      console.log('')
      console.log('💡 注意:')
      for (const note of result.notes) {
        console.log(`   - ${note}`)
      }
    }

    // 写入文件
    if (!options.dryRun) {
      const configPath = resolve(projectPath, 'builder.config.ts')
      
      if (existsSync(configPath) && !options.yes) {
        const readline = await import('readline')
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        const confirmed = await new Promise<boolean>((resolve) => {
          rl.question('\nbuilder.config.ts 已存在，是否覆盖? [y/N]: ', (answer) => {
            rl.close()
            resolve(answer.toLowerCase() === 'y')
          })
        })
        
        if (!confirmed) {
          console.log('已取消')
          return
        }
      }

      writeFileSync(configPath, result.generatedConfig)
      console.log('')
      logger.success('配置已写入 builder.config.ts')
    } else {
      console.log('')
      console.log('(Dry Run 模式，未写入文件)')
    }

    console.log('')
    console.log('📦 下一步:')
    console.log('   1. 检查生成的配置是否正确')
    console.log('   2. 运行 ldesign-builder build 测试构建')
    console.log('   3. 根据需要调整配置')
    console.log('')
  })

export const detectCommand = new Command('detect')
  .description('检测当前使用的构建工具')
  .action(() => {
    const projectPath = process.cwd()
    const tool = detectBuildTool(projectPath)
    
    if (tool) {
      console.log(`\n检测到构建工具: ${tool}\n`)
    } else {
      console.log('\n未检测到已知的构建工具配置\n')
    }
  })

/**
 * 注册迁移命令
 */
export function registerMigrateCommands(program: Command): void {
  program.addCommand(migrateCommand)
  program.addCommand(detectCommand)
}
