# 微信支付服务商模式 — Web 管理端设计说明

**日期：** 2026-07-30  
**范围：** `charging-cloud-web`（支付渠道配置、商户进件、通道展示）  
**后端依赖：** `charging-cloud` 分支 `feature/wechat-partner-pay`  
**后端设计：** [charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md](../../../charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md)  
**状态：** 待评审

## 背景与目标

后端已接入 `wxpay_partner` 通道（进件、支付、退款、分账）。管理端需支持：

- 租户配置微信服务商凭证（含平台收单 `collectionSubMchId`）
- 站点商户选择 `wxpay_partner` 进件并提交微信 API
- 列表/账单等页面正确展示「微信(服务商)」

**不在范围：** 小程序端、台账分账业务逻辑改造、支付宝服务商。

## 已确认决策

| 项 | 决策 |
|----|------|
| Web 主分支 | **`main`**（非 charging-cloud 的 master） |
| 功能分支 | `feature/wechat-partner-pay-web` |
| 通道 code | `wxpay_partner` |
| 进件渠道选项 | 台州银行 / 微信(服务商)；保留现有 `wxpay` 直连选项不动 |
| 渠道配置 | `paymentChannel` 新增「微信服务商」类型 + Partner 配置表单 |
| 分账/台账页 | **不改业务逻辑**，仅可选展示通道名称 |

## 页面改造范围

### P0 — 必须（否则无法开通）

| 页面 | 路径 | 改造要点 |
|------|------|---------|
| 支付渠道编辑 | `views/paymentChannel/components/edit.vue` | Partner 配置项；`serviceProviderId=wxpay_partner` |
| 支付渠道列表 | `views/paymentChannel/index.vue` | 展示 `wxpay_partner` |
| 进件表单 | `views/tradeEntry/entry.vue` | 渠道 `wxpay_partner`；微信专用字段；上传不走 OCR |
| 进件详情 | `views/tradeEntry/detail.vue` | 展示扩展表字段、签约链接 |

### P1 — 建议（展示/筛选）

| 页面 | 路径 |
|------|------|
| 支付方式绑定 | `views/paymentChannelInfo/index.vue` |
| 支付账单 | `views/payment/billPaymentInfo/index.vue` |
| 支付日志 | `views/payment/billPaymentLog/index.vue` |
| 退款账单 | `views/payment/billRefundInfo/index.vue` |
| 进件列表 | `views/tradeEntry/index.vue`（渠道列/筛选） |

### P2 — 可选

| 页面 | 说明 |
|------|------|
| `finance/orderSplitRecord.vue` | 分账记录加「支付通道」列（后端已有 `service_provider_id`） |

### 不改

- `finance/settlementLedger/index.vue` — 分账提交逻辑不变
- `operations/stationSplitConfig`、`netWorkDot/netWorkDotSetting` — 仍用 `listCompleted`
- `merchant/merchantList.vue` — 仅跳转进件

## 后端 API 缺口（Web 开发前置）

当前 `feature/wechat-partner-pay` 后端尚需补齐（Web 联调前完成）：

| API | 缺口 | 建议 |
|-----|------|------|
| `POST /tradeMerchant/saveTradeMerchant` | 未持久化 `t_merchant_trade_entry_wx` | Request 增加 `tradeEntryWx` 对象；保存时 upsert |
| `GET /tradeMerchant/detailTradeEntry/{id}` | VO 无扩展表 | `MerchantTradeEntryDetailVO` 增加 `tradeEntryWx` |
| 图片上传 | 微信无 OCR；submit 时后端 `uploadMissingMedia` | Web 仍上传 OSS 存 `fileUrl`；submit 时后端转 `media_id` 写 `channel_file_id` |

## 配置模型（Web 表单 ↔ WxPartnerParams）

`paymentChannel/edit.vue` 保存 `configStr` JSON：

```json
{
  "merchantMode": "PARTNER",
  "spMchId": "...",
  "spAppId": "...",
  "collectionSubMchId": "...",
  "apiV3Key": "...",
  "serialNo": "...",
  "pemCert": "...",
  "callbackDomain": "...",
  "appletAccount": { "id": "...", "secret": "..." },
  "profitSharingEnabled": true
}
```

- `serviceProviderId` = `wxpay_partner`
- `channelName` = `微信服务商`
- `channelCode` = `wxpay_partner`

## 进件表单（wxpay_partner）

### 与台州银行差异

| 能力 | tzbank | wxpay_partner |
|------|--------|---------------|
| 营业执照 OCR | `imgInfoDiscern` | **不用**；仅 OSS 上传 |
| 主体类型 | `tradeMerType` 0/1/2 | 映射 `organizationType`（2401/2500/2502） |
| 行业/结算 | `busKindCode` | `qualificationType`（微信结算规则 id） |
| 提交后 | 银行审核 | 可能返回 `sign_url` 待签约 |

### 表单扩展字段（`form.tradeEntryWx`）

- `settlementId` — 入驻结算规则 ID
- `qualificationType` — 所属行业名称（非 ID）

主表新增 `managerEmail`（微信必填）。`tradeMerType` 共用，后端映射 `subject_type`，**不再单独录入主体类型**。

微信专用附件：`05` 门头照、`06` 店内照。

保存时随 `saveTradeMerchant` 一并提交。

### 详情页扩展展示

- `applymentId`、`channelState`、`signUrl`（可点击跳转签约）
- `auditDetailJson` 解析展示驳回原因

## 公共常量

新建 `src/utils/payChannel.js`：

```javascript
export const SERVICE_PROVIDER_MAP = {
  tzbank: '台州银行',
  wxpay: '微信(直连)',
  wxpay_partner: '微信(服务商)',
  alipay: '支付宝'
}
export function formatServiceProvider (code) {
  return SERVICE_PROVIDER_MAP[code] || code || '-'
}
```

列表页统一引用，避免硬编码散落。

## 实施阶段

| Phase | 内容 |
|-------|------|
| **B** | 后端 API 补齐（charging-cloud，可与 Web 并行） |
| **W0** | 从 `main` 切分支 + 常量 |
| **W1** | 支付渠道配置 |
| **W2** | 进件表单 + 详情 |
| **W3** | 各列表通道展示 |
| **W4** | 联调 + 可选分账记录列 |
