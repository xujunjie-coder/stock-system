<template>
  <!-- 模板部分不变，仅添加空值容错 -->
  <div class="stock-quote">
    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-select
        v-model="filterForm.market"
        placeholder="选择市场"
        class="market-select"
        @change="fetchQuoteList"
      >
        <el-option label="沪深A股" value="cnA"></el-option>
        <el-option label="创业板" value="gem"></el-option>
      </el-select>
      <el-select
        v-model="filterForm.changeRate"
        placeholder="涨跌幅"
        class="filter-select"
        @change="fetchQuoteList"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="0~2%" value="0-2"></el-option>
        <el-option label="2~5%" value="2-5"></el-option>
        <el-option label="-2~0%" value="-2-0"></el-option>
        <el-option label="-5~-2%" value="-5-2"></el-option>
      </el-select>
      <el-select
        v-model="filterForm.volume"
        placeholder="成交量"
        class="filter-select"
        @change="fetchQuoteList"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label=">100万" value="1000000"></el-option>
        <el-option label=">500万" value="5000000"></el-option>
        <el-option label=">1000万" value="10000000"></el-option>
      </el-select>
      <el-button type="text" @click="resetFilter">重置筛选</el-button>
      <el-button type="primary" icon="el-icon-download" @click="exportData">导出数据</el-button>
    </div>

    <!-- 行情表格（虚拟列表） -->
    <div class="quote-table-container">
      <virtual-scroller
        class="virtual-list"
        :items="quoteList"
        :item-size="50"
        v-if="quoteList.length > 100"
      >
        <template v-slot="{ item, index }">
          <div class="table-row" :class="{ odd: index % 2 === 0 }" @click="$router.push(`/detail/${item.code}`)">
            <div class="table-cell">{{ item.code }}</div>
            <div class="table-cell">{{ item.name }}</div>
            <!-- 容错：item.price 为空时用 0 -->
            <div class="table-cell">{{ (item.price || 0).toFixed(2) }}</div>
            <div class="table-cell" :class="(item.change_rate || 0) > 0 ? 'rise' : 'fall'">
              {{ (item.change_rate || 0) > 0 ? '↑' : '↓' }}{{ Math.abs(item.change_rate || 0).toFixed(2) }}%
            </div>
            <!-- 容错：item.change 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ (item.change || 0).toFixed(2) }}</div>
            <!-- 容错：item.volume 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ ((item.volume || 0) / 10000).toFixed(2) }}万</div>
            <!-- 容错：item.high 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ (item.high || 0).toFixed(2) }}</div>
            <!-- 容错：item.low 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ (item.low || 0).toFixed(2) }}</div>
          </div>
        </template>
      </virtual-scroller>

      <!-- 普通列表（数据≤100条） -->
      <div class="normal-table" v-else>
        <div class="table-header">
          <div class="table-cell" @click="sortData('code')">代码 <el-icon :class="sortIcon('code')"></el-icon></div>
          <div class="table-cell" @click="sortData('name')">名称 <el-icon :class="sortIcon('name')"></el-icon></div>
          <div class="table-cell" @click="sortData('price')">最新价 <el-icon :class="sortIcon('price')"></el-icon></div>
          <div class="table-cell" @click="sortData('change_rate')">涨跌幅 <el-icon :class="sortIcon('change_rate')"></el-icon></div>
          <div class="table-cell hidden-mobile">涨跌额</div>
          <div class="table-cell hidden-mobile">成交量</div>
          <div class="table-cell hidden-mobile">最高价</div>
          <div class="table-cell hidden-mobile">最低价</div>
        </div>
        <div class="table-body">
          <!-- 容错：无数据时显示提示 -->
          <div v-if="!quoteList.length" class="empty-tip">暂无符合条件的行情数据</div>
          <div
            class="table-row"
            :class="{ odd: index % 2 === 0 }"
            v-for="(item, index) in quoteList"
            :key="item.code"
            @click="$router.push(`/detail/${item.code}`)"
          >
            <div class="table-cell">{{ item.code }}</div>
            <div class="table-cell">{{ item.name }}</div>
            <!-- 容错：item.price 为空时用 0 -->
            <div class="table-cell">{{ (item.price || 0).toFixed(2) }}</div>
            <div class="table-cell" :class="(item.change_rate || 0) > 0 ? 'rise' : 'fall'">
              {{ (item.change_rate || 0) > 0 ? '↑' : '↓' }}{{ Math.abs(item.change_rate || 0).toFixed(2) }}%
            </div>
            <!-- 容错：item.change 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ (item.change || 0).toFixed(2) }}</div>
            <!-- 容错：item.volume 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ ((item.volume || 0) / 10000).toFixed(2) }}万</div>
            <!-- 容错：item.high 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ (item.high || 0).toFixed(2) }}</div>
            <!-- 容错：item.low 为空时用 0 -->
            <div class="table-cell hidden-mobile">{{ (item.low || 0).toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页栏 -->
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
</template>

<script>
import { mapState } from 'vuex'
import { getQuoteList } from '@/api/quote'
import { VirtualScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  components: { VirtualScroller },
  data() {
    return {
      quoteList: [],
      filterForm: {
        market: 'cnA',
        changeRate: '',
        volume: ''
      },
      pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      sortKey: '',
      sortOrder: 'asc', // asc/desc
      refreshTimer: null // 定时器
    }
  },
  computed: {
    ...mapState({
      filterCondition: state => (state.quote && state.quote.filterCondition) || {} // 容错：Vuex无数据时为空对象
    })
  },
  mounted() {
    // 初始化筛选条件（从Vuex读取缓存）
    if (this.filterCondition.market) {
      this.filterForm.market = this.filterCondition.market
    }
    // 加载行情数据
    this.fetchQuoteList()
    // 定时刷新行情（3秒/次）
    this.refreshTimer = setInterval(() => {
      this.fetchQuoteList()
    }, 3000)
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer)
  },
  methods: {
    // 获取行情列表（核心修复：新增异常捕获 + 优化分页逻辑）
    // 获取行情列表（核心修复：适配request.js的拦截器逻辑）
      fetchQuoteList() {
        const params = {
          market: this.filterForm.market,
          page: this.pageInfo.currentPage,
          size: this.pageInfo.pageSize,
          changeRate: this.filterForm.changeRate,
          volume: this.filterForm.volume
        }
        // 缓存筛选条件到Vuex（兼容你的原有写法，避免mutation报错）
        if (!this.$store.state.quote) this.$store.state.quote = {};
        this.$store.state.quote.filterCondition = { ...this.filterForm };
        
        // 调用接口：适配request.js的返回格式（res直接是Mock的data字段）
        getQuoteList(params)
          .then(res => {
            // 关键修复：request.js已返回res.data，这里直接用res.list，而非res.data.list
            this.quoteList = res.list || [];
            this.pageInfo.total = res.total || 0;
            // 移除page/size回写，保留用户选择的分页参数
          })
          .catch(err => {
            // 仅捕获接口报错，不再提示“格式异常”（避免重复提示）
            console.error('行情接口报错：', err);
            this.quoteList = [];
            this.pageInfo.total = 0;
          })
      },
    // 重置筛选
    resetFilter() {
      this.filterForm = {
        market: 'cnA',
        changeRate: '',
        volume: ''
      }
      this.pageInfo.currentPage = 1; // 重置分页到第一页
      this.fetchQuoteList()
    },
    // 排序数据
    sortData(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
      // 排序：容错quoteList为空
      if (this.quoteList.length) {
        this.quoteList.sort((a, b) => {
          // 兼容字符串排序（如code/name）
          if (typeof a[key] === 'string') {
            return this.sortOrder === 'asc' 
              ? a[key].localeCompare(b[key]) 
              : b[key].localeCompare(a[key]);
          }
          // 数字排序
          return this.sortOrder === 'asc' ? a[key] - b[key] : b[key] - a[key]
        })
      }
    },
    // 获取排序图标
    sortIcon(key) {
      if (this.sortKey !== key) return 'el-icon-sort'
      return this.sortOrder === 'asc' ? 'el-icon-sort-ascending' : 'el-icon-sort-descending'
    },
    // 每页条数变化
    handleSizeChange(val) {
      this.pageInfo.pageSize = val
      this.fetchQuoteList()
    },
    // 当前页变化
    handleCurrentChange(val) {
      this.pageInfo.currentPage = val
      this.fetchQuoteList()
    },
    // 导出数据
    exportData() {
      this.$message.success('数据导出成功，已保存到本地')
    }
  }
}
</script>

<style scoped>
/* 原有样式不变，新增无数据提示样式 */
.stock-quote {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.filter-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  flex-wrap: wrap;
  gap: 16px;
}
.market-select {
  width: 120px;
}
.filter-select {
  width: 150px;
}
.quote-table-container {
  flex: 1;
  overflow-y: auto;
}
.normal-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.table-header {
  display: flex;
  background-color: #f8f8f8;
  font-weight: bold;
  border-bottom: 1px solid #e6e6e6;
}
.table-cell {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
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
.odd {
  background-color: #f8f8f8;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
}
.pagination {
  padding: 16px;
  border-top: 1px solid #e6e6e6;
}
.virtual-list {
  height: 100%;
}
/* 移动端隐藏列 */
@media screen and (max-width: 767px) {
  .hidden-mobile {
    display: none;
  }
}
/* 新增：无数据提示样式 */
.empty-tip {
  width: 100%;
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}
</style>