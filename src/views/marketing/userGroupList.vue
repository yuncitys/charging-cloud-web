<template>
  <div class="app-container">
    <el-alert
      class="marketing-page-alert"
      type="info"
      :closable="false"
      show-icon
      title="用户分组"
      description="按手机号导入或维护用户分组，用于定向发放、扫码领券等活动的精准人群圈选。"
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
        <el-table-column prop="groupDimension" label="分组维度" align="center" width="110">
          <template slot-scope="scope">
            <span>{{ groupDimensionLabel(scope.row.groupDimension) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数" align="center" width="100" />
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
              <el-dropdown v-if="hasMoreActions(scope.row)" trigger="click" @command="(cmd) => handleMoreCommand(cmd, scope.row)">
                <el-button type="primary" size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="canUpdate" command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item v-if="canMoveIn && canMoveMembers(scope.row)" command="moveIn" divided>迁入</el-dropdown-item>
                  <el-dropdown-item v-if="canMoveOut && canMoveMembers(scope.row)" command="moveOut">迁出</el-dropdown-item>
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

    <user-group-detail-drawer
      :visible.sync="detailVisible"
      :group="detailGroup"
    />

    <user-group-form-drawer
      :visible.sync="drawerVisible"
      :group="editingGroup"
      @saved="getList"
    />

    <user-group-move-drawer
      :visible.sync="moveDrawerVisible"
      :group="moveTarget"
      :mode="moveMode"
      @saved="getList"
    />
  </div>
</template>

<script>
import { userGroupPage, deleteUserGroup, updateUserGroupLabelStatus } from '@/api/marketing/marketing'
import UserGroupFormDrawer from './components/UserGroupFormDrawer'
import UserGroupDetailDrawer from './components/UserGroupDetailDrawer'
import UserGroupMoveDrawer from './components/UserGroupMoveDrawer'
import { MARKETING_PERMS } from './constants/marketingPermissions'
import { hasMarketingPerm } from './utils/marketingActivityAuth'
import { getUserGroupDimensionLabel } from './constants/userGroup'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'userGroupList',
  components: { UserGroupFormDrawer, UserGroupMoveDrawer, UserGroupDetailDrawer },
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
      editingGroup: null,
      moveDrawerVisible: false,
      moveTarget: null,
      moveMode: 'in'
    }
  },
  computed: {
    canCreate() { return hasMarketingPerm(MARKETING_PERMS.userGroupCreate) },
    canDetail() { return hasMarketingPerm(MARKETING_PERMS.userGroupDetail) },
    canUpdate() { return hasMarketingPerm(MARKETING_PERMS.userGroupUpdate) },
    canDelete() { return hasMarketingPerm(MARKETING_PERMS.userGroupDelete) },
    canMoveIn() { return hasMarketingPerm(MARKETING_PERMS.userGroupMoveIn) },
    canMoveOut() { return hasMarketingPerm(MARKETING_PERMS.userGroupMoveOut) },
    canLabelStatus() { return hasMarketingPerm(MARKETING_PERMS.userGroupLabelStatus) }
  },
  created() {
    this.$dict.getSelector('marketing_user_group_dimension')
    this.getList()
  },
  methods: {
    hasMoreActions(row) {
      if (!row) return false
      return this.canUpdate ||
        (this.canMoveIn && this.canMoveMembers(row)) ||
        (this.canMoveOut && this.canMoveMembers(row)) ||
        this.canLabelStatus ||
        this.canDelete
    },
    handleMoreCommand(cmd, row) {
      if (cmd === 'edit') {
        this.openDrawer(row)
      } else if (cmd === 'moveIn') {
        this.openMoveDrawer(row, 'in')
      } else if (cmd === 'moveOut') {
        this.openMoveDrawer(row, 'out')
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
    groupDimensionLabel(code) {
      return getUserGroupDimensionLabel(code)
    },
    canMoveMembers(row) {
      return row.groupDimension === '1'
    },
    getList() {
      this.listLoading = true
      userGroupPage(this.listQuery).then(res => {
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
    openMoveDrawer(row, mode) {
      if (mode === 'in' && !this.canMoveIn) return
      if (mode === 'out' && !this.canMoveOut) return
      if (!this.canMoveMembers(row)) {
        this.$message.warning('仅批量导入类型分组支持迁入迁出')
        return
      }
      this.moveTarget = row
      this.moveMode = mode
      this.moveDrawerVisible = true
    },
    handleToggleStatus(row, labelStatus) {
      if (!this.canLabelStatus) return
      const action = labelStatus === '0' ? '启用' : '停用'
      this.$confirm(`确认${action}该分组？`, '提示', { type: 'warning' }).then(() => {
        updateUserGroupLabelStatus(row.id, labelStatus).then(res => {
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
        deleteUserGroup(row.id).then(res => {
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
