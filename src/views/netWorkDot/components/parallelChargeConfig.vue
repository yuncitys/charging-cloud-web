<template>
  <el-drawer
    title="双枪并充配置"
    :visible.sync="visible"
    custom-class="parallel-charge-drawer"
    direction="rtl"
    size="520px"
    append-to-body
    @close="handleClose"
  >
    <div v-loading="loading" class="parallel-charge-drawer-body">
      <el-form
        ref="form"
        :model="form"
        label-position="left"
        label-width="140px"
      >
        <el-form-item label="电站名称">
          <el-input v-model="form.networkName" disabled />
        </el-form-item>
        <el-form-item label="是否配置双枪并充" required>
          <el-radio-group v-model="form.isMoreCharge">
            <el-radio :label="false">否</el-radio>
            <el-radio :label="true">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.isMoreCharge === true" label="选择电桩">
          <div class="pile-select-box">
            <div class="search-bar">
              <el-checkbox
                :value="selectAll"
                :indeterminate="selectAllIndeterminate"
                :disabled="!filteredDevices.length"
                @change="toggleAll"
              >
                全选
              </el-checkbox>
              <el-input
                v-model="searchKey"
                placeholder="请输入关键字进行过滤"
                clearable
                size="small"
              />
              <el-button type="primary" size="small" @click="applySearch">搜索</el-button>
            </div>
            <el-checkbox-group v-model="form.deviceIds" class="pile-list">
              <el-checkbox
                v-for="item in filteredDevices"
                :key="item.deviceId"
                :label="item.deviceId"
                class="pile-item"
              >
                {{ formatDeviceLabel(item) }}
              </el-checkbox>
              <p v-if="!filteredDevices.length" class="empty-hint">暂无匹配电桩</p>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <el-form-item class="drawer-form-actions" label-width="0">
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':netWorkDot:parallelCharge:edit')"
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            确 定
          </el-button>
          <el-button @click="visible = false">取 消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>

<script>
import { getParallelChargeDetail, saveParallelCharge } from '@/api/netWorkDot/parallelCharge.js'

export default {
  name: 'ParallelChargeConfig',
  data() {
    return {
      visible: false,
      loading: false,
      saving: false,
      searchKey: '',
      devices: [],
      form: {
        stationId: null,
        networkName: '',
        isMoreCharge: false,
        deviceIds: []
      }
    }
  },
  computed: {
    filteredDevices() {
      const keyword = (this.searchKey || '').trim().toLowerCase()
      if (!keyword) return this.devices
      return this.devices.filter(item => {
        const name = (item.deviceName || '').toLowerCase()
        const code = (item.deviceCode || '').toLowerCase()
        return name.indexOf(keyword) !== -1 || code.indexOf(keyword) !== -1
      })
    },
    filteredDeviceIds() {
      return this.filteredDevices.map(item => item.deviceId)
    },
    selectedFilteredCount() {
      const selected = new Set(this.form.deviceIds)
      return this.filteredDeviceIds.filter(id => selected.has(id)).length
    },
    selectAll() {
      return this.filteredDeviceIds.length > 0 &&
        this.selectedFilteredCount === this.filteredDeviceIds.length
    },
    selectAllIndeterminate() {
      return this.selectedFilteredCount > 0 && !this.selectAll
    }
  },
  methods: {
    open(row) {
      const stationId = row && (row.stationId != null ? row.stationId : row.id)
      if (stationId == null || stationId === '') {
        this.$message.error('缺少站点ID')
        return
      }
      this.visible = true
      this.searchKey = ''
      this.form.stationId = stationId
      this.form.networkName = (row && row.networkName) || ''
      this.form.isMoreCharge = false
      this.form.deviceIds = []
      this.devices = []
      this.loadDetail(stationId)
    },
    loadDetail(stationId) {
      this.loading = true
      getParallelChargeDetail(stationId).then(res => {
        if (!res || res.code !== 200 || !res.data) {
          this.$message.error((res && res.msg) || '获取配置失败')
          return
        }
        const detail = res.data
        this.form.stationId = detail.stationId != null ? detail.stationId : stationId
        this.form.networkName = detail.networkName || this.form.networkName
        this.form.isMoreCharge = this.normalizeBool(detail.isMoreCharge)
        this.devices = Array.isArray(detail.devices) ? detail.devices : []
        const ids = Array.isArray(detail.deviceIds) ? detail.deviceIds : []
        this.form.deviceIds = ids.map(id => id)
      }).catch(() => {
        this.$message.error('获取配置失败')
      }).finally(() => {
        this.loading = false
      })
    },
    normalizeBool(val) {
      return val === true || val === 1 || val === '1'
    },
    formatDeviceLabel(item) {
      const name = item.deviceName || ''
      const code = item.deviceCode || ''
      if (name && code && name !== code) {
        return `${name}（${code}）`
      }
      return name || code || `桩${item.deviceId}`
    },
    applySearch() {
      this.searchKey = (this.searchKey || '').trim()
    },
    toggleAll(checked) {
      const visibleIds = this.filteredDeviceIds
      const visibleSet = new Set(visibleIds)
      if (checked) {
        const merged = new Set(this.form.deviceIds.concat(visibleIds))
        this.form.deviceIds = Array.from(merged)
        return
      }
      this.form.deviceIds = this.form.deviceIds.filter(id => !visibleSet.has(id))
    },
    handleSave() {
      if (this.form.stationId == null) {
        this.$message.error('缺少站点ID')
        return
      }
      if (this.form.isMoreCharge !== true && this.form.isMoreCharge !== false) {
        this.$message.error('请选择是否配置双枪并充')
        return
      }
      if (this.form.isMoreCharge === true && !this.form.deviceIds.length) {
        this.$message.error('请选择并充电桩')
        return
      }
      const payload = {
        stationId: this.form.stationId,
        isMoreCharge: this.form.isMoreCharge,
        deviceIds: this.form.isMoreCharge === true ? this.form.deviceIds : []
      }
      this.saving = true
      saveParallelCharge(payload).then(res => {
        if (res && res.code === 200) {
          this.$message.success((res && res.msg) || '保存成功')
          this.visible = false
          this.$emit('saved')
        } else {
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {
        this.$message.error('保存失败')
      }).finally(() => {
        this.saving = false
      })
    },
    handleClose() {
      this.searchKey = ''
      this.devices = []
      this.form = {
        stationId: null,
        networkName: '',
        isMoreCharge: false,
        deviceIds: []
      }
    }
  }
}
</script>

<style scoped>
.parallel-charge-drawer-body {
  padding: 0 20px 20px;
}
.pile-select-box {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  width: 100%;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px solid #ebeef5;
}
.search-bar .el-input {
  flex: 1;
}
.pile-list {
  max-height: 360px;
  overflow-y: auto;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
}
.pile-item {
  margin: 0 0 6px;
  margin-right: 0 !important;
}
.empty-hint {
  margin: 8px 0;
  font-size: 13px;
  color: #909399;
}
.drawer-form-actions {
  margin-top: 24px;
}
</style>

<style>
.parallel-charge-drawer .el-drawer__body {
  overflow: auto;
}
</style>
