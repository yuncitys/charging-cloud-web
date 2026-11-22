<template>
  <div class="fleet-step">
    <!-- 车队 -->
    <template v-if="step === 0">
      <div class="fleet-step__tip">
        <i class="el-icon-info" /> 先建车队（可多个）。车队只是组织维度，额度仍由机构钱包分配给司机。
      </div>
      <el-card shadow="never" class="fleet-step__card">
        <div slot="header" class="fleet-step__card-head">
          <span>已有车队（{{ fleets.length }}）</span>
          <el-button size="mini" icon="el-icon-refresh" @click="loadFleets">刷新</el-button>
        </div>
        <el-table :data="fleets" size="mini" border empty-text="还没有车队，请在下方新增">
          <el-table-column prop="fleetCode" label="车队编码" width="160" />
          <el-table-column prop="name" label="车队名称" />
          <el-table-column prop="driverCount" label="司机数" width="80" align="center" />
          <el-table-column prop="carCount" label="车辆数" width="80" align="center" />
          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-card shadow="never" class="fleet-step__card">
        <div slot="header" class="fleet-step__card-head"><span>新增车队</span></div>
        <el-form ref="fleetFormRef" :model="fleetForm" :rules="fleetRules" label-width="90px" size="small">
          <el-row :gutter="12">
            <el-col :span="10">
              <el-form-item label="车队编码" prop="fleetCode">
                <el-input v-model="fleetForm.fleetCode" placeholder="机构内唯一，如 TEAM-A" maxlength="32" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="车队名称" prop="name">
                <el-input v-model="fleetForm.name" placeholder="如 城配一队" maxlength="64" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="4" class="fleet-step__inline-btn">
              <el-button type="primary" size="small" :loading="saving" @click="handleAddFleet">添加</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </template>

    <!-- 司机 -->
    <template v-else-if="step === 1">
      <div class="fleet-step__tip">
        <i class="el-icon-info" /> 司机必须归属车队，可绑定车辆（可空）。车辆若还没建，可先完成本步，下一步添加车辆后回到本步再绑定。
      </div>
      <el-form ref="driverFormRef" :model="driverForm" :rules="driverRules" label-width="90px" size="small">
        <el-form-item label="所属车队" prop="fleetId">
          <el-select v-model="driverForm.fleetId" placeholder="请选择车队" style="width: 260px;" @change="loadDrivers">
            <el-option v-for="f in enabledFleets" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
          <span v-if="!enabledFleets.length" class="fleet-step__hint">
            还没有可用车队，请先回到「车队」步骤新增
          </span>
        </el-form-item>
      </el-form>
      <div class="fleet-step__rows">
        <div v-for="(row, index) in driverRows" :key="'driver-' + index" class="fleet-step__row">
          <span class="fleet-step__row-index">{{ index + 1 }}</span>
          <el-input v-model="row.userAccount" size="small" placeholder="用户账号" class="fleet-step__row-input" />
          <el-input v-model="row.userName" size="small" placeholder="姓名" class="fleet-step__row-input" />
          <el-input v-model="row.phoneNumber" size="small" placeholder="11 位手机号" class="fleet-step__row-input" />
          <el-select
            v-model="row.carIds"
            multiple
            collapse-tags
            clearable
            size="small"
            placeholder="绑定车辆（可空）"
            class="fleet-step__row-select"
          >
            <el-option v-for="car in carOptions" :key="car.id" :label="car.plateNumber" :value="car.id" />
          </el-select>
          <el-button size="mini" type="text" class="fleet-step__row-del" @click="removeDriverRow(index)">删除</el-button>
        </div>
      </div>
      <div class="fleet-step__actions">
        <el-button size="mini" icon="el-icon-plus" @click="addDriverRow">新增一行</el-button>
        <el-button size="mini" type="primary" :loading="saving" @click="handleSaveDrivers">保存司机</el-button>
        <el-button size="mini" icon="el-icon-upload2" @click="openImport('driver')">批量导入</el-button>
        <el-button size="mini" type="text" icon="el-icon-refresh" @click="loadCarOptions">刷新可绑定车辆（{{ carOptions.length }}）</el-button>
      </div>

      <el-card shadow="never" class="fleet-step__card fleet-step__card--list">
        <div slot="header" class="fleet-step__card-head">
          <span>已添加司机（{{ driverTotal }}）</span>
          <el-button size="mini" icon="el-icon-refresh" :loading="listLoading" @click="loadDrivers">刷新</el-button>
        </div>
        <div v-if="driverTotal > driverList.length" class="fleet-step__hint">仅显示最近 {{ driverList.length }} 条，共 {{ driverTotal }} 条</div>
        <el-table v-loading="listLoading" :data="driverList" size="mini" border max-height="240" empty-text="还没有司机，请在上方录入或批量导入">
          <el-table-column prop="userAccount" label="账号" width="150" show-overflow-tooltip />
          <el-table-column prop="userName" label="姓名" width="110" show-overflow-tooltip />
          <el-table-column prop="phoneNumber" label="手机号" width="130" />
          <el-table-column prop="fleetName" label="车队" min-width="120" show-overflow-tooltip />
          <el-table-column prop="cash" label="余额(元)" width="100" />
        </el-table>
      </el-card>
    </template>

    <!-- 车辆 -->
    <template v-else>
      <div class="fleet-step__tip">
        <i class="el-icon-info" /> 车辆必须归属车队。车辆类型固定为「机构车辆」，用途/产权可后续在客户车辆页调整。
      </div>
      <el-form ref="carFormRef" :model="carForm" :rules="carRules" label-width="90px" size="small">
        <el-form-item label="所属车队" prop="fleetId">
          <el-select v-model="carForm.fleetId" placeholder="请选择车队" style="width: 260px;" @change="loadCars">
            <el-option v-for="f in enabledFleets" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
          <span v-if="!enabledFleets.length" class="fleet-step__hint">
            还没有可用车队，请先回到「车队」步骤新增
          </span>
        </el-form-item>
      </el-form>
      <div class="fleet-step__rows">
        <div v-for="(row, index) in carRows" :key="'car-' + index" class="fleet-step__row">
          <span class="fleet-step__row-index">{{ index + 1 }}</span>
          <el-input v-model="row.plateNumber" size="small" placeholder="车牌号，如 粤B12345" class="fleet-step__row-input" />
          <el-input v-model="row.vinCode" size="small" placeholder="车架号 VIN（可空）" class="fleet-step__row-input" />
          <el-button size="mini" type="text" class="fleet-step__row-del" @click="removeCarRow(index)">删除</el-button>
        </div>
      </div>
      <div class="fleet-step__actions">
        <el-button size="mini" icon="el-icon-plus" @click="addCarRow">新增一行</el-button>
        <el-button size="mini" type="primary" :loading="saving" @click="handleSaveCars">保存车辆</el-button>
        <el-button size="mini" icon="el-icon-upload2" @click="openImport('car')">批量导入</el-button>
      </div>

      <el-card shadow="never" class="fleet-step__card fleet-step__card--list">
        <div slot="header" class="fleet-step__card-head">
          <span>已添加车辆（{{ carTotal }}）</span>
          <el-button size="mini" icon="el-icon-refresh" :loading="listLoading" @click="loadCars">刷新</el-button>
        </div>
        <div v-if="carTotal > carList.length" class="fleet-step__hint">仅显示最近 {{ carList.length }} 条，共 {{ carTotal }} 条</div>
        <el-table v-loading="listLoading" :data="carList" size="mini" border max-height="240" empty-text="还没有车辆，请在上方录入或批量导入">
          <el-table-column prop="plateNumber" label="车牌号" width="150" />
          <el-table-column prop="vinCode" label="车架号VIN" min-width="160" show-overflow-tooltip />
          <el-table-column prop="fleetName" label="车队" width="140" show-overflow-tooltip />
        </el-table>
      </el-card>
    </template>

    <!-- 批量导入弹窗 -->
    <el-dialog
      :title="importType === 'driver' ? '批量导入司机' : '批量导入车辆'"
      :visible.sync="importVisible"
      width="640px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div v-if="!importPreview.length">
        <div class="fleet-step__tip">
          <i class="el-icon-info" />
          导入的数据统一挂到所选车队；请先
          <el-button type="text" size="mini" @click="downloadTemplate(importType)">下载模板</el-button>
          填好再上传。
        </div>
        <el-form label-width="90px" size="small" style="margin-top: 12px;">
          <el-form-item label="所属车队" required>
            <el-select v-model="importFleetId" placeholder="请选择车队" style="width: 100%;">
              <el-option v-for="f in enabledFleets" :key="f.id" :label="f.name" :value="f.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="importType === 'driver' ? '司机数据' : '车辆数据'" required>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls"
              :on-change="onImportFileChange"
            >
              <el-button size="small" icon="el-icon-folder-opened" :loading="importUploading">选择 Excel 文件</el-button>
            </el-upload>
            <span class="fleet-step__hint">仅支持 .xlsx / .xls</span>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <div class="fleet-step__hint">共解析 {{ importPreview.length }} 条，确认后导入到所选车队</div>
        <el-table :data="importPreview" size="mini" border max-height="300" style="margin-top: 8px;">
          <el-table-column v-if="importType === 'driver'" prop="userAccount" label="账号" width="140" />
          <el-table-column v-if="importType === 'driver'" prop="userName" label="姓名" width="100" />
          <el-table-column v-if="importType === 'driver'" prop="phoneNumber" label="手机号" />
          <el-table-column v-if="importType === 'car'" prop="plateNumber" label="车牌号" width="150" />
          <el-table-column v-if="importType === 'car'" prop="vinCode" label="车架号VIN" />
        </el-table>
      </div>
      <span slot="footer">
        <el-button size="small" @click="importVisible = false">取消</el-button>
        <el-button v-if="importPreview.length" size="small" @click="resetImport">重新选择</el-button>
        <el-button v-if="importPreview.length" size="small" type="primary" :loading="saving" @click="submitImport">确认导入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addFleet, getFleetOptions } from '@/api/enterpriseFleet/fleet'
import {
  batchSaveDriver,
  previewDriverImport,
  submitDriverImport,
  uploadDriverFile,
  downloadDriverTemplate,
  getDriverPage
} from '@/api/chargingCustomer/chargingCustomerDriver'
import {
  batchAddChargingCustomerCar,
  previewCarImport,
  submitCarImport,
  uploadCarFile,
  downloadCarTemplate,
  getChargingCustomerCarPage,
  getCarListByOrgId
} from '@/api/chargingCustomer/chargingCustomerCar'

/**
 * 「新增客户」向导里的第 2~4 步内容（车队 / 司机 / 车辆），由父级控制步骤与前后按钮。
 */
export default {
  name: 'FleetInitSteps',
  props: {
    customer: {
      type: Object,
      default: () => ({})
    },
    // 0=车队 1=司机 2=车辆
    step: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      saving: false,
      fleets: [],
      fleetForm: { fleetCode: '', name: '' },
      fleetRules: {
        fleetCode: [{ required: true, message: '请输入车队编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入车队名称', trigger: 'blur' }]
      },
      driverForm: { fleetId: null },
      driverRules: {
        fleetId: [{ required: true, message: '请选择车队', trigger: 'change' }]
      },
      driverRows: [{ userAccount: '', userName: '', phoneNumber: '', carIds: [] }],
      carOptions: [],
      carForm: { fleetId: null },
      carRules: {
        fleetId: [{ required: true, message: '请选择车队', trigger: 'change' }]
      },
      carRows: [{ plateNumber: '', vinCode: '' }],
      importVisible: false,
      importType: 'driver',
      importFleetId: null,
      importPreview: [],
      importUploading: false,
      listLoading: false,
      driverList: [],
      driverTotal: 0,
      carList: [],
      carTotal: 0
    }
  },
  computed: {
    enabledFleets() {
      return (this.fleets || []).filter(f => f.status === 1)
    }
  },
  watch: {
    'customer.id': {
      handler() {
        this.loadFleets()
        this.reloadStepData()
      },
      immediate: true
    },
    step() {
      this.reloadStepData()
    }
  },
  methods: {
    orgId() {
      return this.customer && this.customer.id ? this.customer.id : null
    },
    hasUnsaved() {
      const drivers = this.driverRows.some(r => r.userAccount || r.userName || r.phoneNumber)
      const cars = this.carRows.some(r => r.plateNumber || r.vinCode)
      return drivers || cars
    },
    reloadStepData() {
      if (this.step === 1) {
        this.loadDrivers()
        this.loadCarOptions()
      } else if (this.step === 2) {
        this.loadCars()
      }
    },
    loadDrivers() {
      if (!this.orgId()) {
        this.driverList = []
        this.driverTotal = 0
        return
      }
      this.listLoading = true
      const query = { page: 1, limit: 100, belongToId: String(this.orgId()) }
      if (this.driverForm.fleetId) query.fleetId = this.driverForm.fleetId
      getDriverPage(query).then(res => {
        this.listLoading = false
        if (res.code === 200) {
          this.driverList = res.data || []
          this.driverTotal = res.count == null ? this.driverList.length : res.count
        } else {
          this.$message.error(res.msg || '司机列表加载失败')
        }
      }).catch(() => { this.listLoading = false })
    },
    loadCars() {
      if (!this.orgId()) {
        this.carList = []
        this.carTotal = 0
        return
      }
      this.listLoading = true
      const query = { page: 1, limit: 100, belongToId: this.orgId() }
      if (this.carForm.fleetId) query.fleetId = this.carForm.fleetId
      getChargingCustomerCarPage(query).then(res => {
        this.listLoading = false
        if (res.code === 200) {
          this.carList = res.data || []
          this.carTotal = res.count == null ? this.carList.length : res.count
        } else {
          this.$message.error(res.msg || '车辆列表加载失败')
        }
      }).catch(() => { this.listLoading = false })
    },
    loadFleets() {
      if (!this.orgId()) {
        this.fleets = []
        return
      }
      getFleetOptions(this.orgId()).then(res => {
        if (res.code === 200) {
          this.fleets = res.data || []
        }
      }).catch(() => { this.fleets = [] })
    },
    handleAddFleet() {
      this.$refs.fleetFormRef.validate(valid => {
        if (!valid) return
        this.saving = true
        addFleet({
          orgId: this.orgId(),
          fleetCode: this.fleetForm.fleetCode,
          name: this.fleetForm.name,
          status: 1,
          sortCode: 0
        }).then(res => {
          this.saving = false
          if (res.code === 200) {
            this.$message.success(res.msg || '添加成功')
            this.fleetForm = { fleetCode: '', name: '' }
            this.loadFleets()
            this.$emit('changed')
          } else {
            this.$message.error(res.msg || '添加失败')
          }
        }).catch(() => { this.saving = false })
      })
    },
    addDriverRow() {
      this.driverRows.push({ userAccount: '', userName: '', phoneNumber: '', carIds: [] })
    },
    loadCarOptions() {
      if (!this.orgId()) {
        this.carOptions = []
        return
      }
      getCarListByOrgId(this.orgId()).then(res => {
        if (res.code === 200) {
          this.carOptions = res.data || []
        }
      }).catch(() => { this.carOptions = [] })
    },
    removeDriverRow(index) {
      this.driverRows.splice(index, 1)
      if (!this.driverRows.length) this.addDriverRow()
    },
    handleSaveDrivers() {
      const rows = this.driverRows.filter(r => r.userAccount || r.userName || r.phoneNumber)
      if (!rows.length) {
        this.$message.warning('请先填写司机信息')
        return
      }
      for (const row of rows) {
        if (!row.userAccount || !row.userName) {
          this.$message.warning('司机账号与姓名必填')
          return
        }
        if (!/^1[3-9]\d{9}$/.test(String(row.phoneNumber || ''))) {
          this.$message.warning(`手机号格式不正确：${row.userAccount}`)
          return
        }
      }
      this.$refs.driverFormRef.validate(valid => {
        if (!valid) {
          this.$message.warning('请先选择车队')
          return
        }
        this.doSaveDrivers(rows)
      })
    },
    doSaveDrivers(rows) {
      this.saving = true
      batchSaveDriver({
        users: rows.map(row => ({
          userAccount: row.userAccount,
          userName: row.userName,
          phoneNumber: row.phoneNumber,
          userPlatform: 2,
          belongToId: this.orgId(),
          fleetId: this.driverForm.fleetId,
          carIds: row.carIds || []
        }))
      }).then(res => {
        this.saving = false
        if (res.code === 200) {
          this.$message.success(res.msg || '司机已保存')
          this.driverRows = [{ userAccount: '', userName: '', phoneNumber: '', carIds: [] }]
          this.loadDrivers()
          this.$emit('changed')
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      }).catch(() => { this.saving = false })
    },
    addCarRow() {
      this.carRows.push({ plateNumber: '', vinCode: '' })
    },
    removeCarRow(index) {
      this.carRows.splice(index, 1)
      if (!this.carRows.length) this.addCarRow()
    },
    handleSaveCars() {
      const rows = this.carRows.filter(r => r.plateNumber)
      if (!rows.length) {
        this.$message.warning('请先填写车牌号')
        return
      }
      this.$refs.carFormRef.validate(valid => {
        if (!valid) {
          this.$message.warning('请先选择车队')
          return
        }
        this.doSaveCars(rows)
      })
    },
    doSaveCars(rows) {
      this.saving = true
      batchAddChargingCustomerCar({
        cars: rows.map(row => ({
          plateNumber: row.plateNumber,
          vinCode: row.vinCode,
          carType: '2',
          purpose: '1',
          propertyRight: '2',
          isDefault: 0,
          belongToId: this.orgId(),
          mainOrgId: this.orgId(),
          fleetId: this.carForm.fleetId
        }))
      }).then(res => {
        this.saving = false
        if (res.code === 200) {
          this.$message.success(res.msg || '车辆已保存')
          this.carRows = [{ plateNumber: '', vinCode: '' }]
          this.loadCars()
          this.$emit('changed')
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      }).catch(() => { this.saving = false })
    },
    openImport(type) {
      const formRef = type === 'driver' ? 'driverFormRef' : 'carFormRef'
      this.$refs[formRef].validate(valid => {
        if (!valid) {
          this.$message.warning('请先选择车队')
          return
        }
        this.importType = type
        this.importFleetId = type === 'driver' ? this.driverForm.fleetId : this.carForm.fleetId
        this.importPreview = []
        this.importVisible = true
      })
    },
    downloadTemplate(type) {
      const api = type === 'driver' ? downloadDriverTemplate : downloadCarTemplate
      const filename = type === 'driver' ? '客户司机导入模板.xlsx' : '客户车辆导入模板.xlsx'
      api().then(res => {
        const blob = new Blob([res])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename
        link.click()
        window.URL.revokeObjectURL(link.href)
      }).catch(() => {})
    },
    onImportFileChange(file) {
      const raw = file && file.raw
      if (!raw) return
      const formData = new FormData()
      formData.append('file', raw)
      this.importUploading = true
      const upload = this.importType === 'driver' ? uploadDriverFile : uploadCarFile
      const preview = this.importType === 'driver' ? previewDriverImport : previewCarImport
      upload(formData).then(res => {
        if (res.code === 200 && res.data && res.data.name) {
          return preview(res.data.name).then(previewRes => {
            this.importUploading = false
            if (previewRes.code === 200) {
              this.importPreview = previewRes.data || []
              if (!this.importPreview.length) {
                this.$message.warning('Excel 文件中未发现有效数据')
              }
            } else {
              this.$message.error(previewRes.msg || '预览解析失败')
            }
          })
        }
        this.importUploading = false
        this.$message.error(res.msg || '文件上传失败')
      }).catch(() => { this.importUploading = false })
    },
    submitImport() {
      if (!this.importFleetId) {
        this.$message.warning('请先选择车队')
        return
      }
      this.saving = true
      const done = res => {
        this.saving = false
        if (res.code === 200) {
          this.$message.success(res.msg || '导入成功')
          this.importVisible = false
          this.importPreview = []
          if (this.importType === 'driver') {
            this.loadDrivers()
          } else {
            this.loadCars()
          }
          this.$emit('changed')
        } else {
          this.$message.error(res.msg || '导入失败')
        }
      }
      if (this.importType === 'driver') {
        submitDriverImport({
          belongToId: this.orgId(),
          fleetId: this.importFleetId,
          driverData: this.importPreview
        }).then(done).catch(() => { this.saving = false })
      } else {
        submitCarImport({
          belongToId: this.orgId(),
          fleetId: this.importFleetId,
          carData: this.importPreview
        }).then(done).catch(() => { this.saving = false })
      }
    },
    resetImport() {
      this.importPreview = []
    }
  }
}
</script>

<style scoped>
.fleet-step__tip {
  padding: 8px 12px;
  margin-bottom: 12px;
  background: #f4f8ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  color: #606266;
  font-size: 12px;
  line-height: 20px;
}
.fleet-step__tip i {
  color: #409eff;
  margin-right: 4px;
}
.fleet-step__card {
  margin-bottom: 12px;
  border-radius: 4px;
}
.fleet-step__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.fleet-step__inline-btn {
  display: flex;
  align-items: center;
  padding-top: 2px;
}
.fleet-step__rows {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
  max-height: 260px;
  overflow: auto;
}
.fleet-step__row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.fleet-step__row:last-child {
  margin-bottom: 0;
}
.fleet-step__row-index {
  width: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
  flex: none;
}
.fleet-step__row-input {
  flex: 1;
  min-width: 120px;
}
.fleet-step__row-select {
  flex: 1.2;
  min-width: 160px;
}
.fleet-step__row-del {
  flex: none;
  color: #f56c6c;
}
.fleet-step__actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.fleet-step__hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
.fleet-step__card--list {
  margin-top: 12px;
}
</style>
