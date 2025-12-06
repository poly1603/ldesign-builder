/**
 * 构建配置预设管理
 * 
 * 支持保存和切换不同的构建配置预设
 */

import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import type { BuilderConfig } from '../types/config'

// ========== 类型定义 ==========

export interface BuildProfile {
  name: string
  description?: string
  config: Partial<BuilderConfig>
  createdAt: number
  updatedAt: number
  isDefault?: boolean
  tags?: string[]
}

export interface ProfilesConfig {
  activeProfile: string
  profiles: BuildProfile[]
}

// ========== 内置预设 ==========

const BUILTIN_PROFILES: BuildProfile[] = [
  {
    name: 'development',
    description: '开发模式 - 快速构建，无压缩',
    config: {
      mode: 'development',
      minify: false,
      sourcemap: true,
      clean: false
    },
    createdAt: 0,
    updatedAt: 0,
    tags: ['development', 'fast']
  },
  {
    name: 'production',
    description: '生产模式 - 完整优化',
    config: {
      mode: 'production',
      minify: true,
      sourcemap: false,
      clean: true
    },
    createdAt: 0,
    updatedAt: 0,
    isDefault: true,
    tags: ['production', 'optimized']
  },
  {
    name: 'production-debug',
    description: '生产模式 + 调试信息',
    config: {
      mode: 'production',
      minify: true,
      sourcemap: true,
      clean: true
    },
    createdAt: 0,
    updatedAt: 0,
    tags: ['production', 'debug']
  },
  {
    name: 'library',
    description: '库模式 - ESM + CJS 双格式',
    config: {
      output: {
        format: ['esm', 'cjs']
      },
      dts: true,
      sourcemap: true,
      minify: false,
      external: []
    },
    createdAt: 0,
    updatedAt: 0,
    tags: ['library']
  },
  {
    name: 'library-umd',
    description: '库模式 - 包含 UMD 格式',
    config: {
      output: {
        format: ['esm', 'cjs', 'umd']
      },
      dts: true,
      sourcemap: true,
      minify: true
    },
    createdAt: 0,
    updatedAt: 0,
    tags: ['library', 'umd', 'browser']
  },
  {
    name: 'ci',
    description: 'CI/CD 模式 - 严格检查',
    config: {
      mode: 'production',
      minify: true,
      sourcemap: false,
      clean: true
    },
    createdAt: 0,
    updatedAt: 0,
    tags: ['ci', 'strict']
  },
  {
    name: 'analyze',
    description: '分析模式 - 生成详细报告',
    config: {
      mode: 'production',
      minify: true,
      sourcemap: true
    },
    createdAt: 0,
    updatedAt: 0,
    tags: ['analyze', 'report']
  }
]

// ========== 构建配置预设管理类 ==========

export class BuildProfiles {
  private projectPath: string
  private configPath: string
  private data: ProfilesConfig

  constructor(projectPath: string) {
    this.projectPath = projectPath
    this.configPath = resolve(projectPath, '.ldesign', 'profiles.json')
    this.data = this.loadConfig()
  }

  /**
   * 加载配置
   */
  private loadConfig(): ProfilesConfig {
    if (existsSync(this.configPath)) {
      try {
        const saved = JSON.parse(readFileSync(this.configPath, 'utf-8'))
        return {
          activeProfile: saved.activeProfile || 'production',
          profiles: [...BUILTIN_PROFILES, ...(saved.profiles || [])]
        }
      } catch {}
    }
    
    return {
      activeProfile: 'production',
      profiles: [...BUILTIN_PROFILES]
    }
  }

  /**
   * 保存配置
   */
  private saveConfig(): void {
    const dir = resolve(this.projectPath, '.ldesign')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    // 只保存自定义预设
    const customProfiles = this.data.profiles.filter(p => 
      !BUILTIN_PROFILES.some(b => b.name === p.name)
    )
    
    writeFileSync(this.configPath, JSON.stringify({
      activeProfile: this.data.activeProfile,
      profiles: customProfiles
    }, null, 2))
  }

  /**
   * 获取所有预设
   */
  getProfiles(): BuildProfile[] {
    return this.data.profiles
  }

  /**
   * 获取预设
   */
  getProfile(name: string): BuildProfile | undefined {
    return this.data.profiles.find(p => p.name === name)
  }

  /**
   * 获取当前激活的预设
   */
  getActiveProfile(): BuildProfile | undefined {
    return this.getProfile(this.data.activeProfile)
  }

  /**
   * 获取激活的预设名称
   */
  getActiveProfileName(): string {
    return this.data.activeProfile
  }

  /**
   * 设置激活的预设
   */
  setActiveProfile(name: string): boolean {
    const profile = this.getProfile(name)
    if (!profile) return false
    
    this.data.activeProfile = name
    this.saveConfig()
    return true
  }

  /**
   * 创建预设
   */
  createProfile(profile: Omit<BuildProfile, 'createdAt' | 'updatedAt'>): BuildProfile {
    // 检查名称是否已存在
    if (this.getProfile(profile.name)) {
      throw new Error(`预设 "${profile.name}" 已存在`)
    }

    // 检查是否与内置预设同名
    if (BUILTIN_PROFILES.some(p => p.name === profile.name)) {
      throw new Error(`不能使用内置预设名称 "${profile.name}"`)
    }

    const newProfile: BuildProfile = {
      ...profile,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.data.profiles.push(newProfile)
    this.saveConfig()
    return newProfile
  }

  /**
   * 更新预设
   */
  updateProfile(name: string, updates: Partial<Omit<BuildProfile, 'name' | 'createdAt'>>): BuildProfile | null {
    const index = this.data.profiles.findIndex(p => p.name === name)
    if (index === -1) return null

    // 不能修改内置预设
    if (BUILTIN_PROFILES.some(p => p.name === name)) {
      throw new Error(`不能修改内置预设 "${name}"`)
    }

    this.data.profiles[index] = {
      ...this.data.profiles[index],
      ...updates,
      updatedAt: Date.now()
    }

    this.saveConfig()
    return this.data.profiles[index]
  }

  /**
   * 删除预设
   */
  deleteProfile(name: string): boolean {
    // 不能删除内置预设
    if (BUILTIN_PROFILES.some(p => p.name === name)) {
      throw new Error(`不能删除内置预设 "${name}"`)
    }

    const index = this.data.profiles.findIndex(p => p.name === name)
    if (index === -1) return false

    this.data.profiles.splice(index, 1)
    
    // 如果删除的是当前激活的预设，切换到默认
    if (this.data.activeProfile === name) {
      this.data.activeProfile = 'production'
    }
    
    this.saveConfig()
    return true
  }

  /**
   * 复制预设
   */
  duplicateProfile(sourceName: string, newName: string): BuildProfile {
    const source = this.getProfile(sourceName)
    if (!source) {
      throw new Error(`预设 "${sourceName}" 不存在`)
    }

    return this.createProfile({
      name: newName,
      description: `${source.description} (副本)`,
      config: { ...source.config },
      tags: source.tags ? [...source.tags] : []
    })
  }

  /**
   * 从当前配置创建预设
   */
  createFromConfig(name: string, config: Partial<BuilderConfig>, description?: string): BuildProfile {
    return this.createProfile({
      name,
      description,
      config,
      tags: []
    })
  }

  /**
   * 应用预设到配置
   */
  applyProfile(baseConfig: Partial<BuilderConfig>, profileName?: string): Partial<BuilderConfig> {
    const name = profileName || this.data.activeProfile
    const profile = this.getProfile(name)
    
    if (!profile) {
      return baseConfig
    }

    return this.deepMerge(baseConfig, profile.config)
  }

  /**
   * 深度合并配置
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * 按标签搜索预设
   */
  searchByTag(tag: string): BuildProfile[] {
    return this.data.profiles.filter(p => 
      p.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    )
  }

  /**
   * 导出预设
   */
  exportProfile(name: string): string {
    const profile = this.getProfile(name)
    if (!profile) {
      throw new Error(`预设 "${name}" 不存在`)
    }
    return JSON.stringify(profile, null, 2)
  }

  /**
   * 导入预设
   */
  importProfile(json: string, newName?: string): BuildProfile {
    const data = JSON.parse(json)
    
    if (!data.name || !data.config) {
      throw new Error('无效的预设格式')
    }

    const name = newName || data.name
    
    // 如果名称已存在，添加后缀
    let finalName = name
    let counter = 1
    while (this.getProfile(finalName)) {
      finalName = `${name}-${counter++}`
    }

    return this.createProfile({
      name: finalName,
      description: data.description,
      config: data.config,
      tags: data.tags
    })
  }

  /**
   * 获取内置预设列表
   */
  getBuiltinProfiles(): BuildProfile[] {
    return BUILTIN_PROFILES
  }

  /**
   * 获取自定义预设列表
   */
  getCustomProfiles(): BuildProfile[] {
    return this.data.profiles.filter(p => 
      !BUILTIN_PROFILES.some(b => b.name === p.name)
    )
  }
}

/**
 * 创建构建配置预设管理实例
 */
export function createBuildProfiles(projectPath: string): BuildProfiles {
  return new BuildProfiles(projectPath)
}
