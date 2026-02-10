<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form class="form left" ref="form" :model="searchForm" :inline="true" label-width="auto">
        <el-form-item label="">
          <el-input v-model="searchForm.paymentSn" placeholder="支付流水号" clearable/>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="searchForm.refundSn" placeholder="退款流水号" clearable/>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.refundStatus" placeholder="退款状态" clearable>
            <el-option v-for="(item,index) in refundStatusList" :key="index"
                        :value="item.enCode" :label="item.fullName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="">
            <el-select v-model="searchForm.serviceProviderId" @change="search" clearable placeholder="渠道商" class="filter-item" style="width: 180px">
                <el-option v-for="item in serviceProviderList" :key="item.enCode" :label="item.fullName" :value="item.enCode" />
            </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-date-picker
            v-model="startTimeAndEndTime"
            type="datetimerange"
            @change="aeTimer"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            style="width: 380px;"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="index" width="50" align="center" label="序号"/>
        <el-table-column prop="serviceProviderId" label="渠道服务商">
            <template slot-scope="scope">
              <span v-if="scope.row.serviceProviderId == 'wxpay'">微信</span>
              <span v-if="scope.row.serviceProviderId == 'alipay'">支付宝</span>
              <span v-if="scope.row.serviceProviderId == 'tzbank'">台州银行</span>
            </template>
        </el-table-column>
        <el-table-column prop="paymentMethodCode" label="支付方式"></el-table-column>
        <el-table-column prop="refundAccount" label="收款账号" min-width="100"/>
        <el-table-column prop="refundSn" label="退款流水号" min-width="150"/>
        <el-table-column prop="paymentSn" label="支付流水号" min-width="150"/>
        <el-table-column prop="refundChannelSn" label="退款渠道流水号" min-width="150"/>
        <el-table-column prop="refundAmount" label="退款金额">
          <template v-slot="{row}">
            <span>{{ row.refundAmount | amount }}元</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundTime" label="退款时间"></el-table-column>
        <el-table-column prop="refundStatus" label="退款状态"></el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination :current-page="searchForm.page" :page-sizes="[10,20,30, 50]" :page-size="searchForm.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import { getList,del } from '@/api/billRefundInfo'
export default {
  name: '退款流水', // "退款流水"
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
        refundStatus: 31,
        paymentSn: '',
        refundSn: '',
        createTimeStart: '',
        createTimeEnd: '',
        serviceProviderId: '',
        paymentMethodCode: ''
      },
      param: {
        visible: false,
        title: '新增',
        id: ''
      },
      refundStatusList: [
        { fullName: '退款中', enCode: 30 },
        { fullName: '已退款', enCode: 31 },
        { fullName: '退款失败', enCode: 32 },
      ],
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
      startTimeAndEndTime: [],
    }
  },
  created() {

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
    aeTimer(e) {
      if (e) {
        this.searchForm.createTimeStart = e[0]
        this.searchForm.createTimeEnd = e[1]
      } else {
        this.searchForm.createTimeStart = ''
        this.searchForm.createTimeEnd = ''
      }
    },
    search() {
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
