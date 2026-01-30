<template>
  <div class="footer-container">
    <!-- 左侧版权信息 -->
    <div class="copyright">
      © 2026 同花顺行情分析系统 - 仅供学习使用
    </div>
    
    <!-- 中间行情刷新信息 -->
    <div class="refresh-info">
      行情刷新频率：<span class="refresh-interval">{{ refreshInterval }}秒</span>
      <span class="last-refresh"> | 最后刷新：{{ lastRefreshTime }}</span>
    </div>
    
    <!-- 右侧性能数据 -->
    <div class="performance-data">
      K线渲染耗时：<span class="render-time">{{ klineRenderTime }}ms</span>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default {
  name: 'Footer',
  data() {
    return {
      // 行情刷新间隔（默认3秒）
      refreshInterval: 3,
      // 最后刷新时间
      lastRefreshTime: this.formatTime(new Date()),
      // K线渲染耗时（占位，后续可从Vuex获取真实数据）
      klineRenderTime: '--'
    }
  },
  computed: {
    ...mapState({
      // 从Vuex获取K线渲染耗时（若存在则使用，否则用占位）
      realKlineRenderTime: state => state.quote.klineRenderTime
    })
  },
  watch: {
    // 监听K线渲染耗时变化
    realKlineRenderTime(newVal) {
      if (newVal !== undefined) {
        this.klineRenderTime = newVal
      }
    }
  },
  mounted() {
    // 初始化K线渲染耗时（若Vuex已有数据）
    if (this.realKlineRenderTime !== undefined) {
      this.klineRenderTime = this.realKlineRenderTime
    }
    
    // 启动行情刷新定时器（模拟实时刷新）
    this.startRefreshTimer()
  },
  beforeDestroy() {
    // 清除定时器，避免内存泄漏
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    // 格式化时间（yyyy-MM-dd HH:mm:ss）
    formatTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      const second = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },
    // 启动行情刷新定时器
    startRefreshTimer() {
      this.refreshTimer = setInterval(() => {
        // 更新最后刷新时间
        this.lastRefreshTime = this.formatTime(new Date())
        
        // 触发行情刷新（通过Vuex action）
        this.$store.dispatch('quote/refreshQuoteData')
        
        // 模拟K线渲染耗时更新（随机100-500ms）
        if (Math.random() > 0.5) {
          this.klineRenderTime = Math.floor(Math.random() * 400) + 100
          // 更新到Vuex
          this.$store.commit('quote/setKlineRenderTime', this.klineRenderTime)
        }
      }, this.refreshInterval * 1000)
    }
  }
}
</script>

<style scoped>
.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  background-color: #fff;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #999;
}

.copyright {
  flex: 1;
}

.refresh-info {
  flex: 1;
  text-align: center;
}

.performance-data {
  flex: 1;
  text-align: right;
}

.refresh-interval {
  color: #e53935;
  font-weight: 700;
}

.last-refresh {
  margin-left: 8px;
}

.render-time {
  color: #2e7d32;
  font-weight: 700;
}

/* 响应式适配：移动端（<768px）样式 */
@media (max-width: 767px) {
  .footer-container {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
  }
  
  .copyright, .refresh-info, .performance-data {
    flex: none;
    text-align: center;
    margin: 4px 0;
  }
}
</style>