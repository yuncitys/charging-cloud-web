## 简介

充电运营管理WEB端

基于vue-element-admin框架
主要由[vue2.0](https://cn.vuejs.org/)和[Elmentui2.0](https://element.faas.ele.me/#/zh-CN/component/installation)框架开发的

##开发注意项
##
1.已对本项目进行移动端适配
##
2.开发环境下的接口请求域名在vue.config.js文件中，可自行切换本地或线上地址调试
##
3.生成环境的接口请求域名由后台在宝塔内配置，只需打包即可
原理：在.env.production文件中写入'/api',后台在宝塔配置后会自动将'/api'转为线上请求域名
##
4.本项目使用前端路由权限，所有跳转路由都得在前端配置


```
- Login / Logout

- Permission Authentication
  - Page permission
  - Directive permission
  - Permission configuration page
  - Two-step login

- Multi-environment build
  - Develop (dev)
  - sit
  - Stage Test (stage)
  - Production (prod)

- Global Features
  - I18n
  - Multiple dynamic themes
  - Dynamic sidebar (supports multi-level routing)
  - Dynamic breadcrumb
  - Tags-view (Tab page Support right-click operation)
  - Svg Sprite
  - Mock data
  - Screenfull
  - Responsive Sidebar

- Editor
  - Rich Text Editor
  - Markdown Editor
  - JSON Editor

- Excel
  - Export Excel
  - Upload Excel
  - Visualization Excel
  - Export zip

- Table
  - Dynamic Table
  - Drag And Drop Table
  - Inline Edit Table

- Error Page
  - 401
  - 404

- Components
  - Avatar Upload
  - Back To Top
  - Drag Dialog
  - Drag Select
  - Drag Kanban
  - Drag List
  - SplitPane
  - Dropzone
  - Sticky
  - CountTo

- Advanced Example
- Error Log
- Dashboard
- Guide Page
- ECharts
- Clipboard
- Markdown to html
```

## 开发

```
# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```



## 打包

```bash
# 构建生产环境
npm run build:prod
```

