<template>
  <div class="sidebar-container">
    <!-- 侧边栏标题 -->
    <div class="sidebar-header">
      <h2>股票分类</h2>
    </div>
    
    <!-- 侧边栏菜单 -->
    <ul class="sidebar-menu">
      <li 
        class="menu-item" 
        v-for="(item, index) in menuList" 
        :key="index"
        @click="handleMenuClick(item)"
      >
        <i :class="item.icon" class="menu-icon"></i>
        <span class="menu-text">{{ item.name }}</span>
      </li>
    </ul>
    
    <!-- 自选股列表（从Vuex获取） -->
    <div class="self-select-section" v-if="selfSelectList.length > 0">
      <div class="section-header">
        <span>我的自选股</span>
      </div>
      <ul class="self-select-list">
        <li 
          class="self-select-item" 
          v-for="(stock, index) in selfSelectList" 
          :key="index"
          @click="goToStockDetail(stock.code)"
        >
          <span class="stock-code">{{ stock.code }}</span>
          <span class="stock-name">{{ stock.name }}</span>
          <span class="stock-price" :class="stock.change > 0 ? 'rise' : 'fall'">
            {{ stock.price.toFixed(2) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default {
  name: 'Sidebar',
  data() {
    return {
      // 侧边栏菜单配置
      menuList: [
        { name: '自选股', icon: 'el-icon-star-on', type: 'selfSelect' },
        { name: '沪深A股', icon: 'el-icon-sitemap', type: 'hsAStock' },
        { name: '创业板', icon: 'el-icon-rocket', type: 'growthEnterprise' }
      ]
    }
  },
  computed: {
    ...mapState({
      // 从Vuex获取自选股列表
      selfSelectList: state => state.user.selfSelectList || []
    })
  },
  methods: {
    // 侧边栏菜单点击事件
    handleMenuClick(item) {
      switch (item.type) {
        case 'selfSelect':
          // 自选股菜单：刷新当前行情页显示自选股数据
          this.$store.dispatch('quote/fetchSelfSelectQuote')
          break
        case 'hsAStock':
          // 沪深A股菜单：跳转到行情页并加载沪深A股数据
          this.$router.push('/')
          this.$store.dispatch('quote/fetchHsAStockQuote')
          break
        case 'growthEnterprise':
          // 创业板菜单：跳转到行情页并加载创业板数据
          this.$router.push('/')
          this.$store.dispatch('quote/fetchGrowthEnterpriseQuote')
          break
        default:
          break
      }
    },
    // 跳转到个股详情页
    goToStockDetail(code) {
      this.$router.push(`/detail/${code}`)
    }
  }
}
</script>

<style scoped>
.sidebar-container {
  width: 240px;
  background-color: #fff;
  height: 100%;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.sidebar-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h2 {
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: 700;
}

/* 侧边栏菜单样式 */
.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 16px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #e53935;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 自选股区域样式 */
.self-select-section {
  padding: 16px 24px;
  border-top: 1px solid #eee;
}

.section-header {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.self-select-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.self-select-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px dashed #f0f0f0;
}

.stock-code {
  color: #666;
  width: 60px;
}

.stock-name {
  color: #333;
  flex: 1;
  margin: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-price {
  width: 70px;
  text-align: right;
}

.rise {
  color: #e53935;
}

.fall {
  color: #2e7d32;
}

/* 响应式适配：小屏设备（<1200px）样式 */
@media (max-width: 1199px) {
  .sidebar-container {
    width: 100%;
    height: auto;
  }
}
</style>