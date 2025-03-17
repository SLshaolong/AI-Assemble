/*
 * @Date: 2025-03-11 15:49:38
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-13 11:29:00
 * @FilePath: /chat/src/utils/request.ts
 * @Description: from shaolong
 */
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取基础URL
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 设置token到请求头
      config.headers['Authorization'] = `${token}`
      config.headers['Authorization2'] = `${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    
    // 这里可以根据后端的数据结构进行调整
    if (res.code === 200 || res.code === 0 || response.headers.code == 200) {
      return res
    } else {
      // 处理其他状态码
      ElMessage.error(res.message || '请求失败')
      
      // 处理token过期
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    console.error('响应错误：', error)
    const message = error.response?.data?.error || '服务器错误'
    ElMessage.error(message)
    
    // 处理401错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  }
}

export default request 