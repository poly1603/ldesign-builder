/**
 * 项目创建命令
 * 
 * 快速创建新项目，支持多种模板
 */

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import { createInterface } from 'readline'
import { logger } from '../../utils/logger'

// ========== 模板定义 ==========

interface ProjectTemplate {
  name: string
  description: string
  files: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

const TEMPLATES: Record<string, ProjectTemplate> = {
  'typescript-lib': {
    name: 'TypeScript 库',
    description: '纯 TypeScript 工具库模板',
    files: {
      'src/index.ts': `/**
 * 主入口文件
 */

export * from './core'
export * from './utils'
export * from './types'
`,
      'src/core/index.ts': `/**
 * 核心功能
 */

export function hello(name: string): string {
  return \`Hello, \${name}!\`
}
`,
      'src/utils/index.ts': `/**
 * 工具函数
 */

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}
`,
      'src/types/index.ts': `/**
 * 类型定义
 */

export interface Options {
  debug?: boolean
  timeout?: number
}
`,
      'builder.config.ts': `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist',
  },
  dts: true,
  sourcemap: true,
  clean: true,
})
`,
      '.gitignore': `node_modules/
dist/
*.log
.DS_Store
.ldesign/
coverage/
`,
      'README.md': `# {{name}}

> {{description}}

## 安装

\`\`\`bash
npm install {{name}}
\`\`\`

## 使用

\`\`\`typescript
import { hello } from '{{name}}'

console.log(hello('World'))
\`\`\`

## 开发

\`\`\`bash
npm install
npm run dev
npm run build
\`\`\`

## 许可证

MIT
`
    },
    devDependencies: {
      '@ldesign/builder': '^1.0.0',
      'typescript': '^5.0.0'
    },
    scripts: {
      'build': 'ldesign-builder build',
      'dev': 'ldesign-builder watch',
      'typecheck': 'ldesign-builder typecheck',
      'clean': 'ldesign-builder clean'
    }
  },

  'vue3-lib': {
    name: 'Vue 3 组件库',
    description: 'Vue 3 组件库模板',
    files: {
      'src/index.ts': `import type { App, Plugin } from 'vue'

// 导出组件
export { default as Button } from './components/Button.vue'

// 导出类型
export * from './types'

// 插件安装
const plugin: Plugin = {
  install(app: App) {
    // 注册全局组件
  }
}

export default plugin
`,
      'src/components/Button.vue': `<template>
  <button 
    class="btn" 
    :class="[type ? \`btn--\${type}\` : '', size ? \`btn--\${size}\` : '']"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.btn--primary { background: #3b82f6; color: white; }
.btn--secondary { background: #6b7280; color: white; }
.btn--danger { background: #ef4444; color: white; }
.btn--small { padding: 4px 8px; font-size: 12px; }
.btn--large { padding: 12px 24px; font-size: 16px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
`,
      'src/types/index.ts': `export interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}
`,
      'builder.config.ts': `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'vue3',
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist',
  },
  dts: true,
  sourcemap: true,
  external: ['vue'],
  clean: true,
})
`
    },
    devDependencies: {
      '@ldesign/builder': '^1.0.0',
      'typescript': '^5.0.0',
      'vue': '^3.4.0'
    },
    scripts: {
      'build': 'ldesign-builder build',
      'dev': 'ldesign-builder watch'
    }
  },

  'react-lib': {
    name: 'React 组件库',
    description: 'React 组件库模板',
    files: {
      'src/index.ts': `export { Button } from './components/Button'
export type { ButtonProps } from './components/Button'

export * from './hooks'
export * from './types'
`,
      'src/components/Button.tsx': `import React from 'react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick
}) => {
  const baseStyles = {
    padding: size === 'small' ? '4px 8px' : size === 'large' ? '12px 24px' : '8px 16px',
    fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: variant === 'primary' ? '#3b82f6' : variant === 'danger' ? '#ef4444' : '#6b7280',
    color: 'white',
    transition: 'all 0.2s'
  }

  return (
    <button style={baseStyles} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
`,
      'src/hooks/index.ts': `import { useState, useCallback } from 'react'

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle] as const
}
`,
      'src/types/index.ts': `export interface CommonProps {
  className?: string
  style?: React.CSSProperties
}
`,
      'builder.config.ts': `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'react',
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist',
  },
  dts: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  clean: true,
})
`
    },
    devDependencies: {
      '@ldesign/builder': '^1.0.0',
      'typescript': '^5.0.0',
      'react': '^18.0.0',
      '@types/react': '^18.0.0'
    },
    scripts: {
      'build': 'ldesign-builder build',
      'dev': 'ldesign-builder watch'
    }
  },

  'node-lib': {
    name: 'Node.js 库',
    description: 'Node.js 工具库模板',
    files: {
      'src/index.ts': `export * from './core'
export * from './utils'
export * from './types'
`,
      'src/core/index.ts': `import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

export function readJSON<T>(filePath: string): T | null {
  const fullPath = resolve(process.cwd(), filePath)
  if (!existsSync(fullPath)) return null
  
  try {
    return JSON.parse(readFileSync(fullPath, 'utf-8'))
  } catch {
    return null
  }
}
`,
      'src/utils/index.ts': `export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
  fn: () => Promise<T>,
  times: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return fn().catch(async (error) => {
    if (times <= 1) throw error
    await delay(delayMs)
    return retry(fn, times - 1, delayMs)
  })
}
`,
      'src/types/index.ts': `export interface Config {
  cwd?: string
  debug?: boolean
}
`,
      'builder.config.ts': `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist',
  },
  dts: true,
  sourcemap: true,
  external: ['path', 'fs', 'os', 'child_process'],
  clean: true,
})
`
    },
    devDependencies: {
      '@ldesign/builder': '^1.0.0',
      'typescript': '^5.0.0',
      '@types/node': '^20.0.0'
    },
    scripts: {
      'build': 'ldesign-builder build',
      'dev': 'ldesign-builder watch'
    }
  },

  'cli-tool': {
    name: 'CLI 工具',
    description: '命令行工具模板',
    files: {
      'src/index.ts': `#!/usr/bin/env node

import { Command } from 'commander'
import { version } from '../package.json'

const program = new Command()

program
  .name('{{name}}')
  .description('{{description}}')
  .version(version)

program
  .command('hello <name>')
  .description('Say hello')
  .option('-u, --uppercase', 'Uppercase output')
  .action((name: string, options) => {
    const greeting = \`Hello, \${name}!\`
    console.log(options.uppercase ? greeting.toUpperCase() : greeting)
  })

program.parse()
`,
      'builder.config.ts': `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['cjs'],
    dir: 'dist',
  },
  dts: false,
  sourcemap: false,
  clean: true,
  // CLI 工具通常不需要外部化依赖
  external: [],
})
`
    },
    dependencies: {
      'commander': '^12.0.0'
    },
    devDependencies: {
      '@ldesign/builder': '^1.0.0',
      'typescript': '^5.0.0',
      '@types/node': '^20.0.0'
    },
    scripts: {
      'build': 'ldesign-builder build',
      'dev': 'ldesign-builder watch',
      'start': 'node dist/index.cjs'
    }
  }
}

// ========== 工具函数 ==========

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

function generatePackageJson(
  name: string,
  description: string,
  template: ProjectTemplate
): object {
  return {
    name,
    version: '0.0.1',
    description,
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs'
      }
    },
    files: ['dist'],
    scripts: {
      ...template.scripts
    },
    keywords: [],
    author: '',
    license: 'MIT',
    dependencies: template.dependencies || {},
    devDependencies: template.devDependencies || {}
  }
}

// ========== 命令定义 ==========

export const createCommand = new Command('create')
  .description('创建新项目')
  .argument('[name]', '项目名称')
  .option('-t, --template <template>', '项目模板')
  .option('-y, --yes', '跳过交互，使用默认值')
  .action(async (name: string | undefined, options) => {
    console.log('')
    console.log('╭─────────────────────────────────────────────────╮')
    console.log('│  🚀 LDesign Builder 项目创建向导                │')
    console.log('╰─────────────────────────────────────────────────╯')
    console.log('')

    // 获取项目名称
    const projectName = name || await prompt('📦 项目名称', 'my-library')
    const projectPath = resolve(process.cwd(), projectName)

    // 检查目录是否已存在
    if (existsSync(projectPath) && readdirSync(projectPath).length > 0) {
      logger.error(`目录 ${projectName} 已存在且不为空`)
      process.exit(1)
    }

    // 选择模板
    let templateKey = options.template
    if (!templateKey) {
      console.log('\n📁 选择项目模板:')
      const templateKeys = Object.keys(TEMPLATES)
      templateKeys.forEach((key, i) => {
        const t = TEMPLATES[key]
        console.log(`  ${i + 1}. ${t.name} - ${t.description}`)
      })
      const answer = await prompt('请选择 [1-5]', '1')
      const index = parseInt(answer) - 1
      templateKey = templateKeys[Math.max(0, Math.min(index, templateKeys.length - 1))]
    }

    const template = TEMPLATES[templateKey]
    if (!template) {
      logger.error(`未知模板: ${templateKey}`)
      console.log('可用模板:', Object.keys(TEMPLATES).join(', '))
      process.exit(1)
    }

    // 获取描述
    const description = options.yes 
      ? `A ${template.name} project`
      : await prompt('📝 项目描述', `A ${template.name} project`)

    // 创建目录
    if (!existsSync(projectPath)) {
      mkdirSync(projectPath, { recursive: true })
    }

    console.log('\n🔧 创建项目文件...\n')

    // 创建文件
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = resolve(projectPath, filePath)
      const dir = resolve(fullPath, '..')
      
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      // 替换模板变量
      const finalContent = content
        .replace(/\{\{name\}\}/g, projectName)
        .replace(/\{\{description\}\}/g, description)

      writeFileSync(fullPath, finalContent)
      console.log(`   ✅ ${filePath}`)
    }

    // 生成 package.json
    const packageJson = generatePackageJson(projectName, description, template)
    writeFileSync(
      resolve(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
    console.log('   ✅ package.json')

    // 生成 tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        resolveJsonModule: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    }

    // React/Vue 需要 JSX 支持
    if (templateKey === 'react-lib') {
      (tsconfig.compilerOptions as any).jsx = 'react-jsx'
    }

    writeFileSync(
      resolve(projectPath, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    )
    console.log('   ✅ tsconfig.json')

    // 添加 .gitignore 如果不存在
    if (!template.files['.gitignore']) {
      writeFileSync(
        resolve(projectPath, '.gitignore'),
        'node_modules/\ndist/\n*.log\n.DS_Store\n.ldesign/\n'
      )
      console.log('   ✅ .gitignore')
    }

    console.log('')
    console.log('╭─────────────────────────────────────────────────╮')
    console.log('│  ✨ 项目创建成功!                               │')
    console.log('├─────────────────────────────────────────────────┤')
    console.log(`│  📂 cd ${projectName.padEnd(38)} │`)
    console.log('│  📦 npm install                                 │')
    console.log('│  🔨 npm run build                               │')
    console.log('╰─────────────────────────────────────────────────╯')
    console.log('')
  })

export const templatesCommand = new Command('templates')
  .description('列出可用模板')
  .action(() => {
    console.log('')
    console.log('📋 可用项目模板')
    console.log('─'.repeat(50))
    
    for (const [key, template] of Object.entries(TEMPLATES)) {
      console.log(`\n  📦 ${key}`)
      console.log(`     ${template.name}`)
      console.log(`     ${template.description}`)
    }
    
    console.log('')
    console.log('使用: ldesign-builder create <name> --template <template>')
    console.log('')
  })

/**
 * 注册创建命令
 */
export function registerCreateCommands(program: Command): void {
  program.addCommand(createCommand)
  program.addCommand(templatesCommand)
}
