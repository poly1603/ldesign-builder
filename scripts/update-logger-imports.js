/**
 * 更新 logger 导入路径的脚本
 * 
 * 将所有 from './utils/logger' 或 from '../utils/logger' 等
 * 更新为 from './utils/logger/index' 或 from '../utils/logger/index'
 */

const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '../src')

// 需要更新的导入模式
const patterns = [
  {
    // 匹配: from './utils/logger' 或 from '../utils/logger' 等
    regex: /from\s+(['"])(\.\.\/)*(utils\/logger)(['"])/g,
    replacement: (match, quote1, dots, importPath, quote2) => {
      return `from ${quote1}${dots || ''}${importPath}/index${quote2}`
    }
  },
  {
    // 匹配: from '../../utils/logger'
    regex: /from\s+(['"])(\.\.\/)+utils\/logger(['"])/g,
    replacement: (match, quote1, dots, quote2) => {
      return `from ${quote1}${dots}utils/logger/index${quote2}`
    }
  }
]

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  let updated = content
  let changed = false

  for (const pattern of patterns) {
    const newContent = updated.replace(pattern.regex, pattern.replacement)
    if (newContent !== updated) {
      updated = newContent
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, updated, 'utf-8')
    console.log(`✓ 更新: ${path.relative(srcDir, filePath)}`)
    return true
  }

  return false
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)
  let count = 0

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      count += walkDir(filePath)
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (updateFile(filePath)) {
        count++
      }
    }
  }

  return count
}

console.log('开始更新 logger 导入路径...\n')
const count = walkDir(srcDir)
console.log(`\n完成！共更新 ${count} 个文件`)

