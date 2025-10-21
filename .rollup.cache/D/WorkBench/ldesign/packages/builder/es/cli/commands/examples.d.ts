/**
 * examples 目录批量构建命令
 */
import { Command } from 'commander';
export declare const examplesCommand: Command;
export declare function findExampleProjects(root: string): Promise<Array<{
    name: string;
    path: string;
}>>;
export declare function runExample(binPath: string, cwd: string): Promise<void>;
