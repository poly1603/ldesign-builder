/**
 * 简化版构建器 - 参考 TDesign 的构建思路
 *
 * 专门用于构建 TypeScript 库和 Vue 组件库
 * 支持多种构建格式和样式处理策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { glob } from 'glob';
import { readFile, writeFile, remove } from 'fs-extra';
import { rollup } from 'rollup';
import url from '@rollup/plugin-url';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import vuePlugin from 'rollup-plugin-vue';
import styles from 'rollup-plugin-styles';
import esbuild from 'rollup-plugin-esbuild';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import ignoreImport from 'rollup-plugin-ignore-import';
import multiInput from 'rollup-plugin-multi-input';
import staticImport from 'rollup-plugin-static-import';
/**
 * 默认扩展名
 */
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.es6', '.es', '.mjs', '.cjs'];
/**
 * 获取插件配置
 */
const getPlugins = ({ cssBuildType, env, isProd, config } = {}) => {
    const plugins = [
        nodeResolve({
            extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx', '.vue'],
        }),
        commonjs(),
        esbuild({
            target: 'esnext',
            minify: false,
            jsx: 'preserve',
        }),
        json(),
        url(),
        replace({
            preventAssignment: true,
            values: {
                PKG_VERSION: JSON.stringify(config.version),
            },
        }),
    ];
    // 如果是 Vue 组件库，添加 Vue 插件
    if (config.isVueLibrary) {
        plugins.unshift(vuePlugin());
        // Babel 转换配置
        plugins.push(babel({
            babelHelpers: 'runtime',
            extensions: [...DEFAULT_EXTENSIONS, '.vue', '.ts', '.tsx'],
            exclude: 'node_modules/**'
        }));
    }
    // CSS 处理策略
    if (cssBuildType === 'single') {
        // CSS 打包到一个文件中
        plugins.push(postcss({
            extract: `${isProd ? `${config.name}.min` : config.name}.css`,
            minimize: isProd,
            sourceMap: true,
            extensions: ['.sass', '.scss', '.css', '.less'],
        }));
    }
    else if (cssBuildType === 'multi') {
        // CSS 分别打包到各自的 style 下
        const componentsRoot = config.componentsRoot || 'src';
        plugins.push(staticImport({
            baseDir: componentsRoot,
            include: [`${componentsRoot}/**/style/css.mjs`],
        }), ignoreImport({
            include: [`${componentsRoot}/**/style/*`],
            body: 'import "./style/css.mjs";',
        }), copy({
            targets: [
                {
                    src: `${componentsRoot}/**/style/css.js`,
                    dest: `${config.outDir || '.'}/es`,
                    rename: (name, extension, fullPath) => `${fullPath.replace(componentsRoot + '/', '').slice(0, -6)}${name}.mjs`,
                },
            ],
            verbose: true,
        }));
    }
    else if (cssBuildType === 'ignore') {
        // 完全忽略样式
        plugins.push(ignoreImport({
            include: [`${config.componentsRoot || 'src'}/**/style/index.js`],
        }));
    }
    // cssBuildType === 'source' 时不添加样式处理插件，保持引用
    if (env) {
        plugins.push(replace({
            preventAssignment: true,
            values: {
                'process.env.NODE_ENV': JSON.stringify(env),
            },
        }));
    }
    if (isProd) {
        plugins.push(terser({
            output: {
                ascii_only: true,
            },
        }));
    }
    return plugins;
};
/**
 * 生成 banner
 */
const createBanner = (config) => {
    return `/**
 * ${config.name} v${config.version}
 * (c) ${new Date().getFullYear()} ${config.author || 'LDesign Team'}
 * @license ${config.license || 'MIT'}
 */
`;
};
/**
 * 构建 ES 模块（支持 tree-shaking）
 */
export const buildEs = async (config) => {
    console.log('🔨 构建 ES 模块...');
    const componentsRoot = config.componentsRoot || 'src';
    const inputList = [
        `${componentsRoot}/**/*.ts`,
        `${componentsRoot}/**/*.tsx`,
        `!${componentsRoot}/**/demos`,
        `!${componentsRoot}/**/*.d.ts`,
        `!${componentsRoot}/**/type.ts`,
        `!${componentsRoot}/**/types.ts`,
        `!${componentsRoot}/**/__tests__`,
    ];
    // 先构建 CSS
    if (config.isVueLibrary) {
        const cssBundle = await rollup({
            input: [`${componentsRoot}/**/style/index.js`],
            plugins: [multiInput({ relative: componentsRoot }), styles({ mode: 'extract' }), nodeResolve()],
        });
        await cssBundle.write({
            banner: createBanner(config),
            dir: `${config.outDir || '.'}/es/`,
            assetFileNames: '[name].css',
        });
    }
    // 构建组件
    const external = [...(config.external || []), 'vue'];
    const bundle = await rollup({
        input: [...inputList, `!${componentsRoot}/index-lib.ts`],
        treeshake: false, // 为了保留 style/css.js
        external,
        plugins: [multiInput({ relative: componentsRoot }), ...getPlugins({ cssBuildType: 'multi', config })],
    });
    await bundle.write({
        banner: createBanner(config),
        dir: `${config.outDir || '.'}/es/`,
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[name].mjs',
        chunkFileNames: '_chunks/dep-[hash].mjs',
    });
    // 清理不需要的文件
    const files = await glob(`${config.outDir || '.'}/es/**/style/index.js`);
    await Promise.all(files.map(filePath => remove(filePath)));
    console.log('✅ ES 模块构建完成');
};
/**
 * 构建 ESM 模块（保留源码样式引用）
 */
export const buildEsm = async (config) => {
    console.log('🔨 构建 ESM 模块...');
    const componentsRoot = config.componentsRoot || 'src';
    const inputList = [
        `${componentsRoot}/**/*.ts`,
        `${componentsRoot}/**/*.tsx`,
        `!${componentsRoot}/**/demos`,
        `!${componentsRoot}/**/*.d.ts`,
        `!${componentsRoot}/**/type.ts`,
        `!${componentsRoot}/**/types.ts`,
        `!${componentsRoot}/**/__tests__`,
    ];
    const external = [...(config.external || []), 'vue', /@ldesign\/common-style/];
    const bundle = await rollup({
        input: [...inputList, `!${componentsRoot}/index-lib.ts`],
        external,
        plugins: [
            multiInput({ relative: componentsRoot }),
            // 复制通用样式
            copy({
                targets: [
                    {
                        src: 'src/styles/**/*.less',
                        dest: `${config.outDir || '.'}/esm/common`,
                        rename: (_, __, fullPath) => `${fullPath.replace('src/', '')}`,
                    },
                ],
                verbose: true,
            }),
            ...getPlugins({ cssBuildType: 'source', config }),
        ],
    });
    await bundle.write({
        banner: createBanner(config),
        dir: `${config.outDir || '.'}/esm/`,
        format: 'esm',
        sourcemap: true,
        chunkFileNames: '_chunks/dep-[hash].js',
    });
    // 替换样式导入路径
    const files = await glob(`${config.outDir || '.'}/esm/**/*.*`);
    const rewritePromises = files.map(async (filePath) => {
        const content = await readFile(filePath, 'utf8');
        const newContent = content.replace(/@ldesign\/common-style/g, `${config.name}/esm/common/style`);
        if (content !== newContent) {
            await writeFile(filePath, newContent, 'utf8');
        }
    });
    await Promise.all(rewritePromises);
    console.log('✅ ESM 模块构建完成');
};
/**
 * 构建 Lib 格式
 */
export const buildLib = async (config) => {
    console.log('🔨 构建 Lib 格式...');
    const componentsRoot = config.componentsRoot || 'src';
    const inputList = [
        `${componentsRoot}/**/*.ts`,
        `${componentsRoot}/**/*.tsx`,
        `!${componentsRoot}/**/demos`,
        `!${componentsRoot}/**/*.d.ts`,
        `!${componentsRoot}/**/type.ts`,
        `!${componentsRoot}/**/types.ts`,
        `!${componentsRoot}/**/__tests__`,
    ];
    const external = [...(config.external || []), 'vue'];
    const bundle = await rollup({
        input: inputList,
        external,
        plugins: [multiInput({ relative: componentsRoot }), ...getPlugins({ cssBuildType: 'ignore', config })],
    });
    await bundle.write({
        banner: createBanner(config),
        dir: `${config.outDir || '.'}/lib/`,
        format: 'esm',
        sourcemap: true,
        chunkFileNames: '_chunks/dep-[hash].js',
    });
    console.log('✅ Lib 格式构建完成');
};
/**
 * 构建 CJS 格式
 */
export const buildCjs = async (config) => {
    console.log('🔨 构建 CJS 格式...');
    const componentsRoot = config.componentsRoot || 'src';
    const inputList = [
        `${componentsRoot}/**/*.ts`,
        `${componentsRoot}/**/*.tsx`,
        `!${componentsRoot}/**/demos`,
        `!${componentsRoot}/**/*.d.ts`,
        `!${componentsRoot}/**/type.ts`,
        `!${componentsRoot}/**/types.ts`,
        `!${componentsRoot}/**/__tests__`,
    ];
    // CJS 格式排除 lodash-es
    const cjsExternalException = ['lodash-es'];
    const external = [...(config.external || []), 'vue'].filter((value) => typeof value === 'string' ? !cjsExternalException.includes(value) : true);
    const bundle = await rollup({
        input: inputList,
        external,
        plugins: [multiInput({ relative: componentsRoot }), ...getPlugins({ cssBuildType: 'ignore', config })],
    });
    await bundle.write({
        banner: createBanner(config),
        dir: `${config.outDir || '.'}/cjs/`,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        chunkFileNames: '_chunks/dep-[hash].js',
    });
    console.log('✅ CJS 格式构建完成');
};
/**
 * 构建 UMD 格式
 */
export const buildUmd = async (config, isMin = false) => {
    console.log(`🔨 构建 UMD 格式${isMin ? '（压缩版）' : ''}...`);
    const input = config.input || `${config.componentsRoot || 'src'}/index.ts`;
    const external = ['vue'];
    const globals = { vue: 'Vue', ...config.globals };
    const bundle = await rollup({
        input,
        external,
        plugins: getPlugins({
            cssBuildType: 'single',
            isProd: isMin,
            env: isMin ? 'production' : 'development',
            config
        }),
    });
    await bundle.write({
        name: config.name,
        banner: createBanner(config),
        format: 'umd',
        exports: 'named',
        globals,
        sourcemap: true,
        file: `${config.outDir || '.'}/dist/${config.name}${isMin ? '.min' : ''}.js`,
    });
    console.log(`✅ UMD 格式${isMin ? '（压缩版）' : ''}构建完成`);
};
/**
 * 构建重置样式 CSS
 */
export const buildResetCss = async (config) => {
    console.log('🎨 构建重置样式 CSS...');
    try {
        const bundle = await rollup({
            input: 'src/styles/reset.less',
            plugins: [postcss({ extract: true })],
        });
        await bundle.write({
            file: `${config.outDir || '.'}/dist/reset.css`,
        });
        console.log('✅ 重置样式 CSS 构建完成');
    }
    catch (error) {
        console.warn('⚠️ 重置样式文件不存在，跳过构建');
    }
};
/**
 * 构建插件样式 CSS
 */
export const buildPluginCss = async (config) => {
    console.log('🎨 构建插件样式 CSS...');
    try {
        const bundle = await rollup({
            input: 'src/styles/plugin.less',
            plugins: [postcss({ extract: true })],
        });
        await bundle.write({
            file: `${config.outDir || '.'}/dist/plugin.css`,
        });
        console.log('✅ 插件样式 CSS 构建完成');
    }
    catch (error) {
        console.warn('⚠️ 插件样式文件不存在，跳过构建');
    }
};
/**
 * 删除输出目录
 */
export const deleteOutput = async (config) => {
    console.log('🗑️ 清理输出目录...');
    const dirs = ['es', 'esm', 'lib', 'cjs', 'dist'];
    const outDir = config.outDir || '.';
    const removePromises = dirs.map(async (dir) => {
        try {
            await remove(`${outDir}/${dir}`);
        }
        catch (error) {
            // 忽略删除失败的错误
        }
    });
    await Promise.all(removePromises);
    console.log('✅ 输出目录清理完成');
};
/**
 * 构建所有格式（TDesign 风格）
 */
export const buildComponents = async (config) => {
    console.log('🚀 开始 TDesign 风格的多格式构建...');
    // 清理输出目录
    await deleteOutput(config);
    // 按顺序构建各种格式
    await buildEs(config);
    await buildEsm(config);
    await buildLib(config);
    await buildCjs(config);
    await buildUmd(config);
    await buildUmd(config, true);
    // 构建额外的 CSS 文件
    if (config.isVueLibrary) {
        await buildResetCss(config);
        await buildPluginCss(config);
    }
    console.log('🎉 TDesign 风格的多格式构建完成！');
};
//# sourceMappingURL=simple-builder.js.map