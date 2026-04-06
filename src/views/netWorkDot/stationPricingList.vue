<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.networkName"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
        placeholder="充电站名称"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-select
        v-model="listQuery.merchantId"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
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

      <el-table
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
        <el-table-column prop="networkName" label="充电站名称" align="center" show-overflow-tooltip />
        <el-table-column prop="merchantName" label="运营商户" align="center" show-overflow-tooltip />
        <el-table-column label="直连/互联" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ formatType(scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ formatSetPrice(scope.row.isSetPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateUser" label="更新用户" align="center" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="170" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="toPricingAddPage(scope.row)" 
              v-if="btnAuthen.permsVerifAuthention(':station:charge:carCharge:set')">
              设置
            </el-button>
            <el-button type="info" size="mini" @click="toPricingDetailPage(scope.row)">
              详情
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
  </div>
</template>

<script>
import { getStationPricingManagePage } from '@/api/netWorkDot/stationPricingRule.js'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'

/** 电价管理仅支持汽车时段计费（与后端 ruleId=2 一致） */
const RULE_ID_CAR = 2

export default {
  name: 'StationPricingList',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      merchantList: [],
      listQuery: {
        page: 1,
        limit: 10,
        ruleId: RULE_ID_CAR,
        type: 1,
        merchantId: '',
        networkName: ''
      }
    }
  },
  created() {
    this.getLists()
    this.getMerchantList()
  },
  methods: {
    formatSetPrice(val) {
      if (val === 1 || val === '1' || val === true) return '已配置'
      return '未配置'
    },
    formatType(val) {
      if (val === 1) return '直连'
      if (val === 2) return '互联'
      return '-'
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      const payload = { ...this.listQuery }
      if (payload.merchantId === '') {
        delete payload.merchantId
      }
      getStationPricingManagePage(payload).then(res => {
        if (res && res.code === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
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
    toPricingAddPage(row) {
      const stationId = row && row.id
      if (!stationId) {
        this.$message.error('缺少站点ID')
        return
      }
      const query = {
        stationId: String(stationId),
        merchantId: row.merchantId != null && row.merchantId !== '' ? String(row.merchantId) : '',
        merchantName: row.merchantName || '',
        stationName: row.networkName || '',
        ruleId: String(RULE_ID_CAR)
      }
      this.$router.push({ path: '/netWorkDot/stationPricingCarAdd', query })
    },
    toPricingDetailPage(row) {
      const stationId = row && row.id
      if (!stationId) {
        this.$message.error('缺少站点ID')
        return
      }
      this.$router.push({
        path: '/netWorkDot/stationPricingDetail',
        query: {
          stationId: String(stationId),
          stationName: row.networkName || ''
        }
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
