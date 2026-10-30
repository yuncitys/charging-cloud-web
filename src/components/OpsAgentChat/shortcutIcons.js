/** Ops Agent chat shortcut line icons (viewBox 0 0 24 24). */

const STROKE = {
  blue: '#5B7C99',
  amber: '#B8893D',
  green: '#4A8F6F',
  red: '#C45B5B',
  default: '#64748B'
}

/** Simple path sets (stroke icons; fill=none on svg). */
const ICONS = {
  lookup: [
    'M10.5 3.75a6.75 6.75 0 015.35 10.87l3.76 3.76a.75.75 0 11-1.06 1.06l-3.76-3.76A6.75 6.75 0 1110.5 3.75zm0 1.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z'
  ],
  refund: [
    'M12 3v3m0 12v3M3 12h3m12 0h3',
    'M7.5 8.25A5.25 5.25 0 0112 6.75c2.9 0 5.25 1.9 5.25 4.5S14.9 15.75 12 15.75c-1.2 0-2.28-.32-3.15-.86L7.5 16.5'
  ],
  offline: [
    'M8.25 18.75h7.5M9.75 18.75V15.5c0-1.24.76-2.25 1.88-2.72.37-.16.87-.28 1.37-.28s1 .12 1.37.28c1.12.47 1.88 1.48 1.88 2.72v3.25',
    'M12 5.25a3.75 3.75 0 013.75 3.75v1.5H8.25v-1.5A3.75 3.75 0 0112 5.25z',
    'M4.5 4.5l15 15'
  ],
  stop: [
    'M6.75 6.75h10.5v10.5H6.75z',
    'M9 12h6'
  ],
  generic: [
    'M8.25 6.75h7.5M8.25 12h7.5M8.25 17.25h4.5'
  ]
}

const TONE_TO_KEY = {
  blue: 'lookup',
  amber: 'refund',
  green: 'offline',
  red: 'stop'
}

const LABEL_HINT = {
  查单: 'lookup',
  退款: 'refund',
  枪离线: 'offline',
  远程停充: 'stop',
  停充: 'stop'
}

function iconKeyFromLabel(label) {
  for (const hint of Object.keys(LABEL_HINT)) {
    if (label.indexOf(hint) !== -1) {
      return LABEL_HINT[hint]
    }
  }
  return null
}

export function resolveShortcutIcon(item) {
  const tone = (item && item.tone) || 'blue'
  let key = (item && item.iconKey) || ''
  if (!ICONS[key]) {
    const label = (item && item.label) || ''
    key = iconKeyFromLabel(label) || TONE_TO_KEY[tone] || 'generic'
  }
  if (!ICONS[key]) {
    key = 'generic'
  }
  return {
    key,
    paths: ICONS[key],
    stroke: STROKE[tone] || STROKE.default
  }
}

export const SHORTCUT_ICON_KEYS = Object.keys(ICONS)
