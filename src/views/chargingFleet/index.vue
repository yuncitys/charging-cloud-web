<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="search-row">
        <el-select v-model="query.orgId" class="filter-item" style="width: 200px;" placeholder="所属机构" clearable filterable @change="handleOrgChange">
          <el-option v-for="opt in orgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
        </el-select>
        <el-input v-model="query.fleetCode" class="filter-item" style="width: 160px;" placeholder="车队编码" clearable />
        <el-input v-model="query.name" class="filter-item" style="width: 160px;" placeholder="车队名称" clearable />
        <el-select v-model="query.status" class="filter-item" style="width: 140px;" placeholder="状态" clearable>
          <el-option :value="1" label="启用" />
          <el-option :value="0" label="停用" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button class="filter-item" plain @click="resetQuery">清空</el-button>
      </div>

      <div class="action-row">
        <el-button v-if="hasPerm(':charging:customer:fleet:add')" class="filter-item" type="primary" icon="el-icon-plus" @click="openDialog('create')">新增车队</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" fit highlight-current-row>
      <el-table-column type="index" label="序号" width="60" align="center">
        <template slot-scope="scope">{{ scope.$index + (query.page - 1) * query.limit + 1 }}</template>
      </el-table-column>
      <el-table-column prop="fleetCode" label="车队编码" align="center" width="140" />
      <el-table-column prop="name" label="车队名称" align="center" min-width="150" show-overflow-tooltip />
      <el-table-column prop="orgName" label="所属机构" align="center" min-width="160" show-overflow-tooltip />
      <el-table-column prop="leaderUserName" label="负责人" align="center" width="120">
        <template slot-scope="scope">{{ scope.row.leaderUserName || '-' }}</template>
      </el-table-column>
      <el-table-column prop="driverCount" label="司机数" align="center" width="90" />
      <el-table-column prop="carCount" label="车辆数" align="center" width="90" />
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" align="center" min-width="140" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" align="center" width="170">
        <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center">
        <template slot-scope="scope">
          <el-button v-if="hasPerm(':charging:customer:fleet:edit')" size="mini" type="primary" @click="openDialog('edit', scope.row)">编辑</el-button>
          <el-button v-if="hasPerm(':charging:customer:fleet:status')" size="mini" :type="scope.row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button v-if="hasPerm(':charging:customer:fleet:delete')" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="query.limit"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-drawer
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      size="520px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="fleet-drawer-body">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="所属机构" prop="orgId">
            <el-select v-model="form.orgId" placeholder="请选择归属机构" filterable style="width: 100%;" @change="handleFormOrgChange">
              <el-option v-for="opt in orgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="车队编码" prop="fleetCode">
            <el-input v-model="form.fleetCode" placeholder="机构内唯一，如 TEAM-A" clearable maxlength="32" />
          </el-form-item>
          <el-form-item label="车队名称" prop="name">
            <el-input v-model="form.name" placeholder="如 城配一队" clearable maxlength="64" />
          </el-form-item>
          <el-form-item label="负责人" prop="leaderUserId">
            <el-select v-model="form.leaderUserId" placeholder="可空，需为该机构下司机" clearable filterable style="width: 100%;" :disabled="!form.orgId">
              <el-option v-for="d in driverOptions" :key="d.id" :label="d.userName + '（' + d.userAccount + '）'" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortCode">
            <el-input-number v-model="form.sortCode" :min="0" :max="9999" controls-position="right" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="255" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      <div class="fleet-drawer-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">确定</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import { getOrganizationOptions } from '@/api/organization/organization'
import { getDriverPage } from '@/api/chargingCustomer/chargingCustomerDriver'
import { addFleet, deleteFleet, getFleetPage, updateFleet, updateFleetStatus } from '@/api/enterpriseFleet/fleet'

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致，keep-alive include 才能命中
  name: 'chargingFleet',
  filters: {
    formatDate(time) {
      return time ? parseTime(time) : '-'
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      list: [],
      total: 0,
      orgOptions: [],
      driverOptions: [],
      query: {
        page: 1,
        limit: 10,
        orgId: null,
        fleetCode: '',
        name: '',
        status: null
      },
      dialogVisible: false,
      dialogMode: 'create',
      form: {
        id: null,
        orgId: null,
        fleetCode: '',
        name: '',
        leaderUserId: null,
        status: 1,
        sortCode: 0,
        remark: ''
      },
      rules: {
        orgId: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
        fleetCode: [{ required: true, message: '请输入车队编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入车队名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'edit' ? '编辑车队' : '新增车队'
    }
  },
  created() {
    this.loadOrgOptions()
    this.loadList()
  },
  methods: {
    hasPerm(permission) {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(permission))
    },
    loadOrgOptions() {
      getOrganizationOptions({}).then(res => {
        if (res.code === 200) {
          this.orgOptions = res.data || []
        }
      })
    },
    loadDriverOptions(orgId) {
      this.driverOptions = []
      if (!orgId) return
      getDriverPage({ page: 1, limit: 500, belongToId: String(orgId) }).then(res => {
        if (res.code === 200) {
          this.driverOptions = res.data || []
        }
      })
    },
    loadList() {
      this.loading = true
      getFleetPage(this.query).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => { this.loading = false })
    },
    search() {
      this.query.page = 1
      this.loadList()
    },
    resetQuery() {
      this.query = { page: 1, limit: this.query.limit, orgId: null, fleetCode: '', name: '', status: null }
      this.loadList()
    },
    handleOrgChange() {
      this.search()
    },
    handleSizeChange(val) {
      this.query.limit = val
      this.loadList()
    },
    handleCurrentChange(val) {
      this.query.page = val
      this.loadList()
    },
    openDialog(mode, row) {
      this.dialogMode = mode
      this.form = {
        id: mode === 'edit' ? row.id : null,
        orgId: row ? row.orgId : (this.query.orgId || null),
        fleetCode: row ? row.fleetCode : '',
        name: row ? row.name : '',
        leaderUserId: row ? row.leaderUserId : null,
        status: row ? row.status : 1,
        sortCode: row ? row.sortCode : 0,
        remark: row ? row.remark : ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
      this.loadDriverOptions(this.form.orgId)
    },
    handleFormOrgChange(orgId) {
      this.form.leaderUserId = null
      this.loadDriverOptions(orgId)
    },
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.saving = true
        const action = this.dialogMode === 'edit' ? updateFleet : addFleet
        action(this.form).then(res => {
          this.saving = false
          if (res.code === 200) {
            this.$message.success(res.msg || '保存成功')
            this.dialogVisible = false
            this.loadList()
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => { this.saving = false })
      })
    },
    toggleStatus(row) {
      const next = row.status === 1 ? 0 : 1
      if (next === 0) {
        this.$confirm(`停用后，该车队（${row.name}）下的司机将无法继续使用企业钱包充电，确认停用？`, '停用车队', {
          type: 'warning',
          confirmButtonText: '确认停用',
          cancelButtonText: '取消'
        }).then(() => this.doUpdateStatus(row, next)).catch(() => {})
        return
      }
      this.doUpdateStatus(row, next)
    },
    doUpdateStatus(row, next) {
      updateFleetStatus(row.id, next).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg || '操作成功')
          this.loadList()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除车队「${row.name}」？`, '提示', { type: 'warning' }).then(() => {
        deleteFleet(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '删除成功')
            this.loadList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-container .search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.filter-container .action-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.fleet-drawer-body {
  padding: 0 20px 20px;
}
.fleet-drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  text-align: right;
}
</style>
