/**
 * 3D Bundle 分析器
 * 
 * 提供交互式的 3D 可视化，展示包的依赖关系、大小分布和模块结构
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { Logger } from '../utils/logger'
import type { BuildResult } from '../types'

/**
 * 3D 节点数据
 */
export interface Node3D {
  id: string
  name: string
  path: string
  size: number
  type: 'file' | 'directory' | 'module' | 'chunk'
  position: { x: number; y: number; z: number }
  color: string
  opacity: number
  children?: Node3D[]
  dependencies?: string[]
  metadata?: any
}

/**
 * 3D 边数据
 */
export interface Edge3D {
  id: string
  source: string
  target: string
  type: 'import' | 'export' | 'dynamic' | 'chunk'
  strength: number
  color: string
  animated?: boolean
}

/**
 * 3D 场景配置
 */
export interface Scene3DConfig {
  width: number
  height: number
  depth: number
  camera: {
    position: { x: number; y: number; z: number }
    lookAt: { x: number; y: number; z: number }
    fov: number
  }
  controls: {
    enableRotate: boolean
    enableZoom: boolean
    enablePan: boolean
    autoRotate: boolean
    autoRotateSpeed: number
  }
  physics: {
    enabled: boolean
    gravity: number
    charge: number
    linkDistance: number
  }
}

/**
 * Bundle 分析配置
 */
export interface Bundle3DAnalyzerConfig {
  /** 输出目录 */
  outputDir?: string
  /** 生成 HTML */
  generateHTML?: boolean
  /** 包含源码映射 */
  includeSourceMap?: boolean
  /** 最小节点大小（字节） */
  minNodeSize?: number
  /** 最大深度 */
  maxDepth?: number
  /** 颜色方案 */
  colorScheme?: 'size' | 'type' | 'depth' | 'custom'
  /** 布局算法 */
  layout?: 'force' | 'tree' | 'radial' | 'grid'
  /** 交互功能 */
  interactive?: {
    hover?: boolean
    click?: boolean
    search?: boolean
    filter?: boolean
    export?: boolean
  }
}

/**
 * 分析结果
 */
export interface Bundle3DAnalysis {
  nodes: Node3D[]
  edges: Edge3D[]
  scene: Scene3DConfig
  stats: {
    totalSize: number
    nodeCount: number
    edgeCount: number
    maxDepth: number
    duplicates: Array<{
      module: string
      count: number
      size: number
    }>
    largestModules: Array<{
      name: string
      size: number
      percentage: number
    }>
  }
  metadata: {
    buildTime: number
    timestamp: string
    version: string
  }
}

/**
 * 3D Bundle 分析器
 */
export class Bundle3DAnalyzer {
  private config: Bundle3DAnalyzerConfig
  private logger: Logger
  private nodes: Map<string, Node3D> = new Map()
  private edges: Map<string, Edge3D> = new Map()
  private moduleMap: Map<string, any> = new Map()

  constructor(config: Bundle3DAnalyzerConfig = {}) {
    this.config = {
      outputDir: '.cache/bundle-3d',
      generateHTML: true,
      includeSourceMap: true,
      minNodeSize: 1000, // 1KB
      maxDepth: 10,
      colorScheme: 'size',
      layout: 'force',
      interactive: {
        hover: true,
        click: true,
        search: true,
        filter: true,
        export: true
      },
      ...config
    }

    this.logger = new Logger({ prefix: '[Bundle3DAnalyzer]' })
  }

  /**
   * 分析构建结果
   */
  async analyze(buildResult: BuildResult): Promise<Bundle3DAnalysis> {
    this.logger.info('开始 3D Bundle 分析...')

    // 重置状态
    this.reset()

    // 解析模块
    await this.parseModules(buildResult)

    // 构建节点树
    const rootNodes = this.buildNodeTree()

    // 计算布局
    this.calculateLayout(rootNodes)

    // 构建边
    this.buildEdges()

    // 生成场景配置
    const scene = this.generateSceneConfig()

    // 计算统计信息
    const stats = this.calculateStats()

    // 生成元数据
    const metadata = {
      buildTime: buildResult.performance?.buildTime || 0,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }

    const analysis: Bundle3DAnalysis = {
      nodes: rootNodes,
      edges: Array.from(this.edges.values()),
      scene,
      stats,
      metadata
    }

    // 生成输出
    if (this.config.generateHTML) {
      await this.generateVisualization(analysis)
    }

    this.logger.success('3D Bundle 分析完成')

    return analysis
  }

  /**
   * 解析模块
   */
  private async parseModules(buildResult: BuildResult): Promise<void> {
    // 这里简化处理，实际项目中需要解析真实的构建输出
    const mockModules = [
      { id: 'main.js', size: 50000, imports: ['utils.js', 'components.js'] },
      { id: 'utils.js', size: 10000, imports: [] },
      { id: 'components.js', size: 30000, imports: ['utils.js', 'styles.css'] },
      { id: 'styles.css', size: 5000, imports: [] },
      { id: 'vendor.js', size: 100000, imports: [] }
    ]

    for (const module of mockModules) {
      this.moduleMap.set(module.id, module)
    }
  }

  /**
   * 构建节点树
   */
  private buildNodeTree(): Node3D[] {
    const rootNodes: Node3D[] = []
    let nodeIndex = 0

    // 为每个模块创建节点
    for (const [moduleId, module] of this.moduleMap) {
      const node: Node3D = {
        id: `node_${nodeIndex++}`,
        name: moduleId,
        path: moduleId,
        size: module.size,
        type: this.getNodeType(moduleId),
        position: { x: 0, y: 0, z: 0 }, // 稍后计算
        color: this.getNodeColor(module),
        opacity: 0.8,
        dependencies: module.imports || []
      }

      this.nodes.set(moduleId, node)

      // 简化处理：所有节点都作为根节点
      rootNodes.push(node)
    }

    return rootNodes
  }

  /**
   * 计算布局
   */
  private calculateLayout(nodes: Node3D[]): void {
    switch (this.config.layout) {
      case 'force':
        this.calculateForceLayout(nodes)
        break
      case 'tree':
        this.calculateTreeLayout(nodes)
        break
      case 'radial':
        this.calculateRadialLayout(nodes)
        break
      case 'grid':
        this.calculateGridLayout(nodes)
        break
    }
  }

  /**
   * 力导向布局
   */
  private calculateForceLayout(nodes: Node3D[]): void {
    // 简化的力导向布局
    const centerX = 0
    const centerY = 0
    const centerZ = 0
    const radius = 100

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2
      const r = radius * Math.sqrt(node.size / 10000) // 基于大小的半径

      node.position = {
        x: centerX + r * Math.cos(angle),
        y: centerY + (Math.random() - 0.5) * 50,
        z: centerZ + r * Math.sin(angle)
      }
    })
  }

  /**
   * 树形布局
   */
  private calculateTreeLayout(nodes: Node3D[]): void {
    const levelHeight = 50
    const levelWidth = 100

    nodes.forEach((node, index) => {
      const level = Math.floor(index / 5) // 每层5个节点
      const positionInLevel = index % 5

      node.position = {
        x: (positionInLevel - 2) * levelWidth,
        y: -level * levelHeight,
        z: 0
      }
    })
  }

  /**
   * 径向布局
   */
  private calculateRadialLayout(nodes: Node3D[]): void {
    const layers = 3
    const nodesPerLayer = Math.ceil(nodes.length / layers)

    nodes.forEach((node, index) => {
      const layer = Math.floor(index / nodesPerLayer)
      const angleInLayer = (index % nodesPerLayer) / nodesPerLayer * Math.PI * 2
      const radius = (layer + 1) * 50

      node.position = {
        x: radius * Math.cos(angleInLayer),
        y: layer * 20,
        z: radius * Math.sin(angleInLayer)
      }
    })
  }

  /**
   * 网格布局
   */
  private calculateGridLayout(nodes: Node3D[]): void {
    const gridSize = Math.ceil(Math.sqrt(nodes.length))
    const spacing = 50

    nodes.forEach((node, index) => {
      const row = Math.floor(index / gridSize)
      const col = index % gridSize

      node.position = {
        x: (col - gridSize / 2) * spacing,
        y: 0,
        z: (row - gridSize / 2) * spacing
      }
    })
  }

  /**
   * 构建边
   */
  private buildEdges(): void {
    let edgeIndex = 0

    for (const [moduleId, node] of this.nodes) {
      if (node.dependencies) {
        for (const depId of node.dependencies) {
          const targetNode = this.nodes.get(depId)
          if (targetNode) {
            const edge: Edge3D = {
              id: `edge_${edgeIndex++}`,
              source: node.id,
              target: targetNode.id,
              type: 'import',
              strength: 1,
              color: '#666666',
              animated: false
            }

            this.edges.set(edge.id, edge)
          }
        }
      }
    }
  }

  /**
   * 生成场景配置
   */
  private generateSceneConfig(): Scene3DConfig {
    return {
      width: 1200,
      height: 800,
      depth: 800,
      camera: {
        position: { x: 200, y: 200, z: 200 },
        lookAt: { x: 0, y: 0, z: 0 },
        fov: 75
      },
      controls: {
        enableRotate: true,
        enableZoom: true,
        enablePan: true,
        autoRotate: true,
        autoRotateSpeed: 1
      },
      physics: {
        enabled: this.config.layout === 'force',
        gravity: -10,
        charge: -100,
        linkDistance: 50
      }
    }
  }

  /**
   * 计算统计信息
   */
  private calculateStats(): Bundle3DAnalysis['stats'] {
    const totalSize = Array.from(this.moduleMap.values())
      .reduce((sum, m) => sum + m.size, 0)

    // 查找重复模块
    const moduleCount = new Map<string, number>()
    for (const [id] of this.moduleMap) {
      const baseName = path.basename(id)
      moduleCount.set(baseName, (moduleCount.get(baseName) || 0) + 1)
    }

    const duplicates = Array.from(moduleCount.entries())
      .filter(([, count]) => count > 1)
      .map(([module, count]) => ({
        module,
        count,
        size: 0 // 简化处理
      }))

    // 最大的模块
    const largestModules = Array.from(this.moduleMap.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10)
      .map(([name, module]) => ({
        name,
        size: module.size,
        percentage: (module.size / totalSize) * 100
      }))

    return {
      totalSize,
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      maxDepth: this.config.maxDepth!,
      duplicates,
      largestModules
    }
  }

  /**
   * 获取节点类型
   */
  private getNodeType(moduleId: string): Node3D['type'] {
    if (moduleId.endsWith('.css')) return 'file'
    if (moduleId.includes('vendor')) return 'chunk'
    return 'module'
  }

  /**
   * 获取节点颜色
   */
  private getNodeColor(module: any): string {
    switch (this.config.colorScheme) {
      case 'size':
        // 基于大小的渐变色
        const sizeRatio = Math.min(module.size / 100000, 1)
        const hue = 120 - (sizeRatio * 120) // 从绿到红
        return `hsl(${hue}, 70%, 50%)`

      case 'type':
        // 基于文件类型
        if (module.id.endsWith('.css')) return '#3498db'
        if (module.id.endsWith('.js')) return '#e74c3c'
        if (module.id.endsWith('.json')) return '#f39c12'
        return '#95a5a6'

      case 'depth':
        // 基于深度
        return '#2ecc71'

      default:
        return '#3498db'
    }
  }

  /**
   * 生成可视化
   */
  private async generateVisualization(analysis: Bundle3DAnalysis): Promise<void> {
    const outputPath = path.join(this.config.outputDir!, 'bundle-3d.html')
    await fs.ensureDir(this.config.outputDir!)

    const html = this.generateHTML(analysis)
    await fs.writeFile(outputPath, html)

    // 保存 JSON 数据
    const dataPath = path.join(this.config.outputDir!, 'bundle-3d-data.json')
    await fs.writeJson(dataPath, analysis, { spaces: 2 })

    this.logger.info(`3D 可视化已生成: ${outputPath}`)
  }

  /**
   * 生成 HTML
   */
  private generateHTML(analysis: Bundle3DAnalysis): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>3D Bundle 分析器</title>
    <meta charset="utf-8">
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        #container {
            width: 100vw;
            height: 100vh;
        }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 100;
        }
        #controls {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 100;
        }
        #controls button {
            display: block;
            width: 100%;
            margin: 5px 0;
            padding: 5px 10px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        #controls button:hover {
            background: #2980b9;
        }
        #search {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
        }
        #search input {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            width: 300px;
        }
        #tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 3px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 200;
        }
        #stats {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 100;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
    <div id="container"></div>
    
    <div id="info">
        <h3>3D Bundle 分析器</h3>
        <p>总大小: ${this.formatSize(analysis.stats.totalSize)}</p>
        <p>模块数: ${analysis.stats.nodeCount}</p>
        <p>依赖数: ${analysis.stats.edgeCount}</p>
    </div>
    
    <div id="controls">
        <button onclick="toggleRotation()">切换自动旋转</button>
        <button onclick="resetCamera()">重置视角</button>
        <button onclick="togglePhysics()">切换物理模拟</button>
        <button onclick="exportData()">导出数据</button>
    </div>
    
    <div id="search">
        <input type="text" placeholder="搜索模块..." onkeyup="searchModule(this.value)">
    </div>
    
    <div id="tooltip"></div>
    
    <div id="stats">
        <h4>最大模块</h4>
        ${analysis.stats.largestModules.slice(0, 5).map(m =>
      `<div>${m.name}: ${this.formatSize(m.size)} (${m.percentage.toFixed(1)}%)</div>`
    ).join('')}
    </div>

    <script>
        // 数据
        const data = ${JSON.stringify(analysis)};
        
        // Three.js 场景设置
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        scene.fog = new THREE.Fog(0x0a0a0a, 100, 1000);
        
        // 相机
        const camera = new THREE.PerspectiveCamera(
            data.scene.camera.fov,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        camera.position.set(
            data.scene.camera.position.x,
            data.scene.camera.position.y,
            data.scene.camera.position.z
        );
        
        // 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('container').appendChild(renderer.domElement);
        
        // 控制器
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = data.scene.controls.autoRotate;
        controls.autoRotateSpeed = data.scene.controls.autoRotateSpeed;
        
        // 光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(100, 100, 50);
        scene.add(directionalLight);
        
        // 创建节点
        const nodeMap = new Map();
        const nodeMeshes = [];
        
        data.nodes.forEach(node => {
            const geometry = new THREE.SphereGeometry(
                Math.sqrt(node.size / 1000), // 基于大小的半径
                32,
                16
            );
            
            const material = new THREE.MeshPhongMaterial({
                color: node.color,
                transparent: true,
                opacity: node.opacity,
                emissive: node.color,
                emissiveIntensity: 0.2
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(node.position.x, node.position.y, node.position.z);
            mesh.userData = node;
            
            scene.add(mesh);
            nodeMap.set(node.id, mesh);
            nodeMeshes.push(mesh);
        });
        
        // 创建边
        const edgeGroup = new THREE.Group();
        
        data.edges.forEach(edge => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            
            if (sourceNode && targetNode) {
                const points = [
                    sourceNode.position,
                    targetNode.position
                ];
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: edge.color,
                    transparent: true,
                    opacity: 0.3
                });
                
                const line = new THREE.Line(geometry, material);
                edgeGroup.add(line);
            }
        });
        
        scene.add(edgeGroup);
        
        // 交互
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let selectedObject = null;
        
        function onMouseMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodeMeshes);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                const node = object.userData;
                
                // 显示提示
                const tooltip = document.getElementById('tooltip');
                tooltip.style.opacity = '1';
                tooltip.style.left = event.clientX + 10 + 'px';
                tooltip.style.top = event.clientY - 30 + 'px';
                tooltip.innerHTML = \`
                    <strong>\${node.name}</strong><br>
                    大小: \${formatSize(node.size)}<br>
                    类型: \${node.type}
                \`;
                
                // 高亮
                if (selectedObject !== object) {
                    if (selectedObject) {
                        selectedObject.material.emissiveIntensity = 0.2;
                    }
                    selectedObject = object;
                    object.material.emissiveIntensity = 0.5;
                }
            } else {
                document.getElementById('tooltip').style.opacity = '0';
                if (selectedObject) {
                    selectedObject.material.emissiveIntensity = 0.2;
                    selectedObject = null;
                }
            }
        }
        
        window.addEventListener('mousemove', onMouseMove);
        
        // 动画循环
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        
        animate();
        
        // 窗口调整
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 工具函数
        function formatSize(bytes) {
            const units = ['B', 'KB', 'MB', 'GB'];
            let size = bytes;
            let unitIndex = 0;
            
            while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
            }
            
            return size.toFixed(2) + ' ' + units[unitIndex];
        }
        
        // 控制函数
        function toggleRotation() {
            controls.autoRotate = !controls.autoRotate;
        }
        
        function resetCamera() {
            camera.position.set(
                data.scene.camera.position.x,
                data.scene.camera.position.y,
                data.scene.camera.position.z
            );
            controls.target.set(0, 0, 0);
            controls.update();
        }
        
        function togglePhysics() {
            // 简化处理
            alert('物理模拟功能开发中...');
        }
        
        function exportData() {
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bundle-3d-analysis.json';
            a.click();
        }
        
        function searchModule(query) {
            if (!query) {
                nodeMeshes.forEach(mesh => {
                    mesh.material.opacity = mesh.userData.opacity;
                });
                return;
            }
            
            nodeMeshes.forEach(mesh => {
                const node = mesh.userData;
                if (node.name.toLowerCase().includes(query.toLowerCase())) {
                    mesh.material.opacity = mesh.userData.opacity;
                } else {
                    mesh.material.opacity = 0.1;
                }
            });
        }
    </script>
</body>
</html>
    `
  }

  /**
   * 格式化大小
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.nodes.clear()
    this.edges.clear()
    this.moduleMap.clear()
  }
}

/**
 * 创建 3D Bundle 分析器
 */
export function createBundle3DAnalyzer(config?: Bundle3DAnalyzerConfig): Bundle3DAnalyzer {
  return new Bundle3DAnalyzer(config)
}



