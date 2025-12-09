/**
 * Builder UI - 可视化构建控制台
 * 功能：概览、构建、产物分析、配置、发布、NPM源、标签、版本、依赖分析
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
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <style>
    :root { 
      --primary: 59 130 246; --primary-dark: 37 99 235;
      --bg: 249 250 251; --card: 255 255 255; --border: 229 231 235; 
      --text: 17 24 39; --muted: 107 114 128; --success: 34 197 94; --danger: 239 68 68; --warning: 245 158 11;
    }
    .dark { --bg: 15 23 42; --card: 30 41 59; --border: 51 65 85; --text: 248 250 252; --muted: 148 163 184; }
    .theme-blue { --primary: 59 130 246; --primary-dark: 37 99 235; }
    .theme-purple { --primary: 139 92 246; --primary-dark: 124 58 237; }
    .theme-green { --primary: 34 197 94; --primary-dark: 22 163 74; }
    .theme-orange { --primary: 249 115 22; --primary-dark: 234 88 12; }
    .theme-pink { --primary: 236 72 153; --primary-dark: 219 39 119; }
    .theme-teal { --primary: 20 184 166; --primary-dark: 13 148 136; }
    [v-cloak] { display: none; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: rgb(var(--bg)); color: rgb(var(--text)); margin: 0; }
    .card { background: rgb(var(--card)); border: 1px solid rgb(var(--border)); border-radius: 12px; transition: all 0.2s; }
    .card:hover { box-shadow: 0 4px 12px rgb(0 0 0 / 0.05); }
    .card-header { padding: 16px 20px; border-bottom: 1px solid rgb(var(--border)); font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
    .card-body { padding: 20px; }
    .btn { padding: 8px 16px; border-radius: 8px; font-weight: 500; font-size: 14px; cursor: pointer; border: none; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-primary { background: rgb(var(--primary)); color: white; }
    .btn-primary:hover { background: rgb(var(--primary-dark)); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-secondary { background: transparent; border: 1px solid rgb(var(--border)); color: rgb(var(--text)); }
    .btn-secondary:hover { background: rgb(var(--bg)); border-color: rgb(var(--primary)); }
    .btn-ghost { background: transparent; color: rgb(var(--muted)); }
    .btn-ghost:hover { background: rgb(var(--bg)); color: rgb(var(--text)); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-xs { padding: 4px 8px; font-size: 11px; }
    .btn-danger { background: rgb(var(--danger)); color: white; }
    .btn-success { background: rgb(var(--success)); color: white; }
    .btn-icon { width: 32px; height: 32px; padding: 0; border-radius: 8px; }
    .input { width: 100%; padding: 10px 14px; border: 1px solid rgb(var(--border)); border-radius: 8px; background: rgb(var(--card)); color: rgb(var(--text)); font-size: 14px; transition: all 0.15s; }
    .input:focus { outline: none; border-color: rgb(var(--primary)); box-shadow: 0 0 0 3px rgb(var(--primary) / 0.1); }
    .input-sm { padding: 8px 12px; font-size: 13px; }
    .input-group { display: flex; gap: 8px; }
    .input-group .input { flex: 1; }
    .label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: rgb(var(--text)); }
    .label-muted { color: rgb(var(--muted)); }
    .help-text { font-size: 12px; color: rgb(var(--muted)); margin-top: 4px; }
    .select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 14px; padding-right: 36px; }
    .checkbox-group { display: flex; flex-wrap: wrap; gap: 12px; }
    .checkbox-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid rgb(var(--border)); border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 13px; }
    .checkbox-item:hover { border-color: rgb(var(--primary)); }
    .checkbox-item.active { border-color: rgb(var(--primary)); background: rgb(var(--primary) / 0.05); }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: rgb(var(--muted)); cursor: pointer; transition: all 0.15s; font-size: 13px; }
    .nav-item:hover { background: rgb(var(--primary) / 0.08); color: rgb(var(--text)); }
    .nav-item.active { background: rgb(var(--primary) / 0.12); color: rgb(var(--primary)); font-weight: 600; }
    .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .badge-blue { background: rgb(var(--primary) / 0.1); color: rgb(var(--primary)); }
    .badge-green { background: rgb(34 197 94 / 0.1); color: #16a34a; }
    .badge-red { background: rgb(239 68 68 / 0.1); color: #dc2626; }
    .badge-yellow { background: rgb(245 158 11 / 0.1); color: #d97706; }
    .badge-purple { background: rgb(139 92 246 / 0.1); color: #7c3aed; }
    .badge-gray { background: rgb(var(--muted) / 0.1); color: rgb(var(--muted)); }
    .log-box { font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace; font-size: 12px; background: rgb(var(--log-bg)); color: rgb(var(--log-text)); border-radius: 8px; line-height: 1.6; border: 1px solid rgb(var(--border)); }
    :root { --log-bg: 241 245 249; --log-text: 30 41 59; }
    .dark { --log-bg: 15 23 42; --log-text: 226 232 240; }
    .log-info { color: #3b82f6; } .log-success { color: #22c55e; } .log-warn { color: #f59e0b; } .log-error { color: #ef4444; }
    .dark .log-info { color: #60a5fa; } .dark .log-success { color: #4ade80; } .dark .log-warn { color: #fbbf24; } .dark .log-error { color: #f87171; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal { background: rgb(var(--card)); border-radius: 12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); max-width: 480px; width: 90%; }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid rgb(var(--border)); font-weight: 600; }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid rgb(var(--border)); display: flex; justify-content: flex-end; gap: 8px; }
    .tab-group { display: flex; gap: 4px; padding: 4px; background: rgb(var(--bg)); border-radius: 10px; }
    .tab-btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; background: transparent; color: rgb(var(--muted)); }
    .tab-btn:hover { color: rgb(var(--text)); }
    .tab-btn.active { background: rgb(var(--card)); color: rgb(var(--primary)); box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); }
    .section-title { font-size: 14px; font-weight: 600; color: rgb(var(--text)); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section-title svg { width: 18px; height: 18px; color: rgb(var(--primary)); }
    .divider { height: 1px; background: rgb(var(--border)); margin: 20px 0; }
    .form-grid { display: grid; gap: 16px; }
    .form-grid-2 { grid-template-columns: repeat(2, 1fr); }
    .form-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .form-grid-4 { grid-template-columns: repeat(4, 1fr); }
    .stat-card { position: relative; overflow: hidden; }
    .stat-card::after { content: ''; position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; border-radius: 50%; opacity: 0.08; }
    .stat-blue::after { background: rgb(var(--primary)); }
    .stat-green::after { background: #22c55e; }
    .stat-purple::after { background: #a855f7; }
    .stat-orange::after { background: #f97316; }
    .color-dot { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
    .color-dot:hover { transform: scale(1.1); }
    .color-dot.active { border-color: rgb(var(--text)); box-shadow: 0 0 0 2px rgb(var(--card)); }
    .tooltip { position: relative; }
    .tooltip::after { content: attr(data-tip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding: 4px 8px; background: rgb(var(--text)); color: rgb(var(--card)); font-size: 11px; border-radius: 4px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.15s; }
    .tooltip:hover::after { opacity: 1; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
    .fade-in { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .slide-in { animation: slideIn 0.25s ease; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
    .progress-bar { height: 6px; background: rgb(var(--border)); border-radius: 3px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: rgb(var(--primary)); border-radius: 3px; transition: width 0.3s ease; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: rgb(var(--muted)); }
    .empty-state svg { width: 48px; height: 48px; opacity: 0.3; margin-bottom: 12px; }
    /* 滚动条样式 - 亮色模式 */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgb(241 245 249); border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: rgb(203 213 225); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgb(148 163 184); }
    /* 滚动条样式 - 暗色模式 */
    .dark ::-webkit-scrollbar-track { background: rgb(30 41 59); }
    .dark ::-webkit-scrollbar-thumb { background: rgb(71 85 105); }
    .dark ::-webkit-scrollbar-thumb:hover { background: rgb(100 116 139); }
    .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
    /* 禁止横向滚动 */
    html, body { overflow-x: hidden; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    /* 图表容器 */
    .chart-container { width: 100%; height: 200px; }
    .chart-container-lg { width: 100%; height: 280px; }
  </style>
</head>
<body class="h-screen overflow-hidden">
<div id="app" v-cloak :class="[{ dark: darkMode }, 'theme-' + currentTheme]" class="h-full">
  <div class="flex h-screen overflow-hidden">
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
      <!-- 主题设置 -->
      <div class="p-3 border-t" style="border-color: rgb(var(--border));">
        <div class="mb-3">
          <div class="text-xs font-medium mb-2" style="color: rgb(var(--muted));">主题色</div>
          <div class="flex gap-2">
            <button v-for="c in themeColors" :key="c.name" @click="setTheme(c.name)" class="color-dot" :class="{ active: currentTheme === c.name }" :style="{ background: c.color }" :title="c.label"></button>
          </div>
        </div>
        <div class="flex justify-between items-center text-xs" style="color: rgb(var(--muted));">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'"></span>
            {{ connected ? '已连接' : '离线' }}
          </span>
          <button @click="darkMode = !darkMode" class="btn btn-ghost btn-icon" :title="darkMode ? '浅色模式' : '深色模式'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="darkMode ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="flex-shrink-0 px-6 py-4 border-b" style="background: rgb(var(--card)); border-color: rgb(var(--border));">
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

      <div class="flex-1 overflow-auto p-6">
${generateOverviewSection()}
${generateBuildSection()}
${generateOutputSection()}
${generateConfigSection()}
${generatePublishSection()}
${generateRegistrySection()}
${generateTagsSection()}
${generateDepsSection()}
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
        <div v-show="activeTab === 'overview'" class="space-y-5 fade-in">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-5 gap-4">
            <div class="card p-4 stat-card stat-blue">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgb(var(--primary) / 0.1);">
                  <svg class="w-5 h-5" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div class="text-2xl font-bold" style="color: rgb(var(--primary));">{{ totalFiles }}</div>
              </div>
              <div class="text-xs" style="color: rgb(var(--muted));">输出文件数</div>
            </div>
            <div class="card p-4 stat-card stat-green">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>
                </div>
                <div class="text-2xl font-bold text-green-600">{{ formatSize(totalSize) }}</div>
              </div>
              <div class="text-xs" style="color: rgb(var(--muted));">产物总大小</div>
            </div>
            <div class="card p-4 stat-card stat-purple">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="text-2xl font-bold text-purple-600">{{ lastBuildDuration }}s</div>
              </div>
              <div class="text-xs" style="color: rgb(var(--muted));">上次构建耗时</div>
            </div>
            <div class="card p-4 stat-card stat-orange">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="text-2xl font-bold text-orange-600">{{ buildSuccessRate }}%</div>
              </div>
              <div class="text-xs" style="color: rgb(var(--muted));">构建成功率</div>
            </div>
            <div class="card p-4 stat-card">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-100 dark:bg-pink-900/30">
                  <svg class="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <div class="text-2xl font-bold text-pink-600">{{ dependencies.length }}</div>
              </div>
              <div class="text-xs" style="color: rgb(var(--muted));">依赖包数量</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-5">
            <!-- 项目信息 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                项目信息
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">名称</span><span class="font-medium">{{ packageInfo?.name || '-' }}</span></div>
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">版本</span><span class="badge badge-blue">{{ packageInfo?.version || '-' }}</span></div>
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">引擎</span><span class="badge badge-purple">{{ configInfo?.config?.bundler || 'rollup' }}</span></div>
                <div class="flex justify-between py-2 border-b" style="border-color: rgb(var(--border));"><span style="color: rgb(var(--muted));">许可证</span><span>{{ packageInfo?.license || 'MIT' }}</span></div>
                <div class="flex justify-between py-2"><span style="color: rgb(var(--muted));">作者</span><span class="truncate max-w-[120px]">{{ packageInfo?.author || '-' }}</span></div>
              </div>
            </div>
            
            <!-- 构建趋势图 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                构建趋势
              </h3>
              <div ref="buildTrendChart" class="h-[160px]"></div>
            </div>

            <!-- 文件类型分布 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
                文件分布
              </h3>
              <div ref="fileTypeChart" class="h-[160px]"></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <!-- 快捷操作 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                快捷操作
              </h3>
              <div class="grid grid-cols-4 gap-3">
                <button @click="quickBuild('production')" :disabled="building" class="p-3 rounded-lg border-2 border-dashed text-center hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition" style="border-color: rgb(var(--border));">
                  <svg class="w-6 h-6 mx-auto mb-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                  <div class="font-medium text-xs">生产构建</div>
                </button>
                <button @click="quickBuild('development')" :disabled="building" class="p-3 rounded-lg border-2 border-dashed text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" style="border-color: rgb(var(--border));">
                  <svg class="w-6 h-6 mx-auto mb-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  <div class="font-medium text-xs">开发构建</div>
                </button>
                <button @click="activeTab = 'publish'" class="p-3 rounded-lg border-2 border-dashed text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition" style="border-color: rgb(var(--border));">
                  <svg class="w-6 h-6 mx-auto mb-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <div class="font-medium text-xs">发布NPM</div>
                </button>
                <button @click="activeTab = 'output'" class="p-3 rounded-lg border-2 border-dashed text-center hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition" style="border-color: rgb(var(--border));">
                  <svg class="w-6 h-6 mx-auto mb-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  <div class="font-medium text-xs">产物分析</div>
                </button>
              </div>
            </div>
            
            <!-- 最近构建 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                最近构建
              </h3>
              <div class="space-y-2 max-h-[140px] overflow-auto">
                <div v-for="h in buildHistory.slice(-5).reverse()" :key="h.id" class="flex justify-between items-center p-2 rounded-lg text-sm" style="background: rgb(var(--bg));">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="h.success ? 'bg-green-500' : 'bg-red-500'"></span>
                    <span>{{ h.mode }}</span>
                    <span class="text-xs" style="color: rgb(var(--muted));">{{ formatTime(h.timestamp) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="badge" :class="h.success ? 'badge-green' : 'badge-red'">{{ h.duration.toFixed(1) }}s</span>
                    <span class="text-xs" style="color: rgb(var(--muted));">{{ formatSize(h.outputSize) }}</span>
                  </div>
                </div>
                <div v-if="!buildHistory.length" class="text-center py-4 text-sm" style="color: rgb(var(--muted));">暂无构建记录</div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateBuildSection(): string {
  return `
        <!-- 构建 -->
        <div v-show="activeTab === 'build'" class="flex flex-col fade-in" style="height: calc(100vh - 140px);">
          <!-- 上部：构建选项 -->
          <div class="card p-4 mb-4">
            <div class="flex items-center gap-4">
              <div class="flex-1 grid grid-cols-6 gap-3 items-end">
                <div>
                  <label class="block text-xs font-medium mb-1" style="color: rgb(var(--muted));">构建模式</label>
                  <select v-model="buildOptions.mode" class="input input-sm select">
                    <option value="production">Production</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" style="color: rgb(var(--muted));">打包引擎</label>
                  <select v-model="buildOptions.bundler" class="input input-sm select">
                    <option value="">自动</option>
                    <option value="rollup">Rollup</option>
                    <option value="esbuild">esbuild</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" style="color: rgb(var(--muted));">版本更新</label>
                  <select v-model="buildOptions.versionBump" class="input input-sm select">
                    <option value="">不更新</option>
                    <option value="patch">Patch (+0.0.1)</option>
                    <option value="minor">Minor (+0.1.0)</option>
                    <option value="major">Major (+1.0.0)</option>
                    <option value="prerelease">Prerelease</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" style="color: rgb(var(--muted));">输出格式</label>
                  <div class="flex gap-1">
                    <label v-for="f in ['esm','cjs','umd']" :key="f" class="flex items-center gap-1 px-2 py-1.5 rounded border text-xs cursor-pointer transition" :class="buildOptions.formats?.includes(f) ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''" style="border-color: rgb(var(--border));">
                      <input type="checkbox" :value="f" v-model="buildOptions.formats" class="rounded w-3 h-3">
                      <span class="font-mono">{{ f }}</span>
                    </label>
                  </div>
                </div>
                <div class="flex items-center gap-3 pt-4">
                  <label class="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input type="checkbox" v-model="buildOptions.clean" class="rounded w-3 h-3">
                    <span>清理</span>
                  </label>
                  <label class="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input type="checkbox" v-model="buildOptions.sourcemap" class="rounded w-3 h-3">
                    <span>Map</span>
                  </label>
                  <label class="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input type="checkbox" v-model="buildOptions.minify" class="rounded w-3 h-3">
                    <span>压缩</span>
                  </label>
                </div>
                <div>
                  <button @click="startBuild" :disabled="building" class="btn btn-primary w-full flex items-center justify-center gap-2">
                    <svg v-if="building" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ building ? '构建中...' : '开始构建' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 下部：构建日志（铺满剩余空间） -->
          <div class="card flex-1 flex flex-col overflow-hidden">
            <div class="flex justify-between items-center px-4 py-3 border-b" style="border-color: rgb(var(--border));">
              <h3 class="font-semibold text-sm flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                构建日志
                <span v-if="building" class="badge badge-blue">运行中</span>
              </h3>
              <button @click="clearLogs" class="btn btn-sm btn-secondary">清空日志</button>
            </div>
            <div ref="logContainer" class="log-box flex-1 overflow-auto p-4 rounded-none rounded-b-xl">
              <div v-for="(log, i) in buildLogs" :key="i" :class="getLogClass(log)">{{ log }}</div>
              <div v-if="!buildLogs.length" class="text-gray-500 flex items-center justify-center h-full">
                <div class="text-center">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <p>点击"开始构建"执行打包</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateOutputSection(): string {
  return `
        <!-- 产物分析 -->
        <div v-show="activeTab === 'output'" class="flex flex-col gap-5 fade-in h-full">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-5 gap-4 flex-shrink-0">
            <div class="card p-4 text-center"><div class="text-2xl font-bold" style="color: rgb(var(--primary));">{{ outputs.length }}</div><div class="text-xs" style="color: rgb(var(--muted));">输出目录</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-green-600">{{ totalFiles }}</div><div class="text-xs" style="color: rgb(var(--muted));">文件总数</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-purple-600">{{ formatSize(totalSize) }}</div><div class="text-xs" style="color: rgb(var(--muted));">原始大小</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-blue-600">{{ formatSize(Math.round(totalSize * 0.35)) }}</div><div class="text-xs" style="color: rgb(var(--muted));">Gzip预估</div></div>
            <div class="card p-4 text-center"><div class="text-2xl font-bold text-orange-600">{{ jsFileCount }}</div><div class="text-xs" style="color: rgb(var(--muted));">JS文件</div></div>
          </div>

          <div class="grid grid-cols-3 gap-5 flex-shrink-0">
            <!-- 文件大小分布柱状图 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                目录大小分布
              </h3>
              <div ref="dirSizeChart" class="h-[180px]"></div>
            </div>
            
            <!-- 文件类型饼图 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
                文件类型分布
              </h3>
              <div ref="outputTypeChart" class="h-[180px]"></div>
            </div>

            <!-- Gzip 压缩对比 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                压缩效果
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm" style="color: rgb(var(--muted));">原始大小</span>
                  <span class="font-bold">{{ formatSize(totalSize) }}</span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" style="background: rgb(var(--border));">
                  <div class="h-full rounded-full bg-blue-500" style="width: 100%;"></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm" style="color: rgb(var(--muted));">Gzip (预估)</span>
                  <span class="font-bold text-green-600">{{ formatSize(Math.round(totalSize * 0.35)) }}</span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" style="background: rgb(var(--border));">
                  <div class="h-full rounded-full bg-green-500" style="width: 35%;"></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm" style="color: rgb(var(--muted));">Brotli (预估)</span>
                  <span class="font-bold text-purple-600">{{ formatSize(Math.round(totalSize * 0.28)) }}</span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" style="background: rgb(var(--border));">
                  <div class="h-full rounded-full bg-purple-500" style="width: 28%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文件列表 -->
          <div class="card flex-1 flex flex-col overflow-hidden">
            <div class="card-header">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                产物文件详情
              </span>
              <button @click="refreshOutputs" class="btn btn-sm btn-secondary">刷新</button>
            </div>
            <div class="card-body flex-1 overflow-auto p-0">
              <div v-if="outputs.length" class="divide-y" style="divide-color: rgb(var(--border));">
                <div v-for="out in outputs" :key="out.dir">
                  <div @click="toggleDir(out.dir)" class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 transition" :class="expandedDirs[out.dir] ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                      <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                      <span class="font-medium text-sm">{{ out.dir }}/</span>
                      <span class="badge badge-blue">{{ out.files.length }} 文件</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-24 h-1.5 rounded-full overflow-hidden" style="background: rgb(var(--border));">
                        <div class="h-full rounded-full bg-blue-500" :style="{ width: (out.totalSize / totalSize * 100) + '%' }"></div>
                      </div>
                      <span class="text-sm font-medium w-20 text-right">{{ formatSize(out.totalSize) }}</span>
                    </div>
                  </div>
                  <div v-show="expandedDirs[out.dir]" class="border-t" style="border-color: rgb(var(--border));">
                    <div v-for="f in out.files" :key="f.name" class="flex justify-between items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" :class="getFileTypeColor(f.type)">{{ f.type.slice(0,2).toUpperCase() }}</span>
                        <span>{{ f.name }}</span>
                      </div>
                      <span style="color: rgb(var(--muted));">{{ formatSize(f.size) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!outputs.length" class="text-center py-8" style="color: rgb(var(--muted));">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                <p>暂无产物，请先执行构建</p>
              </div>
            </div>
          </div>
        </div>`;
}

function generateConfigSection(): string {
  return `
        <!-- 配置 -->
        <div v-show="activeTab === 'config'" class="space-y-5 fade-in">
          <!-- 配置Tab切换 -->
          <div class="flex justify-between items-center">
            <div class="tab-group">
              <button v-for="t in configTabs" :key="t.id" @click="configTab = t.id" class="tab-btn" :class="{ active: configTab === t.id }">{{ t.name }}</button>
            </div>
            <div class="flex gap-2">
              <button @click="resetConfig" class="btn btn-secondary btn-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                重置
              </button>
              <button @click="saveConfig" class="btn btn-primary btn-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                保存配置
              </button>
            </div>
          </div>

          <!-- 基础配置 -->
          <div v-show="configTab === 'basic'" class="grid grid-cols-3 gap-5">
            <div class="col-span-2 card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                  基础设置
                </span>
              </div>
              <div class="card-body">
                <div class="form-grid form-grid-2">
                  <div>
                    <label class="label">入口文件</label>
                    <input v-model="editConfig.input" class="input" placeholder="src/index.ts">
                    <p class="help-text">支持 glob 模式，如 src/*.ts</p>
                  </div>
                  <div>
                    <label class="label">输出目录</label>
                    <input v-model="editConfig.outDir" class="input" placeholder="dist">
                  </div>
                  <div>
                    <label class="label">打包引擎</label>
                    <select v-model="editConfig.bundler" class="input select">
                      <option value="rollup">Rollup (推荐库)</option>
                      <option value="esbuild">esbuild (极速)</option>
                      <option value="vite">Vite (现代)</option>
                    </select>
                  </div>
                  <div>
                    <label class="label">构建目标</label>
                    <select v-model="editConfig.target" class="input select">
                      <option value="es2020">ES2020 (推荐)</option>
                      <option value="es2021">ES2021</option>
                      <option value="es2022">ES2022</option>
                      <option value="esnext">ESNext</option>
                      <option value="es2019">ES2019</option>
                      <option value="es2018">ES2018</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  构建选项
                </span>
              </div>
              <div class="card-body space-y-3">
                <label class="checkbox-item" :class="{ active: editConfig.dts }">
                  <input type="checkbox" v-model="editConfig.dts" class="rounded">
                  <div><div class="font-medium text-sm">类型声明</div><div class="text-xs" style="color: rgb(var(--muted));">生成 .d.ts 文件</div></div>
                </label>
                <label class="checkbox-item" :class="{ active: editConfig.sourcemap }">
                  <input type="checkbox" v-model="editConfig.sourcemap" class="rounded">
                  <div><div class="font-medium text-sm">SourceMap</div><div class="text-xs" style="color: rgb(var(--muted));">便于调试</div></div>
                </label>
                <label class="checkbox-item" :class="{ active: editConfig.minify }">
                  <input type="checkbox" v-model="editConfig.minify" class="rounded">
                  <div><div class="font-medium text-sm">代码压缩</div><div class="text-xs" style="color: rgb(var(--muted));">减小体积</div></div>
                </label>
                <label class="checkbox-item" :class="{ active: editConfig.treeshake }">
                  <input type="checkbox" v-model="editConfig.treeshake" class="rounded">
                  <div><div class="font-medium text-sm">Tree Shaking</div><div class="text-xs" style="color: rgb(var(--muted));">移除未使用代码</div></div>
                </label>
              </div>
            </div>
          </div>

          <!-- 输出格式配置 -->
          <div v-show="configTab === 'output'" class="space-y-5">
            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
                  输出格式
                </span>
                <span class="text-xs" style="color: rgb(var(--muted));">选择需要生成的模块格式</span>
              </div>
              <div class="card-body">
                <div class="grid grid-cols-4 gap-4">
                  <label v-for="fmt in formatOptions" :key="fmt.id" class="card p-4 cursor-pointer transition" :class="editConfig.formats?.includes(fmt.id) ? 'border-2' : ''" :style="editConfig.formats?.includes(fmt.id) ? 'border-color: rgb(var(--primary)); background: rgb(var(--primary) / 0.03);' : ''">
                    <div class="flex items-start gap-3">
                      <input type="checkbox" :value="fmt.id" v-model="editConfig.formats" class="rounded mt-1">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-bold font-mono">{{ fmt.id.toUpperCase() }}</span>
                          <span v-if="fmt.recommended" class="badge badge-green">推荐</span>
                        </div>
                        <p class="text-xs" style="color: rgb(var(--muted));">{{ fmt.desc }}</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- UMD/IIFE 特殊配置 -->
            <div v-if="editConfig.formats?.includes('umd') || editConfig.formats?.includes('iife')" class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                  UMD/IIFE 配置
                </span>
              </div>
              <div class="card-body">
                <div class="form-grid form-grid-2">
                  <div>
                    <label class="label">全局变量名</label>
                    <input v-model="editConfig.globalName" class="input" placeholder="MyLibrary">
                    <p class="help-text">浏览器环境下挂载到 window 的变量名</p>
                  </div>
                  <div>
                    <label class="label">全局依赖映射</label>
                    <input v-model="editConfig.globals" class="input" placeholder="vue: Vue, react: React">
                    <p class="help-text">外部依赖的全局变量名映射</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级配置 -->
          <div v-show="configTab === 'advanced'" class="grid grid-cols-2 gap-5">
            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                  外部依赖
                </span>
              </div>
              <div class="card-body">
                <label class="label">排除的依赖包</label>
                <input v-model="externalStr" class="input" placeholder="vue, react, lodash">
                <p class="help-text">这些包不会被打包进产物，需要用户自行安装</p>
                <div class="mt-4">
                  <div class="text-xs font-medium mb-2" style="color: rgb(var(--muted));">常用外部化依赖</div>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="dep in ['vue','react','react-dom','lodash','axios']" :key="dep" @click="addExternal(dep)" class="btn btn-xs btn-secondary font-mono">+ {{ dep }}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  TypeScript 配置
                </span>
              </div>
              <div class="card-body space-y-4">
                <div>
                  <label class="label">tsconfig 路径</label>
                  <input v-model="editConfig.tsconfig" class="input" placeholder="tsconfig.json">
                </div>
                <label class="checkbox-item" :class="{ active: editConfig.declaration }">
                  <input type="checkbox" v-model="editConfig.declaration" class="rounded">
                  <div><div class="font-medium text-sm">生成声明文件</div><div class="text-xs" style="color: rgb(var(--muted));">.d.ts 类型定义</div></div>
                </label>
                <label class="checkbox-item" :class="{ active: editConfig.declarationMap }">
                  <input type="checkbox" v-model="editConfig.declarationMap" class="rounded">
                  <div><div class="font-medium text-sm">声明文件 SourceMap</div><div class="text-xs" style="color: rgb(var(--muted));">便于跳转到源码</div></div>
                </label>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  资源处理
                </span>
              </div>
              <div class="card-body space-y-4">
                <label class="checkbox-item" :class="{ active: editConfig.css }">
                  <input type="checkbox" v-model="editConfig.css" class="rounded">
                  <div><div class="font-medium text-sm">CSS 处理</div><div class="text-xs" style="color: rgb(var(--muted));">支持 CSS/SCSS/LESS</div></div>
                </label>
                <label class="checkbox-item" :class="{ active: editConfig.json }">
                  <input type="checkbox" v-model="editConfig.json" class="rounded">
                  <div><div class="font-medium text-sm">JSON 导入</div><div class="text-xs" style="color: rgb(var(--muted));">支持 import JSON 文件</div></div>
                </label>
                <label class="checkbox-item" :class="{ active: editConfig.alias }">
                  <input type="checkbox" v-model="editConfig.alias" class="rounded">
                  <div><div class="font-medium text-sm">路径别名</div><div class="text-xs" style="color: rgb(var(--muted));">@ -> src/</div></div>
                </label>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  环境变量
                </span>
              </div>
              <div class="card-body">
                <label class="label">Define 替换</label>
                <textarea v-model="editConfig.define" class="input" rows="3" placeholder="__DEV__: true&#10;__VERSION__: '1.0.0'"></textarea>
                <p class="help-text">编译时替换的全局常量</p>
              </div>
            </div>
          </div>

          <!-- 配置预览 -->
          <div v-show="configTab === 'preview'" class="card">
            <div class="card-header">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                配置文件预览
              </span>
              <button @click="copyConfig" class="btn btn-sm btn-secondary">复制配置</button>
            </div>
            <div class="card-body">
              <pre class="log-box p-4 overflow-auto text-sm" style="max-height: 400px;">{{ configPreview }}</pre>
            </div>
          </div>
        </div>`;
}

function generatePublishSection(): string {
  return `
        <!-- 发布 -->
        <div v-show="activeTab === 'publish'" class="flex gap-5 fade-in" style="height: calc(100vh - 140px);">
          <!-- 左侧：发布配置和检查 -->
          <div class="w-80 flex-shrink-0 flex flex-col gap-4">
            <div class="card">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  发布配置
                </span>
              </div>
              <div class="card-body space-y-3">
                <div>
                  <label class="label label-muted">NPM源</label>
                  <select v-model="publishOptions.registry" class="input input-sm select">
                    <option value="">默认 (npm)</option>
                    <option v-for="r in registries" :key="r.url" :value="r.url">{{ r.name }}</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="label label-muted">标签</label>
                    <select v-model="publishOptions.tag" class="input input-sm select">
                      <option value="latest">latest</option>
                      <option value="next">next</option>
                      <option value="beta">beta</option>
                      <option value="alpha">alpha</option>
                    </select>
                  </div>
                  <div>
                    <label class="label label-muted">访问级别</label>
                    <select v-model="publishOptions.access" class="input input-sm select">
                      <option value="public">公开</option>
                      <option value="restricted">私有</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="label label-muted">OTP验证码</label>
                  <input v-model="publishOptions.otp" class="input input-sm" placeholder="2FA 验证码（可选）">
                </div>
                <label class="checkbox-item" :class="{ active: publishOptions.dryRun }">
                  <input type="checkbox" v-model="publishOptions.dryRun" class="rounded">
                  <div><span class="font-medium text-sm">模拟发布</span><span class="text-xs ml-2" style="color: rgb(var(--muted));">不实际发布</span></div>
                </label>
                <div class="flex gap-2 pt-2">
                  <button @click="runPublishChecks" class="btn btn-secondary flex-1">检查</button>
                  <button @click="doPublish" :disabled="publishing" class="btn btn-primary flex-1">
                    <svg v-if="publishing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"/><path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    {{ publishing ? '发布中' : '发布' }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card flex-1 overflow-hidden flex flex-col">
              <div class="card-header">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  检查结果
                </span>
              </div>
              <div class="card-body flex-1 overflow-auto space-y-2">
                <div v-for="c in publishChecks" :key="c.name" class="flex items-center gap-2 p-2 rounded-lg text-sm" style="background: rgb(var(--bg));">
                  <span class="w-2 h-2 rounded-full flex-shrink-0" :class="c.status==='pass' ? 'bg-green-500' : c.status==='fail' ? 'bg-red-500' : 'bg-yellow-500'"></span>
                  <span class="flex-1">{{ c.name }}</span>
                  <span class="text-xs" style="color: rgb(var(--muted));">{{ c.message }}</span>
                </div>
                <div v-if="!publishChecks.length" class="text-center py-8" style="color: rgb(var(--muted));">
                  <svg class="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p class="text-sm">点击"检查"开始</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧：发布日志（铺满剩余空间） -->
          <div class="flex-1 card flex flex-col overflow-hidden">
            <div class="flex justify-between items-center px-4 py-3 border-b" style="border-color: rgb(var(--border));">
              <h3 class="font-semibold text-sm flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                发布日志
                <span v-if="publishing" class="badge badge-blue">运行中</span>
              </h3>
              <button @click="publishLogs=[]" class="btn btn-sm btn-ghost">清空</button>
            </div>
            <div class="log-box flex-1 overflow-auto p-4 rounded-none rounded-b-xl">
              <div v-for="(log, i) in publishLogs" :key="i" :class="getLogClass(log)">{{ log }}</div>
              <div v-if="!publishLogs.length" class="flex items-center justify-center h-full" style="color: rgb(var(--muted));">
                <div class="text-center">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <p>发布日志将在此显示</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateRegistrySection(): string {
  return `
        <!-- NPM源 -->
        <div v-show="activeTab === 'registry'" class="space-y-5 fade-in">
          <div class="card">
            <div class="card-header">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>
                NPM 源管理
              </span>
              <button @click="showAddRegistry=true" class="btn btn-primary btn-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                添加源
              </button>
            </div>
            <div class="card-body">
              <div class="space-y-3">
                <div v-for="r in registries" :key="r.url" class="flex justify-between items-center p-4 rounded-lg border transition hover:shadow-sm" style="border-color: rgb(var(--border));">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ background: r.isDefault ? 'rgb(var(--primary) / 0.1)' : 'rgb(var(--bg))' }">
                      <svg class="w-5 h-5" :style="{ color: r.isDefault ? 'rgb(var(--primary))' : 'rgb(var(--muted))' }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ r.name }}</span>
                        <span v-if="r.isDefault" class="badge badge-blue">默认</span>
                        <span v-if="r.loggedIn" class="badge badge-green">{{ r.username || '已登录' }}</span>
                      </div>
                      <div class="text-xs font-mono mt-1" style="color: rgb(var(--muted));">{{ r.url }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="loginRegistry(r)" class="btn btn-sm" :class="r.loggedIn ? 'btn-ghost' : 'btn-secondary'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                      {{ r.loggedIn ? '切换账号' : '登录' }}
                    </button>
                    <button @click="editRegistry(r)" class="btn btn-sm btn-ghost">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button v-if="!r.isDefault" @click="removeRegistry(r)" class="btn btn-sm btn-ghost text-red-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
                <div v-if="!registries.length" class="text-center py-12" style="color: rgb(var(--muted));">
                  <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>
                  <p>暂无 NPM 源，点击添加</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 登录弹窗 -->
          <div v-if="selectedRegistry" class="modal-overlay" @click.self="selectedRegistry=null">
            <div class="modal">
              <div class="modal-header">登录到 {{ selectedRegistry.name }}</div>
              <div class="modal-body space-y-4">
                <div class="p-3 rounded-lg" style="background: rgb(var(--bg));">
                  <div class="text-xs font-mono" style="color: rgb(var(--muted));">{{ selectedRegistry.url }}</div>
                </div>
                <div>
                  <label class="label">用户名</label>
                  <input v-model="loginForm.username" class="input" placeholder="npm 用户名">
                </div>
                <div>
                  <label class="label">密码</label>
                  <input v-model="loginForm.password" type="password" class="input" placeholder="密码">
                </div>
                <div>
                  <label class="label">邮箱</label>
                  <input v-model="loginForm.email" class="input" placeholder="邮箱地址">
                </div>
              </div>
              <div class="modal-footer">
                <button @click="selectedRegistry=null" class="btn btn-secondary">取消</button>
                <button @click="doLogin" class="btn btn-primary">登录</button>
              </div>
            </div>
          </div>
          
          <!-- 添加源弹窗 -->
          <div v-if="showAddRegistry" class="modal-overlay" @click.self="showAddRegistry=false">
            <div class="modal">
              <div class="modal-header">添加 NPM 源</div>
              <div class="modal-body space-y-4">
                <div>
                  <label class="label">源名称</label>
                  <input v-model="newRegistry.name" class="input" placeholder="例如：私有源、公司源">
                </div>
                <div>
                  <label class="label">源地址</label>
                  <input v-model="newRegistry.url" class="input" placeholder="https://registry.example.com">
                </div>
                <div>
                  <label class="label">Token（可选）</label>
                  <input v-model="newRegistry.token" type="password" class="input" placeholder="访问令牌">
                  <p class="help-text">如果源需要认证，可以填写 Token</p>
                </div>
              </div>
              <div class="modal-footer">
                <button @click="showAddRegistry=false" class="btn btn-secondary">取消</button>
                <button @click="addRegistry" class="btn btn-primary">添加</button>
              </div>
            </div>
          </div>
        </div>`;
}

function generateTagsSection(): string {
  return `
        <!-- 标签管理 -->
        <div v-show="activeTab === 'tags'" class="space-y-5 fade-in">
          <!-- 上部：添加标签 -->
          <div class="card">
            <div class="card-header">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                添加 Dist Tag
              </span>
              <button @click="loadTags" class="btn btn-sm btn-secondary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                刷新
              </button>
            </div>
            <div class="card-body">
              <div class="flex gap-4 items-end">
                <div class="flex-1">
                  <label class="label label-muted">标签名称</label>
                  <input v-model="newTagName" class="input input-sm" placeholder="例如: beta, next, canary">
                </div>
                <div class="flex-1">
                  <label class="label label-muted">版本号</label>
                  <input v-model="newTagVersion" class="input input-sm" placeholder="例如: 1.0.0-beta.1">
                </div>
                <button @click="addTag" class="btn btn-primary">添加</button>
              </div>
              <div class="flex gap-2 mt-3 text-xs" style="color: rgb(var(--muted));">
                <span class="badge badge-green">latest</span><span>默认</span>
                <span class="badge badge-blue ml-2">next</span><span>预览</span>
                <span class="badge badge-yellow ml-2">beta</span><span>测试</span>
                <span class="badge badge-purple ml-2">alpha</span><span>早期</span>
              </div>
            </div>
          </div>
          
          <!-- 下部：标签列表 -->
          <div class="card flex-1 flex flex-col overflow-hidden">
            <div class="card-header">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                当前标签列表
              </span>
              <span class="badge badge-gray">{{ distTags.length }} 个</span>
            </div>
            <div class="card-body flex-1 overflow-auto">
              <div class="grid grid-cols-3 gap-3">
                <div v-for="tag in distTags" :key="tag.name" class="flex justify-between items-center p-3 rounded-lg border" style="border-color: rgb(var(--border));">
                  <div class="flex items-center gap-3">
                    <span class="badge" :class="tag.name === 'latest' ? 'badge-green' : tag.name === 'next' ? 'badge-blue' : tag.name === 'beta' ? 'badge-yellow' : 'badge-purple'">{{ tag.name }}</span>
                    <span class="font-mono text-sm">{{ tag.version }}</span>
                  </div>
                  <button v-if="tag.name !== 'latest'" @click="removeTag(tag.name)" class="text-red-500 hover:text-red-600 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <div v-if="!distTags.length" class="flex items-center justify-center h-full" style="color: rgb(var(--muted));">
                <div class="text-center">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                  <p>暂无标签数据</p>
                  <p class="text-xs mt-1">包未发布或网络问题</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
}

function generateDepsSection(): string {
  return `
        <!-- 依赖分析 -->
        <div v-show="activeTab === 'deps'" class="space-y-5 fade-in">
          <div class="grid grid-cols-4 gap-4">
            <div class="card p-4 text-center">
              <div class="text-2xl font-bold" style="color: rgb(var(--primary));">{{ dependencies.filter(d => d.type === 'prod').length }}</div>
              <div class="text-xs" style="color: rgb(var(--muted));">生产依赖</div>
            </div>
            <div class="card p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ dependencies.filter(d => d.type === 'dev').length }}</div>
              <div class="text-xs" style="color: rgb(var(--muted));">开发依赖</div>
            </div>
            <div class="card p-4 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ dependencies.filter(d => d.type === 'peer').length }}</div>
              <div class="text-xs" style="color: rgb(var(--muted));">Peer依赖</div>
            </div>
            <div class="card p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ dependencies.filter(d => d.outdated).length }}</div>
              <div class="text-xs" style="color: rgb(var(--muted));">可更新</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <!-- 生产依赖 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" style="color: rgb(var(--primary));" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                生产依赖 (dependencies)
              </h3>
              <div class="space-y-2 max-h-[280px] overflow-auto">
                <div v-for="dep in dependencies.filter(d => d.type === 'prod')" :key="dep.name" class="flex justify-between items-center p-2 rounded-lg text-sm" style="background: rgb(var(--bg));">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ dep.name }}</span>
                    <span v-if="dep.outdated" class="badge badge-yellow">可更新</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs" style="color: rgb(var(--muted));">{{ dep.version }}</span>
                    <span v-if="dep.latest && dep.latest !== dep.version" class="text-xs text-green-600">→ {{ dep.latest }}</span>
                  </div>
                </div>
                <div v-if="!dependencies.filter(d => d.type === 'prod').length" class="text-center py-4 text-sm" style="color: rgb(var(--muted));">无生产依赖</div>
              </div>
            </div>

            <!-- 开发依赖 -->
            <div class="card p-5">
              <h3 class="font-semibold mb-4 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                开发依赖 (devDependencies)
              </h3>
              <div class="space-y-2 max-h-[280px] overflow-auto">
                <div v-for="dep in dependencies.filter(d => d.type === 'dev')" :key="dep.name" class="flex justify-between items-center p-2 rounded-lg text-sm" style="background: rgb(var(--bg));">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ dep.name }}</span>
                    <span v-if="dep.outdated" class="badge badge-yellow">可更新</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs" style="color: rgb(var(--muted));">{{ dep.version }}</span>
                    <span v-if="dep.latest && dep.latest !== dep.version" class="text-xs text-green-600">→ {{ dep.latest }}</span>
                  </div>
                </div>
                <div v-if="!dependencies.filter(d => d.type === 'dev').length" class="text-center py-4 text-sm" style="color: rgb(var(--muted));">无开发依赖</div>
              </div>
            </div>
          </div>

          <!-- 依赖建议 -->
          <div class="card p-5">
            <h3 class="font-semibold mb-4 text-sm flex items-center gap-2">
              <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              优化建议
            </h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="p-4 rounded-lg" style="background: rgb(var(--bg));">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span class="font-medium text-sm">外部化建议</span>
                </div>
                <p class="text-xs" style="color: rgb(var(--muted));">将 vue, react 等框架设为 external 可减小打包体积</p>
              </div>
              <div class="p-4 rounded-lg" style="background: rgb(var(--bg));">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span class="font-medium text-sm">Tree Shaking</span>
                </div>
                <p class="text-xs" style="color: rgb(var(--muted));">启用 Tree Shaking 移除未使用代码</p>
              </div>
              <div class="p-4 rounded-lg" style="background: rgb(var(--bg));">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"/></svg>
                  <span class="font-medium text-sm">代码分割</span>
                </div>
                <p class="text-xs" style="color: rgb(var(--muted));">按需加载，减少首屏加载时间</p>
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
  build: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>',
  output: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  config: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>',
  publish: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
  registry: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>',
  tags: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
  version: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  deps: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>'
}

createApp({
  setup() {
    const darkMode = ref(localStorage.getItem('darkMode') === 'true')
    const currentTheme = ref(localStorage.getItem('theme') || 'blue')
    const connected = ref(false)
    const ws = ref(null)
    const activeTab = ref('overview')
    const building = ref(false)
    const publishing = ref(false)
    const logContainer = ref(null)
    const configTab = ref('basic')

    const themeColors = [
      { name: 'blue', color: '#3b82f6', label: '蓝色' },
      { name: 'purple', color: '#8b5cf6', label: '紫色' },
      { name: 'green', color: '#22c55e', label: '绿色' },
      { name: 'orange', color: '#f97316', label: '橙色' },
      { name: 'pink', color: '#ec4899', label: '粉色' },
      { name: 'teal', color: '#14b8a6', label: '青色' },
    ]
    
    const configTabs = [
      { id: 'basic', name: '基础配置' },
      { id: 'output', name: '输出格式' },
      { id: 'advanced', name: '高级选项' },
      { id: 'preview', name: '配置预览' },
    ]
    
    const formatOptions = [
      { id: 'esm', desc: 'ES Modules，现代浏览器和打包工具', recommended: true },
      { id: 'cjs', desc: 'CommonJS，Node.js 环境', recommended: true },
      { id: 'umd', desc: 'Universal，兼容多种环境' },
      { id: 'iife', desc: '立即执行函数，直接在浏览器使用' },
    ]

    const menuItems = [
      { id: 'overview', name: '概览', icon: ICONS.overview },
      { id: 'build', name: '构建', icon: ICONS.build },
      { id: 'output', name: '产物分析', icon: ICONS.output },
      { id: 'config', name: '配置', icon: ICONS.config },
      { id: 'publish', name: '发布', icon: ICONS.publish },
      { id: 'npm', name: 'NPM源', icon: ICONS.npm },
      { id: 'tags', name: '标签', icon: ICONS.tags },
      { id: 'deps', name: '依赖', icon: ICONS.deps },
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
    const dependencies = ref([])
    const distTags = ref([])
    const newTagName = ref('')
    const newTagVersion = ref('')
    
    // 图表引用
    const buildTrendChart = ref(null)
    const fileTypeChart = ref(null)
    const dirSizeChart = ref(null)
    const outputTypeChart = ref(null)
    let charts = {}

    const editConfig = reactive({ input: 'src/index.ts', outDir: 'dist', bundler: 'rollup', target: 'es2020', formats: ['esm', 'cjs'], dts: true, sourcemap: true, minify: false, treeshake: true, external: [], globalName: '', globals: '', tsconfig: '', declaration: false, declarationMap: false, css: false, json: true, alias: false, define: '' })
    const externalStr = computed({ get: () => editConfig.external.join(', '), set: v => editConfig.external = v.split(',').map(s => s.trim()).filter(Boolean) })
    const buildOptions = reactive({ mode: 'production', bundler: '', clean: true, formats: ['esm', 'cjs'], sourcemap: true, minify: false, versionBump: '' })
    const publishOptions = reactive({ registry: '', tag: 'latest', access: 'public', otp: '', dryRun: false })
    const versionRegistry = ref('')
    const publishedVersions = ref([])
    
    const getFileTypeColor = (type) => {
      const colors = { js: 'bg-yellow-100 text-yellow-700', mjs: 'bg-yellow-100 text-yellow-700', cjs: 'bg-orange-100 text-orange-700', ts: 'bg-blue-100 text-blue-700', dts: 'bg-blue-100 text-blue-700', css: 'bg-pink-100 text-pink-700', map: 'bg-gray-100 text-gray-600', json: 'bg-green-100 text-green-700' }
      return colors[type] || 'bg-gray-100 text-gray-600'
    }
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
        case 'init': 
          packageInfo.value = data.packageInfo; 
          configInfo.value = data.configInfo; 
          outputs.value = data.outputs || []; 
          dependencies.value = data.dependencies || [];
          buildHistory.value = data.buildHistory || [];
          if(data.configInfo?.config) Object.assign(editConfig, data.configInfo.config); 
          break
        case 'buildStart': building.value = true; break
        case 'buildEnd': building.value = false; if(data.history) buildHistory.value = data.history; send({ type: 'getOutputs' }); break
        case 'log': buildLogs.value.push(data.message); nextTick(() => { if(logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight }); break
        case 'outputs': outputs.value = data.outputs || []; break
        case 'publishStart': publishing.value = true; break
        case 'publishEnd': publishing.value = false; break
        case 'publishLog': publishLogs.value.push(data.message); break
        case 'publishChecks': publishChecks.value = data.checks || []; break
        case 'versionInfo': versionInfo.currentVersion = data.version || packageInfo.value?.version || '0.0.0'; versionInfo.versionHistory = data.history || []; break
        case 'registries': registries.value = data.registries || []; if(!versionRegistry.value && data.registries?.length) versionRegistry.value = data.registries[0].url; break
        case 'distTags': distTags.value = data.tags || []; break
        case 'publishedVersions': publishedVersions.value = data.versions || []; break
        case 'dependencies': dependencies.value = data.dependencies || []; break
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
    
    // 标签管理
    function loadTags() { send({ type: 'getDistTags' }) }
    function addTag() { if(newTagName.value && newTagVersion.value) { send({ type: 'addDistTag', tag: newTagName.value, version: newTagVersion.value }); newTagName.value = ''; newTagVersion.value = '' } }
    function removeTag(tag) { send({ type: 'removeDistTag', tag }) }
    
    // 依赖分析
    function loadDeps() { send({ type: 'getDependencies' }) }
    
    // 主题
    function setTheme(name) { 
      currentTheme.value = name
      localStorage.setItem('theme', name)
      const colorMap = {
        blue: { primary: '59 130 246', primaryDark: '37 99 235' },
        purple: { primary: '139 92 246', primaryDark: '124 58 237' },
        green: { primary: '34 197 94', primaryDark: '22 163 74' },
        orange: { primary: '249 115 22', primaryDark: '234 88 12' },
        pink: { primary: '236 72 153', primaryDark: '219 39 119' },
        teal: { primary: '20 184 166', primaryDark: '13 148 136' },
      }
      const colors = colorMap[name] || colorMap.blue
      document.documentElement.style.setProperty('--primary', colors.primary)
      document.documentElement.style.setProperty('--primary-dark', colors.primaryDark)
    }
    
    // 配置辅助
    function addExternal(dep) { if(!editConfig.external.includes(dep)) editConfig.external.push(dep) }
    function copyConfig() { navigator.clipboard.writeText(configPreview.value) }
    const configPreview = computed(() => JSON.stringify(editConfig, null, 2))
    
    // 版本管理
    function loadPublishedVersions() { send({ type: 'getPublishedVersions', registry: versionRegistry.value }) }
    function editRegistry(r) { Object.assign(newRegistry, { name: r.name, url: r.url, token: '' }); showAddRegistry.value = true }

    watch(darkMode, v => { localStorage.setItem('darkMode', v); document.documentElement.classList.toggle('dark', v); initCharts() }, { immediate: true })
    watch(activeTab, t => { 
      if(t === 'version') { send({ type: 'getVersionInfo' }); loadPublishedVersions() }
      if(t === 'registry') send({ type: 'getRegistries' })
      if(t === 'tags') loadTags()
      if(t === 'deps') loadDeps()
      if(t === 'overview') nextTick(initCharts)
      if(t === 'output') nextTick(initOutputCharts)
    })
    watch(versionRegistry, () => loadPublishedVersions())
    watch([outputs, buildHistory], () => nextTick(initCharts), { deep: true })
    
    let echartsInstances = {}
    function initCharts() {
      if (!buildTrendChart.value || typeof echarts === 'undefined') return
      const isDark = darkMode.value
      const textColor = isDark ? '#94a3b8' : '#64748b'
      const bgColor = isDark ? '#1e293b' : '#fff'
      
      // 构建趋势图
      if (echartsInstances.trend) echartsInstances.trend.dispose()
      echartsInstances.trend = echarts.init(buildTrendChart.value)
      const trendData = buildHistory.value.slice(-7).map(h => ({ time: new Date(h.timestamp).toLocaleDateString(), duration: h.duration, success: h.success }))
      echartsInstances.trend.setOption({
        backgroundColor: 'transparent',
        grid: { top: 10, right: 10, bottom: 20, left: 40 },
        xAxis: { type: 'category', data: trendData.map(d => d.time), axisLine: { lineStyle: { color: textColor } }, axisLabel: { color: textColor, fontSize: 10 } },
        yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } } },
        series: [{ type: 'bar', data: trendData.map(d => ({ value: d.duration, itemStyle: { color: d.success ? '#22c55e' : '#ef4444', borderRadius: [4, 4, 0, 0] } })), barWidth: '60%' }],
        tooltip: { trigger: 'axis', backgroundColor: bgColor, borderColor: isDark ? '#475569' : '#e2e8f0', textStyle: { color: textColor } }
      })
      
      // 文件类型分布图
      if (fileTypeChart.value) {
        if (echartsInstances.fileType) echartsInstances.fileType.dispose()
        echartsInstances.fileType = echarts.init(fileTypeChart.value)
        const typeData = {}
        outputs.value.forEach(o => o.files.forEach(f => { typeData[f.type] = (typeData[f.type] || 0) + 1 }))
        const pieData = Object.entries(typeData).map(([name, value]) => ({ name, value }))
        echartsInstances.fileType.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item', backgroundColor: bgColor, borderColor: isDark ? '#475569' : '#e2e8f0', textStyle: { color: textColor } },
          series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'], data: pieData, label: { color: textColor, fontSize: 11 }, itemStyle: { borderRadius: 4, borderColor: bgColor, borderWidth: 2 } }]
        })
      }
    }
    
    function initOutputCharts() {
      if (!dirSizeChart.value || typeof echarts === 'undefined') return
      const isDark = darkMode.value
      const textColor = isDark ? '#94a3b8' : '#64748b'
      const bgColor = isDark ? '#1e293b' : '#fff'
      
      // 目录大小分布
      if (echartsInstances.dirSize) echartsInstances.dirSize.dispose()
      echartsInstances.dirSize = echarts.init(dirSizeChart.value)
      echartsInstances.dirSize.setOption({
        backgroundColor: 'transparent',
        grid: { top: 10, right: 10, bottom: 20, left: 50 },
        xAxis: { type: 'category', data: outputs.value.map(o => o.dir), axisLine: { lineStyle: { color: textColor } }, axisLabel: { color: textColor, fontSize: 10 } },
        yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: textColor, fontSize: 10, formatter: v => (v/1024).toFixed(0) + 'KB' }, splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } } },
        series: [{ type: 'bar', data: outputs.value.map(o => ({ value: o.totalSize, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } })), barWidth: '50%' }],
        tooltip: { trigger: 'axis', backgroundColor: bgColor, borderColor: isDark ? '#475569' : '#e2e8f0', textStyle: { color: textColor } }
      })
      
      // 文件类型饼图
      if (outputTypeChart.value) {
        if (echartsInstances.outputType) echartsInstances.outputType.dispose()
        echartsInstances.outputType = echarts.init(outputTypeChart.value)
        const typeData = {}
        outputs.value.forEach(o => o.files.forEach(f => { typeData[f.type] = (typeData[f.type] || 0) + f.size }))
        const pieData = Object.entries(typeData).map(([name, value]) => ({ name, value }))
        echartsInstances.outputType.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item', backgroundColor: bgColor, borderColor: isDark ? '#475569' : '#e2e8f0', textStyle: { color: textColor }, formatter: p => p.name + ': ' + (p.value/1024).toFixed(1) + 'KB' },
          series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'], data: pieData, label: { color: textColor, fontSize: 11 }, itemStyle: { borderRadius: 4, borderColor: bgColor, borderWidth: 2 } }]
        })
      }
    }
    
    onMounted(() => { 
      connectWS()
      nextTick(initCharts)
      // 恢复保存的主题
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) setTheme(savedTheme)
    })

    return {
      darkMode, currentTheme, connected, activeTab, menuItems, currentMenu, building, publishing, logContainer, configTab,
      themeColors, configTabs, formatOptions,
      packageInfo, configInfo, outputs, buildHistory, buildLogs, publishLogs, publishChecks, expandedDirs, registries,
      editConfig, externalStr, buildOptions, publishOptions, versionInfo, customVersion, configPreview,
      showAddRegistry, newRegistry, selectedRegistry, loginForm,
      dependencies, distTags, newTagName, newTagVersion,
      versionRegistry, publishedVersions,
      buildTrendChart, fileTypeChart, dirSizeChart, outputTypeChart,
      totalFiles, totalSize, jsFileCount, lastBuildDuration, buildSuccessRate,
      formatSize, formatTime, getLogClass, toggleDir, getFileTypeColor,
      startBuild, quickBuild, clearLogs, refreshOutputs, saveConfig, resetConfig, refresh,
      runPublishChecks, doPublish, bumpVersion, setVersion,
      addRegistry, removeRegistry, loginRegistry, doLogin, editRegistry,
      loadTags, addTag, removeTag, loadDeps,
      setTheme, addExternal, copyConfig, loadPublishedVersions
    }
  }
}).mount('#app')`;
}
