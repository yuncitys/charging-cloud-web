<template>
  <div class="app-container">
		<div class="filter-container">
			<el-input v-model="searchForm.name" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入渠道名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="searchForm.code" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入渠道编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">
        查询
      </el-button>

      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" icon="el-icon-plus" @click="add"
        v-if="btnAuthen.permsVerifAuthention(':payment:method:add')">
        新增
      </el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="channelName" label="支付渠道"></el-table-column>
        <el-table-column prop="serviceProviderId" label="渠道服务商">
          <template slot-scope="scope">
						<span v-if="scope.row.serviceProviderId == 'wxpay'">微信</span>
						<span v-if="scope.row.serviceProviderId == 'alipay'">支付宝</span>
					</template>
        </el-table-column>
        <el-table-column prop="methodName" label="支付方式"></el-table-column>
        <el-table-column prop="methodCode" label="支付代码"></el-table-column>
        <!-- <el-table-column prop="enabledmark" label="状态" align="center">
            <template v-slot="scope">
                <el-switch v-model="scope.row.enabledmark"
                    active-value="1"
                    inactive-value="0"
                    @change="updateStatus(scope.row)">
                </el-switch>
            </template>
        </el-table-column> -->
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
            <template v-slot="{row}">
                <el-tooltip class="item" effect="dark" content="修改" placement="top" v-if="btnAuthen.permsVerifAuthention(':payment:method:edit')">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="edit(row)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除本条数据" placement="top" v-if="btnAuthen.permsVerifAuthention(':payment:method:delete')">
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
import {getList, del, update } from '@/api/channelPaymentInfo'
export default {
  name: 'channelPaymentInfo', // "渠道支付方式"
  components: { edit },
  data () {
    return {
      serviceProviderList: [],
      param: {
        visible: false,
        title: '新增',
        id: ''
      },
      queryTypeOptions: [
        { key: 'methodname', display_name: '支付方式' },
        { key: 'methodcode', display_name: '支付代码' }
      ],
      searchForm: {
        page: 1,
				limit: 10,
        name: '',
        code: '',
        serviceProviderId: ''
      },
      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
    }
  },
  created () {
    this.search()
    this.serviceList()
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
    async serviceList () {
      
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
    updateStatus (row) {
      debugger
      update(row.id, row).then(res => {
        this.$message.success(res.msg)
      })
    }
  }
}
</script>
