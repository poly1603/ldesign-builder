/**
 * 多层缓存系统测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMultilayerCache, MultilayerCache } from '../../utils/multilayer-cache'

describe('MultilayerCache', () => {
  let cache: MultilayerCache

  beforeEach(() => {
    cache = createMultilayerCache({
      l1: { enabled: true, maxSize: 1024 * 1024 },
      l2: { enabled: false },
      l3: { enabled: false }
    })
  })

  afterEach(async () => {
    await cache.dispose()
  })

  it('should create cache instance', () => {
    expect(cache).toBeDefined()
  })

  it('should set and get value', async () => {
    await cache.set('test-key', 'test-value')
    const result = await cache.get('test-key')
    expect(result).toBe('test-value')
  })

  it('should return null for non-existent key', async () => {
    const result = await cache.get('non-existent')
    expect(result).toBeNull()
  })

  it('should delete value', async () => {
    await cache.set('test-key', 'test-value')
    await cache.delete('test-key')
    const result = await cache.get('test-key')
    expect(result).toBeNull()
  })

  it('should clear all cache', async () => {
    await cache.set('key1', 'value1')
    await cache.set('key2', 'value2')
    await cache.clear()

    expect(await cache.get('key1')).toBeNull()
    expect(await cache.get('key2')).toBeNull()
  })

  it('should track stats', async () => {
    await cache.set('key1', 'value1')
    await cache.get('key1')  // hit
    await cache.get('key2')  // miss

    const stats = cache.getStats()
    expect(stats.overall.hits).toBeGreaterThan(0)
    expect(stats.overall.misses).toBeGreaterThan(0)
  })
})

