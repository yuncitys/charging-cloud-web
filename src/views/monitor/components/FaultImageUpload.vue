<template>
  <div class="fault-image-upload" :class="{ 'is-full': full }">
    <el-upload
      action=""
      list-type="picture-card"
      accept=".jpg,.jpeg,.png"
      :file-list="fileList"
      :limit="limit"
      :http-request="doUpload"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <div class="fault-image-upload__hint">最多 {{ limit }} 张，支持 jpg / png，单张不超过 10MB</div>
  </div>
</template>

<script>
import { upload } from '@/api/upload/file'
import { fullFileUrl } from '@/utils/fileUrl'

const MAX_SIZE = 10 * 1024 * 1024

export default {
  name: 'FaultImageUpload',
  props: {
    value: { type: Array, default: () => [] },
    limit: { type: Number, default: 9 }
  },
  data() {
    return {
      pending: 0,
      session: 0,
      lastEmitted: null
    }
  },
  computed: {
    full() {
      return this.value.length + this.pending >= this.limit
    },
    fileList() {
      return this.value.map(item => ({
        name: item.fileName || item.fileUrl,
        url: fullFileUrl(item.fileUrl),
        fileUrl: item.fileUrl
      }))
    }
  },
  watch: {
    value(val) {
      if (val !== this.lastEmitted) this.resetSession()
    }
  },
  beforeDestroy() {
    this.resetSession()
  },
  methods: {
    beforeUpload(file) {
      if (this.full) {
        this.handleExceed()
        return false
      }
      if (!/\.(jpe?g|png)$/i.test(file.name || '')) {
        this.$message.error('仅支持 jpg / png 图片')
        return false
      }
      if (file.size > MAX_SIZE) {
        this.$message.error('单张图片不能超过 10MB')
        return false
      }
      return true
    },
    resetSession() {
      this.session++
      this.setPending(0)
    },
    setPending(count) {
      const wasUploading = this.pending > 0
      this.pending = count
      if (wasUploading !== count > 0) this.$emit('uploading', count > 0)
    },
    emitValue(list) {
      this.lastEmitted = list
      this.$emit('input', list)
    },
    doUpload({ file }) {
      const task = { session: this.session, done: false }
      const live = () => !task.done && task.session === this.session
      const finish = () => {
        if (!live()) return
        task.done = true
        this.setPending(this.pending - 1)
      }
      const form = new FormData()
      form.append('file', file)
      this.setPending(this.pending + 1)
      const request = upload('WebAnnexFile', form).then(res => {
        if (!live()) return
        finish()
        const url = res && Number(res.code) === 200 && res.data && res.data.url
        if (!url) {
          this.$message.error((res && res.msg) || '上传失败')
          return Promise.reject(new Error('upload failed'))
        }
        this.emitValue(this.value.concat([{ fileUrl: url, fileName: file.name }]))
      }, err => {
        if (!live()) return
        finish()
        return Promise.reject(err)
      })
      request.abort = finish
      return request
    },
    handleRemove(file) {
      if (!file.fileUrl) return
      this.emitValue(this.value.filter(item => item.fileUrl !== file.fileUrl))
    },
    handleExceed() {
      this.$message.warning(`最多上传 ${this.limit} 张图片`)
    }
  }
}
</script>

<style scoped>
.fault-image-upload__hint {
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}
.fault-image-upload.is-full >>> .el-upload--picture-card {
  display: none;
}
.fault-image-upload >>> .el-upload--picture-card,
.fault-image-upload >>> .el-upload-list--picture-card .el-upload-list__item {
  width: 80px;
  height: 80px;
  line-height: 88px;
}
</style>
