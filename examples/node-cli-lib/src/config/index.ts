/**
 * 配置加载
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export interface Config {
  name?: string
  version?: string
  output?: string
  plugins?: string[]
  options?: Record<string, any>
}

const CONFIG_FILES = [
  'config.json',
  '.config.json',
  'config.js',
  '.configrc'
]

export function loadConfig(configPath?: string): Config {
  // 优先使用指定的配置文件
  if (configPath) {
    const fullPath = resolve(process.cwd(), configPath)
    if (!existsSync(fullPath)) {
      throw new Error(`Config file not found: ${configPath}`)
    }
    return parseConfigFile(fullPath)
  }

  // 查找默认配置文件
  for (const fileName of CONFIG_FILES) {
    const filePath = resolve(process.cwd(), fileName)
    if (existsSync(filePath)) {
      return parseConfigFile(filePath)
    }
  }

  // 返回默认配置
  return {}
}

function parseConfigFile(filePath: string): Config {
  const content = readFileSync(filePath, 'utf-8')

  if (filePath.endsWith('.json') || filePath.endsWith('rc')) {
    return JSON.parse(content)
  }

  // 对于 .js 文件，需要动态导入
  throw new Error('JS config files are not supported in this example')
}

export function defineConfig(config: Config): Config {
  return config
}
