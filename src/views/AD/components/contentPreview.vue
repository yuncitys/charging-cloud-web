<!--
 * 内容预览弹窗：展示用户侧效果（素材、标题、是否生效、不生效原因）
 -->
<template>
  <el-dialog :visible.sync="visible" title="内容预览" width="420px" append-to-body>
    <div v-loading="loading" class="preview">
      <template v-if="data">
        <div class="preview__status">
          <el-tag :type="effectiveType">{{ effectiveLabel }}</el-tag>
          <span v-if="!data.effective && data.reason" class="preview__reason">{{ data.reason }}</span>
        </div>
        <div class="preview__media">
          <img v-if="data.itemType !== 2 && data.mediaUrl" :src="data.mediaUrl" alt="">
          <video v-else-if="data.mediaUrl" :src="data.mediaUrl" controls />
          <div v-else class="preview__empty">暂无素材</div>
        </div>
        <div class="preview__title">{{ data.itemTitle }}</div>
        <div class="preview__meta">跳转：{{ linkText }}</div>
        <div class="preview__meta">生效时间：{{ rangeText }}</div>
      </template>
      <div v-else-if="!loading" class="preview__empty">暂无预览数据</div>
    </div>
    <div slot="footer">
      <el-button @click="visible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { preview as previewContentItem } from '@/api/AD/contentItem.js'
import { LINK_TYPE_LABEL, effectiveStatusLabel, effectiveStatusType, resolveEffectiveStatus } from '../constants.js'

export default {
  name: 'ContentPreview',
  data() {
    return {
      visible: false,
      loading: false,
      data: null
    }
  },
  computed: {
    effectiveLabel() {
      return this.data ? effectiveStatusLabel(resolveEffectiveStatus(this.data)) : ''
    },
    effectiveType() {
      return this.data ? effectiveStatusType(resolveEffectiveStatus(this.data)) : 'info'
    },
    linkText() {
      if (!this.data) return '—'
      const label = LINK_TYPE_LABEL[this.data.linkType] || this.data.linkType || '—'
      if (this.data.linkType === 'NONE' || !this.data.linkValue) return label
      return `${label}（${this.data.linkValue}）`
    },
    rangeText() {
      if (!this.data) return '—'
      const start = this.data.startTime || '立即'
      const end = this.data.endTime || '长期'
      return `${start} ~ ${end}`
    }
  },
  methods: {
    open(id) {
      this.visible = true
      this.data = null
      this.loading = true
      previewContentItem({ id }).then(res => {
        this.loading = false
        if (res && res.code === 200) {
          this.data = res.data
        } else {
          this.$message.error((res && res.msg) || '预览失败')
        }
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.preview__status {
	margin-bottom: 12px;
}
.preview__reason {
	margin-left: 8px;
	color: #e6a23c;
	font-size: 13px;
}
.preview__media {
	text-align: center;
	background: #f5f7fa;
	border-radius: 6px;
	min-height: 160px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}
.preview__media img,
.preview__media video {
	max-width: 100%;
	max-height: 320px;
	display: block;
}
.preview__empty {
	color: #909399;
	padding: 40px 0;
}
.preview__title {
	margin-top: 12px;
	font-size: 16px;
	font-weight: 600;
}
.preview__meta {
	margin-top: 6px;
	color: #606266;
	font-size: 13px;
	word-break: break-all;
}
</style>
