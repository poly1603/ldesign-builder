/**
 * 依赖关系图可视化
 * 生成依赖关系的可视化 HTML
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { DependencyNode } from '../utils/incremental-build-manager'
import fs from 'fs-extra'
import path from 'path'

/**
 * 依赖图可视化器
 */
export class DependencyGraphVisualizer {
  /**
   * 生成可视化 HTML
   */
  async generateHTML(
    graph: Map<string, DependencyNode>,
    outputPath: string = 'dependency-graph.html'
  ): Promise<void> {
    const nodes = Array.from(graph.values())
    const links = this.extractLinks(nodes)

    const html = this.createVisualizationHTML(nodes, links)
    
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, html, 'utf-8')
  }

  /**
   * 提取链接关系
   */
  private extractLinks(nodes: DependencyNode[]): Array<{ source: string; target: string }> {
    const links: Array<{ source: string; target: string }> = []

    for (const node of nodes) {
      for (const dep of node.dependencies) {
        links.push({
          source: node.path,
          target: dep
        })
      }
    }

    return links
  }

  /**
   * 创建可视化 HTML
   */
  private createVisualizationHTML(nodes: DependencyNode[], links: Array<{ source: string; target: string }>): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>依赖关系图</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #graph { width: 100vw; height: 100vh; }
    .node { cursor: pointer; }
    .node circle { fill: #69b3a2; stroke: #fff; stroke-width: 2px; }
    .node.circular circle { fill: #ff6b6b; }
    .node text { font-size: 12px; fill: #333; }
    .link { stroke: #999; stroke-opacity: 0.6; stroke-width: 1.5px; }
    .link.circular { stroke: #ff6b6b; stroke-dasharray: 5,5; }
    .tooltip { position: absolute; padding: 10px; background: #333; color: #fff; border-radius: 4px; font-size: 12px; pointer-events: none; display: none; }
  </style>
</head>
<body>
  <div id="graph"></div>
  <div class="tooltip" id="tooltip"></div>

  <script>
    const nodes = ${JSON.stringify(nodes.map(n => ({
      id: n.path,
      name: path.basename(n.path),
      circular: n.circular,
      depth: n.depth,
      dependencies: n.dependencies.size,
      dependents: n.dependents.size
    })))};

    const links = ${JSON.stringify(links)};

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', d => 'node' + (d.circular ? ' circular' : ''))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', d => Math.max(5, Math.min(20, d.dependencies + d.dependents)));

    node.append('text')
      .text(d => d.name)
      .attr('x', 12)
      .attr('y', 3);

    node.on('mouseover', function(event, d) {
      const tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = \`
        <strong>\${d.name}</strong><br>
        深度: \${d.depth}<br>
        依赖: \${d.dependencies}<br>
        被依赖: \${d.dependents}
        \${d.circular ? '<br><span style="color: #ff6b6b">⚠️ 循环依赖</span>' : ''}
      \`;
      tooltip.style.display = 'block';
      tooltip.style.left = event.pageX + 10 + 'px';
      tooltip.style.top = event.pageY + 10 + 'px';
    })
    .on('mouseout', function() {
      document.getElementById('tooltip').style.display = 'none';
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.pageX;
      event.subject.fy = event.subject.y;
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
}

/**
 * 创建可视化器
 */
export function createDependencyGraphVisualizer(): DependencyGraphVisualizer {
  return new DependencyGraphVisualizer()
}

