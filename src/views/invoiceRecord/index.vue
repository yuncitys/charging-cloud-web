<template>
  <div class="app-container">
    <div class="filter-container" >
      <el-input v-model="searchForm.email" style="width: 150px;margin-right: 20px ;" class="filter-item"
        placeholder="用户邮箱" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-input maxlength="11" minlength="11" v-model="searchForm.phone" style="width: 150px;margin-right: 20px ;" class="filter-item"
        placeholder="用户电话" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-input maxlength="30" v-model="searchForm.buyerTaxName" style="width: 150px;margin-right: 20px ;" class="filter-item"
        placeholder="发票抬头" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-select v-model="searchForm.invoiceState" placeholder="开票状态" style="width: 150px;margin-right: 20px ;" class="filter-item" clearable>
        <el-option v-for="item in invoiceStateOption" :key="item.value" :value="item.value" :label="item.name"></el-option>
      </el-select>
      <el-select v-model="searchForm.invoiceType" placeholder="发票类型" style="width: 150px;margin-right: 20px ;" class="filter-item" clearable>
        <el-option v-for="item in invoiceTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
      </el-select>
      <el-date-picker style="margin-right: 20px ;" class="filter-item"
        v-model="timeRange" type="daterange" @change="timerVal"
        value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']"
        start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>

      <div style="margin: 15px 0;">
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
          icon="el-icon-search">
          查询
        </el-button>
        <el-button type="primary" style="margin-right: 20px ;" class="filter-item" icon="el-icon-plus" @click="electronInvoice(null, 0)"
          v-if="btnAuthen.permsVerifAuthention(':invoice:electronInvoiceById')">
          批量开票
        </el-button>
			</div>

      <div style="display: flex; justify-content: flex-end;">
        <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="invoiceStatus"
          v-if="btnAuthen.permsVerifAuthention(':invoiceLoginConfig:validateLogin')">登录</el-button>
        <el-button type="danger" style="margin-right: 20px ;" class="filter-item" @click="queryFaceRecognitionCode(1)"
          v-if="btnAuthen.permsVerifAuthention(':invoiceLoginConfig:queryFaceRecognitionCode')">人脸验证</el-button>
      </div>
    </div>

    <el-table v-loading="listLoading" :key="tableKey" :data="list" @selection-change="handleSelectionChange" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
      <el-table-column type="index" width="55" label="序号" align="center">
        <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
      </el-table-column>
      <el-table-column type="selection" :selectable="selectable" width="60" align="center"></el-table-column>
      <el-table-column prop="buyerTel" label="手机号" min-width="150"></el-table-column>
      <el-table-column prop="buyerEmail" label="收件邮箱" width="180">
        <template v-slot="scope">
          <router-link class="font-blue" :to="`/customer/customerinvoice?email=${scope.row.buyerEmail}`">{{ scope.row.buyerEmail }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="buyerTaxName" label="发票抬头" min-width="150"></el-table-column>
      <el-table-column prop="buyerTaxNum" label="企业税号" min-width="150"></el-table-column>
      <!-- 发票流水-发票方生成（部分）-->
      <el-table-column prop="invoiceNo" label="发票号码" min-width="150"></el-table-column>
      <el-table-column prop="invoiceType" label="发票类型" min-width="100">
        <template v-slot="scope">
          <el-tag v-if="scope.row.invoiceType === 1">蓝票</el-tag>
          <el-tag type="danger" v-else>冲红</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="invoiceState" label="状态" min-width="100">
        <template v-slot="scope">
          <el-tag :type="getInvoiceClass(scope.row.invoiceState)" effect="dark">
            {{ getInvoiceState(scope.row.invoiceState) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="invoiceTaxPrice" label="税额">
        <template v-slot="scope">
          {{ Number(scope.row.invoiceTaxPrice) * 0.01 }}元
        </template>
      </el-table-column>
      <el-table-column prop="invoiceExTaxPrice" label="不含税额">
        <template v-slot="scope">
          {{ Number(scope.row.invoiceExTaxPrice) * 0.01 }}元
        </template>
      </el-table-column>
      <el-table-column prop="invoicePrice" label="总金额">
        <template v-slot="scope">
          {{ Number(scope.row.invoicePrice) * 0.01 }}元
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="140"/>
      <el-table-column prop="invoiceTime" label="开票时间" width="140"/>
      <el-table-column prop="invoiceRote" label="备注"></el-table-column>
      <el-table-column label="操作" fixed="right" width="100">
        <template v-slot="scope">
          <el-dropdown size="mini" type="primary">
            <el-button type="success" size="mini">更多<i class="el-icon-arrow-down el-icon--right"></i></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="(scope.row.invoiceState === '0' || scope.row.invoiceState === '22')">
                <el-button size="mini" type="text" icon="el-icon-s-promotion" :loading="downloadLoading"
                  @click="electronInvoice(scope.row.id, 1)" v-if="btnAuthen.permsVerifAuthention(':invoice:electronInvoiceById')"
                  >开票
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item v-if="scope.row.invoiceState === '20'">
                <el-button size="mini" type="text" icon="el-icon-refresh"
                  @click="updateInvoiceInfo(scope.row.id)" v-if="btnAuthen.permsVerifAuthention(':invoice:updateElectron')"
                  >更新开票信息
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item v-if="scope.row.invoiceState === '30'">
                <el-button size="mini" type="text" icon="el-icon-refresh"
                   @click="updateInvoiceBloodInfo(scope.row.id)" v-if="btnAuthen.permsVerifAuthention(':invoice:updateApplyRedElectron')"
                  >更新开票冲红信息
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item v-if="(scope.row.invoiceState === '4')">
                <el-button size="mini" type="text" icon="el-icon-s-promotion" :loading="downloadLoading"
                  @click="resendPush(scope.row.id)" v-if="btnAuthen.permsVerifAuthention(':invoice:resend')"
                  >发送给用户
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item v-if="scope.row.invoicePdfUrl !==null && scope.row.invoicePdfUrl !== ''">
                <el-button size="mini" type="text" icon="el-icon-download" :loading="downloadLoading"
                           @click="getInvoiceByApi(scope.row.invoicePdfUrl)"
                >下载
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item v-if="(scope.row.invoiceState === '2' || scope.row.invoiceState === '32') && scope.row.invoiceType === 1">
                <el-button size="mini" type="text" icon="el-icon-video-pause"
                  @click="redApply(scope.row.invoiceSerialNo)" v-if="btnAuthen.permsVerifAuthention(':invoice:applyRedInvoice')"
                  >冲红
                </el-button>
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

    <redApplyInvoice ref="redApplyInvoice"></redApplyInvoice>

    <el-dialog class="el-form-login"
               title="提示"
               :visible.sync="dialogLoginVisible"
               width="540px"
               :show-close="false">
      <div style="text-align: center; line-height: 3;">登录已失效，请重新登录</div>
      <div>
        <el-form :model="invoice" :inline="false" label-width="80px">
          <el-form-item label="账号">
            <el-input v-model="invoice.account" placeholder="请输入账号" maxlength="50" style="width: 300px;"></el-input>
          </el-form-item>
          <el-form-item label="验证码">
            <el-input v-model="invoice.sms" placeholder="请输入验证码" maxlength="8" style="width: 200px;"></el-input>
            <el-button type="primary" @click="sendSms" :disabled="isSendSms">{{ isSendSms ? `已发送${timer}s` : '发送验证码'}}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogLoginVisible = false">取 消</el-button>
        <el-button type="primary" @click="initLogin" :loading="isLogin">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog class="el-form-login" title="请人脸识别验证" :visible.sync="dialogFaceVisible" width="30%" :show-close="true">
      <div class="verification-tip" v-if="verificationFlag == 1 || verificationFlag == 2">
        <span class="success-tip" v-if="verificationFlag == 1">验证已通过，可关闭弹窗开票</span>
        <span class="fail-tip" v-if="verificationFlag == 2">验证未通过，请不要关闭弹窗</span>
      </div>
      <div v-if="QRCodeImg !== null" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="margin-bottom: 10px;">二维码 <Countdown ref="countdown" @countdownEnd="countdownEnd"></Countdown> 后失效</div>
        <el-image :src="`data:image/jpg;base64,${QRCodeImg}`"></el-image>
      </div>
      <div class="default-qr" v-else>
        <i class="el-icon-picture qrcode"></i>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" icon="el-icon-refresh" @click="queryFaceRecognitionCode(1)" :loading="loadingFlag">刷新</el-button>
        <el-button type="primary" icon="el-icon-search" @click="verification()">查询验证</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Countdown from '@/components/Countdown'
import { 
  isLogin, 
  resendPush, 
  getMobilePhone, 
  getVerificationCode, 
  validateLogin, 
  queryFaceRecognitionCode, 
  electronInvoiceById, 
  queryFaceRecognitionResult,
  updateElectron,
  updateRedApplyElectron,
  page as getList,
} from '@/api/invoice'
import redApplyInvoice from './components/redApplyInvoice'

export default {
  name: 'invoiceRecrod', // 开票记录
  components: { redApplyInvoice,Countdown },
  data() {
    return {
      timeOutKey: null,
      selectRow: [],
      timeRange: [],
      LoginStatus: false, //登录状态
      isLogin: false,
      isSendSms: false,
      dialogLoginVisible: false,
      dialogFaceVisible: false,
      downloadLoading: false,
      QRCodeImg: null,
      verificationFlag:0,
      loadingFlag:false,
      invoice:{
        isLogin: false,
        account: null,
        sms: null
      },
      searchForm: {
        page: 1,
        limit: 10,
        phone: '',
        email: '',
        buyerTaxName: '',
        invoiceState: '',
        invoiceType: '',
        startTime: '',
        endTime: ''
      },
      timer: 60,
      isFirstRequest: true,
      // 发票状态：0未开票，2开票完成，20开票中，22开票失败，3发票已冲红，30发票冲红中，32冲红失败
      invoiceStateOption: [
        { name: '未开票', value: 0 },
        { name: '开票完成', value: 2 },
        { name: '开票中', value: 20 },
        { name: '开票失败', value: 22 },
        { name: '已冲红', value: 3 },
        { name: '待发送', value: 4 },
        { name: '冲红中', value: 30 },
        { name: '冲红失败', value: 32 }
      ],
      invoiceTypeList: [
        { label: '蓝票', value: 1 },
        { label: '红票', value: 2 }
      ],
      stat:null,
      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
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
    timerVal(value) {
      if(value){
        this.searchForm.startTime = value[0]
        this.searchForm.endTime = value[1]
      }else{
        this.searchForm.startTime = ''
        this.searchForm.endTime = ''
      }
      this.search()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectRow = selection.map(item => item.id);
    },
    selectable(row, index){
      return (row.invoiceState === '0' || row.invoiceState === '22');
    },
    invoiceStatus(){
      const vm = this;
      isLogin().then(res => {
        vm.dialogLoginVisible = !vm.invoice.isLogin
        getMobilePhone().then(res1 => {
          vm.invoice.account = res1.data
        })
      })
    },
    closeAll(){
      this.dialogFaceVisible = false
      clearTimeout(this.timeOutKey);
    },
    queryFaceRecognitionCode(type){
      // clearTimeout(this.timeOutKey);
      this.loadingFlag=true;
      this.verificationFlag = 0;
      queryFaceRecognitionCode(type).then(res => {
        this.loadingFlag=false;
        if(res.code === 605){
          this.$message.error("请先前去登录!");
          return
        }
        this.dialogFaceVisible = true

        if(res.code === 200){
          this.QRCodeImg = res.data
          this.dialogLoginVisible = false;
          if(this.$refs.countdown){
            this.$refs.countdown.init();
          }
          // this.timeOutKey = setTimeout(() => {
          //   this.queryFaceRecognitionCode(0)
          // }, 10000)
        } else if(res.code === 505){
          this.$message.error("刷新失败,请再次手动刷新");
        }
      })
    },
    verification(){
      queryFaceRecognitionResult().then(res=>{
        if(res.code == 200){
          if(res.data){
            this.verificationFlag = 1;
          }else{
            this.verificationFlag = 2;
          }
        }
      })
    },
    countdownEnd(){
      this.QRCodeImg=null;
    },
    initLogin(){
      this.isLogin = true
      validateLogin(this.invoice).then(res => {
        this.isLogin = false
        if(res.code === 200){
          if(res.data.resultCode && res.data.resultCode == '9999'){
            this.$message.error(res.data.resultMsg)
          }else{
            this.dialogLoginVisible = false
            this.queryFaceRecognitionCode(1)
          }
        }
      }).catch(err=>{
        this.isLogin = false
        this.$message.error('登录服务异常')
      })
    },
    sendSms(){
      if(!this.invoice.account){
        this.$message.error('请输入账号')
        return
      }
      if(!this.isSendSms){
        this.isSendSms = true
        getVerificationCode(this.invoice.account).then(res => {
          if(res.code === 200){
            if(res.data.code){
              this.isSendSms = false
              this.$message.error(res.data.msg)
            }else if(res.data.resultCode){
              this.isSendSms = false
              this.$message.error(res.data.resultMsg)
            }else{
              let c =  setInterval(() => {
                this.timer --;
                if(this.timer === 0){
                  this.isSendSms = false
                  this.timer = 60
                  clearInterval(c);
                }
              }, 1000)
            }
          }else{
            this.isSendSms = false
            this.$message.error(res.msg)
          }
        }).catch( err =>{
          this.isSendSms = false
        })
      }

    },
    resendPush(id){
      let data = [id]
      resendPush(data).then(res => {
        if(res.code === 200){
          this.$message.success("发送成功")
        }else{
          this.$message.error(res.msg)
        }
      })
    },
    electronInvoice(id, type){
      const vm = this
      let data = []
      if(type === 1){
        data.push(id)
      }else{

        if(vm.selectRow.length === 0){
          this.$message.error('请选择要操作的内容')
          return
        }

        // vm.selectRow.forEach(item=>{
        //   data.push(item.id)
        // })
        data = vm.selectRow
      }
      electronInvoiceById(data).then(res => {
        if(res.code == 200){
          this.$message.success(res.msg)
        }else{
          this.$message.error(res.msg)
        }
      })
    },
    updateInvoiceInfo(id){
      updateElectron(id).then(res => {
        if(res.code == 200){
          this.$message.success('更新开票信息成功')
        }else{
          this.$message.error(res.msg)
        }
      })
    },
    updateInvoiceBloodInfo(id){
      updateRedApplyElectron(id).then(res => {
        if(res.code == 200){
          this.$message.success('更新开票冲红信息成功')
        }else{
          this.$message.error(res.msg)
        }
      })
    },
    search() {
      this.getLists();
    },
    getInvoiceClass(state) {
      let stateText = 'primary'
      switch (state) {
        case '2':
          stateText = 'success'
          break
        case '20':
          stateText = 'warning'
          break
        case '22':
        case '32':
          stateText = 'info'
          break
        case '3':
        case '30':
          stateText = 'info'
          break
        default:
          stateText = 'primary'
      }
      return stateText
    },
    getInvoiceState(state) {
      const invoiceStateOption = this.invoiceStateOption
      const stateItem = invoiceStateOption.filter(item => {
        return item.value === Number(state)
      })
      return stateItem[0].name
    },
    getInvoiceByApi(pdfUrl) {
      window.location.href = pdfUrl
    },
    redApply(invoiceSerialNo) {
      this.$refs.redApplyInvoice.param.propVisible = true
      this.$refs.redApplyInvoice.form.serialNo = invoiceSerialNo
    },
    refresh() {
      const vm = this
      this.$router.push(this.$route.path)
      setTimeout(() => {
        vm.searchForm.id = null
        vm.search()
      })
    },
    summaryAmount(){
      summaryAmount(this.searchForm).then(res=>{
        if(res.code == 200){
          this.stat = res.data;
        }
      })
    },
    exportExcel() {
      this.exportLoading = true
    }
  }
}
</script>


<style lang="scss" scoped>
</style>
