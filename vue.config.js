module.exports = {
  // 解决开发环境跨域（Mock无需真实跨域，仅配置路径别名）
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src') // 确保@指向src目录
      }
    }
  },
  // 开发服务器配置（支持Mock接口）
  devServer: {
    open: true,
    overlay: {
      warnings: false,
      errors: true
    }
  }
}