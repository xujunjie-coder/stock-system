<template>
  <div class="ai-select-stock-page">
    <el-row :gutter="20">
      <!-- 左侧：策略选择 -->
      <el-col :xs="24" :lg="8">
        <AIStrategySelect @strategyConfirm="startSelectStock" />
      </el-col>
      
      <!-- 右侧：选股结果 -->
      <el-col :xs="24" :lg="16">
        <div class="result-container">
          <div class="result-header" v-if="selectResult.list && selectResult.list.length > 0">
            <div class="header-left">
              <h3>AI选股结果（{{ selectResult.total }}只）</h3>
              <p>策略：{{ selectResult.strategyName }} | 风险等级：{{ formatRiskLevel(selectResult.riskLevel) }} | 行业：{{ formatIndustry(selectResult.industry) }}</p>
            </div>
            <div class="header-right">
              <el-button type="primary" icon="el-icon-refresh" @click="refreshSelect">重新选股</el-button>
              <el-button type="success" icon="el-icon-s-data" @click="startBacktest">选股回测</el-button>
            </div>
          </div>
          
          <div class="result-table" v-if="selectResult.list && selectResult.list.length > 0">
            <el-table
              :data="selectResult.list"
              border
              stripe
              style="width: 100%;"
              @row-click="goToStockDetail"
            >
              <el-table-column
                prop="stockCode"
                label="股票代码"
                width="100"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="stockName"
                label="股票名称"
                width="120"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="industry"
                label="行业"
                width="100"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="currentPrice"
                label="当前价"
                width="100"
                align="center"
                :formatter="formatPrice"
              ></el-table-column>
              <el-table-column
                prop="targetPrice"
                label="目标价"
                width="100"
                align="center"
                :formatter="formatPrice"
              ></el-table-column>
              <el-table-column
                prop="score"
                label="评分"
                width="120"
                align="center"
              >
                <template slot-scope="scope">
                  <el-rate 
                    v-model="scope.row.score" 
                    disabled 
                    max="100"
                    show-score
                    text-color="#1989fa"
                    @click.stop="showScoreDetail(scope.row)"
                  ></el-rate>
                </template>
              </el-table-column>
              <el-table-column
                prop="riskLevel"
                label="风险等级"
                width="100"
                align="center"
              >
                <template slot-scope="scope">
                  <el-tag :type="getRiskTagType(scope.row.riskLevel)">
                    {{ formatRiskLevel(scope.row.riskLevel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="reason"
                label="选股理由"
                min-width="200"
              ></el-table-column>
              <el-table-column
                label="操作"
                width="180"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button 
                    type="text" 
                    size="mini" 
                    icon="el-icon-star-on"
                    @click.stop="addToSelfSelect(scope.row)"
                  >加入自选</el-button>
                  <el-button 
                    type="text" 
                    size="mini" 
                    icon="el-icon-view"
                    @click.stop="goToStockDetail(scope.row)"
                  >查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div class="empty-tip" v-else-if="!loading">
            <el-icon name="el-icon-robot"></el-icon>
            <p>请选择选股策略并点击"开始选股"获取AI推荐股票</p>
          </div>
          
          <div class="loading-tip" v-if="loading">
            <el-loading-spinner type="spinner"></el-loading-spinner>
            <p>AI正在选股中...（{{ loadingProgress }}%）</p>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 评分详情弹窗 -->
    <AIScoreDetail
      :visible.sync="scoreDetailVisible"
      :stock-code="currentStockCode"
      :stock-name="currentStockName"
      :total-score="currentTotalScore"
      :score-detail="currentScoreDetail"
    />
    
    <!-- 回测结果弹窗 -->
    <AIBacktestResult
      :visible.sync="backtestVisible"
      :backtest-data="backtestResult"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { aiSelectStock, aiStrategyBacktest } from '@/api/ai'
import AIStrategySelect from '@/components/ai/AIStrategySelect.vue'
import AIScoreDetail from '@/components/ai/AIScoreDetail.vue'
import AIBacktestResult from '@/components/ai/AIBacktestResult.vue'

export default {
  components: {
    AIStrategySelect,
    AIScoreDetail,
    AIBacktestResult
  },
  data() {
    return {
      selectResult: {},
      loading: false,
      loadingProgress: 0,
      scoreDetailVisible: false,
      currentStockCode: '',
      currentStockName: '',
      currentTotalScore: 0,
      currentScoreDetail: {},
      backtestVisible: false,
      backtestResult: {},
      selectParams: {}
    }
  },
  computed: {
    ...mapState({
      selfSelect: state => state.user.selfSelect
    })
  },
  methods: {
    // 开始选股
    startSelectStock(params) {
      this.selectParams = params
      this.loading = true
      this.loadingProgress = 0
      
      // 模拟加载进度
      const progressTimer = setInterval(() => {
        this.loadingProgress += Math.floor(Math.random() * 20)
        if (this.loadingProgress >= 100) {
          this.loadingProgress = 100
          clearInterval(progressTimer)
        }
      }, 300)
      
      // 调用AI选股接口
      aiSelectStock(params).then(res => {
        clearInterval(progressTimer)
        this.loading = false
        this.selectResult = res.data
      }).catch(() => {
        clearInterval(progressTimer)
        this.loading = false
        this.$message.error('AI选股失败，请稍后重试')
      })
    },
    // 重新选股
    refreshSelect() {
      this.startSelectStock(this.selectParams)
    },
    // 格式化价格
    formatPrice(row, column) {
      return parseFloat(row[column.prop]).toFixed(2)
    },
    // 格式化风险等级
    formatRiskLevel(riskLevel) {
      const map = {
        'low': '低风险',
        'medium': '中风险',
        'high': '高风险'
      }
      return map[riskLevel] || '中风险'
    },
    // 格式化行业
    formatIndustry(industry) {
      const map = {
        'all': '全行业',
        'consumption': '消费',
        'tech': '科技',
        'finance': '金融',
        'manufacture': '制造',
        'medical': '医药'
      }
      return map[industry] || '全行业'
    },
    // 获取风险标签类型
    getRiskTagType(riskLevel) {
      const map = {
        'low': 'success',
        'medium': 'warning',
        'high': 'danger'
      }
      return map[riskLevel] || 'warning'
    },
    // 显示评分详情
    showScoreDetail(row) {
      this.currentStockCode = row.stockCode
      this.currentStockName = row.stockName
      this.currentTotalScore = row.score
      this.currentScoreDetail = row.scoreDetail || {}
      this.scoreDetailVisible = true
    },
    // 加入自选股
    addToSelfSelect(row) {
      if (this.selfSelect.some(item => item.code === row.stockCode)) {
        this.$message.info('该股票已在自选股中')
        return
      }
      this.$store.state.user.selfSelect.push({
        code: row.stockCode,
        name: row.stockName,
        group: 'AI选股'
      })
      this.$message.success('加入自选股成功')
    },
    // 前往个股详情
    goToStockDetail(row) {
      this.$router.push(`/detail/${row.stockCode}`)
    },
    // 开始回测
    startBacktest() {
      if (!this.selectParams.strategyId) {
        this.$message.error('请先完成选股再进行回测')
        return
      }
      
      // 调用回测接口
      this.$loading({
        lock: true,
        text: '正在进行策略回测...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      aiStrategyBacktest({
        strategyId: this.selectParams.strategyId,
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      }).then(res => {
        this.$loading().close()
        this.backtestResult = res.data
        this.backtestVisible = true
      }).catch(() => {
        this.$loading().close()
        this.$message.error('回测失败，请稍后重试')
      })
    }
  }
}
</script>

<style scoped>
.ai-select-stock-page {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.result-container {
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
}
.header-left p {
  font-size: 14px;
  color: #666;
  margin: 0;
}
.result-table {
  flex: 1;
  overflow-y: auto;
}
.empty-tip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 32px 0;
}
.empty-tip el-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
.loading-tip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}
.loading-tip el-loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
}
/* 移动端适配 */
@media screen and (max-width: 1199px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-right {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
@media screen and (max-width: 767px) {
  .el-table {
    font-size: 12px;
  }
  .el-table-column {
    width: auto !important;
  }
  .result-container {
    padding: 8px;
  }
}
</style>