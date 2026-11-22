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
      <el-alert type="info" :closable="false" show-icon title="批量录入司机并指定车队；账号可用手机号，后续可在客户司机页调整。" />
      <el-form label-width="90px" size="small" style="margin-top: 12px;">
        <el-form-item label="所属车队">
          <el-select v-model="driverFleetId" placeholder="可空（未编队）" clearable style="width: 100%;">
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
      </div>
    </div>

    <!-- 车辆 -->
    <div v-else>
      <el-alert type="info" :closable="false" show-icon title="批量录入车辆并指定车队（可空）；车辆类型固定为机构车辆，用途/产权可后续调整。" />
      <el-form label-width="90px" size="small" style="margin-top: 12px;">
        <el-form-item label="所属车队">
          <el-select v-model="carFleetId" placeholder="可空（未编队）" clearable style="width: 100%;">
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
      </div>
    </div>
  </div>
</template>

<script>
import { addFleet, getFleetOptions } from '@/api/enterpriseFleet/fleet'
import { batchSaveDriver } from '@/api/chargingCustomer/chargingCustomerDriver'
import { batchAddChargingCustomerCar } from '@/api/chargingCustomer/chargingCustomerCar'

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
      driverFleetId: null,
      driverRows: [{ userAccount: '', userName: '', phoneNumber: '' }],
      carFleetId: null,
      carRows: [{ plateNumber: '', vinCode: '' }]
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
      })
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
      this.saving = true
      batchSaveDriver({
        users: rows.map(row => ({
          userAccount: row.userAccount,
          userName: row.userName,
          phoneNumber: row.phoneNumber,
          userPlatform: 2,
          belongToId: this.orgId(),
          fleetId: this.driverFleetId
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
          fleetId: this.carFleetId
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
.fleet-init-step__actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
