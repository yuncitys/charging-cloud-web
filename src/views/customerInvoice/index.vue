<template>
  <div class="app-container">
		<div class="filter-container">
			<el-input v-model="searchForm.email" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="用户邮箱" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="searchForm.phone" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="用户手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">
        查询
      </el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column>
        <el-table-column prop="userCode" label="用户编号" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="taxName" label="发票抬头" />
        <el-table-column prop="taxNum" label="税号" />
        <el-table-column prop="property" label="发票性质">
            <template v-slot="scope">
                <el-tag type="" v-if="scope.row.property == 1">个人</el-tag>
                <el-tag type="success" v-else>企业</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="bank" label="银行开户行" />
        <el-table-column prop="bankNum" label="银行卡号" />
        <el-table-column prop="isDefault" label="是否默认">
            <template v-slot="scope">
                <el-switch v-model="scope.row.isDefault"
                    :active-value="1"
                    :inactive-value="0"
                    disabled
                >
                </el-switch>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
            <template v-slot="{row}">
                <el-tooltip class="item" effect="dark" content="修改" placement="top" v-if="btnAuthen.permsVerifAuthention(':invoiceCustomer:addOrUpdate')">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="edit(row)"></el-button>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" content="删除本条数据" placement="top" v-if="btnAuthen.permsVerifAuthention(':invoiceCustomer:delete')">
                    <el-button @click="del(row)" icon="el-icon-delete"  size="mini" type="danger"></el-button>
                </el-tooltip>
            </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="searchForm.page" :page-sizes="[10,20,30, 50]" :page-size="searchForm.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 修改 -->
      <edit v-if="param.visible" :visible.sync="param.visible" :param="param" @search="search"></edit>
		</div>
	</div>
</template>

<script>
import edit from './components/edit'
import {page as  getList, del, get } from '@/api/customerInvoice/invoice'
export default {
  name: 'customerInvoice', // "用户发票抬头"
  components: { edit },
  data () {
    return {
      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
      param: {
        visible: false,
        title: '新增',
        id: ''
      },
      searchForm: {
        page: 1,
				limit: 10,
        email: '',
        phone: ''
      }
    }
  },
  created () {
    this.search()
  },
  methods: {
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getLists()
    },
    handleFilter() {
      this.searchForm.page = 1
      this.getLists()
    },
    search () {
      this.getLists()
    },
    add () {
      this.param.title = '新增'
      this.param.id = undefined
      this.param.visible = true
    },
    edit (row) {
      this.param.title = '编辑'
      this.param.id = row.id
      this.param.visible = true
    },
    del (row) {
      this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        del(row.id).then(res => {
          this.$message.success(res.msg)
          this.search()
        })
      })
    },
    getLists() {
      this.listLoading = true
      let listQuery = JSON.parse(JSON.stringify(this.searchForm))
      getList(listQuery).then(res => {
        if (res.code == 200) {
          console.log(res)
          this.list = res.data
          this.total = res.count
          this.listLoading = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
  }
}
</script>
