# Task 9 — Web 悬浮 OpsAgentChat 手工验收

## 前置

- Gateway 已配置 `/api/agent/**` 路由至 `sharecharge-agent`
- 使用含 agent 接口的后端环境（非仅静态 mock）

## 清单

- [ ] 登录 Web 管理端，进入任意带侧边栏的业务页（layout 已挂载组件）
- [ ] 右下角可见蓝色圆形悬浮按钮（聊天图标）
- [ ] 点击悬浮按钮，展开「运维助手」面板；点击关闭图标可收起
- [ ] 在**订单详情/列表**等路由（query 或 params 含 `orderId` / `orderCode`）打开面板，发送「帮我看看这个订单」
- [ ] 请求走 `POST /api/agent/chat`，携带 `pageContext`（含当前页 orderId/orderCode/stationId/deviceCode 中非空字段）
- [ ] 助手回复出现在消息区；用户消息右对齐蓝色气泡，助手左对齐灰色气泡
- [ ] 若响应含 `pendingActions`，面板内展示待确认卡片（summary 文案 + 确认/取消）
- [ ] 点「取消」仅本地移除卡片，不调用接口
- [ ] 点「确认」调用 `POST /api/agent/actions/{id}/confirm`；成功后在消息区出现执行回执；失败有失败提示
- [ ] 刷新页面后 `sessionId` 从 sessionStorage 恢复，同一会话可继续对话
- [ ] 移动端宽度下悬浮球与面板不遮挡主导航关键操作（目视检查）

## 备注

- 无前端单测；以上项需在联调环境逐项勾选。
