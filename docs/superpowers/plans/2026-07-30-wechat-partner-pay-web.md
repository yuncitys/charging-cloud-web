# 微信支付服务商模式 — Web 管理端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 管理端支持 `wxpay_partner` 通道配置与微信特约商户进件；列表页统一展示通道名称。

**Architecture:** 新建 `payChannel.js`、`wxSalesScene.js` 常量；`paymentChannel/edit.vue` 增加 Partner 配置区；`tradeEntry/entry.vue` 按渠道分支表单、Option C 多经营场景与上传；`detail.vue` 展示扩展表 + 查询状态；依赖 charging-cloud 分支 save/detail/query API。

**Tech Stack:** Vue 2、Element UI、现有 `@/api/channelConfigInfo`、`@/api/pay/tradeEntry`

**Spec:** [`docs/superpowers/specs/2026-07-30-wechat-partner-pay-web-design.md`](../specs/2026-07-30-wechat-partner-pay-web-design.md)

**后端 Spec：** [charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md](../../../charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md)

**进度（2026-07-31）：** W0–W4 + Task B 已实现；W5 联调待完成。

## Global Constraints

- **分支：** 从 **`main`** 切 `feature/wechat-partner-pay-web`；**禁止**在其它业务分支直接改
- **仓库：** `charging-cloud-web`（本 plan）；后端在 `charging-cloud` 的 `feature/wechat-partner-pay`
- **通道 code：** `wxpay_partner`；展示名「微信(服务商)」
- **不改：** 台账分账提交逻辑、小程序端
- **Commit：** 按 Task 粒度提交

---

## File Map

| 路径 | 职责 |
|------|------|
| `src/utils/payChannel.js` | **新建** 通道 code → 中文名 |
| `src/utils/wxSalesScene.js` | **新建** 经营场景选项、附件映射、extJson 互转 |
| `src/views/paymentChannel/components/edit.vue` | Partner 配置表单 + confirm 序列化 |
| `src/views/paymentChannel/index.vue` | 列表展示 |
| `src/views/tradeEntry/entry.vue` | 渠道分支 + wx 字段 + Option C 场景 + 上传逻辑 |
| `src/views/tradeEntry/detail.vue` | 扩展信息 + 签约链接 + 查询状态 |
| `src/views/tradeEntry/index.vue` | 渠道列（P1） |
| `src/api/pay/tradeEntry.js` | 类型注释/字段透传（如需） |
| `payment/billPaymentInfo/index.vue` 等 | 通道展示（P1） |

**后端（charging-cloud，Task B）：**

| 路径 | 职责 |
|------|------|
| `SubmitTradeEntryRequest.java` | 增加 `TradeEntryWxDTO tradeEntryWx` |
| `MerchantTradeEntryDetailVO.java` | 增加 `MerchantTradeEntryWx tradeEntryWx` |
| `TradeEntryController.saveTradeMerchant` | upsert 扩展表；attach 写 `fileBatchId`（微信 media_id 由 submit 时写入） |
| `TradeEntryController.detailTradeEntry` | 查询并返回扩展表 |
| `WxPartnerTradeEntryStrategyImpl.java` | submit/query/uploadMissingMedia |

---

### Task 0: 从 main 切功能分支

**Files:** 无代码

- [x] **Step 1: 确认当前分支**

- [x] **Step 2: 拉取 main 并创建分支**

```bash
git fetch origin main
git checkout origin/main
git checkout -b feature/wechat-partner-pay-web
```

- [x] **Step 3: 提交设计文档（若 main 尚无）**

---

### Task B: 后端 API 补齐（charging-cloud，Web 联调前置）

**Repo:** `/Users/guanzilan/DevelopProject/charging-cloud`  
**Branch:** `feature/wechat-partner-pay`

**Files:**
- Modify: `sharecharge-pay/.../dto/SubmitTradeEntryRequest.java`
- Create: `sharecharge-pay/.../dto/TradeEntryWxDTO.java`
- Modify: `sharecharge-pay/.../vo/MerchantTradeEntryDetailVO.java`
- Modify: `sharecharge-pay/.../controller/TradeEntryController.java`

**Interfaces:**
- Produces:
  - `saveTradeMerchant` 接受 `tradeEntryWx: { settlementId, qualificationType, salesScenesTypes, extJson }`
  - `detailTradeEntry` 返回 `{ tradeEntry, attchList, tradeEntryWx }`
  - submit 时 `uploadMissingMedia` 将 OSS 文件转 `media_id` 写 `fileBatchId`（**不**使用 `channelFileId`）

- [x] **Step 1: TradeEntryWxDTO**

```java
@Data
public class TradeEntryWxDTO {
    private String settlementId;
    private String qualificationType;
    private List<String> salesScenesTypes;
    private String extJson;
}
```

- [x] **Step 2: SubmitTradeEntryRequest 增加字段**

- [x] **Step 3: saveTradeMerchant 末尾 upsert 扩展表**

- [x] **Step 4: detailTradeEntry 返回扩展表**

- [x] **Step 5: 编译 + commit**

---

### Task W1: 公共常量 + 支付渠道配置

**Files:**
- Create: `src/utils/payChannel.js`
- Modify: `src/views/paymentChannel/components/edit.vue`
- Modify: `src/views/paymentChannel/index.vue`

- [x] **Step 1: 创建 payChannel.js**

- [x] **Step 2: edit.vue — 下拉与 channelList**

- [x] **Step 3: edit.vue — wxPartnerConfig 区块**

- [x] **Step 4: confirm() 分支**

- [x] **Step 5: index.vue 使用 formatServiceProvider**

- [x] **Step 6: Commit**

---

### Task W2: 进件表单（entry.vue）

**Files:**
- Create: `src/utils/wxSalesScene.js`
- Modify: `src/views/tradeEntry/entry.vue`

**Interfaces:**
- Consumes: Task B 的 `tradeEntryWx` save API
- Produces: `isWxPartner` computed；`form.tradeEntryWx` 对象；Option C 场景 UI

- [x] **Step 1: 渠道下拉** — 含 `wxpay_partner`

- [x] **Step 2: computed `isWxPartner`**

- [x] **Step 3: 微信专用字段**

| 表单项 | 字段 | 说明 |
|--------|------|------|
| 联系邮箱 | `form.managerEmail` | 微信必填 |
| 结算规则 ID | `form.tradeEntryWx.settlementId` | 与所属行业同排 |
| 所属行业 | `form.tradeEntryWx.qualificationType` | 行业名称 |
| 经营场景 | `form.tradeEntryWx.salesScenesTypes` | 6 种多选，默认线下门店 |

- [x] **Step 4: Option C 场景区块**

按选中场景动态展示 AppId/域名/CorpID 及附件 05–11；`wxSalesScene.js` 提供映射与校验。

- [x] **Step 5: 上传逻辑分支**

wx 通道仅 OSS 上传 + 填充 `attchList`，不调 `imgInfoDiscern`；submit 时后端转 `media_id`。

- [x] **Step 6: submit 前校验**

wx 通道：`managerEmail`、`settlementId`、`qualificationType`、场景附件必填；`tradeMerType=2` 拦截。

- [x] **Step 7: 编辑回显**

`loadDetail` 时合并 `detail.tradeEntryWx`，经 `restoreTradeEntryWx()` 还原 extJson。

- [x] **Step 8: Commit**

---

### Task W3: 进件详情（detail.vue）

**Files:**
- Modify: `src/views/tradeEntry/detail.vue`

- [x] **Step 1: data 增加 wxExt**

- [x] **Step 2: loadDetail 合并 tradeEntryWx**

- [x] **Step 3: 模板 — 微信扩展信息**

展示：申请单号、微信状态、签约链接、驳回明细。

- [x] **Step 4: 查询状态按钮**

调用 `query` API 同步进度（微信无 HTTP 进件回调）。

- [x] **Step 5: 渠道展示用 formatServiceProvider**

- [x] **Step 6: Commit**

---

### Task W4: 列表页通道展示（P1）

**Files:**
- Modify: `src/views/paymentChannelInfo/index.vue`
- Modify: `src/views/payment/billPaymentInfo/index.vue`
- Modify: `src/views/payment/billPaymentLog/index.vue`
- Modify: `src/views/payment/billRefundInfo/index.vue`
- Modify: `src/views/tradeEntry/index.vue`

- [x] **Step 1:** 各页增加 `wxpay_partner` 或使用 `payChannel.js`

- [x] **Step 2:** 表格列改用 `formatServiceProvider(scope.row.serviceProviderId)`

- [x] **Step 3: Commit**

---

### Task W5: 联调验证

- [ ] **Step 1: 配置通道** — 支付渠道新增「微信服务商」，填 Partner 参数

- [ ] **Step 2: 配置支付方式** — `paymentChannelInfo` 绑定 `wx_applet` + 对应 channelId

- [ ] **Step 3: 进件** — 选 wxpay_partner，填 Option C 场景，保存 → 提交 → 详情见 applymentId / signUrl

- [ ] **Step 4: 查询状态** — 详情页「查询状态」按钮，验证状态映射

- [ ] **Step 5: 支付/分账**（可选）— 小额支付 + 分账链路

- [ ] **Step 6: 记录结果** — 更新 plan test checklist

---

## 测试计划

| 场景 | 预期 |
|------|------|
| 新增微信服务商渠道配置 | configStr 含 collectionSubMchId；列表显示「微信(服务商)」 |
| 进件保存 wx 字段 | DB `t_merchant_trade_entry_wx` 有记录（含 sales_scenes_types） |
| 进件提交 | status→10；applyment_id 写入 |
| Option C 多场景 | 选中场景对应附件必填；submit 成功 |
| 详情签约链接 | sign_url 可打开 |
| 查询状态 | query 同步 channelState / merchantNo |
| 账单列表筛选 | 可选 wxpay_partner |
| 台州银行进件 | 回归无影响 |

---

## 依赖关系

```
Task B (charging-cloud API)
    ↓
Task W2 / W3 (进件 save + detail + query)
Task W1 可独立先行
Task W4 可任意时刻
    ↓
Task W5 (E2E 联调)
```

建议顺序：**W0 → W1 → B → W2 → W3 → W4 → W5**
