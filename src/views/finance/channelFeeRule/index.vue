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
          <el-select v-model="searchForm.collectFlag" clearable placeholder="是否收取通道费" style="width: 180px">
            <el-option :value="'1'" label="是" />
            <el-option :value="'0'" label="否" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:channelFeeRule:batchSave')"
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
        <el-table-column prop="collectFlag" label="是否收取通道费" align="center">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.collectFlag == '1'">是</el-tag>
            <el-tag type="info" v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channelFeeRateText" label="通道费率" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updateUser" label="修改用户" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template v-slot="{row}">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:channelFeeRule:save')"
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

    <el-drawer
      title="通道费收费规则"
      :visible.sync="editDialog.visible"
      custom-class="channel-fee-drawer"
      direction="rtl"
      size="480px"
      append-to-body
      @close="editDialog.visible = false"
    >
      <div class="channel-fee-drawer-body">
        <el-form ref="editForm" :model="editDialog.form" :rules="editRules" label-position="left" label-width="0">
          <div class="drawer-station-block">
            <div class="drawer-station-label">电站名称</div>
            <div class="drawer-station-name">{{ editDialog.form.stationName || '—' }}</div>
          </div>
          <el-alert
            class="channel-fee-tip"
            type="info"
            :closable="false"
            show-icon
            title="台行首次分账时，需按该支付单总额 × 费率将通道费计入平台商户。"
          />
          <el-form-item label="是否收取通道费" prop="collectFlag" label-width="130px">
            <el-radio-group v-model="editDialog.form.collectFlag">
              <el-radio :label="'0'">否</el-radio>
              <el-radio :label="'1'">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="editDialog.form.collectFlag == '1'" label="通道费率" prop="channelFeeRate" label-width="130px">
            <el-input v-model="editDialog.form.channelFeeRate" placeholder="默认0.25" type="number">
              <template slot="append">%（支付总额）</template>
            </el-input>
          </el-form-item>
          <el-form-item class="drawer-form-actions" label-width="0">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:channelFeeRule:save')"
              type="primary"
              @click="onEditSubmit"
            >
              确定
            </el-button>
            <el-button @click="editDialog.visible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <el-drawer
      title="批量设置通道费规则"
      :visible.sync="batchDialog.visible"
      custom-class="channel-fee-drawer"
      direction="rtl"
      size="480px"
      append-to-body
      @close="batchDialog.visible = false"
    >
      <div class="channel-fee-drawer-body">
        <div class="batch-selected-hint">已选择站点：{{ selectedIds.length }} 个</div>
        <el-form ref="batchForm" :model="batchDialog.form" :rules="editRules" label-position="left" label-width="130px">
          <el-form-item label="是否收取通道费" prop="collectFlag">
            <el-radio-group v-model="batchDialog.form.collectFlag">
              <el-radio :label="'0'">否</el-radio>
              <el-radio :label="'1'">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="batchDialog.form.collectFlag == '1'" label="通道费率" prop="channelFeeRate">
            <el-input v-model="batchDialog.form.channelFeeRate" placeholder="默认0.25" type="number">
              <template slot="append">%（支付总额）</template>
            </el-input>
          </el-form-item>
          <el-form-item class="drawer-form-actions" label-width="0">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:channelFeeRule:batchSave')"
              type="primary"
              @click="onBatchSubmit"
            >
              确定
            </el-button>
            <el-button @click="batchDialog.visible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getList, getByStationId as getInfo, saveOrUpdate, batchSaveOrUpdate } from '@/api/finance/channelFeeRule'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'
import { getRuleIdTabs, getDefaultRuleIdTabName } from '@/utils/ruleIdTabs'
export default {
  name: 'ChannelFeeRule',
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
          collectFlag: '1',
          channelFeeRate: '0.25'
        }
      },
      batchDialog: {
        visible: false,
        form: {
          collectFlag: '1',
          channelFeeRate: '0.25'
        }
      },
      editRules: {
        collectFlag: [{ required: true, message: '请选择是否收取通道费', trigger: 'blur' }],
        channelFeeRate: [{ required: true, message: '请输入通道费率', trigger: 'blur' }]
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
            channelFeeRateText: this.formatChannelFeeRate(item.collectFlag, item.channelFeeRate)
          }))
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '加载失败')
        }
        this.listLoading = false
      })
    },
    formatChannelFeeRate(collectFlag, rate) {
      if (collectFlag !== '1') return '-'
      if (rate === null || rate === undefined || rate === '') return ''
      return `${rate}%`
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
        form.id = res.data?.id || row.ruleId || ''
        form.stationId = row.stationId || row.id
        form.stationName = row.stationName
        form.collectFlag = res.data?.collectFlag ?? row.collectFlag ?? '1'
        form.channelFeeRate = res.data?.channelFeeRate ?? row.channelFeeRate ?? '0.25'
        this.editDialog.visible = true
      }).catch(() => {
        const form = this.editDialog.form
        form.id = row.ruleId || ''
        form.stationId = row.stationId || row.id
        form.stationName = row.stationName
        form.collectFlag = row.collectFlag ?? '1'
        form.channelFeeRate = row.channelFeeRate ?? '0.25'
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
        const entities = this.selectedIds.map(stationId => ({
          stationId,
          collectFlag: this.batchDialog.form.collectFlag,
          channelFeeRate: this.batchDialog.form.channelFeeRate
        }))
        batchSaveOrUpdate(entities).then(res => {
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
.channel-fee-drawer .el-drawer__body {
  padding: 12px 20px 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  -webkit-overflow-scrolling: touch;
}
</style>

<style scoped>
.channel-fee-drawer-body {
  max-width: 100%;
}
.drawer-station-block {
  margin-bottom: 16px;
  padding: 12px 14px;
  background: #f5f7fa;
  border-radius: 4px;
}
.drawer-station-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}
.drawer-station-name {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
  word-break: break-all;
}
.channel-fee-tip {
  margin-bottom: 16px;
}
.batch-selected-hint {
  margin: 0 0 12px;
  color: #606266;
  font-size: 14px;
}
.drawer-form-actions {
  margin-top: 24px;
  margin-bottom: 0;
}
</style>
