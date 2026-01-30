/**
 * 通用工具函数库
 * 严格对应目录结构：src/utils/tool.js
 */

// 防抖函数
export function debounce(func, delay = 300, immediate = false) {
  let timer = null
  return function(...args) {
    const context = this
    if (timer) clearTimeout(timer)
    if (immediate && !timer) func.apply(context, args)
    timer = setTimeout(() => { func.apply(context, args); timer = null }, delay)
  }
}

// 节流函数
export function throttle(func, interval = 300) {
  let lastTime = 0
  return function(...args) {
    const context = this
    const now = Date.now()
    if (now - lastTime >= interval) { func.apply(context, args); lastTime = now }
  }
}

// 拖拽排序
export function dragSort(arr, fromIndex, toIndex) {
  if (fromIndex === toIndex) return arr
  const newArr = [...arr]
  const [item] = newArr.splice(fromIndex, 1)
  newArr.splice(toIndex, 0, item)
  return newArr
}

// 数据分片加载
export function chunkData(data = [], chunkSize = 50) {
  const chunks = []
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }
  return chunks
}

// 价格格式化（保留2位小数+千分位）
export function formatPrice(price) {
  if (isNaN(price)) return '0.00'
  return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 日期格式化
export function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
  if (!date) return ''
  const d = new Date(date)
  const o = {
    'M+': d.getMonth() + 1, 'd+': d.getDate(), 'H+': d.getHours(),
    'm+': d.getMinutes(), 's+': d.getSeconds(), 'q+': Math.floor((d.getMonth() + 3) / 3),
    'S': d.getMilliseconds()
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}

// 深拷贝
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  const cloneObj = Array.isArray(obj) ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) cloneObj[key] = deepClone(obj[key])
  }
  return cloneObj
}