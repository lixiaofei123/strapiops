module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  indexPath: "admin.html",
  productionSourceMap: process.env.NODE_ENV != 'production',
  configureWebpack: {
    //Necessary to run npm link https://webpack.js.org/configuration/resolve/#resolve-symlinks
    resolve: {
       symlinks: false
    }
  },
  transpileDependencies: [
    '@coreui/utils',
    '@coreui/vue'
  ]
}
