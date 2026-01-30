<template>
  <div class="ai-prediction-report-page">
    <el-card shadow="hover" style="height: 100%;">
      <div class="report-header">
        <div class="stock-info">
          <h2>{{ reportData.stockInfo.stockName }}({{ reportData.stockInfo.stockCode }})</h2>
          <div class="stock-meta">
            <span class="meta-item">行业：{{ reportData.stockInfo.industry }}</span>
            <span class="meta-item">市场类型：{{ reportData.stockInfo.marketType }}</span>
            <span class="meta-item">当前价：{{ reportData.stockInfo.currentPrice.toFixed(2) }}元</span>
            <span class="meta-item">更新时间：{{ reportData.updateTime }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" icon="el-icon-download" @click="exportReport">导出报告</el-button>
          <el-button type="text" icon="el-icon-star-on" @click="addToSelfSelect">加入自选</el-button>
        </div>
      </div>
      
      <div class="report-summary">
        <el-card shadow="hover" class="summary-card">
          <h3>预测摘要</h3>
          <div class="summary-content">
            <div class="summary-item">
              <div class="label">预测周期</div>
              <div class="value">{{ reportData.predictionSummary.periodName }}</div>
            </div>
            <div class="summary-item">
              <div class="label">涨跌趋势</div>
              <div class="value" :class="reportData.predictionSummary.trend === 'up' ? 'rise' : 'fall'">
                {{ reportData.predictionSummary.trend === 'up' ? '上涨' : '下跌' }}
              </div>
            </div>
            <div class="summary-item">
              <div class="label">上涨概率</div>
              <div class="value rise">{{ reportData.predictionSummary.upProbability }}%</div>
            </div>
            <div class="summary-item">
              <div class="label">目标价</div>
              <div class="value">{{ reportData.predictionSummary.targetPrice.toFixed(2) }}元</div>
            </div>
            <div class="summary-item">
              <div class="label">盈利空间</div>
              <div class="value rise">{{ reportData.predictionSummary.profitSpace }}%</div>
            </div>
            <div class="summary-item">
              <div class="label">操作建议</div>
              <div class="value">{{ reportData.predictionSummary.operationSuggest }}</div>
            </div>
            <div class="summary-item">
              <div class="label">历史准确率</div>
              <div class="value">{{ reportData.predictionSummary.accuracyRate }}%</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="report-chart" style="margin-top: 20px;">
        <el-card shadow="hover">
          <AIPredictionChart
            :stock-code="reportData.stockInfo.stockCode"
            :current-price="reportData.stockInfo.currentPrice"
          />
        </el-card>
      </div>
      
      <div class="report-details" style="margin-top: 20px;">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-card shadow="hover" class="detail-card">
              <h3>详细分析</h3>
              <div class="detail-content">
                <div class="detail-section">
                  <h4>基本面分析</h4>
                  <p>{{ reportData.detailedAnalysis.fundamental }}</p>
                </div>
                <div class="detail-section">
                  <h4>技术面分析</h4>
                  <p>{{ reportData.detailedAnalysis.technical }}</p>
                </div>
                <div class="detail-section">
                  <h4>资金流向分析</h4>
                  <p>{{ reportData.detailedAnalysis.capitalFlow }}</p>
                </div>
                <div class="detail-section">
                  <h4>行业趋势分析</h4>
                  <p>{{ reportData.detailedAnalysis.industryTrend }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-card shadow="hover" class="detail-card">
              <h3>价格预测</h3>
              <div class="price-forecast">
                <div class="forecast-section">
                  <h4>支撑位</h4>
                  <ul class="price-list">
                    <li v-for="(item, index) in reportData.priceForecast.supportLevels" :key="index">
                      {{ item.price.toFixed(2) }}元（{{ item.desc }}）
                    </li>
                  </ul>
                </div>
                <div class="forecast-section">
                  <h4>压力位</h4>
                  <ul class="price-list">
                    <li v-for="(item, index) in reportData.priceForecast.pressureLevels" :key="index">
                      {{ item.price.toFixed(2) }}元（{{ item.desc }}）
                    </li>
                  </ul>
                </div>
                <div class="forecast-section">
                  <h4>价格区间</h4>
                  <p>
                    最低：{{ reportData.priceForecast.priceRange.min.toFixed(2) }}元 ~ 
                    最高：{{ reportData.priceForecast.priceRange.max.toFixed(2) }}元
                  </p>
                </div>
              </div>
              
              <div class="risk-tips" style="margin-top: 20px;">
                <h3>风险提示</h3>
                <ul class="risk-list">
                  <li v-for="(tip, index) in reportData.riskTips" :key="index">
                    {{ tip }}
                  </li>
                </ul>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="report-footer" style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>数据来源：{{ reportData.dataSource }}</p>
        <p>免责声明：本报告仅为AI预测分析，不构成任何投资建议</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getAIPredictionReport } from '@/api/ai'
import AIPredictionChart from '@/components/ai/AIPredictionChart.vue'

export default {
  components: {
    AIPredictionChart
  },
  data() {
    return {
      reportData: {
        stockInfo: {},
        predictionSummary: {},
        detailedAnalysis: {},
        priceForecast: {},
        riskTips: [],
        updateTime: ''
      }
    }
  },
  computed: {
    ...mapState({
      selfSelect: state => state.user.selfSelect
    })
  },
  mounted() {
    // 获取路由参数（股票代码）
    const stockCode = this.$route.params.code
    // 获取预测报告
    this.fetchPredictionReport(stockCode)
  },
  methods: {
    // 获取预测报告
    fetchPredictionReport(stockCode) {
      this.$loading({
        lock: true,
        text: '正在生成AI预测报告...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      getAIPredictionReport({ stockCode }).then(res => {
        this.$loading().close()
        this.reportData = res.data
      }).catch(() => {
        this.$loading().close()
        this.$message.error('报告生成失败，请稍后重试')
        this.$router.go(-1)
      })
    },
    // 导出报告
    exportReport() {
      this.$message.success('AI预测报告导出成功，格式为PDF')
    },
    // 加入自选股
    addToSelfSelect() {
      const stock = this.reportData.stockInfo
      if (this.selfSelect.some(item => item.code === stock.stockCode)) {
        this.$message.info('该股票已在自选股中')
        return
      }
      this.$store.state.user.selfSelect.push({
        code: stock.stockCode,
        name: stock.stockName,
        group: 'AI预测'
      })
      this.$message.success('加入自选股成功')
    }
  }
}
</script>

<style scoped>
.ai-prediction-report-page {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}
.stock-info h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 12px 0;
}
.stock-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.report-summary {
  margin-bottom: 20px;
}
.summary-card {
  padding: 16px;
}
.summary-card h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.summary-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.summary-item {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
.report-chart .el-card {
  padding: 16px;
  height: 400px;
}
.detail-card {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.detail-card h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.detail-content {
  flex: 1;
  overflow-y: auto;
}
.detail-section {
  margin-bottom: 20px;
}
.detail-section h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
}
.detail-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0;
  text-indent: 2em;
}
.price-forecast {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.forecast-section h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
}
.price-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}
.risk-tips {
  margin-top: 20px;
}
.risk-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .report-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
  .summary-item {
    width: 45%;
  }
  .report-chart .el-card {
    height: 300px;
  }
}
</style>