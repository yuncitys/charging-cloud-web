import Quill from 'quill'
// 该包在加载时会执行 window.Quill.register('modules/imageResize', …)
// vue.config ProvidePlugin 已提供 window.Quill，因此这里 import 即完成首次注册
import ImageResize from 'quill-image-resize-module'
import Video from './video.js'

let registered = false

/**
 * 确保 Quill 扩展就绪。imageResize 通常已被包 side-effect 注册；
 * 再 Quill.register 同名模块会打出 Overwriting 告警。
 */
export function ensureQuillModules() {
  if (registered) {
    return
  }
  if (!Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize)
  }
  Quill.register(Video, true)
  registered = true
}
