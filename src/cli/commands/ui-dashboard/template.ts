/**
 * Builder UI - 可视化构建控制台
 * 核心功能：概览、构建、产物、配置、发布、NPM源管理、版本管理
 */

export function generateDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Builder</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    :root { --primary: 59 130 246; --bg: 249 250 251; --card: 255 255 255; --border: 229 231 235; --text: 17 24 39; --muted: 107 114 128; }
    .dark { --bg: 17 24 39; --card: 31 41 55; --border: 55 65 81; --text: 249 250 251; --muted: 156 163 175; }
    [v-cloak] { display: none; }
    body { font-family: system-ui, sans-serif; background: rgb(var(--bg)); color: rgb(var(--text)); }
    .card { background: rgb(var(--card)); border: 1px solid rgb(var(--border)); border-radius: 12px; }
    .btn { padding: 8px 16px; border-radius: 8px; font-weight: 500; font-size: 14px; cursor: pointer; border: none; transition: all 0.15s; }
    .btn-primary { background: rgb(var(--primary)); color: white; }
    .btn-primary:hover { filter: brightness(0.9); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: rgb(var(--bg)); border: 1px solid rgb(var(--border)); color: rgb(var(--muted)); }
    .input { width: 100%; padding: 10px 14px; border: 1px solid rgb(var(--border)); border-radius: 8px; background: rgb(var(--card)); color: rgb(var(--text)); }
    .input:focus { outline: none; border-color: rgb(var(--primary)); }
    .select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; background-size: 16px; padding-right: 36px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; color: rgb(var(--muted)); cursor: pointer; transition: all 0.15s; }
    .nav-item:hover { background: rgb(var(--primary) / 0.1); }
    .nav-item.active { background: rgb(var(--primary) / 0.15); color: rgb(var(--primary)); font-weight: 600; }
    .badge { display: inline-flex; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .badge-blue { background: rgb(var(--primary) / 0.1); color: rgb(var(--primary)); }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .log-box { font-family: 'Consolas', monospace; font-size: 13px; background: #1e293b; color: #e2e8f0; border-radius: 8px; }
    .log-info { color: #60a5fa; } .log-success { color: #4ade80; } .log-warn { color: #fbbf24; } .log-error { color: #f87171; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  </style>
</head>
<body class="min-h-screen">
<div id="app" v-cloak :class="{ dark: darkMode }">
  <div class="flex min-h-screen">
    <!-- 侧边栏 -->
    <aside class="w-56 flex-shrink-0 flex flex-col border-r" style="background: rgb(var(--card)); border-color: rgb(var(--border));">
      <div class="p-4 border-b" style="border-color: rgb(var(--border));">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: rgb(var(--primary));">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <div>
            <div class="font-bold text-sm">LDesign Builder</div>
            <div class="text-xs" style="color: rgb(var(--muted));">v{{ packageInfo?.version || '1.0' }}</div>
          </div>
        </div>
      </div>
      <nav class="flex-1 p-2 space-y-1">
        <div v-for="m in menuItems" :key="m.id" @click="activeTab = m.id" class="nav-item" :class="{ active: activeTab === m.id }">
          <span v-html="m.icon" class="w-5 h-5"></span>
          <span class="text-sm">{{ m.name }}</span>
        </div>
      </nav>
      <div class="p-3 border-t text-xs flex justify-between" style="border-color: rgb(var(--border)); color: rgb(var(--muted));">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'"></span>{{ connected ? '已连接' : '离线' }}</span>
        <button @click="darkMode = !darkMode" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="darkMode ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'"/></svg>
        </button>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="flex-1 overflow-auto">
      <header class="sticky top-0 z-10 px-6 py-4 border-b" style="background: rgb(var(--card)); border-color: rgb(var(--border));">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-lg font-bold">{{ currentMenu?.name }}</h1>
            <p class="text-sm" style="color: rgb(var(--muted));">{{ packageInfo?.name || '加载中...' }}</p>
          </div>
          <div class="flex gap-2">
            <span v-if="building" class="flex items-center gap-2 px-3 py-1 rounded-full text-sm badge-blue">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              构建中
            </span>
            <button @click="refresh" class="btn btn-secondary">刷新</button>
          </div>
        </div>
      </header>

      <div class="p-6">
${generateOverviewSection()}
${generateBuildSection()}
${generateOutputSection()}
${generateConfigSection()}
${generatePublishSection()}
${generateRegistrySection()}
${generateVersionSection()}
      </div>
    </main>
  </div>
</div>

<script>
${generateVueScript()}
</script>
</body>
</html>`;
}

function generateOverviewSection(): string {
  return `
        <!-- 概览 -->
        <div v-show="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="card p-4"><div class="text-2xl font-bold" style="color: rgb(var(--primary));">{{ totalFiles }}</div><div class="text-sm" style="color: rgb(var(--muted));">输出文件</div></div>
            <div class="card p-4"><div class="text-2xl font-bold text-green-600">{{ formatSize(totalSize) }}</div><div class="text-sm" style="color: rgb(var(--muted));">产物大小</div></div>
            <div class="card p-4"><div class="text-2xl font-bold text-purple-600">{{ lastBuildDuration }}s</div><div class="text-sm" style="color: rgb(var(--muted));">构建耗时</div></div>
            <div class="card p-4"><div class="text-2xl font-bold text-orange-600">{{ buildSuccessRate }}%</div><div class="text-sm" style="color: rgb(var(--muted));">成功率</div></div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="card p-5">
              <h3 class="font-semibold mb-4">项目信息</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">名称</span><span>{{ packageInfo?.name || '-' }}</span></div>
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">版本</span><span class="badge badge-blue">{{ packageInfo?.version || '-' }}</span></div>
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">引擎</span><span>{{ configInfo?.config?.bundler || 'rollup' }}</span></div>
                <div class="flex justify-between py-2"><span style="color: rgb(var(--muted));">描述</span><span class="truncate max-w-[180px]">{{ packageInfo?.description || '-' }}</span></div>
              </div>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold mb-4">快捷操作</h3>
              <div class="grid grid-cols-2 gap-3">
                <button @click="quickBuild('production')" :disabled="building" class="p-3 rounded-lg border-2 border-dashed text-left hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20" style="border-color: rgb(var(--border));">
                  <div class="font-medium text-sm">生产构建</div><div class="text-xs" style="color: rgb(var(--muted));">优化压缩</div>
                </button>
                <button @click="quickBuild('development')" :disabled="building" class="p-3 rounded-lg border-2 border-dashed text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" style="border-color: rgb(var(--border));">
                  <div class="font-medium text-sm">开发构建</div><div class="text-xs" style="color: rgb(var(--muted));">含SourceMap</div>
                </button>
                <button @click="activeTab = 'publish'" class="p-3 rounded-lg border-2 border-dashed text-left hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20" style="border-color: rgb(var(--border));">
                  <div class="font-medium text-sm">发布NPM</div><div class="text-xs" style="color: rgb(var(--muted));">npm publish</div>
                </button>
                <button @click="activeTab = 'output'" class="p-3 rounded-lg border-2 border-dashed text-left hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20" style="border-color: rgb(var(--border));">
                  <div class="font-medium text-sm">分析产物</div><div class="text-xs" style="color: rgb(var(--muted));">查看详情</div>
                </button>
              </div>
            </div>
          </div>
          <div class="card p-5">
            <h3 class="font-semibold mb-4">最近构建</h3>
            <div class="space-y-2">
              <div v-for="h in buildHistory.slice(-5).reverse()" :key="h.id" class="flex justify-between items-center p-3 rounded-lg" style="background: rgb(var(--bg));">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full" :class="h.success ? 'bg-green-500' : 'bg-red-500'"></span>
                  <span class="text-sm">{{ h.mode }} 构建</span>
                  <span class="text-xs" style="color: rgb(var(--muted));">{{ formatTime(h.timestamp) }}</span>
                </div>
                <span class="text-sm">{{ h.duration.toFixed(2) }}s / {{ formatSize(h.outputSize) }}</span>
              </div>
              <div v-if="!buildHistory.length" class="text-center py-6" style="color: rgb(var(--muted));">暂无构建记录</div>
            </div>
          </div>
        </div>`;
}

function generateBuildSection(): string {
  return `
        <!-- 构建 -->
        <div v-show="activeTab === 'build'" class="space-y-6">
          <div class="grid grid-cols-3 gap-6">
            <div class="card p-5">
              <h3 class="font-semibold mb-4">构建选项</h3>
              <div class="space-y-4">
                <div><label class="block text-sm mb-1" style="color: rgb(var(--muted));">构建模式</label><select v-model="buildOptions.mode" class="input select"><option value="production">Production</option><option value="development">Development</option></select></div>
                <div><label class="block text-sm mb-1" style="color: rgb(var(--muted));">打包引擎</label><select v-model="buildOptions.bundler" class="input select"><option value="">自动</option><option value="rollup">Rollup</option><option value="esbuild">esbuild</option></select></div>
                <label class="flex items-center gap-2"><input type="checkbox" v-model="buildOptions.clean" class="rounded"><span class="text-sm">清理输出目录</span></label>
                <button @click="startBuild" :disabled="building" class="btn btn-primary w-full">{{ building ? '构建中...' : '开始构建' }}</button>
              </div>
            </div>
            <div class="col-span-2 card p-5">
              <div class="flex justify-between mb-4"><h3 class="font-semibold">构建日志</h3><button @click="clearLogs" class="text-sm" style="color: rgb(var(--muted));">清空</button></div>
              <div ref="logContainer" class="log-box h-[350px] overflow-auto p-4">
                <div v-for="(log, i) in buildLogs" :key="i" :class="getLogClass(log)">{{ log }}</div>
                <div v-if="!buildLogs.length" class="text-gray-500">等待构建...</div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateOutputSection(): string {
  return `
        <!-- 产物 -->
        <div v-show="activeTab === 'output'" class="space-y-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="card p-4 text-center"><div class="text-2xl font-bold" style="color: rgb(var(--primary));">{{ outputs.length }}</div><div class="text-sm" style="color: rgb(var(--muted));">输出目录</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-green-600">{{ totalFiles }}</div><div class="text-sm" style="color: rgb(var(--muted));">文件数</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-purple-600">{{ formatSize(totalSize) }}</div><div class="text-sm" style="color: rgb(var(--muted));">总大小</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-orange-600">{{ jsFileCount }}</div><div class="text-sm" style="color: rgb(var(--muted));">JS文件</div></div>
          </div>
          <div class="card p-5">
            <div class="flex justify-between mb-4"><h3 class="font-semibold">产物文件</h3><button @click="refreshOutputs" class="btn btn-secondary text-sm">刷新</button></div>
            <div class="space-y-3">
              <div v-for="out in outputs" :key="out.dir" class="border rounded-lg" style="border-color: rgb(var(--border));">
                <div @click="toggleDir(out.dir)" class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 transition" :class="expandedDirs[out.dir] ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    <span class="font-medium">{{ out.dir }}/</span>
                    <span class="badge badge-blue">{{ out.files.length }}</span>
                  </div>
                  <span class="text-sm" style="color: rgb(var(--muted));">{{ formatSize(out.totalSize) }}</span>
                </div>
                <div v-show="expandedDirs[out.dir]" class="border-t px-4" style="border-color: rgb(var(--border));">
                  <div v-for="f in out.files" :key="f.name" class="flex justify-between py-2 text-sm">
                    <span>{{ f.name }}</span><span style="color: rgb(var(--muted));">{{ formatSize(f.size) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!outputs.length" class="text-center py-8" style="color: rgb(var(--muted));">暂无产物</div>
            </div>
          </div>
        </div>`;
}

function generateConfigSection(): string {
  return `
        <!-- 配置 -->
        <div v-show="activeTab === 'config'" class="space-y-6">
          <div class="card p-5">
            <div class="flex justify-between mb-6"><h3 class="font-semibold">构建配置</h3><div class="flex gap-2"><button @click="resetConfig" class="btn btn-secondary">重置</button><button @click="saveConfig" class="btn btn-primary">保存</button></div></div>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-4">
                <div><label class="block text-sm mb-1">入口文件</label><input v-model="editConfig.input" class="input" placeholder="src/index.ts"></div>
                <div><label class="block text-sm mb-1">输出目录</label><input v-model="editConfig.outDir" class="input" placeholder="dist"></div>
                <div><label class="block text-sm mb-1">打包引擎</label><select v-model="editConfig.bundler" class="input select"><option value="rollup">Rollup</option><option value="esbuild">esbuild</option></select></div>
                <div><label class="block text-sm mb-1">构建目标</label><input v-model="editConfig.target" class="input" placeholder="es2020"></div>
              </div>
              <div class="space-y-4">
                <div><label class="block text-sm mb-2">输出格式</label><div class="flex flex-wrap gap-2"><label v-for="f in ['esm','cjs','umd','iife']" :key="f" class="flex items-center gap-2 px-3 py-2 rounded border cursor-pointer" :class="editConfig.formats?.includes(f) ? 'border-blue-500 bg-blue-50' : ''" style="border-color: rgb(var(--border));"><input type="checkbox" :value="f" v-model="editConfig.formats" class="rounded"><span class="font-mono text-sm">{{ f.toUpperCase() }}</span></label></div></div>
                <div class="grid grid-cols-2 gap-2 pt-2">
                  <label class="flex items-center gap-2"><input type="checkbox" v-model="editConfig.dts" class="rounded"><span class="text-sm">类型声明</span></label>
                  <label class="flex items-center gap-2"><input type="checkbox" v-model="editConfig.sourcemap" class="rounded"><span class="text-sm">SourceMap</span></label>
                  <label class="flex items-center gap-2"><input type="checkbox" v-model="editConfig.minify" class="rounded"><span class="text-sm">压缩</span></label>
                  <label class="flex items-center gap-2"><input type="checkbox" v-model="editConfig.treeshake" class="rounded"><span class="text-sm">TreeShake</span></label>
                </div>
                <div><label class="block text-sm mb-1">外部依赖</label><input v-model="externalStr" class="input" placeholder="react, vue"></div>
              </div>
            </div>
          </div>
        </div>`;
}

function generatePublishSection(): string {
  return `
        <!-- 发布 -->
        <div v-show="activeTab === 'publish'" class="space-y-6">
          <div class="grid grid-cols-3 gap-6">
            <div class="card p-5">
              <h3 class="font-semibold mb-4">发布配置</h3>
              <div class="space-y-4">
                <div><label class="block text-sm mb-1" style="color: rgb(var(--muted));">NPM源</label><select v-model="publishOptions.registry" class="input select"><option value="">默认(npm)</option><option v-for="r in registries" :key="r.url" :value="r.url">{{ r.name }}</option></select></div>
                <div><label class="block text-sm mb-1" style="color: rgb(var(--muted));">标签</label><select v-model="publishOptions.tag" class="input select"><option value="latest">latest</option><option value="next">next</option><option value="beta">beta</option><option value="alpha">alpha</option></select></div>
                <div><label class="block text-sm mb-1" style="color: rgb(var(--muted));">访问级别</label><select v-model="publishOptions.access" class="input select"><option value="public">公开</option><option value="restricted">私有</option></select></div>
                <div><label class="block text-sm mb-1" style="color: rgb(var(--muted));">OTP验证码</label><input v-model="publishOptions.otp" class="input" placeholder="2FA验证码"></div>
                <label class="flex items-center gap-2"><input type="checkbox" v-model="publishOptions.dryRun" class="rounded"><span class="text-sm">模拟发布</span></label>
                <button @click="runPublishChecks" class="btn btn-secondary w-full">发布前检查</button>
                <button @click="doPublish" :disabled="publishing" class="btn btn-primary w-full">{{ publishing ? '发布中...' : '发布到NPM' }}</button>
              </div>
            </div>
            <div class="col-span-2 space-y-4">
              <div class="card p-5">
                <h3 class="font-semibold mb-4">检查结果</h3>
                <div class="space-y-2">
                  <div v-for="c in publishChecks" :key="c.name" class="flex justify-between items-center p-3 rounded-lg" style="background: rgb(var(--bg));">
                    <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full" :class="c.status==='pass' ? 'bg-green-500' : c.status==='fail' ? 'bg-red-500' : 'bg-yellow-500'"></span><span class="text-sm">{{ c.name }}</span></div>
                    <span class="text-xs" style="color: rgb(var(--muted));">{{ c.message }}</span>
                  </div>
                  <div v-if="!publishChecks.length" class="text-center py-4" style="color: rgb(var(--muted));">点击"发布前检查"</div>
                </div>
              </div>
              <div class="card p-5">
                <div class="flex justify-between mb-4"><h3 class="font-semibold">发布日志</h3><button @click="publishLogs=[]" class="text-sm" style="color: rgb(var(--muted));">清空</button></div>
                <div class="log-box h-[180px] overflow-auto p-4">
                  <div v-for="(log,i) in publishLogs" :key="i" :class="getLogClass(log)">{{ log }}</div>
                  <div v-if="!publishLogs.length" class="text-gray-500">发布日志...</div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateRegistrySection(): string {
  return `
        <!-- NPM源 -->
        <div v-show="activeTab === 'registry'" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="card p-5">
              <div class="flex justify-between mb-4"><h3 class="font-semibold">NPM源列表</h3><button @click="showAddRegistry=true" class="btn btn-primary text-sm">添加源</button></div>
              <div class="space-y-2">
                <div v-for="r in registries" :key="r.url" class="flex justify-between items-center p-3 rounded-lg" style="background: rgb(var(--bg));">
                  <div><div class="font-medium text-sm">{{ r.name }}</div><div class="text-xs font-mono" style="color: rgb(var(--muted));">{{ r.url }}</div></div>
                  <div class="flex items-center gap-2">
                    <span class="badge" :class="r.loggedIn ? 'badge-green' : 'badge-red'">{{ r.loggedIn ? '已登录' : '未登录' }}</span>
                    <button @click="loginRegistry(r)" class="btn btn-secondary text-xs py-1 px-2">登录</button>
                    <button v-if="!r.isDefault" @click="removeRegistry(r)" class="text-red-500 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </div>
                <div v-if="!registries.length" class="text-center py-6" style="color: rgb(var(--muted));">暂无NPM源</div>
              </div>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold mb-4">{{ showAddRegistry ? '添加NPM源' : '源登录' }}</h3>
              <div v-if="showAddRegistry" class="space-y-4">
                <div><label class="block text-sm mb-1">源名称</label><input v-model="newRegistry.name" class="input" placeholder="私有源"></div>
                <div><label class="block text-sm mb-1">源地址</label><input v-model="newRegistry.url" class="input" placeholder="https://registry.example.com"></div>
                <div><label class="block text-sm mb-1">Token(可选)</label><input v-model="newRegistry.token" type="password" class="input"></div>
                <div class="flex gap-2"><button @click="showAddRegistry=false" class="btn btn-secondary flex-1">取消</button><button @click="addRegistry" class="btn btn-primary flex-1">添加</button></div>
              </div>
              <div v-else-if="selectedRegistry" class="space-y-4">
                <div class="p-3 rounded-lg" style="background: rgb(var(--bg));"><div class="font-medium text-sm">{{ selectedRegistry.name }}</div><div class="text-xs font-mono" style="color: rgb(var(--muted));">{{ selectedRegistry.url }}</div></div>
                <div><label class="block text-sm mb-1">用户名</label><input v-model="loginForm.username" class="input"></div>
                <div><label class="block text-sm mb-1">密码</label><input v-model="loginForm.password" type="password" class="input"></div>
                <div><label class="block text-sm mb-1">邮箱</label><input v-model="loginForm.email" class="input"></div>
                <div class="flex gap-2"><button @click="selectedRegistry=null" class="btn btn-secondary flex-1">取消</button><button @click="doLogin" class="btn btn-primary flex-1">登录</button></div>
              </div>
              <div v-else class="text-center py-8" style="color: rgb(var(--muted));">选择源进行登录或添加新源</div>
            </div>
          </div>
        </div>`;
}

function generateVersionSection(): string {
  return `
        <!-- 版本 -->
        <div v-show="activeTab === 'version'" class="space-y-6">
          <div class="grid grid-cols-3 gap-6">
            <div class="card p-5">
              <h3 class="font-semibold mb-4">版本管理</h3>
              <div class="space-y-4">
                <div class="p-4 rounded-lg text-center" style="background: rgb(var(--bg));"><div class="text-3xl font-bold" style="color: rgb(var(--primary));">{{ versionInfo.currentVersion }}</div><div class="text-sm" style="color: rgb(var(--muted));">当前版本</div></div>
                <div class="grid grid-cols-3 gap-2">
                  <button @click="bumpVersion('patch')" class="btn btn-secondary text-sm">Patch</button>
                  <button @click="bumpVersion('minor')" class="btn btn-secondary text-sm">Minor</button>
                  <button @click="bumpVersion('major')" class="btn btn-secondary text-sm">Major</button>
                </div>
                <div><label class="block text-sm mb-1">自定义版本</label><div class="flex gap-2"><input v-model="customVersion" class="input" placeholder="1.0.0"><button @click="setVersion(customVersion)" class="btn btn-primary">设置</button></div></div>
              </div>
            </div>
            <div class="col-span-2 card p-5">
              <h3 class="font-semibold mb-4">版本历史</h3>
              <div class="space-y-2 max-h-[300px] overflow-auto">
                <div v-for="v in versionInfo.versionHistory" :key="v.version+v.timestamp" class="flex justify-between items-center p-3 rounded-lg" style="background: rgb(var(--bg));">
                  <div><span class="badge badge-blue mr-2">{{ v.version }}</span><span class="text-xs" style="color: rgb(var(--muted));">{{ formatTime(v.timestamp) }}</span></div>
                  <span class="text-xs" style="color: rgb(var(--muted));">{{ v.type }}</span>
                </div>
                <div v-if="!versionInfo.versionHistory?.length" class="text-center py-6" style="color: rgb(var(--muted));">暂无版本历史</div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateVueScript(): string {
  return `
const { createApp, ref, reactive, computed, onMounted, watch, nextTick } = Vue

const ICONS = {
  overview: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  build: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  output: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
  config: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>',
  publish: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
  registry: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>',
  version: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>'
}

createApp({
  setup() {
    const darkMode = ref(localStorage.getItem('darkMode') === 'true')
    const connected = ref(false)
    const ws = ref(null)
    const activeTab = ref('overview')
    const building = ref(false)
    const publishing = ref(false)
    const logContainer = ref(null)

    const menuItems = [
      { id: 'overview', name: '概览', icon: ICONS.overview },
      { id: 'build', name: '构建', icon: ICONS.build },
      { id: 'output', name: '产物', icon: ICONS.output },
      { id: 'config', name: '配置', icon: ICONS.config },
      { id: 'publish', name: '发布', icon: ICONS.publish },
      { id: 'registry', name: 'NPM源', icon: ICONS.registry },
      { id: 'version', name: '版本', icon: ICONS.version },
    ]
    const currentMenu = computed(() => menuItems.find(m => m.id === activeTab.value))

    const packageInfo = ref(null)
    const configInfo = ref(null)
    const outputs = ref([])
    const buildHistory = ref([])
    const buildLogs = ref([])
    const publishLogs = ref([])
    const publishChecks = ref([])
    const expandedDirs = reactive({})
    const registries = ref([{ name: 'npm官方', url: 'https://registry.npmjs.org', isDefault: true, loggedIn: false }])

    const editConfig = reactive({ input: 'src/index.ts', outDir: 'dist', bundler: 'rollup', target: 'es2020', formats: ['esm', 'cjs'], dts: true, sourcemap: true, minify: false, treeshake: true, external: [] })
    const externalStr = computed({ get: () => editConfig.external.join(', '), set: v => editConfig.external = v.split(',').map(s => s.trim()).filter(Boolean) })
    const buildOptions = reactive({ mode: 'production', bundler: '', clean: true })
    const publishOptions = reactive({ registry: '', tag: 'latest', access: 'public', otp: '', dryRun: false })
    const versionInfo = reactive({ currentVersion: '0.0.0', versionHistory: [] })
    const customVersion = ref('')

    const showAddRegistry = ref(false)
    const newRegistry = reactive({ name: '', url: '', token: '' })
    const selectedRegistry = ref(null)
    const loginForm = reactive({ username: '', password: '', email: '' })

    const totalFiles = computed(() => outputs.value.reduce((s, o) => s + o.files.length, 0))
    const totalSize = computed(() => outputs.value.reduce((s, o) => s + o.totalSize, 0))
    const jsFileCount = computed(() => outputs.value.reduce((s, o) => s + o.files.filter(f => ['js','mjs','cjs'].includes(f.type)).length, 0))
    const lastBuildDuration = computed(() => buildHistory.value.length ? buildHistory.value[buildHistory.value.length-1].duration.toFixed(2) : '--')
    const buildSuccessRate = computed(() => { const t = buildHistory.value.length; return t ? Math.round(buildHistory.value.filter(h => h.success).length / t * 100) : 0 })

    const formatSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(2) + ' KB' : (b/1048576).toFixed(2) + ' MB'
    const formatTime = (ts) => new Date(ts).toLocaleString('zh-CN')
    const getLogClass = (log) => log.includes('error') || log.includes('Error') || log.includes('❌') ? 'log-error' : log.includes('warn') || log.includes('⚠') ? 'log-warn' : log.includes('✓') || log.includes('✅') || log.includes('success') ? 'log-success' : log.includes('ℹ') ? 'log-info' : ''
    const toggleDir = (dir) => { expandedDirs[dir] = !expandedDirs[dir] }

    function send(data) { if (ws.value?.readyState === 1) ws.value.send(JSON.stringify(data)) }
    function connectWS() {
      ws.value = new WebSocket('ws://' + location.host)
      ws.value.onopen = () => { connected.value = true; send({ type: 'init' }) }
      ws.value.onclose = () => { connected.value = false; setTimeout(connectWS, 3000) }
      ws.value.onmessage = (e) => handleMessage(JSON.parse(e.data))
    }
    function handleMessage(data) {
      switch(data.type) {
        case 'init': packageInfo.value = data.packageInfo; configInfo.value = data.configInfo; outputs.value = data.outputs || []; if(data.configInfo?.config) Object.assign(editConfig, data.configInfo.config); break
        case 'buildStart': building.value = true; break
        case 'buildEnd': building.value = false; if(data.history) buildHistory.value = data.history; send({ type: 'getOutputs' }); break
        case 'log': buildLogs.value.push(data.message); nextTick(() => { if(logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight }); break
        case 'outputs': outputs.value = data.outputs || []; break
        case 'publishStart': publishing.value = true; break
        case 'publishEnd': publishing.value = false; break
        case 'publishLog': publishLogs.value.push(data.message); break
        case 'publishChecks': publishChecks.value = data.checks || []; break
        case 'versionInfo': versionInfo.currentVersion = data.version || '0.0.0'; versionInfo.versionHistory = data.history || []; break
        case 'registries': registries.value = data.registries || []; break
      }
    }

    function startBuild() { buildLogs.value = []; send({ type: 'build', options: buildOptions }) }
    function quickBuild(mode) { buildLogs.value = []; activeTab.value = 'build'; send({ type: 'build', options: { ...buildOptions, mode } }) }
    function clearLogs() { buildLogs.value = [] }
    function refreshOutputs() { send({ type: 'getOutputs' }) }
    function saveConfig() { send({ type: 'saveConfig', config: editConfig }) }
    function resetConfig() { send({ type: 'init' }) }
    function refresh() { send({ type: 'init' }) }
    function runPublishChecks() { send({ type: 'runPublishChecks' }) }
    function doPublish() { publishLogs.value = []; send({ type: 'publish', options: publishOptions }) }
    function bumpVersion(type) { send({ type: 'bumpVersion', bumpType: type }) }
    function setVersion(v) { if(v) send({ type: 'setVersion', version: v }) }
    function addRegistry() { if(newRegistry.name && newRegistry.url) { send({ type: 'addRegistry', registry: { ...newRegistry } }); Object.assign(newRegistry, { name: '', url: '', token: '' }); showAddRegistry.value = false } }
    function removeRegistry(r) { send({ type: 'removeRegistry', url: r.url }) }
    function loginRegistry(r) { selectedRegistry.value = r; Object.assign(loginForm, { username: '', password: '', email: '' }) }
    function doLogin() { send({ type: 'loginRegistry', url: selectedRegistry.value.url, credentials: loginForm }); selectedRegistry.value = null }

    watch(darkMode, v => { localStorage.setItem('darkMode', v); document.documentElement.classList.toggle('dark', v) }, { immediate: true })
    watch(activeTab, t => { if(t === 'version') send({ type: 'getVersionInfo' }); if(t === 'registry') send({ type: 'getRegistries' }) })
    onMounted(connectWS)

    return {
      darkMode, connected, activeTab, menuItems, currentMenu, building, publishing, logContainer,
      packageInfo, configInfo, outputs, buildHistory, buildLogs, publishLogs, publishChecks, expandedDirs, registries,
      editConfig, externalStr, buildOptions, publishOptions, versionInfo, customVersion,
      showAddRegistry, newRegistry, selectedRegistry, loginForm,
      totalFiles, totalSize, jsFileCount, lastBuildDuration, buildSuccessRate,
      formatSize, formatTime, getLogClass, toggleDir,
      startBuild, quickBuild, clearLogs, refreshOutputs, saveConfig, resetConfig, refresh,
      runPublishChecks, doPublish, bumpVersion, setVersion,
      addRegistry, removeRegistry, loginRegistry, doLogin
    }
  }
}).mount('#app')`;
}
