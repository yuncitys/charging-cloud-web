/** 菜单类型：0=目录 1=页面 2=按钮 */
export const MENU_TYPE = {
  DIRECTORY: 0,
  MENU: 1,
  BUTTON: 2
}

export const MENU_TYPE_LABEL = {
  [MENU_TYPE.DIRECTORY]: '目录',
  [MENU_TYPE.MENU]: '页面',
  [MENU_TYPE.BUTTON]: '按钮'
}

export const MENU_TYPE_TAG = {
  [MENU_TYPE.DIRECTORY]: 'info',
  [MENU_TYPE.MENU]: 'success',
  [MENU_TYPE.BUTTON]: 'warning'
}

export const MENU_TYPE_OPTIONS = [
  { value: MENU_TYPE.DIRECTORY, label: MENU_TYPE_LABEL[MENU_TYPE.DIRECTORY] },
  { value: MENU_TYPE.MENU, label: MENU_TYPE_LABEL[MENU_TYPE.MENU] },
  { value: MENU_TYPE.BUTTON, label: MENU_TYPE_LABEL[MENU_TYPE.BUTTON] }
]

export function menuTypeLabel(type) {
  const code = type == null ? MENU_TYPE.MENU : Number(type)
  return MENU_TYPE_LABEL[code] || MENU_TYPE_LABEL[MENU_TYPE.MENU]
}

export function menuTypeTag(type) {
  const code = type == null ? MENU_TYPE.MENU : Number(type)
  return MENU_TYPE_TAG[code] || 'info'
}

/** 父节点下允许新增的子类型 */
export function childMenuTypeOptions(parentMenuType) {
  const code = parentMenuType == null ? MENU_TYPE.DIRECTORY : Number(parentMenuType)
  if (code === MENU_TYPE.BUTTON) {
    return []
  }
  if (code === MENU_TYPE.MENU) {
    return MENU_TYPE_OPTIONS.filter(item => item.value === MENU_TYPE.BUTTON)
  }
  // 目录 / 顶级：可加目录、页面、按钮
  return MENU_TYPE_OPTIONS.slice()
}

export function defaultChildMenuType(parentMenuType) {
  const options = childMenuTypeOptions(parentMenuType)
  return options.length ? options[0].value : MENU_TYPE.MENU
}

export function addChildButtonLabel(parentMenuType) {
  const code = parentMenuType == null ? MENU_TYPE.DIRECTORY : Number(parentMenuType)
  if (code === MENU_TYPE.MENU) {
    return '添加按钮'
  }
  if (code === MENU_TYPE.DIRECTORY) {
    return '添加子项'
  }
  return '添加子菜单'
}
