<template>
  <div class="not-found">
    <el-icon name="el-icon-warning" class="warning-icon"></el-icon>
    <h2>404 - 页面不存在</h2>
    <p>您访问的页面已被删除或路径错误</p>
    <el-button type="primary" @click="$router.push('/')">返回行情首页</el-button>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
}
.warning-icon {
  font-size: 64px;
  color: #e53935;
  margin-bottom: 16px;
}
h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}
p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}
</style>