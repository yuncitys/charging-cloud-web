<!--
 * 运营内容表单：新增与编辑共用（替代原 addPage / editPage）
 * 用法：ref 调用 open() 新增，open(row) 编辑
 -->
<template>
  <el-drawer
    :visible.sync="visible"
    :title="isEdit ? '编辑内容' : '新增内容'"
    direction="rtl"
    size="680px"
    :close-on-press-escape="false"
    :wrapper-closable="false"
    custom-class="content-form-drawer"
    append-to-body
    @closed="onClosed"
  >
    <div class="content-form-drawer__body">
    <el-form
      ref="form"
      v-loading="submitting"
      :model="form"
      :rules="rules"
      label-width="110px"
      label-position="left"
    >
      <el-form-item label="标题" prop="itemTitle">
        <el-input v-model="form.itemTitle" placeholder="请输入标题" maxlength="60" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="素材类型" prop="itemType">
        <el-radio-group v-model="form.itemType" @change="onItemTypeChange">
          <el-radio :label="1">图片</el-radio>
          <el-radio :label="2">视频</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="素材" prop="mediaUrl">
        <uploadFile ref="upload" v-model="form.mediaUrl" />
      </el-form-item>

      <el-form-item label="展示位" prop="placementCodes">
        <el-select v-model="form.placementCodes" multiple filterable placeholder="请选择展示位" style="width: 100%;">
          <el-option
            v-for="item in placementOptions"
            :key="item.placementCode"
            :label="item.placementName ? `${item.placementName}（${item.placementCode}）` : item.placementCode"
            :value="item.placementCode"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="跳转类型" prop="linkType">
        <el-select v-model="form.linkType" placeholder="请选择跳转类型" style="width: 100%;" @change="onLinkTypeChange">
          <el-option v-for="item in linkTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <template v-if="form.linkType === 'ACTIVITY'">
        <el-form-item label="活动类型">
          <el-select
            v-model="activityType"
            clearable
            placeholder="全部类型（可选）"
            style="width: 100%;"
            @change="onActivityTypeChange"
          >
            <el-option v-for="item in ACTIVITY_BIND_TYPES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="营销活动" prop="activityId">
          <el-select
            v-model="form.activityId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="输入活动名称搜索"
            :remote-method="searchActivity"
            :loading="activityLoading"
            style="width: 100%;"
            @visible-change="onActivitySelectOpen"
            @change="onActivityChange"
          >
            <el-option
              v-for="item in activityList"
              :key="item.activityId"
              :label="activityLabel(item)"
              :value="item.activityId"
            />
          </el-select>
          <div class="form-tip">可搜索充值领取、充电领取、电站折扣、用户折扣四类活动</div>
        </el-form-item>
      </template>

      <el-form-item
        v-else-if="['STATION', 'GOODS'].includes(form.linkType)"
        :label="form.linkType === 'STATION' ? '电站 ID' : '商品 ID'"
        prop="linkValue"
      >
        <el-input
          v-model="form.linkValue"
          :placeholder="form.linkType === 'STATION' ? '请输入电站 ID' : '请输入商品 ID'"
          clearable
        />
      </el-form-item>

      <el-form-item v-else-if="form.linkType === 'PAGE'" label="页面路径" prop="linkValue">
        <el-input v-model="form.linkValue" placeholder="如 /pages/xxx/xxx" clearable />
      </el-form-item>

      <el-form-item v-else-if="form.linkType === 'H5'" label="外链地址" prop="linkValue">
        <el-input v-model="form.linkValue" placeholder="须以 http:// 或 https:// 开头" clearable />
      </el-form-item>

      <el-form-item label="生效时间">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间（可空）"
          end-placeholder="结束时间（可空）"
          style="width: 100%;"
          clearable
          @change="onTimeChange"
        />
        <div class="form-tip">不填表示立即生效、长期有效</div>
      </el-form-item>

      <el-form-item label="排序" prop="sorting">
        <el-input-number v-model="form.sorting" :min="0" :max="99999" controls-position="right" />
        <span class="form-tip">数值越小越靠前</span>
      </el-form-item>

      <el-form-item label="上线" prop="itemStatus">
        <el-switch v-model="form.itemStatus" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    </div>

    <div class="content-form-drawer__footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">确定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import uploadFile from '@/components/Common/uploadFile.vue'
import { save as saveContentItem, activityOptions } from '@/api/AD/contentItem.js'
import { list as listPlacement } from '@/api/AD/contentPlacement.js'
import { LINK_TYPES, ACTIVITY_BIND_TYPES, DEFAULT_PLACEMENT_CODE } from '../constants.js'

const HTTP_URL_REG = /^https?:\/\/.+/i

function emptyForm() {
  return {
    id: undefined,
    itemTitle: '',
    itemType: 1,
    mediaUrl: '',
    placementCodes: [],
    linkType: 'NONE',
    linkValue: '',
    activityId: '',
    startTime: '',
    endTime: '',
    sorting: 0,
    itemStatus: 1
  }
}

export default {
  name: 'ContentForm',
  components: { uploadFile },
  data() {
    const validateLinkValue = (rule, value, callback) => {
      if (this.form.linkType === 'H5') {
        if (!value || !HTTP_URL_REG.test(value)) {
          callback(new Error('H5 外链必须以 http:// 或 https:// 开头'))
          return
        }
      } else if (['STATION', 'GOODS', 'PAGE'].includes(this.form.linkType) && !value) {
        callback(new Error('请填写跳转目标'))
        return
      }
      callback()
    }
    const validateActivity = (rule, value, callback) => {
      if (this.form.linkType === 'ACTIVITY' && !value) {
        callback(new Error('请选择营销活动'))
        return
      }
      callback()
    }
    return {
      ACTIVITY_BIND_TYPES,
      visible: false,
      isEdit: false,
      submitting: false,
      form: emptyForm(),
      timeRange: [],
      activityType: '',
      placementOptions: [],
      activityList: [],
      activityLoading: false,
      linkTypes: LINK_TYPES,
      rules: {
        itemTitle: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        mediaUrl: [{ required: true, message: '请上传素材', trigger: 'change' }],
        placementCodes: [{ type: 'array', required: true, message: '请至少选择一个展示位', trigger: 'change' }],
        linkType: [{ required: true, message: '请选择跳转类型', trigger: 'change' }],
        linkValue: [{ validator: validateLinkValue, trigger: 'blur' }],
        activityId: [{ validator: validateActivity, trigger: 'change' }],
        sorting: [{ required: true, message: '请输入排序', trigger: 'blur' }]
      }
    }
  },
  methods: {
    /** 打开表单：无参为新增，传入行数据为编辑 */
    open(row) {
      this.visible = true
      this.isEdit = !!row
      this.form = row ? this.fromRow(row) : { ...emptyForm(), placementCodes: [DEFAULT_PLACEMENT_CODE] }
      this.timeRange = this.form.startTime && this.form.endTime ? [this.form.startTime, this.form.endTime] : []
      this.activityType = ''
      this.activityList = []
      if (this.form.linkType === 'ACTIVITY' && this.form.activityId) {
        // 编辑回显：先放入已绑定的活动，避免远程下拉显示为空
        this.activityList = [{ activityId: this.form.activityId, activityName: row.activityName || this.form.activityId }]
      }
      this.loadPlacements()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
        if (this.$refs.upload) this.$refs.upload.getType(this.form.itemType)
      })
    },
    fromRow(row) {
      return {
        id: row.id,
        itemTitle: row.itemTitle || '',
        itemType: row.itemType || 1,
        mediaUrl: row.mediaUrl || '',
        placementCodes: row.placementCodes || (row.placementCode ? [row.placementCode] : []),
        linkType: row.linkType || 'NONE',
        linkValue: row.linkValue || '',
        activityId: row.linkType === 'ACTIVITY' ? (row.activityId || row.linkValue || '') : '',
        startTime: row.startTime || '',
        endTime: row.endTime || '',
        sorting: row.sorting == null ? 0 : row.sorting,
        itemStatus: row.itemStatus == null ? 1 : row.itemStatus
      }
    },
    loadPlacements() {
      listPlacement().then(res => {
        if (res && res.code === 200) {
          this.placementOptions = res.data || []
        } else {
          this.$message.error((res && res.msg) || '展示位加载失败')
        }
      })
    },
    onItemTypeChange(type) {
      // 切换素材类型时清空素材，避免图片/视频混用
      this.form.mediaUrl = ''
      if (this.$refs.upload) this.$refs.upload.getType(type)
    },
    onLinkTypeChange() {
      // 切换跳转类型时清空旧目标，防止残留脏数据
      this.form.linkValue = ''
      this.form.activityId = ''
      this.activityList = []
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate(['linkValue', 'activityId']))
    },
    onActivityTypeChange() {
      this.form.activityId = ''
      this.activityList = []
      this.searchActivity('')
    },
    onActivitySelectOpen(open) {
      // 首次展开时加载一批候选活动
      if (open && !this.activityList.length) this.searchActivity('')
    },
    searchActivity(keyword) {
      this.activityLoading = true
      const params = { keyword: keyword || '' }
      if (this.activityType) params.type = this.activityType
      activityOptions(params).then(res => {
        this.activityLoading = false
        if (res && res.code === 200) {
          // 保留已选中的活动，避免搜索后回显丢失
          const list = res.data || []
          const current = this.form.activityId && this.activityList.find(i => i.activityId === this.form.activityId)
          this.activityList = current && !list.find(i => i.activityId === current.activityId) ? [current, ...list] : list
        } else {
          this.$message.error((res && res.msg) || '活动搜索失败')
        }
      }).catch(() => {
        this.activityLoading = false
      })
    },
    activityLabel(item) {
      const typeLabel = (ACTIVITY_BIND_TYPES.find(t => t.value === String(item.activityType)) || {}).label
      const name = item.activityName || item.activityId
      return typeLabel ? `[${typeLabel}] ${name}` : name
    },
    onActivityChange() {
      // activityId 为唯一来源，提交时由 buildPayload 同步到 linkValue
    },
    onTimeChange(val) {
      this.form.startTime = val && val[0] ? val[0] : ''
      this.form.endTime = val && val[1] ? val[1] : ''
    },
    /** 生效时间校验：开始、结束都填时结束必须晚于开始 */
    checkTimeRange() {
      const { startTime, endTime } = this.form
      if (startTime && endTime && endTime <= startTime) {
        this.$message.warning('结束时间必须晚于开始时间')
        return false
      }
      return true
    },
    buildPayload() {
      const f = this.form
      const isActivity = f.linkType === 'ACTIVITY'
      const payload = {
        id: f.id,
        itemTitle: f.itemTitle,
        itemType: f.itemType,
        mediaUrl: f.mediaUrl,
        placementCodes: f.placementCodes,
        linkType: f.linkType,
        // ACTIVITY 类型的 linkValue 即 activityId，两者保持一致
        linkValue: isActivity ? f.activityId : (f.linkType === 'NONE' ? '' : f.linkValue),
        activityId: isActivity ? f.activityId : '',
        startTime: f.startTime || '',
        endTime: f.endTime || '',
        sorting: f.sorting,
        itemStatus: f.itemStatus
      }
      if (payload.id === undefined) delete payload.id
      return payload
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.checkTimeRange()) return false
        this.submitting = true
        saveContentItem(this.buildPayload()).then(res => {
          this.submitting = false
          if (res && res.code === 200) {
            this.$message.success(res.msg || '保存成功')
            this.visible = false
            this.$emit('saved')
          } else {
            this.$message.error((res && res.msg) || '保存失败')
          }
        }).catch(() => {
          this.submitting = false
        })
      })
    },
    onClosed() {
      this.form = emptyForm()
      this.timeRange = []
      this.activityList = []
      this.activityType = ''
    }
  }
}
</script>

<style scoped>
.form-tip {
	color: #909399;
	font-size: 12px;
	line-height: 1.5;
	margin-left: 8px;
}
</style>

<style>
/* 抽屉：内容区可滚动，底部按钮固定，与项目其他抽屉风格一致 */
.content-form-drawer {
	display: flex;
	flex-direction: column;
}
.content-form-drawer .el-drawer__body {
	flex: 1;
	overflow-y: auto;
	padding: 0 20px 20px;
}
.content-form-drawer__body {
	padding-top: 8px;
}
.content-form-drawer__footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 12px 20px;
	border-top: 1px solid #ebeef5;
	background: #fff;
}
</style>
