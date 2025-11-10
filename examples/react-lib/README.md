# React 组件库示例

这是一个使用 `@ldesign/builder` 构建的 React 组件库示例项目。

## 特性

- ✅ TypeScript 支持
- ✅ Less 样式预处理
- ✅ 三种输出格式：ESM、CJS、UMD
- ✅ 类型声明文件自动生成
- ✅ Sourcemap 支持
- ✅ 代码压缩和优化

## 项目结构

```
react-lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── index.tsx      # Button 组件
│   │   │   └── style.less     # Button 样式
│   │   └── Input/
│   │       ├── index.tsx      # Input 组件
│   │       └── style.less     # Input 样式
│   └── index.ts               # 入口文件
├── builder.config.ts          # 构建配置
├── tsconfig.json              # TypeScript 配置
└── package.json
```

## 构建输出

运行 `npm run build` 后，会生成以下目录：

- `es/` - ESM 格式，保留目录结构，包含类型声明
- `lib/` - CJS 格式，保留目录结构，包含类型声明
- `dist/` - UMD 格式，单文件打包，已压缩

## 使用方法

### 安装依赖

```bash
npm install
```

### 构建

```bash
npm run build
```

### 监听模式

```bash
npm run build:watch
```

### 清理

```bash
npm run clean
```

## 组件示例

### Button 组件

```tsx
import { Button } from '@ldesign/react-lib-example'

function App() {
  return (
    <div>
      <Button type="primary" size="medium">
        Primary Button
      </Button>
      <Button type="default">
        Default Button
      </Button>
      <Button type="danger" disabled>
        Disabled Button
      </Button>
    </div>
  )
}
```

### Input 组件

```tsx
import { Input } from '@ldesign/react-lib-example'

function App() {
  const [value, setValue] = useState('')
  
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="请输入内容"
      size="medium"
    />
  )
}
```

## 配置说明

`builder.config.ts` 配置了三种输出格式：

- **ESM**: 现代 JavaScript 模块格式，支持 tree-shaking
- **CJS**: CommonJS 格式，兼容 Node.js
- **UMD**: 通用模块格式，可在浏览器中直接使用

所有格式都包含：
- TypeScript 类型声明文件
- Source Map 文件
- 样式文件（自动提取）

## License

MIT

