<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <Header />
    <div class="layout-content">
      <!-- 左侧侧边栏 -->
      <Sidebar v-if="isPc || isMobileLandscape" />
      <div class="content-wrapper">
        <!-- 主内容区 -->
        <router-view class="main-content" />
      </div>
      <!-- 右侧辅助栏（仅PC端显示） -->
      <RightAside v-if="isPc" />
    </div>
    <!-- 底部状态栏 -->
    <Footer />
    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      title="行情导航"
      :visible.sync="isMobileDrawerShow"
      direction="ltr"
      :with-header="false"
      :size="300"
    >
      <Sidebar />
    </el-drawer>
  </div>
</template>

<script>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import RightAside from './RightAside.vue'
import Footer from './Footer.vue'
import { mapState } from 'vuex'

export default {
  components: { Header, Sidebar, RightAside, Footer },
  data() {
    return {
      isMobileDrawerShow: false,
      screenWidth: window.innerWidth
    }
  },
  computed: {
    // 判断终端类型
    isPc() {
      return this.screenWidth >= 1200
    },
    isTablet() {
      return this.screenWidth >= 768 && this.screenWidth < 1200
    },
    isMobile() {
      return this.screenWidth < 768
    },
    isMobileLandscape() {
      return this.isMobile && window.innerHeight < window.innerWidth
    }
  },
  mounted() {
    // 监听窗口尺寸变化
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth
    })
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: #f8f8f8;
  padding: 16px;
}
.main-content {
  height: 100%;
}
</style>