/**
 * 行情刷新混入（节流刷新/缓存处理/自动刷新控制）
 * 严格对应目录结构：src/mixins/quoteRefresh.js
 */
import { throttle } from '@/utils/tool'

export default {
  data() {
    return {
      refreshInterval: 3000, // 默认刷新间隔（3秒）
      refreshTimer: null,
      isRefreshing: false,
      cacheData: {},
      cacheExpire: {
        quote: 1000,    // 行情数据缓存1秒
        kline: 10000,   // K线数据缓存10秒
        aiPredict: 300000 // AI预测缓存5分钟
      }
    }
  },
  computed: {
    customRefreshInterval() {
      const setting = localStorage.getItem('systemSetting')
      return setting ? JSON.parse(setting).quoteSetting?.refreshInterval || this.refreshInterval : this.refreshInterval
    }
  },
  mounted() {
    this.initCache()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  watch: {
    customRefreshInterval(newVal) {
      this.refreshInterval = newVal
      this.stopAutoRefresh()
      this.startAutoRefresh()
    }
  },
  methods: {
    initCache() {
      const cache = localStorage.getItem('quoteCache')
      this.cacheData = cache ? JSON.parse(cache) : {}
    },
    saveCache(type, data) {
      this.cacheData[type] = { data, timestamp: Date.now() }
      localStorage.setItem('quoteCache', JSON.stringify(this.cacheData))
    },
    getCache(type) {
      const cache = this.cacheData[type]
      if (!cache) return null
      return Date.now() - cache.timestamp < this.cacheExpire[type] ? cache.data : null
    },
    clearCache(type) {
      if (type) delete this.cacheData[type]
      else this.cacheData = {}
      localStorage.setItem('quoteCache', JSON.stringify(this.cacheData))
    },
    startAutoRefresh() {
      if (this.refreshInterval <= 0) return
      this.stopAutoRefresh()
      const throttleRefresh = throttle(this.fetchData, this.refreshInterval)
      this.refreshTimer = setInterval(throttleRefresh, this.refreshInterval)
      throttleRefresh()
    },
    stopAutoRefresh() {
      if (this.refreshTimer) clearInterval(this.refreshTimer)
    },
    manualRefresh() {
      this.clearCache()
      this.fetchData()
    },
    fetchData() {
      this.isRefreshing = true
      // 组件中重写时需调用 this.finishRefresh()
    },
    finishRefresh() {
      this.isRefreshing = false
    }
  }
}