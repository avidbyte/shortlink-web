import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

type AxiosRequestConfig = axios.AxiosRequestConfig

// 定义响应数据通用结构（与你的接口返回体匹配）
interface ResponseData<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: number
}

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: false
})


service.interceptors.request.use((config) => {
  const lang = localStorage.getItem('locale') || 'zh'
  if (!config.headers) config.headers = {}
  config.headers['Accept-Language'] = lang
  return config
})

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const res = response.data
    // ✅ 根据你的接口返回体调整判断逻辑
    if (!res.success) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data // ✅ 直接返回 data 字段（包含分页数据）
  },
  (error) => {
    console.error('响应拦截错误:', error)
    let errorMessage = '网络错误，请重试'
    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络'
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '未授权，请登录'
          break
        case 404:
          errorMessage = '请求地址不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
      }
    }
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

// 封装通用请求方法
const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig<any>): Promise<T> {
    return service.get(url, config)
  },
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>
  ): Promise<T> {
    return service.post(url, data, config)
  },
  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>
  ): Promise<T> {
    return service.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig<any>): Promise<T> {
    return service.delete(url, config)
  }
}

export default request
