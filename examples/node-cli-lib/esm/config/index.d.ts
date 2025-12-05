export interface Config {
    name?: string;
    version?: string;
    output?: string;
    plugins?: string[];
    options?: Record<string, any>;
}
export declare function loadConfig(configPath?: string): Config;
export declare function defineConfig(config: Config): Config;
//# sourceMappingURL=index.d.ts.map