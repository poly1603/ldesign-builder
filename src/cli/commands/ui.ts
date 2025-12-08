/**
 * Builder UI 命令
 * 
 * 统一的可视化构建控制台，功能包括：
 * - 项目概览和统计
 * - 可视化配置编辑
 * - 构建操作和实时日志
 * - 产物分析
 * - 版本管理
 * - 发布管理
 * - 依赖分析
 * - 许可证扫描
 * - 环境变量管理
 * - 插件管理
 * - 构建历史
 * - 缓存管理
 * - 暗黑模式和主题色切换
 */
import { Command } from 'commander'
import { createUIServer } from './ui-dashboard/server'
import { Logger } from '../../utils/logger'

const logger = new Logger()

export interface UIOptions {
  port?: number
  open?: boolean
  host?: string
}

/**
 * 注册 ui 命令
 */
export function registerUICommand(program: Command): void {
  program
    .command('ui')
    .description('启动可视化构建控制台')
    .option('-p, --port <port>', '服务端口', '4567')
    .option('-H, --host <host>', '服务地址', 'localhost')
    .option('--no-open', '不自动打开浏览器')
    .action(async (options) => {
      const projectPath = process.cwd()

      logger.info('🚀 正在启动 Builder UI 控制台...')

      createUIServer(projectPath, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open,
      })
    })
}
