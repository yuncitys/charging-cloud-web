export const SERVICE_PROVIDER_MAP = {
  tzbank: '台州银行',
  wxpay: '微信(直连)',
  wxpay_partner: '微信(服务商)',
  alipay: '支付宝',
  local: '默认'
}

export function formatServiceProvider (code) {
  return SERVICE_PROVIDER_MAP[code] || code || '-'
}

export function isLocalChannel (code) {
  return code === 'local'
}
