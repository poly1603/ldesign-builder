/**
 * Changelog 生成器
 * 
 * 从 Git 提交历史自动生成 CHANGELOG
 */

import { Command } from 'commander'
import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface ChangelogOptions {
  from?: string
  to?: string
  output?: string
  preset?: 'angular' | 'conventional' | 'simple'
  append?: boolean
}

interface Commit {
  hash: string
  shortHash: string
  subject: string
  body: string
  author: string
  date: string
  type?: string
  scope?: string
  breaking?: boolean
}

interface ChangelogSection {
  type: string
  title: string
  icon: string
  commits: Commit[]
}

// ========== 提交类型映射 ==========

const COMMIT_TYPES: Record<string, { title: string; icon: string; order: number }> = {
  feat: { title: '✨ 新功能', icon: '✨', order: 1 },
  fix: { title: '🐛 Bug 修复', icon: '🐛', order: 2 },
  perf: { title: '⚡ 性能优化', icon: '⚡', order: 3 },
  refactor: { title: '♻️ 代码重构', icon: '♻️', order: 4 },
  docs: { title: '📚 文档更新', icon: '📚', order: 5 },
  style: { title: '💄 代码格式', icon: '💄', order: 6 },
  test: { title: '✅ 测试', icon: '✅', order: 7 },
  build: { title: '📦 构建相关', icon: '📦', order: 8 },
  ci: { title: '👷 CI/CD', icon: '👷', order: 9 },
  chore: { title: '🔧 其他更改', icon: '🔧', order: 10 },
  revert: { title: '⏪ 回滚', icon: '⏪', order: 11 },
}

// ========== Git 操作 ==========

function getGitLog(from?: string, to?: string): string {
  const range = from && to ? `${from}..${to}` : from ? `${from}..HEAD` : ''
  const format = '%H|%h|%s|%b|%an|%ai'
  
  try {
    const cmd = range 
      ? `git log ${range} --pretty=format:"${format}" --no-merges`
      : `git log --pretty=format:"${format}" --no-merges -n 100`
    
    return execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
  } catch (error) {
    logger.error('获取 Git 日志失败:', error)
    return ''
  }
}

function getLatestTag(): string | null {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim()
  } catch {
    return null
  }
}

function getAllTags(): string[] {
  try {
    const output = execSync('git tag --sort=-version:refname', { encoding: 'utf-8' })
    return output.split('\n').filter(Boolean)
  } catch {
    return []
  }
}

function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'main'
  }
}

// ========== 解析提交 ==========

function parseCommits(gitLog: string): Commit[] {
  if (!gitLog.trim()) return []
  
  const commits: Commit[] = []
  const lines = gitLog.split('\n').filter(Boolean)
  
  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length < 6) continue
    
    const [hash, shortHash, subject, body, author, date] = parts
    
    // 解析 conventional commit 格式
    const conventionalMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/)
    
    const commit: Commit = {
      hash,
      shortHash,
      subject,
      body,
      author,
      date: date.split(' ')[0],
      type: conventionalMatch?.[1]?.toLowerCase(),
      scope: conventionalMatch?.[2],
      breaking: conventionalMatch?.[3] === '!' || body.includes('BREAKING CHANGE')
    }
    
    commits.push(commit)
  }
  
  return commits
}

// ========== 分类提交 ==========

function categorizeCommits(commits: Commit[]): ChangelogSection[] {
  const sections: Map<string, ChangelogSection> = new Map()
  
  // 初始化所有类型
  for (const [type, config] of Object.entries(COMMIT_TYPES)) {
    sections.set(type, {
      type,
      title: config.title,
      icon: config.icon,
      commits: []
    })
  }
  
  // 未分类
  sections.set('other', {
    type: 'other',
    title: '📝 其他',
    icon: '📝',
    commits: []
  })
  
  // 分类提交
  for (const commit of commits) {
    const type = commit.type && sections.has(commit.type) ? commit.type : 'other'
    sections.get(type)!.commits.push(commit)
  }
  
  // 过滤空类型并排序
  return Array.from(sections.values())
    .filter(s => s.commits.length > 0)
    .sort((a, b) => {
      const orderA = COMMIT_TYPES[a.type]?.order || 99
      const orderB = COMMIT_TYPES[b.type]?.order || 99
      return orderA - orderB
    })
}

// ========== 生成 Changelog ==========

function generateChangelog(
  commits: Commit[],
  version: string,
  date: string,
  preset: string
): string {
  const sections = categorizeCommits(commits)
  const lines: string[] = []
  
  // 标题
  lines.push(`## [${version}] - ${date}`)
  lines.push('')
  
  // Breaking Changes
  const breakingCommits = commits.filter(c => c.breaking)
  if (breakingCommits.length > 0) {
    lines.push('### ⚠️ BREAKING CHANGES')
    lines.push('')
    for (const commit of breakingCommits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : ''
      lines.push(`- ${scope}${commit.subject} (${commit.shortHash})`)
    }
    lines.push('')
  }
  
  // 各类型提交
  for (const section of sections) {
    lines.push(`### ${section.title}`)
    lines.push('')
    
    for (const commit of section.commits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : ''
      const message = commit.type 
        ? commit.subject.replace(/^\w+(\([^)]+\))?!?:\s*/, '')
        : commit.subject
      lines.push(`- ${scope}${message} (${commit.shortHash})`)
    }
    lines.push('')
  }
  
  return lines.join('\n')
}

function generateSimpleChangelog(commits: Commit[], version: string, date: string): string {
  const lines: string[] = []
  
  lines.push(`## ${version} (${date})`)
  lines.push('')
  
  for (const commit of commits) {
    lines.push(`- ${commit.subject} (${commit.shortHash})`)
  }
  lines.push('')
  
  return lines.join('\n')
}

// ========== 执行生成 ==========

async function runChangelogGenerate(projectPath: string, options: ChangelogOptions): Promise<void> {
  console.log('')
  console.log('📝 生成 Changelog...')
  console.log('')

  // 确定版本范围
  let fromRef = options.from
  let toRef = options.to || 'HEAD'
  
  if (!fromRef) {
    const latestTag = getLatestTag()
    if (latestTag) {
      fromRef = latestTag
      console.log(`  从最新 tag 开始: ${latestTag}`)
    } else {
      console.log('  未找到 tag，将获取最近 100 条提交')
    }
  }

  // 获取提交
  const gitLog = getGitLog(fromRef, toRef)
  const commits = parseCommits(gitLog)
  
  if (commits.length === 0) {
    console.log('  没有找到提交记录')
    return
  }
  
  console.log(`  找到 ${commits.length} 条提交`)

  // 获取版本号
  const pkgPath = resolve(projectPath, 'package.json')
  let version = 'Unreleased'
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    version = pkg.version || version
  }
  
  const date = new Date().toISOString().split('T')[0]

  // 生成内容
  let content: string
  if (options.preset === 'simple') {
    content = generateSimpleChangelog(commits, version, date)
  } else {
    content = generateChangelog(commits, version, date, options.preset || 'angular')
  }

  // 输出
  const outputFile = options.output || 'CHANGELOG.md'
  const outputPath = resolve(projectPath, outputFile)
  
  if (options.append && existsSync(outputPath)) {
    // 追加到现有文件
    const existing = readFileSync(outputPath, 'utf-8')
    const header = '# Changelog\n\n'
    const newContent = existing.startsWith('# Changelog')
      ? existing.replace('# Changelog\n\n', header + content)
      : header + content + '\n' + existing
    
    writeFileSync(outputPath, newContent)
    logger.success(`已追加到: ${outputFile}`)
  } else {
    // 创建新文件
    const header = '# Changelog\n\n所有重要更改都将记录在此文件中。\n\n'
    writeFileSync(outputPath, header + content)
    logger.success(`已生成: ${outputFile}`)
  }

  // 预览
  console.log('')
  console.log('─'.repeat(50))
  console.log(content)
  console.log('─'.repeat(50))
}

// ========== 命令定义 ==========

export const changelogCommand = new Command('changelog')
  .description('从 Git 提交生成 Changelog')
  .option('--from <ref>', '起始 Git 引用 (tag/commit)')
  .option('--to <ref>', '结束 Git 引用', 'HEAD')
  .option('-o, --output <file>', '输出文件', 'CHANGELOG.md')
  .option('-p, --preset <preset>', '预设格式 (angular|conventional|simple)', 'angular')
  .option('-a, --append', '追加到现有文件')
  .action(async (options: ChangelogOptions) => {
    try {
      await runChangelogGenerate(process.cwd(), options)
    } catch (error) {
      logger.error('生成失败:', error)
      process.exit(1)
    }
  })

export function registerChangelogCommand(program: Command): void {
  program.addCommand(changelogCommand)
}
