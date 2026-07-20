<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="560px"
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
        <el-form-item label="关联电站" prop="stationIds">
          <el-select v-model="form.stationIds" multiple filterable placeholder="请选择电站" style="width: 100%;">
            <el-option v-for="item in stationOptions" :key="item.id" :label="item.networkName" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { saveStationGroup, updateStationGroup, stationGroupDetail } from '@/api/marketing/marketing'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import '../styles/marketing.scss'

export default {
  name: 'StationGroupFormDrawer',
  props: {
    visible: { type: Boolean, default: false },
    group: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      stationOptions: [],
      form: { id: null, groupName: '', groupDimension: '0', stationIds: [] },
      rules: {
        groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
        stationIds: [{ type: 'array', required: true, message: '请选择电站', trigger: 'change' }]
      }
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    drawerTitle() {
      return this.form.id ? '编辑电站分组' : '新增电站分组'
    }
  },
  methods: {
    loadStations() {
      return getChargingStationList({ page: 1, limit: 9999 }).then(res => {
        this.stationOptions = res.data || []
      })
    },
    loadDetail(id) {
      return stationGroupDetail(id).then(res => {
        if (res.code !== 200 || !res.data) {
          throw new Error(res.msg || '加载分组详情失败')
        }
        return res.data
      })
    },
    applyForm(detail) {
      this.form = {
        id: detail.id,
        groupName: detail.groupName,
        groupDimension: detail.groupDimension || '0',
        stationIds: detail.stationIds || []
      }
    },
    resetCreateForm() {
      this.form = { id: null, groupName: '', groupDimension: '0', stationIds: [] }
    },
    onOpen() {
      this.loading = true
      const stationTask = this.stationOptions.length ? Promise.resolve() : this.loadStations()
      const detailTask = this.group && this.group.id ? this.loadDetail(this.group.id) : Promise.resolve(null)
      Promise.all([stationTask, detailTask]).then(([, detail]) => {
        if (detail) {
          this.applyForm(detail)
        } else {
          this.resetCreateForm()
        }
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
        })
      }).catch(err => {
        this.$message.error((err && err.message) || '加载失败')
        this.resetCreateForm()
      }).finally(() => {
        this.loading = false
      })
    },
    onClose() {
      this.form = { id: null, groupName: '', groupDimension: '0', stationIds: [] }
      this.$refs.formRef && this.$refs.formRef.resetFields()
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitting = true
        const api = this.form.id ? updateStationGroup : saveStationGroup
        api(this.form).then(res => {
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
