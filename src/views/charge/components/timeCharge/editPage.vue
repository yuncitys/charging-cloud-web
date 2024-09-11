<template>
	<div style="display:inline-block">
		<el-button type="primary" @click="" style="margin-left: 10px;" @click="showDidlaoEditData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:timeCharge:edit')">编辑
		</el-button>
		<el-dialog :visible.sync="showEdit" title="编辑方案" @close="showEdit = false" :append-to-body="true" width="60%">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px"
				style="margin-left:50px;">
				<el-form-item :label="'方案名称'" prop="feeName">
					<el-input v-model="editData.feeName" placeholder="请输入方案名称" clearable style="width: 60%;"
						class="feeName" />
				</el-form-item>
				<el-form-item :label="'收费说明'" prop="remark">
					<el-input v-model="editData.remark" placeholder="请输入收费金额" clearable style="width: 60%;"
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
												<el-option v-for="item in tags" :key="item.id" :label="item.title"
													:value="item.id" />
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
												<el-option v-for="item in tags" :key="item.id" :label="item.title"
													:value="item.id" />
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
				<div
					style="border: 1px solid #eee;padding: 10px;border-radius: 10px;margin-bottom: 30px;margin-top: 10px;">
					<h2>是否开启充满自停</h2>
					<div style="margin-left: 20px;">
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
							<div style="display: flex;align-items: center;">
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
					<el-button type="primary" @click="onEditData('editData')">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
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
				console.log(item)
				this.editData.tdpId = item.id
				this.editData.feeName = item.feeName
				this.editData.realTimeCharging = item.realTimeCharging
				this.editData.remark = item.remark || ''
				let ids = []
				let duration = []
				let money = []
				if (item.priceContents != 0) {
					item.priceContents.forEach((val, index) => {
						ids.push(val.id)
						console.log(val.id)
						duration.push(parseInt(val.duration))
						money.push(val.money)
					})
          //duration.sort();
          //money.sort();
				}
				this.formArr = item.priceContents
				console.log(this.formArr, '222')
				this.editData.duration = duration
				this.editData.money = money
				this.editData.electricityPrice = item.electricityPrice

				this.isAutostop = item.config.AutostopConfig.isAutostop ? true : false
				this.chco = item.config.AutostopConfig.details.chco ? item.config.AutostopConfig.details.chco : 0
				this.fixedMoney = item.config.AutostopConfig.details.money ? item.config.AutostopConfig.details.money : 5
				this.maxChargeTime = item.config.AutostopConfig.details.maxChargeTime ? item.config.AutostopConfig.details.maxChargeTime : 12

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
        var details = {};
        var detailsConfig = {};
        detailsConfig['chco'] = this.chco;
        detailsConfig['money'] = this.fixedMoney;
        detailsConfig['maxChargeTime'] = this.maxChargeTime
        isAutostopConfig['details'] = detailsConfig;
        var configJson = JSON.stringify(config);
        console.log(configJson);
        this.editData.config = configJson;

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
				this.$refs[formName].resetFields();
			},
		},
		created() {
			let tags = []
			for (let i = 1; i <= 48; i++) {
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
</style>
