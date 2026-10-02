<template>
  <div class="fault-image-upload" :class="{ 'is-full': value.length >= limit }">
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

const MAX_SIZE = 10 * 1024 * 1024

export default {
  name: 'FaultImageUpload',
  props: {
    value: { type: Array, default: () => [] },
    limit: { type: Number, default: 9 }
  },
  computed: {
    fileList() {
      return this.value.map(item => ({
        name: item.fileName || item.fileUrl,
        url: this.fullUrl(item.fileUrl),
        fileUrl: item.fileUrl
      }))
    }
  },
  methods: {
    fullUrl(url) {
      if (!url) return ''
      if (/^https?:/i.test(url)) return url
      return ((this.Global && this.Global.APIURl) || '') + url
    },
    beforeUpload(file) {
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
    doUpload({ file }) {
      const form = new FormData()
      form.append('file', file)
      return upload('WebAnnexFile', form).then(res => {
        const url = res && Number(res.code) === 200 && res.data && res.data.url
        if (!url) {
          this.$message.error((res && res.msg) || '上传失败')
          return Promise.reject(new Error('upload failed'))
        }
        this.$emit('input', this.value.concat([{ fileUrl: url, fileName: file.name }]))
      })
    },
    handleRemove(file) {
      this.$emit('input', this.value.filter(item => item.fileUrl !== file.fileUrl))
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
