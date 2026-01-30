<template>
  <div class="kline-chart">
    <!-- 周期切换 -->
    <div class="kline-period">
      <el-button
        type="text"
        :class="{ active: currentPeriod === 'day' }"
        @click="changePeriod('day')"
      >日K</el-button>
      <el-button
        type="text"
        :class="{ active: currentPeriod === 'week' }"
        @click="changePeriod('week')"
      >周K</el-button>
      <el-button
        type="text"
        :class="{ active: currentPeriod === 'month' }"
        @click="changePeriod('month')"
      >月K</el-button>
      <el-button
        type="text"
        :class="{ active: currentPeriod === 'min' }"
        @click="changePeriod('min')"
      >分钟K</el-button>
    </div>
    <!-- K线图容器 -->
    <div class="chart-container" ref="chart"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getKlineData } from '@/api/quote'

export default {
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentPeriod: 'day',
      chartInstance: null,
      klineData: []
    }
  },
  mounted() {
    // 初始化ECharts实例
    this.initChart()
    // 加载K线数据
    this.fetchKlineData()
    // 监听窗口变化，自适应图表
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
    // 初始化图表
    initChart() {
      this.chartInstance = echarts.init(this.$refs.chart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: params => {
            const data = params[0].data
            return `
              <div>日期: ${data[0]}</div>
              <div>开盘: ${data[1].toFixed(2)}</div>
              <div>最高: ${data[3].toFixed(2)}</div>
              <div>最低: ${data[4].toFixed(2)}</div>
              <div>收盘: ${data[2].toFixed(2)}</div>
              <div>成交量: ${(data[5] / 10000).toFixed(2)}万</div>
            `
          }
        },
        grid: {
          left: '10%',
          right: '5%',
          top: '15%',
          bottom: '10%'
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            interval: Math.floor(this.klineData.length / 10) // 控制X轴标签显示密度
          }
        },
        yAxis: [
          {
            type: 'value',
            scale: true,
            position: 'left',
            axisLine: {
              show: false
            }
          },
          {
            type: 'value',
            scale: true,
            position: 'right',
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'K线',
            type: 'candlestick',
            data: [],
            itemStyle: {
              color: '#e53935', // 上涨颜色
              color0: '#2f9b56', // 下跌颜色
              borderColor: '#e53935',
              borderColor0: '#2f9b56'
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            }
          },
          {
            name: '成交量',
            type: 'bar',
            data: [],
            yAxisIndex: 1,
            itemStyle: {
              color: params => {
                const data = params.data
                return data[1] > data[0] ? '#e53935' : '#2f9b56'
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(option)
    },
    // 获取K线数据
    fetchKlineData() {
      getKlineData({ code: this.code, type: this.currentPeriod }).then(res => {
        this.klineData = res.data
        this.updateChart()
      })
    },
    // 更新图表数据
    updateChart() {
      const klineSeriesData = this.klineData.map(item => [
        item.date,
        item.open,
        item.close,
        item.high,
        item.low,
        item.volume
      ])
      const volumeSeriesData = this.klineData.map(item => [
        item.date,
        item.open,
        item.close,
        item.volume
      ])
      const xAxisData = this.klineData.map(item => item.date)

      this.chartInstance.setOption({
        xAxis: { data: xAxisData },
        series: [
          { data: klineSeriesData },
          { data: volumeSeriesData }
        ]
      })
    },
    // 切换周期
    changePeriod(period) {
      this.currentPeriod = period
      this.fetchKlineData()
    },
    // 图表自适应
    resizeChart() {
      this.chartInstance.resize()
    }
  }
}
</script>

<style scoped>
.kline-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.kline-period {
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid #e6e6e6;
}
.kline-period .el-button {
  margin-right: 16px;
  color: #666;
}
.kline-period .el-button.active {
  color: #e53935;
  font-weight: bold;
  border-bottom: 2px solid #e53935;
}
.chart-container {
  flex: 1;
  width: 100%;
}
</style>