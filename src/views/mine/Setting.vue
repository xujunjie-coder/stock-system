<template>
  <div class="setting-page">
    <el-card shadow="hover" style="height: 100%;">
      <div class="card-header">
        <h3>系统设置</h3>
      </div>
      
      <div class="setting-content">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-card shadow="hover" class="setting-card">
              <h4>行情设置</h4>
              <el-form :model="quoteSetting" label-width="120px">
                <el-form-item label="刷新频率">
                  <el-select v-model="quoteSetting.refreshInterval" placeholder="选择刷新频率">
                    <el-option label="3秒" value="3000"></el-option>
                    <el-option label="5秒" value="5000"></el-option>
                    <el-option label="10秒" value="10000"></el-option>
                    <el-option label="30秒" value="30000"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="默认市场">
                  <el-select v-model="quoteSetting.defaultMarket" placeholder="选择默认市场">
                    <el-option label="沪深A股" value="cn_a"></el-option>
                    <el-option label="创业板" value="gem"></el-option>
                    <el-option label="全部市场" value="all"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="行情列显示">
                  <el-checkbox-group v-model="quoteSetting.displayColumns">
                    <el-checkbox label="涨跌额"></el-checkbox>
                    <el-checkbox label="成交量"></el-checkbox>
                    <el-checkbox label="最高价"></el-checkbox>
                    <el-checkbox label="最低价"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-card shadow="hover" class="setting-card">
              <h4>界面设置</h4>
              <el-form :model="uiSetting" label-width="120px">
                <el-form-item label="主题风格">
                  <el-select v-model="uiSetting.theme" placeholder="选择主题风格">
                    <el-option label="默认主题" value="default"></el-option>
                    <el-option label="暗黑模式" value="dark"></el-option>
                    <el-option label="高对比度模式" value="highContrast"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="字体大小">
                  <el-select v-model="uiSetting.fontSize" placeholder="选择字体大小">
                    <el-option label="默认" value="default"></el-option>
                    <el-option label="偏大" value="large"></el-option>
                    <el-option label="偏小" value="small"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="横屏适配">
                  <el-switch
                    v-model="uiSetting.landscapeAdapt"
                    active-color="#1890ff"
                    inactive-color="#cccccc"
                  ></el-switch>
                </el-form-item>
                <el-form-item label="K线图动画">
                  <el-switch
                    v-model="uiSetting.klineAnimation"
                    active-color="#1890ff"
                    inactive-color="#cccccc"
                  ></el-switch>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-card shadow="hover" class="setting-card">
              <h4>提醒设置</h4>
              <el-form :model="alertSetting" label-width="120px">
                <el-form-item label="行情提醒">
                  <el-switch
                    v-model="alertSetting.priceAlert"
                    active-color="#1890ff"
                    inactive-color="#cccccc"
                  ></el-switch>
                </el-form-item>
                <el-form-item label="声音提醒">
                  <el-switch
                    v-model="alertSetting.soundAlert"
                    active-color="#1890ff"
                    inactive-color="#cccccc"
                    :disabled="!alertSetting.priceAlert"
                  ></el-switch>
                </el-form-item>
                <el-form-item label="桌面通知">
                  <el-switch
                    v-model="alertSetting.desktopNotify"
                    active-color="#1890ff"
                    inactive-color="#cccccc"
                    :disabled="!alertSetting.priceAlert"
                  ></el-switch>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-card shadow="hover" class="setting-card">
              <h4>数据管理</h4>
              <div class="data-management">
                <el-button type="text" icon="el-icon-delete" @click="clearCache">清除缓存</el-button>
                <el-button type="text" icon="el-icon-download" @click="exportData">导出数据</el-button>
                <el-button type="text" icon="el-icon-upload" @click="importData">导入数据</el-button>
                <el-button type="text" icon="el-icon-refresh" @click="resetSetting">重置设置</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="save-actions" style="margin-top: 20px; text-align: right;">
          <el-button type="primary" @click="saveSetting">保存设置</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 行情设置
      quoteSetting: {
        refreshInterval: '3000',
        defaultMarket: 'cn_a',
        displayColumns: ['涨跌额', '成交量']
      },
      // 界面设置
      uiSetting: {
        theme: 'default',
        fontSize: 'default',
        landscapeAdapt: true,
        klineAnimation: true
      },
      // 提醒设置
      alertSetting: {
        priceAlert: true,
        soundAlert: true,
        desktopNotify: true
      }
    }
  },
  mounted() {
    // 从本地存储加载设置
    this.loadSetting()
  },
  methods: {
    // 加载设置
    loadSetting() {
      const savedSetting = localStorage.getItem('systemSetting')
      if (savedSetting) {
        const setting = JSON.parse(savedSetting)
        this.quoteSetting = setting.quoteSetting || this.quoteSetting
        this.uiSetting = setting.uiSetting || this.uiSetting
        this.alertSetting = setting.alertSetting || this.alertSetting
      }
    },
    // 保存设置
    saveSetting() {
      const setting = {
        quoteSetting: this.quoteSetting,
        uiSetting: this.uiSetting,
        alertSetting: this.alertSetting
      }
      localStorage.setItem('systemSetting', JSON.stringify(setting))
      this.$message.success('设置保存成功')
      
      // 应用高对比度模式
      if (this.uiSetting.theme === 'highContrast') {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    },
    // 清除缓存
    clearCache() {
      this.$confirm('确定要清除所有缓存数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('systemSetting')
        localStorage.removeItem('searchHistory')
        localStorage.removeItem('filterCondition')
        this.$message.success('缓存清除成功')
      })
    },
    // 导出数据
    exportData() {
      this.$message.success('数据导出成功，格式为Excel')
    },
    // 导入数据
    importData() {
      this.$message.info('请选择要导入的Excel文件')
    },
    // 重置设置
    resetSetting() {
      this.$confirm('确定要重置所有设置为默认值吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.quoteSetting = {
          refreshInterval: '3000',
          defaultMarket: 'cn_a',
          displayColumns: ['涨跌额', '成交量']
        }
        this.uiSetting = {
          theme: 'default',
          fontSize: 'default',
          landscapeAdapt: true,
          klineAnimation: true
        }
        this.alertSetting = {
          priceAlert: true,
          soundAlert: true,
          desktopNotify: true
        }
        this.$message.success('设置已重置为默认值')
      })
    }
  }
}
</script>

<style scoped>
.setting-page {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-header {
  margin-bottom: 20px;
}
h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.setting-content {
  flex: 1;
  overflow-y: auto;
}
.setting-card {
  height: 100%;
  padding: 16px;
  margin-bottom: 20px;
}
.setting-card h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.el-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.data-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
/* 高对比度模式样式 */
.high-contrast {
  --el-color-primary: #e53935;
  --el-color-success: #006400;
  --el-color-warning: #ff8c00;
  --el-color-danger: #dc143c;
  --el-color-info: #0000ff;
  --el-text-color-primary: #000;
  --el-text-color-regular: #000;
  --el-text-color-secondary: #333;
  --el-bg-color: #fff;
  --el-border-color: #000;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .setting-card {
    margin-bottom: 16px;
  }
  .el-form-item {
    width: 100%;
  }
}
</style>