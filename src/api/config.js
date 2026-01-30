// 消息类型枚举（匹配原型设计）
export const MsgType = {
  MSG_NONE: 0,
  MSG_QUOTE_LIST: 1,
  MSG_STOCK_DETAIL: 2,
  MSG_KLINE_DATA: 3,
  MSG_AI_SELECT: 4,
  MSG_AI_PREDICT: 5,
  MSG_TRADE_ORDER: 6,
  MSG_HOLD_LIST: 7,
  MSG_USER_INFO: 8,
  MSG_QUOTE_BATCH: 9,
  MSG_AI_BACKTEST: 10,
  MSG_TRADE_CANCEL: 11,
  MSG_OK: 200,
  MSG_ERROR: 500
};

// 业务错误码映射（匹配原型设计）
export const ERR_CODE_MAP = {
  1001: '输入的股票代码不存在，请核对',
  1002: '委托数量不符合规则，请核对市场交易规则',
  1003: 'AI分析暂时不可用，请稍后重试',
  1004: '当前委托价格偏离市价±5%，是否继续提交？',
  1005: '该分组名称已存在，请更换名称'
};

// 接口路径前缀（与Mock接口匹配）
export const API_PREFIX = {
  QUOTE: '/quote',
  AI: '/ai',
  TRADE: '/trade',
  USER: '/user'
};