<template>
  <div class="trade-review-chart">
    <div class="chart-header">
      <h3>交易复盘分析</h3>
      <div class="date-filter">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="fetchReviewData"
        ></el-date-picker>
        <el-button type="primary" size="mini" @click="fetchReviewData">查询</el-button>
      </div>
    </div>
    
    <div class="chart-container">
      <el-row :gutter="20">
        <!-- 收益概览 -->
        <el-col :xs="24" :md="6">
          <el-card shadow="hover" class="overview-card">
            <div class="overview-item">
              <div class="label">总交易次数</div>
              <div class="value">{{ reviewData.totalTradeCount }}</div>
            </div>
            <div class="overview-item">
              <div class="label">总收益</div>
              <div class="value rise">{{ reviewData.totalProfit.toFixed(2) }} 元</div>
            </div>
            <div class="overview-item">
              <div class="label">胜率</div>
              <div class="value">{{ reviewData.winRate.toFixed(2) }}%</div>
            </div>
            <div class="overview-item">
              <div class="label">平均每笔收益</div>
              <div class="value rise">{{ reviewData.avgProfitPerTrade.toFixed(2) }} 元</div>
            </div>
            <div class="overview-item">
              <div class="label">最大盈利交易</div>
              <div class="value rise">{{ reviewData.maxProfitTrade.toFixed(2) }} 元</div>
            </div>
            <div class="overview-item">
              <div class="label">最大亏损交易</div>
              <div class="value fall">{{ reviewData.maxLossTrade.toFixed(2) }} 元</div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 收益分布图表 -->
        <el-col :xs="24" :md="18">
          <el-card shadow="hover" class="distribution-card">
            <div class="card-title">收益分布</div>
            <div class="chart" ref="distributionChart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getTradeReview } from '@/api/trade'

export default {
  data() {
    return {
      dateRange: [],
      reviewData: {
        totalTradeCount: 0,
        totalProfit: 0,
        winRate: 0,
        avgProfitPerTrade: 0,
        maxProfitTrade: 0,
        maxLossTrade: 0,
        profitDistribution: []
      },
      chartInstance: null
    }
  },
  mounted() {
    // 初始化日期范围（近30天）
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    this.dateRange = [startDate, endDate]
    
    // 初始化图表
    this.initChart()
    // 获取复盘数据
    this.fetchReviewData()
    // 监听窗口变化
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
    // 获取复盘数据
    fetchReviewData() {
      if (!this.dateRange || this.dateRange.length !== 2) return
      
      const startDate = this.formatDate(this.dateRange[0])
      const endDate = this.formatDate(this.dateRange[1])
      
      getTradeReview({ startDate, endDate }).then(res => {
        this.reviewData = res.data
        // 更新图表
        this.updateChart()
      })
    },
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 初始化图表
    initChart() {
      this.chartInstance = echarts.init(this.$refs.distributionChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: '交易次数'
        },
        series: [
          {
            name: '交易次数',
            type: 'bar',
            data: [],
            itemStyle: {
              color: params => {
                const range = params.name
                if (range.includes('>10%') || range.includes('0%~5%') || range.includes('5%~10%')) {
                  return '#e53935'
                }
                return '#2f9b56'
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(option)
    },
    // 更新图表数据
    updateChart() {
      const { profitDistribution } = this.reviewData
      const xData = profitDistribution.map(item => item.range)
      const yData = profitDistribution.map(item => item.count)
      
      this.chartInstance.setOption({
        xAxis: { data: xData },
        series: [{ data: yData }]
      })
    },
    // 图表自适应
    resizeChart() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }
  }
}
</script>

<style scoped>
.trade-review-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
h3 {
  font-size: 16px;
  color: #333;
  margin: 0;
}
.date-filter {
  display: flex;
  gap: 8px;
}
.chart-container {
  flex: 1;
  overflow-y: auto;
}
.overview-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.label {
  font-size: 14px;
  color: #666;
}
.value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
}
.distribution-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.chart {
  flex: 1;
  min-height: 300px;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .date-filter {
    width: 100%;
  }
  .el-date-picker {
    flex: 1;
  }
}
</style>