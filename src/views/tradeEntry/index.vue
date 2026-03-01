<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.merName" placeholder="商户名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.busTradeMerNo" placeholder="商户编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增进件
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户编号" prop="busTradeMerNo" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.busTradeMerNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户名称" prop="merName" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.merName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户类型" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.merType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="联系人" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.managerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120" align="center">
        <template slot-scope="{row}">
          <span>{{ row.managerMobile }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { listTradeEntry, delTradeEntry } from '@/api/pay/tradeEntry'
import Pagination from '@/components/Pagination'

export default {
  name: 'TradeEntryList',
  components: { Pagination },
  filters: {
    typeFilter(status) {
      const statusMap = {
        '0': '交易商户',
        '1': '普通商户'
      }
      return statusMap[status] || status
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        merName: undefined,
        busTradeMerNo: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listTradeEntry(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        // Mock data for demonstration if API fails or is not implemented
        this.list = [
          {
            id: 1,
            busTradeMerNo: 'M001',
            merName: '测试商户1',
            merType: '0',
            managerName: '张三',
            managerMobile: '13800138000'
          }
        ]
        this.total = 1
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/tradeEntry/add')
    },
    handleUpdate(row) {
      this.$router.push('/tradeEntry/edit/' + row.id)
    },
    handleDelete(row) {
      this.$confirm('确认删除该商户?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delTradeEntry(row.id).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getList()
        })
      })
    }
  }
}
</script>
