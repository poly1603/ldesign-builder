/**
 * TypeScript 类型检查命令
 * 
 * 独立运行 TypeScript 类型检查
 */

import { Command } from 'commander'
import { spawn, execSync } from 'child_process'
import { resolve, join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface TypeCheckResult {
  success: boolean
  errors: number
  warnings: number
  files: number
  duration: number
  errorList: Array<{
    file: string
    line: number
    column: number
    code: string
    message: string
  }>
}

// ========== 工具函数 ==========

function findTscBinary(projectPath: string): string {
  // 优先使用项目本地的 tsc
  const localTsc = join(projectPath, 'node_modules', '.bin', 'tsc')
  const localTscCmd = process.platform === 'win32' ? localTsc + '.cmd' : localTsc
  
  if (existsSync(localTscCmd)) {
    return localTscCmd
  }
  
  // 回退到全局 tsc
  return 'tsc'
}

function parseTscOutput(output: string): TypeCheckResult['errorList'] {
  const errors: TypeCheckResult['errorList'] = []
  const lines = output.split('\n')
  
  // TypeScript 错误格式: file(line,col): error TSxxxx: message
  const errorRegex = /^(.+)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.+)$/
  
  for (const line of lines) {
    const match = line.match(errorRegex)
    if (match) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[5],
        message: match[6]
      })
    }
  }
  
  return errors
}

// ========== 命令定义 ==========

export const typecheckCommand = new Command('typecheck')
  .alias('tsc')
  .description('TypeScript 类型检查')
  .option('-p, --project <path>', 'tsconfig.json 路径')
  .option('--strict', '严格模式')
  .option('--watch', '监听模式')
  .option('--json', '输出 JSON 格式')
  .option('--ci', 'CI 模式 - 有错误时退出码为 1')
  .action(async (options) => {
    const projectPath = process.cwd()
    const tsc = findTscBinary(projectPath)
    
    // 检查 tsconfig.json
    const tsconfigPath = options.project || 'tsconfig.json'
    if (!existsSync(resolve(projectPath, tsconfigPath))) {
      logger.error(`未找到 ${tsconfigPath}`)
      process.exit(1)
    }

    console.log('')
    console.log('🔍 TypeScript 类型检查')
    console.log('─'.repeat(50))
    console.log('')

    const startTime = Date.now()
    
    // 构建命令参数
    const args = ['--noEmit', '--pretty', 'false']
    if (options.project) args.push('-p', options.project)
    if (options.strict) args.push('--strict')
    if (options.watch) args.push('--watch')

    return new Promise<void>((resolve) => {
      const proc = spawn(tsc, args, {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', (data) => {
        stdout += data.toString()
        if (!options.json && !options.watch) {
          process.stdout.write(data)
        }
      })

      proc.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        const duration = (Date.now() - startTime) / 1000
        const errorList = parseTscOutput(stdout + stderr)
        
        const result: TypeCheckResult = {
          success: code === 0,
          errors: errorList.length,
          warnings: 0,
          files: 0,
          duration,
          errorList
        }

        if (options.json) {
          console.log(JSON.stringify(result, null, 2))
        } else {
          console.log('')
          console.log('─'.repeat(50))
          
          if (result.success) {
            logger.success(`✅ 类型检查通过 (${duration.toFixed(2)}s)`)
          } else {
            logger.error(`❌ 发现 ${result.errors} 个类型错误 (${duration.toFixed(2)}s)`)
          }
          console.log('')
        }

        if (options.ci && code !== 0) {
          process.exit(1)
        }
        
        resolve()
      })
    })
  })

export const typecheckInitCommand = new Command('typecheck:init')
  .description('初始化 TypeScript 配置')
  .option('--strict', '使用严格模式')
  .action((options) => {
    const projectPath = process.cwd()
    const tsconfigPath = resolve(projectPath, 'tsconfig.json')
    
    if (existsSync(tsconfigPath)) {
      logger.warn('tsconfig.json 已存在')
      return
    }

    const config: any = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: './dist',
        rootDir: './src',
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        }
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    }

    if (options.strict) {
      config.compilerOptions.strict = true
      config.compilerOptions.noImplicitAny = true
      config.compilerOptions.strictNullChecks = true
      config.compilerOptions.strictFunctionTypes = true
      config.compilerOptions.strictBindCallApply = true
      config.compilerOptions.strictPropertyInitialization = true
      config.compilerOptions.noImplicitThis = true
      config.compilerOptions.alwaysStrict = true
    }

    writeFileSync(tsconfigPath, JSON.stringify(config, null, 2))
    logger.success('tsconfig.json 已创建')
  })

/**
 * 注册类型检查命令
 */
export function registerTypecheckCommands(program: Command): void {
  program.addCommand(typecheckCommand)
  program.addCommand(typecheckInitCommand)
}
