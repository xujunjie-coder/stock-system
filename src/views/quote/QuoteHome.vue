<template>
  <div class="quote-home">
    <el-card shadow="hover" class="quote-card">
      <div class="card-header">
        <h2>沪深A股实时行情</h2>
        <el-button type="text" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
      </div>
      <StockQuote ref="stockQuote" />
    </el-card>
  </div>
</template>

<script>
import StockQuote from '@/components/quote/StockQuote.vue'

export default {
  components: { StockQuote },
  // 新增：组件挂载后主动触发StockQuote的初始数据加载
  mounted() {
    // 延迟100ms，确保子组件已挂载完成
    setTimeout(() => {
      this.refreshData()
    }, 100)
  },
  methods: {
    // 刷新行情数据
    refreshData() {
      // 容错：避免ref获取不到组件的情况
      if (this.$refs.stockQuote) {
        this.$refs.stockQuote.fetchQuoteList()
        this.$message.success('行情刷新成功')
      } else {
        this.$message.warning('行情组件加载中，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.quote-home {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.quote-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
}
</style>