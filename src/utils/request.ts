import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { i18n } from '@/utils/i18n'

interface ResponseData<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: number
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: false,
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const lang = localStorage.getItem('locale') || 'zh'

  if (typeof config.headers?.set === 'function') {
    config.headers.set('Accept-Language', lang)
  } else if (config.headers) {
    // 兼容 headers 是普通对象的情况
    (config.headers as Record<string, string>)['Accept-Language'] = lang
  }

  return config
})

service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const res = response.data
    if (!res.success) {
      ElMessage.error(res.message || i18n.global.t('requestFailed'))
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  (error) => {
    console.error('响应拦截错误:', error)
    let errorMessage = i18n.global.t('networkError')
    if (error.code === 'ECONNABORTED') {
      errorMessage = i18n.global.t('requestTimeout')
    } else if (error.response) {
      switch (error.response.status) {
        case 409:
          errorMessage = i18n.global.t('conflict')
          break
        case 401:
          errorMessage = i18n.global.t('unauthorized')
          break
        case 404:
          errorMessage = i18n.global.t('notFound')
          break
        case 500:
          errorMessage = i18n.global.t('serverError')
          break
      }
    }
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

const request = {
  get<T = any>(url: string, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    return service.get(url, config as InternalAxiosRequestConfig)
  },
  post<T = any>(url: string, data?: any, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    return service.post(url, data, config as InternalAxiosRequestConfig)
  },
  put<T = any>(url: string, data?: any, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    return service.put(url, data, config as InternalAxiosRequestConfig)
  },
  delete<T = any>(url: string, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    return service.delete(url, config as InternalAxiosRequestConfig)
  }
}

export default request
