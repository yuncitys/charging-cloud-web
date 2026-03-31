<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form class="form left" ref="form" :model="searchForm" :inline="true" label-width="auto">
        <el-form-item label="">
          <el-input v-model="searchForm.stationName" placeholder="电站名称" clearable @keyup.enter.native="search"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.merchantId" clearable placeholder="归属商户" style="width: 220px">
            <el-option v-for="item in merchantList" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.collectFlag" clearable placeholder="是否抽成" style="width: 180px">
            <el-option :value="'1'" label="是" />
            <el-option :value="'0'" label="否" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:commissionStrategy:batchSave')"
            type="primary"
            icon="el-icon-setting"
            @click="onBatchSet"
          >
            批量设置
          </el-button>
        </el-form-item>
      </el-form>
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane v-for="item in ruleIdList" :key="item.id" :label="item.title" :name="item.id"></el-tab-pane>
      </el-tabs>

      <el-table
        v-loading="listLoading"
        :key="tableKey"
        :data="list"
        element-loading-text="拼命加载中......"
        fit
        highlight-current-row
        style="width: 100%;"
        align="center"
        id="tableBox"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="100" align="center" />
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column>
        <el-table-column prop="stationName" label="电站名称" align="center" width="280" show-overflow-tooltip></el-table-column>
        <el-table-column prop="merchantName" label="归属商户" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="collectFlag" label="是否收取抽成" align="center">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.collectFlag == '1'">是</el-tag>
            <el-tag type="info" v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="powerCommissionText" label="电费抽成" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="serviceCommissionText" label="服务费抽成" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updateUser" label="修改用户" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template v-slot="{row}">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:commissionStrategy:save')"
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="onEdit(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="searchForm.page"
          :page-sizes="[10,20,30, 50]"
          :page-size="searchForm.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog :visible.sync="editDialog.visible" title="抽成费用策略" @close="editDialog.visible = false" :append-to-body="true">
      <el-form ref="editForm" :model="editDialog.form" :rules="editRules" label-position="left" label-width="120px">
        <el-form-item label="电站名称">
          <el-input v-model="editDialog.form.stationName" disabled />
        </el-form-item>
        <el-form-item label="是否收取抽成" prop="collectFlag">
          <el-radio-group v-model="editDialog.form.collectFlag">
            <el-radio :label="'0'">否</el-radio>
            <el-radio :label="'1'">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="editDialog.form.collectFlag == '1'" label="电费抽成" prop="powerRate">
          <div class="flex" style="gap: 10px;">
            <el-select v-model="editDialog.form.powerRateType" style="width: 120px">
              <!-- <el-option :value="'0'" label="度数" /> -->
              <el-option :value="'1'" label="折扣" />
            </el-select>
            <el-input v-model="editDialog.form.powerRate" placeholder="请输入数值" type="number">
              <template slot="append">
                <span v-if="editDialog.form.powerRateType == '1'">%</span>
                <span v-else>元/度</span>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-if="editDialog.form.collectFlag == '1'" label="服务费抽成" prop="serviceRate">
          <div class="flex" style="gap: 10px;">
            <el-select v-model="editDialog.form.serviceRateType" style="width: 120px">
              <!-- <el-option :value="'0'" label="度数" /> -->
              <el-option :value="'1'" label="折扣" />
            </el-select>
            <el-input v-model="editDialog.form.serviceRate" placeholder="请输入数值" type="number">
              <template slot="append">
                <span v-if="editDialog.form.serviceRateType == '1'">%</span>
                <span v-else>元/度</span>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:commissionStrategy:save')"
            type="primary"
            @click="onEditSubmit"
          >
            确定
          </el-button>
          <el-button @click="editDialog.visible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="batchDialog.visible" title="批量设置抽成策略" @close="batchDialog.visible = false" :append-to-body="true">
      <div style="margin-bottom: 10px;">已选择站点：{{ selectedIds.length }} 个</div>
      <el-form ref="batchForm" :model="batchDialog.form" :rules="editRules" label-position="left" label-width="120px">
        <el-form-item label="是否收取抽成" prop="collectFlag">
          <el-radio-group v-model="batchDialog.form.collectFlag">
            <el-radio :label="'0'">否</el-radio>
            <el-radio :label="'1'">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchDialog.form.collectFlag == '1'" label="电费抽成" prop="powerRate">
          <div class="flex" style="gap: 10px;">
            <el-select v-model="batchDialog.form.powerRateType" style="width: 120px">
              <!-- <el-option :value="'0'" label="度数" /> -->
              <el-option :value="'1'" label="折扣" />
            </el-select>
            <el-input v-model="batchDialog.form.powerRate" placeholder="请输入数值" type="number">
              <template slot="append">
                <span v-if="batchDialog.form.powerRateType == '1'">%</span>
                <span v-else>元/度</span>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-if="batchDialog.form.collectFlag == '1'" label="服务费抽成" prop="serviceRate">
          <div class="flex" style="gap: 10px;">
            <el-select v-model="batchDialog.form.serviceRateType" style="width: 120px">
              <!-- <el-option :value="'0'" label="度数" /> -->
              <el-option :value="'1'" label="折扣" />
            </el-select>
            <el-input v-model="batchDialog.form.serviceRate" placeholder="请输入数值" type="number">
              <template slot="append">
                <span v-if="batchDialog.form.serviceRateType == '1'">%</span>
                <span v-else>元/度</span>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:commissionStrategy:batchSave')"
            type="primary"
            @click="onBatchSubmit"
          >
            确定
          </el-button>
          <el-button @click="batchDialog.visible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
  </template>

<script>
import { getList, getByStationId as getInfo, saveOrUpdate, batchSaveOrUpdate } from '@/api/finance/commissionStrategy'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'
import { getRuleIdTabs, getDefaultRuleIdTabName } from '@/utils/ruleIdTabs'
export default {
  name: 'CommissionStrategy',
  data() {
    return {
      activeName: getDefaultRuleIdTabName(),
      listLoading: false,
      tableKey: 0,
      page: 1,
      limit: 10,
      total: 0,
      list: [],
      merchantList: [],
      searchForm: {
        page: 1,
        limit: 10,
        stationName: '',
        merchantId: '',
        collectFlag: '',
        ruleId: getDefaultRuleIdTabName()
      },
      selectedIds: [],
      editDialog: {
        visible: false,
        form: {
          id: '',
          stationId: '',
          stationName: '',
          collectFlag: '0',
          powerRateType: '1',
          powerRate: '',
          serviceRateType: '1',
          serviceRate: ''
        }
      },
      batchDialog: {
        visible: false,
        form: {
          collectFlag: '0',
          powerRateType: '1',
          powerRate: '',
          serviceRateType: '1',
          serviceRate: ''
        }
      },
      editRules: {
        collectFlag: [{ required: true, message: '请选择是否收取抽成', trigger: 'blur' }],
        powerRate: [{ required: true, message: '请输入电费抽成', trigger: 'blur' }],
        serviceRate: [{ required: true, message: '请输入服务费抽成', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ruleIdList() {
      return getRuleIdTabs()
    }
  },
  filters: {
    formatDate: function(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  created() {
    this.initMerchant()
    this.search()
  },
  methods: {
    handleTabClick(tab) {
      this.searchForm.ruleId = tab.name
      this.searchForm.page = 1
      this.getLists()
    },
    initMerchant() {
      getMerchant().then(res => {
        if (res.code === 200) {
          this.merchantList = res.data || []
        }
      })
    },
    search() {
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      getList(this.searchForm).then(res => {
        if (res.code === 200) {
          const data = res.data || []
          this.list = data.map(item => ({
            ...item,
            powerCommissionText: this.formatCommission(item.powerRateType, item.powerRate),
            serviceCommissionText: this.formatCommission(item.serviceRateType, item.serviceRate)
          }))
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '加载失败')
        }
        this.listLoading = false
      })
    },
    formatCommission(type, value) {
      if (value === null || value === undefined || value === '') return ''
      if (type === '1') return `${value}%`
      return `${value} 元/度`
    },
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getLists()
    },
    onSelectionChange(rows) {
      this.selectedIds = rows.map(r => r.stationId || r.id)
    },
    onEdit(row) {
      getInfo(row.stationId || row.id).then(res => {
        const form = this.editDialog.form
        form.id = res.data?.id || row.id
        form.stationId = row.stationId || row.id
        form.stationName = row.stationName
        form.collectFlag = res.data?.collectFlag ?? row.collectFlag ?? '0'
        form.powerRateType = res.data?.powerRateType ?? row.powerRateType ?? '1'
        form.powerRate = res.data?.powerRate ?? row.powerRate ?? '0.00'
        form.serviceRateType = res.data?.serviceRateType ?? row.serviceRateType ?? '1'
        form.serviceRate = res.data?.serviceRate ?? row.serviceRate ?? '0.00'
        this.editDialog.visible = true
      }).catch(() => {
        const form = this.editDialog.form
        form.id = row.id
        form.stationId = row.stationId || row.id
        form.stationName = row.stationName
        form.collectFlag = row.collectFlag ?? '0'
        form.powerRateType = row.powerRateType ?? '1'
        form.powerRate = row.powerRate ?? '0.00'
        form.serviceRateType = row.serviceRateType ?? '1'
        form.serviceRate = row.serviceRate ?? '0.00'
        this.editDialog.visible = true
      })
    },
    onEditSubmit() {
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        const payload = { ...this.editDialog.form }
        saveOrUpdate(payload).then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.editDialog.visible = false
            this.getLists()
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        })
      })
    },
    onBatchSet() {
      if (!this.selectedIds.length) {
        this.$message.error('请选择需要批量设置的站点')
        return
      }
      this.batchDialog.visible = true
    },
    onBatchSubmit() {
      this.$refs.batchForm.validate(valid => {
        if (!valid) return
        const payload = { ids: this.selectedIds, ...this.batchDialog.form }
        batchSaveOrUpdate(payload).then(res => {
          if (res.code === 200) {
            this.$message.success('批量设置成功')
            this.batchDialog.visible = false
            this.getLists()
          } else {
            this.$message.error(res.msg || '批量设置失败')
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
