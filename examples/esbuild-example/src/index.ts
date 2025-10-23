/**
 * esbuild 示例入口
 */

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function add(a: number, b: number): number {
  return a + b
}

export const version = '1.0.0'

export default {
  greet,
  add,
  version
}


