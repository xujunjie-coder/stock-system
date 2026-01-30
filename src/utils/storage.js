import CryptoJS from 'crypto-js'
const SECRET_KEY = 'stock_system_2024' // 加密密钥
const STORAGE_KEY = {
  TOKEN: 'stock_token',
  USER_INFO: 'stock_user_info'
}

// 加密
const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

// 解密
const decrypt = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  } catch (e) {
    return null
  }
}

// 获取token
export const getToken = () => {
  return localStorage.getItem(STORAGE_KEY.TOKEN) || ''
}

// 设置token
export const setToken = (token) => {
  localStorage.setItem(STORAGE_KEY.TOKEN, token)
}

// 移除token
export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEY.TOKEN)
}

// 存储用户信息
export const setUserInfo = (info) => {
  localStorage.setItem(STORAGE_KEY.USER_INFO, encrypt(info))
}

// 获取用户信息
export const getUserInfo = () => {
  const info = localStorage.getItem(STORAGE_KEY.USER_INFO)
  return info ? decrypt(info) : null
}

// ========== 新增：StockQuote.vue 需要的通用缓存方法 ==========
/**
 * 通用存储方法（带过期时间）- 适配StockQuote的筛选条件缓存
 * @param {string} key - 缓存键名
 * @param {any} value - 缓存值（null则删除）
 * @param {number} expire - 过期时间（秒），默认永久
 */
export const setStorage = (key, value, expire = 0) => {
  // 如果value为null，直接删除缓存
  if (value === null) {
    localStorage.removeItem(key)
    return
  }
  
  const data = {
    value,
    expire: expire > 0 ? Date.now() + expire * 1000 : 0 // 过期时间戳（毫秒）
  }
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * 通用获取缓存方法 - 适配StockQuote的筛选条件缓存
 * @param {string} key - 缓存键名
 * @returns {any} 缓存值（过期/解析失败则返回null）
 */
export const getStorage = (key) => {
  const data = localStorage.getItem(key)
  if (!data) return null

  try {
    const parsed = JSON.parse(data)
    // 检查是否过期
    if (parsed.expire && parsed.expire < Date.now()) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.value
  } catch (e) {
    // 解析失败则删除缓存
    localStorage.removeItem(key)
    return null
  }
}