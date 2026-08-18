# 微信支付服务商模式 — Web 管理端设计说明

**日期：** 2026-07-30（2026-07-31 修订）  
**范围：** `charging-cloud-web`（支付渠道配置、商户进件、通道展示）  
**后端依赖：** `charging-cloud` 分支 `feature/wechat-partner-pay`  
**后端设计：** [charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md](../../../charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md)  
**字段映射：** [charging-cloud/docs/wechat-partner/trade-entry-field-mapping.md](../../../charging-cloud/docs/wechat-partner/trade-entry-field-mapping.md)  
**状态：** W0–W4 已实现；W5 联调待完成

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
| 进件渠道选项 | TZBank / 微信(服务商)；保留现有 `wxpay` 直连选项不动 |
| 渠道配置 | `paymentChannel` 新增「微信服务商」类型 + Partner 配置表单 |
| 分账/台账页 | **不改业务逻辑**，仅可选展示通道名称 |
| 主体类型 | 共用主表 `tradeMerType`，**不重复录入**；后端映射 `subject_type` |
| 小微商户 | `tradeMerType=2` 微信不支持，前后端均拦截 |
| 经营场景 | **Option C**：6 种场景多选，动态展示字段与附件 |
| 附件标识 | 复用 `fileBatchId`（台行批次号 / 微信 `media_id`），**无** `channelFileId` |
| 进件状态 | **查询按钮**调用 `query` API；微信无官方 HTTP 进件回调 |
| `subAppid` | 已移除，不录入 |

## 页面改造范围

### P0 — 必须（否则无法开通）

| 页面 | 路径 | 状态 |
|------|------|------|
| 支付渠道编辑 | `views/paymentChannel/components/edit.vue` | ✅ Partner 配置项 |
| 支付渠道列表 | `views/paymentChannel/index.vue` | ✅ 展示 `wxpay_partner` |
| 进件表单 | `views/tradeEntry/entry.vue` | ✅ 渠道分支 + Option C 场景 |
| 进件详情 | `views/tradeEntry/detail.vue` | ✅ 扩展信息 + 查询状态 |

### P1 — 建议（展示/筛选）

| 页面 | 路径 | 状态 |
|------|------|------|
| 支付方式绑定 | `views/paymentChannelInfo/index.vue` | ✅ |
| 支付账单 | `views/payment/billPaymentInfo/index.vue` | ✅ |
| 支付日志 | `views/payment/billPaymentLog/index.vue` | ✅ |
| 退款账单 | `views/payment/billRefundInfo/index.vue` | ✅ |
| 进件列表 | `views/tradeEntry/index.vue` | ✅ 渠道列/筛选 |

### P2 — 可选

| 页面 | 说明 |
|------|------|
| `finance/orderSplitRecord.vue` | 分账记录加「支付通道」列（后端已有 `service_provider_id`） |

### 不改

- `finance/settlementLedger/index.vue` — 分账提交逻辑不变
- `operations/stationSplitConfig`、`netWorkDot/netWorkDotSetting` — 仍用 `listCompleted`
- `merchant/merchantList.vue` — 仅跳转进件

## 后端 API（已对齐）

| API | 状态 | 说明 |
|-----|------|------|
| `POST /tradeMerchant/saveTradeMerchant` | ✅ | 持久化 `t_merchant_trade_entry_wx`（含 `salesScenesTypes`、`extJson`） |
| `GET /tradeMerchant/detailTradeEntry/{id}` | ✅ | VO 含 `tradeEntryWx` |
| 进件 submit | ✅ | 后端 `uploadMissingMedia` 将 OSS 文件转 `media_id` 写 `fileBatchId` |
| 进件 query | ✅ | 详情页「查询状态」按钮；同步微信 `applyment_state` |

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

### 与TZBank差异

| 能力 | tzbank | wxpay_partner |
|------|--------|---------------|
| 营业执照 OCR | `imgInfoDiscern` | **不用**；仅 OSS 上传 |
| 主体类型 | `tradeMerType` 0/1/2 | 共用 `tradeMerType`，后端映射 `subject_type` |
| 行业/结算 | `busKindCode` | `settlementId` + `qualificationType` |
| 联系邮箱 | 可选 | 主表 `managerEmail` **必填** |
| 提交后 | 银行审核 | 可能返回 `sign_url` 待签约 |
| 状态同步 | 银行回调 | **查询按钮** → `query` API |

### 表单扩展字段（`form.tradeEntryWx`）

- `settlementId` — 入驻结算规则 ID（与 `qualificationType` 同排展示）
- `qualificationType` — 所属行业名称
- `salesScenesTypes` — 经营场景多选（默认 `['SALES_SCENES_STORE']`）
- `extJson` — 各场景 AppId、域名、CorpID 等（由 `wxSalesScene.js` 扁平化/还原）

主表 `managerEmail`（微信必填）。`tradeMerType` 共用，**不再单独录入主体类型**。

### 经营场景 Option C

6 种场景可多选，选中后动态展示对应字段与附件：

| 场景 | 扩展字段 | 附件 fileType |
|------|---------|---------------|
| 线下门店 | — | 05 门头、06 店内 |
| 小程序 | `miniProgramAppId` | 07 小程序截图 |
| 公众号 | `mpAppId` | 08 公众号截图 |
| App | `appAppId`、`appDownloadUrl` | 09 App 截图 |
| 企业微信 | `weworkCorpId` | 10 企微截图 |
| 互联网网站 | `webDomain` | 11 网站授权截图 |

工具类 `src/utils/wxSalesScene.js`：
- `WX_SALES_SCENE_OPTIONS` — 6 种选项
- `SCENE_ATTACHMENT_MAP` — 场景 → 附件类型
- `flattenTradeEntryWx()` / `restoreTradeEntryWx()` — 与后端 `extJson` 互转
- 提交前校验与后端 `WxPartnerTradeEntrySceneValidator` 一致

### 微信专用附件

| fileType | 含义 |
|----------|------|
| 01/02/04 | 身份证正反面、营业执照（与台行共用） |
| 05/06 | 门头照、店内照（线下门店场景） |
| 07–11 | 各线上场景授权截图 |

上传 UI：72×72 缩略图 + 同行添加按钮；场景提示 inline 于复选框行。

保存时随 `saveTradeMerchant` 一并提交；submit 时后端上传微信得 `media_id` 写 `fileBatchId`。

### 详情页扩展展示

- `applymentId`、`channelState`、`signUrl`（可点击跳转签约）
- `auditDetailJson` 解析展示驳回原因
- **查询状态**按钮：调用 `query` API 同步最新进度（无 HTTP 回调）

## 公共常量

`src/utils/payChannel.js`：

```javascript
export const SERVICE_PROVIDER_MAP = {
  tzbank: 'TZBank',
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

| Phase | 内容 | 状态 |
|-------|------|------|
| **B** | 后端 API 补齐（charging-cloud） | ✅ |
| **W0** | 从 `main` 切分支 + 常量 | ✅ |
| **W1** | 支付渠道配置 | ✅ |
| **W2** | 进件表单 + Option C 场景 | ✅ |
| **W3** | 进件详情 + 查询状态 | ✅ |
| **W4** | 各列表通道展示 | ✅ |
| **W5** | E2E 联调验证 | 待完成 |
