<template>
  <div class="fleet-init-step">
    <!-- 车队 -->
    <div v-if="step === 0">
      <el-alert type="info" :closable="false" show-icon title="先建车队（可多个）。车队只是组织维度，额度仍由机构钱包分配给司机。" />
      <el-table :data="fleets" size="mini" border style="margin: 12px 0;">
        <el-table-column prop="fleetCode" label="车队编码" width="150" />
        <el-table-column prop="name" label="车队名称" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.status === 1 ? '启用' : '停用' }}</template>
        </el-table-column>
      </el-table>
      <el-form ref="fleetFormRef" :model="fleetForm" :rules="fleetRules" label-width="90px" size="small">
        <el-form-item label="车队编码" prop="fleetCode">
          <el-input v-model="fleetForm.fleetCode" placeholder="机构内唯一，如 TEAM-A" maxlength="32" />
        </el-form-item>
        <el-form-item label="车队名称" prop="name">
          <el-input v-model="fleetForm.name" placeholder="如 城配一队" maxlength="64" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleAddFleet">添加车队</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 司机 -->
    <div v-else-if="step === 1">
      <el-alert type="info" :closable="false" show-icon title="司机必须归属车队；可手工逐行录入，也可下载模板批量导入。" />
      <el-form ref="driverFormRef" :model="driverForm" :rules="driverRules" label-width="90px" size="small" style="margin-top: 12px;">
        <el-form-item label="所属车队" prop="fleetId">
          <el-select v-model="driverForm.fleetId" placeholder="请选择车队" style="width: 100%;">
            <el-option v-for="f in enabledFleets" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="driverRows" size="mini" border>
        <el-table-column label="用户账号" width="170">
          <template slot-scope="scope"><el-input v-model="scope.row.userAccount" placeholder="账号" /></template>
        </el-table-column>
        <el-table-column label="姓名" width="130">
          <template slot-scope="scope"><el-input v-model="scope.row.userName" placeholder="姓名" /></template>
        </el-table-column>
        <el-table-column label="手机号">
          <template slot-scope="scope"><el-input v-model="scope.row.phoneNumber" placeholder="11 位手机号" /></template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="removeDriverRow(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="fleet-init-step__actions">
        <el-button size="mini" icon="el-icon-plus" @click="addDriverRow">新增一行</el-button>
        <el-button size="mini" type="primary" :loading="saving" @click="handleSaveDrivers">保存司机</el-button>
        <el-button size="mini" icon="el-icon-upload2" @click="openImport('driver')">批量导入</el-button>
      </div>
    </div>

    <!-- 车辆 -->
    <div v-else>
      <el-alert type="info" :closable="false" show-icon title="批量录入车辆并指定车队（可空）；车辆类型固定为机构车辆，用途/产权可后续调整。" />
      <el-form ref="carFormRef" :model="carForm" :rules="carRules" label-width="90px" size="small" style="margin-top: 12px;">
        <el-form-item label="所属车队" prop="fleetId">
          <el-select v-model="carForm.fleetId" placeholder="请选择车队" style="width: 100%;">
            <el-option v-for="f in enabledFleets" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="carRows" size="mini" border>
        <el-table-column label="车牌号" width="170">
          <template slot-scope="scope"><el-input v-model="scope.row.plateNumber" placeholder="如 粤B12345" /></template>
        </el-table-column>
        <el-table-column label="车架号 VIN">
          <template slot-scope="scope"><el-input v-model="scope.row.vinCode" placeholder="可空" /></template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="removeCarRow(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="fleet-init-step__actions">
        <el-button size="mini" icon="el-icon-plus" @click="addCarRow">新增一行</el-button>
        <el-button size="mini" type="primary" :loading="saving" @click="handleSaveCars">保存车辆</el-button>
        <el-button size="mini" icon="el-icon-upload2" @click="openImport('car')">批量导入</el-button>
      </div>
    </div>

    <!-- 批量导入弹窗（司机 / 车辆） -->
    <el-dialog :title="importType === 'driver' ? '批量导入司机' : '批量导入车辆'" :visible.sync="importVisible" width="640px" append-to-body :close-on-click-modal="false">
      <div v-if="!importPreview.length">
        <el-alert type="info" :closable="false" show-icon :title="importType === 'driver' ? '导入的司机会统一挂到下面的车队' : '导入的车辆会统一挂到下面的车队'" />
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
            <span class="fleet-init-step__hint">仅支持 .xlsx / .xls，模板与「{{ importType === 'driver' ? '客户司机' : '客户车辆' }}」页一致</span>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <div class="fleet-init-step__hint">共解析 {{ importPreview.length }} 条，确认后导入到所选车队</div>
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
import { batchSaveDriver, previewDriverImport, submitDriverImport, uploadDriverFile } from '@/api/chargingCustomer/chargingCustomerDriver'
import { batchAddChargingCustomerCar, previewCarImport, submitCarImport, uploadCarFile } from '@/api/chargingCustomer/chargingCustomerCar'

/**
 * 「新增客户」向导里的第 2~4 步内容（车队 / 司机 / 车辆），由父级控制 step 与前后按钮。
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
      driverRows: [{ userAccount: '', userName: '', phoneNumber: '' }],
      carForm: { fleetId: null },
      carRules: {
        fleetId: [{ required: true, message: '请选择车队', trigger: 'change' }]
      },
      carRows: [{ plateNumber: '', vinCode: '' }],
      importVisible: false,
      importType: 'driver',
      importFleetId: null,
      importPreview: [],
      importUploading: false
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
      },
      immediate: true
    }
  },
  methods: {
    orgId() {
      return this.customer && this.customer.id ? this.customer.id : null
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
    addFleetCount() {
      return this.fleets.length
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
      this.driverRows.push({ userAccount: '', userName: '', phoneNumber: '' })
    },
    removeDriverRow(index) {
      this.driverRows.splice(index, 1)
      if (!this.driverRows.length) this.addDriverRow()
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
          fleetId: this.driverForm.fleetId
        }))
      }).then(res => {
        this.saving = false
        if (res.code === 200) {
          this.$message.success(res.msg || '司机已保存')
          this.driverRows = [{ userAccount: '', userName: '', phoneNumber: '' }]
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
          this.$emit('changed')
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      }).catch(() => { this.saving = false })
    }
  }
}
</script>

<style scoped>
.fleet-init-step__hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
.fleet-init-step__actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
