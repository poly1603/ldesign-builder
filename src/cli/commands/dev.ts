/**
 * 开发服务器命令
 * 
 * 提供本地开发服务器，支持热重载预览
 */

import { Command } from 'commander'
import { createServer } from 'http'
import { resolve, join, extname } from 'path'
import { existsSync, readFileSync, readdirSync, statSync, watchFile, unwatchFile } from 'fs'
import { spawn, exec } from 'child_process'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface DevOptions {
  port?: string
  host?: string
  open?: boolean
  watch?: boolean
  entry?: string
}

// ========== MIME 类型 ==========

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.cjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
  '.ts': 'application/typescript',
  '.tsx': 'application/typescript',
  '.vue': 'text/plain',
}

// ========== 开发页面模板 ==========

function generateDevPage(projectPath: string, entry?: string): string {
  const pkgPath = resolve(projectPath, 'package.json')
  let pkgName = 'Library'
  let pkgVersion = '0.0.0'
  
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      pkgName = pkg.name || pkgName
      pkgVersion = pkg.version || pkgVersion
    } catch {}
  }

  // 查找构建产物
  const outputDirs = ['dist', 'es', 'lib', 'esm']
  let entryFile = entry || ''
  
  if (!entryFile) {
    for (const dir of outputDirs) {
      const indexJs = resolve(projectPath, dir, 'index.js')
      const indexMjs = resolve(projectPath, dir, 'index.mjs')
      if (existsSync(indexJs)) {
        entryFile = `/${dir}/index.js`
        break
      }
      if (existsSync(indexMjs)) {
        entryFile = `/${dir}/index.mjs`
        break
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pkgName} - Dev Server</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
  <style>
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .code-block { background: #1e293b; color: #e2e8f0; font-family: 'Monaco', 'Consolas', monospace; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-4xl mx-auto p-8">
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div class="gradient-bg p-6 text-white">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <i class="mdi mdi-package-variant text-3xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold">${pkgName}</h1>
            <p class="text-white/80">v${pkgVersion} · 开发服务器</p>
          </div>
        </div>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-blue-50 rounded-xl p-4">
            <div class="text-blue-600 font-medium mb-1"><i class="mdi mdi-file-code mr-1"></i>入口文件</div>
            <div class="text-sm text-gray-600 font-mono">${entryFile || '未找到'}</div>
          </div>
          <div class="bg-green-50 rounded-xl p-4">
            <div class="text-green-600 font-medium mb-1"><i class="mdi mdi-clock mr-1"></i>启动时间</div>
            <div class="text-sm text-gray-600">${new Date().toLocaleString()}</div>
          </div>
        </div>

        <h2 class="font-semibold text-gray-900 mb-3"><i class="mdi mdi-console text-gray-500 mr-2"></i>控制台测试</h2>
        <div class="code-block rounded-xl p-4 mb-6">
          <div class="text-green-400 mb-2">// 在浏览器控制台中测试你的库</div>
          <div class="text-blue-300">import</div> <span class="text-yellow-300">* as lib</span> <span class="text-blue-300">from</span> <span class="text-green-300">'${entryFile}'</span>
          <br>
          <div class="text-gray-500 mt-2">// 库已挂载到 window.${pkgName.replace(/[@\/-]/g, '_')}</div>
        </div>

        <h2 class="font-semibold text-gray-900 mb-3"><i class="mdi mdi-folder-open text-yellow-500 mr-2"></i>构建产物</h2>
        <div id="files" class="space-y-2"></div>

        <div class="mt-6 pt-6 border-t flex items-center justify-between text-sm text-gray-500">
          <span><i class="mdi mdi-information mr-1"></i>文件变化将自动刷新页面</span>
          <button onclick="location.reload()" class="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
            <i class="mdi mdi-refresh mr-1"></i>刷新
          </button>
        </div>
      </div>
    </div>
  </div>

  ${entryFile ? `<script type="module">
    try {
      const lib = await import('${entryFile}')
      window['${pkgName.replace(/[@\/-]/g, '_')}'] = lib
      console.log('📦 ${pkgName} 已加载:', lib)
    } catch (e) {
      console.error('加载失败:', e)
    }
  </script>` : ''}

  <script>
    // 显示文件列表
    async function loadFiles() {
      try {
        const res = await fetch('/__files__')
        const files = await res.json()
        const container = document.getElementById('files')
        container.innerHTML = files.map(f => \`
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-\${f.type === 'js' ? 'language-javascript text-yellow-500' : f.type === 'css' ? 'language-css3 text-blue-500' : f.type === 'json' ? 'code-json text-green-500' : 'file text-gray-400'}"></i>
              <a href="\${f.path}" target="_blank" class="text-blue-600 hover:underline font-mono text-sm">\${f.path}</a>
            </div>
            <span class="text-xs text-gray-500">\${f.size}</span>
          </div>
        \`).join('')
      } catch {}
    }
    loadFiles()

    // 自动刷新
    let lastCheck = Date.now()
    setInterval(async () => {
      try {
        const res = await fetch('/__check__?t=' + lastCheck)
        const data = await res.json()
        if (data.changed) {
          location.reload()
        }
        lastCheck = Date.now()
      } catch {}
    }, 1000)
  </script>
</body>
</html>`
}

// ========== 文件扫描 ==========

function scanOutputFiles(projectPath: string): Array<{ path: string; size: string; type: string }> {
  const files: Array<{ path: string; size: string; type: string }> = []
  const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs', 'umd', 'types']

  for (const dir of outputDirs) {
    const dirPath = resolve(projectPath, dir)
    if (!existsSync(dirPath)) continue

    const scanDir = (path: string, prefix: string) => {
      try {
        const items = readdirSync(path)
        for (const item of items) {
          const itemPath = join(path, item)
          const stat = statSync(itemPath)
          if (stat.isDirectory()) {
            scanDir(itemPath, `${prefix}/${item}`)
          } else {
            const ext = extname(item).slice(1)
            const size = stat.size < 1024 
              ? stat.size + ' B' 
              : stat.size < 1024 * 1024 
                ? (stat.size / 1024).toFixed(1) + ' KB'
                : (stat.size / 1024 / 1024).toFixed(2) + ' MB'
            files.push({ path: `${prefix}/${item}`, size, type: ext })
          }
        }
      } catch {}
    }

    scanDir(dirPath, `/${dir}`)
  }

  return files.slice(0, 50) // 限制数量
}

// ========== 开发服务器 ==========

async function runDevServer(projectPath: string, options: DevOptions): Promise<void> {
  const port = parseInt(options.port || '3000')
  const host = options.host || 'localhost'
  const shouldWatch = options.watch !== false

  let lastModified = Date.now()

  // 创建 HTTP 服务器
  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${host}:${port}`)
    const pathname = url.pathname

    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Cache-Control', 'no-cache')

    // 开发页面
    if (pathname === '/' || pathname === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(generateDevPage(projectPath, options.entry))
      return
    }

    // 文件列表 API
    if (pathname === '/__files__') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(scanOutputFiles(projectPath)))
      return
    }

    // 变更检查 API
    if (pathname === '/__check__') {
      const since = parseInt(url.searchParams.get('t') || '0')
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ changed: lastModified > since }))
      return
    }

    // 静态文件服务
    const filePath = resolve(projectPath, pathname.slice(1))
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath)
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
      res.setHeader('Content-Type', mimeType)
      res.end(readFileSync(filePath))
      return
    }

    // 404
    res.statusCode = 404
    res.end('Not Found')
  })

  // 文件监听
  if (shouldWatch) {
    const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs', 'umd']
    for (const dir of outputDirs) {
      const dirPath = resolve(projectPath, dir)
      if (existsSync(dirPath)) {
        const watchDir = (path: string) => {
          try {
            const items = readdirSync(path)
            for (const item of items) {
              const itemPath = join(path, item)
              const stat = statSync(itemPath)
              if (stat.isDirectory()) {
                watchDir(itemPath)
              } else {
                watchFile(itemPath, { interval: 500 }, () => {
                  lastModified = Date.now()
                })
              }
            }
          } catch {}
        }
        watchDir(dirPath)
      }
    }
  }

  // 启动服务器
  server.listen(port, () => {
    const url = `http://${host}:${port}`
    
    console.log('')
    console.log('╭──────────────────────────────────────────────────╮')
    console.log('│  🚀 LDesign Builder Dev Server                    │')
    console.log('├──────────────────────────────────────────────────┤')
    console.log(`│  📂 项目: ${projectPath.slice(-35).padEnd(35)}  │`)
    console.log(`│  🌐 地址: ${url.padEnd(35)}  │`)
    console.log(`│  👁️  监听: ${(shouldWatch ? '开启' : '关闭').padEnd(35)}  │`)
    console.log('╰──────────────────────────────────────────────────╯')
    console.log('')
    console.log('  按 Ctrl+C 停止服务器')
    console.log('')

    // 自动打开浏览器
    if (options.open !== false) {
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
      exec(`${cmd} ${url}`)
    }
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`端口 ${port} 已被占用，请尝试其他端口`)
    } else {
      logger.error('服务器错误:', err.message)
    }
    process.exit(1)
  })

  // 优雅退出
  process.on('SIGINT', () => {
    console.log('\n👋 服务器已停止')
    server.close()
    process.exit(0)
  })
}

// ========== 命令定义 ==========

export const devCommand = new Command('dev')
  .description('启动开发服务器')
  .option('-p, --port <port>', '服务端口', '3000')
  .option('-H, --host <host>', '服务地址', 'localhost')
  .option('--no-open', '不自动打开浏览器')
  .option('--no-watch', '不监听文件变化')
  .option('-e, --entry <path>', '指定入口文件路径')
  .action(async (options: DevOptions) => {
    try {
      await runDevServer(process.cwd(), options)
    } catch (error) {
      logger.error('启动失败:', error)
      process.exit(1)
    }
  })

export function registerDevCommand(program: Command): void {
  program.addCommand(devCommand)
}
