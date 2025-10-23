# @ldesign/builder 迁移指南

## 从 v0.x 迁移到 v1.0

### 主要变更

1. **新增打包器支持**: esbuild 和 swc
2. **配置验证**: 使用 Zod 进行类型安全验证
3. **多层缓存**: 升级为 L1/L2/L3 架构
4. **错误处理**: 智能识别和自动修复
5. **新框架**: 支持 Astro, Nuxt3, Remix, SolidStart

### 配置迁移

#### 旧配置
```typescript
export default {
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true
}
```

#### 新配置
```typescript
export default {
  input: 'src/index.ts',
  output: {
    esm: { dir: 'es', format: 'esm', dts: true },
    cjs: { dir: 'lib', format: 'cjs', dts: true }
  },
  bundler: 'rollup'  // 显式指定（可选）
}
```

### API 变更

#### LibraryBuilder

**新增方法**:
- `setBundler(bundler)` - 切换打包器
- `getBundler()` - 获取当前打包器

**变更**:
- 构建结果新增 `bundler` 字段
- 新增 `validation` 字段（后置验证结果）

---

## 从其他工具迁移

### 从 tsup 迁移

#### tsup 配置
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true
})
```

#### @ldesign/builder 等效配置
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  bundler: 'esbuild',  // tsup 使用 esbuild
  output: {
    esm: { dir: 'dist', format: 'esm', dts: true },
    cjs: { dir: 'dist', format: 'cjs', dts: true }
  },
  sourcemap: true,
  clean: true
})
```

### 从 Rollup 迁移

#### Rollup 配置
```javascript
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.esm.js', format: 'esm' },
    { file: 'dist/index.cjs.js', format: 'cjs' }
  ],
  plugins: [
    typescript(),
    terser()
  ]
}
```

#### @ldesign/builder 等效配置
```typescript
export default {
  input: 'src/index.ts',
  bundler: 'rollup',  // 完全兼容
  output: {
    esm: { dir: 'dist', format: 'esm' },
    cjs: { dir: 'dist', format: 'cjs' }
  },
  minify: true,  // 自动使用 terser
  dts: true      // 自动生成类型声明
}
```

**优势**:
- ✅ 零配置 TypeScript 支持
- ✅ 自动类型声明生成
- ✅ 更简洁的配置
- ✅ 智能框架检测

### 从 Vite Library Mode 迁移

#### Vite 配置
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['vue']
    }
  },
  plugins: [vue()]
})
```

#### @ldesign/builder 等效配置
```typescript
import { presets } from '@ldesign/builder'

export default presets.vueLibrary({
  // 自动检测 Vue，自动配置插件
  external: ['vue']
})
```

**优势**:
- ✅ 预设配置更简单
- ✅ 自动框架检测
- ✅ 多打包器选择
- ✅ 更好的性能

---

## 新功能使用指南

### 1. 使用 esbuild 加速开发

```typescript
// 之前
export default {
  mode: 'development'
}

// 现在
export default {
  bundler: 'esbuild',  // 新增
  mode: 'development'
}
```

**结果**: 构建时间从 5s 降到 0.3s

### 2. 启用自动修复

```typescript
// 代码中使用
import { createEnhancedErrorHandler } from '@ldesign/builder'

const handler = createEnhancedErrorHandler({
  autoFix: true  // 新功能
})
```

**功能**:
- 自动切换打包器（缺失依赖时）
- 自动更新 tsconfig.json（装饰器错误）
- 自动备份配置

### 3. 使用多层缓存

```typescript
// 自动启用
export default {
  cache: true  // 自动使用多层缓存
}

// 或详细配置
export default {
  cache: {
    enabled: true,
    // L1: 内存缓存（自动）
    // L2: 磁盘缓存（自动）
    // L3: 分布式缓存（需配置）
  }
}
```

### 4. 使用新框架

```typescript
// Astro 项目
export default {
  libraryType: 'mixed',  // 自动检测
  // 或手动配置
}

// Nuxt 3 模块
import { Nuxt3Strategy } from '@ldesign/builder'
// 自动应用最佳配置

// Remix 库
import { RemixStrategy } from '@ldesign/builder'
// 自动应用最佳配置
```

---

## 破坏性变更

### 1. 输出目录默认值变更

**之前**:
```
dist/  # 所有格式都在这里
```

**现在**:
```
es/    # ESM 格式
lib/   # CJS 格式  
dist/  # UMD 格式
```

**迁移**:
```typescript
// 如果要保持旧行为
export default {
  output: {
    dir: 'dist'  // 所有格式输出到同一目录
  }
}
```

### 2. 外部依赖默认行为

**之前**: 自动外部化所有 dependencies

**现在**: 需要显式指定（更精确控制）

**迁移**:
```typescript
export default {
  external: ['vue', 'react', 'lodash']  // 显式指定
  
  // 或使用函数
  external: (id) => !id.startsWith('.')
}
```

---

## 兼容性保证

### 向后兼容

所有 v0.x 的配置格式仍然支持：

```typescript
// v0.x 配置（仍然有效）
export default {
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  minify: false
}
```

### 逐步迁移

可以逐步采用新功能：

```typescript
export default {
  // 保留旧配置
  input: 'src/index.ts',
  outDir: 'dist',
  
  // 添加新功能
  bundler: 'esbuild',  // 新增
  cache: true,          // 新增
  
  // 使用新插件
  plugins: [
    imageOptimizerPlugin(),  // 新增
    svgOptimizerPlugin()     // 新增
  ]
}
```

---

## 常见迁移问题

### Q: 类型声明文件路径变了？

**A**: 默认输出路径改变了。

**解决**:
```typescript
export default {
  output: {
    esm: {
      dir: 'dist',  // 指定旧路径
      dts: true
    }
  }
}
```

或更新 package.json:
```json
{
  "types": "./es/index.d.ts"  // 新路径
}
```

### Q: esbuild 不支持我的项目？

**A**: 某些高级 TypeScript 特性不支持。

**解决**:
```typescript
export default {
  bundler: 'swc',  // 切换到 swc
  // 或
  bundler: 'rollup'  // 使用稳定的 rollup
}
```

### Q: 构建产物变大了？

**A**: 检查 external 配置。

**解决**:
```typescript
export default {
  external: ['vue', 'react', 'lodash'],  // 确保外部化
  minify: true  // 启用压缩
}
```

---

## 升级清单

- [ ] 更新依赖: `pnpm add @ldesign/builder@latest -D`
- [ ] 更新配置文件（可选）
- [ ] 测试构建: `pnpm run build`
- [ ] 检查输出文件
- [ ] 更新 package.json 字段（如需要）
- [ ] 运行测试: `pnpm test`
- [ ] 提交变更

---

## 获取帮助

- [API 文档](./API.md)
- [最佳实践](./BEST_PRACTICES.md)
- [故障排除](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/ldesign/builder/issues)


