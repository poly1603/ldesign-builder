/**
 * 工具类型定义
 * 提供常用的 TypeScript 工具类型
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 深度部分类型
 * 递归地将所有属性设为可选
 */
export type DeepPartial<T> = T extends object
  ? {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  : T

/**
 * 深度只读类型
 * 递归地将所有属性设为只读
 */
export type DeepReadonly<T> = T extends object
  ? {
    readonly [P in keyof T]: DeepReadonly<T[P]>
  }
  : T

/**
 * 深度必需类型
 * 递归地将所有可选属性设为必需
 */
export type DeepRequired<T> = T extends object
  ? {
    [P in keyof T]-?: DeepRequired<T[P]>
  }
  : T

/**
 * 提取 Promise 的返回类型
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * 提取数组的元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * 函数参数类型
 */
export type FunctionArgs<T> = T extends (...args: infer Args) => any ? Args : never

/**
 * 函数返回类型
 */
export type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never

/**
 * 可为空类型
 */
export type Nullable<T> = T | null | undefined

/**
 * 非空类型
 */
export type NonNullableDeep<T> = T extends object
  ? {
    [P in keyof T]-?: NonNullableDeep<NonNullable<T[P]>>
  }
  : NonNullable<T>

/**
 * 值类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 可写类型
 * 移除 readonly 修饰符
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P]
}

/**
 * 深度可写类型
 */
export type DeepWritable<T> = T extends object
  ? {
    -readonly [P in keyof T]: DeepWritable<T[P]>
  }
  : T

/**
 * 合并类型
 * 合并两个类型，后者覆盖前者
 */
export type Merge<T, U> = Omit<T, keyof U> & U

/**
 * 递归合并类型
 */
export type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
  ? K extends keyof T
  ? T[K] extends object
  ? U[K] extends object
  ? DeepMerge<T[K], U[K]>
  : U[K]
  : U[K]
  : U[K]
  : K extends keyof T
  ? T[K]
  : never
}

/**
 * 严格的 Pick
 * 确保键存在于源类型中
 */
export type StrictPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * 严格的 Omit
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 可选键类型
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 必需键类型
 */
export type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>

/**
 * 仅可选属性
 */
export type OnlyOptional<T> = Pick<T, OptionalKeys<T>>

/**
 * 仅必需属性
 */
export type OnlyRequired<T> = Pick<T, RequiredKeys<T>>

/**
 * 条件类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 字符串字面量联合类型
 */
export type StringLiteral<T extends string> = T | (string & {})

/**
 * 数字字面量联合类型
 */
export type NumberLiteral<T extends number> = T | (number & {})

/**
 * 异步函数类型
 */
export type AsyncFunction<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => Promise<TReturn>

/**
 * 同步或异步函数类型
 */
export type MaybeAsync<T> = T | Promise<T>

/**
 * 同步或异步函数
 */
export type MaybeAsyncFunction<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => MaybeAsync<TReturn>

/**
 * 构造函数类型
 */
export type Constructor<T = any, TArgs extends any[] = any[]> = new (
  ...args: TArgs
) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T

/**
 * 类类型（包括抽象类）
 */
export type Class<T = any> = Constructor<T> | AbstractConstructor<T>

/**
 * 实例类型
 */
export type InstanceTypeOf<T> = T extends new (...args: any[]) => infer R ? R : never

/**
 * JSON 值类型
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * JSON 对象类型
 */
export type JSONObject = { [key: string]: JSONValue }

/**
 * JSON 数组类型
 */
export type JSONArray = JSONValue[]

/**
 * 可序列化类型
 */
export type Serializable = JSONValue

/**
 * 扁平化类型
 */
export type Flatten<T> = T extends any[] ? T[number] : T

/**
 * 元组转联合类型
 */
export type TupleToUnion<T extends readonly any[]> = T[number]

/**
 * 联合转交叉类型
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * 路径字符串类型
 * 用于类型安全的对象路径访问
 */
export type PathString<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
  ? `${Prefix}${K}` | PathString<T[K], `${Prefix}${K}.`>
  : `${Prefix}${K}`
}[keyof T & string]

/**
 * 根据路径获取类型
 */
export type GetByPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
  ? GetByPath<T[K], Rest>
  : never
  : P extends keyof T
  ? T[P]
  : never

/**
 * 类型保护函数
 */
export type TypeGuard<T, S extends T = T> = (value: T) => value is S

/**
 * 类型断言函数
 */
export type TypeAssertion<T> = (value: unknown) => asserts value is T

/**
 * 可能的类型（包括undefined）
 */
export type Maybe<T> = T | undefined

/**
 * 非空数组类型
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * 只读记录类型
 */
export type ReadonlyRecord<K extends string | number | symbol, V> = {
  readonly [P in K]: V
}

/**
 * 可变记录类型
 */
export type MutableRecord<K extends string | number | symbol, V> = {
  -readonly [P in K]: V
}

