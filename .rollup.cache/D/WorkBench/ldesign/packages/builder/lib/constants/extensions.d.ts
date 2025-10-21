/**
 * 文件扩展名相关常量
 */
/**
 * 支持的文件扩展名
 */
export declare const SUPPORTED_EXTENSIONS: {
    readonly javascript: readonly [".js", ".mjs", ".cjs"];
    readonly typescript: readonly [".ts", ".tsx", ".d.ts"];
    readonly jsx: readonly [".jsx", ".tsx"];
    readonly vue: readonly [".vue"];
    readonly styles: readonly [".css", ".less", ".scss", ".sass", ".styl", ".stylus"];
    readonly config: readonly [".json", ".js", ".ts", ".mjs"];
    readonly assets: readonly [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"];
    readonly fonts: readonly [".woff", ".woff2", ".eot", ".ttf", ".otf"];
    readonly docs: readonly [".md", ".mdx", ".txt"];
    readonly data: readonly [".json", ".yaml", ".yml", ".toml", ".xml"];
};
/**
 * 文件类型映射
 */
export declare const EXTENSION_TO_TYPE: {
    readonly '.js': "javascript";
    readonly '.mjs': "javascript";
    readonly '.cjs': "javascript";
    readonly '.ts': "typescript";
    readonly '.tsx': "typescript";
    readonly '.d.ts': "typescript-declaration";
    readonly '.jsx': "jsx";
    readonly '.vue': "vue";
    readonly '.css': "css";
    readonly '.less': "less";
    readonly '.scss': "scss";
    readonly '.sass': "sass";
    readonly '.styl': "stylus";
    readonly '.stylus': "stylus";
    readonly '.json': "json";
    readonly '.png': "image";
    readonly '.jpg': "image";
    readonly '.jpeg': "image";
    readonly '.gif': "image";
    readonly '.svg': "svg";
    readonly '.webp': "image";
    readonly '.ico': "icon";
    readonly '.woff': "font";
    readonly '.woff2': "font";
    readonly '.eot': "font";
    readonly '.ttf': "font";
    readonly '.otf': "font";
    readonly '.md': "markdown";
    readonly '.mdx': "mdx";
    readonly '.txt': "text";
    readonly '.yaml': "yaml";
    readonly '.yml': "yaml";
    readonly '.toml': "toml";
    readonly '.xml': "xml";
};
/**
 * 加载器映射
 */
export declare const EXTENSION_TO_LOADER: {
    readonly '.js': "js";
    readonly '.mjs': "js";
    readonly '.cjs': "js";
    readonly '.ts': "ts";
    readonly '.tsx': "tsx";
    readonly '.jsx': "jsx";
    readonly '.vue': "vue";
    readonly '.css': "css";
    readonly '.less': "less";
    readonly '.scss': "scss";
    readonly '.sass': "sass";
    readonly '.styl': "stylus";
    readonly '.stylus': "stylus";
    readonly '.json': "json";
    readonly '.png': "file";
    readonly '.jpg': "file";
    readonly '.jpeg': "file";
    readonly '.gif': "file";
    readonly '.svg': "svg";
    readonly '.webp': "file";
    readonly '.ico': "file";
    readonly '.woff': "file";
    readonly '.woff2': "file";
    readonly '.eot': "file";
    readonly '.ttf': "file";
    readonly '.otf': "file";
    readonly '.md': "text";
    readonly '.txt': "text";
};
/**
 * 入口文件优先级
 */
export declare const ENTRY_FILE_PRIORITY: readonly ["index.ts", "index.tsx", "index.js", "index.jsx", "index.vue", "main.ts", "main.tsx", "main.js", "main.jsx", "src/index.ts", "src/index.tsx", "src/index.js", "src/index.jsx", "src/main.ts", "src/main.tsx", "src/main.js", "src/main.jsx", "lib/index.ts", "lib/index.js"];
/**
 * 配置文件优先级
 */
export declare const CONFIG_FILE_PRIORITY: readonly ["builder.config.ts", "builder.config.js", "builder.config.mjs", "builder.config.json", ".builderrc.ts", ".builderrc.js", ".builderrc.json", "package.json"];
/**
 * TypeScript 配置文件
 */
export declare const TYPESCRIPT_CONFIG_FILES: readonly ["tsconfig.json", "tsconfig.build.json", "tsconfig.lib.json", "tsconfig.prod.json"];
/**
 * 样式配置文件
 */
export declare const STYLE_CONFIG_FILES: readonly ["postcss.config.js", "postcss.config.ts", "postcss.config.json", ".postcssrc", ".postcssrc.js", ".postcssrc.json", "tailwind.config.js", "tailwind.config.ts", ".stylelintrc", ".stylelintrc.js", ".stylelintrc.json"];
/**
 * Vue 配置文件
 */
export declare const VUE_CONFIG_FILES: readonly ["vue.config.js", "vue.config.ts", "vite.config.js", "vite.config.ts"];
/**
 * 忽略的文件模式
 */
export declare const IGNORE_PATTERNS: readonly ["node_modules/**", "dist/**", "build/**", "lib/**", "es/**", "cjs/**", "umd/**", ".cache/**", ".temp/**", ".tmp/**", "**/*.test.*", "**/*.spec.*", "**/__tests__/**", "**/__mocks__/**", "test/**", "tests/**", "*.config.*", ".*rc.*", "*.md", "docs/**", ".git/**", ".svn/**", ".hg/**", "coverage/**", "*.log"];
/**
 * 包含的文件模式
 */
export declare const INCLUDE_PATTERNS: {
    readonly typescript: readonly ["src/**/*.ts", "src/**/*.tsx", "lib/**/*.ts", "lib/**/*.tsx"];
    readonly javascript: readonly ["src/**/*.js", "src/**/*.jsx", "src/**/*.mjs", "lib/**/*.js", "lib/**/*.jsx"];
    readonly vue: readonly ["src/**/*.vue", "components/**/*.vue", "lib/**/*.vue"];
    readonly styles: readonly ["src/**/*.css", "src/**/*.less", "src/**/*.scss", "src/**/*.sass", "src/**/*.styl", "styles/**/*"];
    readonly assets: readonly ["src/assets/**/*", "assets/**/*", "public/**/*"];
};
/**
 * 文件大小限制
 */
export declare const FILE_SIZE_LIMITS: {
    readonly source: number;
    readonly config: number;
    readonly style: number;
    readonly asset: number;
    readonly font: number;
    readonly image: number;
};
/**
 * 文件编码检测
 */
export declare const ENCODING_DETECTION: {
    readonly text: readonly ["utf8", "utf-8", "ascii"];
    readonly binary: readonly ["binary", "base64"];
    readonly default: "utf8";
};
/**
 * 文件 MIME 类型
 */
export declare const MIME_TYPES: {
    readonly '.js': "application/javascript";
    readonly '.mjs': "application/javascript";
    readonly '.ts': "application/typescript";
    readonly '.tsx': "application/typescript";
    readonly '.jsx': "application/javascript";
    readonly '.vue': "text/x-vue";
    readonly '.css': "text/css";
    readonly '.less': "text/less";
    readonly '.scss': "text/scss";
    readonly '.sass': "text/sass";
    readonly '.json': "application/json";
    readonly '.md': "text/markdown";
    readonly '.html': "text/html";
    readonly '.xml': "application/xml";
    readonly '.svg': "image/svg+xml";
    readonly '.png': "image/png";
    readonly '.jpg': "image/jpeg";
    readonly '.jpeg': "image/jpeg";
    readonly '.gif': "image/gif";
    readonly '.webp': "image/webp";
    readonly '.woff': "font/woff";
    readonly '.woff2': "font/woff2";
    readonly '.ttf': "font/ttf";
    readonly '.otf': "font/otf";
};
