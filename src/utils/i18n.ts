import { createI18n } from 'vue-i18n'
import zh from '../../locales/zh'
import en from '../../locales/en'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true, // 可选：让 t() 函数在模板中可直接使用
  locale: localStorage.getItem('locale') || 'zh',
  messages: { zh, en }
})

export default i18n
