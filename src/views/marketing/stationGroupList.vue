<template>
  <div class="app-container">
    <el-alert
      class="marketing-page-alert"
      type="info"
      :closable="false"
      show-icon
      title="电站分组"
      description="将电站归类管理，便于在充电领取等活动中按分组圈定可用站点范围。"
    />

    <div class="filter-container">
      <el-input v-model="listQuery.groupName" class="filter-item" placeholder="分组名称" clearable style="width: 200px;margin-right: 20px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="openDrawer()">新增分组</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="groupName" label="分组名称" align="center" min-width="160" />
        <el-table-column prop="stationCount" label="电站数" align="center" width="100" />
        <el-table-column prop="labelStatus" label="状态" align="center" width="90">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.labelStatus === '1' ? 'info' : 'success'">
              {{ scope.row.labelStatus === '1' ? '停用' : '启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.createTime | formatDate }}</span></template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="260" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="openDrawer(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.labelStatus === '1'"
              type="primary"
              size="mini"
              @click="handleToggleStatus(scope.row, '0')"
            >启用</el-button>
            <el-button
              v-else
              type="warning"
              size="mini"
              @click="handleToggleStatus(scope.row, '1')"
            >停用</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="listQuery.page" :page-sizes="[10, 20, 30, 50]" :page-size="listQuery.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <station-group-form-drawer
      :visible.sync="drawerVisible"
      :group="editingGroup"
      @saved="getList"
    />
  </div>
</template>

<script>
import { stationGroupPage, deleteStationGroup, updateStationGroupLabelStatus } from '@/api/marketing/marketing'
import StationGroupFormDrawer from './components/StationGroupFormDrawer'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'stationGroupList',
  components: { StationGroupFormDrawer },
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      listLoading: false,
      page: 1,
      limit: 10,
      list: [],
      total: 0,
      listQuery: { page: 1, limit: 10, groupName: '' },
      drawerVisible: false,
      editingGroup: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      stationGroupPage(this.listQuery).then(res => {
        this.listLoading = false
        this.list = res.data || []
        this.total = res.count || 0
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.page = val
      this.getList()
    },
    openDrawer(row) {
      this.editingGroup = row || null
      this.drawerVisible = true
    },
    handleToggleStatus(row, labelStatus) {
      const action = labelStatus === '0' ? '启用' : '停用'
      this.$confirm(`确认${action}该分组？`, '提示', { type: 'warning' }).then(() => {
        updateStationGroupLabelStatus(row.id, labelStatus).then(res => {
          if (res.code === 200) {
            this.$message.success(`${action}成功`)
            this.getList()
          } else {
            this.$message.error(res.msg || `${action}失败`)
          }
        })
      }).catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('确认删除该分组？', '提示', { type: 'warning' }).then(() => {
        deleteStationGroup(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
