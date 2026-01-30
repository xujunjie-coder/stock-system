<template>
  <div class="stock-detail">
    <!-- 股票基础信息 -->
    <el-card shadow="hover" class="info-card">
      <div class="info-header">
        <div class="stock-basic">
          <h2>{{ stockInfo.name }}({{ stockInfo.code }})</h2>
          <div class="market-tag">{{ stockInfo.market }}</div>
        </div>
        <div class="stock-data">
          <div class="price">{{ stockInfo.price.toFixed(2) }}</div>
          <div class="change" :class="stockInfo.change_rate > 0 ? 'rise' : 'fall'">
            {{ stockInfo.change_rate > 0 ? '↑' : '↓' }}{{ stockInfo.change.toFixed(2) }} ({{ stockInfo.change_rate.toFixed(2) }}%)
          </div>
        </div>
        <el-button
          type="primary"
          icon="el-icon-star-on"
          class="add-self-select"
          @click="addSelfSelect"
        >
          {{ isSelfSelect ? '已添加' : '加入自选' }}
        </el-button>
      </div>
    </el-card>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- K线图区域 -->
      <el-card shadow="hover" class="kline-card">
        <KLineChart :code="stockInfo.code" />
      </el-card>

      <!-- AI预测区域 -->
      <el-card shadow="hover" class="predict-card">
        <div class="card-header">
          <h3>AI行情预测</h3>
        </div>
        <div class="predict-content">
          <div class="predict-item">
            <span class="label">上涨概率:</span>
            <span class="value rise">{{ predict.up_probability }}%</span>
          </div>
          <div class="predict-item">
            <span class="label">目标价:</span>
            <span class="value">{{ predict.target_price.toFixed(2) }}元</span>
          </div>
          <div class="predict-item">
            <span class="label">历史准确率:</span>
            <span class="value">{{ predict.accuracy_rate }}%</span>
          </div>
        </div>
      </el-card>

      <!-- 关联股票区域 -->
      <el-card shadow="hover" class="related-card">
        <div class="card-header">
          <h3>关联股票</h3>
        </div>
        <div class="related-list">
          <div
            class="related-item"
            v-for="stock in relatedStocks"
            :key="stock.code"
            @click="$router.push(`/detail/${stock.code}`)"
          >
            <div class="stock-name">{{ stock.name }}({{ stock.code }})</div>
            <div class="stock-relation">{{ stock.relation }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getStockDetail } from '@/api/quote'
import KLineChart from '@/components/quote/KLineChart.vue'

export default {
  components: { KLineChart },
  data() {
    return {
      stockInfo: {
        code: '',
        name: '',
        price: 0,
        change: 0,
        change_rate: 0,
        market: ''
      },
      predict: {
        up_probability: 0,
        target_price: 0,
        accuracy_rate: 0
      },
      relatedStocks: []
    }
  },
  computed: {
    ...mapState({
      selfSelect: state => state.user.selfSelect || [] // 容错：selfSelect为空数组
    }),
    // 判断是否已加入自选
    isSelfSelect() {
      return this.selfSelect.some(stock => stock.code === this.stockInfo.code)
    }
  },
  mounted() {
    // 获取路由参数（股票代码），容错：无参数时默认传600519
    const code = this.$route.params.code || '600519'
    // 加载个股详情数据
    this.fetchStockDetail(code)
  },
  methods: {
    // 获取个股详情：新增异常捕获 + 数据容错
    fetchStockDetail(code) {
      // 前置校验：code格式错误直接提示
      if (!code || !/^\d{6}$/.test(code)) {
        this.$message.error('股票代码格式错误（需6位数字）')
        return
      }

      getStockDetail(code)
        .then(res => {
          // 容错：res或res.data为空时不赋值
          if (res && res.code === 200 && res.data) {
            this.stockInfo = { ...this.stockInfo, ...res.data.quote } // 合并赋值，保留初始结构
            this.predict = { ...this.predict, ...res.data.predict }
            this.relatedStocks = res.data.related_stocks || []
            // 规范修改Vuex：优先用commit（若无mutation，临时兼容）
            if (this.$store.commit) {
              this.$store.commit('quote/setCurrentStockCode', code)
            } else {
              this.$store.state.quote.currentStockCode = code
            }
          } else {
            this.$message.warning('个股数据格式异常')
          }
        })
        .catch(err => {
          // 捕获所有报错，避免页面卡死
          this.$message.error('个股详情加载失败：' + (err.message || '未知错误'))
          console.error('getStockDetail接口报错：', err)
        })
    },
    // 加入自选股：容错selfSelect为空
    addSelfSelect() {
      if (this.isSelfSelect) {
        this.$message.info('该股票已在自选股中')
        return
      }
      // 容错：selfSelect未初始化时创建数组
      if (!this.$store.state.user.selfSelect) {
        this.$store.state.user.selfSelect = []
      }
      this.$store.state.user.selfSelect.push({
        code: this.stockInfo.code,
        name: this.stockInfo.name,
        group: '默认分组'
      })
      this.$message.success('加入自选股成功')
    }
  }
}
</script>

<style scoped>
.stock-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card {
  padding: 16px;
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stock-basic {
  display: flex;
  align-items: center;
  gap: 8px;
}
.market-tag {
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.stock-data {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.price {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.change {
  font-size: 16px;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
}
.add-self-select {
  min-width: 120px;
}
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-bottom: 16px;
}
.kline-card, .predict-card, .related-card {
  padding: 16px;
}
.card-header {
  margin-bottom: 16px;
}
h3 {
  font-size: 16px;
  color: #333;
  margin: 0;
}
.predict-content {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.predict-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.label {
  color: #666;
  font-size: 14px;
}
.value {
  font-size: 16px;
  font-weight: bold;
}
.related-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.related-item {
  background-color: #f8f8f8;
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.related-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.stock-name {
  font-weight: bold;
  margin-bottom: 4px;
}
.stock-relation {
  font-size: 12px;
  color: #666;
}
</style>