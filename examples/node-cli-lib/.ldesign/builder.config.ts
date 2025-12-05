/**
 * Node.js CLI 工具库构建配置
 * 
 * @description Node.js 命令行工具库
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口配置（多入口：库和 CLI）
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts',
  },

  // 输出配置（CLI 工具主要使用 CJS）
  formats: ['esm', 'cjs'],

  // 目标平台
  platform: 'node',

  // 构建目标
  target: 'node16',

  // 类型声明
  dts: true,

  // 外部依赖（Node.js 内置模块）
  external: [
    'fs', 'path', 'os', 'child_process', 'util', 'events',
    'commander', 'chalk', 'ora', 'inquirer',
  ],

  // ESM/CJS 互操作
  shims: true,

  // Tree Shaking
  treeshake: true,

  // Banner（CLI 需要 shebang）
  banner: {
    banner: '#!/usr/bin/env node',
  },
})
