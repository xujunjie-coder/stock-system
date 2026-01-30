<template>
  <div class="user-info-card">
    <el-card shadow="hover">
      <div class="card-header">
        <h3>个人信息</h3>
        <el-button type="text" icon="el-icon-edit" @click="editUserInfo">编辑资料</el-button>
      </div>
      
      <div class="info-content">
        <div class="avatar-container">
          <el-avatar :size="100" :src="userInfo.avatar">
            {{ userInfo.username && userInfo.username.slice(0, 1) }}
          </el-avatar>
          <el-button 
            type="text" 
            icon="el-icon-upload"
            class="upload-avatar"
            @click="uploadAvatar"
          >更换头像</el-button>
        </div>
        
        <div class="info-list">
          <div class="info-item">
            <div class="label">用户名</div>
            <div class="value">{{ userInfo.username }}</div>
          </div>
          <div class="info-item">
            <div class="label">用户ID</div>
            <div class="value">{{ userInfo.userId && userInfo.userId.slice(-8) }}</div>
          </div>
          <div class="info-item">
            <div class="label">注册时间</div>
            <div class="value">{{ userInfo.registerTime }}</div>
          </div>
          <div class="info-item">
            <div class="label">模拟资金</div>
            <div class="value rise">{{ userInfo.balance.toFixed(2) }} 元</div>
          </div>
          <div class="info-item">
            <div class="label">今日盈亏</div>
            <div class="value" :class="userInfo.todayProfit >= 0 ? 'rise' : 'fall'">
              {{ userInfo.todayProfit >= 0 ? '+' : '' }}{{ userInfo.todayProfit.toFixed(2) }} 元
            </div>
          </div>
          <div class="info-item">
            <div class="label">总盈亏</div>
            <div class="value" :class="userInfo.totalProfit >= 0 ? 'rise' : 'fall'">
              {{ userInfo.totalProfit >= 0 ? '+' : '' }}{{ userInfo.totalProfit.toFixed(2) }} 元
              <span class="rate">({{ userInfo.profitRate.toFixed(2) }}%)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-links" style="margin-top: 20px; text-align: right;">
        <el-button type="text" @click="viewPrivacyPolicy">隐私政策</el-button>
        <el-button type="text" @click="viewUserAgreement">用户协议</el-button>
        <el-button type="text" @click="viewFundDetail">资金明细</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getUserInfo, updateUserInfo } from '@/api/user'

export default {
  data() {
    return {
      userInfo: {
        username: '股票新手',
        userId: '',
        registerTime: '',
        balance: 100000.00,
        todayProfit: 0,
        totalProfit: 0,
        profitRate: 0,
        avatar: ''
      },
      editDialogVisible: false,
      editForm: {
        username: ''
      }
    }
  },
  mounted() {
    this.fetchUserInfo()
  },
  methods: {
    // 获取用户信息
    fetchUserInfo() {
      getUserInfo().then(res => {
        this.userInfo = res.data
      })
    },
    // 编辑用户信息
    editUserInfo() {
      this.editForm.username = this.userInfo.username
      this.editDialogVisible = true
    },
    // 提交编辑
    submitEdit() {
      updateUserInfo({ username: this.editForm.username }).then(res => {
        this.$message.success('用户名修改成功')
        this.userInfo.username = res.data.username
        this.editDialogVisible = false
      })
    },
    // 上传头像
    uploadAvatar() {
      this.$message.info('头像上传功能暂未开放')
    },
    // 查看隐私政策
    viewPrivacyPolicy() {
      this.$router.push('/common/privacy')
    },
    // 查看用户协议
    viewUserAgreement() {
      this.$router.push('/common/agreement')
    },
    // 查看资金明细
    viewFundDetail() {
      this.$message.info('资金明细功能暂未开放')
    }
  }
}
</script>

<style scoped>
.user-info-card {
  width: 100%;
}
.el-card {
  padding: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.info-content {
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 20px;
}
.avatar-container {
  position: relative;
}
.upload-avatar {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: #1890ff;
  font-size: 12px;
}
.info-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  font-size: 14px;
  color: #666;
}
.value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.rise {
  color: #e53935;
}
.fall {
  color: #2f9b56;
}
.rate {
  font-size: 12px;
  margin-left: 4px;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .info-content {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .info-list {
    grid-template-columns: 1fr;
    width: 100%;
  }
  .upload-avatar {
    position: static;
    transform: none;
    margin-top: 8px;
  }
}
</style>