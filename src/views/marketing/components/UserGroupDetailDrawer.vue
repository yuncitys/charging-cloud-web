<template>
  <el-drawer
    title="用户分组详情"
    :visible.sync="visibleSync"
    direction="rtl"
    size="820px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
  >
    <div v-if="visibleSync" class="marketing-activity-drawer__body">
      <el-descriptions :column="2" border size="small" class="group-detail__info">
        <el-descriptions-item label="分组名称">{{ groupInfoMerged.groupName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="分组维度">{{ dimensionLabel }}</el-descriptions-item>
        <el-descriptions-item label="用户数">{{ groupInfoMerged.userCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="mini" :type="groupInfoMerged.labelStatus === '1' ? 'info' : 'success'">
            {{ groupInfoMerged.labelStatus === '1' ? '停用' : '启用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="电站范围" :span="2">{{ scopeText }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ groupInfoMerged.createTime | formatDate }}</el-descriptions-item>
      </el-descriptions>

      <div class="group-detail__toolbar">
        <span class="group-detail__title">分组内用户（{{ total }}）</span>
        <div>
          <el-input
            v-model="query.keyword"
            size="small"
            placeholder="账号 / 姓名 / 手机号"
            clearable
            style="width: 220px;"
            @keyup.enter.native="search"
            @clear="search"
          />
          <el-button size="small" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="rows" fit highlight-current-row style="width: 100%" empty-text="该分组暂无用户">
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="userAccount" label="用户账号" min-width="150" show-overflow-tooltip />
        <el-table-column prop="userName" label="姓名/昵称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="phoneNumber" label="手机号" width="140" />
        <el-table-column prop="belongToName" label="归属机构" min-width="170" show-overflow-tooltip />
        <el-table-column prop="createTime" label="加入时间" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="query.page"
          :page-size="query.limit"
          :page-sizes="[10, 20, 50]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">关闭</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { userGroupDetail, userGroupMembers } from '@/api/marketing/marketing'
import { parseTime } from '@/utils/index'
import { getUserGroupDimensionLabel } from '../constants/userGroup'
import '../styles/marketing.scss'

export default {
  name: 'UserGroupDetailDrawer',
  filters: {
    formatDate(time) {
      return time ? parseTime(time) : '-'
    }
  },
  props: {
    visible: { type: Boolean, default: false },
    group: { type: Object, default: null }
  },
  data() {
    return {
      loading: false,
      groupDetail: {},
      rows: [],
      total: 0,
      query: { page: 1, limit: 10, keyword: '' }
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    groupInfoMerged() {
      return Object.assign({}, this.group || {}, this.groupDetail || {})
    },
    dimensionLabel() {
      return getUserGroupDimensionLabel(this.groupInfoMerged.groupDimension)
    },
    scopeText() {
      const info = this.groupInfoMerged
      const cnt = Array.isArray(info.stationGroupIds) ? info.stationGroupIds.length
        : (Array.isArray(info.stationIds) ? info.stationIds.length : 0)
      if (info.stationDimension === '1') return cnt ? `按电站分组（${cnt} 个分组）` : '全部电站'
      return cnt ? `按电站（${cnt} 个电站）` : '全部电站'
    }
  },
  methods: {
    onOpen() {
      this.groupDetail = Object.assign({}, this.group || {})
      this.query = { page: 1, limit: 10, keyword: '' }
      this.rows = []
      this.total = 0
      if (this.group && this.group.id) {
        this.loadGroup()
        this.loadMembers()
      }
    },
    loadGroup() {
      userGroupDetail(this.group.id).then(res => {
        if (res.code === 200) this.groupDetail = res.data || {}
      }).catch(() => {})
    },
    loadMembers() {
      if (!this.group || !this.group.id) return
      this.loading = true
      userGroupMembers(this.group.id, this.query).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.rows = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => { this.loading = false })
    },
    search() {
      this.query.page = 1
      this.loadMembers()
    },
    handleSizeChange(val) {
      this.query.limit = val
      this.loadMembers()
    },
    handleCurrentChange(val) {
      this.query.page = val
      this.loadMembers()
    }
  }
}
</script>

<style scoped>
.group-detail__info {
  margin-bottom: 16px;
}
.group-detail__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.group-detail__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
