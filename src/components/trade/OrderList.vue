<template>
  <div class="order-list">
    <div class="list-header">
      <h3>委托单列表</h3>
      <div class="order-filter">
        <el-select 
          v-model="orderStatus" 
          placeholder="委托状态" 
          size="mini"
          @change="fetchOrderList"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="待成交" value="pending"></el-option>
          <el-option label="已成交" value="filled"></el-option>
          <el-option label="已撤单" value="cancelled"></el-option>
        </el-select>
        <el-button type="text" icon="el-icon-refresh" @click="fetchOrderList">刷新</el-button>
      </div>
    </div>
    
    <div class="order-table" v-if="orderList.length > 0">
      <div class="table-header">
        <div class="table-cell">委托编号</div>
        <div class="table-cell hidden-mobile">股票代码/名称</div>
        <div class="table-cell">方向</div>
        <div class="table-cell hidden-mobile">委托价格</div>
        <div class="table-cell">委托数量</div>
        <div class="table-cell hidden-mobile">成交数量</div>
        <div class="table-cell">状态</div>
        <div class="table-cell hidden-mobile">委托时间</div>
        <div class="table-cell">操作</div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="item in orderList" :key="item.orderId">
          <div class="table-cell">{{ item.orderId.slice(-8) }}</div>
          <div class="table-cell hidden-mobile">
            <div class="stock-info" @click="$router.push(`/detail/${item.stockCode}`)">
              <span class="code">{{ item.stockCode }}</span>
              <span class="name">{{ item.stockName }}</span>
            </div>
          </div>
          <div class="table-cell">
            <el-tag :type="item.orderDirection === 'buy' ? 'success' : 'danger'">
              {{ item.orderDirection === 'buy' ? '买入' : '卖出' }}
            </el-tag>
          </div>
          <div class="table-cell hidden-mobile">{{ item.orderPrice.toFixed(2) }}</div>
          <div class="table-cell">{{ item.orderAmount }}</div>
          <div class="table-cell hidden-mobile">{{ item.dealAmount }}</div>
          <div class="table-cell">
            <el-tag :type="getStatusTagType(item.orderStatus)">
              {{ getStatusText(item.orderStatus) }}
            </el-tag>
          </div>
          <div class="table-cell hidden-mobile">{{ item.createTime }}</div>
          <div class="table-cell">
            <el-button 
              v-if="item.orderStatus === 'pending'"
              type="text" 
              size="mini" 
              @click="handleCancelOrder(item.orderId)"
              icon="el-icon-close"
            >撤单</el-button>
            <span v-else>-</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-tip" v-else>
      <el-icon name="el-icon-info"></el-icon>
      <p>暂无委托单记录</p>
    </div>
  </div>
</template>

<script>
import { getOrderList, cancelOrder } from '@/api/trade'

export default {
  data() {
    return {
      orderList: [],
      orderStatus: ''
    }
  },
  mounted() {
    this.fetchOrderList()
  },
  methods: {
    // 获取委托单列表
    fetchOrderList() {
      getOrderList({ status: this.orderStatus }).then(res => {
        this.orderList = res.data.list
      })
    },
    // 获取状态文本
    getStatusText(status) {
      const map = {
        'pending': '待成交',
        'filled': '已成交',
        'cancelled': '已撤单'
      }
      return map[status] || '未知'
    },
    // 获取状态标签类型
    getStatusTagType(status) {
      const map = {
        'pending': 'warning',
        'filled': 'success',
        'cancelled': 'info'
      }
      return map[status] || 'default'
    },
    // 撤单操作
    handleCancelOrder(orderId) {
      this.$confirm('确定要撤单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cancelOrder({ orderId }).then(res => {
          this.$message.success(res.msg)
          this.fetchOrderList()
        })
      }).catch(() => {
        this.$message.info('已取消撤单')
      })
    }
  }
}
</script>

<style scoped>
.order-list {
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
.order-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.order-table {
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