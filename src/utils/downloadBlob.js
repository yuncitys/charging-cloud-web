/**
 * 下载接口返回的 blob；若后端返回的是 JSON 错误体，则弹出错误提示。
 * @param {Blob} blob 接口响应
 * @param {string} fileName 文件名（不含扩展名）
 * @param {Function} onError 失败回调（接收提示文案）
 */
export function downloadBlob(blob, fileName, onError) {
  const fail = msg => { if (onError) onError(msg) }
  if (!blob) {
    fail('导出失败')
    return
  }
  const isJsonBlob = blob.type && (blob.type.includes('json') || blob.type.includes('text/plain'))
  const needCheck = isJsonBlob || blob.size < 1024
  if (needCheck) {
    blob.text().then(text => {
      if (text.trim().startsWith('{')) {
        try {
          const json = JSON.parse(text)
          fail(json.msg || '导出失败')
        } catch (e) {
          fail('导出失败')
        }
        return
      }
      save(blob, fileName)
    }).catch(() => fail('导出失败'))
    return
  }
  save(blob, fileName)
}

function save(blob, fileName) {
  const fileBlob = blob.type
    ? blob
    : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(fileBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
