/**
 * 组件库样式处理插件
 * 
 * 支持 TDesign 风格的组件库样式分离:
 * 1. 从组件入口移除样式导入
 * 2. 复制/编译样式文件到输出目录
 * 3. 生成 style/index.js 和 style/css.js 入口文件
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import type { Plugin } from 'rollup'
import type { Logger } from '../utils/logger'

export interface ComponentStylePluginOptions {
  /** 源目录 */
  srcDir?: string
  /** 输出目录 */
  outputDir: string
  /** 是否编译 Less 到 CSS */
  compileLess?: boolean
  /** 是否保留 Less 源文件 */
  preserveLessSource?: boolean
  /** 日志记录器 */
  logger?: Logger
}

/**
 * 检测项目是否是组件库结构
 * 
 * 组件库特征:
 * 1. 有多个组件目录 (button, input, select 等)
 * 2. 每个组件目录有 style/ 子目录
 * 3. 组件入口文件 (index.ts) 导入 ./style
 */
export async function detectComponentLibraryStructure(srcDir: string): Promise<{
  isComponentLibrary: boolean
  components: string[]
}> {
  const result = {
    isComponentLibrary: false,
    components: [] as string[]
  }

  if (!fs.existsSync(srcDir)) {
    return result
  }

  try {
    const entries = await fsPromises.readdir(srcDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      // 跳过常见的非组件目录
      if (['style', 'styles', 'utils', 'hooks', 'common', 'types', 'shared', '_utils', '_common'].includes(entry.name)) {
        continue
      }

      const componentDir = path.join(srcDir, entry.name)
      const styleDir = path.join(componentDir, 'style')
      const indexFile = path.join(componentDir, 'index.ts')
      const indexTsxFile = path.join(componentDir, 'index.tsx')

      // 检查是否有 style 目录和入口文件
      const hasStyleDir = fs.existsSync(styleDir)
      const hasIndex = fs.existsSync(indexFile) || fs.existsSync(indexTsxFile)

      if (hasStyleDir && hasIndex) {
        result.components.push(entry.name)
      }
    }

    // 至少有2个组件目录才认为是组件库
    result.isComponentLibrary = result.components.length >= 2

    return result
  } catch (error) {
    return result
  }
}

/**
 * 创建组件库样式处理插件
 */
export function createComponentStylePlugin(options: ComponentStylePluginOptions): Plugin {
  const {
    srcDir = 'src',
    outputDir,
    compileLess = true,
    preserveLessSource = false,
    logger
  } = options

  const log = (message: string, ...args: any[]) => {
    if (logger) {
      logger.debug(message, ...args)
    }
  }

  // 样式导入正则表达式
  const styleImportRegex = /import\s+['"]\.\/style['"]\s*;?\n?/g
  const styleImportRegex2 = /import\s+['"]\.\/style\/index['"]\s*;?\n?/g
  const styleImportRegex3 = /import\s+['"]\.\/style\/index\.js['"]\s*;?\n?/g

  return {
    name: 'component-style',

    /**
     * 在 transform 阶段移除样式导入
     */
    transform(code, id) {
      // 只处理组件入口文件
      if (!id.endsWith('/index.ts') && !id.endsWith('/index.tsx') &&
        !id.endsWith('\\index.ts') && !id.endsWith('\\index.tsx')) {
        return null
      }

      // 检查是否导入了 ./style
      if (!styleImportRegex.test(code) && !styleImportRegex2.test(code) && !styleImportRegex3.test(code)) {
        return null
      }

      // 重置正则状态
      styleImportRegex.lastIndex = 0
      styleImportRegex2.lastIndex = 0
      styleImportRegex3.lastIndex = 0

      // 移除样式导入
      const newCode = code
        .replace(styleImportRegex, '')
        .replace(styleImportRegex2, '')
        .replace(styleImportRegex3, '')

      log(`[component-style] 移除样式导入: ${path.relative(process.cwd(), id)}`)

      return {
        code: newCode,
        map: null
      }
    },

    /**
     * 在 writeBundle 阶段处理样式文件
     */
    async writeBundle() {
      log('[component-style] 开始处理组件样式文件...')

      const srcPath = path.resolve(process.cwd(), srcDir)
      const outputPath = path.resolve(process.cwd(), outputDir)

      // 检测组件库结构
      const { isComponentLibrary, components } = await detectComponentLibraryStructure(srcPath)

      if (!isComponentLibrary) {
        log('[component-style] 未检测到组件库结构，跳过样式处理')
        return
      }

      log(`[component-style] 检测到 ${components.length} 个组件: ${components.join(', ')}`)

      // 尝试加载 Less 编译器
      let less: any = null
      if (compileLess) {
        try {
          less = await import('less')
          less = less.default || less
        } catch (e) {
          log('[component-style] Less 未安装，将直接复制 Less 文件')
        }
      }

      // 处理每个组件的样式
      for (const component of components) {
        await processComponentStyle(
          srcPath,
          outputPath,
          component,
          less,
          preserveLessSource,
          log
        )
      }

      // 处理全局样式目录 (src/style)
      const globalStyleSrc = path.join(srcPath, 'style')
      if (fs.existsSync(globalStyleSrc)) {
        await processGlobalStyle(
          globalStyleSrc,
          path.join(outputPath, 'style'),
          less,
          log
        )
      }

      log('[component-style] 样式处理完成')
    }
  }
}

/**
 * 处理单个组件的样式
 */
async function processComponentStyle(
  srcPath: string,
  outputPath: string,
  component: string,
  less: any,
  preserveLessSource: boolean,
  log: (msg: string, ...args: any[]) => void
) {
  const srcStyleDir = path.join(srcPath, component, 'style')
  const outStyleDir = path.join(outputPath, component, 'style')

  if (!fs.existsSync(srcStyleDir)) {
    return
  }

  // 创建输出目录
  await fsPromises.mkdir(outStyleDir, { recursive: true })

  const styleFiles = await fsPromises.readdir(srcStyleDir)
  let mainLessFile: string | null = null
  let mainCssFile: string | null = null

  // 查找主要的样式文件
  for (const file of styleFiles) {
    if (file.endsWith('.less') && !mainLessFile) {
      mainLessFile = file
    }
    if (file.endsWith('.css') && !mainCssFile) {
      mainCssFile = file
    }
  }

  // 编译 Less 或复制 CSS
  if (mainLessFile && less) {
    const lessPath = path.join(srcStyleDir, mainLessFile)
    const cssFileName = mainLessFile.replace('.less', '.css')
    const cssPath = path.join(outStyleDir, cssFileName)

    try {
      const lessContent = await fsPromises.readFile(lessPath, 'utf-8')
      const result = await less.render(lessContent, {
        filename: lessPath,
        paths: [srcStyleDir, srcPath]
      })
      await fsPromises.writeFile(cssPath, result.css, 'utf-8')
      log(`[component-style] 编译 Less: ${component}/style/${mainLessFile} -> ${cssFileName}`)
      mainCssFile = cssFileName
    } catch (e: any) {
      log(`[component-style] Less 编译失败 (${component}): ${e.message}`)
      // 尝试复制已存在的 CSS 文件
      const existingCss = styleFiles.find(f => f.endsWith('.css'))
      if (existingCss) {
        await fsPromises.copyFile(
          path.join(srcStyleDir, existingCss),
          path.join(outStyleDir, existingCss)
        )
        mainCssFile = existingCss
      }
    }

    // 保留 Less 源文件
    if (preserveLessSource) {
      await fsPromises.copyFile(lessPath, path.join(outStyleDir, mainLessFile))
    }
  } else if (mainCssFile) {
    // 直接复制 CSS 文件
    await fsPromises.copyFile(
      path.join(srcStyleDir, mainCssFile),
      path.join(outStyleDir, mainCssFile)
    )
    log(`[component-style] 复制 CSS: ${component}/style/${mainCssFile}`)
  }

  // 生成 style/index.js (导入 CSS)
  if (mainCssFile || mainLessFile) {
    const cssToImport = mainCssFile || mainLessFile!.replace('.less', '.css')
    const indexJsContent = `import './${cssToImport}';\n`
    await fsPromises.writeFile(
      path.join(outStyleDir, 'index.js'),
      indexJsContent,
      'utf-8'
    )

    // 生成 style/css.js (同样导入 CSS，用于按需加载)
    await fsPromises.writeFile(
      path.join(outStyleDir, 'css.js'),
      indexJsContent,
      'utf-8'
    )

    log(`[component-style] 生成样式入口: ${component}/style/index.js, css.js`)
  }
}

/**
 * 处理全局样式目录
 */
async function processGlobalStyle(
  srcStyleDir: string,
  outStyleDir: string,
  less: any,
  log: (msg: string, ...args: any[]) => void
) {
  if (!fs.existsSync(srcStyleDir)) {
    return
  }

  await fsPromises.mkdir(outStyleDir, { recursive: true })

  const files = await fsPromises.readdir(srcStyleDir)

  for (const file of files) {
    const srcFile = path.join(srcStyleDir, file)
    const outFile = path.join(outStyleDir, file)
    const stat = await fsPromises.stat(srcFile)

    if (stat.isDirectory()) {
      // 递归处理子目录
      await processGlobalStyle(srcFile, outFile, less, log)
    } else if (file.endsWith('.less') && less) {
      // 编译 Less
      try {
        const lessContent = await fsPromises.readFile(srcFile, 'utf-8')
        const result = await less.render(lessContent, {
          filename: srcFile,
          paths: [srcStyleDir, path.dirname(srcStyleDir)]
        })
        const cssFile = outFile.replace('.less', '.css')
        await fsPromises.writeFile(cssFile, result.css, 'utf-8')
        log(`[component-style] 编译全局样式: ${file}`)
      } catch (e: any) {
        log(`[component-style] Less 编译失败: ${e.message}`)
      }
    } else if (file.endsWith('.css') || file.endsWith('.js')) {
      // 复制 CSS 和 JS 文件
      await fsPromises.copyFile(srcFile, outFile)
    }
  }
}

export default createComponentStylePlugin
