<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" @click="btnAdd" class="filter-item"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:electricCharge:add')">新增方案</el-button>
		<el-dialog :visible.sync="showAdd" title="新增方案" @close="showAdd = false" :append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="80px">
				<el-form-item :label="'方案名称'" prop="feeName">
					<el-input v-model="addData.feeName" placeholder="请输入方案名称" clearable
						class="feeName" />
				</el-form-item>
				<el-form-item :label="'收费说明'" prop="remark">
					<el-input v-model="addData.remark" placeholder="请输入收费说明" clearable
						type="textarea" :rows="2" />
				</el-form-item>
				<el-form-item :label="'计费周期'" prop="realTimeCharging">
					<div id="">
						<el-radio-group v-model="addData.realTimeCharging">
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
								<el-button type="primary" @click="addForm">添加详情</el-button>
							</div>
							<div class="flex" style="align-items: center;margin-left:30px">
								<div style="margin-right: 10px;">电费单价</div>
								<el-input v-model="addData.electricityPrice" placeholder="请输入电费单价" clearable
									style="width:240px;" type="number">
									<template slot="append">元/度</template>
								</el-input>
							</div>
						</div>
						<div style="margin: 30px 0;">
							<div v-for="(item, index) in formArr" :key="index" style="margin: 5px 0;">
								<div class="flex" style="align-items: center;" v-if="isPc">
									<div class="flex" style="align-items: center;">
										<div style="margin-right: 20px;">电量</div>
										<div>
											<el-select v-model="addData.duration[index]"
												style="min-width: 100px;margin-right: 20px ;" class="filter-item"
												placeholder="请选择电量" clearable @keyup.enter.native="handleFilter">
												<el-option v-for="item in tags" :key="item.id" :label="item.title"
													:value="item.id" />
											</el-select>
										</div>
									</div>
									<div class="flex" style="align-items: center;">
										<div style="margin-right: 20px;">收费金额</div>
										<div>
											<el-input v-model="addData.money[index]" placeholder="请输入收费金额" clearable
												type="number" style="min-width: 100px;" />
										</div>
									</div>
									<!-- <div class="flex" style="align-items: center;margin-left: 20px;">
										<div style="margin-right: 20px;">电价金额</div>
										<div>
											<el-input v-model="addData.electricityPrice[index]" placeholder="请输入电价金额"
												clearable type="number" style="min-width: 100px;" />
										</div>
									</div> -->
									<div style="margin-left: 20px;">
										<el-button type="danger" @click="delForm(index)">删除</el-button>
									</div>
								</div>

								<div v-if="!isPc">
									<div class="flex" style="align-items: center;">
										<div style="margin-right: 20px;">电量</div>
										<div>
											<el-select v-model="addData.duration[index]"
												style="min-width: 100px;margin-right: 20px ;" class="filter-item"
												placeholder="请选择电量" clearable @keyup.enter.native="handleFilter">
												<el-option v-for="item in tags" :key="item.id" :label="item.title"
													:value="item.id" />
											</el-select>
										</div>
									</div>
									<div class="flex" style="align-items: center;margin-top: 10px;">
										<div style="margin-right: 20px;">收费金额</div>
										<div>
											<el-input v-model="addData.money[index]" placeholder="请输入收费金额" clearable
												type="number" style="min-width: 100px;" />
										</div>
									</div>
									<!-- <div class="flex" style="align-items: center;margin-top: 10px;">
										<div style="margin-right: 20px;">电价金额</div>
										<div>
											<el-input v-model="addData.electricityPrice[index]" placeholder="请输入电价金额"
												clearable type="number" style="min-width: 100px;" />
										</div>
									</div> -->
									<div style="margin-top: 10px;">
										<el-button type="danger" @click="delForm(index)">删除</el-button>
									</div>
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
					</div>
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
							<div style="display: flex;align-items: center;" v-if="pageType===2 || pageType===1">
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
		getList,
		batchDevicePrices,
		deleteDevicePrice,
		updateDevicePrice
	} from '@/api/netWorkDot/charge/chargeList.js'
	export default {
		data() {
			return {
				showAdd: false,
				addData: {
          			ruleId: 1,
					feeName: '',
					priceType: 1,
					realTimeCharging: 0,
          			remark: '',

					priceView: '',
					config: '',
					electricityPrice: 0,
					duration: [1],
					money: [0],
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
					this.editData.duration.push(1)
					this.editData.money.push(0)
				} else {
					this.formArr.push("")
					this.addData.duration.push(1)
					this.addData.money.push(0)
				}
			},
			delForm(index, type) {
				if (type == 'edit') {
					this.formArr.splice(index, 1)
					this.editData.duration.splice(index, 1)
					this.editData.money.splice(index, 1)
				} else {
					this.formArr.splice(index, 1)
					this.addData.duration.splice(index, 1)
					this.addData.money.splice(index, 1)
				}
			},
			btnAdd() {
				this.formArr = [""]
				this.addData.money = [0]
				this.addData.duration = [1]
				this.showAdd = true
				console.log('测试新增')
			},
			onaddData(formName) {
				console.log(this.addData)
				if (this.addData.feeName == '') {
					this.$message.error('请输入方案名称')
					return false
				}
				if (this.addData.duration == '') {
					this.$message.error('请至少添加一种方案')
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
				this.addData.config = configJson;

				var priceView = {};
				let priceViewArr = [];
				let priceUnit = this.pageType
				let moneyList = this.moneyList
				let timeList = this.timeList
				if( priceUnit === 0 ){
					timeList.forEach((item, index) => {
						priceViewArr.push(item.id)
					})
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
				this.addData.priceView = priceViewJson;

				let resultData = {
					feeName: this.addData.feeName,
					priceType: this.addData.priceType,
					duration: this.addData.duration,
					money: this.addData.money,
				}
				resultData.electricityPrice = this.addData.electricityPrice
				resultData.realTimeCharging = this.addData.realTimeCharging
				resultData.priceView = this.addData.priceView
				resultData.config = this.addData.config
				resultData.remark = this.addData.remark || ''
				resultData.ruleId = this.addData.ruleId

				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						batchDevicePrices(resultData).then(res => {
							if (res.code == 200) {
								this.showAdd = false
								this.resetForm(formName)
								this.$message.success(res.msg)
								this.formArr = [""]
								this.addData.money = [0]
								this.addData.duration = [1]
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
		},
		created() {
			let tags = []
			for (let i = 1; i <= 48; i++) {
				let obj = {
					id: i,
					title: i + '度'
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
</style>
