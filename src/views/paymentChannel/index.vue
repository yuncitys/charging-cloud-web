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
        v-if="btnAuthen.permsVerifAuthention(':payment:channel:add')">
        新增
      </el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column>
        <el-table-column prop="channelName" label="渠道名称"></el-table-column>
        <el-table-column prop="channelCode" label="渠道代码"></el-table-column>
        <el-table-column prop="serviceProviderId" label="渠道服务商">
          <template slot-scope="scope">
						<span v-if="scope.row.serviceProviderId == 'wxpay'">微信</span>
						<span v-if="scope.row.serviceProviderId == 'alipay'">支付宝</span>
					</template>
        </el-table-column>
        <el-table-column prop="channelAccount" label="渠道账号"></el-table-column>
        <el-table-column prop="channelPassword" label="渠道密码"></el-table-column>
        <el-table-column prop="adminPeople" label="负责人"></el-table-column>
        <el-table-column label="操作" width="150">
            <template v-slot="{row}">
                <el-tooltip class="item" effect="dark" content="修改" placement="top" v-if="btnAuthen.permsVerifAuthention(':payment:channel:edit')">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="edit(row)"></el-button>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" content="删除本条数据" placement="top" v-if="btnAuthen.permsVerifAuthention(':payment:channel:delete')">
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
import { getList, del, update } from '@/api/channelConfigInfo'
export default {
  name: 'channelConfigInfo', // "渠道信息"
  components: { edit },
  data () {
    return {
      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
      options: [{
        value: '1',
        label: '微信'
      }, {
        value: '0',
        label: '支付宝'
      }],
      param: {
        visible: false,
        title: '新增',
        id: ''
      },
      searchForm: {
        page: 1,
				limit: 10,
        name: '',
        code: '',
        serviceProviderId: ''
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
    updateStatus(e) {
     update(e.id, {'enabledmark': e.enabledmark}).then(res => {
        if(res.code == 200){
          this.$message.success(res.msg)
        }else{
          this.$message.error(res.msg)
        }
      })
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
