<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <Header />
    
    <div class="layout-content">
      <!-- 左侧侧边栏（PC端默认显示，移动端默认隐藏） -->
      <Sidebar v-if="isPc" />
      
      <!-- 移动端侧边栏抽屉触发器（仅移动端显示） -->
      <el-button 
        class="mobile-sidebar-trigger" 
        icon="el-icon-menu" 
        @click="showSidebarDrawer = true"
        v-if="!isPc"
      ></el-button>
      
      <!-- 移动端侧边栏抽屉（仅移动端渲染，显示状态由showSidebarDrawer控制） -->
      <el-drawer
        title="功能导航"
        :visible.sync="showSidebarDrawer"
        direction="ltr"
        size="60%"
        v-if="!isPc"
      >
        <Sidebar />
      </el-drawer>
      
      <!-- 主内容区域 -->
      <main class="content-wrapper">
        <router-view />
      </main>
      
      <!-- 右侧辅助栏（仅PC端显示） -->
      <aside class="right-aside" v-if="isPc">
        <div class="aside-header">大盘指数</div>
        <div class="aside-content">
          <!-- 占位：后续可接入大盘指数数据 -->
          <div class="index-item">上证指数：3285.08 <span class="rise">+1.23%</span></div>
          <div class="index-item">深证成指：11056.47 <span class="rise">+0.89%</span></div>
          <div class="index-item">创业板指：2258.17 <span class="fall">-0.32%</span></div>
        </div>
      </aside>
    </div>
    
    <!-- 底部状态栏 -->
    <Footer />
  </div>
</template>

<script>
import Vue from 'vue'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Footer from './Footer.vue'
import { Button, Drawer } from 'element-ui'

// 注册ElementUI组件
Vue.use(Button)
Vue.use(Drawer)

export default {
  name: 'MainLayout',
  components: { Header, Sidebar, Footer },
  data() {
    return {
      showSidebarDrawer: false,
      isPc: true // 是否为PC端
    }
  },
  mounted() {
    // 初始化终端类型判断
    this.checkTerminalType()
    // 监听窗口大小变化，动态调整终端类型
    window.addEventListener('resize', this.checkTerminalType)
  },
  beforeDestroy() {
    // 移除事件监听，避免内存泄漏
    window.removeEventListener('resize', this.checkTerminalType)
  },
  methods: {
    checkTerminalType() {
      // PC端判定标准：屏幕宽度≥1200px
      this.isPc = window.innerWidth >= 1200
      // 窗口大小切换时，关闭抽屉（避免PC/移动端切换时抽屉残留）
      if (this.isPc) {
        this.showSidebarDrawer = false
      }
    }
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.right-aside {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #eee;
  padding: 16px;
  overflow-y: auto;
}

.aside-header {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.index-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.rise {
  color: #e53935;
}

.fall {
  color: #2e7d32;
}

.mobile-sidebar-trigger {
  position: fixed;
  left: 16px;
  top: 70px;
  z-index: 100;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式适配：PC端（≥1200px）样式 */
@media (min-width: 1200px) {
  .mobile-sidebar-trigger {
    display: none;
  }
}

/* 响应式适配：移动端（<1200px）样式 */
@media (max-width: 1199px) {
  .right-aside {
    display: none;
  }
}
</style>