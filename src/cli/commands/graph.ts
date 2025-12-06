/**
 * 依赖图可视化导出
 * 
 * 生成项目依赖关系图
 */

import { Command } from 'commander'
import { resolve, join, relative } from 'path'
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { exec } from 'child_process'
import { createCircularDependencyDetector } from '../../analyzers/CircularDependencyDetector'
import { logger } from '../../utils/logger'

// ========== HTML 报告生成 ==========

function generateDependencyGraphHTML(
  nodes: string[],
  edges: Array<{ source: string; target: string }>,
  circular: Array<{ cycle: string[] }>,
  projectName: string
): string {
  // 创建节点和边的 JSON
  const graphNodes = nodes.map((node, i) => ({
    id: node,
    label: node.split('/').slice(-2).join('/'),
    isCircular: circular.some(c => c.cycle.includes(node))
  }))

  const graphEdges = edges.map(e => ({
    source: e.source,
    target: e.target,
    isCircular: circular.some(c => 
      c.cycle.includes(e.source) && c.cycle.includes(e.target)
    )
  }))

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - 依赖关系图</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    .link { stroke: #999; stroke-opacity: 0.6; stroke-width: 1px; fill: none; }
    .link.circular { stroke: #ef4444; stroke-width: 2px; }
    .node { cursor: pointer; }
    .node circle { stroke: #fff; stroke-width: 2px; }
    .node.circular circle { stroke: #ef4444; stroke-width: 3px; }
    .node text { font-size: 10px; fill: #333; }
    .tooltip { position: absolute; background: #1f2937; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none; }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="fixed top-0 left-0 right-0 bg-white shadow-md z-10 p-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">🔗 依赖关系图</h1>
        <p class="text-gray-500 text-sm">${projectName}</p>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>正常 (${nodes.length - circular.reduce((s, c) => s + c.cycle.length - 1, 0)})</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          <span>循环依赖 (${circular.length})</span>
        </div>
        <button onclick="resetZoom()" class="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">重置缩放</button>
      </div>
    </div>
  </div>

  <div id="graph" class="w-full h-screen pt-16"></div>
  <div id="tooltip" class="tooltip hidden"></div>

  ${circular.length > 0 ? `
  <div class="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-sm max-h-64 overflow-auto">
    <h3 class="font-semibold text-red-600 mb-2">⚠️ 循环依赖</h3>
    <div class="space-y-2 text-xs">
      ${circular.map((c, i) => `
        <div class="p-2 bg-red-50 rounded">
          <div class="font-medium text-red-700">循环 ${i + 1}</div>
          <div class="text-red-600 mt-1">${c.cycle.slice(0, 4).join(' → ')}${c.cycle.length > 4 ? '...' : ''}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <script>
    const nodes = ${JSON.stringify(graphNodes)};
    const links = ${JSON.stringify(graphEdges)};

    const width = window.innerWidth;
    const height = window.innerHeight - 64;

    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // 缩放
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    window.resetZoom = () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    };

    // 力导向图
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // 箭头
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    svg.append('defs').append('marker')
      .attr('id', 'arrow-red')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ef4444');

    // 边
    const link = g.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', d => 'link' + (d.isCircular ? ' circular' : ''))
      .attr('marker-end', d => d.isCircular ? 'url(#arrow-red)' : 'url(#arrow)');

    // 节点
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', d => 'node' + (d.isCircular ? ' circular' : ''))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.isCircular ? '#fca5a5' : '#93c5fd');

    node.append('text')
      .attr('dx', 12)
      .attr('dy', 4)
      .text(d => d.label);

    // Tooltip
    const tooltip = d3.select('#tooltip');

    node.on('mouseover', (event, d) => {
      tooltip
        .html(d.id)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .classed('hidden', false);
    })
    .on('mouseout', () => tooltip.classed('hidden', true));

    simulation.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y;
      });

      node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  </script>
</body>
</html>`
}

// ========== 命令定义 ==========

export const graphCommand = new Command('graph')
  .description('生成依赖关系图')
  .option('-o, --output <file>', '输出文件', 'dependency-graph.html')
  .option('--dot <file>', '输出 DOT 格式')
  .option('--json <file>', '输出 JSON 格式')
  .option('--open', '生成后自动打开浏览器')
  .option('-d, --dir <dirs>', '扫描目录', 'src')
  .action((options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('🔗 生成依赖关系图')
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

    // 分析依赖
    console.log('📦 分析文件依赖...')
    const detector = createCircularDependencyDetector(projectPath, {
      include: options.dir.split(',').map((d: string) => d.trim())
    })
    const graph = detector.detect()

    console.log(`   文件数: ${graph.nodes.length}`)
    console.log(`   依赖数: ${graph.edges.length}`)
    console.log(`   循环依赖: ${graph.circular.length}`)
    console.log('')

    // 生成 HTML
    const html = generateDependencyGraphHTML(
      graph.nodes,
      graph.edges.map(e => ({ source: e.source, target: e.target })),
      graph.circular,
      projectName
    )
    const outputPath = resolve(projectPath, options.output)
    writeFileSync(outputPath, html)
    logger.success(`HTML 报告: ${options.output}`)

    // 输出 DOT
    if (options.dot) {
      const dot = detector.toDot()
      writeFileSync(resolve(projectPath, options.dot), dot)
      logger.success(`DOT 格式: ${options.dot}`)
      console.log('   可使用 Graphviz 渲染: dot -Tpng -o graph.png ' + options.dot)
    }

    // 输出 JSON
    if (options.json) {
      writeFileSync(resolve(projectPath, options.json), JSON.stringify(graph, null, 2))
      logger.success(`JSON 格式: ${options.json}`)
    }

    // 打开浏览器
    if (options.open) {
      console.log('')
      console.log('🌐 打开浏览器...')
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
      exec(`${cmd} ${outputPath}`)
    }

    console.log('')
  })

/**
 * 注册图可视化命令
 */
export function registerGraphCommand(program: Command): void {
  program.addCommand(graphCommand)
}
