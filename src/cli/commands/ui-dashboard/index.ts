/**
 * Builder UI Dashboard - 主入口
 * 
 * 功能丰富的构建工具仪表盘
 */

import { Command } from 'commander'
import { createUIServer } from './server'
import { Logger } from '../../../utils/logger'

const logger = new Logger()

export interface DashboardOptions {
  port?: number
  open?: boolean
  host?: string
}

/**
 * 注册 dashboard 命令
 */
export function registerDashboardCommand(program: Command): void {
  program
    .command('dashboard')
    .alias('dash')
    .description('启动增强版可视化构建界面')
    .option('-p, --port <port>', '服务端口', '4568')
    .option('-H, --host <host>', '服务地址', 'localhost')
    .option('--no-open', '不自动打开浏览器')
    .action(async (options) => {
      const projectPath = process.cwd()
      
      logger.info('🚀 正在启动 Builder Dashboard...')
      
      createUIServer(projectPath, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open,
      })
    })
}

export { createUIServer }
