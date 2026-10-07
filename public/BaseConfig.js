var BaseConfig = {
  VUE_BASE_title: '智慧充电管理平台',
  VUE_BASE_API: 'http://127.0.0.1:8868',
  VUE_APP_DOWNLOAD: 'http://127.0.0.1:8868',
  VUE_WEBSOCKET_API: 'ws://127.0.0.1:8868/api/message/websocket',
  VUE_MAP_KEY: 'd9f3969bc9d54afb5b8fbf6f82885a77',
  VUE_LARGE_SCREEN_DATA_SOURCE: 'mock',//real 或 mock
  /**
   * 订单列表、设备列表等页的「电动单车 / 新能源汽车」Tab：按顺序展示；visible: false 可隐藏某项；id 对应接口 ruleId。
   */
  VUE_RULE_ID_TABS: [
    { id: '2', title: '新能源汽车', visible: true },
    { id: '1', title: '电动单车', visible: true },
  ],
  /**
   * 登录页展示内容。任一项不填或留空时使用内置默认值。
   * logo / illustration 可填完整 URL，或相对站点根目录的路径（如 'static/login/logo.png'，文件放在 public 下）。
   * slogan 为口号分段数组，段与段之间显示圆点，最后一段使用品牌渐变色。
   */
  VUE_LOGIN: {
    brandName: '云创智城',
    logo: '',
    slogan: ['万桩互联', '智慧运营'],
    subTitle: '欢迎使用智慧充电综合管理平台',
    illustration: '',
    panelTitle: '欢迎登录',
    panelSubTitle: '请使用管理员分配的账号登录',
    copyright: 'Copyright© 2021 深圳市云创智城科技有限公司 All Rights Reserved 粤ICP备2022076347号',
  },
}
