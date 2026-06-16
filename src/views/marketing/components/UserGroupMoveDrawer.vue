<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="520px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" class="marketing-activity-drawer__body">
      <div class="move-drawer-summary">
        <div class="move-drawer-summary__name">{{ group.groupName }}</div>
        <div class="move-drawer-summary__meta">
          <span>当前用户数 {{ group.userCount || 0 }}</span>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item prop="phones">
          <template slot="label">
            <span>{{ mode === 'in' ? '迁入用户' : '迁出用户' }}</span>
            <el-tooltip effect="dark" placement="top" :open-delay="200">
              <div slot="content" class="label-tip-content">
                {{ mode === 'in'
                  ? '在原有成员基础上新增用户，不会覆盖已有成员。支持每行一个手机号，或上传 Excel。'
                  : '从本分组移除指定用户，不影响其他成员。支持每行一个手机号，或上传 Excel。' }}
              </div>
              <i class="el-icon-question label-tip-icon" />
            </el-tooltip>
          </template>
          <el-input
            v-model="phoneText"
            type="textarea"
            :rows="8"
            placeholder="每行一个手机号"
          />
          <div class="user-import-block">
            <el-upload
              :show-file-list="false"
              accept=".xls,.xlsx"
              :http-request="handleImportFile"
            >
              <el-button size="small" type="primary">上传附件</el-button>
            </el-upload>
            <el-button type="text" @click="downloadTemplate">用户标签导入模板.xlsx</el-button>
          </div>
          <p v-if="importFileName" class="field-hint">已解析文件：{{ importFileName }}（{{ parsedPhones.length }} 个手机号）</p>
        </el-form-item>
      </el-form>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ confirmText }}</el-button>
    </div>
  </el-drawer>
</template>

<script>
import XLSX from 'xlsx'
import { moveInUserGroupMembers, moveOutUserGroupMembers } from '@/api/marketing/marketing'
import '../styles/marketing.scss'

export default {
  name: 'UserGroupMoveDrawer',
  props: {
    visible: { type: Boolean, default: false },
    group: {
      type: Object,
      default: () => ({ id: null, groupName: '', userCount: 0, groupDimension: '1' })
    },
    mode: {
      type: String,
      default: 'in',
      validator: val => ['in', 'out'].includes(val)
    }
  },
  data() {
    const validatePhones = (rule, value, callback) => {
      if (!this.parsedPhones.length) {
        callback(new Error('请输入或上传手机号'))
      } else {
        callback()
      }
    }
    return {
      submitting: false,
      phoneText: '',
      importFileName: '',
      form: { phones: [] },
      rules: {
        phones: [{ validator: validatePhones, trigger: 'blur' }]
      }
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    drawerTitle() {
      return this.mode === 'in' ? '迁入用户' : '迁出用户'
    },
    confirmText() {
      return this.mode === 'in' ? '确认迁入' : '确认迁出'
    },
    parsedPhones() {
      return this.parsePhones(this.phoneText)
    }
  },
  watch: {
    phoneText() {
      this.form.phones = this.parsedPhones
    }
  },
  methods: {
    parsePhones(text) {
      if (!text) return []
      return text.split(/[\n,，;；]/).map(s => s.trim()).filter(Boolean)
    },
    onOpen() {
      this.phoneText = ''
      this.importFileName = ''
      this.form.phones = []
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },
    onClose() {
      this.phoneText = ''
      this.importFileName = ''
      this.form.phones = []
      this.$refs.formRef && this.$refs.formRef.resetFields()
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
          this.phoneText = phones.join('\n')
          this.importFileName = file.name
          this.form.phones = phones
          this.$refs.formRef && this.$refs.formRef.validateField('phones')
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
    handleSubmit() {
      this.form.phones = this.parsedPhones
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const payload = { id: this.group.id, phones: this.parsedPhones }
        const action = this.mode === 'in' ? '迁入' : '迁出'
        this.$confirm(`确认${action} ${this.parsedPhones.length} 个用户？`, '提示', { type: 'warning' }).then(() => {
          this.submitting = true
          const api = this.mode === 'in' ? moveInUserGroupMembers : moveOutUserGroupMembers
          api(payload).then(res => {
            this.submitting = false
            if (res.code === 200) {
              this.$message.success(res.msg || `${action}成功`)
              this.visibleSync = false
              this.$emit('saved')
            } else {
              this.$message.error(res.msg || `${action}失败`)
            }
          }).catch(() => { this.submitting = false })
        }).catch(() => {})
      })
    }
  }
}
</script>

<style scoped>
.move-drawer-summary {
  margin-bottom: 20px;
  padding: 14px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
.move-drawer-summary__name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.move-drawer-summary__meta {
  font-size: 13px;
  color: #606266;
}
.user-import-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}
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
  max-width: 280px;
  line-height: 1.6;
  font-size: 13px;
}
.field-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
}
</style>
