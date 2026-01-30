<template>
  <div class="mine-page">
    <el-row :gutter="20">
      <!-- 左侧：个人信息 -->
      <el-col :xs="24" :lg="8">
        <div class="left-panel">
          <UserInfoCard />
          
          <el-card shadow="hover" style="margin-top: 20px;">
            <div class="function-list">
              <el-menu default-active="1" class="mine-menu">
                <el-menu-item index="1" @click="$router.push('/trade/record')">
                  <el-icon name="el-icon-s-order"></el-icon>
                  <span slot="title">交易记录</span>
                </el-menu-item>
                <el-menu-item index="2" @click="$router.push('/trade/review')">
                  <el-icon name="el-icon-s-data"></el-icon>
                  <span slot="title">交易复盘</span>
                </el-menu-item>
                <el-menu-item index="3" @click="$router.push('/mine/self-select')">
                  <el-icon name="el-icon-star-on"></el-icon>
                  <span slot="title">自选股管理</span>
                </el-menu-item>
                <el-menu-item index="4" @click="$router.push('/mine/setting')">
                  <el-icon name="el-icon-setting"></el-icon>
                  <span slot="title">系统设置</span>
                </el-menu-item>
                <el-menu-item index="5" @click="$router.push('/mine/help')">
                  <el-icon name="el-icon-s-help"></el-icon>
                  <span slot="title">帮助中心</span>
                </el-menu-item>
              </el-menu>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <!-- 右侧：自选股 + 行情提醒 -->
      <el-col :xs="24" :lg="16">
        <div class="right-panel">
          <el-card shadow="hover" class="self-select-card">
            <SelfSelectGroup />
          </el-card>
          
          <el-card shadow="hover" class="alert-card" style="margin-top: 20px;">
            <PriceAlertSetting />
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import UserInfoCard from '@/components/mine/UserInfoCard.vue'
import SelfSelectGroup from '@/components/mine/SelfSelectGroup.vue'
import PriceAlertSetting from '@/components/mine/PriceAlertSetting.vue'

export default {
  components: {
    UserInfoCard,
    SelfSelectGroup,
    PriceAlertSetting
  }
}
</script>

<style scoped>
.mine-page {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}
.self-select-card, .alert-card {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}
.mine-menu {
  border-right: none;
}
/* 移动端适配 */
@media screen and (max-width: 1199px) {
  .left-panel, .right-panel {
    height: auto;
  }
  .self-select-card, .alert-card {
    margin-bottom: 20px;
  }
}
</style>