export interface InputProps {
  /**
   * 输入框类型
   */
  type?: 'text' | 'password' | 'email' | 'number'
  
  /**
   * 输入框大小
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 输入框值（v-model）
   */
  modelValue?: string
  
  /**
   * 占位符
   */
  placeholder?: string
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 是否只读
   */
  readonly?: boolean
}

