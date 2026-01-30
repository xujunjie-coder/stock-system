<template>
  <div class="trade-form">
    <el-card shadow="hover">
      <div class="form-header">
        <el-radio-group v-model="tradeDirection" size="medium">
          <el-radio label="buy">买入</el-radio>
          <el-radio label="sell">卖出</el-radio>
        </el-radio-group>
      </div>
      
      <el-form
        ref="tradeForm"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="trade-form-content"
      >
        <el-form-item label="股票代码" prop="stockCode">
          <el-autocomplete
            v-model="form.stockCode"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            placeholder="输入股票代码/名称"
            @select="handleStockSelect"
            class="code-input"
          ></el-autocomplete>
        </el-form-item>
        
        <el-form-item label="股票名称" prop="stockName">
          <el-input v-model="form.stockName" readonly placeholder="自动填充"></el-input>
        </el-form-item>
        
        <el-form-item label="市场类型" prop="marketType">
          <el-input v-model="form.marketType" readonly placeholder="自动识别"></el-input>
        </el-form-item>
        
        <el-form-item label="委托价格" prop="orderPrice">
          <el-input
            v-model="form.orderPrice"
            type="number"
            step="0.01"
            placeholder="请输入委托价格"
          >
            <template slot="append">元</template>
          </el-input>
          <div class="price-tip" v-if="form.currentPrice">
            当前市价: {{ form.currentPrice }}元 (±5% 范围: {{ priceRange.min }} - {{ priceRange.max }}元)
          </div>
        </el-form-item>
        
        <el-form-item label="委托数量" prop="orderAmount">
          <el-input
            v-model="form.orderAmount"
            type="number"
            placeholder="请输入委托数量"
          >
            <template slot="append">股</template>
          </el-input>
          <div class="amount-tip">
            {{ form.marketType === '科创板' ? '科创板≥200股' : '≥100股' }}, 需为100股的整数倍
          </div>
        </el-form-item>
        
        <el-form-item label="交易密码" prop="tradePwd">
          <el-input
            v-model="form.tradePwd"
            type="password"
            placeholder="请输入6位数字交易密码"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="委托金额">
          <el-input
            v-model="totalAmount"
            readonly
            type="number"
          >
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="可用资金" v-if="tradeDirection === 'buy'">
          <el-input
            v-model="accountInfo.availableBalance"
            readonly
            type="number"
          >
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="可用持仓" v-if="tradeDirection === 'sell' && form.stockCode">
          <el-input
            v-model="availableHold"
            readonly
            type="number"
          >
            <template slot="append">股</template>
          </el-input>
        </el-form-item>
        
        <el-form-item class="form-submit">
          <el-button type="primary" @click="submitOrder">提交委托</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import validator from '@/utils/validator'
import { submitBuyOrder, submitSellOrder, getAccountInfo, getHoldList } from '@/api/trade'
import request from '@/utils/request'

export default {
  props: {
    // 预设的股票信息（卖出时传入）
    presetStock: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tradeDirection: 'buy', // buy/sell
      form: {
        stockCode: '',
        stockName: '',
        marketType: '',
        orderPrice: '',
        orderAmount: '',
        tradePwd: '',
        currentPrice: '' // 当前市价（用于价格校验）
      },
      rules: {
        stockCode: [{ validator: validator.validateStockCode, trigger: 'blur' }],
        stockName: [{ required: true, message: '请选择股票', trigger: 'blur' }],
        marketType: [{ required: true, message: '市场类型不能为空', trigger: 'blur' }],
        orderPrice: [{ validator: validator.validatePrice, trigger: 'blur' }],
        orderAmount: [{ validator: validator.validateAmount, trigger: 'blur' }],
        tradePwd: [{ validator: validator.validateTradePwd, trigger: 'blur' }]
      },
      accountInfo: {
        availableBalance: 0
      },
      availableHold: 0, // 可用持仓数量
      searchSuggestions: []
    }
  },
  computed: {
    ...mapState({
      selfSelectStocks: state => state.user.selfSelect
    }),
    // 计算委托总金额
    totalAmount: {
      get() {
        if (!this.form.orderPrice || !this.form.orderAmount) return ''
        return (parseFloat(this.form.orderPrice) * parseInt(this.form.orderAmount)).toFixed(2)
      },
      set(val) {}
    },
    // 价格允许范围（±5%）
    priceRange() {
      if (!this.form.currentPrice) return { min: 0, max: 0 }
      const price = parseFloat(this.form.currentPrice)
      return {
        min: (price * 0.95).toFixed(2),
        max: (price * 1.05).toFixed(2)
      }
    }
  },
  watch: {
    // 监听预设股票变化
    presetStock: {
      immediate: true,
      handler(val) {
        if (val.stockCode) {
          this.form.stockCode = val.stockCode
          this.form.stockName = val.stockName
          this.form.marketType = val.marketType
          this.form.currentPrice = val.currentPrice
          this.tradeDirection = 'sell'
          // 获取可用持仓
          this.getAvailableHold(val.stockCode)
        }
      }
    },
    // 监听股票代码变化
    'form.stockCode': function(val) {
      if (val && val.length === 6) {
        this.getStockInfo(val)
      }
    }
  },
  mounted() {
    // 获取账户信息
    this.fetchAccountInfo()
  },
  methods: {
    // 获取账户信息
    fetchAccountInfo() {
      getAccountInfo().then(res => {
        this.accountInfo = res.data
      })
    },
    // 获取股票信息（含当前价、市场类型）
    getStockInfo(code) {
      request.get('/api/quote/getStockDetail', { params: { code } }).then(res => {
        const data = res.data.quote
        this.form.stockName = data.name
        this.form.marketType = data.market
        this.form.currentPrice = data.price
        // 卖出时获取可用持仓
        if (this.tradeDirection === 'sell') {
          this.getAvailableHold(code)
        }
      })
    },
    // 获取可用持仓数量
    getAvailableHold(code) {
      getHoldList().then(res => {
        const hold = res.data.find(item => item.stockCode === code)
        this.availableHold = hold ? hold.holdAmount : 0
      })
    },
    // 搜索联想
    querySearch(queryString, cb) {
      if (!queryString) {
        // 显示自选股
        cb(this.selfSelectStocks.map(item => ({
          value: `${item.name}(${item.code})`,
          code: item.code,
          name: item.name,
          market: item.market || '沪A'
        })))
        return
      }
      // 调用搜索接口
      request.get('/api/search/suggest', { params: { keyword: queryString } }).then(res => {
        this.searchSuggestions = res.data.filter(item => item.type === 'stock')
        cb(this.searchSuggestions)
      })
    },
    // 选择股票
    handleStockSelect(item) {
      this.form.stockCode = item.code || item.value.match(/\((\d+)\)/)[1]
      this.form.stockName = item.name
      this.form.marketType = item.market || '沪A'
      // 获取股票当前价
      this.getStockInfo(this.form.stockCode)
    },
    // 提交委托
    submitOrder() {
      this.$refs.tradeForm.validate((valid) => {
        if (valid) {
          // 数量倍数校验
          if (parseInt(this.form.orderAmount) % 100 !== 0) {
            this.$message.error('委托数量需为100股的整数倍')
            return
          }
          // 价格范围校验
          const price = parseFloat(this.form.orderPrice)
          const minPrice = parseFloat(this.priceRange.min)
          const maxPrice = parseFloat(this.priceRange.max)
          if (price < minPrice || price > maxPrice) {
            this.$confirm('当前委托价格偏离市价±5%，是否继续提交？', '价格提示', {
              confirmButtonText: '继续提交',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.doSubmitOrder()
            })
            return
          }
          // 正常提交
          this.doSubmitOrder()
        } else {
          this.$message.error('请完善表单信息')
          return false
        }
      })
    },
    // 执行提交委托
    doSubmitOrder() {
      const submitData = {
        stockCode: this.form.stockCode,
        stockName: this.form.stockName,
        marketType: this.form.marketType,
        orderPrice: parseFloat(this.form.orderPrice),
        orderAmount: parseInt(this.form.orderAmount),
        tradePwd: this.form.tradePwd,
        currentPrice: parseFloat(this.form.currentPrice)
      }
      
      const submitFunc = this.tradeDirection === 'buy' ? submitBuyOrder : submitSellOrder
      submitFunc(submitData).then(res => {
        this.$message.success(res.msg)
        this.resetForm()
        // 通知父组件刷新数据
        this.$emit('submitSuccess')
      }).catch(err => {
        this.$message.error(err.msg || '委托提交失败')
      })
    },
    // 重置表单
    resetForm() {
      this.$refs.tradeForm.resetFields()
      this.form.currentPrice = ''
      this.availableHold = 0
    }
  }
}
</script>

<style scoped>
.trade-form {
  width: 100%;
}
.form-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}
.trade-form-content {
  padding: 10px 0;
}
.code-input {
  width: 100%;
}
.price-tip, .amount-tip {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
.form-submit {
  text-align: center;
  margin-top: 20px;
}
</style>