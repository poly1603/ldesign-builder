/**
 * 配置 Hook
 */
import { computed, inject, ref } from 'vue'

const PREFIX = 't'

export const ConfigProviderKey = Symbol('TConfigProvider')

export function usePrefixClass(componentName?: string) {
  const config = inject(ConfigProviderKey, { prefix: PREFIX })
  return computed(() => {
    const prefix = (config as any).prefix || PREFIX
    return componentName ? `${prefix}-${componentName}` : prefix
  })
}

export function useConfig() {
  const config = inject(ConfigProviderKey, { prefix: PREFIX })
  return { config, prefix: ref((config as any).prefix || PREFIX) }
}
