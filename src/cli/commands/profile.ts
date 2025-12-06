/**
 * 构建配置预设命令
 * 
 * 管理和切换构建配置预设
 */

import { Command } from 'commander'
import { createBuildProfiles } from '../../core/BuildProfiles'
import { logger } from '../../utils/logger'

// ========== 命令定义 ==========

export const profileCommand = new Command('profile')
  .description('构建配置预设管理')
  .addCommand(
    new Command('list')
      .description('列出所有预设')
      .option('--builtin', '仅显示内置预设')
      .option('--custom', '仅显示自定义预设')
      .action((options) => {
        const profiles = createBuildProfiles(process.cwd())
        const activeProfile = profiles.getActiveProfileName()
        
        let list = profiles.getProfiles()
        if (options.builtin) {
          list = profiles.getBuiltinProfiles()
        } else if (options.custom) {
          list = profiles.getCustomProfiles()
        }

        console.log('')
        console.log('📋 构建配置预设')
        console.log('─'.repeat(50))
        
        for (const p of list) {
          const active = p.name === activeProfile ? ' ✓ (当前)' : ''
          const builtin = profiles.getBuiltinProfiles().some(b => b.name === p.name) ? ' [内置]' : ''
          console.log(`\n  📦 ${p.name}${active}${builtin}`)
          if (p.description) {
            console.log(`     ${p.description}`)
          }
          if (p.tags && p.tags.length > 0) {
            console.log(`     标签: ${p.tags.join(', ')}`)
          }
        }
        
        console.log('\n' + '─'.repeat(50))
        console.log(`共 ${list.length} 个预设`)
        console.log('')
      })
  )
  .addCommand(
    new Command('use')
      .description('切换到指定预设')
      .argument('<name>', '预设名称')
      .action((name: string) => {
        const profiles = createBuildProfiles(process.cwd())
        
        if (profiles.setActiveProfile(name)) {
          logger.success(`已切换到预设: ${name}`)
        } else {
          logger.error(`预设 "${name}" 不存在`)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('show')
      .description('显示预设详情')
      .argument('<name>', '预设名称')
      .action((name: string) => {
        const profiles = createBuildProfiles(process.cwd())
        const profile = profiles.getProfile(name)
        
        if (!profile) {
          logger.error(`预设 "${name}" 不存在`)
          process.exit(1)
        }

        console.log('')
        console.log(`📦 预设: ${profile.name}`)
        console.log('─'.repeat(40))
        
        if (profile.description) {
          console.log(`描述: ${profile.description}`)
        }
        if (profile.tags && profile.tags.length > 0) {
          console.log(`标签: ${profile.tags.join(', ')}`)
        }
        
        console.log('\n配置:')
        console.log(JSON.stringify(profile.config, null, 2))
        console.log('')
      })
  )
  .addCommand(
    new Command('create')
      .description('创建自定义预设')
      .argument('<name>', '预设名称')
      .option('-d, --description <desc>', '预设描述')
      .option('-c, --config <json>', '配置 JSON')
      .option('-t, --tags <tags>', '标签 (逗号分隔)')
      .option('--from <profile>', '基于已有预设创建')
      .action((name: string, options) => {
        const profiles = createBuildProfiles(process.cwd())

        try {
          let config = {}
          
          if (options.from) {
            const source = profiles.getProfile(options.from)
            if (!source) {
              logger.error(`源预设 "${options.from}" 不存在`)
              process.exit(1)
            }
            config = { ...source.config }
          }
          
          if (options.config) {
            config = { ...config, ...JSON.parse(options.config) }
          }

          const profile = profiles.createProfile({
            name,
            description: options.description,
            config,
            tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : []
          })

          logger.success(`已创建预设: ${profile.name}`)
        } catch (error) {
          logger.error('创建失败:', error)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('删除自定义预设')
      .argument('<name>', '预设名称')
      .option('-y, --yes', '跳过确认')
      .action(async (name: string, options) => {
        const profiles = createBuildProfiles(process.cwd())

        try {
          if (!options.yes) {
            const readline = await import('readline')
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            })
            
            const confirmed = await new Promise<boolean>((resolve) => {
              rl.question(`确定删除预设 "${name}"? [y/N]: `, (answer) => {
                rl.close()
                resolve(answer.toLowerCase() === 'y')
              })
            })
            
            if (!confirmed) {
              console.log('已取消')
              return
            }
          }

          if (profiles.deleteProfile(name)) {
            logger.success(`已删除预设: ${name}`)
          } else {
            logger.error(`预设 "${name}" 不存在`)
            process.exit(1)
          }
        } catch (error) {
          logger.error('删除失败:', error)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('export')
      .description('导出预设')
      .argument('<name>', '预设名称')
      .option('-o, --output <file>', '输出文件')
      .action(async (name: string, options) => {
        const profiles = createBuildProfiles(process.cwd())

        try {
          const json = profiles.exportProfile(name)
          
          if (options.output) {
            const { writeFileSync } = await import('fs')
            writeFileSync(options.output, json)
            logger.success(`已导出到: ${options.output}`)
          } else {
            console.log(json)
          }
        } catch (error) {
          logger.error('导出失败:', error)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('import')
      .description('导入预设')
      .argument('<file>', '预设文件路径')
      .option('-n, --name <name>', '自定义名称')
      .action(async (file: string, options) => {
        const profiles = createBuildProfiles(process.cwd())

        try {
          const { readFileSync } = await import('fs')
          const json = readFileSync(file, 'utf-8')
          const profile = profiles.importProfile(json, options.name)
          
          logger.success(`已导入预设: ${profile.name}`)
        } catch (error) {
          logger.error('导入失败:', error)
          process.exit(1)
        }
      })
  )

/**
 * 注册预设命令
 */
export function registerProfileCommand(program: Command): void {
  program.addCommand(profileCommand)
}
