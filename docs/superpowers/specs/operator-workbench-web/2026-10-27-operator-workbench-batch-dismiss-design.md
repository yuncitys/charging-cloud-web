# 运营商工作台 · 批量忽略预警

**Date:** 2026-10-27  
**Status:** Draft  
**Parent:** `2026-10-27-operator-workbench-v2-design.md`  
**Branches:** 继续 `feature/operator-workbench` + `feature/operator-workbench-web`

## Goal

异常预警列表支持多选后一次忽略，减少零收入等成片告警时的逐条操作。

## Scope

| 做 | 不做 |
|----|------|
| 表格多选 + 「批量忽略」 | 分页 / 取消 Top20 |
| 共用现有 3/7/30 天数弹窗（默认 7） | 批量改预警阈值 |
| 后端批量 dismiss API（事务内逐条 upsert） | 改商户下拉 / inScope 口径 |
| 部分失败返回成功/失败计数 | 「已忽略」批量取消 |

## UI

- 预警表增加多选列；标题旁增加「批量忽略」按钮（未勾选时禁用）。
- 点「批量忽略」→ 打开与单条相同的天数弹窗；文案改为「已选 N 条」。
- 单条「忽略」保持不变。
- 成功后清空勾选并刷新列表；toast：`已忽略 x 条`；若有失败：`已忽略 x 条，失败 y 条`（失败原因以首条或汇总 msg，不逐条弹窗）。

## API

`POST /operatorWorkbench/alerts/dismiss/batch`

- 权限 / DataScope：与单条 dismiss 相同（`alerts` + `@DataScope` 网点别名 `w`）。
- Body：

```json
{
  "days": 7,
  "items": [
    { "merchantId": 1, "stationId": 10, "alertType": "ZERO_INCOME" }
  ]
}
```

- 约束：`days` ∈ {3,7,30}（缺省 7）；`items` 非空，建议上限 100；每项字段必填，`alertType` 枚举同 V2。
- 行为：对每项先按「该商户+该站点」做 `inScope`；通过则调用现有 `dismiss` upsert；失败项记入结果，不中断其余项。
- 响应 data：`{ successCount, failCount, failures?: [{ merchantId, stationId, alertType, msg }] }`（`failures` 可截断前 20 条）。HTTP 仍 200 + 业务 code 成功；全失败时也可 200 + successCount=0，由前端 toast 提示。

单条 `POST .../alerts/dismiss` 保留，供单行操作与兼容。

## Security

- 每项独立 scope：`stationIds=[stationId]` + `merchantId`，与现网单条一致。
- 越权项计入 fail，不泄露其它商户数据。

## Acceptance

1. 勾选多条 → 批量忽略 7 天 → 列表消失；同商户其他账号也看不到。  
2. 未勾选时「批量忽略」不可点。  
3. 混入无权限站点时：有权限的成功，无权限计入失败并提示条数。  
4. 单条忽略路径无回归。

## Out of scope

分页、取消 Top20、批量阈值、已忽略批量取消、前端循环打单条接口（本期走批量 API）。
