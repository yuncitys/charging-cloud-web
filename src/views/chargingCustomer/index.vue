<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="query.organizationName" class="filter-item" style="width: 180px;" placeholder="客户名称" clearable />
      <el-input v-model="query.companyName" class="filter-item" style="width: 180px;" placeholder="公司名称" clearable />
      <el-input v-model="query.administratorName" class="filter-item" style="width: 180px;" placeholder="管理员" clearable />
      <el-input v-model="query.administratorPhone" class="filter-item" style="width: 180px;" placeholder="联系方式" clearable />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="openDrawer('create')">新增客户</el-button>
    </div>

    <el-table v-loading="loading" :data="list" fit highlight-current-row>
      <el-table-column type="index" label="序号" width="60" align="center">
        <template slot-scope="scope">{{ scope.$index + (query.page - 1) * query.limit + 1 }}</template>
      </el-table-column>
      <el-table-column prop="name" label="客户名称" align="center" />
      <el-table-column prop="companyName" label="公司名称" align="center" />
      <el-table-column prop="socialCreditCode" label="统一社会信用代码" min-width="180" align="center" />
      <el-table-column prop="manageName" label="管理员" align="center" />
      <el-table-column prop="contactInfo" label="联系方式" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="openDrawer('detail', scope.row)">详情</el-button>
          <el-button size="mini" type="warning" @click="openDrawer('edit', scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="openFinance(scope.row)">财务</el-button>
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
      size="820px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-body">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="form.name" :disabled="isDetail" />
          </el-form-item>
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="form.companyName" :disabled="isDetail" />
          </el-form-item>
          <el-form-item label="社会信用代码" prop="socialCreditCode">
            <el-input v-model="form.socialCreditCode" :disabled="isDetail || drawerMode === 'edit'" />
          </el-form-item>
          <el-form-item label="管理员" prop="manageName">
            <el-input v-model="form.manageName" :disabled="isDetail" />
          </el-form-item>
          <el-form-item label="联系方式" prop="contactInfo">
            <el-input v-model="form.contactInfo" :disabled="isDetail" />
          </el-form-item>
          <el-form-item label="机构类型" prop="orgType">
            <el-radio-group v-model="form.orgType" :disabled="isDetail">
              <el-radio :label="1">客户机构</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="电站维度">
            <el-radio-group v-model="form.stationScopeType" :disabled="true">
              <el-radio :label="2">按电站</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="可用站点" prop="dataId">
            <el-input v-model="searchKey" placeholder="输入关键字过滤站点" clearable class="station-search" :disabled="isDetail" />
            <div :class="['station-tree-wrap', { 'is-disabled': isDetail }]">
              <el-tree
                ref="stationTree"
                :data="stationTreeData"
                node-key="id"
                show-checkbox
                :props="treeProps"
                :filter-node-method="filterTreeNode"
                @check-change="onTreeCheck"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button v-if="!isDetail" type="primary" @click="submit">保存</el-button>
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
            <img :src="organizationImg" class="finance-card-icon" alt="" />
            <div class="finance-card-content">
              <div class="finance-card-title">{{ financeCustomer.name || '-' }}</div>
              <div class="finance-card-sub">公司名称：{{ financeCustomer.companyName || '-' }}</div>
              <div class="finance-card-sub">管理员：{{ financeCustomer.manageName || '-' }}</div>
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
            <div class="finance-card-actions-side">
              <el-button size="small" type="primary" @click="openWalletAdjust">钱包充扣</el-button>
              <el-button size="small" type="warning" @click="openAllocationAdjust">分配扣回</el-button>
            </div>
          </div>
        </div>

        <div class="finance-section">
          <div class="finance-section-title">
            <span>资金流水</span>
            <el-button size="mini" type="primary" icon="el-icon-download" @click="exportFlow">导出</el-button>
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

    <el-drawer
      :title="walletAdjustTitle"
      :visible.sync="walletAdjustDrawerVisible"
      size="420px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="adjust-drawer-body">
        <el-form ref="walletAdjustRef" :model="walletAdjustForm" label-width="90px">
          <el-form-item label="操作">
            <el-radio-group v-model="walletAdjustForm.action">
              <el-radio label="RECHARGE">充值</el-radio>
              <el-radio label="DEDUCT">扣款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="金额">
            <el-input v-model="walletAdjustForm.amount" placeholder="请输入金额" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="walletAdjustForm.remark" type="textarea" :rows="3" placeholder="可选" />
          </el-form-item>
        </el-form>
      </div>
      <div class="adjust-drawer-footer">
        <el-button @click="walletAdjustDrawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="walletAdjustLoading" @click="submitWalletAdjust">确定</el-button>
      </div>
    </el-drawer>

    <el-drawer
      :title="allocationAdjustTitle"
      :visible.sync="allocationAdjustDrawerVisible"
      size="640px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="adjust-drawer-body">
        <el-form ref="allocationAdjustRef" :model="allocationAdjustForm" label-width="110px">
          <el-form-item label="客户名称">
            <span>{{ financeCustomer.name || '-' }}</span>
          </el-form-item>
          <el-form-item label="可分配金额">
            <div class="allocation-wallet">{{ walletBalance }} 元</div>
          </el-form-item>
          <el-form-item label="操作模式">
            <div class="allocation-mode-wrap">
              <el-radio-group v-model="allocationAdjustForm.operationMode">
                <el-radio label="EQUAL">等额</el-radio>
                <el-radio label="REPLENISH">补齐</el-radio>
              </el-radio-group>
              <div v-if="allocationAdjustForm.operationMode === 'EQUAL'" class="allocation-mode-tip">
                <p class="allocation-mode-tip-title">等额：每位选中用户变动相同金额</p>
                <ul class="allocation-mode-tip-list">
                  <li><strong>正数</strong>为分配：每人增加相同金额，请确认上方「可分配金额」充足。</li>
                  <li><strong>负数</strong>为扣回：每人按相同额度扣回；若某人余额不足，将<strong>扣尽其有效余额</strong>，其余人仍按规则扣款，不会因单人不足而整单失败。</li>
                </ul>
              </div>
              <div v-else class="allocation-mode-tip">
                <p class="allocation-mode-tip-title">补齐：按「目标余额」拉齐每人账户</p>
                <ul class="allocation-mode-tip-list">
                  <li>金额的<strong>绝对值</strong>表示目标余额；<strong>正负号</strong>表示方向（正数分配、负数扣回）。</li>
                  <li><strong>正数</strong>：余额低于目标的用户会加到目标，已达或超过的不变。</li>
                  <li><strong>负数</strong>：余额高于目标的会扣到目标，已在目标及以下不变。</li>
                  <li>与等额不同，此处不是「每人固定加减同一数额」，而是统一到同一条余额线。</li>
                </ul>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="设置金额">
            <el-input v-model="allocationAdjustForm.amount" :placeholder="allocationAmountPlaceholder">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="选择对象">
            <div class="allocation-user-panel">
              <div class="allocation-user-toolbar">
                <el-checkbox :value="allocationAllChecked" @change="toggleSelectAllAllocationUsers">全选</el-checkbox>
                <el-input v-model="allocationUserKeyword" placeholder="请输入关键字进行过滤" clearable class="allocation-user-search" />
              </div>
              <el-checkbox-group v-model="allocationAdjustForm.targetIds" class="allocation-user-list">
                <el-checkbox v-for="item in filteredAllocationUsers" :key="item.id" :label="item.id" class="allocation-user-item">
                  {{ item.userAccount }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="allocationAdjustForm.remark" type="textarea" :rows="3" placeholder="可选" />
          </el-form-item>
        </el-form>
      </div>
      <div class="adjust-drawer-footer">
        <el-button @click="allocationAdjustDrawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="allocationAdjustLoading" @click="submitAllocationAdjust">确定</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index'
import { export_json_to_excel } from '@/vendor/Export2Excel'
import { getChargeStationTreeByMerchant } from '@/api/netWorkDot/netWorkDotList'
import {
  addChargingCustomer,
  adjustChargingCustomerAllocation,
  adjustChargingCustomerWallet,
  getChargingCustomerAllocationUsers,
  getChargingCustomerFinanceFlowPage,
  getChargingCustomerFinanceWallet,
  getChargingCustomerDetail,
  getChargingCustomerPage,
  updateChargingCustomer
} from '@/api/chargingCustomer/index'
import organizationImg from '@/assets/charging-customer/organization.png'
import walletImg from '@/assets/charging-customer/wallet.png'

export default {
  name: 'ChargingCustomer',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      query: {
        page: 1,
        limit: 10,
        organizationName: '',
        companyName: '',
        administratorName: '',
        administratorPhone: ''
      },
      drawerVisible: false,
      drawerMode: 'create',
      form: {
        id: null,
        name: '',
        companyName: '',
        socialCreditCode: '',
        manageName: '',
        contactInfo: '',
        orgType: 1,
        stationScopeType: 2,
        dataId: []
      },
      rules: {
        name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
        companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
        socialCreditCode: [{ required: true, message: '请输入统一社会信用代码', trigger: 'blur' }],
        manageName: [{ required: true, message: '请输入管理员', trigger: 'blur' }],
        contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
        dataId: [{ required: true, message: '请选择站点', trigger: 'change' }]
      },
      stationTreeData: [],
      treeProps: { children: 'children', label: 'label' },
      searchKey: '',
      financeDrawerVisible: false,
      financeCustomer: {},
      walletBalance: '0.00',
      flowLoading: false,
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
      walletAdjustDrawerVisible: false,
      walletAdjustLoading: false,
      walletAdjustForm: {
        action: 'RECHARGE',
        amount: '',
        remark: ''
      },
      allocationAdjustDrawerVisible: false,
      allocationAdjustLoading: false,
      allocationAdjustForm: {
        operationObject: 'CHARGING_USER',
        operationMode: 'EQUAL',
        amount: '',
        targetIds: [],
        remark: ''
      },
      allocationUsers: [],
      allocationUserKeyword: '',
      flowTypeOptions: [
        { label: '后台充值', value: '后台充值' },
        { label: '后台扣款', value: '后台扣款' },
        { label: '分配给用户', value: '分配给用户' },
        { label: '分配扣回', value: '分配扣回' }
      ],
      organizationImg,
      walletImg
    }
  },
  computed: {
    isDetail() {
      return this.drawerMode === 'detail'
    },
    drawerTitle() {
      if (this.drawerMode === 'edit') return '编辑充电客户'
      if (this.drawerMode === 'detail') return '充电客户详情'
      return '新增充电客户'
    },
    walletAdjustTitle() {
      return '钱包充扣'
    },
    allocationAdjustTitle() {
      return '分配扣回'
    },
    allocationAmountPlaceholder() {
      return this.allocationAdjustForm.operationMode === 'EQUAL'
        ? '正数：每人增加；负数：每人扣回（不足则扣至0）'
        : '绝对值为目标余额；正数分配补齐，负数扣回补齐'
    },
    filteredAllocationUsers() {
      const keyword = String(this.allocationUserKeyword || '').trim().toLowerCase()
      if (!keyword) return this.allocationUsers
      return this.allocationUsers.filter(item => String(item.userAccount || '').toLowerCase().indexOf(keyword) > -1)
    },
    allocationAllChecked() {
      if (!this.filteredAllocationUsers.length) return false
      const selectedSet = new Set(this.allocationAdjustForm.targetIds || [])
      return this.filteredAllocationUsers.every(item => selectedSet.has(item.id))
    }
  },
  watch: {
    searchKey(val) {
      if (this.$refs.stationTree) this.$refs.stationTree.filter(val)
    }
  },
  filters: {
    formatDate(v) {
      return v ? parseTime(v) : ''
    }
  },
  created() {
    this.loadList()
    this.loadStationTree()
  },
  methods: {
    filterTreeNode(value, data) {
      if (!value) return true
      return String(data.label || '').indexOf(value) > -1
    },
    onTreeCheck() {
      if (this.isDetail) return
      if (!this.$refs.stationTree) return
      const keys = this.$refs.stationTree.getCheckedKeys()
      this.form.dataId = keys.filter(k => typeof k === 'number' || /^\d+$/.test(String(k))).map(v => Number(v))
    },
    loadStationTree() {
      getChargeStationTreeByMerchant({}).then(res => {
        if (res.code !== 200) return
        this.stationTreeData = (res.data || []).map(merchant => ({
          id: `merchant-${merchant.id}`,
          label: merchant.name,
          children: (merchant.chargingStationInfoVoList || []).map(station => ({
            id: Number(station.id),
            label: station.networkName
          }))
        }))
      })
    },
    loadList() {
      this.loading = true
      const req = Object.assign({}, this.query, {
        orgMold: 1,
        orgType: '1,2'
      })
      getChargingCustomerPage(req).then(res => {
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
    onSizeChange(val) {
      this.query.limit = val
      this.loadList()
    },
    onCurrentChange(val) {
      this.query.page = val
      this.loadList()
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        companyName: '',
        socialCreditCode: '',
        manageName: '',
        contactInfo: '',
        orgType: 1,
        stationScopeType: 2,
        dataId: []
      }
      this.searchKey = ''
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
        if (this.$refs.stationTree) this.$refs.stationTree.setCheckedKeys([])
      })
    },
    openDrawer(mode, row) {
      this.drawerMode = mode
      this.drawerVisible = true
      this.resetForm()
      if (!row) return
      getChargingCustomerDetail(row.id).then(res => {
        if (res.code !== 200) {
          this.$message.error(res.msg || '详情加载失败')
          return
        }
        this.form = Object.assign({}, this.form, res.data || {})
        this.form.stationScopeType = 2
        this.$nextTick(() => {
          if (this.$refs.stationTree) this.$refs.stationTree.setCheckedKeys(this.form.dataId || [])
        })
      })
    },
    submit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const req = Object.assign({}, this.form, { stationScopeType: 2 })
        const action = this.drawerMode === 'edit' ? updateChargingCustomer : addChargingCustomer
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
    openFinance(row) {
      this.financeCustomer = Object.assign({}, row || {})
      this.financeDrawerVisible = true
      this.flowQuery.page = 1
      this.loadWallet()
      this.loadFlow()
    },
    loadWallet() {
      if (!this.financeCustomer || !this.financeCustomer.id) return
      getChargingCustomerFinanceWallet(this.financeCustomer.id).then(res => {
        if (res.code === 200) {
          const v = res.data && res.data.walletBalance != null ? res.data.walletBalance : 0
          this.walletBalance = Number(v).toFixed(2)
        } else {
          this.$message.error(res.msg || '查询钱包失败')
        }
      })
    },
    buildFlowReq() {
      const range = this.flowQuery.dateRange || []
      const startTime = range && range.length === 2 ? `${range[0]} 00:00:00` : ''
      const endTime = range && range.length === 2 ? `${range[1]} 23:59:59` : ''
      return {
        organizationId: this.financeCustomer.id,
        page: this.flowQuery.page,
        limit: this.flowQuery.limit,
        startTime,
        endTime,
        flowNo: this.flowQuery.flowNo,
        flowType: this.flowQuery.flowType,
        flowObject: this.flowQuery.flowObject
      }
    },
    loadFlow() {
      if (!this.financeCustomer || !this.financeCustomer.id) return
      this.flowLoading = true
      getChargingCustomerFinanceFlowPage(this.buildFlowReq()).then(res => {
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
      this.loadFlow()
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
      this.loadFlow()
    },
    onFlowSizeChange(val) {
      this.flowQuery.limit = val
      this.flowQuery.page = 1
      this.loadFlow()
    },
    onFlowCurrentChange(val) {
      this.flowQuery.page = val
      this.loadFlow()
    },
    openWalletAdjust() {
      this.walletAdjustForm = { action: 'RECHARGE', amount: '', remark: '' }
      this.walletAdjustDrawerVisible = true
    },
    submitWalletAdjust() {
      const amount = Number(this.walletAdjustForm.amount)
      if (!amount || amount <= 0) {
        this.$message.error('请输入正确的金额')
        return
      }
      this.walletAdjustLoading = true
      adjustChargingCustomerWallet({
        organizationId: this.financeCustomer.id,
        action: this.walletAdjustForm.action,
        amount,
        remark: this.walletAdjustForm.remark
      }).then(res => {
        this.walletAdjustLoading = false
        if (res.code === 200) {
          this.$message.success(res.msg || '操作成功')
          this.walletAdjustDrawerVisible = false
          this.loadWallet()
          this.loadFlow()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      }).catch(() => {
        this.walletAdjustLoading = false
      })
    },
    openAllocationAdjust() {
      this.allocationAdjustForm = { operationObject: 'CHARGING_USER', operationMode: 'EQUAL', amount: '', targetIds: [], remark: '' }
      this.allocationUserKeyword = ''
      this.allocationUsers = []
      this.loadAllocationUsers()
      this.allocationAdjustDrawerVisible = true
    },
    loadAllocationUsers() {
      if (!this.financeCustomer || !this.financeCustomer.id) return
      getChargingCustomerAllocationUsers(this.financeCustomer.id).then(res => {
        if (res.code === 200) {
          this.allocationUsers = res.data || []
        } else {
          this.$message.error(res.msg || '查询充电用户失败')
        }
      })
    },
    toggleSelectAllAllocationUsers(checked) {
      const filteredIds = this.filteredAllocationUsers.map(item => item.id)
      const selected = new Set(this.allocationAdjustForm.targetIds || [])
      if (checked) {
        filteredIds.forEach(id => selected.add(id))
      } else {
        filteredIds.forEach(id => selected.delete(id))
      }
      this.allocationAdjustForm.targetIds = Array.from(selected)
    },
    submitAllocationAdjust() {
      const raw = this.allocationAdjustForm.amount
      if (raw === '' || raw === null || raw === undefined) {
        this.$message.error('请输入金额（正数分配，负数扣回）')
        return
      }
      const amount = Number(raw)
      if (!Number.isFinite(amount) || amount === 0) {
        this.$message.error('请输入非0金额（正数分配，负数扣回）')
        return
      }
      if (!this.allocationAdjustForm.targetIds || !this.allocationAdjustForm.targetIds.length) {
        this.$message.error('请选择操作对象')
        return
      }
      this.allocationAdjustLoading = true
      adjustChargingCustomerAllocation({
        organizationId: this.financeCustomer.id,
        amount,
        operationObject: this.allocationAdjustForm.operationObject,
        operationMode: this.allocationAdjustForm.operationMode,
        targetIds: this.allocationAdjustForm.targetIds,
        remark: this.allocationAdjustForm.remark
      }).then(res => {
        this.allocationAdjustLoading = false
        if (res.code === 200) {
          this.$message.success(res.msg || '操作成功')
          this.allocationAdjustDrawerVisible = false
          this.loadWallet()
          this.loadFlow()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      }).catch(() => {
        this.allocationAdjustLoading = false
      })
    },
    exportFlow() {
      const header = ['流水号', '流水类型', '流水对象', '时间', '流水金额', '操作账号']
      const data = (this.flowList || []).map(row => ([
        row.flowNo || '',
        row.flowType || '',
        row.flowObject || '',
        row.flowTime ? parseTime(row.flowTime) : '',
        row.flowAmount != null ? String(row.flowAmount) : '',
        row.operatorAccount || ''
      ]))
      export_json_to_excel({
        header,
        data,
        filename: `资金流水_${this.financeCustomer && this.financeCustomer.name ? this.financeCustomer.name : ''}`
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.station-search {
  margin-bottom: 10px;
}
.station-tree-wrap.is-disabled {
  pointer-events: none;
  opacity: 0.75;
}
.drawer-body {
  padding: 0 20px 70px;
  overflow-y: auto;
  height: calc(100vh - 120px);
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
.finance-card-actions-side {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  margin: 0;
  min-width: 92px;
}
.finance-card-actions-side .el-button {
  margin: 0;
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
.adjust-drawer-body {
  padding: 16px 20px 70px;
  overflow-y: auto;
  height: calc(100vh - 120px);
}
.adjust-drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
.money-in {
  color: #67c23a;
}
.money-out {
  color: #f56c6c;
}
.allocation-wallet {
  height: 36px;
  line-height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #303133;
}
.allocation-mode-wrap {
  width: 100%;
}
.allocation-mode-tip {
  margin-top: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.55;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}
.allocation-mode-tip-title {
  margin: 0 0 6px;
  font-weight: 600;
  color: #303133;
}
.allocation-mode-tip-list {
  margin: 0;
  padding-left: 18px;
}
.allocation-mode-tip-list li {
  margin-bottom: 4px;
}
.allocation-mode-tip-list li:last-child {
  margin-bottom: 0;
}
.allocation-user-panel {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.allocation-user-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-bottom: 1px solid #ebeef5;
}
.allocation-user-search {
  flex: 1;
}
.allocation-user-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.allocation-user-item {
  margin: 0 0 2px;
  margin-right: 0 !important;
  height: auto;
  line-height: 1.35;
}
.allocation-user-item ::v-deep .el-checkbox__label {
  line-height: 1.35;
  padding-left: 6px;
}
</style>
