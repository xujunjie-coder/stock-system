<template>
  <div class="ai-prediction-chart">
    <div class="chart-header">
      <h3>价格趋势预测（{{ periodName }}）</h3>
      <el-select 
        v-model="period" 
        placeholder="选择周期"
        size="mini"
        @change="fetchPrediction"
      >
        <el-option label="1日" value="1d"></el-option>
        <el-option label="3日" value="3d"></el-option>
        <el-option label="1周" value="1w"></el-option>
        <el-option label="1月" value="1m"></el-option>
      </el-select>
    </div>
    <div class="chart-container" ref="chart"></div>
    <div class="chart-meta" style="margin-top: 16px; text-align: center;">
      <span class="meta-item">当前价：{{ currentPrice }}元</span>
      <span class="meta-item">目标价：{{ targetPrice }}元</span>
      <span class="meta-item">上涨概率：<span class="rise">{{ upProbability }}%</span></span>
      <span class="meta-item">历史准确率：{{ accuracyRate }}%</span>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { aiStockPrediction } from '@/api/ai'

export default {
  props: {
    stockCode: {
      type: String,
      required: true
    },
    currentPrice: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      period: '1m',
      periodName: '1月',
      targetPrice: 0,
      upProbability: 0,
      accuracyRate: 0,
      chartInstance: null,
      historicalData: [], // 历史数据
      predictionData: [] // 预测数据
    }
  },
  mounted() {
    // 初始化图表
    this.initChart()
    // 获取预测数据
    this.fetchPrediction()
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
    // 获取预测数据
    fetchPrediction() {
      // 更新周期名称
      const periodMap = {
        '1d': '1日',
        '3d': '3日',
        '1w': '1周',
        '1m': '1月'
      }
      this.periodName = periodMap[this.period] || '1月'
      
      aiStockPrediction({ stockCode: this.stockCode, period: this.period }).then(res => {
        const data = res.data
        this.targetPrice = data.targetPrice
        this.upProbability = data.upProbability
        this.accuracyRate = data.accuracyRate
        
        // 生成历史数据和预测数据
        this.generateChartData()
        // 更新图表
        this.updateChart()
      })
    },
    // 生成图表数据
    generateChartData() {
      // 生成30天历史数据
      this.historicalData = []
      let basePrice = this.currentPrice * Mock.Random.float(0.9, 0.95)
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - 29 + i)
        const price = basePrice * Mock.Random.float(0.98, 1.02)
        basePrice = price
        this.historicalData.push([
          date.toLocaleDateString(),
          price.toFixed(2)
        ])
      }
      
      // 生成预测数据（基于周期）
      this.predictionData = []
      const predictDays = { '1d': 1, '3d': 3, '1w': 7, '1m': 30 }[this.period] || 30
      let predictPrice = this.currentPrice
      for (let i = 1; i <= predictDays; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        // 按上涨概率调整价格趋势
        const trendFactor = this.upProbability >= 50 ? 1.01 : 0.99
        predictPrice = predictPrice * Mock.Random.float(trendFactor * 0.99, trendFactor * 1.01)
        this.predictionData.push([
          date.toLocaleDateString(),
          predictPrice.toFixed(2)
        ])
      }
    },
    // 初始化图表
    initChart() {
      this.chartInstance = echarts.init(this.$refs.chart)
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>价格：{c}元'
        },
        legend: {
          data: ['历史价格', '预测价格'],
          bottom: 0
        },
        grid: {
          left: '10%',
          right: '5%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: '{value}元'
          }
        },
        series: [
          {
            name: '历史价格',
            type: 'line',
            data: [],
            smooth: true,
            itemStyle: {
              color: '#1890ff'
            },
            lineStyle: {
              width: 2
            }
          },
          {
            name: '预测价格',
            type: 'line',
            data: [],
            smooth: true,
            itemStyle: {
              color: '#e53935'
            },
            lineStyle: {
              width: 2,
              type: 'dashed'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(229, 57, 53, 0.2)' },
                { offset: 1, color: 'rgba(229, 57, 53, 0)' }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(option)
    },
    // 更新图表数据
    updateChart() {
      const allXData = [...this.historicalData.map(item => item[0]), ...this.predictionData.map(item => item[0])]
      
      this.chartInstance.setOption({
        xAxis: { data: allXData },
        series: [
          { data: this.historicalData },
          { data: this.predictionData }
        ]
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
.ai-prediction-chart {
  width: 100%;
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
.chart-container {
  flex: 1;
  min-height: 300px;
}
.chart-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  color: #666;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.rise {
  color: #e53935;
  font-weight: bold;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .chart-meta {
    flex-direction: column;
    align-items: center;
  }
  .chart-container {
    min-height: 250px;
  }
}
</style>