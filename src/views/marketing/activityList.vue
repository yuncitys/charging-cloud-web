<template>
  <div class="app-container">
    <div class="marketing-page-header__back">
      <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="goHub">返回营销活动</el-button>
    </div>

    <el-alert
      v-if="typeMeta"
      class="marketing-page-alert"
      type="info"
      :closable="false"
      show-icon
      :title="typeMeta.label"
      :description="typeMeta.description"
    />

    <div class="filter-container">
      <el-input
        v-model="listQuery.activityId"
        class="filter-item"
        placeholder="活动ID"
        clearable
        style="width: 200px;margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-input
        v-model="listQuery.activityName"
        class="filter-item"
        placeholder="活动名称"
        clearable
        style="width: 200px;margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-select v-model="listQuery.activityStatus" class="filter-item" placeholder="活动状态" clearable style="width: 140px;margin-right: 20px;" @change="handleFilter">
        <el-option v-for="item in activityStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button v-if="canEdit" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新建{{ typeMeta ? typeMeta.label : '活动' }}</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="activityId" label="活动ID" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="activityName" label="活动名称" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column prop="activityStatus" label="状态" align="center" width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="directionalStatusTagType(scope.row)">{{ directionalStatusLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="fixedType !== '3' && fixedType !== '6'" label="活动时间" align="center" min-width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.activityBeginTime | formatDate }} ~ {{ scope.row.activityEndTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="fixedType === '3'" label="发放时间" align="center" min-width="180">
          <template slot-scope="scope">
            <span>{{ sendTimeLabel(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="fixedType === '6'" label="发放总数量" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.sendTotalCount != null ? scope.row.sendTotalCount : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="['1', '2', '3', '4', '5', '6', '7', '8'].includes(fixedType)" prop="activityInitiator" label="发起方" align="center" width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.activityInitiator === '1' ? '平台' : '商户' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" fixed="right">
          <template slot-scope="scope">
            <div class="marketing-table-actions">
              <el-button v-if="canView" type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
              <el-dropdown v-if="canView" trigger="click" @command="(cmd) => handleMoreCommand(cmd, scope.row)">
                <el-button type="primary" size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="record">领取记录</el-dropdown-item>
                  <el-dropdown-item v-if="canEdit && canEditRow(scope.row)" command="edit" divided>编辑</el-dropdown-item>
                  <el-dropdown-item v-if="canEdit && canStop(scope.row)" command="stop" divided>停用</el-dropdown-item>
                  <el-dropdown-item v-if="canEdit && canDirectionalSend(scope.row)" command="send">发放</el-dropdown-item>
                  <el-dropdown-item v-if="canEdit && fixedType === '5'" command="qrcode">二维码</el-dropdown-item>
                  <el-dropdown-item v-if="canEdit && fixedType === '6'" command="exchange">兑换码</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
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

    <discount-activity-form-drawer
      v-if="drawerSupported && useDiscountDrawer"
      :visible.sync="formDrawerVisible"
      :activity-type="fixedType"
      :activity-id="editingActivityId"
      @saved="getList"
    />

    <activity-form-drawer
      v-else-if="drawerSupported"
      :visible.sync="formDrawerVisible"
      :activity-type="fixedType"
      :activity-id="editingActivityId"
      @saved="getList"
    />

    <discount-activity-detail-drawer
      v-if="useDiscountDrawer"
      :visible.sync="detailDrawerVisible"
      :activity-id="detailActivityId"
      :activity-type="fixedType"
      @edit="onDetailEdit"
    />

    <activity-detail-drawer
      v-else
      :visible.sync="detailDrawerVisible"
      :activity-id="detailActivityId"
      :activity-type="fixedType"
      @edit="onDetailEdit"
    />

    <el-dialog title="扫码活动二维码" :visible.sync="qrcodeVisible" width="480px">
      <div v-if="qrcodeContent" class="qrcode-box">
        <p class="qrcode-tip">将以下参数配置到小程序码 scene 中，用户扫码即可进入领券页。</p>
        <el-input v-model="qrcodeContent" readonly />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { activityPage, stopActivity, directionalSend, activityQrcode } from '@/api/marketing/marketing'
import { ACTIVITY_STATUS, getActivityTypeMeta } from './constants/activityTypes'
import { hasActivityTypeEdit, hasActivityTypeView, canEditMarketingActivity } from './utils/marketingActivityAuth'
import { getLoginUserRoleTypeMin } from '@/utils/adminRoleTypeOptions'
import { mapGetters } from 'vuex'
import { isDiscountActivityType } from './constants/discountActivity'
import ActivityFormDrawer from './components/ActivityFormDrawer'
import ActivityDetailDrawer from './components/ActivityDetailDrawer'
import DiscountActivityFormDrawer from './components/DiscountActivityFormDrawer'
import DiscountActivityDetailDrawer from './components/DiscountActivityDetailDrawer'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'activityList',
  components: { ActivityFormDrawer, ActivityDetailDrawer, DiscountActivityFormDrawer, DiscountActivityDetailDrawer },
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    }
  },
  data() {
    return {
      listLoading: false,
      sendingActivityId: '',
      page: 1,
      limit: 10,
      list: [],
      total: 0,
      listQuery: { page: 1, limit: 10, activityId: '', activityName: '', activityType: '', activityStatus: '' },
      activityStatusOptions: ACTIVITY_STATUS,
      qrcodeVisible: false,
      qrcodeContent: '',
      formDrawerVisible: false,
      editingActivityId: '',
      detailDrawerVisible: false,
      detailActivityId: ''
    }
  },
  computed: {
    ...mapGetters(['adminUser']),
    fixedType() {
      return this.$route.query.activityType || ''
    },
    typeMeta() {
      return getActivityTypeMeta(this.fixedType)
    },
    canView() {
      return hasActivityTypeView(this.fixedType)
    },
    canEdit() {
      return hasActivityTypeEdit(this.fixedType)
    },
    drawerSupported() {
      return ['1', '2', '3', '4', '5', '6'].includes(this.fixedType) || isDiscountActivityType(this.fixedType)
    },
    useDiscountDrawer() {
      return isDiscountActivityType(this.fixedType)
    }
  },
  watch: {
    '$route.query.activityType'() {
      if (!this.ensureTypeAccess()) return
      this.syncTypeFilter()
      this.handleFilter()
    }
  },
  created() {
    if (!this.ensureTypeAccess()) return
    this.syncTypeFilter()
    this.getList()
  },
  methods: {
    ensureTypeAccess() {
      if (!this.fixedType || !this.typeMeta) {
        this.$message.warning('无效的活动类型')
        this.goHub()
        return false
      }
      if (!this.canView) {
        this.$message.warning('暂无该活动类型的查看权限')
        this.goHub()
        return false
      }
      const roleType = getLoginUserRoleTypeMin(this.adminUser)
      if (this.typeMeta.platformOnly && roleType > 1) {
        this.$message.warning('该活动类型仅平台管理员可管理')
        this.goHub()
        return false
      }
      return true
    },
    syncTypeFilter() {
      this.listQuery.activityType = this.fixedType
    },
    activityStatusLabel(status) {
      const item = ACTIVITY_STATUS.find(s => s.value === status)
      return item ? item.label : status
    },
    directionalStatusLabel(row) {
      if (this.fixedType !== '3') {
        return this.activityStatusLabel(row.activityStatus)
      }
      if (String(row.sendStatus) === '1') {
        return '已发放'
      }
      if (String(row.sendType) === '2') {
        return '待发放'
      }
      if (row.activityStatus === '1') {
        return '发放中'
      }
      return this.activityStatusLabel(row.activityStatus)
    },
    directionalStatusTagType(row) {
      if (this.fixedType !== '3') {
        return this.statusTagType(row.activityStatus)
      }
      if (String(row.sendStatus) === '1') {
        return 'info'
      }
      if (String(row.sendType) === '2') {
        return 'warning'
      }
      if (row.activityStatus === '1') {
        return ''
      }
      return this.statusTagType(row.activityStatus)
    },
    statusTagType(status) {
      const item = ACTIVITY_STATUS.find(s => s.value === status)
      return item ? item.tagType : 'info'
    },
    canStop(row) {
      if (this.fixedType === '3' && String(row.sendStatus) === '1') {
        return false
      }
      return row.activityStatus === '1' || row.activityStatus === '2'
    },
    canDirectionalSend(row) {
      if (this.fixedType !== '3') return false
      if (String(row.sendStatus) === '1') return false
      return String(row.sendType) === '2'
    },
    canEditRow(row) {
      return canEditMarketingActivity(row)
    },
    sendTimeLabel(row) {
      if (String(row.sendType) === '1') return '立即发放'
      if (String(row.sendType) === '2') {
        return row.sendTime ? parseTime(row.sendTime, '{y}-{m}-{d} {h}:{i}') : '—'
      }
      return '—'
    },
    goHub() {
      this.$router.push({ name: 'activityHub' })
    },
    getList() {
      if (!this.fixedType) {
        this.goHub()
        return
      }
      this.listLoading = true
      activityPage(this.listQuery).then(res => {
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
    handleCreate() {
      if (!this.canEdit) return
      if (this.drawerSupported) {
        this.editingActivityId = ''
        this.formDrawerVisible = true
        return
      }
      this.$router.push({
        name: 'activityEdit',
        query: { activityType: this.fixedType, typeName: this.$route.query.typeName }
      })
    },
    handleEdit(row) {
      if (!this.canEdit) return
      if (!this.canEditRow(row)) {
        this.$message.warning('仅未开始状态的活动可编辑')
        return
      }
      if (this.drawerSupported) {
        this.editingActivityId = row.activityId
        this.formDrawerVisible = true
        return
      }
      this.$router.push({
        name: 'activityEdit',
        query: {
          id: row.activityId,
          activityType: this.fixedType,
          typeName: this.$route.query.typeName
        }
      })
    },
    handleDetail(row) {
      this.detailActivityId = row.activityId
      this.detailDrawerVisible = true
    },
    handleRecord(row) {
      this.$router.push({
        name: 'activityReceiveRecordList',
        query: {
          activityId: row.activityId,
          activityName: row.activityName,
          activityType: row.activityType || this.fixedType,
          typeName: this.$route.query.typeName
        }
      })
    },
    onDetailEdit(activity) {
      if (!this.canEditRow(activity)) {
        this.$message.warning('仅未开始状态的活动可编辑')
        return
      }
      this.editingActivityId = activity.activityId
      this.formDrawerVisible = true
    },
    handleMoreCommand(command, row) {
      if (command === 'record') {
        this.handleRecord(row)
      } else if (command === 'edit') {
        this.handleEdit(row)
      } else if (command === 'stop') {
        this.handleStop(row)
      } else if (command === 'send') {
        this.handleDirectionalSend(row)
      } else if (command === 'qrcode') {
        this.handleQrcode(row)
      } else if (command === 'exchange') {
        this.handleExchangeCodes(row)
      }
    },
    handleStop(row) {
      this.$confirm('确认停用该活动？', '提示', { type: 'warning' }).then(() => {
        stopActivity(row.activityId).then(res => {
          if (res.code === 200) {
            this.$message.success('停用成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '停用失败')
          }
        })
      }).catch(() => {})
    },
    handleDirectionalSend(row) {
      if (this.sendingActivityId) return
      this.$confirm('确认立即向活动范围内用户定向发放？', '定向发放', { type: 'warning' }).then(() => {
        this.sendingActivityId = row.activityId
        directionalSend(row.activityId).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '发放完成')
            this.getList()
          } else {
            this.$message.error(res.msg || '发放失败')
          }
        }).finally(() => {
          this.sendingActivityId = ''
        })
      }).catch(() => {})
    },
    handleQrcode(row) {
      activityQrcode(row.activityId).then(res => {
        if (res.code === 200) {
          this.qrcodeContent = res.data || ''
          this.qrcodeVisible = true
        } else {
          this.$message.error(res.msg || '获取失败')
        }
      })
    },
    handleExchangeCodes(row) {
      this.$router.push({
        name: 'exchangeCodeList',
        query: {
          activityId: row.activityId,
          activityName: row.activityName,
          activityType: this.fixedType,
          typeName: this.$route.query.typeName
        }
      })
    }
  }
}
</script>

<style scoped>
.qrcode-tip {
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}
</style>
