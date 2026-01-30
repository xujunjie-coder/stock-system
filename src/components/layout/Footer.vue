<template>
  <div class="footer">
    <div class="copyright">© 2026 同花顺行情分析系统 V2.0 - 模拟交易仅供学习</div>
    <div class="refresh-info">
      行情刷新时间: {{ refreshTime }} ({{ refreshInterval }}秒/次)
    </div>
    <div class="performance">
      K线渲染耗时: {{ renderTime }}ms
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      refreshInterval: 3,
      refreshTime: new Date().toLocaleTimeString(),
      renderTime: Math.floor(Math.random() * 100) + 180 // 模拟渲染耗时
    }
  },
  mounted() {
    // 定时刷新时间显示
    setInterval(() => {
      this.refreshTime = new Date().toLocaleTimeString()
      this.renderTime = Math.floor(Math.random() * 100) + 180
    }, this.refreshInterval * 1000)
  }
}
</script>

<style scoped>
.footer {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  font-size: 12px;
  color: #666;
}
@media screen and (max-width: 767px) {
  .footer {
    flex-direction: column;
    height: auto;
    padding: 8px 16px;
  }
  .copyright, .refresh-info, .performance {
    margin: 4px 0;
  }
}
</style>