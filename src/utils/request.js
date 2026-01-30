// src/utils/request.js
import axios from 'axios'
import { Message, Loading } from 'element-ui'
import { getToken, removeToken } from '@/utils/storage'
import { ERROR_MSG } from '@/utils/constants'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000, // 超时时间
  retry: 1, // 重试次数
  retryDelay: 1000 // 重试延迟
})

// 加载实例
let loadingInstance = null

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 显示加载
    if (config.needLoading) { // 新增：局部 Loading 开关
      config.loadingInstance = Loading.service({ lock: false, text: '加载中...', background: 'rgba(0,0,0,0.1)' })
    }
    loadingInstance = Loading.service({
      lock: false,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.1)'
    })

    // 添加token
    if (getToken()) {
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }

    // 设置请求头
    config.headers['Content-Type'] = 'application/json;charset=utf-8'
    return config
  },
  error => {
    // 关闭 Loading（仅当存在时）
 // 先判断error.config存在，再判断loadingInstance存在
    if (error.config && error.config.loadingInstance) {
      error.config.loadingInstance.close()
    }
    Message.error(ERROR_MSG.REQUEST_FAILED)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
     // 先判断response.config存在，再判断loadingInstance存在
    if (response.config && response.config.loadingInstance) {
      response.config.loadingInstance.close()
    }
    const res = response.data

    // 成功状态码（根据实际接口调整）
    if (res.code === 200) {
      return res
    } else {
      // 业务错误
      Message.error(res.msg || ERROR_MSG.SERVICE_ERROR)
      return Promise.reject(res)
    }
  },
  error => {
  // 修复报错行：先判断error.config存在，再判断loadingInstance存在
    if (error.config && error.config.loadingInstance) {
      error.config.loadingInstance.close()
    }

    // 处理超时重试
    const config = error.config
    if (!config || !config.retry) return Promise.reject(error)

    // 标记重试次数
    config.__retryCount = config.__retryCount || 0
    if (config.__retryCount >= config.retry) {
      // 重试次数用尽
      if (error.code === 'ECONNABORTED') {
        Message.error(ERROR_MSG.TIMEOUT)
      } else {
        Message.error(ERROR_MSG.NETWORK_ERROR)
      }

      // 401token过期（移除?.，改用ES5条件判断）
      if (error.response && error.response.status === 401) {
        removeToken()
        window.location.href = '/#/login'
      }

      return Promise.reject(error)
    }
    // 新增：仅行情类接口（url 包含 /quote/）重试
    if (config.url.includes('/quote/')) {
      config.__retryCount += 1
      return new Promise(resolve => {
        setTimeout(() => resolve(service(config)), config.retryDelay)
      })
    } else {
      // 非行情接口（AI/交易）不重试，直接 reject
      return Promise.reject(error)
    }
    // // 重试
    // config.__retryCount += 1
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     resolve(service(config))
    //   }, config.retryDelay)
    // })
  }
)

export default service