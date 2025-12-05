/**
 * CLI 命令处理
 */
import { Logger } from '../logger'
import { loadConfig, type Config } from '../config'

export interface CommandOptions {
  verbose?: boolean
  config?: string
  output?: string
}

export interface Command {
  name: string
  description: string
  options?: CommandOptions
  action: (args: string[], options: CommandOptions) => Promise<void>
}

export class CLI {
  private commands = new Map<string, Command>()
  private logger = new Logger()

  register(command: Command): this {
    this.commands.set(command.name, command)
    return this
  }

  async run(args: string[]): Promise<void> {
    const [commandName, ...commandArgs] = args

    if (!commandName || commandName === 'help') {
      this.showHelp()
      return
    }

    const command = this.commands.get(commandName)
    if (!command) {
      this.logger.error(`Unknown command: ${commandName}`)
      this.showHelp()
      process.exit(1)
    }

    try {
      const options = this.parseOptions(commandArgs)
      await command.action(commandArgs.filter(a => !a.startsWith('-')), options)
    } catch (error) {
      this.logger.error(`Command failed: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  private parseOptions(args: string[]): CommandOptions {
    const options: CommandOptions = {}

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (arg === '-v' || arg === '--verbose') {
        options.verbose = true
      } else if (arg === '-c' || arg === '--config') {
        options.config = args[++i]
      } else if (arg === '-o' || arg === '--output') {
        options.output = args[++i]
      }
    }

    return options
  }

  private showHelp(): void {
    console.log('\nAvailable commands:\n')
    for (const [name, cmd] of this.commands) {
      console.log(`  ${name.padEnd(15)} ${cmd.description}`)
    }
    console.log('')
  }
}

export function createCLI(): CLI {
  return new CLI()
}
