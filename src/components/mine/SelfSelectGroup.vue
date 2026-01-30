<template>
  <div class="self-select-group">
    <div class="group-header">
      <div class="group-tabs">
        <el-tag
          v-for="(group, index) in groupList"
          :key="index"
          :class="{ active: activeGroup === group.name }"
          @click="switchGroup(group.name)"
        >
          {{ group.name }}({{ group.count }})
        </el-tag>
        <el-tag type="primary" icon="el-icon-plus" @click="createGroup">新建分组</el-tag>
      </div>
      <div class="group-actions">
        <el-button type="text" icon="el-icon-edit" @click="editGroup" v-if="activeGroup !== '全部'">编辑分组</el-button>
        <el-button type="text" icon="el-icon-delete" @click="deleteGroup" v-if="activeGroup !== '全部' && groupList.length > 2">删除分组</el-button>
        <el-button type="text" icon="el-icon-s-tools" @click="batchOperate">{{ batchVisible ? '取消批量' : '批量操作' }}</el-button>
      </div>
    </div>
    
    <div class="stock-list">
      <div 
        class="stock-item" 
        v-for="(stock, index) in filteredStocks" 
        :key="stock.code"
        :class="{ selected: selectedStocks.includes(stock.code) }"
        @click="handleStockClick(stock)"
      >
        <div class="stock-info" @click.stop="goToDetail(stock)">
          <span class="code">{{ stock.code }}</span>
          <span class="name">{{ stock.name }}</span>
        </div>
        <div class="stock-actions">
          <el-checkbox v-if="batchVisible" v-model="selectedStocks" :label="stock.code" @change.stop></el-checkbox>
          <el-button 
            type="text" 
            icon="el-icon-delete" 
            size="mini"
            @click.stop="removeStock(stock.code)"
            v-else
          ></el-button>
          <el-button 
            type="text" 
            icon="el-icon-sort" 
            size="mini"
            @click.stop="startDrag(index)"
          ></el-button>
        </div>
      </div>
      
      <div class="empty-tip" v-if="filteredStocks.length === 0">
        <el-icon name="el-icon-info"></el-icon>
        <p>该分组暂无股票</p>
        <el-button type="text" @click="addStock">添加股票</el-button>
      </div>
    </div>
    
    <!-- 批量操作底部栏 -->
    <div class="batch-footer" v-if="batchVisible">
      <span>已选择 {{ selectedStocks.length }} 只股票</span>
      <div class="batch-buttons">
        <el-button type="text" @click="moveStock">移动到分组</el-button>
        <el-button type="text" style="color: #f56c6c;" @click="batchDelete">批量删除</el-button>
      </div>
    </div>
    
    <!-- 新建分组弹窗 -->
    <el-dialog
      title="新建分组"
      v-model="createDialogVisible"
      width="300px"
    >
      <el-form :model="groupForm" :rules="groupRules" ref="groupForm">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分组名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">确定</el-button>
      </div>
    </el-dialog>
    
    <!-- 编辑分组弹窗 -->
    <el-dialog
      title="编辑分组"
      v-model="editDialogVisible"
      width="300px"
    >
      <el-form :model="editForm" :rules="groupRules" ref="editForm">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入分组名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </div>
    </el-dialog>
    
    <!-- 移动分组弹窗 -->
    <el-dialog
      title="移动到分组"
      v-model="moveDialogVisible"
      width="300px"
    >
      <el-form :model="moveForm" ref="moveForm">
        <el-form-item label="目标分组">
          <el-select v-model="moveForm.targetGroup" placeholder="选择分组">
            <el-option
              v-for="group in groupList"
              :key="group.name"
              :label="group.name"
              :value="group.name"
              :disabled="group.name === activeGroup"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMove">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { manageSelfSelectGroup, deleteSelfSelect } from '@/api/user'

export default {
  data() {
    return {
      groupList: [
        { name: '全部', count: 0 },
        { name: '默认分组', count: 0 }
      ],
      activeGroup: '全部',
      batchVisible: false,
      selectedStocks: [],
      createDialogVisible: false,
      editDialogVisible: false,
      moveDialogVisible: false,
      groupForm: { name: '' },
      editForm: { name: '' },
      moveForm: { targetGroup: '' },
      groupRules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分组名称长度在2-10个字符之间', trigger: 'blur' }
        ]
      },
      // 拖拽相关
      dragIndex: -1,
      dropIndex: -1
    }
  },
  computed: {
    ...mapState({
      selfSelect: state => state.user.selfSelect
    }),
    // 筛选后的自选股
    filteredStocks() {
      if (this.activeGroup === '全部') {
        return this.selfSelect
      }
      return this.selfSelect.filter(stock => stock.group === this.activeGroup)
    }
  },
  watch: {
    selfSelect: {
      immediate: true,
      handler() {
        this.updateGroupCount()
      }
    }
  },
  mounted() {
    this.updateGroupCount()
    // 初始化拖拽事件
    this.initDragEvent()
  },
  methods: {
    // 更新分组数量
    updateGroupCount() {
      // 统计各分组数量
      const groupCount = {}
      this.selfSelect.forEach(stock => {
        const group = stock.group || '默认分组'
        groupCount[group] = (groupCount[group] || 0) + 1
      })
      
      // 更新分组列表
      this.groupList = [
        { name: '全部', count: this.selfSelect.length },
        ...Object.keys(groupCount).map(name => ({
          name,
          count: groupCount[name]
        }))
      ]
    },
    // 切换分组
    switchGroup(groupName) {
      this.activeGroup = groupName
      this.batchVisible = false
      this.selectedStocks = []
    },
    // 创建分组
    createGroup() {
      this.groupForm.name = ''
      this.createDialogVisible = true
    },
    // 确认创建分组
    confirmCreate() {
      this.$refs.groupForm.validate((valid) => {
        if (valid) {
          // 检查分组是否已存在
          const exists = this.groupList.some(group => group.name === this.groupForm.name)
          if (exists) {
            this.$message.error('该分组名称已存在')
            return
          }
          
          manageSelfSelectGroup({
            operation: 'add',
            groupName: this.groupForm.name
          }).then(res => {
            this.$message.success('分组创建成功')
            this.groupList.push({
              name: this.groupForm.name,
              count: 0
            })
            this.createDialogVisible = false
          })
        }
      })
    },
    // 编辑分组
    editGroup() {
      this.editForm.name = this.activeGroup
      this.editDialogVisible = true
    },
    // 确认编辑分组
    confirmEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 检查分组是否已存在
          const exists = this.groupList.some(group => group.name === this.editForm.name && group.name !== this.activeGroup)
          if (exists) {
            this.$message.error('该分组名称已存在')
            return
          }
          
          manageSelfSelectGroup({
            operation: 'edit',
            oldGroupName: this.activeGroup,
            newGroupName: this.editForm.name
          }).then(res => {
            this.$message.success('分组修改成功')
            // 更新分组名称
            this.groupList.forEach(group => {
              if (group.name === this.activeGroup) {
                group.name = this.editForm.name
              }
            })
            // 更新自选股分组
            this.selfSelect.forEach(stock => {
              if (stock.group === this.activeGroup) {
                stock.group = this.editForm.name
              }
            })
            this.activeGroup = this.editForm.name
            this.editDialogVisible = false
          })
        }
      })
    },
    // 删除分组
    deleteGroup() {
      this.$confirm(`确定要删除分组"${this.activeGroup}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        manageSelfSelectGroup({
          operation: 'delete',
          groupName: this.activeGroup
        }).then(res => {
          this.$message.success('分组删除成功')
          // 将该分组股票移动到默认分组
          this.selfSelect.forEach(stock => {
            if (stock.group === this.activeGroup) {
              stock.group = '默认分组'
            }
          })
          // 切换到全部分组
          this.activeGroup = '全部'
          this.updateGroupCount()
        })
      })
    },
    // 批量操作
    batchOperate() {
      this.batchVisible = !this.batchVisible
      this.selectedStocks = []
    },
    // 移动股票到分组
    moveStock() {
      if (this.selectedStocks.length === 0) {
        this.$message.error('请选择要移动的股票')
        return
      }
      this.moveForm.targetGroup = ''
      this.moveDialogVisible = true
    },
    // 确认移动
    confirmMove() {
      if (!this.moveForm.targetGroup) {
        this.$message.error('请选择目标分组')
        return
      }
      
      manageSelfSelectGroup({
        operation: 'move',
        fromGroup: this.activeGroup,
        toGroup: this.moveForm.targetGroup,
        stockCodes: this.selectedStocks
      }).then(res => {
        this.$message.success('股票移动成功')
        // 更新股票分组
        this.selfSelect.forEach(stock => {
          if (this.selectedStocks.includes(stock.code)) {
            stock.group = this.moveForm.targetGroup
          }
        })
        this.moveDialogVisible = false
        this.batchVisible = false
        this.selectedStocks = []
        this.updateGroupCount()
      })
    },
    // 批量删除
    batchDelete() {
      if (this.selectedStocks.length === 0) {
        this.$message.error('请选择要删除的股票')
        return
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedStocks.length} 只股票吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 批量删除
        this.selectedStocks.forEach(code => {
          deleteSelfSelect(code)
        })
        // 更新本地自选股列表
        this.$store.state.user.selfSelect = this.selfSelect.filter(
          stock => !this.selectedStocks.includes(stock.code)
        )
        this.$message.success('批量删除成功')
        this.batchVisible = false
        this.selectedStocks = []
      })
    },
    // 移除单个股票
    removeStock(code) {
      this.$confirm('确定要删除该自选股吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSelfSelect(code).then(res => {
          // 更新本地自选股列表
          this.$store.state.user.selfSelect = this.selfSelect.filter(
            stock => stock.code !== code
          )
          this.$message.success('删除成功')
        })
      })
    },
    // 前往个股详情
    goToDetail(stock) {
      this.$router.push(`/detail/${stock.code}`)
    },
    // 股票点击事件
    handleStockClick(stock) {
      if (this.batchVisible) {
        // 批量模式下切换选中状态
        if (this.selectedStocks.includes(stock.code)) {
          this.selectedStocks = this.selectedStocks.filter(code => code !== stock.code)
        } else {
          this.selectedStocks.push(stock.code)
        }
      }
    },
    // 添加股票
    addStock() {
      this.$router.push('/ai/select')
    },
    // 初始化拖拽事件
    initDragEvent() {
      // 这里可集成vuedraggable实现拖拽排序，简化版暂用占位
    },
    // 开始拖拽
    startDrag(index) {
      this.dragIndex = index
    }
  }
}
</script>

<style scoped>
.self-select-group {
  width: 100%;
}
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}
.group-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.el-tag {
  cursor: pointer;
  padding: 6px 12px;
}
.el-tag.active {
  background-color: #e53935;
  color: #fff;
}
.stock-list {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 8px;
  min-height: 300px;
}
.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.stock-item:hover {
  background-color: #f8f8f8;
}
.stock-item.selected {
  background-color: #e6f7ff;
}
.stock-info {
  display: flex;
  gap: 16px;
}
.code {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}
.name {
  font-size: 14px;
  color: #666;
}
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 32px 0;
}
.empty-tip el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.batch-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f8f8f8;
  border-top: 1px solid #e6e6e6;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .group-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .group-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
  }
}
</style>