export default {
  state: {
    username: '股票新手',
    balance: 100000.00, // 模拟资金
    todayProfit: 0, // 今日盈亏
    selfSelect: [
      { code: '600519', name: '贵州茅台', group: '消费龙头' },
      { code: '002594', name: '比亚迪', group: '科技成长' }
    ], // 自选股
    searchHistory: [] // 搜索历史
  }
}