<template>
  <div class="position-list">
    <div class="list-header">
      <h3>我的持仓</h3>
      <el-button type="text" icon="el-icon-refresh" @click="fetchHoldList">刷新</el-button>
    </div>
    
    <div class="position-table" v-if="holdList.length > 0">
      <div class="table-header">
        <div class="table-cell">股票代码/名称</div>
        <div class="table-cell hidden-mobile">市场类型</div>
        <div class="table-cell hidden-mobile">持仓数量</div>
        <div class="table-cell hidden-mobile">成本价</div>
        <div class="table-cell">当前价</div>
        <div class="table-cell">盈亏</div>
        <div class="table-cell hidden-mobile">盈亏比例</div>
        <div class="table-cell hidden-mobile">市值</div>
        <div class="table-cell">操作</div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="item in holdList" :key="item.holdId">
          <div class="table-cell">
            <div class="stock-info" @click="$router.push(`/detail/${item.stockCode}`)">
              <span class="code">{{ item.stockCode }}</span>
              <span class="name">{{ item.stockName }}</span>
            </div>
          </div>
          <div class="table-cell hidden-mobile">{{ item.marketType }}</div>
          <div class="table-cell hidden-mobile">{{ item.holdAmount }}</div>
          <div class="table-cell hidden-mobile">{{ item.avgCost.toFixed(2) }}</div>
          <div class="table-cell">{{ item.currentPrice.toFixed(2) }}</div>
          <div class="table-cell" :class="item.floatingProfit >= 0 ? 'rise' : 'fall'">
            {{ item.floatingProfit >= 0 ? '+' : '' }}{{ item.floatingProfit.toFixed(2) }}
          </div>
          <div class="table-cell hidden-mobile" :class="item.profitRate >= 0 ? 'rise' : 'fall'">
            {{ item.profitRate >= 0 ? '+' : '' }}{{ item.profitRate.toFixed(2) }}%
          </div>
          <div class="table-cell hidden-mobile">{{ item.marketValue.toFixed(2) }}</div>
          <div class="table-cell">
            <el-button 
              type="text" 
              size="mini" 
              @click="handleSell(item)"
              icon="el-icon-minus"
            >卖出</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-tip" v-else>
      <el-icon name="el-icon-info"></el-icon>
      <p>暂无持仓，请先买入股票</p>
    </div>
  </div>
</template>

<script>
import { getHoldList } from '@/api/trade'

export default {
  props: {
    // 卖出回调
    onSell: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      holdList: []
    }
  },
  mounted() {
    this.fetchHoldList()
    // 定时刷新持仓（5秒/次）
    this.refreshTimer = setInterval(() => {
      this.fetchHoldList()
    }, 5000)
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer)
  },
  methods: {
    // 获取持仓列表
    fetchHoldList() {
      getHoldList().then(res => {
        this.holdList = res.data
      })
    },
    // 处理卖出
    handleSell(item) {
      this.onSell({
        stockCode: item.stockCode,
        stockName: item.stockName,
        marketType: item.marketType,
        currentPrice: item.currentPrice
      })
    }
  }
}
</script>

<style scoped>
.position-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.list-header {
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
.position-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}
.table-header {
  display: flex;
  background-color: #f8f8f8;
  font-weight: bold;
}
.table-cell {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-size: 13px;
  border-right: 1px solid #e6e6e6;
}
.table-cell:last-child {
  border-right: none;
}
.table-body {
  flex: 1;
  overflow-y: auto;
}
.table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}
.table-row:hover {
  background-color: #fafafa;
}
.stock-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.code {
  font-weight: bold;
  font-size: 12px;
}
.name {
  font-size: 11px;
  color: #666;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
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
  font-size: 48px;
  margin-bottom: 16px;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .hidden-mobile {
    display: none;
  }
}
</style>