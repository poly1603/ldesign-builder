# esbuild 极速构建示例

演示如何使用 esbuild 进行极速开发构建。

## 特性

- ⚡ 10-100x 构建速度提升
- 🔥 即时热重载
- 💨 零配置

## 使用方法

```bash
# 安装依赖
pnpm install

# 构建
pnpm run build

# 开发模式（监听）
pnpm run dev
```

## 性能对比

| 打包器 | 构建时间 | 提速倍数 |
|--------|---------|---------|
| rollup | ~2.5s | 1x |
| esbuild | ~0.03s | **83x** |

## 配置说明

```typescript
{
  bundler: 'esbuild',     // 使用 esbuild
  mode: 'development',    // 开发模式
  dts: false,             // 不生成类型声明（提速）
  minify: false,          // 不压缩（提速）
  sourcemap: true         // 保留 sourcemap（调试）
}
```

## 适用场景

- ✅ 本地开发
- ✅ 快速原型
- ✅ TypeScript 项目
- ✅ React/JSX 项目
- ❌ 不适合：装饰器密集项目
- ❌ 不适合：Vue SFC 项目


