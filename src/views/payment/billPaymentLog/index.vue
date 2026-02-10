<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form class="form left" ref="form" :model="searchForm" :inline="true" label-width="auto">
        <el-form-item label="">
          <el-input v-model="searchForm.serialNumber" placeholder="请输入流水号" clearable></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.paymentStatus" placeholder="支付状态" clearable>
            <el-option v-for="(item,index) in payStatusList" :key="index"
                        :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.serviceProviderId" @change="search" clearable placeholder="渠道商" class="filter-item" style="width: 180px">
              <el-option v-for="item in serviceProviderList" :key="item.enCode" :label="item.fullName" :value="item.enCode" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column prop="serviceProviderId" label="渠道服务商">
            <template slot-scope="scope">
              <span v-if="scope.row.serviceProviderId == 'wxpay'">微信</span>
              <span v-if="scope.row.serviceProviderId == 'alipay'">支付宝</span>
              <span v-if="scope.row.serviceProviderId == 'tzbank'">台州银行</span>
            </template>
        </el-table-column>
        <el-table-column prop="paymentMethodCode" label="支付方式"></el-table-column>
        <el-table-column prop="serialNumber" label="流水号" min-width="140px"></el-table-column>
        <el-table-column prop="paymentAmount" label="支付金额">
          <template v-slot="{row}">
            <span>{{ row.paymentAmount | amount }}元</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态"></el-table-column>
        <el-table-column prop="request" label="请求第三方数据">
          <template v-slot="scope">
            <el-button type="text" v-if="scope.row.request || scope.row.response"
                      @click="showReqAndRes(scope.row.request, scope.row.response, scope.row.serialNumber)"
            >查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="channelSn" label="第三方流水号" show-overflow-tooltip></el-table-column>
        <el-table-column prop="returnCode" label="支付机构返回代码"></el-table-column>
        <el-table-column prop="returnInfo" label="支付机构返回信息"></el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination :current-page="searchForm.page" :page-sizes="[10,20,30, 50]" :page-size="searchForm.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
      
      <req-and-res v-show="reqAndResVisible" ref="ReqAndRes"></req-and-res>
    </div>
  </div>
</template>
<script>
import { getList,del } from '@/api/billPaymentLog'
import ReqAndRes from './ReqAndRes'
export default {
  name: '支付日志', // "支付日志"
  components: { ReqAndRes },
  data() {
    return {
      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
      searchForm: {
        page: 1,
        limit: 10,
        paymentStatus: 11,
        serialNumber: '',
        createTimeStart: '',
        createTimeEnd: '',
        serviceProviderId: '',
        paymentMethodCode: ''
      },
      reqAndResVisible: false,
      param: {
        visible: false,
        title: '新增',
        id: ''
      },
      serviceProviderList:[
        {
          enCode: 'wxpay',
          fullName: '微信'
        },{
          enCode: 'alipay',
          fullName: '支付宝'
        },{
          enCode: 'tzbank',
          fullName: '台州银行'
        },
      ],
      payStatusList:[
        { label: '支付中', value: 10 },
        { label: '支付成功', value: 11 },
        { label: '支付失败', value: 13 },
        { label: '已撤销', value: 20 },
        { label: '退款中', value: 30 },
        { label: '已退款', value: 31 },
        { label: '退款状态未知', value: 32 },
        { label: '退款失败', value: 33 },
      ],
    }
  },
  created() {
    this.getLists();
  },
  filters: {
    amount(number) {
      return isNaN(number) ? 0.00 : parseFloat((number / 100).toFixed(2))
    }
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
    add() {
      this.param.title = '新增'
      this.param.id = undefined
      this.param.visible = true
    },
    edit(row) {
      this.param.title = '编辑'
      this.param.id = row.id
      this.param.visible = true
    },
    del(row) {
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
    showReqAndRes(req, res, serialnumber) {
      this.reqAndResVisible = true
      this.$refs.ReqAndRes.init(req, res, serialnumber)
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
