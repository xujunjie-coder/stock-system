<template>
  <div class="trade-review">
    <el-card shadow="hover" style="height: 100%;">
      <TradeReviewChart />
      
      <div class="export-container" style="margin-top: 20px; text-align: right;">
        <el-button type="primary" icon="el-icon-download" @click="exportReview">导出复盘报告</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import TradeReviewChart from '@/components/trade/TradeReviewChart.vue'

export default {
  components: {
    TradeReviewChart
  },
  methods: {
    // 导出复盘报告
    exportReview() {
      this.$message.success('复盘报告导出成功，格式为Excel')
    }
  }
}
</script>

<style scoped>
.trade-review {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
</style>