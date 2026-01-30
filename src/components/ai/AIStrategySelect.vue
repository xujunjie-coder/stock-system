<template>
  <div class="ai-strategy-select">
    <el-card shadow="hover" class="strategy-card">
      <div class="card-header">
        <h3>选股策略选择</h3>
      </div>
      <div class="strategy-list">
        <div 
          class="strategy-item" 
          v-for="strategy in strategyList" 
          :key="strategy.strategyId"
          :class="{ active: selectedStrategy === strategy.strategyId }"
          @click="selectStrategy(strategy.strategyId)"
        >
          <div class="strategy-name">{{ strategy.strategyName }}</div>
          <div class="strategy-desc">{{ strategy.desc }}</div>
          <div class="strategy-meta">
            <span class="apply-market">适用市场：{{ strategy.applyMarket }}</span>
            <span class="accuracy-rate">历史准确率：{{ strategy.accuracyRate }}%</span>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card shadow="hover" class="filter-card" style="margin-top: 20px;">
      <div class="card-header">
        <h3>高级筛选</h3>
      </div>
      <div class="filter-content">
        <el-form :model="filterForm" label-width="100px">
          <el-form-item label="市场类型">
            <el-select v-model="filterForm.marketType" placeholder="选择市场">
              <el-option label="沪深A股" value="cn_a"></el-option>
              <el-option label="创业板" value="gem"></el-option>
              <el-option label="全部市场" value="all"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="风险等级">
            <el-select v-model="filterForm.riskLevel" placeholder="选择风险等级">
              <el-option label="低风险" value="low"></el-option>
              <el-option label="中风险" value="medium"></el-option>
              <el-option label="高风险" value="high"></el-option>
              <el-option label="全部风险" value="all"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="行业过滤">
            <el-select v-model="filterForm.industry" placeholder="选择行业">
              <el-option label="全行业" value="all"></el-option>
              <el-option label="消费" value="consumption"></el-option>
              <el-option label="科技" value="tech"></el-option>
              <el-option label="金融" value="finance"></el-option>
              <el-option label="制造" value="manufacture"></el-option>
              <el-option label="医药" value="medical"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="选股数量">
            <el-input-number 
              v-model="filterForm.stockCount" 
              :min="5" 
              :max="20" 
              :step="1" 
              placeholder="5-20只"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <div class="action-container" style="text-align: center; margin-top: 20px;">
      <el-button 
        type="primary" 
        size="large"
        @click="confirmStrategy"
        :disabled="!selectedStrategy"
      >
        开始选股
      </el-button>
    </div>
  </div>
</template>

<script>
import { getAIStrategyList } from '@/api/ai'

export default {
  data() {
    return {
      strategyList: [],
      selectedStrategy: '',
      filterForm: {
        marketType: 'all',
        riskLevel: 'medium',
        industry: 'all',
        stockCount: 10
      }
    }
  },
  mounted() {
    this.fetchStrategyList()
  },
  methods: {
    // 获取策略列表
    fetchStrategyList() {
      getAIStrategyList().then(res => {
        this.strategyList = res.data
        // 默认选中第一个策略
        if (this.strategyList.length > 0) {
          this.selectedStrategy = this.strategyList[0].strategyId
        }
      })
    },
    // 选择策略
    selectStrategy(strategyId) {
      this.selectedStrategy = strategyId
    },
    // 确认策略并触发选股
    confirmStrategy() {
      this.$emit('strategyConfirm', {
        strategyId: this.selectedStrategy,
        marketType: this.filterForm.marketType,
        riskLevel: this.filterForm.riskLevel === 'all' ? 'medium' : this.filterForm.riskLevel,
        industry: this.filterForm.industry,
        count: this.filterForm.stockCount
      })
    }
  }
}
</script>

<style scoped>
.ai-strategy-select {
  width: 100%;
}
.strategy-card, .filter-card {
  padding: 16px;
}
.card-header {
  margin-bottom: 16px;
}
h3 {
  font-size: 16px;
  color: #333;
  margin: 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.strategy-item {
  padding: 16px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.strategy-item:hover {
  border-color: #e53935;
  background-color: #fef0f0;
}
.strategy-item.active {
  border-color: #e53935;
  background-color: #fef0f0;
}
.strategy-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}
.strategy-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}
.strategy-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
.filter-content {
  padding: 8px;
}
.el-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
.el-form-item {
  margin-bottom: 16px;
}
.action-container {
  padding: 16px;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .el-form {
    flex-direction: column;
    align-items: flex-start;
  }
  .el-form-item {
    width: 100%;
  }
  .el-select, .el-input-number {
    width: 100%;
  }
}
</style>