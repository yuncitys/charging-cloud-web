<template>
	<div style="display:inline-block">
		<el-button type="primary" @click="" style="margin-left: 10px;" @click="showDidlaoEditData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:timeCharge:edit')">编辑
		</el-button>
		<el-drawer
			:visible.sync="showEdit"
			title="编辑方案"
			custom-class="charge-scheme-drawer"
			direction="rtl"
			size="760px"
			:append-to-body="true">
			<div class="charge-scheme-drawer__body">
			<el-form ref="editData" :model="editData" label-position="left" label-width="80px" class="charge-scheme-form">
				<el-form-item :label="'方案名称'" prop="feeName">
					<el-input v-model="editData.feeName" placeholder="请输入方案名称" clearable
						class="feeName" />
				</el-form-item>
				<el-form-item :label="'收费说明'" prop="remark">
					<el-input v-model="editData.remark" placeholder="请输入收费说明" clearable
						type="textarea" :rows="2" />
				</el-form-item>
				<el-form-item :label="'计时类型'" prop="feeName">
					<div id="">
						<el-radio-group v-model="editData.realTimeCharging">
							<el-radio v-for="(item,index) in payType" :key="index" :label="index">{{item.title}}
							</el-radio>
						</el-radio-group>
					</div>
				</el-form-item>
				<div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;">
					<h2>收费标准</h2>
					<div style="margin-left: 20px;">
						<div class="flex" style="align-items: center;">
							<div>
								<el-button type="primary" @click="addForm('edit')">添加详情</el-button>
							</div>
							<div class="flex" style="align-items: center;margin-left:30px">
								<div style="margin-right: 10px;">电费单价</div>
								<el-input v-model="editData.electricityPrice" placeholder="请输入电费单价" clearable
									style="width:240px;" type="number">
									<template slot="append">元/度</template>
								</el-input>
							</div>
						</div>
						<div style="margin: 30px 0;">
							<div v-for="(item, index) in formArr" :key="index" style="margin: 5px 0;">
								<div class="flex" style="align-items: center;" v-if="isPc">
									<div class="flex" style="align-items: center;">
										<div style="margin-right: 20px;">时间</div>
										<div>
											<el-select v-model="editData.duration[index]"
												style="min-width: 100px;margin-right: 20px ;" class="filter-item"
												placeholder="请选择时间" clearable @keyup.enter.native="handleFilter">
												<el-option v-for="item in tags" :key="item.id + ''" :label="item.title"
													:value="item.id + ''" />
											</el-select>
										</div>
									</div>
									<div class="flex" style="align-items: center;">
										<div style="margin-right: 20px;">收费金额</div>
										<div>
											<el-input v-model="editData.money[index]" placeholder="请输入收费金额" clearable
												type="number" style="min-width: 100px;" />
										</div>
									</div>
									<!-- <div class="flex" style="align-items: center;margin-left: 20px;">
										<div style="margin-right: 20px;">电价金额</div>
										<div>
											<el-input v-model="editData.electricityPrice[index]" placeholder="请输入电价金额"
												clearable type="number" style="min-width: 100px;" />
										</div>
									</div> -->
									<div style="margin-left: 20px;">
										<el-button type="danger" @click="delForm(index,'edit')">删除</el-button>
									</div>
								</div>

								<div v-if="!isPc">
									<div class="flex" style="align-items: center;">
										<div style="margin-right: 20px;">时间</div>
										<div>
											<el-select v-model="editData.duration[index]"
												style="min-width: 100px;margin-right: 20px ;" class="filter-item"
												placeholder="请选择时间" clearable @keyup.enter.native="handleFilter">
												<el-option v-for="item in tags" :key="item.id + ''" :label="item.title"
													:value="item.id + ''" />
											</el-select>
										</div>
									</div>
									<div class="flex" style="align-items: center;margin-top: 10px;">
										<div style="margin-right: 20px;">收费金额</div>
										<div>
											<el-input v-model="editData.money[index]" placeholder="请输入收费金额" clearable
												type="number" style="min-width: 100px;" />
										</div>
									</div>
									<!-- <div class="flex" style="align-items: center;margin-top: 10px;">
										<div style="margin-right: 20px;">电价金额</div>
										<div>
											<el-input v-model="editData.electricityPrice[index]" placeholder="请输入电价金额"
												clearable type="number" style="min-width: 100px;" />
										</div>
									</div> -->
									<div style="margin-top: 10px;">
										<el-button type="danger" @click="delForm(index,'edit')">删除</el-button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;margin-bottom: 30px;margin-top: 10px;">
					<!-- <h2>车主显示档位 (充电车主选择支付金额的页面)</h2>
					<div style="display: flex;align-items: center;margin-left: 20px;">
						<div>
							<h3>档位显示方式</h3>
						</div>
						<div style="margin-left: 30px;">
							<el-radio-group v-model="pageType">
								<el-radio :label="2">金额</el-radio>
								<el-radio :label="1">电量</el-radio>
								<el-radio :label="0">时间</el-radio>
							</el-radio-group>
						</div>
					</div>
					<div v-if="pageType === 2"
						style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
						<div v-for="(item,index) in moneyList" :key="index" style="width: 30%;">
							<el-input placeholder="请输入金额" v-model="item.id" type="number"
								style="width: 200px;margin-bottom: 10px;">
								<template slot="append">元</template>
							</el-input>
						</div>
					</div>
					<div v-if="pageType === 1"
						style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
						<div v-for="(item,index) in electricityList" :key="index" style="width: 30%;">
							<el-input placeholder="请输入电量" v-model="item.id" type="number"
								style="width: 200px;margin-bottom: 10px;">
								<template slot="append">度</template>
							</el-input>
						</div>
					</div>
					<div v-if="pageType === 0"
						style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
						<div v-for="(item,index) in timeList" :key="index" style="width: 30%;">
							<el-input placeholder="请输入时间" v-model="item.id" type="number"
								style="width: 200px;margin-bottom: 10px;">
								<template slot="append">小时</template>
							</el-input>
						</div>
					</div> -->
					<div class="charge-scheme-settings__title">更多设置</div>
					<div class="charge-scheme-settings__content">
						<div class="charge-scheme-settings__switch">
							<div class="charge-scheme-settings__switch-row">
								<span class="charge-scheme-settings__switch-label">充满自停档位</span>
								<el-switch v-model="isAutostop"></el-switch>
							</div>
							<div class="charge-scheme-settings__hint charge-scheme-settings__hint--switch">
								<i class="el-icon-warning"></i>车主可选择该档位进行充电，需支付设置金额，设备根据设定的最大时间给车主开电，尽可能保证充满
							</div>
						</div>
						<div v-if="isAutostop">
							<div class="charge-scheme-settings__row">
								<div class="charge-scheme-settings__label">收费方式</div>
								<div class="charge-scheme-settings__control">
									<el-radio-group v-model="chco" class="charge-scheme-settings__radio">
										<el-radio :label="0">预收费</el-radio>
										<el-radio :label="1">固定金额</el-radio>
									</el-radio-group>
									<div v-if="chco===0" class="charge-scheme-settings__hint">
										<i class="el-icon-warning"></i>充满后剩余金额将退回车主
									</div>
									<div v-if="chco===1" class="charge-scheme-settings__hint">
										<i class="el-icon-warning"></i>确保车主充满，不退余额
									</div>
								</div>
							</div>
							<div class="charge-scheme-settings__row">
								<div class="charge-scheme-settings__label">
									<span v-if="chco===0">预收金额</span>
									<span v-if="chco===1">固定金额</span>
								</div>
								<div class="charge-scheme-settings__control">
									<el-input class="charge-scheme-settings__input" placeholder="请输入金额" v-model="fixedMoney" type="number">
										<template slot="append">元</template>
									</el-input>
								</div>
							</div>
							<div class="charge-scheme-settings__row">
								<div class="charge-scheme-settings__label">最长充电时长</div>
								<div class="charge-scheme-settings__control">
									<el-input class="charge-scheme-settings__input" placeholder="请输入时间" v-model="maxChargeTime" type="number" min="1" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^0/g,'')">
										<template slot="append">小时</template>
									</el-input>
									<div class="charge-scheme-settings__hint">
										<i class="el-icon-warning"></i>设置该档位针对单个端口车主允许最长可充电
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-form>
				<div class="charge-scheme-drawer__footer">
					<el-button type="primary" @click="onEditData('editData')">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
				</div>
			</div>
		</el-drawer>
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
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				showEdit: false,
				editData: {
					tdpId: '',
					ruleId: 1,
					feeName: '',
					priceType: 0,
					remark: '',
					electricityPrice: 0,
					realTimeCharging: 0,
					status: '1',
					realTimeCharging: 0,

					config: '',
					priceView: '',
					duration: [],
					money: [],
				},
				formArr: [""],
				tags: [],
				payType: [{
					id: 1,
					realTimeCharging: 0,
					title: "按1分钟收费"
				}, {
					id: 2,
					realTimeCharging: 1,
					title: "按30分钟收费"
				}],
				pageType: 0,
				moneyList: [
				{
					id: 1
				},
				{
					id: 2
				},
				{
					id: 3
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
					id: 4
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
				electricityList: [
				{
					id: 1
				},
				{
					id: 2
				},
				{
					id: 3
				},
				{
					id: 4
				},
				{
					id: 5
				},
				{
					id: 6
				}
				],
				isAutostop: false,
				chco: 0,
				fixedMoney: 5,
				maxChargeTime: 12
			}
		},
		methods: {
			addForm(type) {
				if (type == 'edit') {
					this.formArr.push("")
					this.editData.duration.push("1")
					this.editData.money.push(0.5)
					// this.editData.electricityPrice.push(1)
				} else {
					this.formArr.push("")
					this.addData.duration.push(1)
					this.addData.money.push(0.5)
					// this.addData.electricityPrice.push(1)
				}
			},
			delForm(index, type) {
				if (type == 'edit') {
					this.formArr.splice(index, 1)
					this.editData.duration.splice(index, 1)
					this.editData.money.splice(index, 1)
					// this.editData.electricityPrice.splice(index, 1)
				} else {
					this.formArr.splice(index, 1)
					this.addData.duration.splice(index, 1)
					this.addData.money.splice(index, 1)
					// this.addData.electricityPrice.splice(index, 1)
				}
			},
			showDidlaoEditData() {
				let item = this.row_data
				console.log("编辑数据：",item)
				if(item.priceView != ''){
					let priceViewDetail = {};
					if(typeof(item.priceView) == 'string'){
						priceViewDetail = JSON.parse(item.priceView);
					}else{
						priceViewDetail = item.priceView;
					}
					item.priceView = priceViewDetail;
					console.log("充电档位配置：",priceViewDetail)
					let priceViewArr = item.priceView.view.split(',')
					console.log("充电档位：",priceViewArr)
					let priceViewObj = []
					priceViewArr.forEach((item, index) => {
						let obj = {id: item}
						priceViewObj.push(obj)
					})
					let priceUnit = item.priceView.unit
					if (priceUnit === 0) {
						this.timeList = priceViewObj
					} else if (priceUnit === 1) {
						this.electricityList = priceViewObj
					} else if (priceUnit === 2) {
						this.moneyList = priceViewObj
					}
					this.pageType = priceUnit
        		}
				if (item.config != '') {
					let autostopConfigDetail = {}
					if(typeof(item.config) == 'string'){
						autostopConfigDetail = JSON.parse(item.config);
					}else{
						autostopConfigDetail = item.config;
					}
					console.log("充满自停配置：{}",autostopConfigDetail)
					this.isAutostop = autostopConfigDetail.AutostopConfig.isAutostop ? true : false
					this.chco = autostopConfigDetail.AutostopConfig.details.chco
					this.fixedMoney = autostopConfigDetail.AutostopConfig.details.money
					this.maxChargeTime = autostopConfigDetail.AutostopConfig.details.maxChargeTime
				}
				this.editData.tdpId = item.id
				this.editData.feeName = item.feeName
				this.editData.realTimeCharging = item.realTimeCharging
				this.editData.remark = item.remark || ''
				this.editData.electricityPrice = item.electricityPrice
				this.editData.config = item.config
				this.editData.priceView = item.priceView
				let duration = [];	let money = []
				if (item.priceContents != 0) {
					item.priceContents.forEach((val, index) => {
						duration.push(val.duration)
						money.push(val.money)
					})
				}
				this.editData.duration = duration
				this.editData.money = money
				this.formArr.splice(0, this.formArr.length, ...item.priceContents);
				this.showEdit = true
			},
			onEditData(formName) {
				if (this.editData.feeName == '') {
					this.$message.error('请输入方案名称')
					return false
				}
				if (this.editData.duration == '') {
					this.$message.error('请至少添加一种方案')
					return false
				}
				if (this.isAutostop && Number(this.fixedMoney) <= 0){
					this.$message.error(this.chco === 0 ? '预收金额必须大于0' : '固定金额必须大于0')
					return false
				}
				if (this.isAutostop && Number(this.maxChargeTime) <= 0){
					this.$message.error('最长充电时长不能小于0')
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

				var config = {};
				var isAutostopConfig = {};
				isAutostopConfig['isAutostop'] = isAutostop;
				config['AutostopConfig'] = isAutostopConfig;
				var detailsConfig = {};
				detailsConfig['chco'] = this.chco;
				detailsConfig['money'] = this.fixedMoney;
				detailsConfig['maxChargeTime'] = this.maxChargeTime
				isAutostopConfig['details'] = detailsConfig;
				var configJson = JSON.stringify(config);
				console.log("充满自停配置：",configJson);
				this.editData.config = configJson;

				var priceView = {};
				let priceViewArr = [];
				let priceUnit = this.pageType
				let moneyList = this.moneyList
				let electricityList = this.electricityList
				let timeList = this.timeList
				if( priceUnit === 0 ){
					// timeList.forEach((item, index) => {
					// 	priceViewArr.push(item.id)
					// })
					priceViewArr = this.editData.duration
				} else if (priceUnit === 1){
					electricityList.forEach((item, index) => {
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
				console.log("充电档位：",priceViewJson);
				this.editData.priceView = priceViewJson;

				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						updateDevicePrice(this.editData).then(res => {
							if (res.code == 200) {
								this.showEdit = false
								this.resetForm(formName)
								this.$message.success(res.msg)
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
				if (this.$refs[formName]) {
					this.$refs[formName].resetFields();
				}
			},
		},
		created() {
			let tags = []
			for (let i = 1; i <= 24; i++) {
				let obj = {
					id: i,
					title: i + '小时'
				}
				tags.push(obj)
			}
			this.tags = tags
		},
		mounted() {

		},
	}
</script>

<style lang="scss">
	.flex {
		display: flex;
	}

	.charge-scheme-drawer .el-drawer__body {
		height: 100%;
		padding: 0;
		overflow: hidden;
	}

	.charge-scheme-drawer__body {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.charge-scheme-form {
		flex: 1;
		overflow-y: auto;
		padding: 0 20px;
	}

	.charge-scheme-drawer__footer {
		padding: 16px 20px;
		border-top: 1px solid #ebeef5;
		background: #fff;
	}

	.charge-scheme-settings__title {
		font-size: 18px;
		font-weight: 600;
		line-height: 26px;
		color: #303133;
	}

	.charge-scheme-settings__content {
		margin-left: 20px;
	}

	.charge-scheme-settings__row {
		display: flex;
		align-items: flex-start;
		margin-top: 16px;
	}

	.charge-scheme-settings__label,
	.charge-scheme-settings__switch-label {
		width: 112px;
		flex-shrink: 0;
		font-size: 15px;
		font-weight: 600;
		line-height: 22px;
		color: #303133;
	}

	.charge-scheme-settings__label {
		padding-top: 5px;
	}

	.charge-scheme-settings__control {
		flex: 1;
		min-width: 0;
	}

	.charge-scheme-settings__input {
		width: 250px;
		max-width: 100%;
	}

	.charge-scheme-settings__switch {
		margin-top: 16px;
	}

	.charge-scheme-settings__switch-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.charge-scheme-settings__radio .el-radio {
		margin-right: 24px;
		margin-bottom: 8px;
	}

	.charge-scheme-settings__radio .el-radio__label {
		font-size: 14px;
	}

	.charge-scheme-settings__hint {
		margin-top: 8px;
		font-size: 13px;
		line-height: 20px;
		color: #909399;
	}

	.charge-scheme-settings__hint--switch {
		padding-left: 124px;
	}

	.charge-scheme-settings__hint .el-icon-warning {
		margin-right: 4px;
	}
</style>
