import axios from 'axios'
import { message } from 'ant-design-vue'
import { API_BASE_URL } from '@/config/env'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// 处理大整数的自定义 JSON 解析器
const parseJSONWithBigInt = (text: string) => {
  return JSON.parse(text, (key, value) => {
    // 如果是 id 字段且是大整数，保持为字符串
    if (key === 'id' && typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
      return String(value)
    }
    return value
  })
}

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    // 如果响应是 JSON 格式，重新解析以处理大整数
    if (response.headers['content-type']?.includes('application/json')) {
      try {
        const originalData = response.data
        // 如果数据中包含可能的大整数 ID，进行特殊处理
        if (typeof originalData === 'object' && originalData !== null) {
          response.data = JSON.parse(JSON.stringify(originalData), (key, value) => {
            // 处理 id 字段的大整数问题
            if (key === 'id' && typeof value === 'number' && !Number.isSafeInteger(value)) {
              return String(value)
            }
            return value
          })
        }
      } catch (error) {
        console.warn('JSON 大整数处理失败:', error)
      }
    }

    const { data } = response
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default myAxios
