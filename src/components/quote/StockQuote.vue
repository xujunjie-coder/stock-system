<template>
  <div class="stock-quote-container">
    <!-- 筛选组件 -->
    <QuoteFilter
      :filter-form="filterForm"
      :filter-tags="filterTags"
      :keyword="searchKeyword"
      @filter-change="handleFilterChange"
      @tags-update="handleTagsUpdate"
      @filter-reset="handleFilterReset"
      @search="handleSearch"
      @refresh="fetchQuoteList"
      @export="handleExport"
    />

    <!-- 表格组件 -->
    <QuoteTable
      :data="quoteList"
      :loading="loading"
      :is-pc="isPc"
      @sort-change="handleSortChange"
      @row-click="goToDetail"
    />

    <!-- 分页栏（数据≤100条显示） -->
    <!-- 新分页栏代码（始终显示） -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10, 20, 50]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import QuoteFilter from './QuoteFilter.vue'
import QuoteTable from './QuoteTable.vue'
import quoteApi from '@/api/quote'
import { getStorage, setStorage } from '@/utils/storage'

export default {
  name: 'StockQuote',
  components: { QuoteFilter, QuoteTable },
  data() {
    return {
      // 搜索关键词
      searchKeyword: '',
      // 行情列表原始数据
      quoteList: [],
      // 加载状态
      loading: false,
      // 分页参数
      page: 1,
      size: 20,
      total: 0,
      // 筛选表单
      filterForm: {
        changeRate: '',
        volume: ''
      },
      // 筛选标签
      filterTags: [],
      // 排序参数
      sortProp: '',
      sortOrder: ''
    }
  },
  computed: {
    ...mapState({
      isPc: state => state.quote.isPc
    })
  },
  mounted() {
    // 加载缓存的筛选条件
    this.loadFilterCache()
    // 初始化获取行情数据
    this.fetchQuoteList()
    // 初始化窗口 resize 监听
    this.$store.dispatch('quote/initResizeListener')
  },
  methods: {
    /**
     * 从LocalStorage加载筛选条件缓存
     */
    loadFilterCache() {
      const filterCache = getStorage('quoteFilterCache')
      if (filterCache) {
        this.filterForm = { ...this.filterForm, ...filterCache.form }
        this.filterTags = filterCache.tags || []
        this.page = filterCache.page || 1
        this.size = filterCache.size || 20
        this.searchKeyword = filterCache.keyword || ''
      }
    },

    /**
     * 缓存筛选条件到LocalStorage
     */
    saveFilterCache() {
      const cacheData = {
        form: this.filterForm,
        tags: this.filterTags,
        page: this.page,
        size: this.size,
        keyword: this.searchKeyword
      }
      setStorage('quoteFilterCache', cacheData, 86400) // 缓存24小时
    },

   /**
 * 获取行情列表数据
 */
async fetchQuoteList() {
  this.loading = true
  try {
    const params = {
      page: this.page,
      size: this.size,
      change_rate: this.filterForm.changeRate,
      volume: this.filterForm.volume,
      keyword: this.searchKeyword,
      sort_prop: this.sortProp,
      sort_order: this.sortOrder,
      industry: this.filterForm.industry, // 新增：行业筛选参数（对齐api）
      concept: this.filterForm.concept    // 新增：概念筛选参数（对齐api）
    }
    const res = await quoteApi.getQuoteList(params)
    // 原型标准格式解析（直接取根层级 list/total）
    if (res && res.code === 200) {
      this.quoteList = res.list || []
      this.total = res.total || 0
      this.saveFilterCache()
    } else {
      this.quoteList = []
      this.total = 0
      this.$message.warning('行情数据格式异常')
    }
  } catch (error) {
    this.quoteList = []
    this.total = 0
    this.$message.error('行情数据加载失败，请稍后重试')
    console.error('Quote list fetch error:', error)
  } finally {
    this.loading = false
  }
  console.log('行情数据加载完成', this.quoteList)
},

    /**
     * 筛选条件变化
     */
    handleFilterChange(form) {
      this.filterForm = form
      this.page = 1
      this.fetchQuoteList()
    },

    /**
     * 筛选标签更新
     */
    handleTagsUpdate(tags) {
      this.filterTags = tags
    },

    /**
     * 重置筛选条件
     */
    handleFilterReset() {
      this.filterForm = { changeRate: '', volume: '' }
      this.filterTags = []
      this.searchKeyword = ''
      this.page = 1
      this.fetchQuoteList()
      setStorage('quoteFilterCache', null)
    },

    /**
     * 搜索
     */
    handleSearch(keyword) {
      this.searchKeyword = keyword
      this.page = 1
      this.fetchQuoteList()
    },

    /**
     * 排序变化
     */
    handleSortChange({ sortProp, sortOrder }) {
      this.sortProp = sortProp
      this.sortOrder = sortOrder
      this.fetchQuoteList()
    },

    /**
     * 每页条数变化
     */
    handleSizeChange(size) {
      this.size = size
      this.page = 1
      this.fetchQuoteList()
    },

    /**
     * 页码变化
     */
    handleCurrentChange(page) {
      this.page = page
      this.fetchQuoteList()
    },

    /**
     * 导出行情数据
     */
    handleExport() {
      if (this.quoteList.length === 0) {
        this.$message.warning('暂无数据可导出')
        return
      }
      // 原型要求字段：代码/名称/最新价/涨跌幅/涨跌额/成交量/最高价/最低价
      const header = '代码,名称,最新价,涨跌幅(%),涨跌额,成交量(万手),最高价,最低价\n'
      const content = this.quoteList.map(item => {
        const changeRate = item.change_rate ? item.change_rate.toFixed(2) : '0.00'
        const change = item.change ? item.change.toFixed(2) : '0.00'
        const volume = item.volume ? (item.volume / 10000).toFixed(2) : '0.00' // 转万手单位
        const high = item.high ? item.high.toFixed(2) : '0.00'
        const low = item.low ? item.low.toFixed(2) : '0.00'
        return `${item.code},${item.name},${item.price},${changeRate},${change},${volume},${high},${low}`
      }).join('\n')
      const blob = new Blob([header + content], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `沪深A股行情_${new Date().toLocaleDateString()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      this.$message.success('数据导出成功')
    },
    /**
     * 跳转到个股详情页
     */
    goToDetail(code) {
      this.$router.push(`/detail/${code}`)
    }
  }
}
</script>

<style scoped>
.stock-quote-container {
  width: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
  height: 800px;
  overflow: auto;

}

/* 分页栏 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 响应式适配 */
@media (max-width: 767px) {
  .pagination {
    justify-content: center;
  }
}
</style>