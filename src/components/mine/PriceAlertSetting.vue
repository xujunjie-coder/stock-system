<template>
  <div class="price-alert-setting">
    <el-card shadow="hover">
      <div class="card-header">
        <h3>行情提醒设置</h3>
        <el-button type="primary" icon="el-icon-plus" @click="addAlert">添加提醒</el-button>
      </div>
      
      <div class="alert-list" v-if="alertList.length > 0">
        <el-table
          :data="alertList"
          border
          stripe
          style="width: 100%;"
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
            prop="alertType"
            label="提醒类型"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag :type="scope.row.alertType === 'up' ? 'danger' : 'success'">
                {{ scope.row.alertType === 'up' ? '上涨提醒' : '下跌提醒' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="threshold"
            label="提醒阈值"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.threshold.toFixed(2) }}元
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="提醒状态"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-color="#1890ff"
                inactive-color="#cccccc"
                @change="toggleStatus(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-button 
                type="text" 
                size="mini" 
                icon="el-icon-delete"
                @click="deleteAlert(scope.row.id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="empty-tip" v-else>
        <el-icon name="el-icon-bell"></el-icon>
        <p>暂无行情提醒设置</p>
        <el-button type="text" @click="addAlert">点击添加提醒</el-button>
      </div>
    </el-card>
    
    <!-- 添加提醒弹窗 -->
    <el-dialog
      title="添加行情提醒"
      v-model="addDialogVisible"
      width="400px"
    >
      <el-form :model="alertForm" :rules="alertRules" ref="alertForm">
        <el-form-item label="股票代码" prop="stockCode">
          <el-autocomplete
            v-model="alertForm.stockCode"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            placeholder="输入股票代码/名称"
            @select="handleStockSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="股票名称" prop="stockName">
          <el-input v-model="alertForm.stockName" readonly></el-input>
        </el-form-item>
        <el-form-item label="提醒类型" prop="alertType">
          <el-select v-model="alertForm.alertType" placeholder="选择提醒类型">
            <el-option label="上涨提醒" value="up"></el-option>
            <el-option label="下跌提醒" value="down"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提醒阈值" prop="threshold">
          <el-input
            v-model="alertForm.threshold"
            type="number"
            step="0.01"
            placeholder="请输入提醒价格"
          >
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { setPriceAlert, deletePriceAlert, toggleAlertStatus, getPriceAlertList } from '@/api/user'
import request from '@/utils/request'

export default {
  data() {
    return {
      alertList: [],
      addDialogVisible: false,
      alertForm: {
        stockCode: '',
        stockName: '',
        alertType: 'up',
        threshold: ''
      },
      alertRules: {
        stockCode: [
          { required: true, message: '请选择股票', trigger: 'blur' }
        ],
        stockName: [
          { required: true, message: '股票名称不能为空', trigger: 'blur' }
        ],
        alertType: [
          { required: true, message: '请选择提醒类型', trigger: 'blur' }
        ],
        threshold: [
          { required: true, message: '请输入提醒阈值', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '阈值必须大于0', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      selfSelect: state => state.user.selfSelect
    })
  },
  mounted() {
    this.fetchAlertList()
  },
  methods: {
    // 获取提醒列表
    fetchAlertList() {
      getPriceAlertList().then(res => {
        this.alertList = res.data
      })
    },
    // 添加提醒
    addAlert() {
      this.alertForm = {
        stockCode: '',
        stockName: '',
        alertType: 'up',
        threshold: ''
      }
      this.addDialogVisible = true
    },
    // 搜索股票
    querySearch(queryString, cb) {
      if (!queryString) {
        // 显示自选股
        cb(this.selfSelect.map(item => ({
          value: `${item.name}(${item.code})`,
          code: item.code,
          name: item.name
        })))
        return
      }
      // 调用搜索接口
      request.get('/api/search/suggest', { params: { keyword: queryString } }).then(res => {
        const suggestions = res.data.filter(item => item.type === 'stock')
        cb(suggestions)
      })
    },
    // 选择股票
    handleStockSelect(item) {
      this.alertForm.stockCode = item.code || item.value.match(/\((\d+)\)/)[1]
      this.alertForm.stockName = item.name
      // 获取当前价格
      request.get('/api/quote/getStockDetail', { params: { code: this.alertForm.stockCode } }).then(res => {
        this.alertForm.currentPrice = res.data.quote.price
      })
    },
    // 确认添加
    confirmAdd() {
      this.$refs.alertForm.validate((valid) => {
        if (valid) {
          setPriceAlert({
            stockCode: this.alertForm.stockCode,
            stockName: this.alertForm.stockName,
            alertType: this.alertForm.alertType,
            threshold: this.alertForm.threshold,
            status: true
          }).then(res => {
            this.$message.success('提醒添加成功')
            this.alertList.push({
              id: Date.now(),
              ...this.alertForm,
              status: true
            })
            this.addDialogVisible = false
          })
        }
      })
    },
    // 切换提醒状态
    toggleStatus(alert) {
      toggleAlertStatus({
        id: alert.id,
        status: alert.status
      }).then(res => {
        this.$message.success(`提醒已${alert.status ? '开启' : '关闭'}`)
      })
    },
    // 删除提醒
    deleteAlert(id) {
      this.$confirm('确定要删除该提醒吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePriceAlert(id).then(res => {
          this.$message.success('提醒删除成功')
          this.alertList = this.alertList.filter(item => item.id !== id)
        })
      })
    }
  }
}
</script>

<style scoped>
.price-alert-setting {
  width: 100%;
}
.el-card {
  padding: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.alert-list {
  margin-bottom: 16px;
}
.empty-tip {
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
  .el-table {
    font-size: 12px;
  }
  .el-table-column {
    width: auto !important;
  }
}
</style>