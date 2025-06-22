import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
import zh from '../locales/zh.js'
import en from '../locales/en.js'

const messages = { zh, en }

const savedLocale = localStorage.getItem('locale') || 'zh'

const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'zh',
  messages
})


// ✅ 导入 Element Plus 及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// ✅ 注册 Element Plus
app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
