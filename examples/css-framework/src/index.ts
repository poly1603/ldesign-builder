/**
 * CSS 框架入口
 * 导入所有样式文件
 */

// 基础样式
import './base/reset.less'
import './base/typography.less'

// 组件样式
import './components/button.less'
import './components/card.less'
import './components/form.less'

// 工具类
import './utilities/spacing.less'
import './utilities/colors.less'
import './utilities/display.less'

// 导出 CSS 变量配置
export const cssVariables = {
  primaryColor: '--l-primary',
  secondaryColor: '--l-secondary',
  spacing: '--l-spacing',
  borderRadius: '--l-radius'
}
