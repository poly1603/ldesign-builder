/**
 * 库类型相关常量
 */
/**
 * 库类型检测模式
 */
export declare const LIBRARY_TYPE_PATTERNS: {
    readonly typescript: {
        readonly files: readonly ["src/**/*.ts", "src/**/*.tsx", "lib/**/*.ts", "lib/**/*.tsx", "index.ts", "main.ts"];
        readonly dependencies: readonly ["typescript", "@types/node"];
        readonly configs: readonly ["tsconfig.json", "tsconfig.build.json"];
        readonly packageJsonFields: readonly ["types", "typings"];
        readonly weight: 0.8;
    };
    readonly style: {
        readonly files: readonly ["src/**/*.css", "src/**/*.less", "src/**/*.scss", "src/**/*.sass", "src/**/*.styl", "lib/**/*.css", "styles/**/*"];
        readonly dependencies: readonly ["less", "sass", "stylus", "postcss"];
        readonly configs: readonly ["postcss.config.js", ".stylelintrc"];
        readonly packageJsonFields: readonly ["style", "sass", "less"];
        readonly weight: 0.9;
    };
    readonly vue2: {
        readonly files: readonly ["src/**/*.vue", "lib/**/*.vue", "components/**/*.vue"];
        readonly dependencies: readonly ["vue@^2", "@vue/composition-api", "vue-template-compiler"];
        readonly devDependencies: readonly ["@vue/cli-service", "vue-loader"];
        readonly configs: readonly ["vue.config.js"];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.95;
    };
    readonly vue3: {
        readonly files: readonly ["src/**/*.vue", "lib/**/*.vue", "components/**/*.vue", "src/**/*.tsx", "lib/**/*.tsx", "components/**/*.tsx"];
        readonly dependencies: readonly ["vue@^3", "@vue/runtime-core", "@vue/runtime-dom"];
        readonly devDependencies: readonly ["@vitejs/plugin-vue", "@vue/compiler-sfc"];
        readonly configs: readonly ["vite.config.ts", "vite.config.js"];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.95;
    };
    readonly react: {
        readonly files: readonly ["src/**/*.tsx", "src/**/*.jsx", "lib/**/*.tsx", "components/**/*.tsx"];
        readonly dependencies: readonly ["react", "react-dom"];
        readonly devDependencies: readonly ["@vitejs/plugin-react"];
        readonly configs: readonly ["vite.config.ts", "vite.config.js"];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.95;
    };
    readonly svelte: {
        readonly files: readonly ["src/**/*.svelte", "lib/**/*.svelte", "components/**/*.svelte"];
        readonly dependencies: readonly ["svelte"];
        readonly devDependencies: readonly ["@sveltejs/rollup-plugin-svelte"];
        readonly configs: readonly ["svelte.config.js", "svelte.config.cjs"];
        readonly packageJsonFields: readonly ["svelte"];
        readonly weight: 0.95;
    };
    readonly solid: {
        readonly files: readonly ["src/**/*.jsx", "src/**/*.tsx"];
        readonly dependencies: readonly ["solid-js"];
        readonly devDependencies: readonly ["rollup-plugin-solid", "vite-plugin-solid"];
        readonly configs: readonly ["vite.config.ts", "vite.config.js"];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.9;
    };
    readonly preact: {
        readonly files: readonly ["src/**/*.jsx", "src/**/*.tsx"];
        readonly dependencies: readonly ["preact"];
        readonly devDependencies: readonly ["@preact/preset-vite"];
        readonly configs: readonly ["vite.config.ts", "vite.config.js"];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.9;
    };
    readonly lit: {
        readonly files: readonly ["src/**/*.ts", "src/**/*.js", "src/**/*.css"];
        readonly dependencies: readonly ["lit"];
        readonly devDependencies: readonly [];
        readonly configs: readonly [];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.85;
    };
    readonly angular: {
        readonly files: readonly ["projects/**/*.ts", "src/**/*.ts"];
        readonly dependencies: readonly ["@angular/core", "@angular/common"];
        readonly devDependencies: readonly ["ng-packagr"];
        readonly configs: readonly ["ng-package.json", "angular.json"];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.8;
    };
    readonly mixed: {
        readonly files: readonly ["src/**/*.{ts,tsx,vue,css,less,scss}"];
        readonly dependencies: readonly [];
        readonly configs: readonly [];
        readonly packageJsonFields: readonly [];
        readonly weight: 0.6;
    };
};
/**
 * 库类型描述
 */
export declare const LIBRARY_TYPE_DESCRIPTIONS: {
    readonly typescript: "TypeScript 库 - 使用 TypeScript 编写的库，支持类型声明和现代 JavaScript 特性";
    readonly style: "样式库 - 包含 CSS、Less、Sass 等样式文件的库";
    readonly vue2: "Vue2 组件库 - 基于 Vue 2.x 的组件库";
    readonly vue3: "Vue3 组件库 - 基于 Vue 3.x 的组件库，支持 Composition API";
    readonly react: "React 组件库 - 基于 React 18+ 的组件库，支持 JSX/TSX 与 Hooks";
    readonly svelte: "Svelte 组件库 - 使用 Svelte 的库，零虚拟DOM，编译时优化";
    readonly solid: "Solid 组件库 - 使用 SolidJS 的库，细粒度响应式，JSX 支持";
    readonly preact: "Preact 组件库 - 小而快的 React 兼容库";
    readonly lit: "Lit/Web Components 组件库 - 标准 Web Components，面向浏览器原生";
    readonly angular: "Angular 组件库（基础支持）- 建议使用 ng-packagr，但提供最小打包能力";
    readonly mixed: "混合库 - 包含多种类型文件的复合库";
};
/**
 * 库类型推荐配置
 */
export declare const LIBRARY_TYPE_RECOMMENDED_CONFIG: {
    readonly typescript: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly typescript: {
            readonly declaration: true;
            readonly isolatedDeclarations: true;
        };
        readonly external: readonly [];
        readonly bundleless: false;
    };
    readonly style: {
        readonly output: {
            readonly format: readonly ["esm"];
            readonly sourcemap: false;
        };
        readonly style: {
            readonly extract: true;
            readonly minimize: true;
            readonly autoprefixer: true;
        };
        readonly external: readonly [];
        readonly bundleless: true;
    };
    readonly vue2: {
        readonly output: {
            readonly format: readonly ["esm", "cjs", "umd"];
            readonly sourcemap: true;
        };
        readonly vue: {
            readonly version: 2;
            readonly onDemand: true;
        };
        readonly external: readonly ["vue"];
        readonly globals: {
            readonly vue: "Vue";
        };
        readonly bundleless: false;
    };
    readonly vue3: {
        readonly output: {
            readonly format: readonly ["esm", "cjs", "umd"];
            readonly sourcemap: true;
        };
        readonly vue: {
            readonly version: 3;
            readonly onDemand: true;
        };
        readonly external: readonly ["vue"];
        readonly globals: {
            readonly vue: "Vue";
        };
        readonly bundleless: false;
    };
    readonly react: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly external: readonly ["react", "react-dom"];
        readonly bundleless: false;
    };
    readonly svelte: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly external: readonly ["svelte"];
        readonly bundleless: false;
    };
    readonly solid: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly external: readonly ["solid-js"];
        readonly bundleless: false;
    };
    readonly preact: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly external: readonly ["preact"];
        readonly bundleless: false;
    };
    readonly lit: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly external: readonly ["lit"];
        readonly bundleless: false;
    };
    readonly angular: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly external: readonly ["@angular/core", "@angular/common"];
        readonly bundleless: false;
    };
    readonly mixed: {
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
            readonly sourcemap: true;
        };
        readonly typescript: {
            readonly declaration: true;
        };
        readonly style: {
            readonly extract: true;
        };
        readonly external: readonly [];
        readonly bundleless: false;
    };
};
/**
 * 库类型优先级
 */
export declare const LIBRARY_TYPE_PRIORITY: {
    readonly vue2: 10;
    readonly vue3: 10;
    readonly react: 10;
    readonly svelte: 9;
    readonly solid: 9;
    readonly preact: 9;
    readonly lit: 8;
    readonly angular: 7;
    readonly style: 8;
    readonly typescript: 6;
    readonly mixed: 2;
};
/**
 * 库类型兼容性
 */
export declare const LIBRARY_TYPE_COMPATIBILITY: {
    readonly typescript: {
        readonly rollup: "excellent";
        readonly rolldown: "excellent";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: true;
    };
    readonly style: {
        readonly rollup: "good";
        readonly rolldown: "good";
        readonly treeshaking: false;
        readonly codeSplitting: false;
        readonly bundleless: true;
    };
    readonly vue2: {
        readonly rollup: "excellent";
        readonly rolldown: "good";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly vue3: {
        readonly rollup: "excellent";
        readonly rolldown: "excellent";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly mixed: {
        readonly rollup: "good";
        readonly rolldown: "good";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly svelte: {
        readonly rollup: "excellent";
        readonly rolldown: "good";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly solid: {
        readonly rollup: "good";
        readonly rolldown: "good";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly preact: {
        readonly rollup: "excellent";
        readonly rolldown: "good";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly lit: {
        readonly rollup: "excellent";
        readonly rolldown: "good";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
    readonly angular: {
        readonly rollup: "fair";
        readonly rolldown: "fair";
        readonly treeshaking: true;
        readonly codeSplitting: true;
        readonly bundleless: false;
    };
};
/**
 * 库类型所需插件
 */
export declare const LIBRARY_TYPE_PLUGINS: {
    readonly typescript: readonly ["typescript", "dts"];
    readonly style: readonly ["postcss", "less", "sass", "stylus"];
    readonly vue2: readonly ["vue2", "vue-jsx", "typescript", "postcss"];
    readonly vue3: readonly ["vue3", "vue-jsx", "typescript", "postcss"];
    readonly mixed: readonly ["typescript", "vue3", "postcss", "dts"];
    readonly svelte: readonly ["svelte", "postcss", "dts"];
    readonly solid: readonly ["solid", "typescript", "postcss", "dts"];
    readonly preact: readonly ["preact", "typescript", "postcss", "dts"];
    readonly lit: readonly ["typescript", "postcss", "dts"];
    readonly angular: readonly ["typescript", "dts"];
};
/**
 * 库类型检测权重
 */
export declare const DETECTION_WEIGHTS: {
    readonly files: 0.4;
    readonly dependencies: 0.3;
    readonly configs: 0.2;
    readonly packageJsonFields: 0.1;
};
/**
 * 最小置信度阈值
 */
export declare const MIN_CONFIDENCE_THRESHOLD = 0.6;
/**
 * 库类型检测缓存配置
 */
export declare const DETECTION_CACHE_CONFIG: {
    readonly enabled: true;
    readonly ttl: number;
    readonly maxSize: 100;
};
/**
 * 库类型特定的文件扩展名
 */
export declare const LIBRARY_TYPE_EXTENSIONS: {
    readonly typescript: readonly [".ts", ".tsx", ".d.ts"];
    readonly style: readonly [".css", ".less", ".scss", ".sass", ".styl"];
    readonly vue2: readonly [".vue", ".ts", ".tsx", ".js", ".jsx"];
    readonly vue3: readonly [".vue", ".ts", ".tsx", ".js", ".jsx"];
    readonly react: readonly [".ts", ".tsx", ".js", ".jsx"];
    readonly svelte: readonly [".svelte", ".ts", ".js"];
    readonly solid: readonly [".ts", ".tsx", ".js", ".jsx"];
    readonly preact: readonly [".ts", ".tsx", ".js", ".jsx"];
    readonly lit: readonly [".ts", ".js", ".css"];
    readonly angular: readonly [".ts", ".html", ".css", ".scss"];
    readonly mixed: readonly [".ts", ".tsx", ".vue", ".css", ".less", ".scss", ".sass"];
};
/**
 * 库类型排除模式
 */
export declare const LIBRARY_TYPE_EXCLUDE_PATTERNS: {
    readonly common: readonly ["node_modules/**", "dist/**", "build/**", "**/*.test.*", "**/*.spec.*", "**/*.d.ts"];
    readonly typescript: readonly ["**/*.js", "**/*.jsx"];
    readonly style: readonly ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.vue"];
    readonly vue2: readonly [];
    readonly vue3: readonly [];
    readonly mixed: readonly [];
    readonly svelte: readonly [];
    readonly solid: readonly [];
    readonly preact: readonly [];
    readonly lit: readonly [];
    readonly angular: readonly [];
};
