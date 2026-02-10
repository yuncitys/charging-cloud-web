<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form class="form left" ref="form" :model="searchForm" :inline="true" label-width="auto">
        <el-form-item label="">
          <el-select v-model="searchForm.paymentStatus" placeholder="请选择支付状态" clearable>
            <el-option v-for="item in payStatus" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="searchForm.paymentSn" placeholder="支付流水号" clearable style="width: 280px"></el-input>
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
        <el-table-column type="index" width="100" label="序号"/>
        <el-table-column prop="serviceProviderId" label="渠道服务商">
            <template slot-scope="scope">
              <span v-if="scope.row.serviceProviderId == 'wxpay'">微信</span>
              <span v-if="scope.row.serviceProviderId == 'alipay'">支付宝</span>
              <span v-if="scope.row.serviceProviderId == 'tzbank'">台州银行</span>
            </template>
        </el-table-column>
        <el-table-column prop="paymentMethodCode" label="支付方式"></el-table-column>
        <el-table-column prop="paymentChannelSn" label="支付渠道流水号" width="180px"></el-table-column>
        <el-table-column prop="paymentSn" label="支付流水号" width="180px">
          <template v-slot="scope">
            <router-link :to="'billTrade?paymentsn='+scope.row.paymentSn" style="color: blue;">
              {{ scope.row.paymentSn }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="paymentAccount" label="付款账号" show-overflow-tooltip></el-table-column>
        <el-table-column prop="paymentAmount" label="支付金额" width="100px">
          <template v-slot="{row}">
            <span>{{ row.paymentAmount | amount }} 元</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="paymentTime" label="支付时间"></el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.paymentStatus == 10">支付中</span>
            <span v-if="scope.row.paymentStatus == 11">支付成功</span>
            <span v-if="scope.row.paymentStatus == 13">支付失败</span>
            <span v-if="scope.row.paymentStatus == 20">已撤销</span>
          </template>
        </el-table-column>
        <el-table-column label="支付机构" header-align="center" v-if="searchForm.paymentstatus == 13">
          <el-table-column prop="returnInfo" label="返回信息"></el-table-column>
          <el-table-column prop="returnCode" label="返回代码"></el-table-column>
        </el-table-column>
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
import { getList, del } from '@/api/billPaymentInfo'
export default {
  name: '支付流水信息', // "支付流水信息"
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
        paymentSn: '',
        createTimeStart: '',
        createTimeEnd: '',
        serviceProviderId: '',
        paymentMethodCode: ''
      },
      payStatus: [
        { label: '支付中', value: 10 },
        { label: '支付成功', value: 11 },
        { label: '支付失败', value: 13 },
        { label: '已撤销', value: 20 }
      ],
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
      startTimeAndEndTime: []
    }
  },
  filters: {
    amount(number) {
      return isNaN(number) ? 0.00 : parseFloat((number / 100).toFixed(2))
    }
  },
  created() {
    this.getLists();
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
