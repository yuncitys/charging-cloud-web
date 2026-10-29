import request from '@/utils/request'

// 表单提交（x-www-form-urlencoded），空值不提交
function postForm(url, data) {
  return request({
    url,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          if (data[it] === undefined || data[it] === null || data[it] === '') continue
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret.substring(0, ret.lastIndexOf('&'))
      }
    ],
    data
  })
}

// 时期统计（按日）分页 / 合计
export function orgPeriodStatisticsList(data) {
  return postForm('/api/web/home/orgPeriodStatistics/list', data)
}
export function orgPeriodStatisticsSummary(data) {
  return postForm('/api/web/home/orgPeriodStatistics/summary', data)
}

// 机构统计（区间按机构汇总）分页 / 合计
export function orgStatisticsList(data) {
  return postForm('/api/web/home/orgStatistics/list', data)
}
export function orgStatisticsSummary(data) {
  return postForm('/api/web/home/orgStatistics/summary', data)
}

// 机构比对透视：返回 { dates, rows: [{orgId, orgName, values}], totals }
export function orgCompareStatistics(data) {
  return postForm('/api/web/home/orgCompareStatistics', data)
}

// 用户统计（区间按机构×用户汇总）分页 / 合计
export function orgUserStatisticsList(data) {
  return postForm('/api/web/home/orgUserStatistics/list', data)
}
export function orgUserStatisticsSummary(data) {
  return postForm('/api/web/home/orgUserStatistics/summary', data)
}

export function exportOrgPeriodStatistics(data) {
  return postForm('/api/web/home/orgPeriodStatistics/export', data)
}
export function exportOrgStatistics(data) {
  return postForm('/api/web/home/orgStatistics/export', data)
}
export function exportOrgCompareStatistics(data) {
  return postForm('/api/web/home/orgCompareStatistics/export', data)
}
export function exportOrgUserStatistics(data) {
  return postForm('/api/web/home/orgUserStatistics/export', data)
}
