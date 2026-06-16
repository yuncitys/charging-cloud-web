<template>
  <div class="app-container">
    <el-alert
      class="marketing-page-alert"
      type="info"
      :closable="false"
      show-icon
      title="卡券管理"
      description="创建抵用卡或优惠券模板，配置面额、有效期与可用范围，供各类营销活动发放使用。"
    />

    <div class="filter-container">
      <el-input v-model="listQuery.cardCouponName" class="filter-item" placeholder="卡券名称" clearable style="width: 200px;margin-right: 20px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-select v-model="listQuery.cardCouponType" class="filter-item" placeholder="卡券类型" clearable style="width: 140px;margin-right: 20px;" @change="handleFilter">
        <el-option label="抵用卡" value="1" />
        <el-option label="优惠券" value="2" />
      </el-select>
      <el-select v-model="listQuery.cancelFlag" class="filter-item" placeholder="状态" clearable style="width: 120px;margin-right: 20px;" @change="handleFilter">
        <el-option label="正常" value="0" />
        <el-option label="已作废" value="1" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增卡券</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="cardCouponId" label="卡券ID" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="cardCouponName" label="名称" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="cardCouponType" label="类型" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.cardCouponType === '1' ? '抵用卡' : '优惠券' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="优惠类型" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ deductionTypeLabel(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存/已发/作废" align="center" width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.stockNum || 0 }}/{{ scope.row.issuedNum || 0 }}/{{ scope.row.cancelNum || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="undertakerType" label="承担方" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.undertakerType === '1' ? '平台' : '商户' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cancelFlag" label="状态" align="center" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cancelFlag === '1'" size="mini" type="info">已作废</el-tag>
            <el-tag v-else size="mini" type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.createTime | formatDate }}</span></template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template slot-scope="scope">
            <div class="marketing-table-actions">
              <el-button type="primary" size="mini" @click="handleIssueDetail(scope.row)">发放明细</el-button>
              <el-dropdown trigger="click" @command="(cmd) => handleMoreCommand(cmd, scope.row)">
                <el-button type="primary" size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="edit">编辑卡券</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.cancelFlag !== '1'" command="stock">增加库存</el-dropdown-item>
                  <el-dropdown-item command="detail">卡券详情</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.cancelFlag !== '1'" command="cancel" divided>作废卡券</el-dropdown-item>
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

    <el-dialog title="选择卡券类型" :visible.sync="typeDialogVisible" width="480px" append-to-body>
      <div class="card-coupon-type-picker">
        <div class="card-coupon-type-picker__item" @click="openDrawer('1')">
          <i class="el-icon-bank-card card-coupon-type-picker__icon card-coupon-type-picker__icon--voucher" />
          <div>
            <div class="card-coupon-type-picker__title">抵用卡</div>
            <div class="card-coupon-type-picker__desc">按折扣比例抵扣电费/服务费，适合固定面额类优惠</div>
          </div>
        </div>
        <div class="card-coupon-type-picker__item" @click="openDrawer('2')">
          <i class="el-icon-tickets card-coupon-type-picker__icon card-coupon-type-picker__icon--coupon" />
          <div>
            <div class="card-coupon-type-picker__title">优惠券</div>
            <div class="card-coupon-type-picker__desc">满减优惠，支持电费/服务费/总费用三选一</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <card-coupon-form-drawer
      :visible.sync="drawerVisible"
      :card-coupon-type="drawerCouponType"
      :card-coupon-id="editingCouponId"
      @saved="getList"
    />

    <card-coupon-detail-drawer
      :visible.sync="detailDrawerVisible"
      :card-coupon-id="detailCouponId"
      @edit="onDetailEdit"
    />

    <card-coupon-stock-drawer
      :visible.sync="stockDrawerVisible"
      :coupon="stockCoupon"
      @saved="getList"
    />
  </div>
</template>

<script>
import { cardCouponPage, cancelCardCoupon } from '@/api/marketing/marketing'
import CardCouponFormDrawer from './components/CardCouponFormDrawer'
import CardCouponDetailDrawer from './components/CardCouponDetailDrawer'
import CardCouponStockDrawer from './components/CardCouponStockDrawer'
import { getDeductionTypeLabel } from './constants/cardCoupon'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'cardCouponList',
  components: { CardCouponFormDrawer, CardCouponDetailDrawer, CardCouponStockDrawer },
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
      listQuery: {
        page: 1,
        limit: 10,
        cardCouponName: '',
        cardCouponType: '',
        cancelFlag: ''
      },
      typeDialogVisible: false,
      drawerVisible: false,
      drawerCouponType: '1',
      editingCouponId: '',
      detailDrawerVisible: false,
      detailCouponId: '',
      stockDrawerVisible: false,
      stockCoupon: {
        cardCouponId: '',
        cardCouponName: '',
        cardCouponType: '1',
        currentStock: 0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    deductionTypeLabel(row) {
      if (row.cardCouponType === '1') return '—'
      return getDeductionTypeLabel(row.deductionType)
    },
    getList() {
      this.listLoading = true
      cardCouponPage(this.listQuery).then(res => {
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
      this.editingCouponId = ''
      this.typeDialogVisible = true
    },
    openDrawer(type) {
      this.typeDialogVisible = false
      this.drawerCouponType = type
      this.editingCouponId = ''
      this.drawerVisible = true
    },
    handleEdit(row) {
      this.drawerCouponType = row.cardCouponType
      this.editingCouponId = row.cardCouponId
      this.drawerVisible = true
    },
    handleDetail(row) {
      this.detailCouponId = row.cardCouponId
      this.detailDrawerVisible = true
    },
    handleIssueDetail(row) {
      this.$router.push({
        name: 'cardCouponIssueList',
        query: {
          cardCouponId: row.cardCouponId,
          cardCouponName: row.cardCouponName
        }
      })
    },
    onDetailEdit(coupon) {
      if (!coupon) return
      this.handleEdit(coupon)
    },
    handleMoreCommand(command, row) {
      if (command === 'edit') {
        this.handleEdit(row)
      } else if (command === 'detail') {
        this.handleDetail(row)
      } else if (command === 'cancel') {
        this.handleCancel(row)
      } else if (command === 'stock') {
        this.openStockDrawer(row)
      }
    },
    openStockDrawer(row) {
      this.stockCoupon = {
        cardCouponId: row.cardCouponId,
        cardCouponName: row.cardCouponName,
        cardCouponType: row.cardCouponType,
        currentStock: row.stockNum || 0
      }
      this.stockDrawerVisible = true
    },
    handleCancel(row) {
      this.$confirm('确认作废该卡券？未使用的用户券将同步作废。', '提示', { type: 'warning' }).then(() => {
        cancelCardCoupon(row.cardCouponId).then(res => {
          if (res.code === 200) {
            this.$message.success('作废成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '作废失败')
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.card-coupon-type-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-coupon-type-picker__item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card-coupon-type-picker__item:hover {
  border-color: #86efac;
  box-shadow: 0 2px 12px rgba(48, 176, 143, 0.12);
}
.card-coupon-type-picker__icon {
  font-size: 32px;
}
.card-coupon-type-picker__icon--voucher {
  color: #30B08F;
}
.card-coupon-type-picker__icon--coupon {
  color: #22c55e;
}
.card-coupon-type-picker__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.card-coupon-type-picker__desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}
</style>
