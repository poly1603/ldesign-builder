# CLI 命令

@ldesign/builder 提供了强大的命令行工具，让你可以轻松地构建、监听和分析项目。

## 安装

全局安装（可选）：

```bash
npm install -g @ldesign/builder
```

或直接使用 npx：

```bash
npx ldesign-builder <command>
```

## build - 构建项目

构建你的库，生成生产环境代码。

```bash
ldesign-builder build [options]
```

### 选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `-c, --config <path>` | 指定配置文件路径 | 自动查找 |
| `--bundler <bundler>` | 指定打包引擎 | `rollup` |
| `--mode <mode>` | 构建模式 | `production` |
| `--log-level <level>` | 日志级别 | `info` |
| `--no-colors` | 禁用颜色输出 | - |
| `--silent` | 静默模式 | - |
| `--debug` | 调试模式 | - |

### 示例

```bash
# 基础构建
ldesign-builder build

# 使用 esbuild（极速）
ldesign-builder build --bundler esbuild

# 开发模式构建
ldesign-builder build --mode development

# 指定配置文件
ldesign-builder build --config my-config.ts

# 调试模式
ldesign-builder build --debug
```

### 打包引擎选择

```bash
# Rollup - 稳定可靠（默认）
ldesign-builder build --bundler rollup

# esbuild - 极速构建（10-100x）
ldesign-builder build --bundler esbuild

# swc - 快速编译（20x）
ldesign-builder build --bundler swc

# Rolldown - 现代高效
ldesign-builder build --bundler rolldown
```

## watch - 监听模式

监听文件变化，自动重新构建。

```bash
ldesign-builder watch [options]
```

### 选项

与 `build` 命令相同，另外支持：

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--poll <ms>` | 使用轮询模式，间隔毫秒数 | - |
| `--ignore <pattern>` | 忽略文件模式 | - |

### 示例

```bash
# 基础监听
ldesign-builder watch

# 使用 esbuild 监听（开发推荐）
ldesign-builder watch --bundler esbuild

# 轮询模式（网络文件系统）
ldesign-builder watch --poll 1000

# 忽略特定文件
ldesign-builder watch --ignore "**/*.test.ts"
```

## init - 初始化配置

交互式创建配置文件。

```bash
ldesign-builder init [options]
```

### 选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--template <name>` | 使用模板 | - |
| `--force` | 覆盖已存在的配置 | - |

### 示例

```bash
# 交互式初始化
ldesign-builder init

# 使用特定模板
ldesign-builder init --template vue3

# 强制覆盖
ldesign-builder init --force
```

### 可用模板

- `vue3` - Vue 3 组件库
- `react` - React 组件库
- `typescript` - TypeScript 库
- `vanilla` - 纯 JavaScript 库
- `monorepo` - Monorepo 项目

## analyze - 分析构建

生成详细的构建分析报告。

```bash
ldesign-builder analyze [options]
```

### 选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--open` | 自动打开报告 | `false` |
| `--json` | 输出 JSON 格式 | `false` |
| `--output <path>` | 输出路径 | `build-report.html` |

### 示例

```bash
# 生成分析报告
ldesign-builder analyze

# 生成并自动打开
ldesign-builder analyze --open

# 输出 JSON 格式
ldesign-builder analyze --json --output stats.json
```

### 报告内容

- 📦 Bundle 大小分析
- 📊 依赖关系图
- ⏱️ 构建时间分析
- 🎯 优化建议
- 📈 历史趋势对比

## clean - 清理输出

清理所有构建输出目录。

```bash
ldesign-builder clean [options]
```

### 选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--cache` | 同时清理缓存 | `false` |
| `--dry-run` | 仅显示将被删除的文件 | `false` |

### 示例

```bash
# 清理输出目录
ldesign-builder clean

# 同时清理缓存
ldesign-builder clean --cache

# 预览将被删除的文件
ldesign-builder clean --dry-run
```

## examples - 运行示例

查看和运行内置示例项目。

```bash
ldesign-builder examples [options]
```

### 选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--list` | 列出所有示例 | - |
| `--create <name>` | 创建示例项目 | - |
| `--build-all` | 构建所有示例 | - |

### 示例

```bash
# 列出所有示例
ldesign-builder examples --list

# 创建 Vue 3 示例
ldesign-builder examples --create vue3

# 构建所有示例
ldesign-builder examples --build-all
```

## 全局选项

所有命令都支持以下全局选项：

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `-v, --version` | 显示版本号 | - |
| `-h, --help` | 显示帮助信息 | - |
| `--log-level <level>` | 设置日志级别 | `info` |
| `--no-colors` | 禁用颜色输出 | - |
| `--silent` | 静默模式 | - |
| `--debug` | 调试模式 | - |

### 日志级别

- `silent` - 不输出任何信息
- `error` - 仅输出错误
- `warn` - 输出错误和警告
- `info` - 输出基本信息（默认）
- `debug` - 输出调试信息
- `verbose` - 输出详细信息

### 示例

```bash
# 显示版本
ldesign-builder --version

# 显示帮助
ldesign-builder --help

# 仅显示错误
ldesign-builder build --log-level error

# 静默模式
ldesign-builder build --silent

# 调试模式
ldesign-builder build --debug
```

## 在 package.json 中使用

推荐在 `package.json` 中配置脚本：

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "build:dev": "ldesign-builder build --mode development",
    "build:fast": "ldesign-builder build --bundler esbuild",
    "dev": "ldesign-builder watch --bundler esbuild",
    "clean": "ldesign-builder clean",
    "analyze": "ldesign-builder analyze --open"
  }
}
```

然后使用：

```bash
npm run build
npm run dev
npm run analyze
```

## 环境变量

可以通过环境变量配置：

```bash
# 设置日志级别
LOG_LEVEL=debug ldesign-builder build

# 禁用颜色
NO_COLOR=1 ldesign-builder build

# CI 模式
CI=true ldesign-builder build

# 自定义缓存目录
CACHE_DIR=/tmp/builder-cache ldesign-builder build
```

## 退出码

| 退出码 | 描述 |
|--------|------|
| `0` | 成功 |
| `1` | 一般错误 |
| `2` | 配置错误 |
| `3` | 构建失败 |
| `130` | 用户中断 (Ctrl+C) |

## 故障排查

### 构建失败

```bash
# 启用调试模式查看详细信息
ldesign-builder build --debug

# 检查配置是否正确
ldesign-builder build --dry-run
```

### 性能问题

```bash
# 使用更快的打包器
ldesign-builder build --bundler esbuild

# 分析构建瓶颈
ldesign-builder analyze
```

### 缓存问题

```bash
# 清理缓存重新构建
ldesign-builder clean --cache
ldesign-builder build
```

## 下一步

- 📖 了解 [配置文件](/guide/config-file)
- ⚡ 探索 [打包引擎](/guide/bundlers)
- 🔍 查看 [构建分析](/guide/analyze)
- 🛠️ 学习 [插件开发](/guide/plugin-dev)
