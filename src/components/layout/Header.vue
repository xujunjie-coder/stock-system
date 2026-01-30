<template>
  <div class="header-container">
    <!-- Logo区域 -->
    <div class="logo">
      <h1>同花顺行情分析</h1>
    </div>

    <!-- 顶部导航菜单（PC端显示） -->
    <nav class="top-nav" v-if="isPc">
      <router-link
        :to="item.path"
        :class="['nav-item', $route.path === item.path ? 'active' : '']"
        v-for="(item, index) in navList"
        :key="index"
      >
        {{ item.name }}
      </router-link>
    </nav>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-autocomplete
        v-model="searchValue"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        placeholder="请输入股票代码/名称"
        @select="handleSearchSelect"
        @change="handleSearchChange"
        class="search-input"
      ></el-autocomplete>
    </div>

    <!-- 移动端菜单按钮（<768px显示） -->
    <el-button
      class="mobile-menu-btn"
      icon="el-icon-menu"
      @click="showMobileMenu = true"
      v-if="!isPc"
    ></el-button>

    <!-- 手写移动端导航抽屉 -->
    <!-- 遮罩层 -->
    <div class="mobile-drawer-mask" v-if="showMobileMenu" @click="showMobileMenu = false"></div>
    <!-- 抽屉主体（右侧滑出） -->
    <div class="mobile-drawer" :class="{ 'drawer-show': showMobileMenu }">
      <!-- 抽屉头部 -->
      <div class="drawer-header">
        <span class="drawer-title">功能导航</span>
        <span class="drawer-close" @click="showMobileMenu = false">×</span>
      </div>
      <!-- 抽屉内容 -->
      <div class="mobile-nav">
        <router-link
          :to="item.path"
          :class="['mobile-nav-item', $route.path === item.path ? 'active' : '']"
          v-for="(item, index) in navList"
          :key="index"
          @click="showMobileMenu = false"
        >
          {{ item.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      // 搜索框绑定值
      searchValue: '',
      // 移动端菜单抽屉显示状态
      showMobileMenu: false,
      // 是否为PC端
      isPc: true,
      // 顶部导航列表
      navList: [
        { path: '/', name: '行情' },
        { path: '/ai/select', name: 'AI选股' },
        { path: '/trade', name: '交易' },
        { path: '/mine', name: '我的' }
      ],
      // 股票模拟数据（用于搜索联想）
      stockList: [
        { value: '600000', label: '浦发银行' },
        { value: '000001', label: '平安银行' },
        { value: '300001', label: '特锐德' },
        { value: '600036', label: '招商银行' },
        { value: '000858', label: '五粮液' }
      ],
      // 搜索记录缓存（最多5条）
      searchHistory: []
    }
  },
  mounted() {
    // 初始化判断终端类型
    this.judgeTerminal()
    // 监听窗口大小变化
    window.addEventListener('resize', this.judgeTerminal)
    // 从本地缓存加载搜索记录
    this.loadSearchHistory()
  },
  beforeDestroy() {
    // 移除窗口监听
    window.removeEventListener('resize', this.judgeTerminal)
  },
  methods: {
    // 判断终端类型（PC端≥768px，移动端<768px）
    judgeTerminal() {
      this.isPc = window.innerWidth >= 768
    },
    // 搜索联想查询
    querySearch(queryString, cb) {
      // 合并股票数据和搜索记录（去重）
      const historyData = this.searchHistory.map(item => ({
        value: item.value,
        label: `${item.label}（历史）`
      }))
      const stockData = this.stockList.filter(item => {
        return item.label.includes(queryString) || item.value.includes(queryString)
      })
      const result = [...stockData, ...historyData].filter((item, index, arr) => {
        return arr.findIndex(i => i.value === item.value) === index
      })
      cb(result)
    },
    // 选择搜索结果处理
    handleSearchSelect(item) {
      // 缓存搜索记录（最多5条）
      this.cacheSearchHistory(item)
      // 跳转到个股详情页
      this.$router.push(`/detail/${item.value}`)
      // 清空搜索框
      this.searchValue = ''
    },
    // 搜索框值变化处理（回车搜索）
    handleSearchChange() {
      if (!this.searchValue) return
      // 查找匹配的股票
      const matchItem = this.stockList.find(item => {
        return item.label === this.searchValue || item.value === this.searchValue
      })
      if (matchItem) {
        this.handleSearchSelect(matchItem)
      } else {
        this.$message.warning('未找到匹配的股票，请检查代码/名称')
      }
    },
    // 加载本地缓存的搜索记录
    loadSearchHistory() {
      const history = localStorage.getItem('stockSearchHistory')
      if (history) {
        this.searchHistory = JSON.parse(history)
      }
    },
    // 缓存搜索记录到本地
    cacheSearchHistory(item) {
      // 去重：如果已存在则删除原有项
      this.searchHistory = this.searchHistory.filter(i => i.value !== item.value)
      // 添加新记录到头部
      this.searchHistory.unshift({ value: item.value, label: item.label })
      // 限制最多5条
      if (this.searchHistory.length > 5) {
        this.searchHistory = this.searchHistory.slice(0, 5)
      }
      // 保存到本地缓存
      localStorage.setItem('stockSearchHistory', JSON.stringify(this.searchHistory))
    }
  }
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

/* Logo样式 */
.logo h1 {
  font-size: 18px;
  color: #e53935;
  margin: 0;
  font-weight: 600;
}

/* PC端导航样式 */
.top-nav {
  display: flex;
  margin: 0 20px;
}

.nav-item {
  padding: 0 15px;
  height: 60px;
  line-height: 60px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav-item.active {
  color: #e53935;
  border-bottom: 2px solid #e53935;
}

.nav-item:hover {
  color: #e53935;
}

/* 搜索框样式 */
.search-container {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  color: #333;
  border: none;
  background: transparent;
  font-size: 18px;
  z-index: 1001; /* 高于遮罩层 */
}

/* 手写抽屉 - 遮罩层 */
.mobile-drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: background-color 0.3s ease;
}

/* 手写抽屉 - 主体容器 */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-color: #fff;
  z-index: 1001;
  transform: translateX(100%); /* 初始隐藏在右侧 */
  transition: transform 0.3s ease;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
}

/* 抽屉显示状态 */
.mobile-drawer.drawer-show {
  transform: translateX(0); /* 滑入可视区域 */
}

/* 抽屉头部 */
.drawer-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f8f8f8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.drawer-close {
  font-size: 20px;
  color: #666;
  cursor: pointer;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  transition: color 0.2s;
}

.drawer-close:hover {
  color: #e53935;
}

/* 移动端导航样式 */
.mobile-nav {
  padding: 20px 0;
  height: calc(100% - 60px); /* 减去头部高度 */
  overflow-y: auto;
}

.mobile-nav-item {
  display: block;
  padding: 15px 20px;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  border-bottom: 1px solid #f8f8f8;
  transition: all 0.2s;
}

.mobile-nav-item.active {
  color: #e53935;
  background-color: #fef0f0;
}

.mobile-nav-item:hover {
  background-color: #f5f5f5;
  color: #e53935;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;
  }

  .logo h1 {
    font-size: 16px;
  }

  .search-container {
    max-width: 200px;
    margin: 0 10px;
  }

  /* 移动端抽屉宽度适配 */
  .mobile-drawer {
    width: 80%;
  }
}

@media (min-width: 768px) and (max-width: 1200px) {
  .search-container {
    max-width: 300px;
  }
}
</style>