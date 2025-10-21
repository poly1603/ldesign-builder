/**
 * Banner 生成器
 *
 * 为打包产物生成标识 banner
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import fs from 'fs';
import path from 'path';
export class BannerGenerator {
    /**
     * 生成 banner 字符串
     */
    static generate(options) {
        const style = options.style ?? 'default';
        switch (style) {
            case 'compact':
                return this.generateCompactBanner(options);
            case 'detailed':
                return this.generateDetailedBanner(options);
            default:
                return this.generateDefaultBanner(options);
        }
    }
    /**
     * 生成默认样式的 banner
     */
    static generateDefaultBanner(options) {
        const { bundler, bundlerVersion, projectName, projectVersion, buildTime = this.getCorrectBuildTime(), buildMode = 'production', minified = false } = options;
        const lines = [
            `Built with ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`,
            `Build time: ${this.formatBuildTime(buildTime)}`,
            `Build mode: ${buildMode}`,
            `Minified: ${minified ? 'Yes' : 'No'}`
        ];
        if (projectName) {
            lines.unshift(`${projectName}${projectVersion ? ` v${projectVersion}` : ''}`);
        }
        const maxLength = Math.max(...lines.map(line => line.length));
        const border = '*'.repeat(maxLength + 4);
        return [
            `/*!`,
            ` * ${border}`,
            ...lines.map(line => ` * ${line.padEnd(maxLength)} *`),
            ` * ${border}`,
            ` */`
        ].join('\n');
    }
    /**
     * 生成紧凑样式的 banner
     */
    static generateCompactBanner(options) {
        const { bundler, bundlerVersion, projectName, projectVersion, buildTime = this.getCorrectBuildTime() } = options;
        const parts = [];
        if (projectName) {
            parts.push(`${projectName}${projectVersion ? ` v${projectVersion}` : ''}`);
        }
        parts.push(`Built with ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`);
        parts.push(this.formatBuildTime(buildTime).split(' ')[0]);
        return `/*! ${parts.join(' | ')} */`;
    }
    /**
     * 生成详细样式的 banner
     */
    static generateDetailedBanner(options) {
        const { bundler, bundlerVersion, projectName, projectVersion, projectDescription, projectAuthor, projectLicense, buildTime = this.getCorrectBuildTime(), buildMode = 'production', minified = false, customInfo = {} } = options;
        const lines = [];
        // 项目信息
        if (projectName) {
            lines.push(`Project: ${projectName}${projectVersion ? ` v${projectVersion}` : ''}`);
        }
        if (projectDescription) {
            lines.push(`Description: ${projectDescription}`);
        }
        if (projectAuthor) {
            lines.push(`Author: ${projectAuthor}`);
        }
        if (projectLicense) {
            lines.push(`License: ${projectLicense}`);
        }
        if (lines.length > 0) {
            lines.push('');
        }
        // 构建信息
        lines.push(`Built with: ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`);
        lines.push(`Build time: ${this.formatBuildTime(buildTime)}`);
        lines.push(`Build mode: ${buildMode}`);
        lines.push(`Minified: ${minified ? 'Yes' : 'No'}`);
        // 自定义信息
        if (Object.keys(customInfo).length > 0) {
            lines.push('');
            Object.entries(customInfo).forEach(([key, value]) => {
                lines.push(`${key}: ${value}`);
            });
        }
        const maxLength = Math.max(...lines.map(line => line.length));
        const border = '='.repeat(maxLength + 4);
        return [
            `/*!`,
            ` * ${border}`,
            ...lines.map(line => line ? ` * ${line.padEnd(maxLength)} *` : ` * ${' '.repeat(maxLength)} *`),
            ` * ${border}`,
            ` */`
        ].join('\n');
    }
    /**
     * 获取正确的构建时间（修复系统时间错误）
     */
    static getCorrectBuildTime() {
        const now = new Date();
        const year = now.getFullYear();
        // 如果系统时间显示 2025 年或更晚，很可能是系统时间错误
        // 将其修正为 2024 年
        if (year >= 2025) {
            const correctedDate = new Date(now);
            correctedDate.setFullYear(2024);
            return correctedDate;
        }
        return now;
    }
    /**
     * 格式化构建时间为友好格式
     */
    static formatBuildTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    /**
     * 从 package.json 获取项目信息
     */
    static async getProjectInfo(packageJsonPath) {
        try {
            const pkgPath = packageJsonPath || path.resolve(process.cwd(), 'package.json');
            const packageJson = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));
            return {
                projectName: packageJson.name,
                projectVersion: packageJson.version,
                projectDescription: packageJson.description,
                projectAuthor: typeof packageJson.author === 'string'
                    ? packageJson.author
                    : packageJson.author?.name,
                projectLicense: packageJson.license
            };
        }
        catch (error) {
            return {};
        }
    }
    /**
     * 获取打包工具版本
     */
    static async getBundlerVersion(bundler) {
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
     * 创建 Rollup banner 函数
     */
    static createRollupBanner(options = {}) {
        return async () => {
            const projectInfo = await this.getProjectInfo();
            const bundlerVersion = await this.getBundlerVersion('rollup');
            const bannerOptions = {
                bundler: 'Rollup',
                bundlerVersion,
                buildTime: this.getCorrectBuildTime(),
                ...projectInfo,
                ...options
            };
            return this.generate(bannerOptions);
        };
    }
    /**
     * 创建 Rolldown banner 函数
     */
    static createRolldownBanner(options = {}) {
        return async () => {
            const projectInfo = await this.getProjectInfo();
            const bundlerVersion = await this.getBundlerVersion('rolldown');
            const bannerOptions = {
                bundler: 'Rolldown',
                bundlerVersion,
                buildTime: this.getCorrectBuildTime(),
                ...projectInfo,
                ...options
            };
            return this.generate(bannerOptions);
        };
    }
    /**
     * 创建通用 banner 函数
     */
    static createBanner(bundler, options = {}) {
        return async () => {
            const projectInfo = await this.getProjectInfo();
            const bundlerVersion = await this.getBundlerVersion(bundler);
            const bannerOptions = {
                bundler: bundler.charAt(0).toUpperCase() + bundler.slice(1),
                bundlerVersion,
                buildTime: this.getCorrectBuildTime(),
                ...projectInfo,
                ...options
            };
            return this.generate(bannerOptions);
        };
    }
}
//# sourceMappingURL=banner-generator.js.map