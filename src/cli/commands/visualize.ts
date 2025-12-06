/**
 * Bundle 可视化报告生成器
 * 
 * 生成交互式 HTML 报告展示 bundle 组成
 */

import { Command } from 'commander'
import { resolve, join, extname, relative } from 'path'
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { logger } from '../../utils/logger'
import { exec } from 'child_process'

// ========== 类型定义 ==========

interface FileNode {
  name: string
  path: string
  size: number
  type: string
  children?: FileNode[]
}

interface BundleStats {
  totalSize: number
  files: FileNode[]
  byType: Record<string, { count: number; size: number }>
  timestamp: number
}

// ========== 数据收集 ==========

function collectBundleStats(projectPath: string): BundleStats {
  const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs', 'umd']
  const files: FileNode[] = []
  let totalSize = 0
  const byType: Record<string, { count: number; size: number }> = {}

  for (const dir of outputDirs) {
    const dirPath = resolve(projectPath, dir)
    if (!existsSync(dirPath)) continue

    const node = scanDirectory(dirPath, dir)
    if (node) {
      files.push(node)
      totalSize += node.size
      
      // 统计文件类型
      collectTypeStats(node, byType)
    }
  }

  return {
    totalSize,
    files,
    byType,
    timestamp: Date.now()
  }
}

function scanDirectory(dirPath: string, name: string): FileNode | null {
  if (!existsSync(dirPath)) return null

  const stat = statSync(dirPath)
  
  if (stat.isFile()) {
    const ext = extname(name).slice(1) || 'other'
    return {
      name,
      path: dirPath,
      size: stat.size,
      type: ext
    }
  }

  const children: FileNode[] = []
  let totalSize = 0

  try {
    const items = readdirSync(dirPath)
    for (const item of items) {
      const child = scanDirectory(join(dirPath, item), item)
      if (child) {
        children.push(child)
        totalSize += child.size
      }
    }
  } catch {}

  return {
    name,
    path: dirPath,
    size: totalSize,
    type: 'directory',
    children: children.sort((a, b) => b.size - a.size)
  }
}

function collectTypeStats(node: FileNode, stats: Record<string, { count: number; size: number }>): void {
  if (node.type !== 'directory') {
    if (!stats[node.type]) stats[node.type] = { count: 0, size: 0 }
    stats[node.type].count++
    stats[node.type].size += node.size
  }
  
  if (node.children) {
    for (const child of node.children) {
      collectTypeStats(child, stats)
    }
  }
}

// ========== HTML 报告生成 ==========

function generateHTMLReport(stats: BundleStats, projectName: string): string {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Bundle 分析报告</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .treemap-node {
      border: 1px solid rgba(255,255,255,0.3);
      transition: all 0.2s;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 4px;
    }
    .treemap-node:hover {
      filter: brightness(1.2);
      z-index: 10;
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="max-w-7xl mx-auto p-6">
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
      <h1 class="text-3xl font-bold mb-2">📦 Bundle 分析报告</h1>
      <p class="text-white/80">${projectName}</p>
      <p class="text-white/60 text-sm mt-2">生成时间: ${new Date(stats.timestamp).toLocaleString()}</p>
    </header>

    <!-- 概览卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <div class="text-3xl font-bold text-blue-600">${formatSize(stats.totalSize)}</div>
        <div class="text-gray-500 text-sm mt-1">总大小</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <div class="text-3xl font-bold text-green-600">${stats.files.length}</div>
        <div class="text-gray-500 text-sm mt-1">输出目录</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <div class="text-3xl font-bold text-purple-600">${Object.keys(stats.byType).length}</div>
        <div class="text-gray-500 text-sm mt-1">文件类型</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <div class="text-3xl font-bold text-orange-600">${Object.values(stats.byType).reduce((s, t) => s + t.count, 0)}</div>
        <div class="text-gray-500 text-sm mt-1">文件数量</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <!-- 类型分布饼图 -->
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <h2 class="text-lg font-semibold mb-4">📊 文件类型分布</h2>
        <canvas id="typeChart" height="200"></canvas>
      </div>

      <!-- 大小条形图 -->
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <h2 class="text-lg font-semibold mb-4">📈 各目录大小</h2>
        <canvas id="sizeChart" height="200"></canvas>
      </div>
    </div>

    <!-- Treemap -->
    <div class="bg-white rounded-xl p-6 shadow-lg mb-8">
      <h2 class="text-lg font-semibold mb-4">🗺️ 文件树图</h2>
      <div id="treemap" class="w-full h-96 relative rounded-lg overflow-hidden"></div>
    </div>

    <!-- 文件列表 -->
    <div class="bg-white rounded-xl p-6 shadow-lg">
      <h2 class="text-lg font-semibold mb-4">📁 文件详情</h2>
      <div class="space-y-2" id="fileList"></div>
    </div>
  </div>

  <script>
    const stats = ${JSON.stringify(stats)};
    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    // 颜色映射
    const colors = {
      js: '#f7df1e',
      mjs: '#f7df1e',
      cjs: '#f7df1e',
      ts: '#3178c6',
      css: '#264de4',
      json: '#5a9a6b',
      map: '#888888',
      'd.ts': '#3178c6',
      vue: '#42b883',
      other: '#999999',
      directory: '#6366f1'
    };

    // 类型分布饼图
    const typeLabels = Object.keys(stats.byType);
    const typeData = typeLabels.map(t => stats.byType[t].size);
    const typeColors = typeLabels.map(t => colors[t] || colors.other);

    new Chart(document.getElementById('typeChart'), {
      type: 'doughnut',
      data: {
        labels: typeLabels.map(t => '.' + t),
        datasets: [{
          data: typeData,
          backgroundColor: typeColors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: (ctx) => formatSize(ctx.raw) + ' (' + ((ctx.raw / stats.totalSize) * 100).toFixed(1) + '%)'
            }
          }
        }
      }
    });

    // 目录大小条形图
    const dirLabels = stats.files.map(f => f.name);
    const dirData = stats.files.map(f => f.size);

    new Chart(document.getElementById('sizeChart'), {
      type: 'bar',
      data: {
        labels: dirLabels,
        datasets: [{
          label: '大小',
          data: dirData,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatSize(ctx.raw)
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => formatSize(v)
            }
          }
        }
      }
    });

    // Treemap
    const treemapEl = document.getElementById('treemap');
    const totalSize = stats.totalSize;

    function renderTreemap(nodes, container, totalSize) {
      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;
      
      let x = 0;
      let y = 0;
      let currentRowHeight = 0;
      let currentRowWidth = 0;
      
      nodes.forEach(node => {
        const ratio = node.size / totalSize;
        const area = width * height * ratio;
        const nodeHeight = Math.max(30, Math.sqrt(area));
        const nodeWidth = area / nodeHeight;
        
        if (x + nodeWidth > width) {
          x = 0;
          y += currentRowHeight;
          currentRowHeight = 0;
        }
        
        const el = document.createElement('div');
        el.className = 'treemap-node absolute text-white text-xs';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = Math.min(nodeWidth, width - x) + 'px';
        el.style.height = nodeHeight + 'px';
        el.style.backgroundColor = colors[node.type] || colors.other;
        el.textContent = node.name + ' (' + formatSize(node.size) + ')';
        el.title = node.name + '\\n' + formatSize(node.size);
        
        container.appendChild(el);
        
        x += nodeWidth;
        currentRowHeight = Math.max(currentRowHeight, nodeHeight);
      });
    }

    // 收集所有文件
    const allFiles = [];
    function collectFiles(nodes) {
      nodes.forEach(node => {
        if (node.type !== 'directory') {
          allFiles.push(node);
        }
        if (node.children) collectFiles(node.children);
      });
    }
    collectFiles(stats.files);
    allFiles.sort((a, b) => b.size - a.size);
    
    setTimeout(() => {
      renderTreemap(allFiles.slice(0, 50), treemapEl, stats.totalSize);
    }, 100);

    // 文件列表
    const fileListEl = document.getElementById('fileList');
    allFiles.slice(0, 30).forEach((file, i) => {
      const percent = ((file.size / stats.totalSize) * 100).toFixed(1);
      const el = document.createElement('div');
      el.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
      el.innerHTML = \`
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center">\${i + 1}</span>
          <span class="font-mono text-sm">\${file.name}</span>
          <span class="px-2 py-0.5 text-xs rounded-full" style="background: \${colors[file.type] || colors.other}20; color: \${colors[file.type] || colors.other}">.\${file.type}</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full" style="width: \${percent}%"></div>
          </div>
          <span class="text-sm font-medium w-20 text-right">\${formatSize(file.size)}</span>
        </div>
      \`;
      fileListEl.appendChild(el);
    });

    if (allFiles.length > 30) {
      const more = document.createElement('div');
      more.className = 'text-center py-4 text-gray-500';
      more.textContent = \`还有 \${allFiles.length - 30} 个文件...\`;
      fileListEl.appendChild(more);
    }
  </script>
</body>
</html>`
}

// ========== 命令定义 ==========

export const visualizeCommand = new Command('visualize')
  .alias('viz')
  .description('生成 Bundle 可视化报告')
  .option('-o, --output <file>', '输出文件', 'bundle-report.html')
  .option('--open', '生成后自动打开浏览器')
  .option('--json', '同时输出 JSON 数据')
  .action((options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('📊 生成 Bundle 可视化报告')
    console.log('─'.repeat(50))
    console.log('')

    // 获取包名
    let projectName = 'Unknown Project'
    const pkgPath = resolve(projectPath, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        projectName = pkg.name || projectName
      } catch {}
    }

    // 收集数据
    console.log('📦 收集构建产物数据...')
    const stats = collectBundleStats(projectPath)

    if (stats.files.length === 0) {
      logger.error('未找到构建产物，请先运行 build')
      process.exit(1)
    }

    // 生成报告
    console.log('📝 生成 HTML 报告...')
    const html = generateHTMLReport(stats, projectName)
    const outputPath = resolve(projectPath, options.output)
    writeFileSync(outputPath, html)
    logger.success(`报告已生成: ${options.output}`)

    // 输出 JSON
    if (options.json) {
      const jsonPath = outputPath.replace('.html', '.json')
      writeFileSync(jsonPath, JSON.stringify(stats, null, 2))
      logger.success(`JSON 数据: ${jsonPath.replace(projectPath + '/', '')}`)
    }

    // 统计信息
    console.log('')
    console.log('📊 统计:')
    console.log(`   总大小: ${formatSize(stats.totalSize)}`)
    console.log(`   目录数: ${stats.files.length}`)
    console.log(`   文件数: ${Object.values(stats.byType).reduce((s, t) => s + t.count, 0)}`)

    // 打开浏览器
    if (options.open) {
      console.log('')
      console.log('🌐 打开浏览器...')
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
      exec(`${cmd} ${outputPath}`)
    }

    console.log('')
  })

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

/**
 * 注册可视化命令
 */
export function registerVisualizeCommand(program: Command): void {
  program.addCommand(visualizeCommand)
}
