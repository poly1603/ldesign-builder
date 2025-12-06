/**
 * Builder UI Dashboard - HTML模板
 */

export function generateDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Builder Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
  <style>
    [v-cloak] { display: none; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
    .log-container { font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; }
    .log-line { padding: 2px 8px; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .progress-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width 0.3s ease; }
    .dark { background-color: #0f172a; color: #e2e8f0; }
    .dark .bg-white { background-color: #1e293b !important; }
    .dark .border { border-color: #334155 !important; }
    .dark .text-gray-900 { color: #f1f5f9 !important; }
    .dark .text-gray-600 { color: #94a3b8 !important; }
    .dark .bg-gray-50 { background-color: #0f172a !important; }
    .dark input, .dark select { background-color: #0f172a !important; border-color: #334155 !important; color: #e2e8f0 !important; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div id="app" v-cloak :class="{ 'dark': darkMode }">
    <!-- 侧边栏 -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm z-40 flex flex-col">
      <div class="p-4 border-b">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
            <i class="mdi mdi-package-variant text-white text-xl"></i>
          </div>
          <div>
            <h1 class="font-bold text-gray-900">LDesign Builder</h1>
            <p class="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>
      
      <nav class="flex-1 p-3 overflow-y-auto">
        <div class="space-y-1">
          <button v-for="item in menuItems" :key="item.id" @click="activeTab = item.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            :class="activeTab === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'">
            <i :class="['mdi', item.icon, 'text-lg']"></i>
            <span>{{ item.name }}</span>
          </button>
        </div>
        
        <div class="mt-6 pt-4 border-t">
          <p class="px-3 text-xs font-medium text-gray-400 mb-2">快捷操作</p>
          <button @click="quickBuild('production')" :disabled="building"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 mb-1">
            <i class="mdi mdi-rocket-launch"></i><span>生产构建</span>
          </button>
          <button @click="quickBuild('development')" :disabled="building"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i class="mdi mdi-bug"></i><span>开发构建</span>
          </button>
        </div>
      </nav>
      
      <div class="p-3 border-t flex items-center justify-between text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'"></span>
          {{ connected ? '已连接' : '未连接' }}
        </span>
        <button @click="darkMode = !darkMode" class="p-1.5 rounded-lg hover:bg-gray-100">
          <i :class="['mdi', darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night']"></i>
        </button>
      </div>
    </aside>
    
    <!-- 主内容 -->
    <main class="ml-64 min-h-screen">
      <header class="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-30">
        <div class="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ currentMenuItem?.name }}</h2>
            <p class="text-sm text-gray-500">{{ packageInfo?.name || '加载中...' }}</p>
          </div>
          <div class="flex items-center gap-3">
            <div v-if="building" class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm">
              <i class="mdi mdi-loading animate-spin"></i>构建中...
            </div>
            <button @click="refresh" class="p-2 rounded-lg hover:bg-gray-100"><i class="mdi mdi-refresh text-xl text-gray-600"></i></button>
          </div>
        </div>
      </header>
      
      <div class="p-6">
        <!-- 概览 -->
        <div v-show="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i class="mdi mdi-file-document-multiple text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ totalFiles }}</div>
              <div class="text-sm text-gray-500">输出文件</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <i class="mdi mdi-harddisk text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ formatSize(totalSize) }}</div>
              <div class="text-sm text-gray-500">总大小</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <i class="mdi mdi-clock-fast text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ lastBuildDuration }}s</div>
              <div class="text-sm text-gray-500">上次构建</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <i class="mdi mdi-cached text-orange-600 text-xl"></i>
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ Math.round(cacheInfo.hitRate * 100) }}%</div>
              <div class="text-sm text-gray-500">缓存命中</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-information text-blue-500 mr-2"></i>项目信息</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between py-2 border-b border-dashed"><span class="text-gray-500">名称</span><span class="font-medium">{{ packageInfo?.name || '-' }}</span></div>
                <div class="flex justify-between py-2 border-b border-dashed"><span class="text-gray-500">版本</span><span class="font-medium">{{ packageInfo?.version || '-' }}</span></div>
                <div class="flex justify-between py-2 border-b border-dashed"><span class="text-gray-500">引擎</span><span class="font-medium">{{ configInfo?.config?.bundler || 'rollup' }}</span></div>
                <div class="flex justify-between py-2"><span class="text-gray-500">配置</span><span class="font-mono text-xs">{{ configInfo?.configFile ? configInfo.configFile.split(/[\\\\/]/).pop() : '默认' }}</span></div>
              </div>
            </div>
            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-chart-line text-green-500 mr-2"></i>构建统计</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-1"><span class="text-gray-500">成功率</span><span>{{ buildSuccessRate }}%</span></div>
                  <div class="progress-bar"><div class="progress-bar-fill" :style="{ width: buildSuccessRate + '%' }"></div></div>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center pt-3 border-t">
                  <div><div class="text-2xl font-bold text-green-600">{{ successCount }}</div><div class="text-xs text-gray-500">成功</div></div>
                  <div><div class="text-2xl font-bold text-red-600">{{ failCount }}</div><div class="text-xs text-gray-500">失败</div></div>
                  <div><div class="text-2xl font-bold text-gray-900">{{ buildHistory.length }}</div><div class="text-xs text-gray-500">总计</div></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-lightning-bolt text-yellow-500 mr-2"></i>快速操作</h3>
            <div class="grid grid-cols-4 gap-4">
              <button @click="quickBuild('production')" :disabled="building" class="p-4 rounded-xl border-2 border-dashed hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50">
                <i class="mdi mdi-rocket-launch text-2xl text-gray-400 group-hover:text-green-500 mb-2"></i>
                <div class="font-medium text-gray-700">生产构建</div>
              </button>
              <button @click="quickBuild('development')" :disabled="building" class="p-4 rounded-xl border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50">
                <i class="mdi mdi-bug text-2xl text-gray-400 group-hover:text-blue-500 mb-2"></i>
                <div class="font-medium text-gray-700">开发构建</div>
              </button>
              <button @click="activeTab = 'output'" class="p-4 rounded-xl border-2 border-dashed hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <i class="mdi mdi-chart-box text-2xl text-gray-400 group-hover:text-purple-500 mb-2"></i>
                <div class="font-medium text-gray-700">分析产物</div>
              </button>
              <button @click="clearCacheAction" class="p-4 rounded-xl border-2 border-dashed hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <i class="mdi mdi-delete-sweep text-2xl text-gray-400 group-hover:text-orange-500 mb-2"></i>
                <div class="font-medium text-gray-700">清理缓存</div>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 配置 -->
        <div v-show="activeTab === 'config'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-cog text-blue-500 mr-2"></i>构建配置</h3>
              <div class="flex gap-2">
                <button @click="resetConfig" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">重置</button>
                <button @click="saveConfig" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存配置</button>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">入口文件</label><input v-model="editConfig.input" class="w-full px-4 py-2 border rounded-xl"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">输出目录</label><input v-model="editConfig.outDir" class="w-full px-4 py-2 border rounded-xl"></div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">打包引擎</label>
                  <select v-model="editConfig.bundler" class="w-full px-4 py-2 border rounded-xl">
                    <option value="rollup">Rollup</option><option value="rolldown">Rolldown</option><option value="esbuild">esbuild</option>
                  </select>
                </div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">构建目标</label>
                  <select v-model="editConfig.target" class="w-full px-4 py-2 border rounded-xl">
                    <option value="es2018">ES2018</option><option value="es2020">ES2020</option><option value="es2022">ES2022</option><option value="esnext">ESNext</option>
                  </select>
                </div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">平台</label>
                  <select v-model="editConfig.platform" class="w-full px-4 py-2 border rounded-xl">
                    <option value="neutral">通用</option><option value="browser">浏览器</option><option value="node">Node.js</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                <div class="flex gap-3">
                  <label v-for="fmt in ['esm', 'cjs', 'umd', 'iife']" :key="fmt" class="flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer" :class="editConfig.formats?.includes(fmt) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" :value="fmt" v-model="editConfig.formats" class="rounded"><span class="font-mono">{{ fmt.toUpperCase() }}</span>
                  </label>
                </div>
              </div>
              <div class="grid grid-cols-4 gap-4">
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer" :class="{ 'border-blue-500 bg-blue-50': editConfig.dts }">
                  <input type="checkbox" v-model="editConfig.dts" class="rounded"><span>类型声明</span>
                </label>
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer" :class="{ 'border-blue-500 bg-blue-50': editConfig.sourcemap }">
                  <input type="checkbox" v-model="editConfig.sourcemap" class="rounded"><span>Source Map</span>
                </label>
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer" :class="{ 'border-blue-500 bg-blue-50': editConfig.minify }">
                  <input type="checkbox" v-model="editConfig.minify" class="rounded"><span>代码压缩</span>
                </label>
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer" :class="{ 'border-blue-500 bg-blue-50': editConfig.treeshake }">
                  <input type="checkbox" v-model="editConfig.treeshake" class="rounded"><span>Tree Shake</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">外部依赖</label>
                <input v-model="externalStr" placeholder="逗号分隔，如: vue, react, lodash" class="w-full px-4 py-2 border rounded-xl">
              </div>
            </div>
          </div>
        </div>
        
        <!-- 构建 -->
        <div v-show="activeTab === 'build'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-hammer text-green-500 mr-2"></i>构建操作</h3>
              <div class="flex gap-2">
                <button @click="clearLogs" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">清空日志</button>
                <button @click="startBuild" :disabled="building" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  <i :class="['mdi', building ? 'mdi-loading animate-spin' : 'mdi-play']"></i>{{ building ? '构建中...' : '开始构建' }}
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div><label class="block text-sm text-gray-600 mb-1">模式</label>
                <select v-model="buildOptions.mode" class="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="production">生产</option><option value="development">开发</option>
                </select>
              </div>
              <div><label class="block text-sm text-gray-600 mb-1">引擎</label>
                <select v-model="buildOptions.bundler" class="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="">配置默认</option><option value="rollup">Rollup</option><option value="rolldown">Rolldown</option>
                </select>
              </div>
              <label class="flex items-center gap-2 self-end pb-2"><input type="checkbox" v-model="buildOptions.clean" class="rounded"><span class="text-sm">清理目录</span></label>
              <label class="flex items-center gap-2 self-end pb-2"><input type="checkbox" v-model="buildOptions.report" class="rounded"><span class="text-sm">生成报告</span></label>
            </div>
            
            <div class="bg-gray-900 rounded-xl overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span class="text-gray-400 text-sm"><i class="mdi mdi-console mr-1"></i>构建日志</span>
                <span class="text-gray-500 text-xs">{{ buildLogs.length }} 行</span>
              </div>
              <div class="h-96 overflow-y-auto p-4 log-container" ref="logContainer">
                <div v-for="(log, i) in buildLogs" :key="i" class="log-line" :class="getLogClass(log.level)">
                  <span class="text-gray-500 mr-2">[{{ log.time }}]</span>{{ log.message }}
                </div>
                <div v-if="!buildLogs.length" class="text-gray-500 text-center py-8">点击"开始构建"...</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 产物 -->
        <div v-show="activeTab === 'output'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-package-variant text-purple-500 mr-2"></i>产物分析</h3>
              <button @click="refreshOutputs" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"><i class="mdi mdi-refresh mr-1"></i>刷新</button>
            </div>
            
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-xl p-4 text-center"><div class="text-3xl font-bold text-blue-600">{{ totalFiles }}</div><div class="text-sm text-blue-600/70">文件数</div></div>
              <div class="bg-green-50 rounded-xl p-4 text-center"><div class="text-3xl font-bold text-green-600">{{ formatSize(totalSize) }}</div><div class="text-sm text-green-600/70">总大小</div></div>
              <div class="bg-purple-50 rounded-xl p-4 text-center"><div class="text-3xl font-bold text-purple-600">{{ outputs.length }}</div><div class="text-sm text-purple-600/70">目录数</div></div>
              <div class="bg-orange-50 rounded-xl p-4 text-center"><div class="text-3xl font-bold text-orange-600">{{ jsFileCount }}</div><div class="text-sm text-orange-600/70">JS文件</div></div>
            </div>
            
            <div class="space-y-4">
              <div v-for="output in outputs" :key="output.dir" class="border rounded-xl overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100" @click="toggleDir(output.dir)">
                  <div class="flex items-center gap-3">
                    <i :class="['mdi', expandedDirs[output.dir] ? 'mdi-folder-open' : 'mdi-folder', 'text-xl text-yellow-500']"></i>
                    <span class="font-semibold">{{ output.dir }}/</span>
                    <span class="text-gray-500 text-sm">({{ output.files.length }})</span>
                  </div>
                  <span class="text-sm font-medium text-gray-600">{{ formatSize(output.totalSize) }}</span>
                </div>
                <div v-show="expandedDirs[output.dir]" class="divide-y max-h-80 overflow-y-auto">
                  <div v-for="file in output.files" :key="file.name" class="px-4 py-2 flex items-center justify-between hover:bg-gray-50 text-sm font-mono">
                    <div class="flex items-center gap-2">
                      <i :class="['mdi', getFileIcon(file.type), getFileColor(file.type)]"></i>
                      <span>{{ file.name }}</span>
                    </div>
                    <span class="text-gray-500">{{ formatSize(file.size) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!outputs.length" class="text-center py-12 text-gray-500"><i class="mdi mdi-package-variant-closed text-5xl mb-3"></i><p>暂无产物</p></div>
            </div>
          </div>
        </div>
        
        <!-- 版本管理 -->
        <div v-show="activeTab === 'version'" class="space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-tag text-blue-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">v{{ versionInfo.currentVersion }}</div>
              <div class="text-sm text-gray-500">当前版本</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-archive text-green-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ versionInfo.archiveStats.totalArchives || 0 }}</div>
              <div class="text-sm text-gray-500">归档数量</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-harddisk text-purple-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ formatSize(versionInfo.archiveStats.totalSize || 0) }}</div>
              <div class="text-sm text-gray-500">归档大小</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-history text-orange-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ versionInfo.versionHistory.length }}</div>
              <div class="text-sm text-gray-500">构建历史</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-tag-plus text-blue-500 mr-2"></i>版本操作</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">递增版本</label>
                  <div class="grid grid-cols-4 gap-2">
                    <button @click="bumpVersion('patch')" class="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium">Patch</button>
                    <button @click="bumpVersion('minor')" class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">Minor</button>
                    <button @click="bumpVersion('major')" class="px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium">Major</button>
                    <button @click="bumpVersion('prerelease')" class="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium">Pre</button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">手动设置版本</label>
                  <div class="flex gap-2">
                    <input type="text" v-model="versionInfo.newVersion" placeholder="如: 1.2.3" class="flex-1 px-4 py-2 border rounded-xl">
                    <button @click="setVersion(versionInfo.newVersion)" class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">设置</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-archive-plus text-green-500 mr-2"></i>归档管理</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">归档备注</label>
                  <input v-model="archiveNotes" placeholder="可选：归档说明" class="w-full px-4 py-2 border rounded-xl">
                </div>
                <div class="flex gap-2">
                  <button @click="archiveVersion" :disabled="archiving" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    <i :class="['mdi', archiving ? 'mdi-loading animate-spin' : 'mdi-archive-plus']"></i>
                    {{ archiving ? '归档中...' : '归档当前版本' }}
                  </button>
                  <button @click="clearArchives" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">清空归档</button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-archive text-purple-500 mr-2"></i>归档列表</h3>
              <button @click="loadVersionInfo" class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"><i class="mdi mdi-refresh mr-1"></i>刷新</button>
            </div>
            <div class="space-y-3">
              <div v-for="archive in versionInfo.archives" :key="archive.createdAt" class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                <div class="flex items-center gap-4">
                  <i class="mdi mdi-package-variant text-2xl text-purple-500"></i>
                  <div>
                    <div class="font-medium">v{{ archive.version }}</div>
                    <div class="text-sm text-gray-500">{{ formatTime(archive.createdAt) }} · {{ formatSize(archive.archiveSize) }}</div>
                    <div v-if="archive.notes" class="text-xs text-gray-400 mt-1">{{ archive.notes }}</div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="restoreVersion(archive.version, archive.createdAt)" class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">恢复</button>
                  <button @click="deleteArchive(archive.version, archive.createdAt)" class="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">删除</button>
                </div>
              </div>
              <div v-if="!versionInfo.archives.length" class="text-center py-8 text-gray-500">暂无归档，点击"归档当前版本"创建</div>
            </div>
          </div>
        </div>

        <!-- 发布管理 -->
        <div v-show="activeTab === 'publish'" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-cloud-upload text-blue-500 mr-2"></i>发布到 NPM</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Registry</label>
                    <select v-model="publishOptions.registry" class="w-full px-4 py-2 border rounded-xl">
                      <option value="">默认 (npm)</option>
                      <option v-for="reg in publishInfo.registries" :key="reg.name" :value="reg.url">{{ reg.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                    <select v-model="publishOptions.tag" class="w-full px-4 py-2 border rounded-xl">
                      <option value="latest">latest</option>
                      <option value="next">next</option>
                      <option value="beta">beta</option>
                      <option value="alpha">alpha</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">访问权限</label>
                    <select v-model="publishOptions.access" class="w-full px-4 py-2 border rounded-xl">
                      <option value="public">Public</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">OTP (2FA)</label>
                    <input v-model="publishOptions.otp" placeholder="可选" class="w-full px-4 py-2 border rounded-xl">
                  </div>
                </div>
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer" :class="{ 'border-blue-500 bg-blue-50': publishOptions.dryRun }">
                  <input type="checkbox" v-model="publishOptions.dryRun" class="rounded"><span>Dry Run (测试运行)</span>
                </label>
                <button @click="doPublish" :disabled="publishing" class="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <i :class="['mdi', publishing ? 'mdi-loading animate-spin' : 'mdi-cloud-upload']"></i>
                  {{ publishing ? '发布中...' : '发布当前版本' }}
                </button>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-tag-arrow-up text-green-500 mr-2"></i>递增并发布</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">版本递增类型</label>
                  <div class="grid grid-cols-4 gap-2">
                    <label class="flex items-center justify-center gap-1 px-3 py-2 border rounded-lg cursor-pointer" :class="publishOptions.bumpType === 'patch' ? 'border-green-500 bg-green-50' : ''">
                      <input type="radio" v-model="publishOptions.bumpType" value="patch" class="hidden"><span>Patch</span>
                    </label>
                    <label class="flex items-center justify-center gap-1 px-3 py-2 border rounded-lg cursor-pointer" :class="publishOptions.bumpType === 'minor' ? 'border-blue-500 bg-blue-50' : ''">
                      <input type="radio" v-model="publishOptions.bumpType" value="minor" class="hidden"><span>Minor</span>
                    </label>
                    <label class="flex items-center justify-center gap-1 px-3 py-2 border rounded-lg cursor-pointer" :class="publishOptions.bumpType === 'major' ? 'border-orange-500 bg-orange-50' : ''">
                      <input type="radio" v-model="publishOptions.bumpType" value="major" class="hidden"><span>Major</span>
                    </label>
                    <label class="flex items-center justify-center gap-1 px-3 py-2 border rounded-lg cursor-pointer" :class="publishOptions.bumpType === 'prerelease' ? 'border-purple-500 bg-purple-50' : ''">
                      <input type="radio" v-model="publishOptions.bumpType" value="prerelease" class="hidden"><span>Pre</span>
                    </label>
                  </div>
                </div>
                <div v-if="publishOptions.bumpType === 'prerelease'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">预发布标识</label>
                  <input v-model="publishOptions.preid" placeholder="如: alpha, beta, rc" class="w-full px-4 py-2 border rounded-xl">
                </div>
                <button @click="bumpAndPublish" :disabled="publishing || !publishOptions.bumpType" class="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <i :class="['mdi', publishing ? 'mdi-loading animate-spin' : 'mdi-rocket-launch']"></i>
                  {{ publishing ? '发布中...' : '递增版本并发布' }}
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-check-decagram text-green-500 mr-2"></i>发布前检查</h3>
              <button @click="runPublishChecks" class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"><i class="mdi mdi-refresh mr-1"></i>重新检查</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="check in publishInfo.checks" :key="check.name" class="flex items-center gap-3 p-3 border rounded-xl" :class="check.passed ? 'border-green-200 bg-green-50/50' : check.severity === 'error' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'">
                <i :class="['mdi text-lg', check.passed ? 'mdi-check-circle text-green-500' : check.severity === 'error' ? 'mdi-close-circle text-red-500' : 'mdi-alert text-yellow-500']"></i>
                <div>
                  <div class="font-medium text-sm">{{ check.name }}</div>
                  <div class="text-xs text-gray-500">{{ check.message }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-console text-gray-500 mr-2"></i>发布日志</h3>
              <button @click="clearPublishLogs" class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">清空</button>
            </div>
            <div class="bg-gray-900 rounded-xl overflow-hidden">
              <div class="h-48 overflow-y-auto p-4 log-container">
                <div v-for="(log, i) in publishLogs" :key="i" class="log-line text-gray-300">
                  <span class="text-gray-500 mr-2">[{{ log.time }}]</span>{{ log.message }}
                </div>
                <div v-if="!publishLogs.length" class="text-gray-500 text-center py-4">等待发布...</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-history text-purple-500 mr-2"></i>发布历史</h3>
            <div class="space-y-3">
              <div v-for="h in publishInfo.publishHistory.slice().reverse().slice(0, 10)" :key="h.publishedAt" class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                <div class="flex items-center gap-4">
                  <i :class="['mdi text-2xl', h.success ? 'mdi-check-circle text-green-500' : 'mdi-close-circle text-red-500']"></i>
                  <div>
                    <div class="font-medium">{{ h.packageName }}@{{ h.version }}</div>
                    <div class="text-sm text-gray-500">{{ formatTime(h.publishedAt) }} · {{ h.tag }} · {{ h.registry.split('/')[2] }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!publishInfo.publishHistory.length" class="text-center py-8 text-gray-500">暂无发布记录</div>
            </div>
          </div>
        </div>

        <!-- Bundle 分析 -->
        <div v-show="activeTab === 'analyzer'" class="space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-package-variant text-blue-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ formatSize(bundleAnalysis.totalSize) }}</div>
              <div class="text-sm text-gray-500">总大小</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-zip-box text-green-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ formatSize(bundleAnalysis.gzipSize) }}</div>
              <div class="text-sm text-gray-500">Gzip 估算</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-folder-multiple text-purple-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ bundleAnalysis.files.length }}</div>
              <div class="text-sm text-gray-500">输出目录</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-file-multiple text-orange-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ Object.keys(bundleAnalysis.byType).length }}</div>
              <div class="text-sm text-gray-500">文件类型</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl p-6 border">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900"><i class="mdi mdi-chart-bar text-blue-500 mr-2"></i>按类型统计</h3>
                <button @click="loadBundleAnalysis" class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"><i class="mdi mdi-refresh mr-1"></i>刷新</button>
              </div>
              <div class="space-y-3">
                <div v-for="(info, type) in bundleAnalysis.byType" :key="type" class="flex items-center gap-3">
                  <div class="w-16 text-sm font-medium text-gray-600">.{{ type }}</div>
                  <div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" :style="{ width: (info.size / bundleAnalysis.totalSize * 100) + '%' }"></div>
                  </div>
                  <div class="w-24 text-right text-sm text-gray-500">{{ formatSize(info.size) }}</div>
                  <div class="w-12 text-right text-xs text-gray-400">{{ info.count }}个</div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 border">
              <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-file-alert text-orange-500 mr-2"></i>最大文件 Top 10</h3>
              <div class="space-y-2">
                <div v-for="(file, i) in bundleAnalysis.largest" :key="file.path" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">{{ i + 1 }}</span>
                    <span class="font-mono text-sm text-gray-700 truncate max-w-xs">{{ file.name }}</span>
                  </div>
                  <span class="text-sm font-medium" :class="file.size > 100000 ? 'text-red-500' : file.size > 50000 ? 'text-orange-500' : 'text-gray-500'">{{ formatSize(file.size) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-folder-tree text-green-500 mr-2"></i>目录结构</h3>
            <div class="space-y-2">
              <div v-for="dir in bundleAnalysis.files" :key="dir.path" class="border rounded-xl overflow-hidden">
                <div class="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100" @click="toggleDir(dir.path)">
                  <div class="flex items-center gap-2">
                    <i :class="['mdi', expandedDirs[dir.path] ? 'mdi-folder-open' : 'mdi-folder', 'text-yellow-500']"></i>
                    <span class="font-medium">{{ dir.name }}/</span>
                  </div>
                  <span class="text-sm text-gray-500">{{ formatSize(dir.size) }}</span>
                </div>
                <div v-if="expandedDirs[dir.path] && dir.children" class="p-2 bg-gray-50/50 space-y-1">
                  <div v-for="child in dir.children" :key="child.path" class="flex items-center justify-between p-2 text-sm hover:bg-white rounded">
                    <span class="font-mono text-gray-600">{{ child.name }}</span>
                    <span class="text-gray-400">{{ formatSize(child.size) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 许可证 -->
        <div v-show="activeTab === 'license'" class="space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-check-circle text-green-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ licenseInfo.filter(l => l.risk === 'low').length }}</div>
              <div class="text-sm text-gray-500">低风险</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-alert text-yellow-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ licenseInfo.filter(l => l.risk === 'medium').length }}</div>
              <div class="text-sm text-gray-500">中风险</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-close-circle text-red-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ licenseInfo.filter(l => l.risk === 'high').length }}</div>
              <div class="text-sm text-gray-500">高风险</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border card-hover">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <i class="mdi mdi-help-circle text-gray-600 text-xl"></i>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ licenseInfo.filter(l => l.risk === 'unknown').length }}</div>
              <div class="text-sm text-gray-500">未知</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-license text-purple-500 mr-2"></i>依赖许可证</h3>
              <button @click="loadLicenseInfo" class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"><i class="mdi mdi-refresh mr-1"></i>刷新</button>
            </div>
            <div class="space-y-2">
              <div v-for="lic in licenseInfo" :key="lic.name" class="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50"
                   :class="lic.risk === 'high' ? 'border-red-200 bg-red-50/30' : lic.risk === 'medium' ? 'border-yellow-200 bg-yellow-50/30' : ''">
                <div class="flex items-center gap-3">
                  <i :class="['mdi text-lg', lic.risk === 'high' ? 'mdi-alert-circle text-red-500' : lic.risk === 'medium' ? 'mdi-alert text-yellow-500' : lic.risk === 'low' ? 'mdi-check-circle text-green-500' : 'mdi-help-circle text-gray-400']"></i>
                  <div>
                    <div class="font-medium">{{ lic.name }}</div>
                    <div class="text-xs text-gray-500">{{ lic.version }}</div>
                  </div>
                </div>
                <span class="px-3 py-1 text-sm rounded-full"
                      :class="lic.risk === 'high' ? 'bg-red-100 text-red-700' : lic.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : lic.risk === 'low' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                  {{ lic.license }}
                </span>
              </div>
              <div v-if="!licenseInfo.length" class="text-center py-8 text-gray-500">正在加载许可证信息...</div>
            </div>
          </div>
        </div>

        <!-- 环境变量 -->
        <div v-show="activeTab === 'env'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900"><i class="mdi mdi-cog-outline text-blue-500 mr-2"></i>环境变量文件</h3>
              <button @click="loadEnvInfo" class="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"><i class="mdi mdi-refresh mr-1"></i>刷新</button>
            </div>
            <div v-if="envInfo.files.length" class="flex gap-2 mb-4">
              <button v-for="file in envInfo.files" :key="file" @click="envInfo.currentFile = file"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      :class="envInfo.currentFile === file ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                {{ file }}
              </button>
            </div>
            <div v-if="envInfo.variables[envInfo.currentFile]" class="space-y-2">
              <div v-for="(value, key) in envInfo.variables[envInfo.currentFile]" :key="key" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span class="font-mono text-sm font-medium text-blue-600 min-w-[200px]">{{ key }}</span>
                <span class="text-gray-500">=</span>
                <span class="font-mono text-sm text-gray-700 flex-1 truncate">{{ value }}</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <i class="mdi mdi-file-hidden text-4xl mb-2"></i>
              <p>未找到环境变量文件</p>
              <p class="text-sm">在项目根目录创建 .env 文件</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-4"><i class="mdi mdi-pencil text-green-500 mr-2"></i>编辑环境变量</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">文件名</label>
                <input v-model="envInfo.currentFile" class="w-full px-4 py-2 border rounded-xl font-mono" placeholder=".env">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea v-model="envInfo.editContent" rows="8" class="w-full px-4 py-2 border rounded-xl font-mono text-sm" placeholder="KEY=value"></textarea>
              </div>
              <button @click="saveEnvFile" class="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                <i class="mdi mdi-content-save mr-1"></i>保存
              </button>
            </div>
          </div>
        </div>
        
        <!-- 依赖 -->
        <div v-show="activeTab === 'deps'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-6"><i class="mdi mdi-graph text-indigo-500 mr-2"></i>依赖分析</h3>
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 rounded-xl p-4"><div class="text-2xl font-bold text-blue-600">{{ prodDepsCount }}</div><div class="text-sm text-blue-600/70">生产依赖</div></div>
              <div class="bg-purple-50 rounded-xl p-4"><div class="text-2xl font-bold text-purple-600">{{ devDepsCount }}</div><div class="text-sm text-purple-600/70">开发依赖</div></div>
              <div class="bg-green-50 rounded-xl p-4"><div class="text-2xl font-bold text-green-600">{{ dependencies.length }}</div><div class="text-sm text-green-600/70">总计</div></div>
            </div>
            <div class="space-y-2">
              <div v-for="dep in dependencies" :key="dep.name" class="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <i :class="['mdi mdi-package text-xl', dep.type === 'production' ? 'text-blue-500' : 'text-purple-500']"></i>
                  <div><div class="font-medium">{{ dep.name }}</div><div class="text-xs text-gray-500">{{ dep.version }}</div></div>
                </div>
                <span class="px-2 py-1 text-xs rounded-full" :class="dep.type === 'production' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">{{ dep.type === 'production' ? '生产' : '开发' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 插件 -->
        <div v-show="activeTab === 'plugins'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-6"><i class="mdi mdi-puzzle text-teal-500 mr-2"></i>插件管理</h3>
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="plugin in plugins" :key="plugin.name" class="p-4 border rounded-xl">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium">{{ plugin.name }}</span>
                  <span class="w-3 h-3 rounded-full" :class="plugin.enabled ? 'bg-green-500' : 'bg-gray-300'"></span>
                </div>
                <p class="text-sm text-gray-500">{{ plugin.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 历史 -->
        <div v-show="activeTab === 'history'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-6"><i class="mdi mdi-history text-amber-500 mr-2"></i>构建历史</h3>
            <div class="space-y-3">
              <div v-for="h in buildHistory.slice().reverse()" :key="h.id" class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                <div class="flex items-center gap-4">
                  <i :class="['mdi text-2xl', h.success ? 'mdi-check-circle text-green-500' : 'mdi-close-circle text-red-500']"></i>
                  <div>
                    <div class="font-medium">{{ h.mode }} 构建</div>
                    <div class="text-sm text-gray-500">{{ formatTime(h.timestamp) }} · {{ h.bundler }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium">{{ h.duration.toFixed(2) }}s</div>
                  <div class="text-sm text-gray-500">{{ formatSize(h.outputSize) }} · {{ h.fileCount }} 文件</div>
                </div>
              </div>
              <div v-if="!buildHistory.length" class="text-center py-12 text-gray-500">暂无构建记录</div>
            </div>
          </div>
        </div>
        
        <!-- 缓存 -->
        <div v-show="activeTab === 'cache'" class="space-y-6">
          <div class="bg-white rounded-2xl p-6 border">
            <h3 class="font-semibold text-gray-900 mb-6"><i class="mdi mdi-cached text-orange-500 mr-2"></i>缓存管理</h3>
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 rounded-xl p-4"><div class="text-2xl font-bold text-blue-600">{{ formatSize(cacheInfo.size) }}</div><div class="text-sm text-blue-600/70">缓存大小</div></div>
              <div class="bg-green-50 rounded-xl p-4"><div class="text-2xl font-bold text-green-600">{{ cacheInfo.entries }}</div><div class="text-sm text-green-600/70">缓存条目</div></div>
              <div class="bg-purple-50 rounded-xl p-4"><div class="text-2xl font-bold text-purple-600">{{ Math.round(cacheInfo.hitRate * 100) }}%</div><div class="text-sm text-purple-600/70">命中率</div></div>
            </div>
            <button @click="clearCacheAction" class="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"><i class="mdi mdi-delete mr-2"></i>清空缓存</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script>
    const { createApp, ref, reactive, computed, onMounted, nextTick, watch } = Vue
    
    createApp({
      setup() {
        const darkMode = ref(false)
        const connected = ref(false)
        const ws = ref(null)
        const activeTab = ref('overview')
        const building = ref(false)
        const logContainer = ref(null)
        
        const menuItems = [
          { id: 'overview', name: '概览', icon: 'mdi-view-dashboard' },
          { id: 'config', name: '配置', icon: 'mdi-cog' },
          { id: 'build', name: '构建', icon: 'mdi-hammer' },
          { id: 'output', name: '产物', icon: 'mdi-package-variant' },
          { id: 'analyzer', name: '分析', icon: 'mdi-chart-treemap' },
          { id: 'version', name: '版本', icon: 'mdi-tag-multiple' },
          { id: 'publish', name: '发布', icon: 'mdi-cloud-upload' },
          { id: 'deps', name: '依赖', icon: 'mdi-graph' },
          { id: 'license', name: '许可证', icon: 'mdi-license' },
          { id: 'env', name: '环境', icon: 'mdi-cog-outline' },
          { id: 'plugins', name: '插件', icon: 'mdi-puzzle' },
          { id: 'history', name: '历史', icon: 'mdi-history' },
          { id: 'cache', name: '缓存', icon: 'mdi-cached' },
        ]
        
        const currentMenuItem = computed(() => menuItems.find(m => m.id === activeTab.value))
        
        const packageInfo = ref(null)
        const configInfo = ref(null)
        const outputs = ref([])
        const dependencies = ref([])
        const plugins = ref([])
        const buildHistory = ref([])
        const cacheInfo = ref({ size: 0, entries: 0, hitRate: 0 })
        const buildLogs = ref([])
        const expandedDirs = reactive({})
        
        const editConfig = reactive({
          input: 'src/index.ts', outDir: 'dist', bundler: 'rollup', target: 'es2020', platform: 'neutral',
          formats: ['esm', 'cjs'], dts: true, sourcemap: true, minify: false, treeshake: true, external: []
        })
        
        const externalStr = computed({
          get: () => editConfig.external.join(', '),
          set: v => editConfig.external = v.split(',').map(s => s.trim()).filter(Boolean)
        })
        
        const buildOptions = reactive({ mode: 'production', bundler: '', clean: true, report: false })
        
        // 版本管理状态
        const versionInfo = reactive({
          currentVersion: '0.0.0',
          versionHistory: [],
          archives: [],
          archiveStats: { totalArchives: 0, totalSize: 0, versions: [] }
        })
        const archiving = ref(false)
        const archiveNotes = ref('')
        
        // 发布状态
        const publishInfo = reactive({
          packageInfo: null,
          publishHistory: [],
          registries: [],
          checks: []
        })
        const publishing = ref(false)
        const publishLogs = ref([])
        const publishOptions = reactive({
          registry: '',
          tag: 'latest',
          access: 'public',
          dryRun: false,
          otp: '',
          bumpType: '',
          preid: ''
        })
        
        // Bundle 分析状态
        const bundleAnalysis = reactive({
          totalSize: 0,
          gzipSize: 0,
          files: [],
          byType: {},
          largest: []
        })
        
        // 许可证状态
        const licenseInfo = ref([])
        
        // 环境变量状态
        const envInfo = reactive({
          files: [],
          variables: {},
          currentFile: '.env',
          editContent: ''
        })
        
        const totalFiles = computed(() => outputs.value.reduce((s, o) => s + o.files.length, 0))
        const totalSize = computed(() => outputs.value.reduce((s, o) => s + o.totalSize, 0))
        const jsFileCount = computed(() => outputs.value.reduce((s, o) => s + o.files.filter(f => ['js','mjs','cjs'].includes(f.type)).length, 0))
        const lastBuildDuration = computed(() => buildHistory.value.length ? buildHistory.value[buildHistory.value.length - 1].duration.toFixed(2) : '--')
        const successCount = computed(() => buildHistory.value.filter(h => h.success).length)
        const failCount = computed(() => buildHistory.value.filter(h => !h.success).length)
        const buildSuccessRate = computed(() => buildHistory.value.length ? Math.round(successCount.value / buildHistory.value.length * 100) : 100)
        const prodDepsCount = computed(() => dependencies.value.filter(d => d.type === 'production').length)
        const devDepsCount = computed(() => dependencies.value.filter(d => d.type === 'development').length)
        
        function formatSize(bytes) {
          if (bytes < 1024) return bytes + ' B'
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
          return (bytes / 1024 / 1024).toFixed(2) + ' MB'
        }
        
        function formatTime(ts) {
          return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        }
        
        function getLogClass(level) {
          const classes = { error: 'text-red-400', success: 'text-green-400', warn: 'text-yellow-400', info: 'text-blue-400' }
          return classes[level] || 'text-gray-300'
        }
        
        function getFileIcon(type) {
          const icons = { js: 'mdi-language-javascript', mjs: 'mdi-language-javascript', cjs: 'mdi-language-javascript', ts: 'mdi-language-typescript', css: 'mdi-language-css3', json: 'mdi-code-json', vue: 'mdi-vuejs', map: 'mdi-map-marker' }
          return icons[type] || 'mdi-file'
        }
        
        function getFileColor(type) {
          const colors = { js: 'text-yellow-500', mjs: 'text-yellow-500', ts: 'text-blue-500', css: 'text-pink-500', json: 'text-green-500', vue: 'text-green-600' }
          return colors[type] || 'text-gray-400'
        }
        
        function toggleDir(dir) { expandedDirs[dir] = !expandedDirs[dir] }
        
        function connectWS() {
          const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
          ws.value = new WebSocket(protocol + '//' + location.host)
          ws.value.onopen = () => { connected.value = true; send({ type: 'init' }) }
          ws.value.onclose = () => { connected.value = false; setTimeout(connectWS, 2000) }
          ws.value.onmessage = e => handleMessage(JSON.parse(e.data))
        }
        
        function send(data) { ws.value?.readyState === WebSocket.OPEN && ws.value.send(JSON.stringify(data)) }
        
        function handleMessage(data) {
          switch (data.type) {
            case 'init':
              packageInfo.value = data.packageInfo
              configInfo.value = data.configInfo
              outputs.value = data.outputs || []
              dependencies.value = data.dependencies || []
              plugins.value = data.plugins || []
              buildHistory.value = data.buildHistory || []
              cacheInfo.value = data.cacheInfo || { size: 0, entries: 0, hitRate: 0 }
              if (data.configInfo?.config) {
                Object.assign(editConfig, {
                  input: data.configInfo.config.input || 'src/index.ts',
                  outDir: data.configInfo.config.output?.dir || 'dist',
                  bundler: data.configInfo.config.bundler || 'rollup',
                  formats: data.configInfo.config.output?.format || ['esm', 'cjs'],
                  dts: data.configInfo.config.dts !== false,
                  sourcemap: data.configInfo.config.sourcemap !== false,
                  minify: !!data.configInfo.config.minify,
                  external: data.configInfo.config.external || []
                })
              }
              break
            case 'log':
              buildLogs.value.push({ time: new Date().toLocaleTimeString(), level: data.level, message: data.message })
              nextTick(() => { if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight })
              break
            case 'buildStart': building.value = true; break
            case 'buildEnd':
              building.value = false
              if (data.outputs) outputs.value = data.outputs
              send({ type: 'init' })
              break
            case 'outputs': outputs.value = data.outputs || []; break
            case 'cacheCleared': cacheInfo.value = data.cacheInfo; break
            case 'configSaved': alert(data.success ? '配置已保存' : '保存失败: ' + data.error); break
            // 版本管理
            case 'versionInfo':
              versionInfo.currentVersion = data.currentVersion || '0.0.0'
              versionInfo.versionHistory = data.versionHistory || []
              versionInfo.archives = data.archives || []
              versionInfo.archiveStats = data.archiveStats || {}
              break
            case 'versionBumped':
              if (data.success) {
                versionInfo.currentVersion = data.newVersion
                alert('版本已更新: ' + data.newVersion)
                send({ type: 'getVersionInfo' })
              } else {
                alert('版本更新失败: ' + data.error)
              }
              break
            case 'versionSet':
              if (data.success) {
                versionInfo.currentVersion = data.version
                alert('版本已设置: ' + data.version)
              }
              break
            case 'archiveStart': archiving.value = true; break
            case 'archiveComplete':
              archiving.value = false
              if (data.success) {
                alert('归档完成!')
                send({ type: 'getVersionInfo' })
              } else {
                alert('归档失败: ' + data.error)
              }
              break
            case 'archiveDeleted':
              versionInfo.archives = data.archives || []
              break
            case 'archivesCleared':
              versionInfo.archives = []
              versionInfo.archiveStats = { totalArchives: 0, totalSize: 0, versions: [] }
              break
            case 'restoreStart': archiving.value = true; break
            case 'restoreComplete':
              archiving.value = false
              alert(data.success ? '版本已恢复!' : '恢复失败: ' + data.error)
              if (data.success) send({ type: 'init' })
              break
            // 发布管理
            case 'publishInfo':
              publishInfo.packageInfo = data.packageInfo
              publishInfo.publishHistory = data.publishHistory || []
              publishInfo.registries = data.registries || []
              break
            case 'publishChecks':
              publishInfo.checks = data.checks || []
              break
            case 'publishStart': publishing.value = true; publishLogs.value = []; break
            case 'publishLog':
              publishLogs.value.push({ time: new Date().toLocaleTimeString(), message: data.message })
              break
            case 'publishComplete':
              publishing.value = false
              if (data.result?.success) {
                alert('发布成功! ' + data.result.packageName + '@' + data.result.version)
                send({ type: 'getPublishInfo' })
              } else {
                alert('发布失败: ' + (data.result?.error || data.error))
              }
              break
            case 'publishedVersions':
              publishInfo.publishedVersions = data.versions || []
              break
            // Bundle 分析
            case 'bundleAnalysis':
              if (data.analysis) {
                bundleAnalysis.totalSize = data.analysis.totalSize
                bundleAnalysis.gzipSize = data.analysis.gzipSize
                bundleAnalysis.files = data.analysis.files
                bundleAnalysis.byType = data.analysis.byType
                bundleAnalysis.largest = data.analysis.largest
              }
              break
            // 许可证
            case 'licenseInfo':
              licenseInfo.value = data.licenses || []
              break
            // 环境变量
            case 'envInfo':
              envInfo.files = data.files || []
              envInfo.variables = data.variables || {}
              break
            case 'envSaved':
              alert(data.success ? '环境变量已保存' : '保存失败: ' + data.error)
              if (data.success) send({ type: 'getEnvInfo' })
              break
          }
        }
        
        function startBuild() { buildLogs.value = []; send({ type: 'build', options: buildOptions }) }
        function quickBuild(mode) { buildLogs.value = []; activeTab.value = 'build'; send({ type: 'build', options: { ...buildOptions, mode } }) }
        function clearLogs() { buildLogs.value = [] }
        function refreshOutputs() { send({ type: 'getOutputs' }) }
        function clearCacheAction() { if (confirm('确定清空缓存？')) send({ type: 'clearCache' }) }
        function saveConfig() { send({ type: 'saveConfig', config: editConfig }) }
        function resetConfig() { send({ type: 'init' }) }
        function refresh() { send({ type: 'init' }) }
        
        // 版本管理函数
        function loadVersionInfo() { send({ type: 'getVersionInfo' }) }
        function bumpVersion(type) { send({ type: 'bumpVersion', bumpType: type }) }
        function setVersion(version) { if (version) send({ type: 'setVersion', version }) }
        function archiveVersion() { send({ type: 'archiveVersion', notes: archiveNotes.value }); archiveNotes.value = '' }
        function restoreVersion(v, ts) { if (confirm('确定恢复到版本 ' + v + '？当前版本会自动备份')) send({ type: 'restoreVersion', version: v, timestamp: ts }) }
        function deleteArchive(v, ts) { if (confirm('确定删除此归档？')) send({ type: 'deleteArchive', version: v, timestamp: ts }) }
        function clearArchives() { if (confirm('确定清空所有归档？')) send({ type: 'clearArchives' }) }
        
        // 发布函数
        function loadPublishInfo() { send({ type: 'getPublishInfo' }) }
        function runPublishChecks() { send({ type: 'runPublishChecks' }) }
        function doPublish() { send({ type: 'publish', options: publishOptions }) }
        function bumpAndPublish() { 
          if (!publishOptions.bumpType) { alert('请选择版本递增类型'); return }
          send({ type: 'bumpAndPublish', bumpType: publishOptions.bumpType, preid: publishOptions.preid, options: publishOptions }) 
        }
        function clearPublishLogs() { publishLogs.value = [] }
        
        // Bundle 分析函数
        function loadBundleAnalysis() { send({ type: 'getBundleAnalysis' }) }
        
        // 许可证函数
        function loadLicenseInfo() { send({ type: 'getLicenseInfo' }) }
        
        // 环境变量函数
        function loadEnvInfo() { send({ type: 'getEnvInfo' }) }
        function saveEnvFile() { 
          send({ type: 'saveEnvFile', filename: envInfo.currentFile, content: envInfo.editContent }) 
        }
        
        // 监听 tab 切换加载数据
        watch(activeTab, (tab) => {
          if (tab === 'version') loadVersionInfo()
          if (tab === 'publish') { loadPublishInfo(); runPublishChecks() }
          if (tab === 'analyzer') loadBundleAnalysis()
          if (tab === 'license') loadLicenseInfo()
          if (tab === 'env') loadEnvInfo()
        })
        
        onMounted(connectWS)
        
        return {
          darkMode, connected, activeTab, building, logContainer, menuItems, currentMenuItem,
          packageInfo, configInfo, outputs, dependencies, plugins, buildHistory, cacheInfo, buildLogs, expandedDirs,
          editConfig, externalStr, buildOptions,
          totalFiles, totalSize, jsFileCount, lastBuildDuration, successCount, failCount, buildSuccessRate, prodDepsCount, devDepsCount,
          formatSize, formatTime, getLogClass, getFileIcon, getFileColor, toggleDir,
          startBuild, quickBuild, clearLogs, refreshOutputs, clearCacheAction, saveConfig, resetConfig, refresh,
          // 版本管理
          versionInfo, archiving, archiveNotes, loadVersionInfo, bumpVersion, setVersion, archiveVersion, restoreVersion, deleteArchive, clearArchives,
          // 发布管理
          publishInfo, publishing, publishLogs, publishOptions, loadPublishInfo, runPublishChecks, doPublish, bumpAndPublish, clearPublishLogs,
          // Bundle 分析
          bundleAnalysis, loadBundleAnalysis,
          // 许可证
          licenseInfo, loadLicenseInfo,
          // 环境变量
          envInfo, loadEnvInfo, saveEnvFile
        }
      }
    }).mount('#app')
  </script>
</body>
</html>`
}
