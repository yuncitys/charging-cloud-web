<template>
  <div class="app-container">
		<div class="filter-container" v-show="isAdd && isShowInfoConf">
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">
        查询
      </el-button>

      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" icon="el-icon-plus"@click="addOrUpdateHandle(null)"
        v-if="btnAuthen.permsVerifAuthention(':invoiceConfig:save')">
        新增
      </el-button>
    </div>
    <div v-show="isAdd && isShowInfoConf">
      <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column>
        <el-table-column prop="operatorName" label="运营商户" width="150"/>
        <el-table-column prop="name" label="企业抬头" width="150"/>
        <el-table-column prop="enterpriseCode" label="企业代码" width="150"/>
        <el-table-column prop="taxNumber" label="企业税号" width="150"/>
        <el-table-column prop="platformAlias" label="平台简称" width="150"/>
        <el-table-column prop="platformCode" label="平台编号" width="150"/>
        <el-table-column prop="telephoneNumber" label="联系电话" width="150"/>
        <el-table-column prop="back" label="开户行" width="150"/>
        <el-table-column prop="backAccount" label="银行卡号" width="150"/>
        <el-table-column prop="taxRate" label="税率(%)" width="150"/>
        <el-table-column prop="address" label="企业地址" width="150"/>
        <el-table-column prop="drawer" label="开票人" width="150"/>
        <el-table-column prop="checker" label="复核人" width="150"/>
        <el-table-column prop="payee" label="收款人" width="150"/>
        <el-table-column label="操作" width="180" align="center"  fixed="right">
          <template v-slot="{row}">
            <el-tooltip class="item" effect="dark" content="查看" placement="top">
              <el-button type="primary" icon="el-icon-document" size="mini" @click="viewDetail(row.id)"></el-button>
            </el-tooltip>
            <el-dropdown size="mini" type="primary">
              <el-button size="mini" type="primary" icon="el-icon-d-arrow-right" style="margin-left: 10px;">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-button icon="el-icon-s-promotion" size="mini" type="text" @click="showInvoiceInfoConf(row)">登录信息配置</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-edit" type="text" size="mini" @click="addOrUpdateHandle(row.id)"
                    v-if="btnAuthen.permsVerifAuthention(':invoiceConfig:update')">修改</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-delete" size="mini" type="text" @click="handleDel(row.id)"
                    v-if="btnAuthen.permsVerifAuthention(':invoiceConfig:delete')">删除</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="searchForm.page" :page-sizes="[10,20,30, 50]" :page-size="searchForm.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <InvoiceForm ref="invoiceForm" v-show="!isAdd" :isAdd="isAdd"></InvoiceForm>
    <InfoConf ref="InfoConfRef" v-show="!isShowInfoConf"></InfoConf>
  </div>
</template>
<script>
import InvoiceForm from './components/Form'
import InfoConf from './components/InfoConf'
import { page as getList,del,update } from '@/api/invoiceConf/invoiceConf'
export default {
  name: 'invoiceConf',
  components: { InvoiceForm,InfoConf},
  data() {
    return {
      isAdd: true,
      isShowInfoConf:true,
      param: {
        title: '新增',
        id: ''
      },
      searchForm: {
        page: 1,
				limit: 10,
      },
      channelFlagList:[
        { 'fullName': '线路一', 'enCode': '1' }, 
        { 'fullName': '线路二', 'enCode': '2' }, 
        { 'fullName': '线路三', 'enCode': '3' }
      ],
      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
    }
  },
  created() {
    this.getLists()
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
    getLists() {
      this.listLoading = true
      getList(this.searchForm).then(res => {
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
    getChannelLabel(encode){
      let label = '';
      this.channelFlagList.forEach(item => {
        if(item.enCode == encode){
          label = item.fullName;
        }
      });
      return label;
    },
    search() {
      this.getLists()
    },
    addOrUpdateHandle(id) {
      this.isAdd = false
      this.$refs.invoiceForm.reset();
      this.$refs.invoiceForm.initInfo(id);
    },
    handleDel(id) {
      this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        del(id).then(res => {
          if (res.code == 200) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.getLists()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    viewDetail(id){
      this.isAdd = false
      this.$refs.invoiceForm.reset();
      this.$refs.invoiceForm.viewDetail(id);
    },
    showInvoiceInfoConf(row){
      this.$refs.InfoConfRef.initData({name:row.name,taxNumber:row.taxNumber,id:row.id,type:row.type});
      this.isShowInfoConf = false;
      this.isAdd = true;
    }
  }
}
</script>
