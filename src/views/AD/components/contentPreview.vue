<!--
 * 内容预览弹窗：左侧以手机框模拟用户端首页效果，右侧列出后台配置与生效信息。
 * 覆盖场景：图片/视频/无素材；活动/电站/商品/页面/H5/不跳转；生效中/未生效/已过期/活动已停用。
 -->
<template>
  <el-drawer
    :visible.sync="visible"
    title="内容预览"
    direction="rtl"
    size="720px"
    append-to-body
  >
    <div v-loading="loading" class="preview">
      <template v-if="data">
        <div class="preview__stage">
          <div class="phone">
            <div class="phone__status">
              <span>9:41</span>
              <span class="phone__icons"><i /><i /><i /></span>
            </div>
            <div class="phone__nav">首页</div>
            <div class="phone__body">
              <div class="banner" :class="{ 'is-off': !isEffective }">
                <div class="banner__inner">
                  <img v-if="mediaKind === 'image'" :src="data.mediaUrl" alt="">
                  <video v-else-if="mediaKind === 'video'" :src="data.mediaUrl" muted playsinline preload="metadata" />
                  <div v-else class="banner__placeholder">未配置素材</div>
                </div>
                <div v-if="!isEffective" class="banner__mask">{{ maskText }}</div>
              </div>
              <div class="card">
                <div class="card__title">{{ data.itemTitle || '（未填写标题）' }}</div>
                <div v-if="hasJump" class="card__jump">
                  <span>前往{{ jumpText }}</span>
                  <i class="el-icon-arrow-right" />
                </div>
                <div v-else class="card__jump card__jump--none">仅展示，不跳转</div>
              </div>
              <div class="skeleton">
                <span class="skeleton__bar skeleton__bar--long" />
                <span class="skeleton__bar" />
                <span class="skeleton__bar skeleton__bar--short" />
              </div>
            </div>
          </div>
          <div class="preview__caption">用户端效果（模拟，以线上为准）</div>
        </div>

        <div class="preview__info">
          <div class="info-row">
            <span class="info-row__label">生效状态</span>
            <el-tag size="small" :type="effectiveType">{{ effectiveLabel }}</el-tag>
          </div>
          <div v-if="!isEffective" class="info-row">
            <span class="info-row__label">不生效原因</span>
            <span class="info-row__value info-row__value--warn">{{ data.reason || effectiveLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">展示位</span>
            <span class="info-row__value">{{ placementText || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">素材类型</span>
            <span class="info-row__value">{{ mediaTypeText }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">跳转</span>
            <span class="info-row__value">{{ jumpSummary }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">生效时间</span>
            <span class="info-row__value">{{ rangeText }}</span>
          </div>
          <div v-if="mediaKind === 'none'" class="preview__tip preview__tip--warn">
            当前未配置素材，线上展示位将为空白，请先补充素材。
          </div>
          <div v-else-if="!isEffective" class="preview__tip">
            该内容当前不会在用户端展示，满足生效条件后将自动展示。
          </div>
        </div>
      </template>
      <div v-else-if="!loading" class="preview__empty">暂无预览数据</div>
    </div>
  </el-drawer>
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
      data: null,
      placementText: ''
    }
  },
  computed: {
    status() {
      return this.data ? resolveEffectiveStatus(this.data) : ''
    },
    isEffective() {
      return this.status === 'EFFECTIVE'
    },
    effectiveLabel() {
      return this.data ? effectiveStatusLabel(this.status) : ''
    },
    effectiveType() {
      return this.data ? effectiveStatusType(this.status) : 'info'
    },
    maskText() {
      return (this.data && this.data.reason) || this.effectiveLabel
    },
    mediaKind() {
      if (!this.data || !this.data.mediaUrl) return 'none'
      return this.data.itemType === 2 ? 'video' : 'image'
    },
    mediaTypeText() {
      return { image: '图片', video: '视频', none: '未配置' }[this.mediaKind]
    },
    hasJump() {
      if (!this.data || this.data.linkType === 'NONE') return false
      return !!(this.data.linkValue || this.data.activityName)
    },
    linkLabel() {
      if (!this.data) return '—'
      return LINK_TYPE_LABEL[this.data.linkType] || this.data.linkType || '—'
    },
    jumpText() {
      if (!this.hasJump) return ''
      if (this.data.linkType === 'ACTIVITY') {
        return `营销活动「${this.data.activityName || this.data.linkValue}」`
      }
      return `${this.linkLabel}${this.data.linkValue ? `（${this.data.linkValue}）` : ''}`
    },
    jumpSummary() {
      return this.hasJump ? this.jumpText : '不跳转'
    },
    rangeText() {
      if (!this.data) return '—'
      const start = this.data.startTime || '立即'
      const end = this.data.endTime || '长期'
      return `${start} ~ ${end}`
    }
  },
  methods: {
    open(id, meta = {}) {
      this.visible = true
      this.data = null
      this.placementText = meta.placementText || ''
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
.preview {
	display: flex;
	gap: 28px;
	min-height: 580px;
	padding: 0 24px 24px;
}
.preview__stage {
	flex: 0 0 320px;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.preview__caption {
	margin-top: 12px;
	color: #909399;
	font-size: 12px;
}
.preview__info {
	flex: 1;
	min-width: 0;
	padding-left: 24px;
	border-left: 1px solid #ebeef5;
}
.preview__tip {
	margin-top: 16px;
	padding: 8px 12px;
	border-radius: 4px;
	background: #f4f4f5;
	color: #606266;
	font-size: 13px;
	line-height: 1.6;
}
.preview__tip--warn {
	background: #fdf6ec;
	color: #e6a23c;
}
.preview__empty {
	color: #909399;
	padding: 60px 0;
	text-align: center;
	width: 100%;
}

/* 手机框 */
.phone {
	width: 300px;
	height: 580px;
	border-radius: 30px;
	border: 8px solid #1d1e1f;
	background: #f5f6f7;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}
.phone__status {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 16px 4px;
	background: #fff;
	font-size: 12px;
	color: #1d1e1f;
}
.phone__icons i {
	display: inline-block;
	width: 10px;
	height: 6px;
	margin-left: 3px;
	border-radius: 1px;
	background: #1d1e1f;
}
.phone__nav {
	height: 40px;
	line-height: 40px;
	text-align: center;
	font-size: 15px;
	font-weight: 600;
	color: #1d1e1f;
	background: #fff;
	border-bottom: 1px solid #f0f0f0;
}
.phone__body {
	flex: 1;
	padding: 10px;
	overflow: hidden;
}

/* 轮播图：按 2.3:1 固定比例，与常见首页 banner 接近 */
.banner {
	position: relative;
	width: 100%;
	padding-top: 43%;
	border-radius: 8px;
	overflow: hidden;
	background: #e4e7ed;
}
.banner__inner {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
}
.banner__inner img,
.banner__inner video {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}
.banner__placeholder {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #909399;
	font-size: 13px;
	background: repeating-linear-gradient(45deg, #f2f3f5, #f2f3f5 8px, #e9ebef 8px, #e9ebef 16px);
}
.banner.is-off .banner__inner {
	filter: grayscale(1);
	opacity: 0.6;
}
.banner__mask {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 12px;
	color: #fff;
	font-size: 13px;
	text-align: center;
	background: rgba(0, 0, 0, 0.5);
}

/* 标题与跳转信息卡片 */
.card {
	margin-top: 10px;
	padding: 10px 12px;
	border-radius: 8px;
	background: #fff;
}
.card__title {
	font-size: 14px;
	font-weight: 600;
	color: #1d1e1f;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.card__jump {
	margin-top: 6px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 12px;
	color: #409eff;
}
.card__jump--none {
	color: #909399;
}

/* 骨架屏：模拟下方其它内容，让预览更接近真实页面 */
.skeleton {
	margin-top: 12px;
}
.skeleton__bar {
	display: block;
	height: 10px;
	margin-bottom: 8px;
	border-radius: 5px;
	background: #e9ebef;
	width: 100%;
}
.skeleton__bar--long {
	width: 80%;
}
.skeleton__bar--short {
	width: 55%;
}

/* 右侧后台信息 */
.info-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 14px;
	font-size: 14px;
	line-height: 22px;
}
.info-row__label {
	flex: 0 0 84px;
	color: #909399;
}
.info-row__value {
	flex: 1;
	min-width: 0;
	color: #303133;
	word-break: break-all;
}
.info-row__value--warn {
	color: #e6a23c;
}
</style>
