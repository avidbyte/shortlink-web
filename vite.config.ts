import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default ({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // 自定义配置
  const apiConfig = {
    url: env.VITE_API_URL || 'https://default-api.com',
    timeout: 10000,
  }

  return defineConfig({
    plugins: [vue()],
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_MODE),
      __API_CONFIG__: JSON.stringify(apiConfig),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
}
