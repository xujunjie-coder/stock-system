<template>
  <!-- 模板部分完全保留你的代码，无需修改 -->
  <div class="right-aside">
    <div class="aside-card">
      <div class="card-header">大盘指数</div>
      <div class="card-content">
        <div class="index-item" v-for="index in marketIndex" :key="index.code">
          <div class="index-name">{{ index.name }}</div>
          <div class="index-change" :class="index.change > 0 ? 'rise' : 'fall'">
            {{ index.change > 0 ? '↑' : '↓' }}{{ Math.abs(index.change).toFixed(2) }}%
          </div>
        </div>
      </div>
    </div>
    <div class="aside-card">
      <div class="card-header">热门概念</div>
      <div class="card-content">
        <div class="concept-item" v-for="concept in hotConcepts" :key="concept.name">
          {{ concept.name }} ({{ concept.stockCount }}只)
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 1. 导入新增的接口方法（替换原有的request直接调用）
import { getMarketIndex, getHotConcepts } from '@/api/quote'

export default {
  data() {
    return {
      marketIndex: [],
      hotConcepts: []
    }
  },
  mounted() {
    // 2. 修复大盘指数调用：直接用res赋值（无需res.data）
    getMarketIndex().then(res => {
      this.marketIndex = res || [] // 关键修复：res已是Mock返回的data数组
    }).catch(err => {
      console.error('大盘数据加载失败：', err)
    })

    // 3. 修复热门概念调用：直接用res赋值（无需res.data）
    getHotConcepts().then(res => {
      this.hotConcepts = res || [] // 关键修复：res已是Mock返回的data数组
    }).catch(err => {
      console.error('热门概念加载失败：', err)
    })
  }
}
</script>

<style scoped>
/* 样式部分完全保留你的代码，无需修改 */
.right-aside {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #e6e6e6;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}
.aside-card {
  margin-bottom: 16px;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
  overflow: hidden;
}
.card-header {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  background-color: #f8f8f8;
  font-weight: bold;
  font-size: 14px;
}
.card-content {
  padding: 16px;
}
.index-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
}
.concept-item {
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}
.concept-item:hover {
  color: #e53935;
}
</style>