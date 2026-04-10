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
          <el-select v-model="searchForm.settlementCycleType" clearable placeholder="结算周期" style="width: 180px">
            <el-option v-for="opt in cycleOptions" :key="opt.value" :value="opt.value" :label="opt.filterLabel" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.settlementMode" clearable placeholder="结算方式" style="width: 140px">
            <el-option :value="1" label="自动" />
            <el-option :value="2" label="手动" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:stationSettlementRule:batchSave')"
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
        <el-table-column type="selection" width="100" align="center" :selectable="isRowSelectable" />
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (searchForm.page - 1) * searchForm.limit + 1 }} </span></template>
        </el-table-column>
        <el-table-column prop="stationName" label="电站名称" align="center" width="280" show-overflow-tooltip></el-table-column>
        <el-table-column prop="merchantName" label="归属商户" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="settlementCycleType" label="结算周期" align="center" width="140">
          <template slot-scope="scope">
            <span>{{ cycleLabel(scope.row.settlementCycleType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="settlementMode" label="结算方式" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ modeLabel(scope.row.settlementMode) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="modifyCount" label="本月修改次数" align="center" width="120" /> -->
        <el-table-column prop="updateUser" label="修改用户" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template v-slot="{row}">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:stationSettlementRule:save')"
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

    <el-dialog
      :visible.sync="editDialog.visible"
      title="修改结算周期"
      custom-class="settlement-cycle-dialog"
      @close="editDialog.visible = false"
      :append-to-body="true"
      width="520px"
    >
      <el-form ref="editForm" :model="editDialog.form" :rules="editRules" label-position="left" label-width="0">
        <div class="dialog-station-block">
          <div class="dialog-station-label">电站名称</div>
          <div class="dialog-station-name">{{ editDialog.form.stationName || '—' }}</div>
        </div>
        <el-alert
          class="settlement-cycle-tip"
          type="info"
          :closable="false"
          show-icon
          title="设置后，当天及后续的结算按照该周期进行，每个自然月仅可修改一次。"
        />
        <el-form-item prop="settlementCycleType" class="cycle-form-item" label-width="0">
          <div class="cycle-card-list">
            <div
              v-for="opt in cycleOptions"
              :key="opt.value"
              class="cycle-card"
              :class="{ 'is-selected': editDialog.form.settlementCycleType === opt.value }"
              @click="selectCycle('edit', opt.value)"
            >
              <div class="cycle-card-title">{{ opt.title }}</div>
              <div class="cycle-card-desc">{{ opt.desc }}</div>
              <div v-show="editDialog.form.settlementCycleType === opt.value" class="cycle-card-corner-wrap">
                <i class="el-icon-check cycle-card-check" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="settlementMode" class="mode-form-item" label-width="0">
          <div class="mode-section-label">结算方式</div>
          <div class="mode-card-row">
            <div
              v-for="m in modeOptions"
              :key="'e-mode-' + m.value"
              class="mode-card"
              :class="{ 'is-selected': editDialog.form.settlementMode === m.value }"
              @click="selectMode('edit', m.value)"
            >
              <div class="mode-card-title">{{ m.title }}</div>
              <div class="mode-card-desc">{{ m.desc }}</div>
              <div v-show="editDialog.form.settlementMode === m.value" class="mode-card-corner-wrap">
                <i class="el-icon-check mode-card-check" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item class="dialog-actions" label-width="0">
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:stationSettlementRule:save')"
            type="primary"
            @click="onEditSubmit"
          >
            确定
          </el-button>
          <el-button @click="editDialog.visible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      :visible.sync="batchDialog.visible"
      title="批量修改结算周期"
      custom-class="settlement-cycle-dialog"
      @close="batchDialog.visible = false"
      :append-to-body="true"
      width="520px"
    >
      <div class="batch-selected-hint">已选择站点：{{ selectedStationIds.length }} 个</div>
      <el-form ref="batchForm" :model="batchDialog.form" :rules="editRules" label-position="left" label-width="0">
        <el-alert
          class="settlement-cycle-tip"
          type="info"
          :closable="false"
          show-icon
          title="设置后，当天及后续的结算按照该周期进行，每个自然月仅可修改一次。"
        />
        <el-form-item prop="settlementCycleType" class="cycle-form-item" label-width="0">
          <div class="cycle-card-list">
            <div
              v-for="opt in cycleOptions"
              :key="'b-' + opt.value"
              class="cycle-card"
              :class="{ 'is-selected': batchDialog.form.settlementCycleType === opt.value }"
              @click="selectCycle('batch', opt.value)"
            >
              <div class="cycle-card-title">{{ opt.title }}</div>
              <div class="cycle-card-desc">{{ opt.desc }}</div>
              <div v-show="batchDialog.form.settlementCycleType === opt.value" class="cycle-card-corner-wrap">
                <i class="el-icon-check cycle-card-check" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="settlementMode" class="mode-form-item" label-width="0">
          <div class="mode-section-label">结算方式</div>
          <div class="mode-card-row">
            <div
              v-for="m in modeOptions"
              :key="'b-mode-' + m.value"
              class="mode-card"
              :class="{ 'is-selected': batchDialog.form.settlementMode === m.value }"
              @click="selectMode('batch', m.value)"
            >
              <div class="mode-card-title">{{ m.title }}</div>
              <div class="mode-card-desc">{{ m.desc }}</div>
              <div v-show="batchDialog.form.settlementMode === m.value" class="mode-card-corner-wrap">
                <i class="el-icon-check mode-card-check" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item class="dialog-actions" label-width="0">
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:stationSettlementRule:batchSave')"
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
import { getList, getByStationId as getInfo, saveOrUpdate, batchSaveOrUpdate } from '@/api/finance/stationSettlementRule'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'
import { getRuleIdTabs, getDefaultRuleIdTabName } from '@/utils/ruleIdTabs'

export default {
  name: 'StationSettlementRule',
  data() {
    return {
      activeName: getDefaultRuleIdTabName(),
      listLoading: false,
      tableKey: 0,
      total: 0,
      list: [],
      merchantList: [],
      searchForm: {
        page: 1,
        limit: 10,
        stationName: '',
        merchantId: '',
        settlementCycleType: '',
        settlementMode: '',
        ruleId: getDefaultRuleIdTabName()
      },
      selectedStationIds: [],
      cycleOptions: [
        { value: 1, title: 'T+1', desc: '每天提交前一天的结算', filterLabel: 'T+1（日结）' },
        { value: 2, title: 'T+7', desc: '每周一提交上一周的结算', filterLabel: 'T+7（周结）' },
        { value: 3, title: 'M+1', desc: '每月1号提交上个月的结算', filterLabel: 'M+1（月结）' }
      ],
      modeOptions: [
        { value: 1, title: '自动', desc: '按周期由系统自动发起结算' },
        { value: 2, title: '手动', desc: '需人工操作发起结算' }
      ],
      editDialog: {
        visible: false,
        form: {
          id: null,
          stationId: null,
          stationName: '',
          settlementCycleType: 1,
          settlementMode: 1
        }
      },
      batchDialog: {
        visible: false,
        form: {
          settlementCycleType: 1,
          settlementMode: 1
        }
      },
      editRules: {
        settlementCycleType: [{ required: true, message: '请选择结算周期', trigger: 'change' }],
        settlementMode: [{ required: true, message: '请选择结算方式', trigger: 'change' }]
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
    cycleLabel(v) {
      const o = this.cycleOptions.find(x => x.value === v)
      return o ? o.filterLabel : '—'
    },
    selectCycle(ctx, val) {
      if (ctx === 'edit') {
        this.editDialog.form.settlementCycleType = val
        this.$nextTick(() => {
          if (this.$refs.editForm) this.$refs.editForm.validateField('settlementCycleType')
        })
      } else {
        this.batchDialog.form.settlementCycleType = val
        this.$nextTick(() => {
          if (this.$refs.batchForm) this.$refs.batchForm.validateField('settlementCycleType')
        })
      }
    },
    selectMode(ctx, val) {
      if (ctx === 'edit') {
        this.editDialog.form.settlementMode = val
        this.$nextTick(() => {
          if (this.$refs.editForm) this.$refs.editForm.validateField('settlementMode')
        })
      } else {
        this.batchDialog.form.settlementMode = val
        this.$nextTick(() => {
          if (this.$refs.batchForm) this.$refs.batchForm.validateField('settlementMode')
        })
      }
    },
    modeLabel(v) {
      if (v === 1) return '自动'
      if (v === 2) return '手动'
      return '—'
    },
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
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '加载失败')
        }
        this.listLoading = false
      })
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
      this.selectedStationIds = rows
        .filter(r => this.isRowSelectable(r))
        .map(r => r.stationId)
    },
    isRowSelectable(row) {
      const count = row && row.modifyCount
      return count === null || count === undefined || count === '' || Number(count) === 0
    },
    onEdit(row) {
      const sid = row.stationId
      getInfo(sid).then(res => {
        const form = this.editDialog.form
        const d = res.data
        form.id = d && d.id != null ? d.id : null
        form.stationId = sid
        form.stationName = row.stationName
        form.settlementCycleType = d && d.settlementCycleType != null ? d.settlementCycleType : (row.settlementCycleType || 1)
        form.settlementMode = d && d.settlementMode != null ? d.settlementMode : (row.settlementMode || 1)
        this.editDialog.visible = true
      }).catch(() => {
        const form = this.editDialog.form
        form.id = row.ruleRecordId || null
        form.stationId = sid
        form.stationName = row.stationName
        form.settlementCycleType = row.settlementCycleType != null ? row.settlementCycleType : 1
        form.settlementMode = row.settlementMode != null ? row.settlementMode : 1
        this.editDialog.visible = true
      })
    },
    onEditSubmit() {
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        const f = this.editDialog.form
        const payload = {
          id: f.id,
          stationId: f.stationId,
          settlementCycleType: f.settlementCycleType,
          settlementMode: f.settlementMode
        }
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
      if (!this.selectedStationIds.length) {
        this.$message.error('请选择需要批量设置的站点')
        return
      }
      this.batchDialog.visible = true
    },
    onBatchSubmit() {
      this.$refs.batchForm.validate(valid => {
        if (!valid) return
        const { settlementCycleType, settlementMode } = this.batchDialog.form
        const payload = this.selectedStationIds.map(stationId => ({
          stationId,
          settlementCycleType,
          settlementMode
        }))
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
/* 与项目主题色一致（参见 style.scss 中 primary hover #08d374） */
.settlement-cycle-dialog {
  --settlement-theme: #08d374;
  --settlement-theme-soft: rgba(8, 211, 116, 0.18);
}

.settlement-cycle-dialog .el-dialog__body {
  padding-top: 8px;
}
.batch-selected-hint {
  margin: 0 0 12px;
  color: #606266;
  font-size: 14px;
}
.dialog-station-block {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.dialog-station-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.2;
}
.dialog-station-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  word-break: break-all;
}
.settlement-cycle-tip.el-alert--info {
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  color: #606266;
  margin-bottom: 16px;
}
.settlement-cycle-tip .el-alert__title {
  font-size: 13px;
  line-height: 1.5;
}
.cycle-form-item {
  margin-bottom: 8px;
}
.dialog-actions {
  margin-top: 8px;
  margin-bottom: 0;
}
.cycle-card-list {
  width: 100%;
}
.cycle-card {
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 11px 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
  overflow: hidden;
}
.cycle-card:last-child {
  margin-bottom: 0;
}
.cycle-card:hover {
  border-color: #c0c4cc;
}
.cycle-card.is-selected {
  border: 1px solid var(--settlement-theme);
  box-shadow: 0 0 0 1px var(--settlement-theme-soft);
}
.cycle-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.cycle-card-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.45;
}
.cycle-card-corner-wrap {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 28px;
  height: 28px;
  pointer-events: none;
}
.cycle-card-corner-wrap::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  border: 14px solid transparent;
  border-bottom-color: var(--settlement-theme);
  border-right-color: var(--settlement-theme);
}
.cycle-card-check {
  position: absolute;
  right: 3px;
  bottom: 2px;
  font-size: 11px;
  color: #fff;
  z-index: 1;
  line-height: 1;
}
.mode-form-item {
  margin-bottom: 8px;
}
.mode-section-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  font-weight: 500;
}
.mode-card-row {
  display: flex;
  gap: 12px;
}
.mode-card {
  position: relative;
  flex: 1;
  min-width: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 11px 14px 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
  overflow: hidden;
}
.mode-card:hover {
  border-color: #c0c4cc;
}
.mode-card.is-selected {
  border: 1px solid var(--settlement-theme);
  box-shadow: 0 0 0 1px var(--settlement-theme-soft);
}
.mode-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.mode-card-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
.mode-card-corner-wrap {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 24px;
  height: 24px;
  pointer-events: none;
}
.mode-card-corner-wrap::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  border: 12px solid transparent;
  border-bottom-color: var(--settlement-theme);
  border-right-color: var(--settlement-theme);
}
.mode-card-check {
  position: absolute;
  right: 2px;
  bottom: 1px;
  font-size: 10px;
  color: #fff;
  z-index: 1;
  line-height: 1;
}
</style>
