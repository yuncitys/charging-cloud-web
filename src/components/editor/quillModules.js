import Quill from 'quill'
import ImageResize from 'quill-image-resize-module'
import Video from './video.js'

let registered = false

/**
 * Register Quill add-ons once. edit.vue / edit1.vue both need imageResize;
 * registering twice logs "Overwriting modules/imageResize".
 */
export function ensureQuillModules() {
  if (registered) {
    return
  }
  Quill.register('modules/imageResize', ImageResize)
  Quill.register(Video, true)
  registered = true
}
