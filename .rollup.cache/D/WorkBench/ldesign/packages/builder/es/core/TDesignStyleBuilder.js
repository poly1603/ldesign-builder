/**
 * TDesign 风格的组件库构建器
 *
 * 参考 TDesign 的构建思路，提供多格式构建和样式处理策略
 * 支持 es, esm, lib, cjs, umd 等多种构建格式
 * 支持 single, multi, source, ignore 等样式处理策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { glob } from 'glob';
import { readFile, writeFile, remove } from 'fs-extra';
import { LibraryBuilder } from './LibraryBuilder';
/**
 * TDesign 风格的构建器
 */
export class TDesignStyleBuilder extends LibraryBuilder {
    /**
     * 构建 ES 模块（支持 tree-shaking）
     */
    async buildEs(config) {
        console.log('🔨 构建 ES 模块...');
        // 先构建 CSS
        await this.buildCss(config);
        // 再构建组件
        await this.buildComponents(config, 'es');
        console.log('✅ ES 模块构建完成');
    }
    /**
     * 构建 ESM 模块（保留源码样式引用）
     */
    async buildEsm(config) {
        console.log('🔨 构建 ESM 模块...');
        const enhancedConfig = {
            ...config,
            cssStrategy: 'source',
            output: {
                ...config.output,
                dir: 'esm/',
                format: 'esm',
                chunkFileNames: '_chunks/dep-[hash].js'
            }
        };
        await this.build(enhancedConfig);
        // 替换 @tdesign/common-style 为相对路径
        await this.replaceCommonStyleImports('esm');
        console.log('✅ ESM 模块构建完成');
    }
    /**
     * 构建 Lib 格式
     */
    async buildLib(config) {
        console.log('🔨 构建 Lib 格式...');
        const enhancedConfig = {
            ...config,
            cssStrategy: 'ignore',
            output: {
                ...config.output,
                dir: 'lib/',
                format: 'esm',
                chunkFileNames: '_chunks/dep-[hash].js'
            }
        };
        await this.build(enhancedConfig);
        console.log('✅ Lib 格式构建完成');
    }
    /**
     * 构建 CJS 格式
     */
    async buildCjs(config) {
        console.log('🔨 构建 CJS 格式...');
        const enhancedConfig = {
            ...config,
            cssStrategy: 'ignore',
            output: {
                ...config.output,
                dir: 'cjs/',
                format: 'cjs',
                exports: 'named',
                chunkFileNames: '_chunks/dep-[hash].js'
            }
        };
        await this.build(enhancedConfig);
        console.log('✅ CJS 格式构建完成');
    }
    /**
     * 构建 UMD 格式
     */
    async buildUmd(config, isMin = false) {
        console.log(`🔨 构建 UMD 格式${isMin ? '（压缩版）' : ''}...`);
        const filename = isMin ? 'index.min.js' : 'index.js';
        const umdName = config.umd?.name || 'LDesign';
        const enhancedConfig = {
            ...config,
            cssStrategy: 'single',
            minify: isMin,
            output: {
                ...config.output,
                file: `dist/${filename}`,
                format: 'umd',
                name: umdName,
                exports: 'named',
                globals: { vue: 'Vue', ...config.globals }
            }
        };
        await this.build(enhancedConfig);
        console.log(`✅ UMD 格式${isMin ? '（压缩版）' : ''}构建完成`);
    }
    /**
     * 构建 CSS 文件
     */
    async buildCss(config) {
        console.log('🎨 构建 CSS 文件...');
        try {
            // 这里可以添加具体的 CSS 构建逻辑
            // 例如使用 rollup 构建样式文件
            const cssConfig = {
                ...config,
                input: ['src/**/style/index.js'],
                output: {
                    dir: 'es/',
                    assetFileNames: '[name].css'
                },
                cssStrategy: 'multi'
            };
            await this.build(cssConfig);
            console.log('✅ CSS 文件构建完成');
        }
        catch (error) {
            console.warn('⚠️ CSS 构建失败:', error);
        }
    }
    /**
     * 构建组件
     */
    async buildComponents(config, format) {
        console.log(`🧩 构建组件 (${format})...`);
        const componentConfig = {
            ...config,
            cssStrategy: 'multi',
            output: {
                ...config.output,
                dir: `${format}/`,
                format: 'esm',
                sourcemap: true,
                entryFileNames: '[name].mjs',
                chunkFileNames: '_chunks/dep-[hash].mjs'
            }
        };
        await this.build(componentConfig);
        // 清理不需要的文件
        await this.cleanupFiles(format);
        console.log(`✅ 组件构建完成 (${format})`);
    }
    /**
     * 替换通用样式导入
     */
    async replaceCommonStyleImports(dir) {
        console.log(`🔄 替换样式导入 (${dir})...`);
        try {
            const files = await glob(`${dir}/**/*.*`);
            const rewritePromises = files.map(async (filePath) => {
                const content = await readFile(filePath, 'utf8');
                const newContent = content.replace(/@ldesign\/common-style/g, 'ldesign-vue-next/esm/common/style');
                if (content !== newContent) {
                    await writeFile(filePath, newContent, 'utf8');
                }
            });
            await Promise.all(rewritePromises);
            console.log(`✅ 样式导入替换完成 (${dir})`);
        }
        catch (error) {
            console.warn(`⚠️ 样式导入替换失败 (${dir}):`, error);
        }
    }
    /**
     * 清理不需要的文件
     */
    async cleanupFiles(dir) {
        try {
            const files = await glob(`${dir}/**/style/index.js`);
            const removePromises = files.map(async (filePath) => {
                await remove(filePath);
            });
            await Promise.all(removePromises);
        }
        catch (error) {
            console.warn(`⚠️ 文件清理失败 (${dir}):`, error);
        }
    }
    /**
     * 删除输出目录
     */
    async deleteOutput() {
        console.log('🗑️ 清理输出目录...');
        const dirs = ['es', 'esm', 'lib', 'cjs', 'dist'];
        const removePromises = dirs.map(async (dir) => {
            try {
                await remove(dir);
            }
            catch (error) {
                // 忽略删除失败的错误
            }
        });
        await Promise.all(removePromises);
        console.log('✅ 输出目录清理完成');
    }
    /**
     * 构建所有格式（TDesign 风格）
     */
    async buildComponents(config) {
        console.log('🚀 开始 TDesign 风格的多格式构建...');
        // 清理输出目录
        await this.deleteOutput();
        const multiFormat = config.multiFormat || {
            es: true,
            esm: true,
            lib: true,
            cjs: true,
            umd: true,
            umdMin: true
        };
        // 按顺序构建各种格式
        if (multiFormat.es)
            await this.buildEs(config);
        if (multiFormat.esm)
            await this.buildEsm(config);
        if (multiFormat.lib)
            await this.buildLib(config);
        if (multiFormat.cjs)
            await this.buildCjs(config);
        if (multiFormat.umd)
            await this.buildUmd(config);
        if (multiFormat.umdMin)
            await this.buildUmd(config, true);
        console.log('🎉 TDesign 风格的多格式构建完成！');
    }
}
//# sourceMappingURL=TDesignStyleBuilder.js.map