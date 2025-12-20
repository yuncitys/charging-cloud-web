<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" @click="btnAdd" class="filter-item"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:powerCharge:add')">新增方案</el-button>
		<el-dialog :visible.sync="showDialog" title="新增方案" @close="showDialog = false" :append-to-body="true">
			<el-form ref="formData" :model="formData" label-position="left" label-width="80px">
				<el-form-item :label="'方案名称'" prop="feeName">
					<el-input v-model="formData.feeName" placeholder="请输入方案名称" clearable
						class="feeName" />
				</el-form-item>
				<el-form-item :label="'收费说明'" prop="remark">
					<el-input v-model="formData.remark" placeholder="请输入收费说明" clearable
						type="textarea" :rows="2" />
				</el-form-item>
				<el-form-item :label="'计费周期'" prop="realTimeCharging">
					<div id="">
						<el-radio-group v-model="formData.realTimeCharging">
							<el-radio v-for="(item,index) in payType" :key="index" :label="index">{{item.title}}
							</el-radio>
						</el-radio-group>
					</div>
				</el-form-item>
				<el-form-item :label="'功率类型'" prop="chargeType">
					<div id="">
						<el-radio-group v-model="formData.chargeType">
							<el-radio v-for="(item,index) in chargeTypeList" :key="index" :label="index">
								{{item.title}}
							</el-radio>
						</el-radio-group>
					</div>
				</el-form-item>
				<div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;">
					<h2>收费标准</h2>
					<div style="margin-left: 20px;">
						<div class="flex" style="align-items: center;">
							<div>
								<el-button type="primary" @click="addForm('add')">添加详情</el-button>
							</div>
							<div class="flex" style="align-items: center;margin-left:30px">
								<div style="margin-right: 10px;">电费单价</div>
								<el-input v-model="formData.electricityPrice" placeholder="请输入电费单价" clearable
									style="width:240px;" type="number">
									<template slot="append">元/度</template>
								</el-input>
							</div>
						</div>
					</div>
					<div style="margin: 30px 0;margin-left: 20px;">
						<div v-for="(item, index) in formData.duration" :key="index" class="formItem">
							<div style="display: flex;align-items: center;">
								<div>
									<div class="flex inputBoxx1" style="align-items: center;">
										<div class="inputCom">
											<el-input v-model="formData.duration[index].left" clearable type="number"
												disabled>
												<template slot="append">W</template>
											</el-input>
										</div>
										<div style="width: 20px;text-align: center;">~</div>
										<div class="inputCom">
											<el-input v-model="formData.duration[index].right" clearable type="number">
												<template slot="append">W</template>
											</el-input>
										</div>
									</div>
									<div class="flex inputBoxx2" style="align-items: center;">
										<div class="inputCom">
											<el-input v-model="formData.money[index].hour" clearable type="number">
												<template slot="append">小时</template>
											</el-input>
										</div>
										<div style="width: 20px;text-align: center;">/</div>
										<div class="inputCom">
											<el-input v-model="formData.money[index].money" clearable type="number">
												<template slot="append">元</template>
											</el-input>
										</div>
									</div>
								</div>
								<!-- <div class="flex" style="align-items: center;margin-left: 20px;">
									<div style="margin-right: 20px;">电价金额</div>
									<div>
										<el-input v-model="formData.electricityPrice[index]" placeholder="请输入电价金额"
											clearable type="number" style="min-width: 100px;" />
									</div>
								</div> -->
								<div class="inputBtnn" style="margin-left: 30px;">
									<el-button type="danger" @click="delForm(index,'add')">删除</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;margin-bottom: 30px;margin-top: 10px;">
					<h2>车主显示档位 (充电车主选择支付金额的页面)</h2>
					<div style="display: flex;align-items: center;margin-left: 20px;">
						<div>
							<h3>档位显示方式</h3>
						</div>
						<div style="margin-left: 30px;">
							<el-radio-group v-model="pageType">
								<el-radio :label="2">金额</el-radio>
								<el-radio :label="0">时间</el-radio>
							</el-radio-group>
						</div>
					</div>
					<div v-if="pageType === 2"
						style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
						<div v-for="(item,index) in moneyList" :key="index" style="width: 30%;">
							<el-input placeholder="请输入正整数" v-model="item.id" type="number" min="1" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^0/g,'')"
								style="width: 200px;margin-bottom: 10px;">
								<template slot="append">元</template>
							</el-input>
						</div>
					</div>
					<div v-if="pageType === 0"
						style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
						<div v-for="(item,index) in timeList" :key="index" style="width: 30%;">
							<el-input placeholder="请输入正整数" v-model="item.id" type="number" min="1" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^0/g,'')"
								style="width: 200px;margin-bottom: 10px;">
								<template slot="append">小时</template>
							</el-input>
						</div>
					</div>
					<div>
						<h2>更多设置</h2>
						<div style="margin-left: 20px;">
							<div style="display: flex;align-items: center;" v-if="pageType === 0">
								<div style="width: 80px;">
									<h3>预收金额</h3>
								</div>
								<div>
									<el-input placeholder="请输入金额" v-model="fixedMoney" type="number"
										style="width: 250px;">
										<template slot="append">元</template>
									</el-input>
								</div>
							</div>
							<div>
								<span style="display: inline-block;margin-right:20px">
									<h3>充满自停档位</h3>
								</span>
								<el-switch v-model="isAutostop"></el-switch><span
									style="display: inline-block;margin-left: 10px;color: #999;"><i
										class="el-icon-warning"></i>车主可选择该档位进行充电，需支付设置金额，设备根据设定的最大时间给车主开电，尽可能保证充满</span>
							</div>
							<div v-if="isAutostop">
								<div style="display: flex;align-items: center;">
									<div style="width: 120px;">
										<h3>收费方式</h3>
									</div>
									<div>
										<el-radio-group v-model="chco">
											<el-radio :label="0">预收费 <span v-if="chco===0"
													style="display: inline-block;margin-right: 20px;color: #999;"><i
														class="el-icon-warning"></i>充满后剩余金额将退回车主</span></el-radio>
											<el-radio :label="1">固定金额 <span v-if="chco===1"
													style="display: inline-block;margin-right: 20px;color: #999;"><i
														class="el-icon-warning"></i>确保车主充满，不退余额</span></el-radio>
										</el-radio-group>
									</div>
								</div>
								<div style="display: flex;align-items: center;" v-if="pageType===2">
									<div style="width: 120px;">
										<h3 v-if="chco===0">预收金额</h3>
										<h3 v-if="chco===1">固定金额</h3>
									</div>
									<div>
										<el-input placeholder="请输入金额" v-model="fixedMoney" type="number"
											style="width: 250px;">
											<template slot="append">元</template>
										</el-input>
									</div>
								</div>
								<div style="display: flex;align-items: center;" v-if="pageType===0 && chco===1">
									<div style="width: 120px;">
										<h3 v-if="chco===0">预收金额</h3>
										<h3 v-if="chco===1">固定金额</h3>
									</div>
									<div>
										<el-input placeholder="请输入金额" v-model="fixedMoney" type="number"
											style="width: 250px;">
											<template slot="append">元</template>
										</el-input>
									</div>
								</div>
								<div style="display: flex;align-items: center;">
									<div style="width: 120px;">
										<h3>最长充电时长</h3>
									</div>
									<div>
										<el-input placeholder="请输入时间" v-model="maxChargeTime" type="number"
											style="width: 250px;">
											<template slot="append">小时</template>
										</el-input>
										<span style="display: inline-block;margin-left: 20px;color: #999;"><i
												class="el-icon-warning"></i>设置该档位针对单个端口车主允许最长可充电</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<el-form-item>
					<el-button type="primary" @click="onformData('formData')">确定</el-button>
					<el-button @click="showDialog = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		batchDevicePrices,
		deleteDevicePrice,
		updateDevicePrice
	} from '@/api/netWorkDot/charge/chargeList.js'
	export default {
		data() {
			return {
				showDialog: false,
				formData: {
          			ruleId: 1,
					feeName: '',
					priceType: 2,
					realTimeCharging: 0,
					chargeType: 0,
					remark: '',
					priceView: '',
					config: '',
					electricityPrice: 0,
					duration: [{
						left: 0,
						right: ''
					}],
					money: [{
						hour: 1,
						money: 1
					}],
				},
				formArr: [""],
				payType: [{
					id: 1,
					realTimeCharging: 0,
					title: "按1分钟收费"
				}, {
					id: 2,
					realTimeCharging: 1,
					title: "按30分钟收费"
				}],
				chargeTypeList: [{
					id: 1,
					realTimeCharging: 0,
					title: "平均功率"
				}, {
					id: 2,
					realTimeCharging: 1,
					title: "最高功率"
				}],

				pageType: 0,
				moneyList: [
				  {
				    id: 1,
				  },
				  {
				    id: 2,
				  },
				  {
				    id: 3,
				  },
				  {
				    id: 4
				  },
				  {
				    id: 5
				  },
				  {
				    id: 6
				  },
				],
				timeList: [
				  {
				    id: 2
				  },
				  {
				    id: 4,
				  },
				  {
				    id: 6
				  },
				  {
				    id: 8
				  },
				  {
				    id: 10
				  },
				  {
				    id: 12
				  }
				],
				isAutostop: false,
				chco: 0,
				fixedMoney: 5,
				maxChargeTime: 12
			}
		},
		methods: {
			btnAdd() {
				this.formArr = [""]
				this.formData.money = [{
					hour: 1,
					money: 1
				}]
				// this.formData.electricityPrice = [1]
				this.formData.duration = [{
					left: 0,
					right: 100
				}]
				this.showDialog = true
			},
			addForm(type) {
				let index = this.formData.duration.length - 1
				let duration = this.formData.duration[index]
				let index_money = this.formData.money.length - 1
				let money = this.formData.money[index_money]
				let right = duration.right
				if (right == '') {
					this.$message.error('请输入最大功率值')
					return false
				}
				if (Number(right) <= Number(duration.left)){
				this.$message.error('功率范围值异常')
				return false
				}
				if (money.hour === ''){
				this.$message.error('时长不能为空')
				return false
				}
				if (Number(money.hour) <= 0 ){
				this.$message.error('时长不能小于0')
				return false
				}
				if (money.money === ''){
				this.$message.error('金额不能为空')
				return false
				}
				if (Number(money.money) < 0 ){
				this.$message.error('金额不能小于0')
				return false
				}
				// right = parseInt(right) + 1
				right = parseInt(right)
				console.log(duration, right)
				this.formArr.push("")
				let obj = {
					left: right,
					right: '',
				}
				console.log(obj)
				this.formData.duration.push(obj)
				this.formData.money.push({
					hour: 1,
					money: 1
				})
				// this.formData.electricityPrice.push(1)
			},
			onBlur(index, type) {
				console.log(index)
				let dIndex = this.formData.duration.length - 1
				let nextIndex = parseInt(index) + 1
				if (dIndex !== index) {
					let right = this.formData.duration[index].right
					this.formData.duration[nextIndex].left = parseInt(right) + 1
				}
			},
			delForm(index, type) {
				let duration = this.formData.duration || []
				if (duration.length === 1) {
					this.$message.error('至少有一个收费标准')
					return false
				}
				this.formArr.splice(index, 1)
				this.formData.duration.splice(index, 1)
				this.formData.money.splice(index, 1)
				// this.formData.electricityPrice.splice(index, 1)
			},
			onformData(formName) {
				if (this.formData.feeName == '') {
					this.$message.error('请输入方案名称')
					return false
				}
				if (this.formData.duration.length == 0) {
					this.$message.error('请至少添加一种方案')
					return false
				}
				const endDuration = this.formData.duration.slice(-1)[0]
				const endMoney = this.formData.money.slice(-1)[0]
				if ( endDuration.right == '') {
					this.$message.error('最大功率范围不能为空')
					return false
				}
				if (Number(endDuration.right) <= Number(endDuration.left)){
				this.$message.error('功率范围值异常')
				return false
				}
				if (endMoney.hour === ''){
				this.$message.error('时长不能为空')
				return false
				}
				if (Number(endMoney.hour) <= 0 ){
				this.$message.error('时长不能小于0')
				return false
				}
				if (endMoney.money === ''){
				this.$message.error('金额不能为空')
				return false
				}
				if (Number(endMoney.money) < 0 ){
				this.$message.error('金额不能小于0')
				return false
				}
				if (this.formData.electricityPrice == '') {
					this.$message.error('请输入电费单价')
					return false
				}
				let {
					isAutostop,
					chco,
					fixedMoney,
					maxChargeTime
				} = this
				isAutostop = isAutostop ? 1 : 0
        		chco = chco ? chco : 0
				fixedMoney = fixedMoney ? fixedMoney : 5
				maxChargeTime = maxChargeTime ? maxChargeTime : 12

				let formData = this.formData
				console.log(formData)
				var config = {};
				var isAutostopConfig = {};
				isAutostopConfig['isAutostop'] = isAutostop;
				config['AutostopConfig'] = isAutostopConfig;
				var details = {};
				var detailsConfig = {};
				detailsConfig['chco'] = this.chco;
				detailsConfig['money'] = this.fixedMoney;
				detailsConfig['maxChargeTime'] = this.maxChargeTime
				isAutostopConfig['details'] = detailsConfig;
				var configJson = JSON.stringify(config);
				console.log(configJson);
				this.formData.config = configJson;

				var priceView = {};
        		let priceViewArr = [];
				let priceUnit = this.pageType
				let moneyList = this.moneyList
				let timeList = this.timeList
				if( priceUnit === 0 ){
          			timeList.forEach((item, index) => {
						priceViewArr.push(item.id)
					})
				} else if (priceUnit === 2){
				  moneyList.forEach((item, index) => {
				  		priceViewArr.push(item.id)
				  })
				}
				let priceViewStr = priceViewArr.join(',')
				priceView['view'] = priceViewStr
				priceView['unit'] = priceUnit
				priceView['preMoney'] = fixedMoney
				var priceViewJson = JSON.stringify(priceView);
				console.log(priceViewJson);
				this.formData.priceView = priceViewJson;

				let powerSectionBeforeArr = []
				let powerSectionBefore = ''
				let powerSectionAfterArr = []
				let powerSectionAfter = ''
				let durationArr = []
				let duration = ''
				let moneyArr = []
				let money = ''
				let resultData = {
					feeName: formData.feeName,
					priceType: formData.priceType,
				}
				formData.duration.forEach((item, index2) => {
					powerSectionBeforeArr.push(item.left)
					powerSectionAfterArr.push(item.right)
				})
				formData.money.forEach((item, index2) => {
					durationArr.push(item.hour)
					moneyArr.push(item.money)
				})
				duration = durationArr.join(',')
				money = moneyArr.join(',')
				powerSectionBefore = powerSectionBeforeArr.join(',')
				powerSectionAfter = powerSectionAfterArr.join(',')
				resultData.duration = duration
				resultData.money = money
				resultData.powerSectionBefore = powerSectionBefore
				resultData.powerSectionAfter = powerSectionAfter
        		resultData.electricityPrice = formData.electricityPrice
				resultData.realTimeCharging = formData.realTimeCharging
				resultData.chargeType = formData.chargeType
				resultData.priceView = formData.priceView
				resultData.config = formData.config
				resultData.remark = formData.remark || ''
				resultData.ruleId = formData.ruleId

				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						batchDevicePrices(resultData).then(res => {
							if (res.code == 200) {
								this.showDialog = false
								this.resetForm(formName)
								this.$message.success(res.msg)
								this.formArr = [""]
								this.formData.feeName = ''
								this.formData.money = [{
									hour: 1,
									money: 1
								}]
								this.formData.duration = [{
									left: 1,
									right: ''
								}]
								this.$emit('getLists')
							} else {
								this.$message.error(res.msg)
							}
						})
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		}
	}
</script>

<style>
	.flex {
		display: flex;
	}

	.left {
		margin-right: 20px;
	}

	.inputBoxx2 {
		margin-top: 10px !important;
		width: 100%;
	}

	.inputBoxx1 {
		width: 100%;
	}

	.inputBtnn {
		margin-top: 10px !important;
	}

	.formItem {
		margin-bottom: 25px;
	}
</style>
