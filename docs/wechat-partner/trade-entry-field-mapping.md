# 商户进件字段对照：合作银行 vs 微信服务商

**日期：** 2026-07-30  
**范围：** `t_merchant_trade_entry` 主表 + `t_merchant_trade_entry_attach` + `t_merchant_trade_entry_wx`  
**原则：** 以合作银行现有标准字段为准；微信专用信息仅新增扩展字段，不改动台行字段语义。

> 后端同源文档：`charging-cloud/docs/wechat-partner/trade-entry-field-mapping.md`

---

## 1. 数据存储

| 存储位置 | 合作银行 | 微信服务商 |
|---------|---------|-----------|
| 主表 `t_merchant_trade_entry` | 全部商户资料 | 共用（+ `manager_email` 新增列） |
| 附件 `t_merchant_trade_entry_attach` | `file_batch_id`（OCR 批次号） | `file_batch_id`（media_id，提交时写入） |
| 扩展 `t_merchant_trade_entry_wx` | 不使用 | 结算规则、行业、AppId、申请单状态等 |

---

## 2. 共用字段（同一 Web 表单项 / 主表列）

### 2.1 基础信息

| Web 标签 | 主表字段 | 合作银行 | 微信 API |
|---------|---------|---------|---------|
| 管理员姓名 | `managerName` | ✓ | `contact_info.contact_name` |
| 管理员手机号 | `managerMobile` | ✓ | `contact_info.mobile_phone` |
| 联系邮箱 | `managerEmail` | — | `contact_info.contact_email`（必填） |
| 交易商户类型 | `tradeMerType` | ✓ | → `subject_info.subject_type`（后端映射） |

### 2.2 商户主体 / 地址 / 法人 / 结算

与合作银行主表字段一一对应，详见后端完整文档。Web 表单 `entry.vue` 两通道共用，不做重复录入。

### 2.3 附件（共用 fileType）

| fileType | 含义 | 合作银行 | 微信 |
|----------|------|--------|------|
| `04` | 营业执照 | OCR → `fileBatchId` | 提交 → `fileBatchId`（media_id） |
| `01` | 身份证正面 | OCR → `fileBatchId` | 提交 → `fileBatchId` |
| `02` | 身份证反面 | OCR → `fileBatchId` | 提交 → `fileBatchId` |

---

## 3. 通道差异字段

### 3.1 仅合作银行（Web：`v-if="!isWxPartner"`）

| Web 标签 | 主表字段 |
|---------|---------|
| 经营类目 | `busKindCode` |
| 持卡人身份证号 | `identityNo`（借记 0010） |
| 银行预留手机号 | `mobileNo`（借记 0010） |

### 3.2 仅微信服务商（Web：`v-if="isWxPartner"`）

| Web 标签 | 字段 | 说明 |
|---------|------|------|
| 联系邮箱 | `managerEmail` | 主表新增 |
| 结算规则 ID | `tradeEntryWx.settlementId` | 扩展表 |
| 所属行业 | `tradeEntryWx.qualificationType` | 行业名称，非 ID |
| 门头照 | attach `05` | 必填 |
| 店内照 | attach `06` | 必填 |

只读（详情页）：`applymentId`、`channelState`、`signUrl`、`auditDetailJson`

---

## 4. Web 页面改造

| 页面 | 改造要点 |
|------|---------|
| `entry.vue` | 共用台行字段；微信增量字段/附件；隐藏小微选项 |
| `detail.vue` | 展示微信扩展、门头/店内照；台行批次号仅台行显示 |

---

## 5. DDL（部署前执行）

`charging-cloud/doc/sql/t_wechat_partner_pay_trade_entry_20260730.sql`
