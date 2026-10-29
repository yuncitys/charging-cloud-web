function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDay(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatMonth(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function buildOverviewRange(preset, currentDate = new Date()) {
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
  if (preset === '12m') {
    const start = new Date(end.getFullYear(), end.getMonth() - 11, 1)
    return {
      timeType: 2,
      startDate: formatMonth(start),
      endDate: formatMonth(end)
    }
  }

  const days = preset === '30d' ? 30 : 7
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - days + 1)
  return {
    timeType: 3,
    startDate: formatDay(start),
    endDate: formatDay(end)
  }
}
