<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.networkName"
        class="filter-item"
        style="width: 200px;margin-right: 20px;"
        placeholder="请输入电站名称"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-select
        v-model="listQuery.isMoreCharge"
        class="filter-item"
        style="width: 200px;margin-right: 20px;"
        placeholder="是否配置并充"
        clearable
        @change="handleFilter()"
      >
        <el-option v-for="item in yesNoBoolOptions" :key="'ynb'+String(item.value)" :label="item.label" :value="item.value" />
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
        <el-table-column
          prop="networkName"
          label="电站名称"
          align="center"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="merchantName"
          label="归属商户"
          align="center"
          min-width="140"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.merchantName || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否配置并充" align="center" width="140">
          <template slot-scope="scope">
            <span>{{ formatConfigured(scope.row.isMoreCharge) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="selectedDeviceCount"
          label="已选桩数"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.selectedDeviceCount == null ? 0 : scope.row.selectedDeviceCount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="updateUser"
          label="修改用户"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.updateUser || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="修改时间"
          align="center"
          width="170"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime ? parseTime(scope.row.updateTime) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':netWorkDot:parallelCharge:edit')"
              type="primary"
              size="mini"
              @click="openConfig(scope.row)"
            >
              配置
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
    <parallel-charge-config ref="configDrawer" @saved="getLists" />
  </div>
</template>

<script>
import { pageParallelCharge } from '@/api/netWorkDot/parallelCharge.js'
import ParallelChargeConfig from './components/parallelChargeConfig.vue'
import { parseTime } from '@/utils/index'
import { formatDictLabel } from '@/utils/dictionary'

export default {
  name: 'ParallelChargeList',
  components: { ParallelChargeConfig },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        networkName: '',
        isMoreCharge: null
      },
      yesNoBoolOptions: []
    }
  },
  created() {
    this.$dict.getSelectorOptions('common_yes_no', { numeric: true }).then(list => {
      this.yesNoBoolOptions = (list || []).map(item => ({
        label: item.label,
        value: Number(item.value) === 1
      }))
    })
    this.getLists()
  },
  methods: {
    parseTime,
    formatConfigured(val) {
      const code = (val === true || val === 1 || val === '1') ? 1 : 0
      return formatDictLabel('common_yes_no', code)
    },
    buildParams() {
      const params = {
        page: this.listQuery.page,
        limit: this.listQuery.limit
      }
      const name = (this.listQuery.networkName || '').trim()
      if (name) {
        params.networkName = name
      }
      if (this.listQuery.isMoreCharge === true || this.listQuery.isMoreCharge === false) {
        params.isMoreCharge = this.listQuery.isMoreCharge
      }
      return params
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      pageParallelCharge(this.buildParams()).then(res => {
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
    openConfig(row) {
      this.$refs.configDrawer && this.$refs.configDrawer.open(row)
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getLists()
    }
  }
}
</script>
