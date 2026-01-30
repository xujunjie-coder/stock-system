<template>
  <div class="header">
    <!-- Logo -->
    <div class="logo" @click="$router.push('/')">
      同花顺行情分析
    </div>
    <!-- 顶部导航菜单（PC端） -->
    <div class="nav-menu" v-if="isPc || isMobileLandscape">
      <el-menu mode="horizontal" :default-active="currentRoute">
        <el-menu-item index="/" @click="$router.push('/')">行情</el-menu-item>
        <el-menu-item index="/ai/select" @click="$router.push('/ai/select')">AI选股</el-menu-item>
        <el-menu-item index="/trade" @click="$router.push('/trade')">交易</el-menu-item>
        <el-menu-item index="/mine" @click="$router.push('/mine')">我的</el-menu-item>
      </el-menu>
    </div>
    <!-- 全局搜索框 -->
    <div class="search-container">
      <el-autocomplete
        v-model="searchInput"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        placeholder="输入股票代码/名称/功能"
        @select="handleSearchSelect"
        class="search-input"
      ></el-autocomplete>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
    </div>
    <!-- 移动端菜单按钮 -->
    <el-button
      icon="el-icon-menu"
      class="mobile-menu-btn"
      v-if="isMobile && !isMobileLandscape"
      @click="openMobileDrawer"
    ></el-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import request from '@/utils/request'

export default {
  data() {
    return {
      searchInput: '',
      searchSuggestions: [],
      screenWidth: window.innerWidth
    }
  },
  computed: {
    ...mapState({
      searchHistory: state => state.user.searchHistory
    }),
    currentRoute() {
      return this.$route.path
    },
    isPc() {
      return this.screenWidth >= 1200
    },
    isMobile() {
      return this.screenWidth < 768
    },
    isMobileLandscape() {
      return this.isMobile && window.innerHeight < window.innerWidth
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth
    })
  },
  methods: {
    // 打开移动端抽屉
    openMobileDrawer() {
      this.$parent.isMobileDrawerShow = true
    },
    // 搜索联想查询
    querySearch(queryString, cb) {
      if (!queryString) {
        // 无输入时显示历史记录
        cb(this.searchHistory.slice(0, 5))
        return
      }
      // 调用搜索联想接口（Mock）
      request.get('/api/search/suggest', { params: { keyword: queryString } }).then(res => {
        this.searchSuggestions = res.data
        cb(res.data)
      })
    },
    // 处理搜索选择
    handleSearchSelect(item) {
      if (item.type === 'stock') {
        this.$router.push(`/detail/${item.code}`)
      } else if (item.type === 'function') {
        this.$router.push(item.path)
      }
      // 保存搜索历史
      this.saveSearchHistory(item)
      this.searchInput = ''
    },
    // 手动触发搜索
    handleSearch() {
      if (!this.searchInput) return
      // 优先匹配股票
      const stockItem = this.searchSuggestions.find(item => item.type === 'stock')
      if (stockItem) {
        this.$router.push(`/detail/${stockItem.code}`)
      } else {
        this.$message.info('暂无匹配结果')
      }
      // 保存搜索历史
      this.saveSearchHistory({ name: this.searchInput, type: 'history' })
      this.searchInput = ''
    },
    // 保存搜索历史（去重，最多5条）
    saveSearchHistory(item) {
      const newHistory = this.searchHistory.filter(h => h.name !== item.name)
      newHistory.unshift(item)
      if (newHistory.length > 5) newHistory.pop()
      this.$store.state.user.searchHistory = newHistory
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 16px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  color: #e53935;
  cursor: pointer;
}
.nav-menu {
  flex: 1;
  margin: 0 20px;
}
.el-menu--horizontal {
  border-bottom: none;
}
.el-menu-item.is-active {
  color: #e53935 !important;
  border-bottom: 2px solid #e53935;
}
.search-container {
  display: flex;
  align-items: center;
  width: 300px;
}
.search-input {
  margin-right: 8px;
}
.mobile-menu-btn {
  display: none;
}
@media screen and (max-width: 1199px) {
  .search-container {
    width: 200px;
  }
}
@media screen and (max-width: 767px) {
  .nav-menu {
    display: none;
  }
  .mobile-menu-btn {
    display: block;
  }
  .search-container {
    width: 150px;
  }
}
</style>