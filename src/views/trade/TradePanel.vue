<template>
  <div class="trade-panel">
    <el-row :gutter="20">
      <!-- 左侧：账户信息 + 委托表单 -->
      <el-col :xs="24" :lg="8">
        <div class="left-panel">
          <el-card shadow="hover" class="account-card">
            <div class="card-header">
              <h3>资金账户</h3>
              <el-button type="text" icon="el-icon-refresh" @click="fetchAccountInfo">刷新</el-button>
            </div>
            <div class="account-info">
              <div class="info-item">
                <div class="label">总资产</div>
                <div class="value">{{ accountInfo.totalAsset.toFixed(2) }} 元</div>
              </div>
              <div class="info-item">
                <div class="label">可用资金</div>
                <div class="value">{{ accountInfo.availableBalance.toFixed(2) }} 元</div>
              </div>
              <div class="info-item">
                <div class="label">冻结资金</div>
                <div class="value">{{ accountInfo.frozenBalance.toFixed(2) }} 元</div>
              </div>
              <div class="info-item profit-item">
                <div class="label">今日盈亏</div>
                <div class="value" :class="accountInfo.todayProfit >= 0 ? 'rise' : 'fall'">
                  {{ accountInfo.todayProfit >= 0 ? '+' : '' }}{{ accountInfo.todayProfit.toFixed(2) }} 元
                </div>
              </div>
              <div class="info-item profit-item">
                <div class="label">总盈亏</div>
                <div class="value" :class="accountInfo.totalProfit >= 0 ? 'rise' : 'fall'">
                  {{ accountInfo.totalProfit >= 0 ? '+' : '' }}{{ accountInfo.totalProfit.toFixed(2) }} 元
                  <span class="rate">({{ accountInfo.profitRate.toFixed(2) }}%)</span>
                </div>
              </div>
            </div>
          </el-card>
          
          <div class="form-container" style="margin-top: 20px;">
            <TradeForm 
              :preset-stock="presetStock" 
              @submitSuccess="handleSubmitSuccess"
            />
          </div>
        </div>
      </el-col>
      
      <!-- 右侧：持仓 + 委托单 -->
      <el-col :xs="24" :lg="16">
        <div class="right-panel">
          <el-card shadow="hover" class="position-card">
            <PositionList @sell="handleSell" />
          </el-card>
          
          <el-card shadow="hover" class="order-card" style="margin-top: 20px;">
            <OrderList />
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import TradeForm from '@/components/trade/TradeForm.vue'
import PositionList from '@/components/trade/PositionList.vue'
import OrderList from '@/components/trade/OrderList.vue'
import { getAccountInfo } from '@/api/trade'

export default {
  components: {
    TradeForm,
    PositionList,
    OrderList
  },
  data() {
    return {
      presetStock: {}, // 预设卖出的股票信息
      accountInfo: {
        availableBalance: 0,
        frozenBalance: 0,
        totalAsset: 0,
        todayProfit: 0,
        totalProfit: 0,
        profitRate: 0
      }
    }
  },
  mounted() {
    this.fetchAccountInfo()
  },
  methods: {
    // 获取账户信息
    fetchAccountInfo() {
      getAccountInfo().then(res => {
        this.accountInfo = res.data
      })
    },
    // 处理卖出操作
    handleSell(stock) {
      this.presetStock = stock
      // 滚动到表单区域
      document.querySelector('.form-container').scrollIntoView({
        behavior: 'smooth'
      })
    },
    // 委托提交成功
    handleSubmitSuccess() {
      // 重置预设股票
      this.presetStock = {}
      // 刷新数据
      this.fetchAccountInfo()
      // 触发子组件刷新
      this.$nextTick(() => {
        this.$children.forEach(child => {
          if (child.fetchHoldList) child.fetchHoldList()
          if (child.fetchOrderList) child.fetchOrderList()
        })
      })
    }
  }
}
</script>

<style scoped>
.trade-panel {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}
.account-card {
  padding: 16px;
}
.card-header {
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
.account-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.info-item {
  display: flex;
  flex-direction: column;
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
.profit-item .value {
  font-size: 14px;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
}
.rate {
  font-size: 12px;
  margin-left: 4px;
}
.form-container {
  flex: 1;
}
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}
.position-card, .order-card {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}
/* 移动端适配 */
@media screen and (max-width: 1199px) {
  .left-panel, .right-panel {
    height: auto;
  }
  .position-card, .order-card {
    margin-bottom: 20px;
  }
  .account-info {
    grid-template-columns: 1fr;
  }
}
</style>