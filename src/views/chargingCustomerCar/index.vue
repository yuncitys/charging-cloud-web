<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="search-row">
        <el-input v-model="query.plateNumber" class="filter-item" style="width: 180px;" placeholder="车牌号" clearable />
        <el-input v-model="query.vinCode" class="filter-item" style="width: 200px;" placeholder="车架号VIN" clearable />
        <el-select v-model="query.carType" class="filter-item" style="width: 160px;" placeholder="车辆类型" clearable>
          <el-option v-for="opt in carTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="query.belongToId" class="filter-item" style="width: 200px;" placeholder="归属机构" clearable filterable>
          <el-option v-for="opt in belongToOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
        </el-select>
        <el-select v-model="query.mainOrgId" class="filter-item" style="width: 200px;" placeholder="主机构" clearable filterable>
          <el-option v-for="opt in mainOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button class="filter-item" plain @click="resetQuery">清空</el-button>
      </div>

      <div class="action-row">
        <el-dropdown v-if="hasPerm(':charging:customer:car:import') || hasPerm(':charging:customer:car:delete')" class="filter-item" trigger="click" @command="handleBatchCommand">
          <el-button type="primary">
            批量处理<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="hasPerm(':charging:customer:car:import')" command="batchImport">批量导入</el-dropdown-item>
            <el-dropdown-item v-if="hasPerm(':charging:customer:car:delete')" command="batchDelete">批量删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button v-if="hasPerm(':charging:customer:car:add')" class="filter-item" type="primary" icon="el-icon-plus" @click="openDrawer('create')">新增</el-button>
        <el-button v-if="hasPerm(':charging:customer:car:export')" class="filter-item" type="primary" icon="el-icon-download" :loading="exportLoading" @click="download">导出</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" fit highlight-current-row @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center">
        <template slot-scope="scope">{{ scope.$index + (query.page - 1) * query.limit + 1 }}</template>
      </el-table-column>
      <el-table-column prop="plateNumber" label="车牌号码" align="center" />
      <el-table-column prop="vinCode" label="车架号VIN" align="center" />
      <!-- <el-table-column prop="carType" label="车辆类型" min-width="100" align="center">
        <template slot-scope="scope">{{ carTypeLabel(scope.row.carType) }}</template>
      </el-table-column> -->
      <el-table-column prop="purpose" label="用途" align="center">
        <template slot-scope="scope">{{ purposeLabel(scope.row.purpose) }}</template>
      </el-table-column>
      <el-table-column prop="propertyRight" label="产权" align="center">
        <template slot-scope="scope">{{ propertyRightLabel(scope.row.propertyRight) }}</template>
      </el-table-column>
      <el-table-column prop="belongToName" label="归属机构" align="center" show-overflow-tooltip />
      <el-table-column prop="mainOrgName" label="主机构" align="center" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button v-if="hasPerm(':charging:customer:car:edit')" size="mini" type="warning" @click="openDrawer('edit', scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>

    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      size="560px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-body">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="车牌号码" prop="plateNumber">
            <el-input v-model="form.plateNumber" :disabled="isDetail" />
          </el-form-item>
          <el-form-item label="车辆VIN" prop="vinCode">
            <el-input v-model="form.vinCode" :disabled="isDetail" placeholder="即车架号" />
          </el-form-item>
          <el-form-item label="车辆用途" prop="purpose">
            <el-select v-model="form.purpose" placeholder="请选择" :disabled="isDetail" style="width: 100%;">
              <el-option v-for="opt in purposeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属客户" prop="belongToId">
            <el-select v-model="form.belongToId" placeholder="请选择" :disabled="isDetail" filterable style="width: 100%;">
              <el-option v-for="opt in belongToOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆产权" prop="propertyRight">
            <el-select v-model="form.propertyRight" placeholder="请选择" :disabled="isDetail" style="width: 100%;">
              <el-option v-for="opt in propertyRightOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button v-if="!isDetail && canSaveCar" type="primary" @click="submit">保存</el-button>
      </div>
    </el-drawer>

    <el-drawer
      title="批量导入车辆"
      :visible.sync="importDrawerVisible"
      size="650px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-body">
        <el-form label-width="110px">
          <el-form-item label="归属客户" required>
            <el-select v-model="batchImportForm.belongToId" placeholder="请选择归属客户" filterable style="width: 100%;">
              <el-option v-for="opt in belongToOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="!previewData.length" label="车辆数据" required>
            <el-upload
              class="car-uploader"
              drag
              action=""
              :http-request="handleUpload"
              :show-file-list="false"
              accept=".xls,.xlsx"
              :before-upload="beforeExcelUpload"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div slot="tip" class="el-upload__tip">
                请先<el-link type="primary" :underline="false" @click="downloadTemplate">下载模板</el-link>，填写后上传 (文件限制 5MB)
              </div>
            </el-upload>
          </el-form-item>
        </el-form>

        <div v-if="previewData.length" class="preview-container" style="margin-top: 20px;">
          <div class="preview-tips" style="text-align: left; margin-bottom: 10px; font-weight: bold; color: #409EFF;">
            解析成功，共 {{ previewData.length }} 条数据，请确认：
          </div>
            <el-table :data="pagedPreviewData" border size="mini" stripe>
              <el-table-column label="车牌号码" prop="plateNumber" width="120" align="center" />
              <el-table-column label="车辆VIN" prop="vinCode" min-width="160" align="center" />
              <el-table-column label="用途" prop="purposeName" width="100" align="center" />
              <el-table-column label="产权" prop="propertyRightName" width="100" align="center" />
            </el-table>
            
            <div class="preview-pagination" style="margin-top: 15px; text-align: right;">
              <el-pagination
                small
                layout="prev, pager, next"
                :current-page.sync="importQuery.page"
                :page-size="importQuery.limit"
                :total="previewData.length"
              />
            </div>

            <div style="margin-top: 30px; text-align: right;">
              <el-button @click="resetImport">重新上传</el-button>
              <el-button type="primary" :loading="batchSaving" @click="confirmImport">确定导入</el-button>
            </div>
          </div>
      </div>
    </el-drawer>

    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import {
  addChargingCustomerCar,
  batchDeleteChargingCustomerCar,
  downloadCarTemplate,
  downloadChargingCustomerCar,
  getChargingCustomerCarPage,
  previewCarImport,
  submitCarImport,
  updateChargingCustomerCar,
  uploadCarFile
} from '@/api/chargingCustomer/chargingCustomerCar'
import { getOrganizationOptions } from '@/api/organization/organization'
import downloadProgress from '@/components/Common/downloadProgress.vue'

export default {
  name: 'ChargingCustomerCar',
  components: {
    downloadProgress
  },
  data() {
    return {
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      selectedIds: [],
      belongToOrgOptions: [],
      mainOrgOptions: [],
      query: {
        page: 1,
        limit: 10,
        plateNumber: '',
        vinCode: '',
        carType: '',
        belongToId: '',
        mainOrgId: ''
      },
      carTypeOptions: [
        { label: 'C端', value: '1' },
        { label: '机构', value: '2' },
        { label: '内部', value: '3' }
      ],
      purposeOptions: [
        { label: '私家车', value: '1' },
        { label: '网约车', value: '2' },
        { label: '出租车', value: '3' },
        { label: '物流车', value: '4' },
        { label: '通勤大巴', value: '5' },
        { label: '其他用途', value: '255' }
      ],
      propertyRightOptions: [
        { label: '个人车辆', value: '1' },
        { label: '机构车辆', value: '2' }
      ],
      drawerVisible: false,
      drawerMode: 'create',
      form: {
        id: null,
        plateNumber: '',
        vinCode: '',
        driverLicencePage: '',
        carType: '2',//车辆类型：1-C端、2-机构、3-内部
        purpose: '1',
        propertyRight: '1',
        isDefault: 0,
        belongToId: '',
        mainOrgId: ''
      },
      rules: {
        plateNumber: [{ required: true, message: '请输入车牌号码', trigger: 'blur' }],
        purpose: [{ required: true, message: '请选择车辆用途', trigger: 'change' }],
        belongToId: [{ required: true, message: '请选择归属客户', trigger: 'change' }],
        propertyRight: [{ required: true, message: '请选择车辆产权', trigger: 'change' }]
      },
      importDrawerVisible: false,
      batchSaving: false,
      batchImportForm: {
        belongToId: null
      },
      previewData: [],
      importQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    isDetail() {
      return this.drawerMode === 'detail'
    },
    drawerTitle() {
      if (this.drawerMode === 'edit') return '编辑客户车辆'
      if (this.drawerMode === 'detail') return '客户车辆详情'
      return '新增客户车辆'
    },
    pagedPreviewData() {
      const start = (this.importQuery.page - 1) * this.importQuery.limit
      const end = start + this.importQuery.limit
      return this.previewData.slice(start, end)
    },
    canSaveCar() {
      if (this.drawerMode === 'edit') return this.hasPerm(':charging:customer:car:edit')
      if (this.drawerMode === 'create') return this.hasPerm(':charging:customer:car:add')
      return false
    }
  },
  filters: {
    formatDate(v) {
      return v ? parseTime(v) : ''
    }
  },
  created() {
    this.loadList()
    this.loadOrgOptions()
  },
  methods: {
    hasPerm(permission) {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(permission))
    },
    carTypeLabel(v) {
      const opt = this.carTypeOptions.find(o => o.value === String(v))
      return opt ? opt.label : '-'
    },
    purposeLabel(v) {
      const opt = this.purposeOptions.find(o => o.value === String(v))
      return opt ? opt.label : '-'
    },
    propertyRightLabel(v) {
      const opt = this.propertyRightOptions.find(o => o.value === String(v))
      return opt ? opt.label : '-'
    },
    loadOrgOptions() {
      // 获取主机构列表 (orgType=1)
      getOrganizationOptions({ orgType: 1 }).then(res => {
        if (res.code === 200) {
          this.mainOrgOptions = res.data || []
        }
      })
      // 获取归属机构列表 (orgMold=1 客户/互联机构 或 orgMold=2 内部子公司)
      getOrganizationOptions({ }).then(res => {
        if (res.code === 200) {
          this.belongToOrgOptions = res.data || []
        }
      })
    },
    loadList() {
      this.loading = true
      getChargingCustomerCarPage(this.query).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => {
        this.loading = false
      })
    },
    search() {
      this.query.page = 1
      this.loadList()
    },
    resetQuery() {
      this.query = Object.assign({}, this.query, {
        page: 1,
        limit: 10,
        plateNumber: '',
        vinCode: '',
        carType: '',
        belongToId: '',
        mainOrgId: ''
      })
      this.loadList()
    },
    onSizeChange(val) {
      this.query.limit = val
      this.loadList()
    },
    onCurrentChange(val) {
      this.query.page = val
      this.loadList()
    },
    onSelectionChange(rows) {
      this.selectedIds = (rows || []).map(r => r.id).filter(Boolean)
    },
    resetForm() {
      this.form = {
        id: null,
        plateNumber: '',
        vinCode: '',
        driverLicencePage: '',
        carType: '2',//车辆类型：1-C端、2-机构、3-内部
        purpose: '1',
        propertyRight: '1',
        isDefault: 0,
        belongToId: '',
        mainOrgId: ''
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
    },
    openDrawer(mode, row) {
      if (mode === 'create' && !this.hasPerm(':charging:customer:car:add')) return
      if (mode === 'edit' && !this.hasPerm(':charging:customer:car:edit')) return
      this.drawerMode = mode
      this.drawerVisible = true
      this.resetForm()
      if (!row) return
      this.form = Object.assign({}, this.form, row || {})
      this.form.isDefault = this.form.isDefault == null ? 0 : Number(this.form.isDefault)
    },
    submit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const req = Object.assign({}, this.form)
        // 自动处理主机构：若未选主机构，默认取归属机构
        if (!req.mainOrgId) {
          req.mainOrgId = req.belongToId
        }
        const action = this.drawerMode === 'edit' ? updateChargingCustomerCar : addChargingCustomerCar
        action(req).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '保存成功')
            this.drawerVisible = false
            this.loadList()
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        })
      })
    },
    handleBatchCommand(command) {
      if (command === 'batchImport') {
        if (!this.hasPerm(':charging:customer:car:import')) return
        this.importDrawerVisible = true
        this.resetImport()
      }
      if (command === 'batchDelete') this.batchDelete()
    },
    beforeExcelUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 5
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 5MB!')
      }
      return isLt10M
    },
    handleUpload(file) {
      if (!this.batchImportForm.belongToId) {
        this.$message.warning('请先选择归属客户')
        return
      }
      const formData = new FormData()
      formData.append('file', file.file)
      this.batchSaving = true
      uploadCarFile(formData).then(res => {
        if (res.code === 200 && res.data && res.data.name) {
          // 上传成功，进行预览
          previewCarImport(res.data.name).then(previewRes => {
            this.batchSaving = false
            if (previewRes.code === 200) {
              this.previewData = previewRes.data || []
              if (!this.previewData.length) {
                this.$message.warning('Excel 文件中未发现有效数据')
              }
            } else {
              this.$message.error(previewRes.msg || '预览解析失败')
            }
          }).catch(() => {
            this.batchSaving = false
          })
        } else {
          this.batchSaving = false
          this.$message.error(res.msg || '文件上传失败')
        }
      }).catch(() => {
        this.batchSaving = false
      })
    },
    confirmImport() {
      if (!this.previewData.length) return
      this.batchSaving = true
      submitCarImport({
        belongToId: this.batchImportForm.belongToId,
        carData: this.previewData
      }).then(res => {
        this.batchSaving = false
        if (res.code === 200) {
          this.$message.success('导入成功')
          this.importDrawerVisible = false
          this.loadList()
        } else {
          this.$message.error(res.msg || '导入失败')
        }
      }).catch(() => {
        this.batchSaving = false
      })
    },
    resetImport() {
      this.previewData = []
      this.batchImportForm.belongToId = null
      this.importQuery.page = 1
    },
    downloadTemplate() {
      downloadCarTemplate().then(res => {
        const blob = new Blob([res])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '客户车辆导入模板.xlsx'
        link.click()
      })
    },
    batchDelete() {
      if (!this.hasPerm(':charging:customer:car:delete')) return
      if (!this.selectedIds.length) {
        this.$message.warning('请选择要删除的数据')
        return
      }
      this.$confirm('确认删除选中的车辆吗？', '提示', { type: 'warning' }).then(() => {
        batchDeleteChargingCustomerCar({ ids: this.selectedIds }).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '删除成功')
            this.loadList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
      }).catch(() => {})
    },
    download() {
      if (!this.hasPerm(':charging:customer:car:export')) return
      this.exportLoading = true
      const req = Object.assign({}, this.query, { page: 1, limit: 5000 })
      downloadChargingCustomerCar(req).then(res => {
        this.exportLoading = false
        if (res.code === 200 && res.data && res.data.id) {
          this.$refs.downloadProgress.open(res.data.id)
        } else {
          this.$message.error(res.msg || '导出失败')
        }
      }).catch(() => {
        this.exportLoading = false
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.search-row, .action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.action-row {
  margin-top: 10px;
}
.drawer-body {
  padding: 0 20px 70px;
  overflow-y: auto;
  height: calc(100vh - 120px);
}
.car-uploader >>> .el-upload {
  width: 100%;
}
.car-uploader >>> .el-upload-dragger {
  width: 100%;
}
.drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
.batch-toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>

