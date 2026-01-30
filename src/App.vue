<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- 全局布局组件：包裹所有路由视图 -->
    <MainLayout>
      <!-- 路由出口：所有页面（如QuoteHome）渲染到这里 -->
      <router-view />
    </MainLayout>
  </div>
</template>

<script>
// 引入全局布局组件
import MainLayout from './components/layout/MainLayout.vue'

export default {
  name: 'App',
  components: {
    MainLayout // 注册全局布局组件
  }
}
</script>

<style>
/* 全局基础样式，确保布局充满视口 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100vh;
  overflow: hidden; /* 避免全局滚动 */
}
</style>