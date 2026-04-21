<template>
	<div class="app-container station-pricing-car-add">
		<el-card v-loading="detailLoading" class="station-pricing-add-card">
			<div slot="header" class="station-pricing-car-add__header clearfix">
				<div class="station-pricing-car-add__title-block">
					<template v-if="headerStationName">
						<span class="station-pricing-car-add__station-name">{{ headerStationName }}</span>
						<span class="station-pricing-car-add__title-suffix">汽车计费方案</span>
					</template>
					<span v-else class="station-pricing-car-add__fallback-title">新增汽车计费方案</span>
				</div>
				<el-button class="station-pricing-car-add__back" type="text" @click="goBack">返回电价管理</el-button>
			</div>
			<el-form ref="addData" :model="addData" label-position="left" label-width="80px" class="station-pricing-car-add__form">
				<el-form-item :label="'计费模板'">
					<el-select
						v-model="selectedTemplateId"
						filterable
						clearable
						placeholder="请选择汽车计费模板"
						:loading="templateLoading"
						@change="onTemplateSelected"
						class="station-pricing-car-add__template-select"
					>
						<el-option
							v-for="item in templateOptions"
							:key="item.id"
							:label="item.optionLabel"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
				<template v-if="selectedTemplateId">
					<el-form-item :label="'方案名称'" prop="name">
						<el-input v-model="addData.name" placeholder="请输入方案名称" clearable disabled />
					</el-form-item>
					<el-form-item :label="'价格类别'" prop="realTimeCharging">
						<div class="price-item" v-for="(item,index) in  addData.priceTier">
							<el-input disabled :placeholder="item.periodTypeName" v-model="item.periodTypeName" size="medium" class="price-item__period-tag">
								<!-- <template slot="prepend">时段</template> -->
							</el-input>
							<el-input class="price-input" size="medium" type = "number" placeholder="0.00" v-model="item.powerPrice" disabled>
								<template slot="prepend">电费</template>
								<template slot="append">元/度</template>
							</el-input>
							<el-input class="price-input" size="medium" type = "number" placeholder="0.00" v-model="item.serviceFee" disabled>
								<template slot="prepend">服务费</template>
								<template slot="append">元/度</template>
							</el-input>
						</div>
					</el-form-item>
					<el-form-item label="价格时区" prop="realTimeCharging">
						<div class="price-period-item"
							v-for="(_item,_index) in  addData.periodTimePrices.periodPriceList" :key="_index">
							<div class="price-period-item__lead">
								<i class="el-icon-remove price-period-item__icon price-period-item__icon--muted"></i>
							</div>
							<div class="price-period-item__time">
								<select-time @selectFouce="periodTimeFouce" :stTime="_item.stTime" :itemIndex="_index"
									@onSelectedTime="onSelectedTime" :enTime="_item.enTime"
									:disabled-items="addData.disabledItems" :disabled="true"></select-time>
							</div>
							<div class="price-period-item__type">
								<el-select class="select-priod-type" v-model="_item.periodTypeId" @change="addselectSelect" disabled>
									<el-option v-for="(item,index) in  addData.priceTier" :value="item.periodTypeId"
										:label="item.periodTypeName +': 电费 【'+item.powerPrice+'元/度】 服务费 【'+item.serviceFee+' 元/度】' "
										:key="index"></el-option>
								</el-select>
							</div>
						</div>
					</el-form-item>
				</template>
				<div v-else class="station-pricing-car-add__empty">
					<i class="el-icon-document station-pricing-car-add__empty-icon"></i>
					<div class="station-pricing-car-add__empty-text">该站点尚未配置计费策略</div>
				</div>
				<!-- 价格时区：其它统一时段（未覆盖时段的默认价格类型），暂不使用
				<el-form-item>
					<div class="price-period-item">
						<div class="price-period-item__lead">
							<span class="reduce-svg" />
						</div>
						<div class="price-period-item__time">
							<div class="periodTypeId">
								<el-input class="other-period" disabled placeholder="其他时段统一价格"></el-input>
							</div>
						</div>
						<div class="price-period-item__type">
							<el-select class="select-priod-type" v-model="addData.periodTimePrices.defaultPeriodTypeId"
								@change="addselectSelect">
								<el-option v-for="(item,index) in  addData.priceTier" :value="item.periodTypeId"
									:label="item.periodTypeName +': 电费 【'+item.powerPrice+'元/度】 服务费 【'+item.serviceFee+' 元/度】' "
									:key="index"></el-option>
							</el-select>
						</div>
					</div>
				</el-form-item>
				-->
				<el-form-item v-if="selectedTemplateId">
					<el-button
						type="primary"
						:disabled="!selectedTemplateId"
						@click="onaddData('addData')"
						v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:carCharge:add')"
					>确定</el-button>
					<el-button @click="goBack">返回</el-button>
				</el-form-item>
				<el-form-item v-else>
					<el-button @click="goBack">返回</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>
<script>
	import {
		saveCarPricing,
		getStationCarPricingDetail,
		getCarPricingTemplateOptions,
		getCarPricingTemplateDetail
	} from '@/api/netWorkDot/stationPricingRule.js'
	import {
		parseTime
	} from '@/utils/index'
	import SelectTime from '@/components/SelectTime/index'

	/** 站点汽车计费提交时固定的车主档位 priceView（金额模式，与历史默认档位一致） */
	const FIXED_CAR_STATION_PRICE_VIEW_JSON = JSON.stringify({
		view: '20,50,80,100,120,150',
		unit: 2,
		preMoney: 0
	})

	export default {
		name: 'StationPricingCarAdd',
		data() {
			return {
				stationId: null,
				loadedDevicePriceId: null,
				selectedTemplateId: null,
				templateOptions: [],
				templateLoading: false,
				detailLoading: false,
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
						powerPrice: 1.00,
						serviceFee: 1.00
					},
					{
						periodTypeId: '1',
						periodTypeName: '峰',
						powerPrice: 1.00,
						serviceFee: 1.00
					},
					{
						periodTypeId: '2',
						periodTypeName: '平',
						powerPrice: 1.00,
						serviceFee: 1.00
					},
					{
						periodTypeId: '3',
						periodTypeName: '谷',
						powerPrice: 1.00,
						serviceFee: 1.00
					}
				],
				addData: {
					name: '',
					priceTier: [
						{
							periodTypeId: '0',
							periodTypeName: '尖',
							powerPrice: '0.0',
							serviceFee: '0.0'
						},
						{
							periodTypeId: '1',
							periodTypeName: '峰',
							powerPrice: '0.0',
							serviceFee: '0.0'
						},
						{
							periodTypeId: '2',
							periodTypeName: '平',
							powerPrice: '0.0',
							serviceFee: '0.0'
						},
						{
							periodTypeId: '3',
							periodTypeName: '谷',
							powerPrice: '0.0',
							serviceFee: '0.0'
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
		computed: {
			headerStationName() {
				const q = this.$route.query || {}
				const n = q.stationName
				if (n == null || String(n).trim() === '') {
					return ''
				}
				return String(n).trim()
			}
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
			loadTemplateOptions() {
				this.templateLoading = true
				getCarPricingTemplateOptions({ ruleId: 2, priceType: 1 }).then(res => {
					if (!res || res.code !== 200) {
						this.$message.error((res && res.msg) || '加载计费模板失败')
						return
					}
					const rows = res.data || []
					this.templateOptions = rows.map((r) => {
						const id = r && r.id != null ? Number(r.id) : null
						const feeName = r && r.feeName != null ? String(r.feeName) : ''
						const status = r && r.status != null ? Number(r.status) : null
						const suffix = status === 1 ? '' : '（未启用）'
						return {
							id,
							feeName,
							status,
							optionLabel: `${feeName}${suffix}`
						}
					}).filter((r) => r.id != null)
				}).catch(() => {
					this.$message.error('加载计费模板失败')
				}).finally(() => {
					this.templateLoading = false
				})
			},
			loadCarPricingDetail() {
				if (this.stationId == null || this.stationId === '') {
					return
				}
				this.detailLoading = true
				getStationCarPricingDetail({ stationId: this.stationId }).then(res => {
					if (!res || res.code !== 200) {
						this.$message.error((res && res.msg) || '加载计费详情失败')
						return
					}
					const vo = res.data || {}
					this.loadedDevicePriceId = vo.devicePriceId != null ? vo.devicePriceId : null
					this.selectedTemplateId = vo.devicePriceId != null ? Number(vo.devicePriceId) : null
					if (vo.pricing) {
						this.applyPricingFromDetail(vo.pricing)
					} else {
						const q = this.$route.query || {}
						this.resetForm('addData')
					}
				}).catch(() => {
					this.$message.error('加载计费详情失败')
				}).finally(() => {
					this.detailLoading = false
				})
			},
			onTemplateSelected(value) {
				const id = value != null && value !== '' ? Number(value) : null
				this.selectedTemplateId = id
				if (id == null) {
					this.resetForm('addData')
					return
				}
				this.detailLoading = true
				getCarPricingTemplateDetail({ devicePriceId: id }).then(res => {
					if (!res || res.code !== 200) {
						this.$message.error((res && res.msg) || '加载计费模板详情失败')
						return
					}
					this.applyPricingFromDetail(res.data || {})
				}).catch(() => {
					this.$message.error('加载计费模板详情失败')
				}).finally(() => {
					this.detailLoading = false
				})
			},
			applyPricingFromDetail(item) {
				if (!item) {
					return
				}
				this.addData.name = item.feeName || ''
				let bill = {}
				try {
					bill = typeof item.bill === 'string' ? JSON.parse(item.bill) : (item.bill || {})
				} catch (e) {
					bill = {}
				}
				const carPriceTierList = [
					{ periodTypeName: '尖', powerPrice: 0, serviceFee: 0, periodTypeId: '0' },
					{ periodTypeName: '峰', powerPrice: 0, serviceFee: 0, periodTypeId: '1' },
					{ periodTypeName: '平', powerPrice: 0, serviceFee: 0, periodTypeId: '2' },
					{ periodTypeName: '谷', powerPrice: 0, serviceFee: 0, periodTypeId: '3' }
				]
				carPriceTierList.forEach((row) => {
					if (row.periodTypeName === '尖') {
						row.powerPrice = bill.jian
						row.serviceFee = bill.jianEx
					}
					if (row.periodTypeName === '峰') {
						row.powerPrice = bill.feng
						row.serviceFee = bill.fengEx
					}
					if (row.periodTypeName === '平') {
						row.powerPrice = bill.ping
						row.serviceFee = bill.pingEx
					}
					if (row.periodTypeName === '谷') {
						row.powerPrice = bill.gu
						row.serviceFee = bill.guEx
					}
				})
				this.addData.priceTier = carPriceTierList
				this.addData.periodTimePrices.defaultPeriodTypeId = item.remainFlag != null && item.remainFlag !== ''
					? String(item.remainFlag)
					: ''
				this.addData.periodTimePrices.periodPriceList = []
				const contents = item.priceContents || []
				contents.forEach((pc) => {
					const bt = pc.beginTime || ''
					const et = pc.endTime || ''
					const stTime = bt.length >= 4 ? `${bt.substring(0, 2)}:${bt.substring(2, 4)}` : ''
					const enTime = et.length >= 4 ? `${et.substring(0, 2)}:${et.substring(2, 4)}` : ''
					this.addData.periodTimePrices.periodPriceList.push({
						candel: true,
						stTime,
						enTime,
						periodTypeId: pc.flag != null ? String(pc.flag) : ''
					})
				})
			},
			addselectSelect(value) {
				console.log('... addselectSelect....', value)
				console.log('this.adddata', this.addData)
			},
			addPeridPriceItem() {
				this.addData.periodTimePrices.periodPriceList.push({
					stTime: '',
					enTime: '',
					periodTypeId: '',
					candel: true
				})
			},
			onSelectedTime(value) {
				console.log('...value.itemIndex..', value.itemIndex, value.selecterIndex, value)

				this.$set(this.addData.periodTimePrices.periodPriceList[value.itemIndex], 'stTime', value.st_time)

				this.$set(this.addData.periodTimePrices.periodPriceList[value.itemIndex], 'enTime', value.en_time)

			},
			delPeridPriceItem(index) {
				this.$delete(this.addData.periodTimePrices.periodPriceList, index)
			},
			periodTimeFouce(value) {
				let selecterIndex = value.selecterIndex
				let itemIndex = value.itemIndex
				this.addData.disabledItems = []
				let periodTimeArray = this.periodTimeArray
				this.addData.periodTimePrices.periodPriceList.forEach((item, index) => {
					periodTimeArray.forEach((_item, _index) => {
						if (itemIndex == index) { // 获取焦点行
							if (selecterIndex == 0) {
								if (item.enTime && _item.label >= item.enTime) {
									this.addData.disabledItems.push(_item.label)
								}
							} else if (selecterIndex == 1) { // 非获取焦点行
								if (_item.label <= item.stTime && item.stTime) {
									this.addData.disabledItems.push(_item.label)
								}

							}
						} else {
							if (item.stTime && item.enTime) { // 其他行
								if (_item.label > item.stTime && _item.label < item.enTime) { // 已选范围不能选
									this.addData.disabledItems.push(_item.label)

								}
								// 新增时间区间不能穿过其他时间区间
								if (selecterIndex == 0) {
									if (_item.label <= item.stTime && this.addData.periodTimePrices
										.periodPriceList[itemIndex].enTime >= item.enTime) { // 新选值不能跨过已选范围
										this.addData.disabledItems.push(_item.label)
									}
									this.addData.disabledItems.push(item.stTime) // 起始不能选最小
								} else if (selecterIndex == 1) {
									if (_item.label > item.stTime && this.addData.periodTimePrices
										.periodPriceList[itemIndex].stTime <= item.stTime) {
										this.addData.disabledItems.push(_item.label)
									}
									this.addData.disabledItems.push(item.enTime) //结束不能选最大
								}
							}
							if (_index > 0 && _index < periodTimeArray.length - 1 && this.addData
								.disabledItems.indexOf(periodTimeArray[_index - 1]) != -1 && this.addData
								.disabledItems.indexOf(periodTimeArray[_index + 1]) != -1
							) { // 去除前后都已经不能选的选项，该选项已在已选区间
								this.addData.disabledItems.push(_item.label)
							}
						}
					})
				})
				if (selecterIndex == 0) { // stTime

				} else if (selecterIndex == 1) { //enTime

				}
			},
			onaddData(formName) {
				const stationId = this.stationId
				if (stationId == null || stationId === '') {
					this.$message.error('缺少站点ID，请从电价管理进入')
					return
				}
				if (!this.selectedTemplateId) {
					this.$message.warning('请选择计费模板')
					return
				}
				const payload = {
					stationId: Number(stationId),
					devicePriceId: Number(this.selectedTemplateId)
				}
				saveCarPricing(payload).then(res => {
					if (res && res.code === 200) {
						this.$message.success(res.msg || '保存成功')
						this.goBack()
						return
					}
					this.$message.error((res && res.msg) || '保存失败')
				}).catch(() => {
					this.$message.error('保存失败')
				})
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
			resetForm(formName) {
				this.$refs[formName].resetFields()
				this.addData = {
					name: '',
					priceTier: [
						{
							periodTypeId: '0',
							periodTypeName: '尖',
							powerPrice: '0.0',
							serviceFee: '0.0'
						},
						{
							periodTypeId: '1',
							periodTypeName: '峰',
							powerPrice: '0.0',
							serviceFee: '0.0'
						},
						{
							periodTypeId: '2',
							periodTypeName: '平',
							powerPrice: '0.0',
							serviceFee: '0.0'
						},
						{
							periodTypeId: '3',
							periodTypeName: '谷',
							powerPrice: '0.0',
							serviceFee: '0.0'
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
				}
			},
			goBack() {
				this.$router.push({ path: '/netWorkDot/stationPricingList' })
			}
		},
		mounted() {
			const q = this.$route.query || {}
			const sid = q.stationId
			if (sid == null || String(sid).trim() === '') {
				this.$message.error('缺少站点ID，请从电价管理进入')
				return
			}
			this.stationId = Number(sid)
			if (!Number.isFinite(this.stationId)) {
				this.$message.error('站点ID无效')
				return
			}
			this.loadTemplateOptions()
			this.loadCarPricingDetail()
		}
	}
</script>

<style scoped="scoped" lang="scss">
	.station-pricing-car-add {
		width: 100%;
		box-sizing: border-box;
	}
	.station-pricing-add-card {
		width: 100%;
		box-sizing: border-box;
	}
	.station-pricing-car-add__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px;
	}
	.station-pricing-car-add__title-block {
		flex: 1;
		min-width: 0;
	}
	.station-pricing-car-add__station-name {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
		margin-right: 10px;
		word-break: break-all;
	}
	.station-pricing-car-add__title-suffix {
		font-size: 14px;
		color: #909399;
		font-weight: normal;
	}
	.station-pricing-car-add__fallback-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}
	.station-pricing-car-add__back {
		flex-shrink: 0;
		padding: 3px 0 !important;
	}
	.station-pricing-car-add__template-select {
		width: 100%;
	}
	.station-pricing-car-add__empty {
		padding: 30px 0 12px;
		text-align: center;
		color: #909399;
	}
	.station-pricing-car-add__empty-icon {
		display: inline-block;
		font-size: 34px;
		margin-bottom: 6px;
		color: #c0c4cc;
	}
	.station-pricing-car-add__empty-text {
		font-size: 14px;
	}

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

	/* 价格类别 / 价格时区：三列对齐 100px | 1fr | 1fr */
	.station-pricing-car-add__form {
		.price-item {
			display: grid;
			grid-template-columns: 100px 1fr 1fr;
			gap: 10px;
			align-items: center;
			margin-bottom: 10px;
			width: 100%;
			box-sizing: border-box;
		}
		.price-item__period-tag {
			width: 100% !important;
			max-width: 100px;
		}
		.price-item .price-input {
			margin-left: 0;
			width: 100% !important;
		}
		.price-period-item {
			display: grid;
			grid-template-columns: 100px 1fr 1fr;
			gap: 10px;
			align-items: center;
			margin-bottom: 10px;
			width: 100%;
			box-sizing: border-box;
		}
		.price-period-item__lead {
			width: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-sizing: border-box;
		}
		.price-period-item__icon {
			font-size: 30px;
			cursor: pointer;
		}
		.price-period-item__icon--active {
			color: #1890ff;
		}
		.price-period-item__icon--muted {
			color: #bfbfbf;
			cursor: default;
		}
		.price-period-item__icon--plus {
			color: #1890ff;
		}
		.price-period-item__time {
			min-width: 0;
			width: 100%;
		}
		.price-period-item__type {
			min-width: 0;
			width: 100%;
		}
		.price-period-item__type .select-priod-type {
			width: 100%;
			margin-left: 0;
		}
		.price-period-item--add {
			grid-template-columns: 100px 1fr;
		}
		.price-period-item__add-text {
			grid-column: 2 / -1;
			cursor: pointer;
			color: #1890ff;
			line-height: 30px;
		}
		.periodTypeId {
			width: 100%;
		}
		.other-period {
			width: 100%;
		}
	}

	::v-deep .station-pricing-car-add__form .price-period-item__time .select-container {
		width: 100%;
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 4px;
	}
	::v-deep .station-pricing-car-add__form .price-period-item__time .select-container .el-select {
		flex: 1;
		min-width: 0;
	}
	::v-deep .station-pricing-car-add__form .price-period-item__time .time-interval {
		flex-shrink: 0;
		padding: 0 6px;
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
