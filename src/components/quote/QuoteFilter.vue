<template>
  <div class="quote-filter-container">
    <!-- 搜索栏 + 功能按钮 -->
    <div class="filter-header">
      <el-input
        v-model="keyword"
        placeholder="请输入股票代码/名称"
        icon="el-icon-search"
        @keyup.enter.native="handleSearch"
        class="search-input"
      ></el-input>
      <div class="header-btns">
        <el-button type="text" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        <el-button type="text" icon="el-icon-download" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 大盘指数联动 -->
    <MarketIndexLink class="market-index" />

    <!-- 筛选标签 -->
    <div class="filter-tags" v-if="filterTags.length > 0">
      <el-tag
        v-for="(tag, index) in filterTags"
        :key="index"
        closable
        :type="tag.type"
        @close="handleTagClose(index)"
      >
        {{ tag.label }}
      </el-tag>
      <el-button
        type="text"
        size="mini"
        @click="handleReset"
        v-if="filterTags.length > 0"
      >
        重置筛选
      </el-button>
    </div>

    <!-- 高级筛选下拉框 -->
    <div class="advanced-filter">
      <el-dropdown trigger="click">
        <el-button type="text" size="mini" icon="el-icon-filter">高级筛选</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-form :model="filterForm" size="mini" label-width="80px">
            <!-- 涨跌幅筛选 -->
            <el-form-item label="涨跌幅">
              <el-select
                v-model="filterForm.changeRate"
                placeholder="请选择区间"
                @change="handleFilterChange"
              >
                <el-option label="-5%~-3%" value="-5--3"></el-option>
                <el-option label="-3%~0%" value="-3-0"></el-option>
                <el-option label="0%~2%" value="0-2"></el-option>
                <el-option label="2%~5%" value="2-5"></el-option>
                <el-option label="5%以上" value="5+"></el-option>
              </el-select>
            </el-form-item>
            <!-- 成交量筛选 -->
            <el-form-item label="成交量">
              <el-select
                v-model="filterForm.volume"
                placeholder="请选择阈值"
                @change="handleFilterChange"
              >
                <el-option label="＞10万手" value="100000"></el-option>
                <el-option label="＞100万手" value="1000000"></el-option>
                <el-option label="＞500万手" value="5000000"></el-option>
              </el-select>
            </el-form-item>
            <!-- 新增：行业筛选 -->
            <el-form-item label="行业">
              <el-select
                v-model="filterForm.industry"
                placeholder="请选择行业"
                @change="handleFilterChange"
              >
                <el-option label="消费" value="消费"></el-option>
                <el-option label="科技" value="科技"></el-option>
                <el-option label="金融" value="金融"></el-option>
                <el-option label="医药" value="医药"></el-option>
              </el-select>
            </el-form-item>
            <!-- 新增：概念筛选 -->
            <el-form-item label="概念">
              <el-select
                v-model="filterForm.concept"
                placeholder="请选择概念"
                @change="handleFilterChange"
              >
                <el-option label="白酒" value="白酒"></el-option>
                <el-option label="新能源" value="新能源"></el-option>
                <el-option label="半导体" value="半导体"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import MarketIndexLink from './MarketIndexLink.vue'

export default {
  name: 'QuoteFilter',
  components: { MarketIndexLink },
  props: {
    filterForm: {
      type: Object,
      default: () => ({
        changeRate: '',
        volume: '',
        industry: '', // 新增行业字段
        concept: ''  // 新增概念字段
      })
    },
    filterTags: {
      type: Array,
      default: () => []
    },
    keyword: {
      type: String,
      default: ''
    }
  },
  model: {
    prop: 'filterForm',
    event: 'filter-change'
  },
  methods: {
    handleFilterChange() {
      this.$emit('filter-change', this.filterForm)
      this.updateFilterTags()
    },
    // 新增行业/概念标签逻辑
    updateFilterTags() {
      const tags = []
      if (this.filterForm.changeRate) {
        const labelMap = {
          '-5--3': '-5%~-3%',
          '-3-0': '-3%~0%',
          '0-2': '0%~2%',
          '2-5': '2%~5%',
          '5+': '5%以上'
        }
        tags.push({ label: `涨跌幅：${labelMap[this.filterForm.changeRate]}`, type: 'info', key: 'changeRate' })
      }
      if (this.filterForm.volume) {
        const volumeText = this.filterForm.volume >= 1000000 ? '＞100万手' : this.filterForm.volume >= 5000000 ? '＞500万手' : '＞10万手'
        tags.push({ label: `成交量：${volumeText}`, type: 'primary', key: 'volume' })
      }
      // 新增行业标签
      if (this.filterForm.industry) {
        tags.push({ label: `行业：${this.filterForm.industry}`, type: 'success', key: 'industry' })
      }
      // 新增概念标签
      if (this.filterForm.concept) {
        tags.push({ label: `概念：${this.filterForm.concept}`, type: 'warning', key: 'concept' })
      }
      this.$emit('tags-update', tags)
    },
    handleTagClose(index) {
      const tag = this.filterTags[index]
      if (tag.key === 'changeRate') this.filterForm.changeRate = ''
      if (tag.key === 'volume') this.filterForm.volume = ''
      if (tag.key === 'industry') this.filterForm.industry = '' // 新增行业标签关闭逻辑
      if (tag.key === 'concept') this.filterForm.concept = ''   // 新增概念标签关闭逻辑
      this.$emit('filter-change', this.filterForm)
      this.updateFilterTags()
    },
    handleReset() {
      this.$emit('filter-reset')
    },
    handleSearch() {
      this.$emit('search', this.keyword)
    },
    handleRefresh() {
      this.$emit('refresh')
    },
    handleExport() {
      this.$emit('export')
    }
  }
}
</script>

<style scoped>
.quote-filter-container {
  width: 100%;
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.search-input {
  width: 300px;
  max-width: 100%;
}

.header-btns {
  display: flex;
  gap: 8px;
}

.market-index {
  margin-bottom: 12px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.advanced-filter {
  margin-bottom: 8px;
}

/* 响应式适配 */
@media (max-width: 767px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .header-btns {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>