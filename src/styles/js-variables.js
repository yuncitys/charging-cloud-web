/**
 * JS 侧样式变量。Vue CLI 5 / css-loader 6 下从 .scss 的 :export 默认导入会得到空模块，
 * 勿再 `import x from '@/styles/*.scss'` 读变量。
 * 修改时请同步：
 * - element-variables.scss 的 $--color-primary
 * - variables.scss 中对应 $ 变量
 */
export default {
  theme: '#1890ff',
  menuText: '#3a3b3b',
  menuActiveText: '#51c53b',
  menuActiveBg: 'linear-gradient(45deg, #32b946, #51c53b, #62cc35, #7ad52c)',
  subMenuActiveText: '#f4f4f5',
  menuBg: 'white',
  menuHover: '#263445',
  subMenuBg: 'white',
  subMenuHover: '#001528',
  sideBarWidth: '190px'
}
