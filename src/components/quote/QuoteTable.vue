<template>
  <div class="quote-table-container">
    <!-- 普通表格（数据≤100条） -->
    <el-table
      v-if="data.length <= 100"
      :data="formattedData"
      border
      stripe
      :header-cell-class-name="headerCellClass"
      @sort-change="handleSortChange"
      class="quote-table"
      @row-click="handleRowClick"
    >
      <el-table-column
        prop="code"
        label="代码"
        sortable="custom"
        width="100"
        fixed="left"
      ></el-table-column>
      <el-table-column
        prop="name"
        label="名称"
        sortable="custom"
        width="120"
        fixed="left"
      ></el-table-column>
      <el-table-column
        prop="price"
        label="最新价"
        sortable="custom"
        width="100"
        fixed="left"
      ></el-table-column>
      <el-table-column
        prop="changeRate"
        label="涨跌幅"
        sortable="custom"
        width="100"
      >
        <template slot-scope="scope">
          <span :class="scope.row.change > 0 ? 'rise' : 'fall'">
            {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.changeRate }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="change"
        label="涨跌额"
        sortable="custom"
        width="100"
      >
        <template slot-scope="scope">
          <span :class="scope.row.change > 0 ? 'rise' : 'fall'">
            {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }}
          </span>
        </template>
      </el-table-column>
      <!-- 修改点1：替换 window.innerWidth 为 computed 属性 isTabletHorizontal -->
      <el-table-column
        prop="volume"
        label="成交量"
        sortable="custom"
        width="120"
        v-if="isPc || isTabletHorizontal"
      >
        <template slot-scope="scope">
          {{ scope.row.volume ? (scope.row.volume / 10000).toFixed(2) + '万' : '0.00万' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="high"
        label="最高价"
        sortable="custom"
        width="100"
        v-if="isPc || isTabletHorizontal"
      ></el-table-column>
      <el-table-column
        prop="low"
        label="最低价"
        sortable="custom"
        width="100"
        v-if="isPc || isTabletHorizontal"
      ></el-table-column>
    </el-table>

    <!-- 虚拟列表（数据＞100条） -->
    <RecycleScroller
      v-else
      class="virtual-list"
      :items="formattedData"
      :item-size="50"
      key-field="code"
    >
      <template v-slot="{ item, index }">
        <div
          :class="['virtual-item', index % 2 === 0 ? 'even' : 'odd']"
          @click="handleRowClick(item)"
        >
          <!-- 固定列：代码/名称/最新价 -->
          <div class="virtual-cell" style="width: 100px">{{ item.code }}</div>
          <div class="virtual-cell" style="width: 120px">{{ item.name }}</div>
          <div class="virtual-cell" style="width: 100px">{{ item.price }}</div>
          <!-- 涨跌幅/涨跌额 -->
          <div class="virtual-cell" style="width: 100px" :class="item.change > 0 ? 'rise' : 'fall'">
            {{ item.change > 0 ? '+' : '' }}{{ item.changeRate }}%
          </div>
          <div class="virtual-cell" style="width: 100px" :class="item.change > 0 ? 'rise' : 'fall'">
            {{ item.change > 0 ? '+' : '' }}{{ item.change }}
          </div>
          <!-- 修改点2：替换 window.innerWidth 为 computed 属性 isTabletHorizontal -->
          <div 
            class="virtual-cell" 
            style="width: 120px"
            v-if="isPc || isTabletHorizontal"
          >
            {{ item.volume ? (item.volume / 10000).toFixed(2) + '万' : '0.00万' }}
          </div>
          <div 
            class="virtual-cell" 
            style="width: 100px"
            v-if="isPc || isTabletHorizontal"
          >
            {{ item.high || '0.00' }}
          </div>
          <div 
            class="virtual-cell" 
            style="width: 100px"
            v-if="isPc || isTabletHorizontal"
          >
            {{ item.low || '0.00' }}
          </div>
        </div>
      </template>
    </RecycleScroller>

    <!-- 空状态 -->
    <el-empty
      description="暂无匹配行情数据"
      v-if="formattedData.length === 0 && !loading"
      class="empty-state"
    ></el-empty>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-tip">加载行情数据中...</div>
  </div>
</template>

<script>
// 适配旧版vue-virtual-scroller：引入RecycleScroller而非默认导出
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  name: 'QuoteTable',
  components: { 
    RecycleScroller // 注册正确的虚拟列表组件
  },
  props: {
    // 原始数据
    data: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 是否为PC端
    isPc: {
      type: Boolean,
      default: true
    },
    // 排序字段（父组件传递）
    sortProp: {
      type: String,
      default: ''
    },
    // 排序方向（父组件传递）
    sortOrder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 本地排序状态（同步父组件）
      localSortProp: '',
      localSortOrder: '',
      // 修改点3：新增窗口宽度数据，避免直接监听 window.innerWidth
      windowWidth: window.innerWidth
    }
  },
  watch: {
    // 监听父组件排序参数变化，同步更新虚拟列表排序
    sortProp: {
      immediate: true,
      handler(val) {
        this.localSortProp = val
        this.sortVirtualList()
      }
    },
    sortOrder: {
      immediate: true,
      handler(val) {
        this.localSortOrder = val
        this.sortVirtualList()
      }
    },
    // 修改点4：替换监听 window.innerWidth 为监听本地 windowWidth
    windowWidth: {
      handler() {
        this.$forceUpdate() // 强制重新渲染，更新列显示状态
      }
    }
  },
  computed: {
    // 修改点5：新增 computed 属性封装 window.innerWidth 判断
    isTabletHorizontal() {
      // 容错：防止 window 未定义（如服务端渲染场景）
      if (typeof window === 'undefined') return false
      return this.windowWidth >= 768
    },
    // 格式化后的数据（带容错处理）
    formattedData() {
      if (!Array.isArray(this.data)) return []
      
      return this.data.map(item => {
        // 非法数据容错
        if (typeof item !== 'object' || item === null) return {
          code: '',
          name: '数据异常',
          price: '暂无',
          changeRate: '0.00',
          change: '0.00',
          volume: 0,
          high: '暂无',
          low: '暂无'
        }
        
        // 空值处理：显示"暂无"而非0.00
        const price = typeof item.price === 'number' ? item.price.toFixed(2) : '暂无'
        const change = typeof item.change === 'number' ? item.change.toFixed(2) : '0.00'
        const change_rate = typeof item.change_rate === 'number' ? item.change_rate.toFixed(2) : '0.00'
        const volume = typeof item.volume === 'number' ? item.volume : 0
        const high = typeof item.high === 'number' ? item.high.toFixed(2) : '暂无'
        const low = typeof item.low === 'number' ? item.low.toFixed(2) : '暂无'

        return {
          ...item,
          price,
          change,
          changeRate: change_rate,
          volume,
          high,
          low
        }
      })
    }
  },
  mounted() {
    // 监听窗口尺寸变化（适配横屏/竖屏）
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 移除窗口监听，避免内存泄漏
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 修改点6：更新 handleResize 方法，同步本地 windowWidth
    handleResize() {
      this.windowWidth = window.innerWidth // 把窗口宽度赋值给本地数据
      this.$forceUpdate()
    },
    // 表格头部样式
    headerCellClass() {
      return 'header-cell'
    },
    // 排序变化处理（同步普通表格和虚拟列表）
    handleSortChange({ prop, order }) {
      if (!prop || !order) return
      // 映射排序字段（changeRate → change_rate）
      const sortProp = prop === 'changeRate' ? 'change_rate' : prop
      const sortOrder = order === 'ascending' ? 'asc' : 'desc'
      
      // 向父组件传递排序参数
      this.$emit('sort-change', { sortProp, sortOrder })
      
      // 更新本地排序状态，触发虚拟列表排序
      this.localSortProp = sortProp
      this.localSortOrder = sortOrder
      this.sortVirtualList()
    },
    // 虚拟列表排序逻辑
    sortVirtualList() {
      if (!this.localSortProp || !this.localSortOrder) return
      
      // 深拷贝数据，避免修改原数组
      const sortedData = [...this.formattedData]
      sortedData.sort((a, b) => {
        // 处理字符串转数字（如格式化后的价格"100.00"）
        const valA = typeof a[this.localSortProp] === 'string' 
          ? parseFloat(a[this.localSortProp]) 
          : a[this.localSortProp]
        const valB = typeof b[this.localSortProp] === 'string' 
          ? parseFloat(b[this.localSortProp]) 
          : b[this.localSortProp]
        
        // 空值/NaN处理：排到最后
        if (isNaN(valA)) return 1
        if (isNaN(valB)) return -1
        
        // 按排序方向排序
        return this.localSortOrder === 'asc' ? valA - valB : valB - valA
      })
      
      // 强制更新格式化数据（触发虚拟列表重新渲染）
      this.$set(this, 'formattedData', sortedData)
    },
    // 行点击事件（跳转个股详情）
    handleRowClick(item) {
      if (!item || !item.code) return
      this.$emit('row-click', item.code)
    }
  }
}
</script>

<style scoped>
.quote-table-container {
  width: 100%;
  overflow: auto !important; 
  height: 600px; /* 固定外层高度，避免双重滚动条 */
  margin-bottom: 16px;
}

.quote-table {
  width: 100%;
  height: auto; /* 表格高度由容器控制 */
}

.header-cell {
  background-color: #f8f8f8;
  font-weight: 700;
  color: #333;
}

/* 虚拟列表样式 */
.virtual-list {
  height: 100%; /* 继承外层容器高度 */
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.virtual-item {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  box-sizing: border-box;
  cursor: pointer;
}

.virtual-item.even {
  background-color: #f8f8f8;
}

.virtual-item.odd {
  background-color: #fff;
}

.virtual-cell {
  text-align: left;
  font-size: 14px;
  color: #333;
  flex-shrink: 0; /* 关键：防止单元格宽度被压缩 */
}

/* 涨跌样式 */
.rise {
  color: #e53935 !important;
}

.fall {
  color: #2f9b56 !important;
}

/* 空状态 & 加载中 */
.empty-state {
  margin: 60px 0;
}
.loading-tip {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* 响应式适配 */
/* 移动端竖屏 */
@media (max-width: 767px) {
  .quote-table-container {
    height: 350px; /* 降低容器高度，适配小屏幕 */
  }
  .virtual-item {
    padding: 0 8px; /* 减少内边距 */
  }
}

/* 平板横屏 */
@media (min-width: 768px) and (max-width: 1199px) {
  .virtual-cell.volume {
    width: 120px;
  }
}
</style>