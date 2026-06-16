<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="680px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" v-loading="loading" class="marketing-activity-drawer__body">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入分组名称" maxlength="50" />
        </el-form-item>

        <el-form-item prop="groupDimension">
          <template slot="label">
            <span>分组维度</span>
            <el-tooltip effect="dark" placement="top" :open-delay="200">
              <div slot="content" class="label-tip-content">
                <p><strong>按充电数据：</strong>无需手工录入用户。保存规则后，系统根据时间区间、电站范围及数据维度条件，从充电订单中筛选用户；列表用户数在规则计算后更新。</p>
                <p><strong>批量导入：</strong>通过 Excel 上传手机号，直接写入分组成员。</p>
              </div>
              <i class="el-icon-question label-tip-icon" />
            </el-tooltip>
          </template>
          <el-radio-group v-model="form.groupDimension" @change="onGroupDimensionChange">
            <el-radio label="0">按充电数据</el-radio>
            <el-radio label="1">批量导入</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.groupDimension === '0'">
          <el-form-item label="数据维度" prop="dataDimension">
            <el-radio-group v-model="form.dataDimension" @change="onDataDimensionChange">
              <el-radio label="0">充电量</el-radio>
              <el-radio label="1">充电次数</el-radio>
              <el-radio label="2">充电金额</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="电站范围" prop="stationDimension">
            <el-radio-group v-model="form.stationDimension" @change="onStationDimensionChange">
              <el-radio label="0">按电站</el-radio>
              <el-radio label="1">按电站分组</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.stationDimension === '0'" label="选择电站" prop="stationScopes">
            <station-scope-picker station-scope="1" v-model="form.stationScopes" @input="validateStationField" />
          </el-form-item>

          <el-form-item v-else label="选择电站分组" prop="stationGroupScopes">
            <station-scope-picker station-scope="2" v-model="form.stationGroupScopes" @input="validateStationField" />
          </el-form-item>

          <el-form-item label="时间区间" prop="timeRange">
            <el-date-picker
              v-model="form.timeRange"
              type="datetimerange"
              range-separator="—"
              start-placeholder="请选择开始日期"
              end-placeholder="请选择结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item prop="conditionRange" required>
            <template slot="label">
              <span>{{ conditionLabel }}</span>
              <el-tooltip effect="dark" placement="top" :open-delay="200">
                <div slot="content" class="label-tip-content">{{ conditionHintText }}</div>
                <i class="el-icon-question label-tip-icon" />
              </el-tooltip>
            </template>
            <div class="condition-range-row">
              <el-input
                v-model.number="form.conditionMin"
                :placeholder="conditionPlaceholder"
                @blur="validateConditionField"
                @input="validateConditionField"
              >
                <template slot="append">{{ conditionUnit }}</template>
              </el-input>
              <span class="condition-range-row__sep">—</span>
              <el-input
                v-model.number="form.conditionMax"
                :placeholder="conditionPlaceholder"
                @blur="validateConditionField"
                @input="validateConditionField"
              >
                <template slot="append">{{ conditionUnit }}</template>
              </el-input>
            </div>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item prop="importPhones">
            <template slot="label">
              <span>导入用户</span>
              <el-tooltip effect="dark" placement="top" :open-delay="200">
                <div slot="content" class="label-tip-content">
                  请下载模板填写手机号后上传。新建时必传；编辑时不重新上传则保留现有成员，重新上传将覆盖成员。
                </div>
                <i class="el-icon-question label-tip-icon" />
              </el-tooltip>
            </template>
            <div class="user-import-block">
              <el-upload
                :show-file-list="false"
                accept=".xls,.xlsx"
                :http-request="handleImportFile"
              >
                <el-button type="primary">上传附件</el-button>
              </el-upload>
              <el-button type="text" @click="downloadTemplate">用户标签导入模板.xlsx</el-button>
            </div>
            <p v-if="importFileName" class="field-hint">已选择：{{ importFileName }}（{{ form.importPhones.length }} 个手机号）</p>
          </el-form-item>
        </template>
      </el-form>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import XLSX from 'xlsx'
import { saveUserGroup, updateUserGroup, userGroupDetail } from '@/api/marketing/marketing'
import StationScopePicker from './StationScopePicker'
import { parseTime } from '@/utils/index'
import '../styles/marketing.scss'

function createDefaultForm() {
  return {
    id: null,
    groupName: '',
    groupDimension: '0',
    dataDimension: '0',
    stationDimension: '0',
    stationScopes: [],
    stationGroupScopes: [],
    timeRange: [],
    conditionMin: null,
    conditionMax: null,
    conditionRange: true,
    importPhones: []
  }
}

export default {
  name: 'UserGroupFormDrawer',
  components: { StationScopePicker },
  props: {
    visible: { type: Boolean, default: false },
    group: { type: Object, default: null }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      importFileName: '',
      form: createDefaultForm()
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    drawerTitle() {
      return this.form.id ? '编辑用户分组' : '新增用户分组'
    },
    conditionLabel() {
      const map = { '0': '充电量', '1': '充电次数', '2': '充电金额' }
      return map[this.form.dataDimension] || '充电量'
    },
    conditionUnit() {
      const map = { '0': '度', '1': '次', '2': '元' }
      return map[this.form.dataDimension] || '度'
    },
    conditionPlaceholder() {
      const map = { '0': '最小度数', '1': '最小次数', '2': '最小金额' }
      return map[this.form.dataDimension] || '最小度数'
    },
    conditionHintText() {
      const map = {
        '0': '单位：度（kWh）。示例：统计时间内累计充电量 100—500 度之间的用户将被纳入分组。',
        '1': '单位：次。示例：统计时间内充电 3—10 次的用户将被纳入分组。',
        '2': '单位：元。示例：统计时间内充电消费 100—1000 元的用户将被纳入分组。'
      }
      return map[this.form.dataDimension] || map['0']
    },
    rules() {
      const validateConditionRange = (rule, value, callback) => {
        const min = this.form.conditionMin
        const max = this.form.conditionMax
        if (min == null || min === '' || max == null || max === '') {
          return callback(new Error(`请填写${this.conditionLabel}区间`))
        }
        if (!Number.isFinite(Number(min)) || !Number.isFinite(Number(max))) {
          return callback(new Error('请输入有效数值'))
        }
        if (Number(min) < 0 || Number(max) < 0) {
          return callback(new Error('区间值不能小于 0'))
        }
        if (Number(min) > Number(max)) {
          return callback(new Error('最小值不能大于最大值'))
        }
        callback()
      }
      const validateStationScope = (rule, value, callback) => {
        if (this.form.stationDimension === '0' && (!this.form.stationScopes || !this.form.stationScopes.length)) {
          return callback(new Error('请选择电站'))
        }
        if (this.form.stationDimension === '1' && (!this.form.stationGroupScopes || !this.form.stationGroupScopes.length)) {
          return callback(new Error('请选择电站分组'))
        }
        callback()
      }
      const validateImportPhones = (rule, value, callback) => {
        if (this.form.id) return callback()
        if (!this.form.importPhones.length) {
          return callback(new Error('请导入用户'))
        }
        callback()
      }
      const base = {
        groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
        groupDimension: [{ required: true, message: '请选择分组维度', trigger: 'change' }]
      }
      if (this.form.groupDimension === '0') {
        return {
          ...base,
          dataDimension: [{ required: true, message: '请选择数据维度', trigger: 'change' }],
          stationDimension: [{ required: true, message: '请选择电站范围', trigger: 'change' }],
          stationScopes: [{ validator: validateStationScope, trigger: 'change' }],
          stationGroupScopes: [{ validator: validateStationScope, trigger: 'change' }],
          timeRange: [{ type: 'array', required: true, message: '请选择时间区间', trigger: 'change' }],
          conditionRange: [{ required: true, validator: validateConditionRange, trigger: ['blur', 'change'] }]
        }
      }
      return {
        ...base,
        importPhones: [{ validator: validateImportPhones, trigger: 'change' }]
      }
    }
  },
  methods: {
    loadOptions() {
      return Promise.resolve()
    },
    validateConditionField() {
      this.$refs.formRef && this.$refs.formRef.validateField('conditionRange')
    },
    validateStationField() {
      const field = this.form.stationDimension === '0' ? 'stationScopes' : 'stationGroupScopes'
      this.$refs.formRef && this.$refs.formRef.validateField(field)
    },
    fillFormFromDetail(detail) {
      const stationDimension = detail.stationDimension === '2' ? '0' : (detail.stationDimension || '0')
      this.form = {
        id: detail.id,
        groupName: detail.groupName,
        groupDimension: detail.groupDimension || '0',
        dataDimension: detail.dataDimension || '0',
        stationDimension,
        stationScopes: stationDimension === '0'
          ? (detail.stationIds || []).map(id => ({ dataId: id }))
          : [],
        stationGroupScopes: stationDimension === '1'
          ? (detail.stationGroupIds || []).map(id => ({ dataId: id }))
          : [],
        timeRange: detail.startTime && detail.endTime
          ? [parseTime(detail.startTime, '{y}-{m}-{d} {h}:{i}:{s}'), parseTime(detail.endTime, '{y}-{m}-{d} {h}:{i}:{s}')]
          : [],
        conditionMin: detail.conditionMin,
        conditionMax: detail.conditionMax,
        conditionRange: true,
        importPhones: []
      }
      this.importFileName = ''
    },
    onOpen() {
      this.loading = true
      const tasks = [this.loadOptions()]
      if (this.group && this.group.id) {
        tasks.push(userGroupDetail(this.group.id))
      }
      Promise.all(tasks).then(([, detailRes]) => {
        if (this.group && this.group.id && detailRes && detailRes.code === 200) {
          this.fillFormFromDetail(detailRes.data || {})
        } else {
          this.form = createDefaultForm()
          this.importFileName = ''
        }
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
        })
      }).finally(() => {
        this.loading = false
      })
    },
    onClose() {
      this.form = createDefaultForm()
      this.importFileName = ''
      this.$refs.formRef && this.$refs.formRef.resetFields()
    },
    onGroupDimensionChange() {
      this.importFileName = ''
      this.form.importPhones = []
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },
    onDataDimensionChange() {
      this.validateConditionField()
    },
    onStationDimensionChange() {
      this.form.stationScopes = []
      this.form.stationGroupScopes = []
    },
    handleImportFile({ file }) {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
          const phones = []
          rows.forEach((row, index) => {
            if (!row || !row.length) return
            const value = String(row[0] || '').trim()
            if (!value) return
            if (index === 0 && (value.includes('手机') || value.toLowerCase().includes('phone'))) return
            phones.push(value)
          })
          if (!phones.length) {
            this.$message.warning('未解析到有效手机号')
            return
          }
          this.form.importPhones = phones
          this.importFileName = file.name
          this.$refs.formRef && this.$refs.formRef.validateField('importPhones')
        } catch (err) {
          this.$message.error('文件解析失败，请使用模板格式')
        }
      }
      reader.readAsArrayBuffer(file)
    },
    downloadTemplate() {
      const ws = XLSX.utils.aoa_to_sheet([['手机号'], ['13800138000']])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '用户')
      XLSX.writeFile(wb, '用户标签导入模板.xlsx')
    },
    buildPayload() {
      const payload = {
        id: this.form.id,
        groupName: this.form.groupName,
        groupDimension: this.form.groupDimension
      }
      if (this.form.groupDimension === '0') {
        payload.dataDimension = this.form.dataDimension
        payload.stationDimension = this.form.stationDimension
        payload.conditionMin = this.form.conditionMin
        payload.conditionMax = this.form.conditionMax
        if (this.form.timeRange && this.form.timeRange.length === 2) {
          payload.startTime = this.form.timeRange[0]
          payload.endTime = this.form.timeRange[1]
        }
        if (this.form.stationDimension === '0') {
          payload.stationIds = (this.form.stationScopes || []).map(item => item.dataId)
        } else {
          payload.stationGroupIds = (this.form.stationGroupScopes || []).map(item => item.dataId)
        }
      } else if (this.form.importPhones.length) {
        payload.phones = this.form.importPhones
      }
      return payload
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitting = true
        const payload = this.buildPayload()
        const api = this.form.id ? updateUserGroup : saveUserGroup
        api(payload).then(res => {
          this.submitting = false
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.visibleSync = false
            this.$emit('saved')
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => { this.submitting = false })
      })
    }
  }
}
</script>

<style scoped>
.label-tip-icon {
  margin-left: 4px;
  color: #909399;
  cursor: pointer;
  font-size: 14px;
  vertical-align: -1px;
}
.label-tip-icon:hover {
  color: #409eff;
}
.label-tip-content {
  max-width: 300px;
  line-height: 1.6;
  font-size: 13px;
}
.label-tip-content p {
  margin: 0 0 8px;
}
.label-tip-content p:last-child {
  margin-bottom: 0;
}
.user-import-block {
  display: flex;
  align-items: center;
  gap: 12px;
}
.condition-range-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.condition-range-row .el-input {
  flex: 1;
}
.condition-range-row__sep {
  color: #909399;
}
.field-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
