var BaseConfig = {
  VUE_BASE_title: '智慧充电管理平台',
  VUE_BASE_API: 'http://127.0.0.1:8868',
  VUE_APP_DOWNLOAD: 'http://127.0.0.1:8868',
  VUE_WEBSOCKET_API: 'ws://127.0.0.1:8868/api/message/websocket',
  VUE_MAP_KEY: 'd9f3969bc9d54afb5b8fbf6f82885a77',
  /**
   * 订单列表、设备列表等页的「单车 / 汽车」Tab：按顺序展示；visible: false 可隐藏某项；id 对应接口 ruleId。
   */
  VUE_RULE_ID_TABS: [
    { id: '2', title: '汽车', visible: true },
    { id: '1', title: '单车', visible: true },
  ],
}