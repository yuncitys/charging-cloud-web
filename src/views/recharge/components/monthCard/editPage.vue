<template>
	<div style="display: inline-block;">
        <el-button type="primary" @click="" style="margin-left: 10px;"
        	@click="showDidlaoEditData()" size="mini"
        	v-if="btnAuthen.permsVerifAuthention(':sys:month:card:edit')">编辑
        </el-button>

		<!-- 编辑月卡套餐-->
		<el-dialog :visible.sync="showEdit" title="编辑月卡套餐" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px" style="margin-left:50px;" :rules="rules">
        <el-form-item :label="'套餐名称'" prop="name">
        	<el-input v-model="editData.name" placeholder="请输入套餐名称" clearable style="width: 60%;" class="name" />
        </el-form-item>
        <el-form-item :label="'归属运营商'" prop="adminId">
        	<el-select style="width: 100%;" class="filter-item" v-model="editData.adminId" filterable clearable
          placeholder="请选择运营商" @change="handleChange">
        	    <el-option
        	      v-for="item in operatorList"
        	      :key="item.id"
        	      :label="item.adminFullname"
        	      :value="item.id">
        	    </el-option>
        	</el-select>
        </el-form-item>
        <el-form-item :label="'运营充电站'" prop="chargingStationId">
        	<el-select style="width: 100%;" class="filter-item" v-model="editData.chargingStationId"
            filterable clearable :disabled="isDisabled" placeholder="请选择充电站">
        	    <el-option
        	      v-for="item in chargingStationList"
        	      :key="item.id"
        	      :label="item.networkName"
        	      :value="item.id">
        	    </el-option>
        	</el-select>
        </el-form-item>
        <el-form-item :label="'月卡类型'" prop="monthCardType">
        	<div id="">
        		<el-radio-group v-model="editData.monthCardType">
        			<el-radio v-for="(item,index) in monthCardTypeList" :key="index" :label="index">{{item.title}}
        			</el-radio>
        		</el-radio-group>
        	</div>
        </el-form-item>
        <div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;">
        	<h2 v-if="editData.monthCardType === 0">
            仅充电
          </h2>
          <h2 v-if="editData.monthCardType === 1">
            仅停车
          </h2>
          <el-form-item :label="'包月方式'" prop="chargingMonthType">
          	<div id="">
          		<el-radio-group v-model="editData.chargingMonthType">
          			<el-radio :label="1">限次包月</el-radio>
                <el-radio :label="2">限总时长包月</el-radio>
          		</el-radio-group>
          	</div>
          </el-form-item>

          <el-form-item v-if="editData.chargingMonthType === 1">
            <div style="display: flex;align-items: center;">
              <div style="width: 100px;">
              	<span>单月总次数</span>
              </div>
              <div>
              	<el-input placeholder="请输入次数" v-model="editData.monthTotal" type="number" style="width: 180px;">
              		<template slot="append">次</template>
              	</el-input>
              </div>
            	<div style="width: 100px;">
            		<span>单日总次数</span>
            	</div>
            	<div>
            		<el-input placeholder="请输入次数" v-model="editData.dayTotal" type="number" style="width: 180px;">
            			<template slot="append">次</template>
            		</el-input>
            	</div>
            </div>
          </el-form-item>
          <el-form-item v-if="editData.chargingMonthType === 2">
            <div style="display: flex;align-items: center;">
              <div style="width: 100px;">
              	<span>单月总时长</span>
              </div>
              <div>
              	<el-input placeholder="请输入时长" v-model="editData.monthTotal" type="number" style="width: 180px;">
              		<template slot="append">分钟</template>
              	</el-input>
              </div>
            	<div style="width: 100px;">
            		<span>单日总时长</span>
            	</div>
            	<div>
            		<el-input placeholder="请输入时长" v-model="editData.dayTotal" type="number" style="width: 180px;">
            			<template slot="append">分钟</template>
            		</el-input>
            	</div>
            </div>
          </el-form-item>
        </div>

        <el-form-item :label="'购买权限'" prop="buyLimit">
        	<div id="">
        		<el-radio-group v-model="editData.buyLimit">
        			<el-radio :label="0">无限制</el-radio>
              <!-- <el-radio :label="1">仅小区用户</el-radio> -->
        		</el-radio-group>
        	</div>
        </el-form-item>
        <el-form-item :label="'续费规则'" prop="renewType">
          <el-radio-group v-model="editData.renewType">
                <el-radio :label="0">常规续费</el-radio>
                <el-radio :label="1">从过期时间开始续</el-radio>
          </el-radio-group>
          <el-alert
            v-if="editData.renewType === 0"
            title="常规续费：用户选择续费时长(月数X)，若当前已过期则从当前时间开始续费X个月，若当前未过期则按实际过期时间开始续费X个月。"
            type="info"
            show-icon/>
          <el-alert
            v-if="editData.renewType === 1"
            title="从过期开始续费：从月卡当前的过期时间续费X个月（该方式相当于收取了空白期费用）"
            type="info"
              show-icon/>
        </el-form-item>
        <el-form-item label-width="120px" label="是否开通虚拟卡" prop="virtualCardEnabled">
          <el-switch
            v-model="editData.virtualCardEnabled"
            active-text="开启"
            inactive-text="关闭"
            active-color="#67c23a">
          </el-switch>
          <!-- 提示信息 -->
          <el-alert
            v-if="!editData.virtualCardEnabled"
            title="关闭后购买该月卡需填写实体卡卡号"
            type="info"
            show-icon/> <!--style="display: inline-block; vertical-align: middle;"-->
        </el-form-item>

        <div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;margin-bottom: 30px;margin-top: 10px;">
        	<h2>收费标准</h2>
        	<div style="margin-left: 20px;">
        		<div class="flex" style="align-items: center;">
        			<div>
        				<el-button type="primary" @click="addForm('add')">添加标准</el-button>
        			</div>
        		</div>
        	</div>
        	<div style="margin: 30px 0;margin-left: 20px;">
        		<div v-for="(item, index) in editData.monthPriceConfig.priceConfig" :key="index" class="formItem">
        			<div style="display: flex;align-items: center;">
        				<div>
        					<div class="flex inputBoxx" style="align-items: center;">
        						<div class="inputCom">
        							<el-input v-model="editData.monthPriceConfig.priceConfig[index].month" clearable type="number">
        								<template slot="append">月</template>
        							</el-input>
        						</div>
        						<div style="width: 20px;text-align: center;">/</div>
        						<div class="inputCom">
        							<el-input v-model="editData.monthPriceConfig.priceConfig[index].money" clearable type="number">
        								<template slot="append">元</template>
        							</el-input>
        						</div>
        					</div>
        				</div>
        				<div class="inputBtnn" style="margin-left: 30px; margin-top: 20px !important;">
        					<el-button type="danger" @click="delForm(index,'add')">删除</el-button>
        				</div>
        			</div>
        		</div>
        	</div>
        </div>

				<el-form-item>
					<el-button type="primary" @click="onEditData('editData')">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		page,
    edit,
	} from '@/api/monthCard/monthCardList.js'
  import {
    getOperator
  } from '@/api/agent/agentList.js'
  import {
    getChargingStationList
  } from '@/api/netWorkDot/netWorkDotList.js'
	import {
		parseTime
	} from '@/utils/index'
	import qs from 'qs'
	export default {
		name: 'editMonthCard',
    props:{
    	row_data:{
    		type:Object
    	}
    },
		data() {
			return {
				showEdit: false,
        isDisabled: true,
        operatorList: [],
        chargingStationList: [],
				editData: {
          id:'',
          name:'',
          monthCardType:0,
          adminId: '',
          virtualCardEnabled: true,
          chargingMonthType:1,
          monthTotal:0,
          dayTotal:0,
          buyLimit: 0,
          renewType: 1,
          monthPriceConfig:{
            "priceConfig":
            [
              {
                month:'',
                money:''
              }
            ]
          },
          chargingStationId: '',
				},
				rules: {
					name: [{
						required: true,
						message: '请输入套餐名称',
						trigger: 'blur'
					}],
          adminId: [{
          	required: true,
          	message: '请选择运营商',
          	trigger: 'blur'
          }],
					monthCardType: [{
						required: true,
						message: '请选择月卡类型',
						trigger: 'blur'
					}],
          chargingMonthType: [{
          	required: true,
          	message: '请选择包月方式',
          	trigger: 'blur'
          }],
          buyLimit: [{
          	required: true,
          	message: '请选择购买权限',
          	trigger: 'blur'
          }],
          renewType: [{
          	required: true,
          	message: '请选择续费规则',
          	trigger: 'blur'
          }],
          virtualCardEnabled: [{
          	required: true,
          	message: '请选择是否开通虚拟卡',
          	trigger: 'blur'
          }],
          chargingStationId: [{
          	required: true,
          	message: '请选择运营站点',
          	trigger: 'blur'
          }],
				},
        monthCardTypeList: [{
        	id: 1,
        	monthCardType: 0,
        	title: "仅充电"
        },{
        	id: 2,
        	monthCardType: 1,
        	title: "仅停车"
        }],
			}
		},
		methods: {
      showDidlaoEditData() {
      	let item=this.row_data
        console.log(item,"编辑参数")
      	this.showEdit = true
      	this.editData.id = item.id
      	this.editData.name = item.name
      	this.editData.monthCardType = item.monthCardType
        this.editData.buyLimit = item.buyLimit
        this.editData.renewType = item.renewType
        this.editData.adminId = item.adminId
        this.editData.virtualCardEnabled = item.virtualCardEnabled === 1 ? true : false
        this.editData.chargingMonthType = item.chargingMonthType
        this.editData.monthTotal = item.monthTotal
        this.editData.dayTotal = item.dayTotal
        this.editData.monthPriceConfig = JSON.parse(item.monthPriceConfig)
        console.log(this.editData,"编辑参数")
      },
			onEditData(formName) {
        if (this.editData.name == '') {
          this.$message.error('请输入套餐名称')
          return false
        }
        if (this.editData.chargingMonthType == '') {
          this.$message.error('包月类型不能为空')
          return false
        }
        if (this.editData.monthTotal == '') {
          this.$message.error('必填项不能为空')
          return false
        }
        if (this.editData.dayTotal == '') {
          this.$message.error('必填项不能为空')
          return false
        }
        if (this.editData.monthPriceConfig.priceConfig.length === 0) {
          this.$message.error('最少添加一项收费标准')
          return false
        }
        console.log(this.editData,"请求参数")
        this.editData.monthPriceConfig = JSON.stringify(this.editData.monthPriceConfig)
        console.log(this.editData,"请求参数")
        console.log("通过")
        edit(this.editData).then(res => {
          if (res.code == 200) {
            this.showEdit = false
            this.resetForm(formName)
            this.$emit('getLists')
            this.$message.success(res.msg)
          } else {
            this.$message.error(res.msg)
          }
          this.editData.monthPriceConfig = JSON.parse(this.editData.monthPriceConfig)
          console.log(this.editData)
        })
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      //添加标准
      addForm(type) {
        let length = this.editData.monthPriceConfig.priceConfig.length;
        if (length >= 6){
          this.$message.error('最多添加6个收费标准')
          return false
        }
      	let index = length - 1
      	let duration = this.editData.monthPriceConfig.priceConfig[index]
        if (duration.month <= 0 ){
          this.$message.error('月数不能低于0')
          return false
        }
        if (duration.money <= 0 ){
          this.$message.error('金额不能低于0')
          return false
        }
      	let obj = {
      		month: '',
      		money: '',
      	}
      	console.log(obj)
      	this.editData.monthPriceConfig.priceConfig.push(obj)
      },
      //删除标准
      delForm(index, type) {
      	let duration = this.editData.monthPriceConfig.priceConfig || []
      	if (duration.length === 1) {
      		this.$message.error('至少有一个收费标准')
      		return false
      	}
      	this.editData.monthPriceConfig.priceConfig.splice(index, 1)
      	this.editData.monthPriceConfig.priceConfig.splice(index, 1)
      },
      handleChange(value) {
        console.log('选中的值是:', value);
        this.isDisabled = false
        this.getChargingStationList(value)
      },
      getOperator() {
      	getOperator().then(res => {
      		if (res.code == 200) {
      			this.operatorList = res.data
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      getChargingStationList(adminId) {
          let data = {
            adminId
          }
        	getChargingStationList(data).then(res => {
        		if (res.code == 200) {
        			this.chargingStationList = res.data;
        		} else {
        			this.$message.error(res.msg)
        		}
        	})
      },
		},
		created() {
      this.getOperator()
		},
	}
</script>

<style scoped="scoped">
	.flex {
		display: flex;
	}
  .inputBoxx {
  	margin-top: 20px !important;
  	width: 100%;
  }
</style>
