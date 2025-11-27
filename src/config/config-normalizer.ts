/**
 * Configuration Normalizer
 * Detects and fixes common configuration issues
 */

import type { BuilderConfig } from '../types/config'
import { createLogger } from '../utils/logger'

const logger = createLogger({ prefix: 'ConfigNormalizer' })

export interface NormalizationWarning {
  type: 'duplicate' | 'redundant' | 'deprecated' | 'conflict'
  field: string
  message: string
  suggestion?: string
}

export interface NormalizationResult {
  config: BuilderConfig
  warnings: NormalizationWarning[]
  fixed: boolean
}

export class ConfigNormalizer {
  private warnings: NormalizationWarning[] = []

  /**
   * Normalize configuration and detect issues
   */
  normalize(config: BuilderConfig): NormalizationResult {
    this.warnings = []
    const normalized = { ...config }

    // Check for duplicate UMD configurations
    this.checkDuplicateUMD(normalized)

    // Check for redundant libraryType
    this.checkRedundantLibraryType(normalized)

    // Check for redundant TypeScript declaration settings
    this.checkRedundantTypeScriptDeclaration(normalized)

    // Check for conflicting entry points
    this.checkConflictingEntryPoints(normalized)

    // Merge duplicate configs if found
    const fixed = this.mergeDuplicateConfigs(normalized)

    return {
      config: normalized,
      warnings: this.warnings,
      fixed: this.warnings.length > 0 || fixed,
    }
  }

  /**
   * Check for duplicate UMD configurations
   */
  private checkDuplicateUMD(config: BuilderConfig): void {
    if (config.output?.umd && (config as any).umd) {
      this.warnings.push({
        type: 'duplicate',
        field: 'umd',
        message: 'Duplicate UMD configuration found in both output.umd and top-level umd',
        suggestion: 'Remove the top-level umd configuration and keep only output.umd',
      })
    }
  }

  /**
   * Check for redundant libraryType declaration
   */
  private checkRedundantLibraryType(config: BuilderConfig): void {
    if (config.libraryType === 'typescript') {
      this.warnings.push({
        type: 'redundant',
        field: 'libraryType',
        message: 'libraryType: "typescript" is auto-detected and can be removed',
        suggestion: 'Remove libraryType field from config',
      })
    }
  }

  /**
   * Check for redundant TypeScript declaration settings
   */
  private checkRedundantTypeScriptDeclaration(config: BuilderConfig): void {
    if (config.dts && config.typescript?.declaration) {
      this.warnings.push({
        type: 'redundant',
        field: 'typescript.declaration',
        message: 'typescript.declaration is redundant when dts: true is set',
        suggestion: 'Remove typescript.declaration and typescript.declarationMap',
      })
    }
  }

  /**
   * Check for conflicting entry points
   */
  private checkConflictingEntryPoints(config: BuilderConfig): void {
    const umdOutput = config.output?.umd
    const umdOutputEntry = typeof umdOutput === 'object' && umdOutput ? (umdOutput as any).entry : undefined
    const topLevelUmdEntry = (config as any).umd?.entry

    if (umdOutputEntry && topLevelUmdEntry && umdOutputEntry !== topLevelUmdEntry) {
      this.warnings.push({
        type: 'conflict',
        field: 'umd.entry',
        message: `Conflicting UMD entry points: output.umd.entry="${umdOutputEntry}" vs umd.entry="${topLevelUmdEntry}"`,
        suggestion: 'Keep only output.umd.entry configuration',
      })
    }
  }

  /**
   * Merge duplicate configurations
   */
  private mergeDuplicateConfigs(config: BuilderConfig): boolean {
    let fixed = false

    // Merge duplicate UMD configs
    const outputUmd = config.output?.umd
    if (typeof outputUmd === 'object' && outputUmd && (config as any).umd) {
      const topLevelUmd = (config as any).umd

      // Merge properties from top-level to output if not already set
      if (topLevelUmd.entry && !(outputUmd as any).entry) {
        (outputUmd as any).entry = topLevelUmd.entry
      }
      if (topLevelUmd.name && !outputUmd.name) {
        (outputUmd as any).name = topLevelUmd.name
      }
      if (topLevelUmd.enabled !== undefined && (outputUmd as any).enabled === undefined) {
        (outputUmd as any).enabled = topLevelUmd.enabled
      }

      // Remove top-level UMD config
      delete (config as any).umd
      fixed = true
    }

    return fixed
  }

  /**
   * Print warnings to console
   */
  printWarnings(): void {
    if (this.warnings.length === 0) {
      return
    }

    logger.warn(`\n⚠️  Configuration issues detected:\n`)

    this.warnings.forEach((warning, index) => {
      logger.warn(`${index + 1}. [${warning.type.toUpperCase()}] ${warning.field}`)
      logger.warn(`   ${warning.message}`)
      if (warning.suggestion) {
        logger.info(`   💡 ${warning.suggestion}`)
      }
      logger.warn('')
    })
  }
}

/**
 * Factory function to create a ConfigNormalizer
 */
export function createConfigNormalizer(): ConfigNormalizer {
  return new ConfigNormalizer()
}

/**
 * Normalize a configuration and return the result
 */
export function normalizeConfig(config: BuilderConfig, verbose = true): NormalizationResult {
  const normalizer = createConfigNormalizer()
  const result = normalizer.normalize(config)

  if (verbose && result.warnings.length > 0) {
    normalizer.printWarnings()
  }

  return result
}


