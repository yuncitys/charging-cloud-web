# 退款记录列表瘦身 + 独立详情页（Web）

日期：2026-11-02  
Slug：`refund-record-detail`  
后端设计见 charging-cloud：`docs/superpowers/specs/refund-record-detail/2026-11-02-refund-record-detail-design.md`

## 范围

- `refundRecord.vue`：列表列精简；操作仅「详情」。
- 新增 `refundRecordDetail.vue` + 路由 `/finance/refundRecordDetail`（hidden）。
- `api/finance/refundRecord.js`：`getDetail({ id })` → `POST /api/web/refund/detail`。
- 「对账处理」从列表挪到详情页（权限与 PENDING 条件不变）。
- 列表筛选、导出仍在列表页。

## 列表列

退款编号、用户ID、退款金额、退款状态、对账状态、退款时间、操作「详情」。

## 验收（Web）

1. 列表不再出现第三方编号、处理结果、对账处理等列/按钮。
2. 详情页展示完整字段；PENDING 可对账并刷新。
3. 无 id / 接口失败有明确提示并可返回列表。
