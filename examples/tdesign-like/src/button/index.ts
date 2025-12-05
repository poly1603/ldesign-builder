/**
 * Button 组件入口
 * 类似 TDesign 的组件导出结构
 */

import _Button from './button'
import { withInstall } from '../utils/withInstall'

import './style'

export * from './type'

export const Button = withInstall(_Button)
export default Button
