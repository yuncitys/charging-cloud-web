'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

const webpack = require('webpack')

function resolve(dir) {
	return path.join(__dirname, dir)
}

const name = defaultSettings.title || '智慧充电管理平台' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 9526 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
	/**
	 * You will need to set publicPath if you plan to deploy your site under a sub path,
	 * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
	 * then publicPath should be set to "/bar/".
	 * In most cases please use '/' !!!
	 * Detail: https://cli.vuejs.org/config/#publicpath
	 */
	publicPath: '/',
	outputDir: 'dist',
	assetsDir: 'static',
	lintOnSave: process.env.NODE_ENV === 'development',
	productionSourceMap: false,
	devServer: {
		port: port,
		open: true,
		overlay: {
			warnings: false,
			errors: true
		},
		proxy: {
			[process.env.VUE_APP_BASE_API]: {
				target: 'http://127.0.0.1:8868',
				changeOrigin: true,
				pathRewrite: {
					['^' + process.env.VUE_APP_BASE_API]: ''
				}
			}
		},
		// before: require('./mock/mock-server.js')
	},
	css: {
		loaderOptions: {
			sass: {
				implementation: require('sass'),
				sassOptions: {
					outputStyle: 'expanded'
					// 因为 sass-loader 会检查运行环境的模式，给 dart-sass 传入 { outputStyle: “compressed” }。 dart-sass 在这时会使用 BOM 而不是输出 @charset。
					// 如果是通过 @vue/cli 搭建的环境，因为有 cssnano 处理压缩，所以可以给 vue.config.js 传入 sassOptions 避免 compressed。
					// sass的默认输出格式为expanded,编译时不会转换unicode字符。而sassLoader修改了sass默认输出格式为compressed。
					// 因此我们在配置sassLoader时将输出格式重新改为expanded便能解决问题
					// 生效代码,更换打包压缩方式解决elementUI打包上线后icon图标偶尔乱码的问题
					// 嵌套输出方式 nested
					// 展开输出方式 expanded
					// 紧凑输出方式 compact
					// 压缩输出方式 compressed
				}	
			}
		}
	},
	configureWebpack: {
		// provide the app's title in webpack's name field, so that
		// it can be accessed in index.html to inject the correct title.
		name: name,
		resolve: {
			alias: {
				'@': resolve('src')
			}
		}
	},
	chainWebpack(config) {
		// it can improve the speed of the first screen, it is recommended to turn on preload
		// it can improve the speed of the first screen, it is recommended to turn on preload
		config.plugin('provide').use(webpack.ProvidePlugin, [{
			'window.Quill': 'quill'
		}])
		config.plugin('preload').tap(() => [{
			rel: 'preload',
			// to ignore runtime.js
			// https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
			fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
			include: 'initial'
		}])

		// when there are many pages, it will cause too many meaningless requests
		config.plugins.delete('prefetch')

		// set svg-sprite-loader
		config.module
			.rule('svg')
			.exclude.add(resolve('src/icons'))
			.end()
		config.module
			.rule('icons')
			.test(/\.svg$/)
			.include.add(resolve('src/icons'))
			.end()
			.use('svg-sprite-loader')
			.loader('svg-sprite-loader')
			.options({
				symbolId: 'icon-[name]'
			})
			.end()

		config
			.when(process.env.NODE_ENV !== 'development',
				config => {
					config
						.plugin('ScriptExtHtmlWebpackPlugin')
						.after('html')
						.use('script-ext-html-webpack-plugin', [{
							// `runtime` must same as runtimeChunk name. default is `runtime`
							inline: /runtime\..*\.js$/
						}])
						.end()
					config
						.optimization.splitChunks({
							chunks: 'all',
							cacheGroups: {
								libs: {
									name: 'chunk-libs',
									test: /[\\/]node_modules[\\/]/,
									priority: 10,
									chunks: 'initial' // only package third parties that are initially dependent
								},
								elementUI: {
									name: 'chunk-elementUI', // split elementUI into a single package
									priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
									test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
								},
								commons: {
									name: 'chunk-commons',
									test: resolve('src/components'), // can customize your rules
									minChunks: 3, //  minimum common number
									priority: 5,
									reuseExistingChunk: true
								}
							}
						})
					// https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
					config.optimization.runtimeChunk('single')
				}
			)
	}
}
