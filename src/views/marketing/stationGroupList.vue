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
      <el-button v-if="canCreate" class="filter-item" type="primary" icon="el-icon-plus" @click="openDrawer()">新增分组</el-button>

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
        <el-table-column label="操作" align="center" width="170" fixed="right">
          <template slot-scope="scope">
            <div class="marketing-table-actions">
              <el-button v-if="canDetail" type="primary" size="mini" @click="openDetail(scope.row)">详情</el-button>
              <el-dropdown v-if="hasMoreActions" trigger="click" @command="(cmd) => handleMoreCommand(cmd, scope.row)">
                <el-button type="primary" size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="canUpdate" command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item v-if="canLabelStatus" command="toggleStatus" divided>
                    {{ scope.row.labelStatus === '1' ? '启用' : '停用' }}
                  </el-dropdown-item>
                  <el-dropdown-item v-if="canDelete" command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="listQuery.page" :page-sizes="[10, 20, 30, 50]" :page-size="listQuery.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <station-group-detail-drawer
      :visible.sync="detailVisible"
      :group="detailGroup"
    />

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
import StationGroupDetailDrawer from './components/StationGroupDetailDrawer'
import { MARKETING_PERMS } from './constants/marketingPermissions'
import { hasMarketingPerm } from './utils/marketingActivityAuth'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'stationGroupList',
  components: { StationGroupFormDrawer, StationGroupDetailDrawer },
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
      detailVisible: false,
      detailGroup: null,
      editingGroup: null
    }
  },
  computed: {
    canCreate() { return hasMarketingPerm(MARKETING_PERMS.stationGroupCreate) },
    canDetail() { return hasMarketingPerm(MARKETING_PERMS.stationGroupDetail) },
    hasMoreActions() { return this.canUpdate || this.canLabelStatus || this.canDelete },
    canUpdate() { return hasMarketingPerm(MARKETING_PERMS.stationGroupUpdate) },
    canDelete() { return hasMarketingPerm(MARKETING_PERMS.stationGroupDelete) },
    canLabelStatus() { return hasMarketingPerm(MARKETING_PERMS.stationGroupLabelStatus) }
  },
  created() {
    this.getList()
  },
  methods: {
    handleMoreCommand(cmd, row) {
      if (cmd === 'edit') {
        this.openDrawer(row)
      } else if (cmd === 'toggleStatus') {
        this.handleToggleStatus(row, row.labelStatus === '1' ? '0' : '1')
      } else if (cmd === 'delete') {
        this.handleDelete(row)
      }
    },
    openDetail(row) {
      this.detailGroup = row
      this.detailVisible = true
    },
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
      if (row ? !this.canUpdate : !this.canCreate) return
      this.editingGroup = row || null
      this.drawerVisible = true
    },
    handleToggleStatus(row, labelStatus) {
      if (!this.canLabelStatus) return
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
      if (!this.canDelete) return
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
