<template>
	<div style="display: inline-block;">
		<div>
			<el-button type="primary"
				v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:carCharge:edit')"
				@click="showDidlaoEditData">
        		编辑方案
			</el-button>
			<!-- 编辑方案 style="margin-right: 20px ;"-->
			<el-dialog :visible.sync="showEdit" title="编辑方案" @close="showEdit = false" class="scheme-dialog"
				:append-to-body="true">
				<el-form ref="editData" :model="editData" label-position="left" label-width="80px">
					<el-form-item :label="'方案名称'" prop="name">
						<el-input v-model="editData.name" placeholder="请输入方案名称" clearable/>
					</el-form-item>
					<el-form-item :label="'价格类别'" prop="realTimeCharging">
						<div class="price-item" v-for="(item,index) in  editData.priceTier" :key="index">
							<el-input disabled size="medium" :placeholder="item.periodTypeName" v-model="item.periodTypeName" style="width: 100px">
								<!-- <template slot="prepend">时段</template> -->
							</el-input>
							<el-input class="price-input" size="medium" type = "number" placeholder="0.00" v-model="item.powerPrice">
								<template slot="prepend">电费</template>
								<template slot="append">元</template>
							</el-input>
							<el-input class="price-input" size="medium" type = "number" placeholder="0.00" v-model="item.serviceFee">
								<template slot="prepend">服务费</template>
								<template slot="append">元</template>
							</el-input>
						</div>
					</el-form-item>
					<el-form-item label="价格时区" prop="realTimeCharging">
						<div class="price-period-item"
							v-for="(_item,_index) in  editData.periodTimePrices.periodPriceList" :key="_index">
							<i class="el-icon-remove" style="font-size:30px;color:#1890FF;cursor:pointer"
								@click="delEditPeridPriceItem(_index)"
								v-if="editData.periodTimePrices && editData.periodTimePrices.periodPriceList && editData.periodTimePrices.periodPriceList.length>1"></i>
							<i class="el-icon-remove" style="font-size:30px;color:#BFBFBF;cursor:pointer" v-else></i>
							<select-time @selectFouce="editPeriodTimeFouce" :stTime="_item.stTime" :itemIndex="_index"
								@onSelectedTime="onEditSelectedTime" :enTime="_item.enTime"
								:disabled-items="editData.disabledItems"></select-time>
							<el-select class="select-priod-type" v-model="_item.periodTypeId">
								<el-option v-for="(item,index) in  editData.priceTier" :value="item.periodTypeId"
									:label="item.periodTypeName +': 电费 【'+item.powerPrice+'元】 服务费 【'+item.serviceFee+' 元】' ">
								</el-option>
							</el-select>
						</div>
					</el-form-item>
					<el-form-item>
						<div class="price-period-item">
							<span class="reduce-svg" />
							<div class="periodTypeId">
								<el-input class="other-period" disabled placeholder="其他时段统一价格"></el-input>
							</div>
							<el-select class="select-priod-type"
								v-model="editData.periodTimePrices.defaultPeriodTypeId">
								<el-option v-for="(item,index) in  editData.priceTier" :value="item.periodTypeId"
									:label="item.periodTypeName +': 电费 【'+item.powerPrice+'元】 服务费 【'+item.serviceFee+' 元】' ">
								</el-option>
							</el-select>
						</div>
					</el-form-item>
					<el-form-item>
						<div class="price-period-item add-period-item">
							<i class="el-icon-circle-plus" style="font-size:30px;color:#1890FF;cursor:pointer"
								@click="addEditPeridPriceItem"></i>
							<div @click="addEditPeridPriceItem" class="add-price-period" style="cursor:pointer">添加时间区间
							</div>
						</div>
					</el-form-item>

					<div style="border: 1px solid #eee;padding: 10px;border-radius: 10px;margin-bottom: 30px;margin-top: 10px;">
						<h2>车主显示档位 (充电车主选择支付金额的页面)</h2>
						<div style="display: flex;align-items: center;margin-left: 20px;">
							<div>
								<h3>档位显示方式</h3>
							</div>
							<div style="margin-left: 30px;">
								<el-radio-group v-model="unit">
									<el-radio :label="2">金额</el-radio>
									<el-radio :label="1">电量</el-radio>
									<el-radio :label="0">时间</el-radio>
								</el-radio-group>
							</div>
						</div>
						<div v-if="unit === 2"
							style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
							<div v-for="(item,index) in moneyList" :key="index" style="width: 30%;">
								<el-input placeholder="请输入正整数" v-model="item.id" type="number" min="1" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^0/g,'')"
									style="width: 200px;margin-bottom: 10px;">
									<template slot="append">元</template>
								</el-input>
							</div>
						</div>
						<div v-if="unit === 1"
							style="display: flex;align-items: center;flex-wrap: wrap;margin-left: 20px;width: 100%;">
							<div v-for="(item,index) in electricList" :key="index" style="width: 30%;">
								<el-input placeholder="请输入正整数" v-model="item.id" type="number" min="1" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^0/g,'')"
									style="width: 200px;margin-bottom: 10px;">
									<template slot="append">度</template>
								</el-input>
							</div>
						</div>
						<div v-if="unit === 0"
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
							<div style="display: flex;align-items: center;" v-if="unit === 0">
								<div style="width: 80px;">
									<h3>预收金额</h3>
								</div>
								<div>
									<el-input placeholder="请输入金额" v-model="preMoney" type="number"
										style="width: 250px;">
										<template slot="append">元</template>
									</el-input>
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
	</div>
</template>
<script>
	import {
		getList,
		batchDevicePrices,
		updateDevicePrice,
		deleteDevicePrice
	} from '@/api/netWorkDot/charge/chargeList.js'
	import {
		parseTime
	} from '@/utils/index'

	import SelectTime from '@/components/SelectTime/index'
	export default {
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				preMoney: 50,
				unit: 0,
				moneyList: [{
					id: 20
				}, {
					id: 50
				}, {
					id: 80
				}, {
					id: 100
				}, {
					id: 120
				}, {
					id: 150
				}],
				electricList: [{
					id: 10
				}, {
					id: 20
				}, {
					id: 30
				}, {
					id: 40
				}, {
					id: 50
				}, {
					id: 80
				}],
				timeList: [{
					id: 2
				}, {
					id: 4
				}, {
					id: 6
				}, {
					id: 8
				}, {
					id: 10
				}, {
					id: 12
				}],
				periodTimeArray: [{
					value: 0,
					label: '00:00'
				}, {
					value: 1,
					label: '00:30'
				}, {
					value: 2,
					label: '01:00'
				}, {
					value: 3,
					label: '01:30'
				}, {
					value: 4,
					label: '02:00'
				}, {
					value: 5,
					label: '02:30'
				}, {
					value: 6,
					label: '03:00'
				}, {
					value: 7,
					label: '03:30'
				}, {
					value: 8,
					label: '04:00'
				}, {
					value: 9,
					label: '04:30'
				}, {
					value: 10,
					label: '05:00'
				}, {
					value: 11,
					label: '05:30'
				}, {
					value: 12,
					label: '06:00'
				}, {
					value: 13,
					label: '06:30'
				}, {
					value: 14,
					label: '07:00'
				}, {
					value: 15,
					label: '07:30'
				}, {
					value: 16,
					label: '08:00'
				}, {
					value: 17,
					label: '08:30'
				}, {
					value: 18,
					label: '09:00'
				}, {
					value: 19,
					label: '09:30'
				}, {
					value: 20,
					label: '10:00'
				}, {
					value: 21,
					label: '10:30'
				}, {
					value: 22,
					label: '11:00'
				}, {
					value: 23,
					label: '11:30'
				}, {
					value: 24,
					label: '12:00'
				}, {
					value: 25,
					label: '12:30'
				}, {
					value: 26,
					label: '13:00'
				}, {
					value: 27,
					label: '13:30'
				}, {
					value: 28,
					label: '14:00'
				}, {
					value: 29,
					label: '14:30'
				}, {
					value: 30,
					label: '15:00'
				}, {
					value: 31,
					label: '15:30'
				}, {
					value: 32,
					label: '16:00'
				}, {
					value: 33,
					label: '16:30'
				}, {
					value: 34,
					label: '17:00'
				}, {
					value: 35,
					label: '17:30'
				}, {
					value: 36,
					label: '18:00'
				}, {
					value: 37,
					label: '18:30'
				}, {
					value: 38,
					label: '19:00'
				}, {
					value: 39,
					label: '19:30'
				}, {
					value: 40,
					label: '20:00'
				}, {
					value: 41,
					label: '20:30'
				}, {
					value: 42,
					label: '21:00'
				}, {
					value: 43,
					label: '21:30'
				}, {
					value: 44,
					label: '22:00'
				}, {
					value: 45,
					label: '22:30'
				}, {
					value: 46,
					label: '23:00'
				}, {
					value: 47,
					label: '23:30'
				}, {
					value: 48,
					label: '24:00'
				}],
				priceTier: [{
						periodTypeId: '0',
						periodTypeName: '尖',
						powerPrice: '1.00',
						serviceFee: '1.00'
					},
					{
						periodTypeId: '1',
						periodTypeName: '峰',
						powerPrice: '1.00',
						serviceFee: '1.00'
					},
					{
						periodTypeId: '2',
						periodTypeName: '平',
						powerPrice: '1.00',
						serviceFee: '1.00'
					},
					{
						periodTypeId: '3',
						periodTypeName: '谷',
						powerPrice: '1.00',
						serviceFee: '1.00'
					}
				],
				showEdit: false,
				editData: {
					id: '',
					name: '',
					priceTier: [{
							periodTypeId: '0',
							periodTypeName: '尖',
							powerPrice: '',
							serviceFee: ''
						},
						{
							periodTypeId: '1',
							periodTypeName: '峰',
							powerPrice: '',
							serviceFee: ''
						},
						{
							periodTypeId: '2',
							periodTypeName: '平',
							powerPrice: '',
							serviceFee: ''
						},
						{
							periodTypeId: '3',
							periodTypeName: '谷',
							powerPrice: '',
							serviceFee: ''
						}
					],
					disabledItems: [],
					periodTimePrices: {
						defaultPeriodTypeId: '',
						periodPriceList: [{
							stTime: '',
							enTime: '',
							periodTypeId: '',
							candel: true
						}]
					}
				},
			}
		},
		components: {
			SelectTime
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			}
		},
		methods: {
			addEditPeridPriceItem() {
				this.editData.periodTimePrices.periodPriceList.push({
					stTime: '',
					enTime: '',
					periodTypeId: '',
					candel: true
				})
			},
			onEditSelectedTime(value) {
				this.$set(this.editData.periodTimePrices.periodPriceList[value.itemIndex], 'stTime', value.st_time)
				this.$set(this.editData.periodTimePrices.periodPriceList[value.itemIndex], 'enTime', value.en_time)
			},
			delEditPeridPriceItem(index) {
				this.$delete(this.editData.periodTimePrices.periodPriceList, index)
			},
			editPeriodTimeFouce(value) {
				let selecterIndex = value.selecterIndex
				let itemIndex = value.itemIndex
				this.editData.disabledItems = []
				let periodTimeArray = JSON.parse(JSON.stringify(this.periodTimeArray))
				this.editData.periodTimePrices.periodPriceList.forEach((item, index) => {
					periodTimeArray.forEach((_item, _index) => {
						if (itemIndex == index) { // 获取焦点行
							if (selecterIndex == 0) {
								if (item.enTime && _item.label >= item.enTime) {
									this.editData.disabledItems.push(_item.label)
								}
							} else if (selecterIndex == 1) { // 非获取焦点行
								if (_item.label <= item.stTime && item.stTime) {
									this.editData.disabledItems.push(_item.label)
								}

							}
						} else {
							if (item.stTime && item.enTime) { // 其他行
								if (_item.label > item.stTime && _item.label < item.enTime) { // 已选范围不能选
									this.editData.disabledItems.push(_item.label)

								}
								// 新增时间区间不能穿过其他时间区间
								if (selecterIndex == 0) {
									if (_item.label <= item.stTime && this.editData.periodTimePrices
										.periodPriceList[itemIndex].enTime >= item.enTime) { // 新选值不能跨过已选范围
										this.editData.disabledItems.push(_item.label)
									}
									this.editData.disabledItems.push(item.stTime) // 起始不能选最小
								} else if (selecterIndex == 1) {
									if (_item.label > item.stTime && this.editData.periodTimePrices
										.periodPriceList[itemIndex].stTime <= item.stTime) {
										this.editData.disabledItems.push(_item.label)
									}
									this.editData.disabledItems.push(item.enTime) //结束不能选最大
								}
							}
							if (_index > 0 && _index < periodTimeArray.length - 1 && this.editData
								.disabledItems.indexOf(periodTimeArray[_index - 1]) != -1 && this.editData
								.disabledItems.indexOf(periodTimeArray[_index + 1]) != -1
							) { // 去除前后都已经不能选的选项，该选项已在已选区间
								this.editData.disabledItems.push(_item.label)
							}
						}
					})
				})
				console.log('.....this.editData.disabledItems.....', this.editData.disabledItems)
			},
			validePeriodTime(periodTimes) {
				let timeArray = []
				let validate = true
				console.log('..............periodTimes......', periodTimes)
				periodTimes.forEach((item, index) => {
					console.log('.....item....', item, item.stTime, item.enTime)
					let timeArray1 = item.stTime.split(':')
					let time1 = parseInt(timeArray1[0]) * 60 + parseInt(timeArray1[1])
					let timeArray2 = item.enTime.split(':')
					let time2 = parseInt(timeArray2[0]) * 60 + parseInt(timeArray2[1])
					if (time2 <= time1) { // 结束时间小于等于开始时间
						validate = false
						return
					}
					timeArray[index] = [time1, time2]
				})
				let _timeArray = timeArray
				_timeArray.forEach((item, index) => {
					timeArray.forEach((_item, _index) => {
						if (item[0] >= _item[0] && item[0] < _item[1] && index != _index) {
							validate = false
							return
						}
						if (item[1] > _item[0] && item[1] < _item[1] && index != _index) {
							validate = false
							return
						}
					})
					if (validate == false) {
						return
					}
				})
				return validate
			},
			showDidlaoEditData() {
				let item = this.row_data
				this.showEdit = true
				this.editData.id = item.id
				this.editData.name = item.feeName

				let bill = JSON.parse(item.bill)
				let carPriceTierList = [{
						periodTypeName: '尖',
						powerPrice: 0,
						serviceFee: 0,
						periodTypeId: '0'
					},
					{
						periodTypeName: '峰',
						powerPrice: 0,
						serviceFee: 0,
						periodTypeId: '1'
					},
					{
						periodTypeName: '平',
						powerPrice: 0,
						serviceFee: 0,
						periodTypeId: '2'
					},
					{
						periodTypeName: '谷',
						powerPrice: 0,
						serviceFee: 0,
						periodTypeId: '3'
					},
				]
				carPriceTierList.forEach((item, index) => {
					if (item.periodTypeName === '尖') {
						item.powerPrice = bill.jian
						item.serviceFee = bill.jianEx
					}
					if (item.periodTypeName === '峰') {
						item.powerPrice = bill.feng
						item.serviceFee = bill.fengEx
					}
					if (item.periodTypeName === '平') {
						item.powerPrice = bill.ping
						item.serviceFee = bill.pingEx
					}
					if (item.periodTypeName === '谷') {
						item.powerPrice = bill.gu
						item.serviceFee = bill.guEx
					}
				})
				this.editData.priceTier = carPriceTierList
				this.editData.periodTimePrices.defaultPeriodTypeId = String(item.remainFlag)
				this.editData.periodTimePrices.periodPriceList = []
				item.priceContents.forEach((item, index) => {
					let stTime = item.beginTime.substring(0, 2) + ':' + item.beginTime.substring(2, 4)
					let enTime = item.endTime.substring(0, 2) + ':' + item.endTime.substring(2, 4)
					let obj = {
						candel: true,
						stTime,
						enTime,
						periodTypeId: String(item.flag)
					}
					this.editData.periodTimePrices.periodPriceList.push(obj)
				})

				let priceViewDetail = {};
				if(typeof(item.priceView)=='string'){
				priceViewDetail = JSON.parse(item.priceView);
				}else{
				priceViewDetail = item.priceView;
				}
				item.priceView = priceViewDetail;
				console.log(item.priceView,"挡位")
				let priceViewArr = []
				priceViewArr = item.priceView.view.split(',')
				console.log(priceViewArr,"view")
				let priceViewObj = []
				priceViewArr.forEach((item, index) => {
				let obj = {
					id: item
				}
				priceViewObj.push(obj)
				})
				let priceUnit = item.priceView.unit
				this.unit = priceUnit
				this.preMoney = item.priceView.preMoney
				console.log(priceUnit,"unit")
				if (priceUnit === 0) {
					this.timeList = priceViewObj
				} else if (priceUnit === 2) {
					this.moneyList = priceViewObj
				} else if (priceUnit === 1) {
					this.electricList = priceViewObj
				}

			},
			onEditData(formName) {
				if (this.editData.name == '') {
					this.$message.error('请输入方案名称')
					return false
				}
				if (!this.editData.periodTimePrices.defaultPeriodTypeId) {
					this.$message.error('请选择其他时段统一价格类型')
					return false
				}
				console.log('.....this.addData.periodTimePrices.periodPriceList.length......', this.editData
					.periodTimePrices.periodPriceList.length)
				if (this.editData.periodTimePrices.periodPriceList.length < 1) {
					this.$message.error('请至少添加一个时间区段价格')
					return false
				}

				let _Bean = true
				this.editData.periodTimePrices.periodPriceList.forEach((item, index) => {
					if (!item.periodTypeId) {
						_Bean = false
					}
				})
				if (!_Bean) {
					this.$message.error('时间区段价格设置有误！')
					return
				}
				if (!this.validePeriodTime(this.editData.periodTimePrices.periodPriceList)) {
					this.$message.error('时间区段时间值错误')
					return
				}
				// 传到后台数据
				let returnData = {}
				returnData.id = this.editData.id;
				returnData.defaultPeriodTypeId = this.editData.periodTimePrices.defaultPeriodTypeId
				returnData.name = this.editData.name
				returnData.carPriceTierList = []
				this.editData.priceTier.forEach((item, index) => {
					let tempData = {}
					tempData.periodTypeId = item.periodTypeId
					tempData.periodTypeName = item.periodTypeName
					tempData.powerPrice = item.powerPrice
					tempData.serviceFee = item.serviceFee
					returnData.carPriceTierList.push(tempData)
				})

				returnData.carTimePeriodList = []
				this.editData.periodTimePrices.periodPriceList.forEach((item, index) => {
					let temData = {}
					//{ stTime: '', enTime: '', periodTypeId: '', candel: true }
					temData.enTime = item.enTime + ':00'
					temData.stTime = item.stTime + ':00'
					temData.periodTypeId = item.periodTypeId
					returnData.carTimePeriodList.push(temData)
				})

				let bill = {
					"jian": 0,
					"jianEx": 0,
					"feng": 0,
					"fengEx": 0,
					"ping": 0,
					"pingEx": 0,
					"gu": 0,
					"guEx": 0,
				}
				returnData.carPriceTierList.forEach((item, index) => {
					if (item.periodTypeName === '尖') {
						bill.jian = item.powerPrice
						bill.jianEx = item.serviceFee
					}
					if (item.periodTypeName === '峰') {
						bill.feng = item.powerPrice
						bill.fengEx = item.serviceFee
					}
					if (item.periodTypeName === '平') {
						bill.ping = item.powerPrice
						bill.pingEx = item.serviceFee
					}
					if (item.periodTypeName === '谷') {
						bill.gu = item.powerPrice
						bill.guEx = item.serviceFee
					}
				})
				bill = JSON.stringify(bill)
				let beginTime = [],
					endTime = [],
					flag = []
				returnData.carTimePeriodList.forEach((item, index) => {
					let bTime = item.stTime.split(':')
					let eTime = item.enTime.split(':')
					beginTime.push(bTime[0] + bTime[1])
					endTime.push(eTime[0] + eTime[1])
					flag.push(item.periodTypeId)
				})
				let remainFlag = returnData.defaultPeriodTypeId
				let feeName = returnData.name
				let tdpId = returnData.id
				console.log(bill, beginTime, endTime, flag)

				var priceView = {};
				let priceViewArr = [];
				let priceUnit = this.unit
				let moneyList = this.moneyList
				let timeList = this.timeList
				let electricList = this.electricList
				if( priceUnit === 0 ){
				timeList.forEach((item, index) => {
						priceViewArr.push(item.id)
				})
				} else if (priceUnit === 2){
				moneyList.forEach((item, index) => {
						priceViewArr.push(item.id)
				})
				} else if (priceUnit === 1){
				electricList.forEach((item, index) => {
						priceViewArr.push(item.id)
				})
				}
				priceViewArr = priceViewArr.join(',')
				priceView['view'] = priceViewArr
				priceView['unit'] = priceUnit
				priceView['preMoney'] = this.unit === 0 ? Number(this.preMoney) : 0
				var priceViewJson = JSON.stringify(priceView);
				console.log(priceViewJson);

        		//请求参数
				let data = {
					feeName,
					bill,
					beginTime,
					endTime,
					flag,
					remainFlag,
          			priceView: priceViewJson,
					ruleId: 2,
					priceType: 1,
					tdpId,
				}
				this.$refs[formName].validate(valid => {
					console.log('....valid.....', valid)
					if (valid) {
						console.log('通过')
						updateDevicePrice(data).then(res => {
							if (res.code == 200) {
								this.showEdit = false
								this.resetForm(formName)
								this.$message.success(res.msg)
								this.$emit('getLists')
							} else {
								if (res.msg) {
									this.$message.error(res.msg)
								}
							}
						})
					} else {
						console.log('不通过')
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields()
			}
		},
		created() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
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

	.inputBoxx2 .inputCom {
		width: 35%;
		margin-right: 30px;
	}

	.inputBoxx1 {
		width: 100%;
	}

	.inputBoxx1 .inputCom {
		width: 35%;
		margin-right: 30px;
	}

	.inputBtnn {
		margin-top: 10px !important;
	}

	.formItem {
		margin-bottom: 25px;
	}

	.price-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.price-input {
			margin-left: 10px;
		}
	}

	.price-period-item {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.select-priod-type {
		margin-left: 20px;
		min-width: 250px;
	}

	.scheme-dialog {
		min-width: 550px;
	}

	.reduce-svg {
		width: 24px;
		height: 24px;
		margin-right: 5px;
		flex-grow: 0;
		flex-shrink: 0;
	}

	.add-svg {
		width: 28px;
		height: 28px;
		margin-right: 10px;
	}

	.add-period-item {
		padding-bottom: 15px;
		padding-top: 15px;
	}
</style>
