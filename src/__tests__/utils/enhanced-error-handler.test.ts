/**
 * 增强错误处理器测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createEnhancedErrorHandler, EnhancedErrorHandler } from '../../utils/enhanced-error-handler'
import { ErrorType } from '../../utils/friendly-error-handler'

describe('EnhancedErrorHandler', () => {
  let handler: EnhancedErrorHandler

  beforeEach(() => {
    handler = createEnhancedErrorHandler({
      enabled: true,
      autoFix: false
    })
  })

  it('should create handler instance', () => {
    expect(handler).toBeDefined()
  })

  it('should detect missing esbuild', () => {
    const error = handler.handle('Cannot find module "esbuild"')
    expect(error.type).toBe(ErrorType.MISSING_DEPENDENCY)
    expect(error.solutions.length).toBeGreaterThan(0)
  })

  it('should detect vue version mismatch', () => {
    const error = handler.handle('Vue version mismatch detected')
    expect(error.type).toBe(ErrorType.VERSION_CONFLICT)
  })

  it('should detect typescript decorators', () => {
    const error = handler.handle('Enable experimentalDecorators to use decorators')
    expect(error.type).toBe(ErrorType.CONFIG_ERROR)
  })

  it('should detect circular dependency', () => {
    const error = handler.handle('Circular dependency detected')
    expect(error.type).toBe(ErrorType.BUILD_ERROR)
  })

  it('should track error stats', () => {
    handler.handle('Cannot find module "esbuild"')
    handler.handle('Cannot find module "swc"')

    const stats = handler.getStats()
    expect(stats.total).toBe(2)
    expect(stats.byType[ErrorType.MISSING_DEPENDENCY]).toBe(2)
  })

  it('should maintain error history', () => {
    const error1 = new Error('Test error 1')
    const error2 = new Error('Test error 2')

    handler.handle(error1)
    handler.handle(error2)

    const history = handler.getHistory()
    expect(history.length).toBe(2)
  })

  it('should clear history', () => {
    handler.handle('Test error')
    handler.clearHistory()

    const stats = handler.getStats()
    expect(stats.total).toBe(0)
  })
})

