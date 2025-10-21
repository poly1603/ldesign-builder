/**
 * 构建产物清单生成器
 *
 * 负责生成详细的构建产物清单，支持多种格式输出
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { Logger } from '../utils/logger';
export class BuildManifestGenerator {
    constructor(logger) {
        this.logger = logger || new Logger();
    }
    /**
     * 生成构建清单
     */
    async generateManifest(buildResult, config, outputDir) {
        this.logger.info('生成构建清单...');
        // 获取项目信息
        const projectInfo = await this.getProjectInfo();
        // 扫描输出文件
        const files = await this.scanOutputFiles(outputDir);
        // 生成统计信息
        const stats = this.generateStats(files);
        const manifest = {
            build: {
                id: buildResult.buildId || `build-${Date.now()}`,
                timestamp: buildResult.timestamp || Date.now(),
                formattedTime: new Date(buildResult.timestamp || Date.now()).toISOString(),
                duration: buildResult.duration || 0,
                formattedDuration: this.formatDuration(buildResult.duration || 0),
                bundler: buildResult.bundler || 'unknown',
                bundlerVersion: await this.getBundlerVersion(buildResult.bundler || 'unknown'),
                mode: buildResult.mode || 'production',
                success: buildResult.success
            },
            project: projectInfo,
            config: {
                input: (config.input ?? 'src/index.ts'),
                outputDir: config.output?.dir || 'dist',
                formats: Array.isArray(config.output?.format)
                    ? config.output.format
                    : config.output?.format ? [config.output.format] : ['esm'],
                sourcemap: Boolean(config.output?.sourcemap),
                minify: Boolean(config.minify),
                external: Array.isArray(config.external) ? config.external : []
            },
            files,
            stats
        };
        this.logger.success(`构建清单生成完成，包含 ${files.length} 个文件`);
        return manifest;
    }
    /**
     * 保存清单到文件
     */
    async saveManifest(manifest, outputDir, formats = ['json']) {
        for (const format of formats) {
            const content = this.formatManifest(manifest, format);
            const filename = `build-manifest.${format}`;
            const filepath = path.join(outputDir, filename);
            await fs.promises.writeFile(filepath, content, 'utf-8');
            this.logger.info(`清单已保存: ${filename}`);
        }
    }
    /**
     * 格式化清单内容
     */
    formatManifest(manifest, format) {
        switch (format) {
            case 'json':
                return JSON.stringify(manifest, null, 2);
            case 'markdown':
                return this.formatMarkdown(manifest);
            case 'html':
                return this.formatHTML(manifest);
            default:
                throw new Error(`不支持的格式: ${format}`);
        }
    }
    /**
     * 格式化为 Markdown
     */
    formatMarkdown(manifest) {
        const { build, project, config, files, stats } = manifest;
        return `# 构建清单

## 📋 构建信息

- **构建ID**: ${build.id}
- **构建时间**: ${build.formattedTime}
- **构建持续时间**: ${build.formattedDuration}
- **打包工具**: ${build.bundler} ${build.bundlerVersion || ''}
- **构建模式**: ${build.mode}
- **构建状态**: ${build.success ? '✅ 成功' : '❌ 失败'}

## 📦 项目信息

- **项目名称**: ${project.name}
- **项目版本**: ${project.version}
${project.description ? `- **项目描述**: ${project.description}` : ''}
${project.author ? `- **项目作者**: ${project.author}` : ''}

## ⚙️ 构建配置

- **入口文件**: ${typeof config.input === 'string' ? config.input : JSON.stringify(config.input)}
- **输出目录**: ${config.outputDir}
- **输出格式**: ${config.formats.join(', ')}
- **Source Map**: ${config.sourcemap ? '✅' : '❌'}
- **代码压缩**: ${config.minify ? '✅' : '❌'}
- **外部依赖**: ${config.external.length} 个

## 📊 统计信息

- **总文件数**: ${stats.totalFiles}
- **总大小**: ${stats.formattedTotalSize}
- **最大文件**: ${stats.largestFile.name} (${stats.largestFile.formattedSize})
- **最小文件**: ${stats.smallestFile.name} (${stats.smallestFile.formattedSize})

### 按类型分组

${Object.entries(stats.byType).map(([type, stat]) => `- **${type.toUpperCase()}**: ${stat.count} 个文件, ${stat.formattedSize}`).join('\n')}

### 按格式分组

${Object.entries(stats.byFormat).map(([format, stat]) => `- **${format.toUpperCase()}**: ${stat.count} 个文件, ${stat.formattedSize}`).join('\n')}

## 📁 文件列表

| 文件名 | 大小 | 类型 | 格式 | 哈希 |
|--------|------|------|------|------|
${files.map(file => `| ${file.name} | ${file.formattedSize} | ${file.type} | ${file.format || '-'} | ${file.hash.substring(0, 8)} |`).join('\n')}

---
*生成时间: ${new Date().toISOString()}*
`;
    }
    /**
     * 格式化为 HTML
     */
    formatHTML(manifest) {
        // HTML 格式实现将在下一个编辑中添加
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>构建清单 - ${manifest.project.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 构建清单</h1>
        <p><strong>${manifest.project.name}</strong> v${manifest.project.version}</p>
    </div>
    
    <div class="section">
        <h2>🏗️ 构建信息</h2>
        <div class="stats">
            <div class="stat-card">
                <h4>构建状态</h4>
                <p class="${manifest.build.success ? 'success' : 'error'}">
                    ${manifest.build.success ? '✅ 成功' : '❌ 失败'}
                </p>
            </div>
            <div class="stat-card">
                <h4>打包工具</h4>
                <p>${manifest.build.bundler} ${manifest.build.bundlerVersion || ''}</p>
            </div>
            <div class="stat-card">
                <h4>构建时间</h4>
                <p>${manifest.build.formattedDuration}</p>
            </div>
            <div class="stat-card">
                <h4>总大小</h4>
                <p>${manifest.stats.formattedTotalSize}</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📁 文件列表</h2>
        <table>
            <thead>
                <tr>
                    <th>文件名</th>
                    <th>大小</th>
                    <th>类型</th>
                    <th>格式</th>
                    <th>哈希</th>
                </tr>
            </thead>
            <tbody>
                ${manifest.files.map(file => `
                <tr>
                    <td>${file.name}</td>
                    <td>${file.formattedSize}</td>
                    <td>${file.type}</td>
                    <td>${file.format || '-'}</td>
                    <td><code>${file.hash.substring(0, 8)}</code></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
        <p>生成时间: ${new Date().toISOString()}</p>
    </footer>
</body>
</html>`;
    }
    /**
     * 扫描输出文件
     */
    async scanOutputFiles(outputDir) {
        const files = [];
        if (!fs.existsSync(outputDir)) {
            return files;
        }
        const scanDir = async (dir, basePath = '') => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                if (entry.isDirectory()) {
                    await scanDir(fullPath, relativePath);
                }
                else if (entry.isFile()) {
                    const stats = await fs.promises.stat(fullPath);
                    const content = await fs.promises.readFile(fullPath);
                    const hash = createHash('md5').update(content).digest('hex');
                    files.push({
                        path: relativePath,
                        name: entry.name,
                        size: stats.size,
                        formattedSize: this.formatBytes(stats.size),
                        type: this.getFileType(entry.name),
                        format: this.getFileFormat(entry.name),
                        hash,
                        createdAt: stats.birthtime.toISOString(),
                        isEntry: this.isEntryFile(entry.name),
                        isChunk: this.isChunkFile(entry.name),
                        dependencies: []
                    });
                }
            }
        };
        await scanDir(outputDir);
        return files.sort((a, b) => a.path.localeCompare(b.path));
    }
    /**
     * 生成统计信息
     */
    generateStats(files) {
        const stats = {
            totalFiles: files.length,
            totalSize: files.reduce((sum, file) => sum + file.size, 0),
            formattedTotalSize: '',
            byType: {},
            byFormat: {},
            largestFile: { name: '', size: 0, formattedSize: '' },
            smallestFile: { name: '', size: Infinity, formattedSize: '' }
        };
        stats.formattedTotalSize = this.formatBytes(stats.totalSize);
        // 按类型统计
        for (const file of files) {
            if (!stats.byType[file.type]) {
                stats.byType[file.type] = { count: 0, size: 0, formattedSize: '' };
            }
            stats.byType[file.type].count++;
            stats.byType[file.type].size += file.size;
        }
        // 按格式统计
        for (const file of files) {
            if (file.format) {
                if (!stats.byFormat[file.format]) {
                    stats.byFormat[file.format] = { count: 0, size: 0, formattedSize: '' };
                }
                stats.byFormat[file.format].count++;
                stats.byFormat[file.format].size += file.size;
            }
        }
        // 格式化大小
        Object.values(stats.byType).forEach(stat => {
            stat.formattedSize = this.formatBytes(stat.size);
        });
        Object.values(stats.byFormat).forEach(stat => {
            stat.formattedSize = this.formatBytes(stat.size);
        });
        // 找出最大和最小文件
        for (const file of files) {
            if (file.size > stats.largestFile.size) {
                stats.largestFile = {
                    name: file.name,
                    size: file.size,
                    formattedSize: file.formattedSize
                };
            }
            if (file.size < stats.smallestFile.size) {
                stats.smallestFile = {
                    name: file.name,
                    size: file.size,
                    formattedSize: file.formattedSize
                };
            }
        }
        return stats;
    }
    /**
     * 获取项目信息
     */
    async getProjectInfo() {
        try {
            const packageJsonPath = path.resolve(process.cwd(), 'package.json');
            const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));
            return {
                name: packageJson.name || 'unknown',
                version: packageJson.version || '0.0.0',
                description: packageJson.description,
                author: packageJson.author
            };
        }
        catch (error) {
            return {
                name: 'unknown',
                version: '0.0.0'
            };
        }
    }
    /**
     * 获取打包工具版本
     */
    async getBundlerVersion(bundler) {
        try {
            const packagePath = path.resolve(process.cwd(), 'node_modules', bundler, 'package.json');
            const packageJson = JSON.parse(await fs.promises.readFile(packagePath, 'utf-8'));
            return packageJson.version;
        }
        catch (error) {
            return undefined;
        }
    }
    /**
     * 获取文件类型
     */
    getFileType(filename) {
        const ext = path.extname(filename).toLowerCase();
        if (ext === '.js' || ext === '.mjs' || ext === '.cjs')
            return 'js';
        if (ext === '.css')
            return 'css';
        if (ext === '.map')
            return 'map';
        if (ext === '.ts' || filename.endsWith('.d.ts') || filename.endsWith('.d.cts'))
            return 'dts';
        return 'other';
    }
    /**
     * 获取文件格式
     */
    getFileFormat(filename) {
        if (filename.includes('.esm.') || filename.endsWith('.js'))
            return 'esm';
        if (filename.includes('.cjs') || filename.endsWith('.cjs'))
            return 'cjs';
        if (filename.includes('.umd.'))
            return 'umd';
        if (filename.includes('.iife.'))
            return 'iife';
        return undefined;
    }
    /**
     * 判断是否为入口文件
     */
    isEntryFile(filename) {
        return filename.startsWith('index.') && !filename.endsWith('.map');
    }
    /**
     * 判断是否为 chunk 文件
     */
    isChunkFile(filename) {
        return filename.includes('chunk') || filename.includes('vendor');
    }
    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * 格式化持续时间
     */
    formatDuration(ms) {
        if (ms < 1000)
            return `${ms.toFixed(0)}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(2)}s`;
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}m ${seconds}s`;
    }
}
//# sourceMappingURL=BuildManifestGenerator.js.map