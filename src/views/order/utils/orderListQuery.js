export function createDefaultListQuery(orderType, ruleId) {
  return {
    page: 1,
    limit: 10,
    orderCode: '',
    orderCodeType: 1,
    deviceCode: '',
    phoneNumber: '',
    userCode: '',
    plateNumber: '',
    cardNo: '',
    companyName: '',
    vinCode: '',
    timeQueryType: 1,
    createTimeStart: '',
    createTimeEnd: '',
    networkProvince: '',
    networkName: '',
    orderType,
    ruleId,
    chargingStationIds: ''
  }
}

export function sanitizeOrderListQuery(query) {
  const q = { ...query }
  ;['electricOut', 'payStatus', 'orderStatus'].forEach((key) => {
    const value = q[key]
    if (value === '' || value === null || value === undefined) {
      delete q[key]
    }
  })
  if (q.createTimeStart == null) q.createTimeStart = ''
  if (q.createTimeEnd == null) q.createTimeEnd = ''
  if (!q.orderCodeType) q.orderCodeType = 1
  if (!q.timeQueryType) q.timeQueryType = 1
  return q
}
