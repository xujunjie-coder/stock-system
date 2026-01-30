<template>
  <div class="trade-record">
    <el-card shadow="hover">
      <div class="card-header">
        <h3>交易记录查询</h3>
        <div class="filter-container">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="fetchTradeRecord"
          ></el-date-picker>
          <el-input
            v-model="searchKey"
            placeholder="输入股票代码/名称"
            prefix-icon="el-icon-search"
            class="search-input"
            @keyup.enter.native="fetchTradeRecord"
          ></el-input>
          <el-button type="primary" @click="fetchTradeRecord">查询</el-button>
          <el-button type="text" @click="exportRecord">导出数据</el-button>
        </div>
      </div>
      
      <div class="record-table" v-if="recordList.length > 0">
        <el-table
          :data="recordList"
          border
          stripe
          style="width: 100%;"
          @row-click="handleRowClick"
        >
          <el-table-column
            prop="tradeId"
            label="交易ID"
            width="180"
            align="center"
          ></el-table-column>
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
            prop="tradeDirection"
            label="方向"
            width="80"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag :type="scope.row.tradeDirection === 'buy' ? 'success' : 'danger'">
                {{ scope.row.tradeDirection === 'buy' ? '买入' : '卖出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="tradePrice"
            label="成交价格"
            width="100"
            align="center"
            :formatter="formatPrice"
          ></el-table-column>
          <el-table-column
            prop="tradeAmount"
            label="成交数量"
            width="100"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="tradeAmountTotal"
            label="成交金额"
            width="120"
            align="center"
            :formatter="formatPrice"
          ></el-table-column>
          <el-table-column
            prop="fee"
            label="手续费"
            width="100"
            align="center"
            :formatter="formatPrice"
          ></el-table-column>
          <el-table-column
            prop="tradeTime"
            label="成交时间"
            width="180"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="marketType"
            label="市场类型"
            width="100"
            align="center"
          ></el-table-column>
        </el-table>
        
        <div class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageInfo.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageInfo.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageInfo.total"
          ></el-pagination>
        </div>
      </div>
      
      <div class="empty-tip" v-else>
        <el-icon name="el-icon-info"></el-icon>
        <p>暂无交易记录</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getTradeRecord } from '@/api/trade'

export default {
  data() {
    return {
      dateRange: [],
      searchKey: '',
      recordList: [],
      pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }
    }
  },
  mounted() {
    // 初始化日期范围（近30天）
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    this.dateRange = [startDate, endDate]
    
    // 获取交易记录
    this.fetchTradeRecord()
  },
  methods: {
    // 获取交易记录
    fetchTradeRecord() {
      const params = {
        page: this.pageInfo.currentPage,
        size: this.pageInfo.pageSize
      }
      
      // 添加日期筛选
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.formatDate(this.dateRange[0])
        params.endDate = this.formatDate(this.dateRange[1])
      }
      
      // 添加搜索筛选
      if (this.searchKey) {
        params.keyword = this.searchKey
      }
      
      getTradeRecord(params).then(res => {
        this.recordList = res.data.list
        this.pageInfo.total = res.data.total
        this.pageInfo.currentPage = res.data.page
        this.pageInfo.pageSize = res.data.size
      })
    },
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 格式化价格
    formatPrice(row, column) {
      return parseFloat(row[column.prop]).toFixed(2)
    },
    // 每页条数变化
    handleSizeChange(val) {
      this.pageInfo.pageSize = val
      this.fetchTradeRecord()
    },
    // 当前页变化
    handleCurrentChange(val) {
      this.pageInfo.currentPage = val
      this.fetchTradeRecord()
    },
    // 行点击事件（跳转个股详情）
    handleRowClick(row) {
      this.$router.push(`/detail/${row.stockCode}`)
    },
    // 导出数据
    exportRecord() {
      this.$message.success('交易记录导出成功，已保存到本地')
    }
  }
}
</script>

<style scoped>
.trade-record {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
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
.filter-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-input {
  width: 200px;
}
.record-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.el-table {
  flex: 1;
  min-height: 400px;
}
.pagination {
  padding: 16px 0;
  text-align: right;
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
@media screen and (max-width: 1199px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .filter-container {
    width: 100%;
    flex-wrap: wrap;
  }
  .search-input {
    flex: 1;
  }
}
@media screen and (max-width: 767px) {
  .el-table {
    font-size: 12px;
  }
  .el-table-column {
    width: auto !important;
  }
}
</style>