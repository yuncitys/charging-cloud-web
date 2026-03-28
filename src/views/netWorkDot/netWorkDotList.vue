<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.networkAddress"
        class="filter-item"
        style="width: 200px;margin-right: 20px;"
        placeholder="请输入充电站地址"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-input
        v-model="listQuery.networkProvince"
        class="filter-item"
        style="width: 200px;margin-right: 20px;"
        placeholder="请输入充电站省份"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-input
        v-model="listQuery.networkName"
        class="filter-item"
        style="width: 200px;margin-right: 20px;"
        placeholder="请输入充电站名称"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-select
        v-model="listQuery.merchantId"
        class="filter-item"
        style="width: 200px;margin-right: 20px;"
        placeholder="运营商户"
        filterable
        clearable
        @change="handleFilter()"
      >
        <el-option
          v-for="item in merchantList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button
        class="filter-item"
        style="margin-right: 20px;"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        查询
      </el-button>
      <el-button
        v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:add')"
        class="filter-item"
        style="margin-right: 20px;"
        type="primary"
        @click="addOrUpdateHandle()"
      >
        添加站点
      </el-button>

      <downExcel :query-data="listQuery" />

      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane
          v-for="item in ruleIdList"
          :key="item.id"
          :label="item.title"
          :name="item.id"
        />
      </el-tabs>

      <el-table
        id="tableBox"
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        element-loading-text="拼命加载中......"
        fit
        highlight-current-row
        style="width: 100%;"
        align="center"
      >
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="merchantName"
          label="运营商户"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column
          prop="networkName"
          label="充电站名称"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column
          prop="networkAddress"
          label="投放地"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column
          prop="networkLongitude"
          label="地址经度"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column
          prop="networkLatitude"
          label="地址纬度"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column label="App展示" align="center" width="110">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isAppDisplay"
              :active-value="1"
              :inactive-value="0"
              :disabled="!btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit') || !!appDisplayUpdating[scope.row.id]"
              @change="handleAppDisplayChange(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createUser"
          label="创建用户"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column
          prop="updateUser"
          label="更新用户"
          align="center"
          :show-overflow-tooltip="isPc"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          align="center"
          :show-overflow-tooltip="isPc"
          sortable
        >
          <template slot-scope="scope">
            <span>{{ scope.row.createTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          align="center"
          :show-overflow-tooltip="isPc"
          sortable
        >
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="toStationSetting(scope.row)">
              设置
            </el-button>
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:delete')"
              style="margin-left: 10px;"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <ChargeStationDialog ref="chargeStationForm" @getLists="getLists" />
  </div>
</template>

<script>
import { getList, updateSwitch, deleteNetworkDot } from '@/api/netWorkDot/netWorkDotList.js'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'
import downExcel from './components/downExcel.vue'
import ChargeStationDialog from './components/chargeStationDialog.vue'

export default {
  name: 'NetWorkDotList',
  components: { ChargeStationDialog, downExcel },
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      activeName: '2',
      ruleIdList: [
        { id: '1', title: '单车' },
        { id: '2', title: '汽车' }
      ],
      listLoading: true,
      list: [],
      total: 10,
      merchantList: [],
      appDisplayUpdating: {},
      listQuery: {
        page: 1,
        limit: 10,
        ruleId: 2,
        type: 1,
        adminId: '',
        merchantId: '',
        networkName: '',
        networkProvince: '',
        networkAddress: ''
      },
      tableKey: 0
    }
  },
  created() {
    this.getLists()
    this.getMerchantList()
  },
  methods: {
    normalizeFlag01(val) {
      if (val === 1 || val === '1' || val === true) return 1
      return 0
    },
    handleAppDisplayChange(row, val) {
      if (!row || !row.id) return
      const nextVal = this.normalizeFlag01(val)
      const prevVal = nextVal === 1 ? 0 : 1

      this.$set(this.appDisplayUpdating, row.id, true)
      updateSwitch({ id: row.id, field: 'isAppDisplay', value: nextVal === 1 }).then(res => {
        if (res && res.code === 200) {
          this.$message.success(res.msg || '更新成功')
        } else {
          row.isAppDisplay = prevVal
          this.$message.error((res && res.msg) || '更新失败')
        }
      }).catch(() => {
        row.isAppDisplay = prevVal
        this.$message.error('更新失败')
      }).finally(() => {
        this.$delete(this.appDisplayUpdating, row.id)
      })
    },
    toStationSetting(row) {
      const stationId = row && row.id ? row.id : ''
      if (!stationId) {
        this.$message.error('缺少站点ID')
        return
      }
      this.$router.push({
        path: `/netWorkDot/setting/${stationId}`,
        query: {
          merchantId: row.merchantId || row.merchant_id || row.merchantID || '',
          merchantName: row.merchantName || row.merchant_name || '',
          stationName: row.networkName || ''
        }
      })
    },
    addOrUpdateHandle(row, isDetail) {
      this.$nextTick(() => {
        const defaultRuleId = Number(this.activeName || this.listQuery.ruleId || 1)
        this.$refs.chargeStationForm.onshowAdd(row, isDetail, defaultRuleId)
      })
    },
    handleClick(tab) {
      this.listQuery.ruleId = Number(tab.name)
      this.listQuery.page = 1
      this.getLists()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      getList(this.listQuery).then(res => {
        if (res && res.code === 200) {
          const list = Array.isArray(res.data) ? res.data : []
          this.list = list.map(item => {
            const isAppDisplay = this.normalizeFlag01(item.isAppDisplay ?? item.is_app_display)
            return { ...item, isAppDisplay }
          })
          this.total = res.count || 0
        } else {
          this.$message.error((res && res.msg) || '获取失败')
        }
      }).catch(() => {
        this.$message.error('获取失败')
      }).finally(() => {
        this.listLoading = false
      })
    },
    del(id) {
      this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        deleteNetworkDot({ id }).then(res => {
          if (res && res.code === 200) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.getLists()
          } else {
            this.$message.error((res && res.msg) || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      })
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getLists()
    },
    getMerchantList() {
      getMerchant({ roleType: 'OPERATOR', type: 1 }).then(res => {
        this.merchantList = (res && res.code === 200) ? (res.data || []) : []
      }).catch(() => {
        this.merchantList = []
      })
    }
  }
}
</script>

<style>
	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/*height:600px;*/
		max-height: calc(100% - 30px);
		max-width: calc(100% - 30px);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;

	}

	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}

	.amap-sug-result {
		z-index: 9999 !important;
	}

	#tipinput {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	#tipinput1 {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	.receive-account-wrap {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 6px 0 10px;
	}

	.receive-account-label {
		width: 96px;
		color: #303133;
		line-height: 36px;
		font-weight: 600;
	}

	.receive-account-card {
		flex: 1;
		border: 1px solid #ebeef5;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.receive-account-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		border-bottom: 1px solid #f2f6fc;
	}

	.receive-account-title {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
		max-width: 520px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.receive-account-badge {
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 12px;
		color: #ff7a00;
		background: rgba(255, 122, 0, 0.12);
	}

	.receive-account-body {
		padding: 16px;
		color: #303133;
	}

	.receive-account-bank {
		font-size: 16px;
		line-height: 24px;
		color: #303133;
	}

	.receive-account-no {
		margin-top: 6px;
		font-size: 18px;
		line-height: 26px;
		letter-spacing: 1px;
		color: #303133;
	}

	.receive-account-empty {
		padding: 22px 0 10px;
		text-align: center;
	}

	.receive-account-empty-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}

	.receive-account-empty-desc {
		margin: 8px auto 14px;
		max-width: 460px;
		font-size: 13px;
		color: #909399;
		line-height: 20px;
	}

	.commission-wrap {
		padding: 6px 0 10px;
	}

	.commission-card {
		border: 1px solid #ebeef5;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.commission-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		border-bottom: 1px solid #f2f6fc;
	}

	.commission-header-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.settlement-header-btn.el-button--primary,
	.settlement-header-btn.el-button--primary:hover,
	.settlement-header-btn.el-button--primary:focus {
		color: #fff;
	}

	.commission-title {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
	}

	.commission-badge {
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 12px;
	}

	.commission-badge--on {
		color: #67c23a;
		background: rgba(103, 194, 58, 0.12);
	}

	.commission-badge--off {
		color: #909399;
		background: rgba(144, 147, 153, 0.12);
	}

	.commission-body {
		padding: 16px;
	}

	.commission-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px dashed #f2f6fc;
	}

	.commission-row:last-child {
		border-bottom: none;
	}

	.commission-label {
		font-size: 13px;
		color: #909399;
	}

	.commission-value {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}

	.commission-footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		background: #fafcff;
		border-top: 1px solid #f2f6fc;
	}

	.commission-meta {
		font-size: 12px;
		color: #909399;
	}

	.settlement-empty {
		text-align: center;
	}

	.settlement-empty-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}

	.settlement-empty-desc {
		margin: 8px auto 14px;
		max-width: 460px;
		font-size: 13px;
		color: #909399;
		line-height: 20px;
	}
</style>
