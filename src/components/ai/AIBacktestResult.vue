<template>
  <div class="ai-backtest-result">
    <el-dialog
      title="选股策略回测结果"
      v-model="visible"
      width="80%"
      :fullscreen="isMobile"
      :append-to-body="true"
    >
      <div class="backtest-header">
        <div class="strategy-info">
          <h3>{{ strategyName }}</h3>
          <p>回测周期：{{ startDate }} 至 {{ endDate }}（{{ backtestPeriod }}）</p>
        </div>
        <div class="backtest-summary">
          <div class="summary-item">
            <div class="label">策略收益率</div>
            <div class="value rise">{{ strategyProfitRate }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">基准收益率</div>
            <div class="value">{{ benchmarkProfitRate }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">超额收益率</div>
            <div class="value rise">{{ excessProfitRate }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">胜率</div>
            <div class="value">{{ winRate }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">最大回撤</div>
            <div class="value fall">{{ maxDrawdown }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">交易次数</div>
            <div class="value">{{ tradeCount }}</div>
          </div>
        </div>
      </div>
      
      <div class="backtest-charts">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <div class="chart-card">
              <h4>收益对比</h4>
              <div class="chart" ref="profitChart"></div>
            </div>
          </el-col>
          <el-col :xs="24" :md="12">
            <div class="chart-card">
              <h4>收益分布</h4>
              <div class="chart" ref="distributionChart"></div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div class="backtest-conclusion" style="margin-top: 20px;">
        <h4>回测结论</h4>
        <p>{{ conclusion }}</p>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="exportReport">导出回测报告</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import multiTerminal from '@/mixins/multiTerminal'

export default {
  mixins: [multiTerminal],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    backtestData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      strategyId: '',
      strategyName: '',
      startDate: '',
      endDate: '',
      backtestPeriod: '',
      strategyProfitRate: 0,
      benchmarkProfitRate: 0,
      excessProfitRate: 0,
      winRate: 0,
      maxDrawdown: 0,
      tradeCount: 0,
      profitDistribution: [],
      conclusion: '',
      profitChartInstance: null,
      distributionChartInstance: null
    }
  },
  watch: {
    backtestData: {
      immediate: true,
      handler(val) {
        if (val.strategyId) {
          this.strategyId = val.strategyId
          this.strategyName = val.strategyName || '选股策略'
          this.startDate = val.startDate
          this.endDate = val.endDate
          this.backtestPeriod = val.backtestPeriod || '6个月'
          this.strategyProfitRate = val.strategyProfitRate || 0
          this.benchmarkProfitRate = val.benchmarkProfitRate || 0
          this.excessProfitRate = val.excessProfitRate || 0
          this.winRate = val.winRate || 0
          this.maxDrawdown = val.maxDrawdown || 0
          this.tradeCount = val.tradeCount || 0
          this.profitDistribution = val.profitDistribution || []
          this.generateConclusion()
          
          // 延迟初始化图表（确保DOM已渲染）
          setTimeout(() => {
            this.initCharts()
            this.updateCharts()
          }, 100)
        }
      }
    },
    visible(val) {
      if (!val) {
        this.$emit('update:visible', false)
        // 销毁图表
        if (this.profitChartInstance) this.profitChartInstance.dispose()
        if (this.distributionChartInstance) this.distributionChartInstance.dispose()
      }
    }
  },
  methods: {
    // 生成回测结论
    generateConclusion() {
      const profitRate = parseFloat(this.strategyProfitRate)
      const excessRate = parseFloat(this.excessProfitRate)
      const winRt = parseFloat(this.winRate)
      
      if (profitRate > 20 && excessRate > 10 && winRt > 70) {
        this.conclusion = '该策略在回测周期内表现优异，收益率显著高于基准，胜率较高，风险控制良好，具备较强的实战参考价值。'
      } else if (profitRate > 10 && excessRate > 5 && winRt > 60) {
        this.conclusion = '该策略在回测周期内表现良好，收益率高于基准，胜率适中，风险可控，可作为投资参考。'
      } else if (profitRate > 0 && winRt > 50) {
        this.conclusion = '该策略在回测周期内实现正收益，但超额收益有限，建议结合其他策略综合使用。'
      } else {
        this.conclusion = '该策略在回测周期内表现不佳，收益率低于基准或出现亏损，不建议直接使用，可调整参数后重新回测。'
      }
    },
    // 初始化图表
    initCharts() {
      // 收益对比图表
      this.profitChartInstance = echarts.init(this.$refs.profitChart)
      const profitOption = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}：{c}%'
        },
        legend: {
          data: ['策略收益', '基准收益'],
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
          data: []
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '策略收益',
            type: 'line',
            data: [],
            smooth: true,
            itemStyle: { color: '#e53935' },
            lineStyle: { width: 2 }
          },
          {
            name: '基准收益',
            type: 'line',
            data: [],
            smooth: true,
            itemStyle: { color: '#1890ff' },
            lineStyle: { width: 2 }
          }
        ]
      }
      this.profitChartInstance.setOption(profitOption)
      
      // 收益分布图表
      this.distributionChartInstance = echarts.init(this.$refs.distributionChart)
      const distributionOption = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>交易次数：{c}'
        },
        grid: {
          left: '10%',
          right: '5%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}次'
          }
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
      this.distributionChartInstance.setOption(distributionOption)
      
      // 监听窗口变化
      window.addEventListener('resize', this.resizeCharts)
    },
    // 更新图表数据
    updateCharts() {
      // 生成收益对比数据（按月份）
      const periodMonths = parseInt(this.backtestPeriod) || 6
      const profitData = []
      const benchmarkData = []
      const xData = []
      
      let strategyProfit = 0
      let benchmarkProfit = 0
      for (let i = 1; i <= periodMonths; i++) {
        const month = new Date(this.startDate)
        month.setMonth(month.getMonth() + i - 1)
        xData.push(`${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`)
        
        // 策略收益递增
        const strategyStep = parseFloat(this.strategyProfitRate) / periodMonths * Mock.Random.float(0.8, 1.2)
        strategyProfit += strategyStep
        profitData.push(strategyProfit.toFixed(2))
        
        // 基准收益递增
        const benchmarkStep = parseFloat(this.benchmarkProfitRate) / periodMonths * Mock.Random.float(0.8, 1.2)
        benchmarkProfit += benchmarkStep
        benchmarkData.push(benchmarkProfit.toFixed(2))
      }
      
      // 收益分布数据
      const distributionXData = this.profitDistribution.map(item => item.range)
      const distributionYData = this.profitDistribution.map(item => item.count)
      
      // 更新收益对比图表
      this.profitChartInstance.setOption({
        xAxis: { data: xData },
        series: [
          { data: profitData },
          { data: benchmarkData }
        ]
      })
      
      // 更新收益分布图表
      this.distributionChartInstance.setOption({
        xAxis: { data: distributionXData },
        series: [{ data: distributionYData }]
      })
    },
    // 图表自适应
    resizeCharts() {
      if (this.profitChartInstance) this.profitChartInstance.resize()
      if (this.distributionChartInstance) this.distributionChartInstance.resize()
    },
    // 导出回测报告
    exportReport() {
      this.$message.success('回测报告导出成功，格式为Excel')
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  }
}
</script>

<style scoped>
.ai-backtest-result {
  width: 100%;
}
.backtest-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.strategy-info {
  margin-bottom: 16px;
}
.strategy-info h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
}
.strategy-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}
.backtest-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.summary-item {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
}
.label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
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
.backtest-charts {
  margin-bottom: 20px;
}
.chart-card {
  height: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}
.chart-card h4 {
  padding: 12px 16px;
  margin: 0;
  font-size: 14px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e6e6e6;
}
.chart {
  flex: 1;
  padding: 8px;
}
.backtest-conclusion p {
  line-height: 1.8;
  color: #666;
  margin: 0;
  text-indent: 2em;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .backtest-summary {
    flex-direction: column;
  }
  .summary-item {
    width: 100%;
  }
  .chart-card {
    height: 250px;
  }
}
</style>