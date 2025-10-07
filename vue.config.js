module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://180.232.188.157:8082',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}