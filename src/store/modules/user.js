export default {
  namespaced: true,
  state: {
    token: '', // 用户登录令牌
    userInfo: { // 个人信息
      username: '',
      avatar: '',
      userId: '',
      riskLevel: 0 // 风险等级
    },
    selfSelectStocks: [], // 自选股列表（{ code: '600000', name: '浦发银行', group: '默认分组' }）
    priceAlerts: [], // 价格提醒设置
    systemSetting: { // 系统设置
      theme: 'light', // 主题（light/dark）
      refreshInterval: 5, // 行情刷新间隔（秒）
      isSoundAlert: true // 声音提醒
    }
  }
}