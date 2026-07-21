/**
 * 营销中心接口级功能权限标识（与后端 MarketingController / 菜单 SQL 对齐）
 * 活动类型细粒度（register/recharge/...）见 constants/activityTypes.js
 */
export const MARKETING_PERMS = {
  // 卡券
  cardCouponPage: ':marketing:cardCoupon:page',
  cardCouponDetail: ':marketing:cardCoupon:detail',
  cardCouponCreate: ':marketing:cardCoupon:create',
  cardCouponUpdate: ':marketing:cardCoupon:update',
  cardCouponCancel: ':marketing:cardCoupon:cancel',
  cardCouponIncreaseStock: ':marketing:cardCoupon:increaseStock',
  cardCouponRewardOptions: ':marketing:cardCoupon:rewardOptions',

  // 电站分组
  stationGroupPage: ':marketing:stationGroup:page',
  stationGroupOptions: ':marketing:stationGroup:options',
  stationGroupDetail: ':marketing:stationGroup:detail',
  stationGroupCreate: ':marketing:stationGroup:create',
  stationGroupUpdate: ':marketing:stationGroup:update',
  stationGroupDelete: ':marketing:stationGroup:delete',
  stationGroupLabelStatus: ':marketing:stationGroup:labelStatus',

  // 用户分组
  userGroupPage: ':marketing:userGroup:page',
  userGroupOptions: ':marketing:userGroup:options',
  userGroupDetail: ':marketing:userGroup:detail',
  userGroupCreate: ':marketing:userGroup:create',
  userGroupUpdate: ':marketing:userGroup:update',
  userGroupDelete: ':marketing:userGroup:delete',
  userGroupMoveIn: ':marketing:userGroup:moveIn',
  userGroupMoveOut: ':marketing:userGroup:moveOut',
  userGroupLabelStatus: ':marketing:userGroup:labelStatus',

  // 营销活动接口
  activityPage: ':marketing:activity:page',
  activityDetail: ':marketing:activity:detail',
  activityCreate: ':marketing:activity:create',
  activityUpdate: ':marketing:activity:update',
  activityStop: ':marketing:activity:stop',
  activityDirectionalSend: ':marketing:activity:directionalSend',
  activityScanQrcode: ':marketing:activity:scanQrcode',
  activityGenerateExchangeCodes: ':marketing:activity:generateExchangeCodes',
  activityListExchangeCodes: ':marketing:activity:listExchangeCodes',
  activityExportExchangeCodes: ':marketing:activity:exportExchangeCodes',

  // 记录 / 用户券
  receiveRecordPage: ':marketing:receiveRecord:page',
  useRecordPage: ':marketing:useRecord:page',
  userCouponPage: ':marketing:userCoupon:page',
  userCouponCancel: ':marketing:userCoupon:cancel',

  // 补款
  subsidyLedgerPage: ':marketing:subsidy:ledgerPage',
  subsidyBatchPage: ':marketing:subsidy:batchPage',
  subsidyConfirmOffline: ':marketing:subsidy:confirmOffline'
}
