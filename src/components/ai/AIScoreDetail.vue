<template>
  <el-dialog
    title="评分维度拆解"
    v-model="visible"
    width="400px"
    :append-to-body="true"
  >
    <div class="score-detail">
      <div class="stock-info">
        <span class="stock-name">{{ stockName }}({{ stockCode }})</span>
        <span class="total-score">综合评分：{{ totalScore }}分</span>
      </div>
      
      <div class="score-list">
        <div class="score-item">
          <div class="score-label">估值维度</div>
          <div class="score-bar-container">
            <el-progress 
              :percentage="scoreDetail.valuation" 
              :color="getScoreColor(scoreDetail.valuation)"
              :show-text="true"
            ></el-progress>
          </div>
        </div>
        
        <div class="score-item">
          <div class="score-label">成长维度</div>
          <div class="score-bar-container">
            <el-progress 
              :percentage="scoreDetail.growth" 
              :color="getScoreColor(scoreDetail.growth)"
              :show-text="true"
            ></el-progress>
          </div>
        </div>
        
        <div class="score-item">
          <div class="score-label">资金维度</div>
          <div class="score-bar-container">
            <el-progress 
              :percentage="scoreDetail.capital" 
              :color="getScoreColor(scoreDetail.capital)"
              :show-text="true"
            ></el-progress>
          </div>
        </div>
        
        <div class="score-item">
          <div class="score-label">政策维度</div>
          <div class="score-bar-container">
            <el-progress 
              :percentage="scoreDetail.policy" 
              :color="getScoreColor(scoreDetail.policy)"
              :show-text="true"
            ></el-progress>
          </div>
        </div>
      </div>
      
      <div class="score-desc" style="margin-top: 20px;">
        <h4>评分说明</h4>
        <ul>
          <li>90分以上：优秀</li>
          <li>80-89分：良好</li>
          <li>70-79分：一般</li>
          <li>70分以下：较差</li>
        </ul>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stockCode: {
      type: String,
      required: true
    },
    stockName: {
      type: String,
      required: true
    },
    totalScore: {
      type: Number,
      required: true
    },
    scoreDetail: {
      type: Object,
      default: () => ({
        valuation: 0,
        growth: 0,
        capital: 0,
        policy: 0
      })
    }
  },
  methods: {
    // 根据分数获取颜色
    getScoreColor(score) {
      if (score >= 90) return '#e53935'
      if (score >= 80) return '#faad14'
      if (score >= 70) return '#1890ff'
      return '#2f9b56'
    }
  },
  watch: {
    visible(val) {
      // 弹窗关闭时通知父组件
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  }
}
</script>

<style scoped>
.score-detail {
  padding: 8px;
}
.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}
.stock-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.total-score {
  font-size: 14px;
  color: #e53935;
  font-weight: bold;
}
.score-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.score-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.score-label {
  font-size: 14px;
  color: #666;
}
.score-bar-container {
  width: 100%;
}
.score-desc {
  font-size: 14px;
  color: #666;
}
.score-desc h4 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #333;
}
.score-desc ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
}
</style>