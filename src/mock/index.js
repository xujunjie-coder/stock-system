import Mock from 'mockjs'
import './quote'
import './ai'
import './trade'
import './user'

// 设置全局延时，模拟网络请求
Mock.setup({
  timeout: '300-800'
})

console.log('Mock数据初始化成功')

export default Mock;