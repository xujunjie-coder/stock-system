<template>
  <div class="kline-chart-container">
    <!-- 周期切换按钮组 -->
    <div class="kline-period">
      <el-button
        v-for="period in periodList"
        :key="period.value"
        :type="currentPeriod === period.value ? 'primary' : 'text'"
        @click="changePeriod(period.value)"
        size="mini"
      >
        {{ period.label }}
      </el-button>
    </div>

    <!-- K线图主容器 -->
    <div
      ref="klineChart"
      class="kline-chart"
      :style="{ height: chartHeight + 'px' }"
    ></div>

    <!-- 加载中 -->
    <el-loading
      v-if="loading"
      text="加载K线数据中..."
      class="kline-loading"
    ></el-loading>

    <!-- 错误提示 -->
    <div class="kline-error" v-if="errorMsg">
      <el-icon name="el-icon-warning"></el-icon>
      <span>{{ errorMsg }}</span>
      <el-button type="text" size="mini" @click="fetchKlineData">重试</el-button>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import 'echarts/map/js/china'
import 'echarts-gl'
import quoteApi from '@/api/quote'
import { debounce } from '@/utils/tool'

export default {
  name: 'KLineChart',
  props: {
    // 股票代码（必填）
    code: {
      type: String,
      required: true
    },
    // 初始周期（day/week/month，默认day）
    type: {
      type: String,
      default: 'day',
      validator: val => ['day', 'week', 'month'].includes(val)
    },
    // 父容器高度（默认400px）
    parentHeight: {
      type: Number,
      default: 400
    }
  },
  data() {
    return {
      // 图表实例
      chartInstance: null,
      // 加载状态
      loading: false,
      // 错误提示
      errorMsg: '',
      // 当前周期
      currentPeriod: this.type,
      // 周期列表
      periodList: [
        { label: '日K', value: 'day' },
        { label: '周K', value: 'week' },
        { label: '月K', value: 'month' }
      ],
      // K线数据
      klineData: [],
      // 图表高度
      chartHeight: this.parentHeight
    }
  },
  watch: {
    // 股票代码变化时重新加载数据
    code: {
      handler() {
        this.currentPeriod = this.type
        this.fetchKlineData()
      },
      immediate: true
    },
    // 周期变化时重新加载数据
    currentPeriod() {
      this.fetchKlineData()
    },
    // 父容器高度变化时调整图表大小
    parentHeight(val) {
      this.chartHeight = val
      this.resizeChart()
    }
  },
  mounted() {
    // 初始化图表
    this.initChart()
    // 监听窗口 resize
    window.addEventListener('resize', debounce(this.resizeChart, 300))
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.chartInstance) {
      this.chartInstance.dispose()
      this.chartInstance = null
    }
    // 移除窗口监听
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    /**
     * 初始化ECharts实例
     */
    initChart() {
      this.chartInstance = echarts.init(this.$refs.klineChart)
      // 设置图表基础配置
      this.setChartOption([])
    },

    /**
     * 获取K线数据
     */
    async fetchKlineData() {
      this.loading = true
      this.errorMsg = ''
      try {
        const res = await quoteApi.getKlineData({
          code: this.code,
          type: this.currentPeriod,
          limit: 30 // 模拟30天数据
        })
        this.klineData = res.data || []
        // 渲染K线图
        this.setChartOption(this.klineData)
      } catch (error) {
        this.errorMsg = 'K线数据加载失败'
        console.error('Kline data fetch error:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置图表配置项并渲染
     */
    setChartOption(data) {
      if (!this.chartInstance) return

      // 格式化K线数据（ECharts K线图要求格式：[日期, 开盘, 收盘, 最低, 最高]）
      const formattedData = data.map(item => [
        item.date,
        item.open,
        item.close,
        item.low,
        item.high
      ])

      const option = {
        // 背景色
        backgroundColor: '#fff',
        // 网格配置
        grid: {
          left: '10%',
          right: '5%',
          top: '15%',
          bottom: '10%'
        },
        // tooltip配置（悬浮详情）
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#666'
            }
          },
          formatter: params => {
            const data = params[0].data
            return `
              <div style="text-align: left">
                <div>${data[0]}</div>
                <div>开盘：${data[1].toFixed(2)}</div>
                <div>收盘：${data[2].toFixed(2)}</div>
                <div>最低：${data[3].toFixed(2)}</div>
                <div>最高：${data[4].toFixed(2)}</div>
                <div>涨跌：${(data[2] - data[1]).toFixed(2)}（${((data[2] - data[1]) / data[1] * 100).toFixed(2)}%）</div>
              </div>
            `
          }
        },
        // x轴配置
        xAxis: {
          type: 'category',
          data: formattedData.map(item => item[0]),
          axisLine: {
            lineStyle: {
              color: '#e6e6e6'
            }
          },
          axisLabel: {
            fontSize: 12,
            color: '#666'
          }
        },
        // y轴配置
        yAxis: {
          type: 'value',
          scale: true, // 自动缩放
          axisLine: {
            lineStyle: {
              color: '#e6e6e6'
            }
          },
          axisLabel: {
            fontSize: 12,
            color: '#666',
            formatter: value => value.toFixed(2)
          },
          splitLine: {
            lineStyle: {
              color: '#f5f5f5'
            }
          }
        },
        // 系列配置（K线图）
        series: [
          {
            name: 'K线图',
            type: 'candlestick',
            data: formattedData,
            itemStyle: {
              // 上涨（收盘≥开盘）
              color: '#e53935',
              color0: '#2f9b56',
              // 边框颜色
              borderColor: '#e53935',
              borderColor0: '#2f9b56'
            },
            markPoint: {
              data: [
                { type: 'max', name: '最高价', valueDim: 'high' },
                { type: 'min', name: '最低价', valueDim: 'low' }
              ],
              label: {
                fontSize: 11
              }
            }
          }
        ],
        // 交互配置（滚轮缩放）
        dataZoom: [
          {
            type: 'inside',
            start: 50,
            end: 100,
            zoomLock: false
          }
        ]
      }

      this.chartInstance.setOption(option)
    },

    /**
     * 切换K线周期
     */
    changePeriod(period) {
      this.currentPeriod = period
    },

    /**
     * 调整图表大小
     */
    resizeChart() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }
  }
}
</script>

<style scoped>
.kline-chart-container {
  width: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}

/* 周期切换按钮组 */
.kline-period {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

/* K线图主容器 */
.kline-chart {
  width: 100%;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}

/* 加载中 */
.kline-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

/* 错误提示 */
.kline-error {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f56c6c;
  font-size: 14px;
}

/* 响应式适配 */
@media (max-width: 767px) {
  .kline-chart-container {
    padding: 12px;
  }

  .kline-chart {
    height: 300px !important;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .kline-chart {
    height: 350px !important;
  }
}

@media (min-width: 1200px) {
  .kline-chart {
    height: 400px !important;
  }
}
</style>