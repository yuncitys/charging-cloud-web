# 工作台各块统计元信息统一（周期 / 区间 / 同步）

**Date:** 2026-10-28  
**Status:** Approved（对话确认方案 A）  
**Branches:** `feature/operator-workbench-web`（主）；cloud 仅在需精简 `subHint`/`periodHint` 时小改  

## Goal

各版块标题旁统一一行三要素，用户能直观分辨：

`统计周期 xxx ｜ 统计区间 xxx ｜ 同步 xxx`

## Non-Goals

- 不改各块指标口径与同步任务节奏  
- 分析抽屉可二期对齐（本期主块）  
- 不强制后端新 VO 字段（优先前端拼装已有 period / dataAsOf）

## UI

- 样式：一行、浅色次要文案；`｜` 分隔；标签固定「统计周期 / 统计区间 / 同步」
- `dataAsOf`：作「同步」上的 tooltip（最近刷新），不单独再写「数据时点：」
- 口径长文：仍用 `?` tooltip / 财务短 alert（去掉与三要素重复的句子）

## 各块取值

| 版块 | 统计周期 | 统计区间 | 同步 |
|------|----------|----------|------|
| 经营概览 | 顶栏 periodType | periodStart~End | 约每15分钟同步 |
| 终端状态 | — | — | 实时 |
| 充电用户 | 顶栏 | periodStart~End | 约每15分钟同步 |
| 预警 | 顶栏 | 判定日 alertDate（或文案「已收口营业日」） | 读工作台日表（约每15分钟） |
| 财务 | 顶栏 | 应收/结算对应区间（已有字段） | 日账单T+1出账；结算看快照 |
| 营销 | 顶栏 | periodStart~End | 约每15分钟同步 |
| 电站电量 Top10 | 顶栏 | periodStart~End | 电量约每15分钟；终端数/功率实时 |

单日区间只显示一个日期；无区间显示 `—`。

## 实现要点（前端）

- 新增 `blockMeta.js`：`formatPeriodLabel(periodType)`、`formatRange(start,end)`、`SYNC_*` 常量、可选 `buildMeta({...})`
- `index.vue` 各 `wb-block__head` 换成统一 meta 行；去掉散落的「数据时点 / periodHint / 杂糅 subHint」
- 充电用户：标题仍可用 `titleHint`；meta 用 period 字段 + 固定同步，不再整段展示服务端 `subHint`（避免与「同步」重复）
- 单测：断言三标签文案与各 SYNC 常量

## Acceptance

1. 七个主块标题旁均为「统计周期｜统计区间｜同步」同序同标签  
2. 切顶栏周期时，跟周期的块「周期/区间」随之变；终端仍为 — / 实时  
3. 不再出现互斥的「数据时点：」与杂乱 periodHint 并列  
