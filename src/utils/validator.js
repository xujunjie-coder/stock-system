/**
 * 交易相关表单校验工具
 */
export default {
  // 股票代码校验（6位数字）
  validateStockCode(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入股票代码'))
    } else if (!/^\d{6}$/.test(value)) {
      callback(new Error('股票代码必须是6位数字'))
    } else {
      callback()
    }
  },
  // 价格校验（正数，保留2位小数）
  validatePrice(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入委托价格'))
    } else if (isNaN(value) || parseFloat(value) <= 0) {
      callback(new Error('价格必须是大于0的数字'))
    } else if (value.toString().split('.').length > 1 && value.toString().split('.')[1].length > 2) {
      callback(new Error('价格最多保留2位小数'))
    } else {
      callback()
    }
  },
  // 数量校验（正整数，按市场类型校验）
  validateAmount(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入委托数量'))
    } else if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
      callback(new Error('数量必须是正整数'))
    } else if (parseInt(value) > 100000) {
      callback(new Error('单次委托数量不能超过100000'))
    } else {
      // 后续结合市场类型动态校验（科创板≥200股，其他≥100股，整百倍数）
      callback()
    }
  },
  // 资金密码校验（6位数字）
  validateTradePwd(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入交易密码'))
    } else if (!/^\d{6}$/.test(value)) {
      callback(new Error('交易密码必须是6位数字'))
    } else {
      callback()
    }
  }
}