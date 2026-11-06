<!--
 * 从营销活动生成推广内容（活动详情页复用）
 * 用法：ref 调用 open(activity)，activity 需含 activityId、activityName
 -->
<template>
  <el-dialog :visible.sync="visible" title="生成推广内容" width="520px" append-to-body :close-on-click-modal="false">
    <el-form ref="form" v-loading="submitting" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="活动">
        <span>{{ activityName }}</span>
      </el-form-item>
      <el-form-item label="展示位" prop="placementCode">
        <el-select v-model="form.placementCode" placeholder="请选择展示位" style="width: 100%;">
          <el-option
            v-for="item in placementOptions"
            :key="item.placementCode"
            :label="item.placementName ? `${item.placementName}（${item.placementCode}）` : item.placementCode"
            :value="item.placementCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="素材">
        <uploadFile ref="upload" v-model="form.mediaUrl" />
        <div class="form-tip">可选，不上传则使用活动默认素材</div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">确定生成</el-button>
    </div>
  </el-dialog>
</template>

<script>
import uploadFile from '@/components/Common/uploadFile.vue'
import { fromActivity } from '@/api/AD/contentItem.js'
import { list as listPlacement } from '@/api/AD/contentPlacement.js'
import { DEFAULT_PLACEMENT_CODE } from '../constants.js'

export default {
  name: 'ActivityPromoteDialog',
  components: { uploadFile },
  data() {
    return {
      visible: false,
      submitting: false,
      activityId: '',
      activityName: '',
      form: { placementCode: DEFAULT_PLACEMENT_CODE, mediaUrl: '' },
      placementOptions: [],
      rules: {
        placementCode: [{ required: true, message: '请选择展示位', trigger: 'change' }]
      }
    }
  },
  methods: {
    open(activity) {
      this.activityId = activity.activityId
      this.activityName = activity.activityName || activity.activityId
      this.form = { placementCode: DEFAULT_PLACEMENT_CODE, mediaUrl: '' }
      this.visible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
        if (this.$refs.upload) this.$refs.upload.getType(1)
      })
      this.loadPlacements()
    },
    loadPlacements() {
      listPlacement().then(res => {
        if (res && res.code === 200) this.placementOptions = res.data || []
      })
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return false
        this.submitting = true
        const payload = {
          activityId: this.activityId,
          placementCode: this.form.placementCode
        }
        if (this.form.mediaUrl) payload.mediaUrl = this.form.mediaUrl
        fromActivity(payload).then(res => {
          this.submitting = false
          if (res && res.code === 200) {
            this.$message.success(res.msg || '已生成推广内容')
            this.visible = false
            this.$emit('generated', res.data)
          } else {
            // 同一活动重复生成时，后端会返回提示，直接展示其文案
            this.$message.warning((res && res.msg) || '生成失败')
          }
        }).catch(() => {
          this.submitting = false
        })
      })
    }
  }
}
</script>

<style scoped>
.form-tip {
	color: #909399;
	font-size: 12px;
	line-height: 1.5;
}
</style>
