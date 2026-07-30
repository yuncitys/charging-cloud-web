# 微信支付服务商模式 — Web 管理端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 管理端支持 `wxpay_partner` 通道配置与微信特约商户进件；列表页统一展示通道名称。

**Architecture:** 新建 `payChannel.js` 常量；`paymentChannel/edit.vue` 增加 Partner 配置区；`tradeEntry/entry.vue` 按渠道分支表单与上传；`detail.vue` 展示扩展表；依赖 charging-cloud 分支补齐 save/detail API。

**Tech Stack:** Vue 2、Element UI、现有 `@/api/channelConfigInfo`、`@/api/pay/tradeEntry`

**Spec:** [`docs/superpowers/specs/2026-07-30-wechat-partner-pay-web-design.md`](../specs/2026-07-30-wechat-partner-pay-web-design.md)

**后端 Spec：** [charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md](../../../charging-cloud/docs/superpowers/specs/2026-07-29-wechat-partner-pay-design.md)

## Global Constraints

- **分支：** 从 **`main`** 切 `feature/wechat-partner-pay-web`；**禁止**在其它业务分支直接改
- **仓库：** `charging-cloud-web`（本 plan）；后端缺口在 `charging-cloud` 的 `feature/wechat-partner-pay`
- **通道 code：** `wxpay_partner`；展示名「微信(服务商)」
- **不改：** 台账分账提交逻辑、小程序端
- **Commit：** 按 Task 粒度提交

---

## File Map

| 路径 | 职责 |
|------|------|
| `src/utils/payChannel.js` | **新建** 通道 code → 中文名 |
| `src/views/paymentChannel/components/edit.vue` | Partner 配置表单 + confirm 序列化 |
| `src/views/paymentChannel/index.vue` | 列表展示 |
| `src/views/tradeEntry/entry.vue` | 渠道分支 + wx 字段 + 上传逻辑 |
| `src/views/tradeEntry/detail.vue` | 扩展信息 + 签约链接 |
| `src/views/tradeEntry/index.vue` | 渠道列（P1） |
| `src/api/pay/tradeEntry.js` | 类型注释/字段透传（如需） |
| `payment/billPaymentInfo/index.vue` 等 | 通道展示（P1） |

**后端（charging-cloud，Task B）：**

| 路径 | 职责 |
|------|------|
| `SubmitTradeEntryRequest.java` | 增加 `TradeEntryWxDTO tradeEntryWx` |
| `MerchantTradeEntryDetailVO.java` | 增加 `MerchantTradeEntryWx tradeEntryWx` |
| `TradeEntryController.saveTradeMerchant` | upsert 扩展表；attach 写 `channelFileId` |
| `TradeEntryController.detailTradeEntry` | 查询并返回扩展表 |

---

### Task 0: 从 main 切功能分支

**Files:** 无代码

- [ ] **Step 1: 确认当前分支**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git branch --show-current
# 不要在未合并的功能分支上直接开发
```

- [ ] **Step 2: 拉取 main 并创建分支**

```bash
git fetch origin main
git checkout origin/main
git checkout -b feature/wechat-partner-pay-web
```

- [ ] **Step 3: 提交设计文档（若 main 尚无）**

```bash
git add docs/superpowers/specs/2026-07-30-wechat-partner-pay-web-design.md \
        docs/superpowers/plans/2026-07-30-wechat-partner-pay-web.md
git commit -m "$(cat <<'EOF'
docs: add WeChat partner pay web design and plan

EOF
)"
```

---

### Task B: 后端 API 补齐（charging-cloud，Web 联调前置）

**Repo:** `/Users/guanzilan/DevelopProject/charging-cloud`  
**Branch:** `feature/wechat-partner-pay`

**Files:**
- Modify: `sharecharge-pay/.../dto/SubmitTradeEntryRequest.java`
- Create: `sharecharge-pay/.../dto/TradeEntryWxDTO.java`（或内嵌字段）
- Modify: `sharecharge-pay/.../vo/MerchantTradeEntryDetailVO.java`
- Modify: `sharecharge-pay/.../controller/TradeEntryController.java`
- Modify: `sharecharge-pay/.../dto/SubmitTradeEntryRequest.Attach` — 支持 `channelFileId`

**Interfaces:**
- Produces:
  - `saveTradeMerchant` 接受 `tradeEntryWx: { organizationType, qualificationType, subAppid }`
  - `detailTradeEntry` 返回 `{ tradeEntry, attchList, tradeEntryWx }`
  - 附件保存时写入 `channelFileId`（若前端传入）

- [ ] **Step 1: TradeEntryWxDTO**

```java
@Data
public class TradeEntryWxDTO {
    private String organizationType;
    private String qualificationType;
    private String subAppid;
}
```

- [ ] **Step 2: SubmitTradeEntryRequest 增加字段**

```java
private TradeEntryWxDTO tradeEntryWx;
```

- [ ] **Step 3: saveTradeMerchant 末尾 upsert**

```java
if (PayChannel.WECHAT_PARTNER.getCode().equals(merchantTradeEntry.getServiceProviderId())
        && submitTradeEntryRequest.getTradeEntryWx() != null) {
    MerchantTradeEntryWx wx = new MerchantTradeEntryWx();
    wx.setTradeEntryId(merchantTradeEntry.getId());
    BeanUtils.copyProperties(submitTradeEntryRequest.getTradeEntryWx(), wx);
    wx.setBusinessCode(busTradeMerNo);
    merchantTradeEntryWxService.saveOrUpdateByTradeEntryId(wx);
}
```

附件循环内增加：`attach.setChannelFileId(attch.getChannelFileId());`

- [ ] **Step 4: detailTradeEntry 返回扩展表**

```java
vo.setTradeEntryWx(merchantTradeEntryWxService.getByTradeEntryId(id));
```

- [ ] **Step 5: 编译 + commit**

```bash
mvn -pl sharecharge-pay/sharecharge-pay-server -am compile -DskipTests -q
git commit -m "$(cat <<'EOF'
feat(pay): expose trade entry wx extension in save and detail APIs

EOF
)"
```

---

### Task W1: 公共常量 + 支付渠道配置

**Files:**
- Create: `src/utils/payChannel.js`
- Modify: `src/views/paymentChannel/components/edit.vue`
- Modify: `src/views/paymentChannel/index.vue`

**Interfaces:**
- Produces: `formatServiceProvider(code)` 供列表使用
- Produces: `wxPartnerConfig` 数据模型与 `confirm()` 序列化

- [ ] **Step 1: 创建 payChannel.js**（见 design spec）

- [ ] **Step 2: edit.vue — 下拉与 channelList**

```javascript
serviceProviderList: [
  { name: '台州银行', code: 'tzbank' },
  { name: '微信(直连)', code: 'wxpay' },
  { name: '微信(服务商)', code: 'wxpay_partner' },
  { name: '支付宝', code: 'alipay' }
],
channelList: [
  { name: '台州银行', code: 'tzbank' },
  { name: '微信', code: 'wxpay' },
  { name: '微信服务商', code: 'wxpay_partner' },
  { name: '支付宝', code: 'alipay' }
]
```

- [ ] **Step 3: edit.vue — wxPartnerConfig 区块**

在 `channelName === '微信服务商'` 时展示（复用 wx 证书字段 + 新增）：

- `merchantMode` 固定 `PARTNER`（hidden）
- `spMchId`、`spAppId`、`collectionSubMchId`
- `profitSharingEnabled` switch
- 小程序/公众号、`apiV3Key`、`serialNo`、`pemCert`、`callbackDomain`（与现有 wxConfig 类似）

`data()` 增加 `wxPartnerConfig` 对象，结构与后端 `WxPartnerParams` 一致。

- [ ] **Step 4: confirm() 分支**

```javascript
} else if (this.form.channelName === '微信服务商') {
  this.form.channelCode = 'wxpay_partner'
  this.form.serviceProviderId = 'wxpay_partner'
  this.wxPartnerConfig.merchantMode = 'PARTNER'
  this.form.configStr = JSON.stringify(this.wxPartnerConfig)
}
```

`created()` 编辑回显：`channelName === '微信服务商'` 时 `JSON.parse` → `wxPartnerConfig`。

- [ ] **Step 5: index.vue 使用 formatServiceProvider**

替换硬编码 `v-if scope.row.serviceProviderId == 'wxpay'` 等为：

```vue
<span>{{ formatServiceProvider(scope.row.serviceProviderId) }}</span>
```

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): add wxpay_partner payment channel config UI

EOF
)"
```

---

### Task W2: 进件表单（entry.vue）

**Files:**
- Modify: `src/views/tradeEntry/entry.vue`

**Interfaces:**
- Consumes: Task B 的 `tradeEntryWx` save API
- Produces: `isWxPartner` computed；`form.tradeEntryWx` 对象

- [ ] **Step 1: 渠道下拉**

```vue
<el-option label="微信服务商 (wxpay_partner)" value="wxpay_partner" />
```

保留 `tzbank`；`wxpay` 直连可保留或隐藏（按产品决定，默认保留）。

- [ ] **Step 2: computed**

```javascript
isWxPartner () {
  return this.form.serviceProviderId === 'wxpay_partner'
}
```

- [ ] **Step 3: 微信专用字段区块（v-if="isWxPartner"）**

| 表单项 | 字段 | 说明 |
|--------|------|------|
| 主体类型 | `form.tradeEntryWx.organizationType` | 2401/2500/2502，与 tradeMerType 联动 |
| 结算规则 ID | `form.tradeEntryWx.qualificationType` | 微信行业编码 |
| 特约 AppId | `form.tradeEntryWx.subAppid` | 可选 |

`tradeMerType` change 时映射：

```javascript
const map = { '0': '2500', '1': '2502', '2': '2401' }
if (this.isWxPartner) {
  this.form.tradeEntryWx.organizationType = map[val] || ''
}
```

- [ ] **Step 4: 上传逻辑分支**

`handleUpload` 内：

```javascript
if (this.isWxPartner) {
  // 仅 OSS 上传 + 填充 attchList，不调 imgInfoDiscern
  return uploadToOss(file).then(fileUrl => {
    this.fillAttachment(type, fileUrl, null)
  })
}
// 现有 tzbank OCR 逻辑
```

`fillAttachment` 写入 `attchList` 项含 `fileType/fileUrl/fileName`；OCR 的 `fileBatchId` 对微信可为空。

- [ ] **Step 5: submit 前校验**

wx 通道：`organizationType`、`qualificationType` 必填。

- [ ] **Step 6: 编辑回显**

`loadDetail` 时合并 `detail.tradeEntryWx` 到 `form.tradeEntryWx`。

- [ ] **Step 7: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): wxpay_partner trade entry form and upload flow

EOF
)"
```

---

### Task W3: 进件详情（detail.vue）

**Files:**
- Modify: `src/views/tradeEntry/detail.vue`

- [ ] **Step 1: data 增加 wxExt**

```javascript
wxExt: {}
```

- [ ] **Step 2: loadDetail 合并 tradeEntryWx**

- [ ] **Step 3: 模板 — 微信扩展信息（v-if="form.serviceProviderId === 'wxpay_partner'"）**

展示：
- 申请单号 `wxExt.applymentId`
- 微信状态 `wxExt.channelState`
- 签约链接：`<el-link :href="wxExt.signUrl" target="_blank">去签约</el-link>`（有值时）
- 驳回明细：解析 `wxExt.auditDetailJson` 为 alert 列表

- [ ] **Step 4: 渠道展示用 formatServiceProvider**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): show WeChat partner trade entry extension on detail page

EOF
)"
```

---

### Task W4: 列表页通道展示（P1）

**Files:**
- Modify: `src/views/paymentChannelInfo/index.vue`
- Modify: `src/views/payment/billPaymentInfo/index.vue`
- Modify: `src/views/payment/billPaymentLog/index.vue`
- Modify: `src/views/payment/billRefundInfo/index.vue`
- Modify: `src/views/tradeEntry/index.vue`（可选：渠道列）

- [ ] **Step 1:** 各页 `serviceProviderList` 增加 `{ enCode: 'wxpay_partner', fullName: '微信(服务商)' }` 或使用 `payChannel.js`

- [ ] **Step 2:** 表格列改用 `formatServiceProvider(scope.row.serviceProviderId)`

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): display wxpay_partner across payment admin lists

EOF
)"
```

---

### Task W5: 联调验证

- [ ] **Step 1: 配置通道** — 支付渠道新增「微信服务商」，填 Partner 参数

- [ ] **Step 2: 配置支付方式** — `paymentChannelInfo` 绑定 `wx_applet` + 对应 channelId

- [ ] **Step 3: 进件** — 选 wxpay_partner，保存 → 提交 → 详情见 applymentId / signUrl

- [ ] **Step 4: 查询状态** — 详情页「查询状态」按钮

- [ ] **Step 5: 记录结果** — 更新 plan 或 test checklist

---

## 测试计划

| 场景 | 预期 |
|------|------|
| 新增微信服务商渠道配置 | configStr 含 collectionSubMchId；列表显示「微信(服务商)」 |
| 进件保存 wx 字段 | DB `t_merchant_trade_entry_wx` 有记录 |
| 进件提交 | status→10；applyment_id 写入 |
| 详情签约链接 | sign_url 可打开 |
| 账单列表筛选 | 可选 wxpay_partner |
| 台州银行进件 | 回归无影响 |

---

## 依赖关系

```
Task B (charging-cloud API)
    ↓
Task W2 / W3 (进件 save + detail)
Task W1 可独立先行
Task W4 可任意时刻
```

建议顺序：**W0 → W1 → B → W2 → W3 → W4 → W5**
