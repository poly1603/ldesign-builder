#!/usr/bin/env node
/**
 * @ldesign/builder CLI 主入口
 *
 * 提供命令行接口来使用 @ldesign/builder
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { Command } from 'commander';
/**
 * 创建 CLI 程序
 */
declare function createCLI(): Command;
/**
 * 主函数
 */
declare function main(): Promise<void>;
export declare class BuilderCLI {
    static createSimpleCLI(): Promise<void>;
}
export { createCLI, main };
