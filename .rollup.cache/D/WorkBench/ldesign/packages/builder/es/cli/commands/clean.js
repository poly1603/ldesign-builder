/**
 * 清理命令实现
 */
import { Command } from 'commander';
export const cleanCommand = new Command('clean')
    .description('清理构建输出')
    .action(async () => {
    console.log('清理命令暂未实现');
});
//# sourceMappingURL=clean.js.map