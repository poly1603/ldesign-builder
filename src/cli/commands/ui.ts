/**
 * Builder UI 命令
 * 
 * 启动一个可视化 Web 界面，用于：
 * - 可视化配置编辑
 * - 构建操作和实时日志
 * - 产物查看和分析
 */
import { Command } from 'commander'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { resolve, join } from 'path'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { spawn, exec } from 'child_process'
import { Logger } from '../../utils/logger'
import { ConfigLoader } from '../../utils/config/config-loader'
import type { BuilderConfig } from '../../types/config'

const logger = new Logger()

interface UIOptions {
  port?: number
  open?: boolean
  host?: string
}

/**
 * 获取产物信息
 */
async function getOutputInfo(projectPath: string) {
  const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs', 'umd']
  const outputs: Array<{
    dir: string
    files: Array<{ name: string; size: number; type: string }>
    totalSize: number
  }> = []

  for (const dir of outputDirs) {
    const dirPath = resolve(projectPath, dir)
    if (existsSync(dirPath)) {
      const files: Array<{ name: string; size: number; type: string }> = []
      let totalSize = 0

      const scanDir = (path: string, prefix = '') => {
        const items = readdirSync(path)
        for (const item of items) {
          const itemPath = join(path, item)
          const stat = statSync(itemPath)
          if (stat.isDirectory()) {
            scanDir(itemPath, `${prefix}${item}/`)
          } else {
            const ext = item.split('.').pop() || ''
            files.push({
              name: `${prefix}${item}`,
              size: stat.size,
              type: ext,
            })
            totalSize += stat.size
          }
        }
      }

      scanDir(dirPath)
      outputs.push({ dir, files, totalSize })
    }
  }

  return outputs
}

/**
 * 获取配置信息
 */
async function getConfigInfo(projectPath: string) {
  try {
    const configLoader = new ConfigLoader()
    const configFile = await configLoader.findConfigFile(projectPath)
    if (!configFile) {
      return {
        success: true,
        config: {} as BuilderConfig,
        configFile: null,
      }
    }
    const config = await configLoader.loadConfigFile(configFile)
    return {
      success: true,
      config,
      configFile,
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
      config: null,
    }
  }
}

/**
 * 获取 package.json 信息
 */
function getPackageInfo(projectPath: string) {
  const pkgPath = resolve(projectPath, 'package.json')
  if (existsSync(pkgPath)) {
    return JSON.parse(readFileSync(pkgPath, 'utf-8'))
  }
  return null
}

/**
 * 生成 HTML 页面
 */
function generateHTML(projectPath: string) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Builder UI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    [v-cloak] { display: none; }
    .loading { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .log-line { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; }
    .file-tree { font-family: 'Consolas', 'Monaco', monospace; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div id="app" v-cloak>
    <!-- Header -->
    <header class="bg-white border-b shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">LDesign Builder</h1>
            <p class="text-sm text-gray-500">{{ packageInfo?.name || 'Loading...' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium" v-if="connected">
            ● 已连接
          </span>
          <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium" v-else>
            ○ 未连接
          </span>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            activeTab === tab.id 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- 配置面板 -->
      <div v-show="activeTab === 'config'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <span class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">⚙️</span>
            构建配置
          </h2>
          
          <div v-if="configInfo?.success" class="space-y-4">
            <!-- 基础配置 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">入口文件</label>
                <input type="text" v-model="editConfig.input" 
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">输出目录</label>
                <input type="text" v-model="editConfig.outDir" 
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">打包引擎</label>
                <select v-model="editConfig.bundler" 
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="rollup">Rollup</option>
                  <option value="rolldown">Rolldown</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">构建目标</label>
                <input type="text" v-model="editConfig.target" placeholder="es2020"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>

            <!-- 输出格式 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
              <div class="flex gap-3">
                <label v-for="fmt in ['esm', 'cjs', 'umd', 'iife']" :key="fmt" 
                  class="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  :class="{ 'border-blue-500 bg-blue-50': editConfig.formats?.includes(fmt) }">
                  <input type="checkbox" :value="fmt" v-model="editConfig.formats" class="rounded">
                  <span class="font-mono text-sm">{{ fmt.toUpperCase() }}</span>
                </label>
              </div>
            </div>

            <!-- 开关选项 -->
            <div class="grid grid-cols-4 gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="editConfig.dts" class="rounded">
                <span class="text-sm">类型声明 (DTS)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="editConfig.sourcemap" class="rounded">
                <span class="text-sm">Source Map</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="editConfig.minify" class="rounded">
                <span class="text-sm">压缩代码</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="editConfig.treeshake" class="rounded">
                <span class="text-sm">Tree Shaking</span>
              </label>
            </div>

            <!-- 外部依赖 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">外部依赖（逗号分隔）</label>
              <input type="text" v-model="externalStr" placeholder="vue, react, lodash"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div class="pt-4 border-t flex gap-3">
              <button @click="saveConfig" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                保存配置
              </button>
              <button @click="resetConfig"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                重置
              </button>
            </div>
          </div>
          <div v-else class="text-red-500">
            配置加载失败: {{ configInfo?.error }}
          </div>
        </div>
      </div>

      <!-- 构建面板 -->
      <div v-show="activeTab === 'build'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <span class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">🔨</span>
              构建操作
            </h2>
            <div class="flex gap-2">
              <button @click="startBuild" :disabled="building"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2">
                <span v-if="building" class="animate-spin">⏳</span>
                <span v-else>🚀</span>
                {{ building ? '构建中...' : '开始构建' }}
              </button>
              <button @click="clearLogs"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                清空日志
              </button>
            </div>
          </div>

          <!-- 构建选项 -->
          <div class="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">模式</label>
              <select v-model="buildOptions.mode" class="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="production">Production</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">打包器</label>
              <select v-model="buildOptions.bundler" class="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="">自动</option>
                <option value="rollup">Rollup</option>
                <option value="rolldown">Rolldown</option>
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input type="checkbox" v-model="buildOptions.clean" class="rounded">
              <span class="text-sm">清理输出目录</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input type="checkbox" v-model="buildOptions.analyze" class="rounded">
              <span class="text-sm">分析产物</span>
            </label>
          </div>

          <!-- 日志输出 -->
          <div class="bg-gray-900 rounded-xl p-4 h-96 overflow-y-auto font-mono text-sm" ref="logContainer">
            <div v-for="(log, i) in buildLogs" :key="i" class="log-line" :class="getLogClass(log)">
              {{ log }}
            </div>
            <div v-if="buildLogs.length === 0" class="text-gray-500">
              点击"开始构建"开始打包...
            </div>
          </div>
        </div>
      </div>

      <!-- 产物分析面板 -->
      <div v-show="activeTab === 'output'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <span class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">📦</span>
              产物分析
            </h2>
            <button @click="refreshOutputs"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              🔄 刷新
            </button>
          </div>

          <div v-if="outputs.length === 0" class="text-gray-500 text-center py-12">
            暂无产物，请先执行构建
          </div>

          <div v-else class="space-y-4">
            <!-- 总览 -->
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-blue-600">{{ totalFiles }}</div>
                <div class="text-sm text-blue-600/70">文件总数</div>
              </div>
              <div class="bg-green-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-green-600">{{ formatSize(totalSize) }}</div>
                <div class="text-sm text-green-600/70">总大小</div>
              </div>
              <div class="bg-purple-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-purple-600">{{ outputs.length }}</div>
                <div class="text-sm text-purple-600/70">输出目录</div>
              </div>
              <div class="bg-orange-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-orange-600">{{ jsFiles }}</div>
                <div class="text-sm text-orange-600/70">JS 文件</div>
              </div>
            </div>

            <!-- 目录列表 -->
            <div v-for="output in outputs" :key="output.dir" class="border rounded-xl overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer"
                @click="toggleDir(output.dir)">
                <div class="flex items-center gap-2">
                  <span>{{ expandedDirs[output.dir] ? '📂' : '📁' }}</span>
                  <span class="font-semibold">{{ output.dir }}/</span>
                  <span class="text-gray-500 text-sm">({{ output.files.length }} 文件)</span>
                </div>
                <div class="text-sm text-gray-600">{{ formatSize(output.totalSize) }}</div>
              </div>
              <div v-show="expandedDirs[output.dir]" class="divide-y max-h-64 overflow-y-auto">
                <div v-for="file in output.files" :key="file.name"
                  class="px-4 py-2 flex items-center justify-between hover:bg-gray-50 file-tree text-sm">
                  <div class="flex items-center gap-2">
                    <span>{{ getFileIcon(file.type) }}</span>
                    <span>{{ file.name }}</span>
                  </div>
                  <div class="text-gray-500">{{ formatSize(file.size) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const { createApp, ref, reactive, computed, onMounted, watch, nextTick } = Vue

    createApp({
      setup() {
        const connected = ref(false)
        const ws = ref(null)
        const activeTab = ref('build')
        const tabs = [
          { id: 'config', name: '⚙️ 配置' },
          { id: 'build', name: '🔨 构建' },
          { id: 'output', name: '📦 产物' },
        ]

        const packageInfo = ref(null)
        const configInfo = ref(null)
        const outputs = ref([])
        const buildLogs = ref([])
        const building = ref(false)
        const logContainer = ref(null)
        const expandedDirs = reactive({})

        const editConfig = reactive({
          input: 'src/index.ts',
          outDir: 'dist',
          bundler: 'rollup',
          target: 'es2020',
          formats: ['esm', 'cjs'],
          dts: true,
          sourcemap: true,
          minify: false,
          treeshake: true,
          external: [],
        })

        const externalStr = computed({
          get: () => editConfig.external?.join(', ') || '',
          set: (val) => { editConfig.external = val.split(',').map(s => s.trim()).filter(Boolean) }
        })

        const buildOptions = reactive({
          mode: 'production',
          bundler: '',
          clean: true,
          analyze: false,
        })

        const totalFiles = computed(() => outputs.value.reduce((sum, o) => sum + o.files.length, 0))
        const totalSize = computed(() => outputs.value.reduce((sum, o) => sum + o.totalSize, 0))
        const jsFiles = computed(() => outputs.value.reduce((sum, o) => 
          sum + o.files.filter(f => f.type === 'js' || f.type === 'mjs' || f.type === 'cjs').length, 0))

        function formatSize(bytes) {
          if (bytes < 1024) return bytes + ' B'
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
          return (bytes / 1024 / 1024).toFixed(2) + ' MB'
        }

        function getFileIcon(type) {
          const icons = {
            js: '📜', mjs: '📜', cjs: '📜',
            ts: '📘', dts: '📘',
            css: '🎨', less: '🎨', scss: '🎨',
            json: '📋', map: '🗺️',
            vue: '💚', jsx: '⚛️', tsx: '⚛️',
            woff: '🔤', woff2: '🔤', ttf: '🔤',
          }
          return icons[type] || '📄'
        }

        function getLogClass(log) {
          if (log.includes('error') || log.includes('Error') || log.includes('失败')) return 'text-red-400'
          if (log.includes('warning') || log.includes('Warning') || log.includes('警告')) return 'text-yellow-400'
          if (log.includes('success') || log.includes('成功') || log.includes('✓')) return 'text-green-400'
          if (log.includes('info') || log.includes('ℹ')) return 'text-blue-400'
          return 'text-gray-300'
        }

        function toggleDir(dir) {
          expandedDirs[dir] = !expandedDirs[dir]
        }

        function connectWS() {
          const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
          ws.value = new WebSocket(protocol + '//' + location.host)
          
          ws.value.onopen = () => {
            connected.value = true
            send({ type: 'init' })
          }
          
          ws.value.onclose = () => {
            connected.value = false
            setTimeout(connectWS, 2000)
          }
          
          ws.value.onmessage = (event) => {
            const data = JSON.parse(event.data)
            handleMessage(data)
          }
        }

        function send(data) {
          if (ws.value?.readyState === WebSocket.OPEN) {
            ws.value.send(JSON.stringify(data))
          }
        }

        function handleMessage(data) {
          switch (data.type) {
            case 'init':
              packageInfo.value = data.packageInfo
              configInfo.value = data.configInfo
              outputs.value = data.outputs || []
              if (data.configInfo?.config) {
                Object.assign(editConfig, {
                  input: data.configInfo.config.input || 'src/index.ts',
                  outDir: data.configInfo.config.output?.dir || 'dist',
                  bundler: data.configInfo.config.bundler || 'rollup',
                  formats: data.configInfo.config.output?.format || ['esm', 'cjs'],
                  dts: data.configInfo.config.dts !== false,
                  sourcemap: data.configInfo.config.sourcemap !== false,
                  minify: !!data.configInfo.config.minify,
                  treeshake: data.configInfo.config.performance?.treeshaking !== false,
                  external: data.configInfo.config.external || [],
                })
              }
              break
            case 'log':
              buildLogs.value.push(data.message)
              nextTick(() => {
                if (logContainer.value) {
                  logContainer.value.scrollTop = logContainer.value.scrollHeight
                }
              })
              break
            case 'buildStart':
              building.value = true
              break
            case 'buildEnd':
              building.value = false
              refreshOutputs()
              break
            case 'outputs':
              outputs.value = data.outputs || []
              break
          }
        }

        function startBuild() {
          buildLogs.value = []
          send({ type: 'build', options: buildOptions })
        }

        function clearLogs() {
          buildLogs.value = []
        }

        function saveConfig() {
          send({ type: 'saveConfig', config: editConfig })
        }

        function resetConfig() {
          send({ type: 'init' })
        }

        function refreshOutputs() {
          send({ type: 'getOutputs' })
        }

        onMounted(() => {
          connectWS()
        })

        return {
          connected, activeTab, tabs,
          packageInfo, configInfo, outputs, buildLogs, building, logContainer,
          editConfig, externalStr, buildOptions, expandedDirs,
          totalFiles, totalSize, jsFiles,
          formatSize, getFileIcon, getLogClass, toggleDir,
          startBuild, clearLogs, saveConfig, resetConfig, refreshOutputs,
        }
      }
    }).mount('#app')
  </script>
</body>
</html>`
}

/**
 * 创建 UI 服务器
 */
export function createUIServer(projectPath: string, options: UIOptions) {
  const port = options.port || 4567
  const host = options.host || 'localhost'

  const server = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.url === '/' || req.url === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(generateHTML(projectPath))
    } else {
      res.statusCode = 404
      res.end('Not Found')
    }
  })

  // WebSocket 服务
  const wss = new WebSocketServer({ server })

  wss.on('connection', async (ws) => {
    logger.info('🔗 客户端已连接')

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        await handleWSMessage(ws, data, projectPath)
      } catch (error) {
        logger.error('消息处理失败:', error)
      }
    })

    ws.on('close', () => {
      logger.info('🔌 客户端已断开')
    })
  })

  server.listen(port, host, () => {
    const url = `http://${host}:${port}`
    logger.info('')
    logger.info('╭─────────────────────────────────────────────╮')
    logger.info('│  🎨 LDesign Builder UI                       │')
    logger.info('├─────────────────────────────────────────────┤')
    logger.info(`│  📂 项目: ${projectPath.slice(-30).padEnd(30)}  │`)
    logger.info(`│  🌐 地址: ${url.padEnd(30)}  │`)
    logger.info('╰─────────────────────────────────────────────╯')
    logger.info('')

    // 自动打开浏览器
    if (options.open !== false) {
      const openCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
      exec(`${openCmd} ${url}`)
    }
  })

  return server
}

/**
 * 处理 WebSocket 消息
 */
async function handleWSMessage(ws: import('ws').WebSocket, data: any, projectPath: string) {
  switch (data.type) {
    case 'init':
      const packageInfo = getPackageInfo(projectPath)
      const configInfo = await getConfigInfo(projectPath)
      const outputs = await getOutputInfo(projectPath)
      ws.send(JSON.stringify({
        type: 'init',
        packageInfo,
        configInfo,
        outputs,
      }))
      break

    case 'build':
      ws.send(JSON.stringify({ type: 'buildStart' }))

      // 执行构建
      const args = ['ldesign-builder', 'build']

      if (data.options?.mode) args.push('--mode', data.options.mode)
      if (data.options?.bundler) args.push('--bundler', data.options.bundler)
      if (data.options?.clean) args.push('--clean')

      const child = spawn('npx', args, {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      })

      child.stdout.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line: string) => {
          ws.send(JSON.stringify({ type: 'log', message: line }))
        })
      })

      child.stderr.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean)
        lines.forEach((line: string) => {
          ws.send(JSON.stringify({ type: 'log', message: line }))
        })
      })

      child.on('close', (code: number) => {
        ws.send(JSON.stringify({
          type: 'log',
          message: code === 0 ? '✅ 构建完成' : `❌ 构建失败 (退出码: ${code})`
        }))
        ws.send(JSON.stringify({ type: 'buildEnd', success: code === 0 }))
      })
      break

    case 'getOutputs':
      const newOutputs = await getOutputInfo(projectPath)
      ws.send(JSON.stringify({ type: 'outputs', outputs: newOutputs }))
      break

    case 'saveConfig':
      // TODO: 保存配置到文件
      ws.send(JSON.stringify({ type: 'log', message: '⚠️ 配置保存功能开发中...' }))
      break
  }
}

/**
 * 注册 ui 命令
 */
export function registerUICommand(program: Command): void {
  program
    .command('ui')
    .description('启动可视化构建界面')
    .option('-p, --port <port>', '服务端口', '4567')
    .option('-H, --host <host>', '服务地址', 'localhost')
    .option('--no-open', '不自动打开浏览器')
    .action(async (options) => {
      const projectPath = process.cwd()

      logger.info('🚀 正在启动 Builder UI...')

      createUIServer(projectPath, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open,
      })
    })
}
