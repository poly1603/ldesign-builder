/**
 * TDesign 风格的构建工具函数
 *
 * 提供便捷的 TDesign 风格构建函数
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { TDesignStyleBuilder } from '../core/TDesignStyleBuilder';
/**
 * 创建 TDesign 风格的构建配置
 */
export function createTDesignConfig(options) {
    const { input = 'src/index.ts', outDir = '.', name = 'LDesign', multiFormat = true, cssStrategy = 'multi', external = ['vue'], globals = { vue: 'Vue' }, sourcemap = true, minify = false } = options;
    // 处理多格式配置
    let multiFormatConfig;
    if (multiFormat === true) {
        multiFormatConfig = {
            es: true,
            esm: true,
            lib: true,
            cjs: true,
            umd: true,
            umdMin: true
        };
    }
    else if (typeof multiFormat === 'object') {
        multiFormatConfig = multiFormat;
    }
    return {
        input,
        libraryType: 'vue3',
        bundler: 'rollup',
        external,
        globals,
        sourcemap,
        minify,
        multiFormat: multiFormatConfig,
        cssStrategy,
        umd: {
            name,
            filename: 'index'
        },
        output: {
            dir: outDir
        },
        vue: {
            version: 3
        },
        style: {
            extract: true
        }
    };
}
/**
 * 构建 ES 模块（支持 tree-shaking）
 */
export async function buildEs(config) {
    const builder = new TDesignStyleBuilder();
    const finalConfig = createTDesignConfig({
        multiFormat: { es: true },
        cssStrategy: 'multi',
        ...config
    });
    await builder.buildEs(finalConfig);
}
/**
 * 构建 ESM 模块（保留源码样式引用）
 */
export async function buildEsm(config) {
    const builder = new TDesignStyleBuilder();
    const finalConfig = createTDesignConfig({
        multiFormat: { esm: true },
        cssStrategy: 'source',
        ...config
    });
    await builder.buildEsm(finalConfig);
}
/**
 * 构建 Lib 格式
 */
export async function buildLib(config) {
    const builder = new TDesignStyleBuilder();
    const finalConfig = createTDesignConfig({
        multiFormat: { lib: true },
        cssStrategy: 'ignore',
        ...config
    });
    await builder.buildLib(finalConfig);
}
/**
 * 构建 CJS 格式
 */
export async function buildCjs(config) {
    const builder = new TDesignStyleBuilder();
    const finalConfig = createTDesignConfig({
        multiFormat: { cjs: true },
        cssStrategy: 'ignore',
        ...config
    });
    await builder.buildCjs(finalConfig);
}
/**
 * 构建 UMD 格式
 */
export async function buildUmd(config, isMin = false) {
    const builder = new TDesignStyleBuilder();
    const finalConfig = createTDesignConfig({
        multiFormat: { umd: true },
        cssStrategy: 'single',
        minify: isMin,
        ...config
    });
    await builder.buildUmd(finalConfig, isMin);
}
/**
 * 构建所有格式（TDesign 风格）
 */
export async function buildComponents(config) {
    const builder = new TDesignStyleBuilder();
    const finalConfig = createTDesignConfig({
        multiFormat: true,
        cssStrategy: 'multi',
        ...config
    });
    await builder.buildComponents(finalConfig);
}
/**
 * 删除输出目录
 */
export async function deleteOutput() {
    const builder = new TDesignStyleBuilder();
    await builder.deleteOutput();
}
/**
 * 构建重置样式 CSS
 */
export async function buildResetCss(config) {
    console.log('🎨 构建重置样式 CSS...');
    const builder = new TDesignStyleBuilder();
    const resetConfig = createTDesignConfig({
        input: 'src/styles/reset.less',
        cssStrategy: 'single',
        ...config,
        output: {
            file: 'dist/reset.css'
        }
    });
    await builder.build(resetConfig);
    console.log('✅ 重置样式 CSS 构建完成');
}
/**
 * 构建插件样式 CSS
 */
export async function buildPluginCss(config) {
    console.log('🎨 构建插件样式 CSS...');
    const builder = new TDesignStyleBuilder();
    const pluginConfig = createTDesignConfig({
        input: 'src/styles/plugin.less',
        cssStrategy: 'single',
        ...config,
        output: {
            file: 'dist/plugin.css'
        }
    });
    await builder.build(pluginConfig);
    console.log('✅ 插件样式 CSS 构建完成');
}
/**
 * 完整的 TDesign 风格构建流程
 */
export async function buildAll(config) {
    console.log('🚀 开始完整的 TDesign 风格构建...');
    // 删除输出目录
    await deleteOutput();
    // 构建所有格式
    await buildComponents(config);
    // 构建额外的 CSS 文件
    try {
        await buildResetCss(config);
    }
    catch (error) {
        console.warn('⚠️ 重置样式构建失败:', error);
    }
    try {
        await buildPluginCss(config);
    }
    catch (error) {
        console.warn('⚠️ 插件样式构建失败:', error);
    }
    console.log('🎉 完整的 TDesign 风格构建完成！');
}
//# sourceMappingURL=tdesign-builder.js.map