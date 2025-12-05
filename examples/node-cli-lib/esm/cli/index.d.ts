export interface CommandOptions {
    verbose?: boolean;
    config?: string;
    output?: string;
}
export interface Command {
    name: string;
    description: string;
    options?: CommandOptions;
    action: (args: string[], options: CommandOptions) => Promise<void>;
}
export declare class CLI {
    private commands;
    private logger;
    register(command: Command): this;
    run(args: string[]): Promise<void>;
    private parseOptions;
    private showHelp;
}
export declare function createCLI(): CLI;
//# sourceMappingURL=index.d.ts.map