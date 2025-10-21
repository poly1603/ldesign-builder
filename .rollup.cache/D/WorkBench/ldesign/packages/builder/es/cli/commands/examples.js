/**
 * examples 目录批量构建命令
 */
import { Command } from 'commander';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';
// ES 模块下的 __dirname，兼容 CJS
const getFilename = () => {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
        return fileURLToPath(import.meta.url);
    }
    // CJS 环境下的 fallback
    return typeof __filename !== 'undefined' ? __filename : '';
};
const getDirname = (filename) => {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
        return dirname(filename);
    }
    // CJS 环境下的 fallback
    return typeof __dirname !== 'undefined' ? __dirname : '';
};
const __filename = getFilename();
const __dirname = getDirname(__filename);
export const examplesCommand = new Command('examples')
    .description('构建当前工作目录下的 examples 目录中的所有示例项目')
    .option('--root <path>', 'examples 根目录（相对当前工作目录）', 'examples')
    .option('--filter <keyword>', '仅构建名称包含关键字的示例')
    .option('--concurrency <n>', '并发构建数（默认串行）', (v) => parseInt(v, 10), 1)
    .action(async (options) => {
    const root = join(process.cwd(), options.root || 'examples');
    const examples = await findExampleProjects(root);
    const selected = options.filter
        ? examples.filter((p) => p.name.includes(options.filter))
        : examples;
    if (selected.length === 0) {
        console.log(chalk.yellow(`未找到示例项目，root: ${root}`));
        return;
    }
    console.log(chalk.cyan(`即将构建 ${selected.length} 个示例项目...`));
    // 使用绝对路径到 bin 文件（dist/cli -> ../../bin）
    const binPath = join(__dirname, '../../bin/ldesign-builder.js');
    const queue = [...selected];
    const running = [];
    const concurrency = Math.max(1, options.concurrency || 1);
    const runNext = async () => {
        const item = queue.shift();
        if (!item)
            return;
        await runExample(binPath, item.path);
        await runNext();
    };
    for (let i = 0; i < concurrency; i++) {
        running.push(runNext());
    }
    await Promise.all(running);
    console.log(chalk.green('全部示例构建完成'));
});
export async function findExampleProjects(root) {
    const list = [];
    try {
        const items = await fs.readdir(root);
        for (const name of items) {
            const full = join(root, name);
            try {
                const stat = await fs.stat(full);
                if (stat.isDirectory()) {
                    // 判断是否为一个示例项目：存在 package.json
                    const pkg = join(full, 'package.json');
                    try {
                        await fs.access(pkg);
                        list.push({ name, path: full });
                    }
                    catch {
                        // 非项目，忽略
                    }
                }
            }
            catch {
                // ignore
            }
        }
    }
    catch {
        // ignore
    }
    return list;
}
export async function runExample(binPath, cwd) {
    console.log(chalk.gray(`\n[example] ${cwd}`));
    await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [binPath, 'build'], {
            cwd,
            stdio: 'inherit',
            env: process.env,
        });
        child.on('close', (code) => {
            if (code === 0)
                return resolve();
            reject(new Error(`构建失败（退出码 ${code}）: ${cwd}`));
        });
        child.on('error', (err) => reject(err));
    });
}
//# sourceMappingURL=examples.js.map