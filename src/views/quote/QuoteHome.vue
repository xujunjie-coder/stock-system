<!-- src/views/quote/QuoteHome.vue -->
<template>
  <!-- 仅渲染行情列表组件（布局已由App.vue的MainLayout提供） -->
  <div class="quote-home">
    <StockQuote />
  </div>
</template>

<script>
// 引入行情列表核心组件
import StockQuote from '@/components/quote/StockQuote.vue'

export default {
  name: 'QuoteHome',
  components: {
    StockQuote
  },
  mounted() {
    // 可选：页面挂载后的额外逻辑（如埋点、数据预加载）
    console.log('行情首页已加载')
  }
}
</script>

<style scoped>
/* 适配MainLayout的主内容区样式 */
.quote-home {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

/* 穿透MainLayout的样式，优化行情组件的展示 */
::v-deep .content-wrapper {
  padding: 16px;
  background-color: #f8f8f8;
  height: 100%;
  overflow-y: auto;
}

/* 移动端适配 */
@media (max-width: 767px) {
  ::v-deep .content-wrapper {
    padding: 12px;
  }
}
</style>