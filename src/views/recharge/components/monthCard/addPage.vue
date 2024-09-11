<template>
	<div style="display: inline-block;">
        <el-button style="margin-right: 20px ;" type="primary" @click="showAdd=true" class="filter-item"
        	v-if="btnAuthen.permsVerifAuthention(':sys:month:card:add')">新增套餐</el-button>

		<!-- 新增方案-->
		<el-dialog :visible.sync="showAdd" title="新增月卡套餐" @close="showAdd = false" :append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="100px" style="margin-left:50px;" :rules="rules">

        <el-form-item :label="'套餐名称'" prop="name">
        	<el-input v-model="addData.name" placeholder="请输入套餐名称" clearable style="width: 60%;" class="name" />
        </el-form-item>
        <!-- <el-form-item :label="'小区'" prop="adminId">
        	<el-autocomplete class="filter-item" v-model="addData.netWorkDotName" :fetch-suggestions="querySearch"
        		placeholder="请选择小区" @select="changeNetworkDot" clearable :debounce='0' style="width: 60%;"
        		@change="changeName"></el-autocomplete>
        </el-form-item> -->
        <el-form-item :label="'月卡类型'" prop="monthCardType">
        	<div id="">
        		<el-radio-group v-model="addData.monthCardType">
        			<el-radio v-for="(item,index) in monthCardTypeList" :key="index" :label="index">{{item.title}}
        			</el-radio>
        		</el-radio-group>
        	</div>
        </el-form-item>
        <div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;">
        	<h2 v-if="addData.monthCardType === 0">
            仅充电
          </h2>
          <h2 v-if="addData.monthCardType === 1">
            仅停车
          </h2>
          <el-form-item :label="'包月方式'" prop="chargingMonthType">
          	<div id="">
          		<el-radio-group v-model="addData.typeRuleConfig.chargingMonthType">
          			<el-radio :label="1">限次包月</el-radio>
                <el-radio :label="2">限总时长包月</el-radio>
          		</el-radio-group>
          	</div>
          </el-form-item>

          <el-form-item v-if="addData.typeRuleConfig.chargingMonthType === 1">
            <div style="display: flex;align-items: center;">
              <div style="width: 100px;">
              	<span>单月总次数</span>
              </div>
              <div>
              	<el-input placeholder="请输入次数" v-model="addData.typeRuleConfig.ruleConfig.monthTotal" type="number" style="width: 180px;">
              		<template slot="append">次</template>
              	</el-input>
              </div>
            	<div style="width: 100px;">
            		<span>单日总次数</span>
            	</div>
            	<div>
            		<el-input placeholder="请输入次数" v-model="addData.typeRuleConfig.ruleConfig.dayTotal" type="number" style="width: 180px;">
            			<template slot="append">次</template>
            		</el-input>
            	</div>
            </div>
          </el-form-item>
          <el-form-item v-if="addData.typeRuleConfig.chargingMonthType === 2">
            <div style="display: flex;align-items: center;">
              <div style="width: 100px;">
              	<span>单月总时长</span>
              </div>
              <div>
              	<el-input placeholder="请输入时长" v-model="addData.typeRuleConfig.ruleConfig.monthTotal" type="number" style="width: 180px;">
              		<template slot="append">分钟</template>
              	</el-input>
              </div>
            	<div style="width: 100px;">
            		<span>单日总时长</span>
            	</div>
            	<div>
            		<el-input placeholder="请输入时长" v-model="addData.typeRuleConfig.ruleConfig.dayTotal" type="number" style="width: 180px;">
            			<template slot="append">分钟</template>
            		</el-input>
            	</div>
            </div>
          </el-form-item>
        </div>

        <el-form-item :label="'购买权限'" prop="buyLimit">
        	<div id="">
        		<el-radio-group v-model="addData.buyLimit">
        			<el-radio :label="0">无限制</el-radio>
              <!-- <el-radio :label="1">仅小区用户</el-radio> -->
        		</el-radio-group>
        	</div>
        </el-form-item>
        <el-form-item :label="'续费规则'" prop="renewType">
        	<div id="">
        		<el-radio-group v-model="addData.renewType">
              <el-radio :label="0">常规续费
                  <span v-if="addData.renewType === 0"style="display: inline-block;margin-right: 20px;color: #FF0000;">
                    <div>
                      <i class="el-icon-warning"></i>若当前已过期则从当前时间开始续费X个月，未过期则按实际过期时间开始续费X个月
                    </div>
                  </span>
              </el-radio>

              <el-radio :label="1">从过期开始续费
                  <span v-if="addData.renewType === 1"style="display: inline-block;margin-right: 20px;color: #FF0000;">
                    <div>
                      <i class="el-icon-warning"></i>从月卡当前的过期时间续费X个月（该方式相当于收取了空白期费用）
                    </div>
                  </span>
              </el-radio>
        		</el-radio-group>
        	</div>
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
        		<div v-for="(item, index) in addData.monthPriceConfig.priceConfig" :key="index" class="formItem">
        			<div style="display: flex;align-items: center;">
        				<div>
        					<div class="flex inputBoxx" style="align-items: center;">
        						<div class="inputCom">
        							<el-input v-model="addData.monthPriceConfig.priceConfig[index].month" clearable type="number">
        								<template slot="append">月</template>
        							</el-input>
        						</div>
        						<div style="width: 20px;text-align: center;">/</div>
        						<div class="inputCom">
        							<el-input v-model="addData.monthPriceConfig.priceConfig[index].money" clearable type="number">
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
					<el-button type="primary" @click="onaddData('addData')">确定</el-button>
					<el-button @click="showAdd = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		page,
    add,
	} from '@/api/monthCard/monthCardList.js'
	import {
		parseTime
	} from '@/utils/index'
	import qs from 'qs'
	export default {
		name: 'addMonthCard',
		data() {
			return {
				showAdd: false,
				addData: {
          name:'',
          netWorkDotId:'',
          netWorkDotName:'',
          monthCardType:0,
          typeRuleConfig:{
            "chargingMonthType":1,
            "ruleConfig":{
              "monthTotal":'',
              "dayTotal":'',
            },
          },
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
				},
				rules: {
					name: [{
						required: true,
						message: '请输入套餐名称',
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
      // querySearch(queryString, cb) {
      // 	var restaurants = this.restaurants;
      // 	let restaurantsText = []
      // 	if (restaurants.length != '') {
      // 		restaurants.forEach((item, index) => {
      // 			let obj = {
      // 				value: '',
      // 				dealerId: ''
      // 			}
      // 			let value = item.adminName + "(" + item.adminFullname + ")"
      // 			obj.value = value
      // 			obj.dealerId = item.id
      // 			restaurantsText.push(obj)
      // 		})
      // 	}
      // 	var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
      // 	// 调用 callback 返回建议列表的数据
      // 	cb(results);
      // },
      // changeName() {
      // 	if (this.addData.netWorkDotName == '') {
      // 		this.addData.netWorkDotId = ''
      // 	}
      // },
      // changeNetworkDot(item) {
      // 	this.addData.netWorkDotId = item.id
      // 	this.addData.netWorkDotName = item.netWorkDotName + ''
      // },
      // queryNetwoekDot(){
      //   queryNetwoekDot().then(res => {
      //   	if (res.code == 200) {
      //   		this.dealerList = res.data
      //   		this.restaurants = this.dealerList;
      //   	} else {
      //   		this.$message.error(res.msg)
      //   	}
      //   })
      // },
			onaddData(formName) {
				// this.$refs[formName].validate(valid => {
					// console.log(valid)
          if (this.addData.name == '') {
          	this.$message.error('请输入套餐名称')
          	return false
          }
          if (this.addData.typeRuleConfig.chargingMonthType == '') {
          	this.$message.error('包月类型不能为空')
          	return false
          }
          if (this.addData.typeRuleConfig.ruleConfig.monthTotal == '') {
          	this.$message.error('必填项不能为空')
          	return false
          }
          if (this.addData.typeRuleConfig.ruleConfig.dayTotal == '') {
          	this.$message.error('必填项不能为空')
          	return false
          }
          if (this.addData.monthPriceConfig.priceConfig.length === 0) {
          	this.$message.error('最少添加一项收费标准')
          	return false
          }
          console.log(this.addData,"请求参数")
          this.addData.typeRuleConfig = JSON.stringify(this.addData.typeRuleConfig)
          this.addData.monthPriceConfig = JSON.stringify(this.addData.monthPriceConfig)
          console.log(this.addData,"请求参数")
					// if (valid) {
						console.log("通过")
						add(this.addData).then(res => {
							if (res.code == 200) {
								this.showAdd = false
								this.resetForm(formName)
                this.$emit('getLists')
								this.$message.success(res.msg)
							} else {
								this.$message.error(res.msg)
							}
              this.addData.typeRuleConfig = JSON.parse(this.addData.typeRuleConfig)
              this.addData.monthPriceConfig = JSON.parse(this.addData.monthPriceConfig)
              console.log(this.addData)
						})
					// } else {
					// 	console.log("不通过")
					// 	return false
					// }
				// })
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      //添加标准
      addForm(type) {
        let length = this.addData.monthPriceConfig.priceConfig.length;
        if (length >= 6){
          this.$message.error('最多添加6个收费标准')
          return false
        }
      	let index = length - 1
      	let duration = this.addData.monthPriceConfig.priceConfig[index]
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
      	this.addData.monthPriceConfig.priceConfig.push(obj)
      },
      //删除标准
      delForm(index, type) {
      	let duration = this.addData.monthPriceConfig.priceConfig || []
      	if (duration.length === 1) {
      		this.$message.error('至少有一个收费标准')
      		return false
      	}
      	this.addData.monthPriceConfig.priceConfig.splice(index, 1)
      	this.addData.monthPriceConfig.priceConfig.splice(index, 1)
      }
		},
		created() {

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
