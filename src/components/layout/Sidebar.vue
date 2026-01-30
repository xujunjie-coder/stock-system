<template>
  <div class="sidebar">
    <el-menu
      default-active="selfSelect"
      class="sidebar-menu"
      :collapse="isMobile && !isMobileLandscape"
    >
      <!-- 自选股 -->
      <el-submenu index="selfSelect">
        <template slot="title">
          <i class="el-icon-star-on"></i>
          <span slot="title">自选股</span>
        </template>
        <el-menu-item
          v-for="stock in selfSelect"
          :key="stock.code"
          @click="$router.push(`/detail/${stock.code}`)"
        >
          {{ stock.name }}({{ stock.code }})
        </el-menu-item>
      </el-submenu>
      <!-- 行情分类 -->
      <el-menu-item index="cnA" @click="changeMarket('cnA')">
        <i class="el-icon-s-data"></i>
        <span slot="title">沪深A股</span>
      </el-menu-item>
      <el-menu-item index="gem" @click="changeMarket('gem')">
        <i class="el-icon-s-data"></i>
        <span slot="title">创业板</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      selfSelect: state => state.user.selfSelect
    }),
    isMobile() {
      return window.innerWidth < 768
    },
    isMobileLandscape() {
      return this.isMobile && window.innerHeight < window.innerWidth
    }
  },
  methods: {
    // 切换行情市场
    changeMarket(marketType) {
      this.$store.state.quote.filterCondition.market = marketType
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  overflow-y: auto;
}
.sidebar-menu {
  border-right: none;
}
.el-submenu__title, .el-menu-item {
  color: #333 !important;
}
.el-menu-item.is-active {
  background-color: #fef0f0 !important;
  color: #e53935 !important;
}
</style>