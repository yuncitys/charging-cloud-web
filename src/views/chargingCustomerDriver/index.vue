<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="search-row">
        <el-input v-model="query.userName" class="filter-item" style="width: 180px;" placeholder="姓名" clearable />
        <el-input v-model="query.phoneNumber" class="filter-item" style="width: 180px;" placeholder="手机号" clearable />
        <el-select v-model="query.belongToId" class="filter-item" style="width: 200px;" placeholder="归属机构" clearable filterable>
          <el-option v-for="opt in belongToOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button class="filter-item" plain @click="resetQuery">清空</el-button>
      </div>

      <div class="action-row">
        <el-dropdown class="filter-item" trigger="click" @command="handleBatchCommand">
          <el-button type="primary">
            批量处理<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="batchImport">批量导入</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="openDrawer('create')">新增</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" fit highlight-current-row>
      <el-table-column type="index" label="序号" width="60" align="center">
        <template slot-scope="scope">{{ scope.$index + (query.page - 1) * query.limit + 1 }}</template>
      </el-table-column>
      <el-table-column prop="userAccount" label="用户账号" align="center" />
      <el-table-column prop="userName" label="姓名" align="center" />
      <el-table-column prop="phoneNumber" label="手机号" align="center" />
      <el-table-column prop="cash" label="余额(元)" align="center" />
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'info'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="belongToName" label="归属机构" align="center" show-overflow-tooltip />
      <el-table-column label="绑定车辆" align="center" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tag v-for="car in scope.row.cars" :key="car.id" size="mini" style="margin-right: 5px;">
            {{ car.plateNumber }}
          </el-tag>
          <span v-if="!scope.row.cars || !scope.row.cars.length">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
      </el-table-column>
      <el-table-column label="操作" width="320" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :type="scope.row.status === 0 ? 'warning' : 'success'"
            @click="handleStatusChange(scope.row)"
          >{{ scope.row.status === 0 ? '停用' : '启用' }}</el-button>
          <el-button size="mini" type="success" @click="openFinance(scope.row)">财务</el-button>
          <el-button size="mini" type="primary" @click="openDrawer('edit', scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
      size="600px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-body">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="用户账号" prop="userAccount">
            <el-input v-model="form.userAccount" :disabled="drawerMode === 'edit'" placeholder="请输入登录账号" />
          </el-form-item>
          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="form.userName" placeholder="请输入用户名称" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phoneNumber">
            <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" />
          </el-form-item>
          <!-- <el-form-item label="注册平台" prop="userPlatform">
            <el-select v-model="form.userPlatform" placeholder="请选择注册平台" style="width: 100%;">
              <el-option label="微信" :value="0" />
              <el-option label="支付宝" :value="1" />
              <el-option label="Web端" :value="2" />
            </el-select>
          </el-form-item> -->
          <el-form-item label="归属机构" prop="belongToId">
            <el-select v-model="form.belongToId" placeholder="请选择" filterable style="width: 100%;" :disabled="drawerMode === 'edit'" @change="onOrgChange">
              <el-option v-for="opt in belongToOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属地区" required>
            <div style="display: flex; gap: 5px;">
              <el-select v-model="form.provinceId" placeholder="省" style="flex: 1;" clearable @change="loadCities">
                <el-option v-for="item in provinceList" :key="item.id" :label="item.fullName" :value="item.id" />
              </el-select>
              <el-select v-model="form.regionId" placeholder="市" style="flex: 1;" clearable @change="loadCounties">
                <el-option v-for="item in cityList" :key="item.id" :label="item.fullName" :value="item.id" />
              </el-select>
              <el-select v-model="form.countyId" placeholder="区" style="flex: 1;" clearable>
                <el-option v-for="item in countyList" :key="item.id" :label="item.fullName" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item label="绑定车辆" prop="carIds">
            <el-select v-model="form.carIds" multiple placeholder="请先选择归属机构" style="width: 100%;" :disabled="!form.belongToId">
              <el-option v-for="car in orgCars" :key="car.id" :label="car.plateNumber" :value="car.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </div>
    </el-drawer>

    <el-drawer
      title="批量导入司机"
      :visible.sync="importDrawerVisible"
      size="650px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-body">
        <el-form label-width="110px">
          <el-form-item label="归属机构" required>
            <el-select v-model="batchImportForm.belongToId" placeholder="请选择归属机构" filterable style="width: 100%;">
              <el-option v-for="opt in belongToOrgOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="!previewData.length" label="司机数据" required>
            <el-upload
              class="driver-uploader"
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
              <el-table-column label="用户账号" prop="userAccount" width="120" align="center" />
              <el-table-column label="姓名" prop="userName" width="100" align="center" />
              <el-table-column label="手机号" prop="phoneNumber" width="120" align="center" />
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

    <el-drawer
      title="财务"
      :visible.sync="financeDrawerVisible"
      size="86%"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="finance-drawer-body">
        <div class="finance-cards">
          <div class="finance-card finance-card-org">
            <img :src="userImg" class="finance-card-icon" alt="" />
            <div class="finance-card-content">
              <div class="finance-card-title">{{ financeDriver.userName || financeDriver.userAccount || '-' }}</div>
              <div class="finance-card-sub">用户账号：{{ financeDriver.userAccount || '-' }}</div>
              <div class="finance-card-sub">手机号：{{ financeDriver.phoneNumber || '-' }}</div>
              <div class="finance-card-sub">归属机构：{{ financeDriver.belongToName || '-' }}</div>
            </div>
          </div>
          <div class="finance-card finance-card-wallet">
            <div class="finance-card-wallet-body">
              <img :src="walletImg" class="finance-card-icon" alt="" />
              <div class="finance-card-content">
                <div class="finance-card-sub">钱包余额（元）</div>
                <div class="finance-card-money">¥ {{ walletBalance }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="finance-section">
          <div class="finance-section-title">
            <span>资金流水</span>
            <el-button size="mini" type="primary" icon="el-icon-download" :loading="exportLoading" @click="exportFlow">导出</el-button>
          </div>

          <div class="finance-filter">
            <el-date-picker
              v-model="flowQuery.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              class="filter-item"
              style="width: 260px;"
              clearable
            />
            <el-input v-model="flowQuery.flowNo" class="filter-item" style="width: 190px;" placeholder="请输入流水号" clearable />
            <el-select v-model="flowQuery.flowType" class="filter-item" style="width: 190px;" placeholder="请选择流水类型" clearable>
              <el-option v-for="opt in flowTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-input v-model="flowQuery.flowObject" class="filter-item" style="width: 190px;" placeholder="请输入流水对象" clearable />
            <el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchFlow">确认</el-button>
            <el-button class="filter-item" plain @click="resetFlow">清空</el-button>
          </div>

          <el-table v-loading="flowLoading" :data="flowList" fit highlight-current-row>
            <el-table-column prop="flowNo" label="流水号" min-width="180" align="center" />
            <el-table-column prop="flowType" label="流水类型" min-width="120" align="center" />
            <el-table-column prop="flowObject" label="流水对象" min-width="140" align="center" />
            <el-table-column prop="flowTime" label="时间" min-width="160" align="center">
              <template slot-scope="scope">{{ scope.row.flowTime | formatDate }}</template>
            </el-table-column>
            <el-table-column prop="flowAmount" label="流水金额" min-width="120" align="center">
              <template slot-scope="scope">
                <span :class="Number(scope.row.flowAmount) < 0 ? 'money-out' : 'money-in'">{{ scope.row.flowAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="operatorAccount" label="操作账号" min-width="120" align="center" />
          </el-table>

          <div class="pagination-container">
            <el-pagination
              :current-page="flowQuery.page"
              :page-size="flowQuery.limit"
              :page-sizes="[10, 20, 30, 50]"
              :total="flowTotal"
              background
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="onFlowSizeChange"
              @current-change="onFlowCurrentChange"
            />
          </div>
        </div>
      </div>
      <div class="finance-drawer-footer">
        <el-button @click="financeDrawerVisible = false">关闭</el-button>
      </div>
    </el-drawer>
    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import { 
  getDriverPage, 
  getDriverFinanceWallet,
  getDriverFinanceFlowPage,
  downloadDriverFinanceFlow,
  saveDriver, 
  deleteDriver,
  updateDriverStatus,
  uploadDriverFile,
  previewDriverImport,
  submitDriverImport,
  downloadDriverTemplate
} from '@/api/chargingCustomer/chargingCustomerDriver'
import { getOrganizationOptions } from '@/api/organization/organization'
import { getCarListByOrgId } from '@/api/chargingCustomer/chargingCustomerCar'
import { getAreaSelector } from '@/api/area/index'
import dictData from '@/utils/dictData'
import downloadProgress from '@/components/Common/downloadProgress.vue'
import userImg from '@/assets/charging-customer/user.png'
import walletImg from '@/assets/charging-customer/wallet.png'

export default {
  name: 'ChargingCustomerDriver',
  components: {
    downloadProgress
  },
  data() {
    return {
      loading: false,
      saving: false,
      total: 0,
      list: [],
      belongToOrgOptions: [],
      orgCars: [],
      provinceList: [],
      cityList: [],
      countyList: [],
      query: {
        page: 1,
        limit: 10,
        userName: '',
        phoneNumber: '',
        belongToId: ''
      },
      drawerVisible: false,
      drawerMode: 'create',
      form: {
        id: null,
        userAccount: '',
        userName: '',
        phoneNumber: '',
        userPlatform: 2,
        belongToId: null,
        provinceId: '',
        regionId: '',
        countyId: '',
        carIds: []
      },
      rules: {
        userAccount: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
        userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phoneNumber: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { validator: this.validatePhone, trigger: 'blur' }],
        // userPlatform: [{ required: true, message: '请选择注册平台', trigger: 'change' }],
        belongToId: [{ required: true, message: '请选择归属机构', trigger: 'change' }]
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
      },
      financeDrawerVisible: false,
      financeDriver: {},
      walletBalance: '0.00',
      flowLoading: false,
      exportLoading: false,
      flowList: [],
      flowTotal: 0,
      flowQuery: {
        page: 1,
        limit: 10,
        dateRange: [],
        flowNo: '',
        flowType: '',
        flowObject: ''
      },
      flowTypeOptions: dictData.getFinanceUserFlowTypeOptions(),
      userImg,
      walletImg
    }
  },
  filters: {
    formatDate(v) {
      return v ? parseTime(v) : ''
    }
  },
  computed: {
    drawerTitle() {
      return this.drawerMode === 'edit' ? '客户司机编辑' : '客户司机新增'
    },
    pagedPreviewData() {
      const start = (this.importQuery.page - 1) * this.importQuery.limit
      const end = start + this.importQuery.limit
      return this.previewData.slice(start, end)
    }
  },
  created() {
    this.loadList()
    this.loadOrgOptions()
    this.loadProvinces()
  },
  methods: {
    loadOrgOptions() {
      getOrganizationOptions({}).then(res => {
        if (res.code === 200) {
          this.belongToOrgOptions = res.data || []
        }
      })
    },
    loadProvinces() {
      getAreaSelector('-1').then(res => {
        const data = res && res.data
        this.provinceList = Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : [])
      }).catch(() => {
        this.provinceList = []
      })
    },
    loadCities(provinceId, options = {}) {
      const shouldReset = options.reset !== false
      if (shouldReset) {
        this.form.regionId = ''
        this.form.countyId = ''
      }
      this.cityList = []
      this.countyList = []
      if (!provinceId) {
        return Promise.resolve([])
      }
      return getAreaSelector(provinceId).then(res => {
        const data = res && res.data
        this.cityList = Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : [])
        return this.cityList
      }).catch(() => {
        this.cityList = []
        return []
      })
    },
    loadCounties(cityId, options = {}) {
      const shouldReset = options.reset !== false
      if (shouldReset) {
        this.form.countyId = ''
      }
      this.countyList = []
      if (!cityId) {
        return Promise.resolve([])
      }
      return getAreaSelector(cityId).then(res => {
        const data = res && res.data
        this.countyList = Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : [])
        return this.countyList
      }).catch(() => {
        this.countyList = []
        return []
      })
    },
    loadList() {
      this.loading = true
      getDriverPage(this.query).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        }
      }).catch(() => { this.loading = false })
    },
    search() {
      this.query.page = 1
      this.loadList()
    },
    resetQuery() {
      this.query = {
        page: 1,
        limit: 10,
        userName: '',
        phoneNumber: '',
        belongToId: ''
      }
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
    onOrgChange(val) {
      this.form.carIds = []
      this.orgCars = []
      if (val) {
        getCarListByOrgId(val).then(res => {
          if (res.code === 200) {
            this.orgCars = res.data || []
          }
        })
      }
    },
    openDrawer(mode, row) {
      this.drawerMode = mode
      this.drawerVisible = true
      this.orgCars = []
      this.cityList = []
      this.countyList = []
      if (mode === 'create') {
        this.form = {
          id: null,
          userAccount: '',
          userName: '',
          phoneNumber: '',
          userPlatform: 2,
          belongToId: null,
          provinceId: '',
          regionId: '',
          countyId: '',
          carIds: []
        }
        this.$nextTick(() => { this.$refs.formRef && this.$refs.formRef.clearValidate() })
      } else {
        this.form = {
          id: row.id,
          userAccount: row.userAccount,
          userName: row.userName,
          phoneNumber: row.phoneNumber,
          userPlatform: row.userPlatform === null || row.userPlatform === undefined ? 2 : row.userPlatform,
          belongToId: row.belongToId,
          provinceId: row.provinceId,
          regionId: row.regionId,
          countyId: row.countyId,
          carIds: (row.cars || []).map(c => c.id)
        }
        if (row.provinceId) {
          this.loadCities(row.provinceId, { reset: false }).then(() => {
            this.form.regionId = row.regionId || ''
            if (row.regionId) {
              return this.loadCounties(row.regionId, { reset: false })
            }
            return Promise.resolve()
          }).then(() => {
            this.form.countyId = row.countyId || ''
          })
        }
        if (row.belongToId) {
          getCarListByOrgId(row.belongToId).then(res => {
            if (res.code === 200) {
              this.orgCars = res.data || []
            }
          })
        }
      }
    },
    submit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.saving = true
        saveDriver(this.form).then(res => {
          this.saving = false
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.drawerVisible = false
            this.loadList()
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => { this.saving = false })
      })
    },
    validatePhone(rule, value, callback) {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!value) {
        callback(new Error('请输入手机号'))
        return
      }
      if (!phoneRegex.test(value)) {
        callback(new Error('请输入正确的手机号'))
        return
      }
      callback()
    },
    handleStatusChange(row) {
      const targetStatus = row.status === 0 ? 1 : 0
      const actionText = targetStatus === 0 ? '启用' : '停用'
      this.$confirm(`确认${actionText}司机 ${row.userName} 吗？`, '提示', { type: 'warning' }).then(() => {
        updateDriverStatus({ id: row.id, status: targetStatus }).then(res => {
          if (res.code === 200) {
            this.$message.success(`${actionText}成功`)
            this.loadList()
          } else {
            this.$message.error(res.msg || `${actionText}失败`)
          }
        })
      }).catch(() => {})
    },
    handleDelete(row) {
      this.$confirm(`确认删除司机 ${row.userName} 吗？`, '提示', { type: 'warning' }).then(() => {
        deleteDriver(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
      }).catch(() => {})
    },
    handleBatchCommand(command) {
      if (command === 'batchImport') {
        this.importDrawerVisible = true
        this.resetImport()
      }
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
        this.$message.warning('请先选择归属机构')
        return
      }
      const formData = new FormData()
      formData.append('file', file.file)
      this.batchSaving = true
      uploadDriverFile(formData).then(res => {
        if (res.code === 200 && res.data && res.data.name) {
          previewDriverImport(res.data.name).then(previewRes => {
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
      submitDriverImport({
        belongToId: this.batchImportForm.belongToId,
        driverData: this.previewData
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
      downloadDriverTemplate().then(res => {
        const blob = new Blob([res])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '客户司机导入模板.xlsx'
        link.click()
      })
    },
    openFinance(row) {
      this.financeDriver = Object.assign({}, row || {})
      this.financeDrawerVisible = true
      this.flowQuery.page = 1
      this.loadDriverWallet()
      this.loadDriverFlow()
    },
    loadDriverWallet() {
      if (!this.financeDriver || !this.financeDriver.id) return
      getDriverFinanceWallet(this.financeDriver.id).then(res => {
        if (res.code === 200) {
          const v = res.data && res.data.walletBalance != null ? res.data.walletBalance : 0
          this.walletBalance = Number(v).toFixed(2)
        } else {
          this.$message.error(res.msg || '查询钱包失败')
        }
      })
    },
    buildDriverFlowReq() {
      const range = this.flowQuery.dateRange || []
      const startTime = range && range.length === 2 ? `${range[0]} 00:00:00` : ''
      const endTime = range && range.length === 2 ? `${range[1]} 23:59:59` : ''
      return {
        userId: this.financeDriver.id,
        page: this.flowQuery.page,
        limit: this.flowQuery.limit,
        startTime,
        endTime,
        flowNo: this.flowQuery.flowNo,
        flowType: this.flowQuery.flowType,
        flowObject: this.flowQuery.flowObject
      }
    },
    loadDriverFlow() {
      if (!this.financeDriver || !this.financeDriver.id) return
      this.flowLoading = true
      getDriverFinanceFlowPage(this.buildDriverFlowReq()).then(res => {
        this.flowLoading = false
        if (res.code === 200) {
          this.flowList = res.data || []
          this.flowTotal = res.count || 0
        } else {
          this.$message.error(res.msg || '查询资金流水失败')
        }
      }).catch(() => {
        this.flowLoading = false
      })
    },
    searchFlow() {
      this.flowQuery.page = 1
      this.loadDriverFlow()
    },
    resetFlow() {
      this.flowQuery = Object.assign({}, this.flowQuery, {
        page: 1,
        limit: 10,
        dateRange: [],
        flowNo: '',
        flowType: '',
        flowObject: ''
      })
      this.loadDriverFlow()
    },
    onFlowSizeChange(val) {
      this.flowQuery.limit = val
      this.flowQuery.page = 1
      this.loadDriverFlow()
    },
    onFlowCurrentChange(val) {
      this.flowQuery.page = val
      this.loadDriverFlow()
    },
    exportFlow() {
      if (!this.financeDriver || !this.financeDriver.id) {
        this.$message.error('司机信息缺失，无法导出')
        return
      }
      this.exportLoading = true
      const req = Object.assign({}, this.buildDriverFlowReq(), { page: 1, limit: 5000 })
      downloadDriverFinanceFlow(req).then(res => {
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
.driver-uploader >>> .el-upload {
  width: 100%;
}
.driver-uploader >>> .el-upload-dragger {
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

.finance-drawer-body {
  padding: 16px 20px 76px;
  overflow-y: auto;
  height: calc(100vh - 120px);
}
.finance-drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
.finance-cards {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
}
.finance-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  min-height: 100px;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .finance-cards {
    grid-template-columns: 1fr;
  }
}
.finance-card-wallet {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.finance-card-wallet-body {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}
.finance-card-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}
.finance-card-content {
  flex: 1;
  min-width: 0;
}
.finance-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.finance-card-sub {
  font-size: 13px;
  color: #606266;
  line-height: 18px;
}
.finance-card-money {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}
.finance-section {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 14px 14px 6px;
}
.finance-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 10px;
  font-weight: 600;
  color: #303133;
}
.finance-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  padding: 0 4px;
}
.money-in {
  color: #67c23a;
}
.money-out {
  color: #f56c6c;
}
</style>
