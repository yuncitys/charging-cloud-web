<template>
	<div class="charge-station-page app-container">
		<div class="charge-station-page__toolbar">
			<el-button icon="el-icon-arrow-left" @click="handleCancel">返回</el-button>
			<span class="charge-station-page__title">{{ title }}</span>
		</div>
		<div class="charge-station-page__content">
			<div class="charge-station-page__center-wrap">
			<div class="charge-station-page__steps">
				<el-steps :active="currentStep" align-center>
					<el-step title="基础信息"></el-step>
					<el-step title="监管信息"></el-step>
					<el-step title="运营信息"></el-step>
				</el-steps>
			</div>
			<div class="charge-station-page__body-scroll">
			<el-form v-if="currentStep === 1" ref="formData" :model="formData" label-position="left" label-width="120px" class="charge-station-form" :rules="rules">
				<!-- <el-form-item :label="'充电站类型'" prop="ruleId">
					<el-radio-group v-model="formData.ruleId" :disabled = "isDetail">
						<el-radio :label="1">单车充电站</el-radio>
						<el-radio :label="2">汽车充电站</el-radio>
					</el-radio-group>
				</el-form-item> -->
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="formData.ruleId == 2 ? 12 : 24">
						<el-form-item :label="'运营商户'" prop="merchantId">
							<el-select style="width: 100%;" class="filter-item" v-model="formData.merchantId" filterable clearable placeholder="请选择归属运营商户" :disabled = "isDetail">
								<el-option
									v-for="item in merchantList"
									:key="item.id"
									:label="item.name"
									:value="item.id">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col v-if="formData.ruleId == 2" :xs="24" :sm="12">
						<el-form-item :label="'计费标准'" prop="pricingRuleId">
							<el-select style="width: 100%;" class="filter-item" v-model="formData.pricingRuleId" filterable clearable placeholder="请选择站点计费标准" :disabled = "isDetail">
								<el-option
									v-for="item in priceTypeList"
									:key="item.id"
									:label="item.feeName"
									:value="item.id">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" class="charge-station-form__row">
					<el-col :span="24">
						<el-form-item :label="'归属地区'" prop="areaPath">
							<el-cascader
								:key="areaCascaderKey"
								v-model="formData.areaPath"
								:options="areaOptions"
								:props="stationAreaCascaderProps"
								:disabled="isDetail"
								clearable
								filterable
								placeholder="请选择省 / 市 / 区"
								style="width: 100%;"
								append-to-body
								popper-class="charge-station-form__area-popper"
								@change="handleStationAreaChange"
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'充电站名称'" prop="networkName">
							<el-input v-model="formData.networkName" placeholder="请输入充电站名称" clearable :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'充电站位置'" prop="networkAddress">
							<el-input v-model="formData.networkAddress" placeholder="请在下方投放地输入地址查询或者手动输入" clearable :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'充电站经度'" prop="networkLongitude">
							<el-input v-model="formData.networkLongitude" placeholder="请在下方投放地输入地址查询" clearable type="number" :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'充电站纬度'" prop="networkLatitude">
							<el-input v-model="formData.networkLatitude" placeholder="请在下方投放地输入地址查询" clearable type="number" :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" class="charge-station-form__row">
					<el-col :span="24">
						<el-form-item :label="'投放地查询'" prop="">
							<input id="tipinput" placeholder="请输入大概地址查询" type="text" v-model="mapInput" autocomplete="off" :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" class="charge-station-form__row">
					<el-col :span="24">
						<el-form-item :label="''" prop="">
							<el-tag type="warning" style="font-size: 16px;">在投放地输入框内查询小区位置后，可点击地图再次选取更详细的楼层或街道地址</el-tag>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row class="charge-station-form__row">
					<el-col :span="24">
						<div id="GDMap" class="charge-station-page__map"></div>
					</el-col>
				</el-row>
			</el-form>
			<el-form v-if="currentStep === 2" ref="formData" :model="formData" label-position="left" label-width="120px" class="charge-station-form" :rules="rules">
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'电站位置'" prop="locationAddress">
							<el-radio-group v-model="formData.locationAddress" :disabled = "isDetail">
								<el-radio :label="1">地上电站</el-radio>
								<el-radio :label="2">地下电站</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'可用电容'" prop="capacity">
							<el-input v-model="formData.capacity" placeholder="请输入充电站最大电容" clearable type="number" :disabled = "isDetail">
								<template slot="append">KWA</template>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'电站类型'" prop="stationType">
							<el-select style="width: 100%;" class="filter-item" v-model="formData.stationType" filterable clearable placeholder="请选择电站类型" :disabled = "isDetail">
								<el-option
									v-for="item in stationTypeList"
									:key="item.id"
									:label="item.name"
									:value="item.id">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'建设场所'" prop="buildAddress">
							<el-select style="width: 100%;" class="filter-item" v-model="formData.buildAddress" filterable clearable placeholder="请选择电站建设场所" :disabled = "isDetail">
								<el-option
									v-for="item in buildAddressList"
									:key="item.id"
									:label="item.name"
									:value="item.id">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'人员值守'" prop="isDuty">
							<el-radio-group v-model="formData.isDuty" :disabled = "isDetail">
								<el-radio :label="false">否</el-radio>
								<el-radio :label="true">是</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'独立报装'" prop="isAloneApply">
							<el-radio-group v-model="formData.isAloneApply" :disabled = "isDetail">
								<el-radio :label="false">否</el-radio>
								<el-radio :label="true">是</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'公共停车场'" prop="isPublicParkingLot">
							<el-radio-group v-model="formData.isPublicParkingLot" :disabled = "isDetail">
								<el-radio :label="false">否</el-radio>
								<el-radio :label="true">是</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<el-form v-if="currentStep === 3" ref="formData" :model="formData" label-position="left" label-width="120px" class="charge-station-form" :rules="rules">
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'站场辅助设备'" prop="">
							<el-checkbox v-model="formData.isBarrierGate" label="道闸" :disabled = "isDetail">道闸</el-checkbox>
							<el-checkbox v-model="formData.isLockFlag" label="地锁" :disabled = "isDetail">地锁</el-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'管理员电话'" prop="phone">
							<el-input v-model="formData.phone" placeholder="请输入管理员联系方式" clearable type="text" :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'营业时间'" prop="businessHours">
							<el-time-picker
								:disabled = "isDetail"
								is-range
								v-model="formData.businessHours"
								value-format="HH:mm:ss"
								range-separator="至"
								start-placeholder="开始时间"
								end-placeholder="结束时间"
								placeholder="选择时间范围"
								append-to-body
								popper-class="charge-station-form__time-popper"
								style="width: 100%; max-width: 100%;">
							</el-time-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'停车收费模式'" prop="parkFeeType">
							<el-select style="width: 100%;" class="filter-item" v-model="formData.parkFeeType" filterable clearable placeholder="请选择停车收费类型" :disabled = "isDetail">
								<el-option
									v-for="item in parkFeeType"
									:key="item.id"
									:label="item.name"
									:value="item.id">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item :label="'停车收费提示'" prop="parkFeeTip">
							<el-input v-model="formData.parkFeeTip" placeholder="请输入停车收费提示" clearable type="text" :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" type="flex" class="charge-station-form__row">
					<el-col :span="24">
						<el-form-item :label="'站点标签'" prop="stationTag">
							<el-select style="width: 100%;" class="filter-item" v-model="formData.stationTag" multiple placeholder="请选择站点标签" :disabled = "isDetail">
								<el-option
									v-for="item in stationTagList"
									:key="item.id + ''"
									:label="item.name"
									:value="item.id + ''">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" class="charge-station-form__row">
					<el-col :span="24">
						<el-form-item :label="'电站图片'" prop="stationPictures">
							<div class="picture-grid">
								<div class="picture-slot" v-for="slot in stationPictureSlots" :key="slot.sort">
									<el-upload
										action=""
										:show-file-list="false"
										:disabled="isDetail"
										:http-request="(p) => handleStationPictureUpload(slot.sort, p)"
										accept=".jpg,.jpeg,.png,.gif">
										<div class="picture-box">
											<el-image
												v-if="isDetail && getPictureUrl(slot.sort)"
												:src="getPictureUrl(slot.sort)"
												:preview-src-list="[getPictureUrl(slot.sort)]"
												style="width: 100%; height: 100%;"
												fit="contain">
											</el-image>
											<el-image
												v-else-if="getPictureUrl(slot.sort)"
												:src="getPictureUrl(slot.sort)"
												style="width: 100%; height: 100%;"
												fit="contain">
											</el-image>
											<i v-else class="el-icon-plus picture-plus"></i>
										</div>
									</el-upload>
									<div class="picture-label">{{ slot.label }}</div>
								</div>
							</div>
							<div class="picture-tip">图片仅支持 .jpg、.jpeg、.png、.gif，建议比例4:3，最多5张</div>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="24" class="charge-station-form__row">
					<el-col :span="24">
						<el-form-item :label="'站场备注'" prop="remark">
							<el-input v-model="formData.remark" placeholder="请输入备注信息" clearable  type="textarea" :disabled = "isDetail"/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			</div>
			<div class="charge-station-page__footer">
				<el-button @click="handleCancel">取 消</el-button>
				<el-button v-if="currentStep > 1" @click="prevStep('formData')">上一步</el-button>
        		<el-button v-if="currentStep < 3" type="primary" @click="nextStep('formData')">下一步</el-button>
				<el-button v-if="currentStep === 3  && !isDetail"type="primary" @click="onformData('formData')">保 存</el-button>
			</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		addNetworkDot,
		updateNetworkDot,
		getChargeStationById,
		getNetworkDotPictures
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
    	getOperator
    } from '@/api/operator/operator.js'
	import {
    	getMerchant
    } from '@/api/merchant/merchant.js'
	import {
		findDevicePriceByPriceType
	} from '@/api/device/deviceList.js'
	import { upload } from '@/api/upload/file'
	import loadMap from "../../../utils/loadMap.js";
	import {
		parseTime
	} from '@/utils/index'
	import { getAreaSelector } from '@/api/area/index'
	export default {
		name: 'ChargeStationForm',
		components: {},
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				stationTagList: [
					{
						id: 1,
						name: '免费wifi'
					},
					{
						id: 2,
						name: '空调休息室'
					},
					{
						id: 3,
						name: '按摩室'
					},
					{
						id: 4,
						name: '便利店'
					},
					{
						id: 5,
						name: '洗车'
					},
					{
						id: 6,
						name: '饮用水'
					},
					{
						id: 7,
						name: '厕所'
					},
					{
						id: 8,
						name: '快餐'
					},
					{
						id: 9,
						name: '自动售货机'
					},
					{
						id: 10,
						name: '雨蓬'
					},
				],
				stationTypeList: [
					{
						id: 1,
						name: '公共'
					},
					{
						id: 50,
						name: '个人'
					},
					{
						id: 100,
						name: '公交（专用）'
					},
					{
						id: 101,
						name: '环卫（专用）'
					},
					{
						id: 102,
						name: '物流（专用）'
					},
					{
						id: 103,
						name: '出租车（专用） '
					},
					{
						id: 255,
						name: '其它 '
					},
				],
				buildAddressList: [
					{
						id: 1,
						name: '居民区'
					},
					{
						id: 2,
						name: '公共机构'
					},
					{
						id: 3,
						name: '企事业单位'
					},
					{
						id: 4,
						name: '写字楼'
					},
					{
						id: 5,
						name: '工业园区'
					},
					{
						id: 6,
						name: '交通枢纽'
					},
					{
						id: 7,
						name: '大型文体设施'
					},
					{
						id: 8,
						name: '城市绿地'
					},
					{
						id: 9,
						name: '大型建筑配建停车场'
					},
					{
						id: 10,
						name: '路边停车场'
					},
					{
						id: 11,
						name: '城际高速服务区'
					},
					{
						id: 255,
						name: '其它'
					}
				],
				parkFeeType: [
					{
						id: 1,
						name: '免费停车'
					},
					{
						id: 2,
						name: '收费停车'
					},
					{
						id: 3,
						name: '充电减免'
					},
					{
						id: 4,
						name: '限时免费'
					},
					{
						id: 5,
						name: '其它'
					},
				],
				auxiliaryDeviceList: [
					{
						id: 'isBarrierGate',
						name: '到闸',
						default: false,   //默认选中
					},
					{
						id: 'isLockFlag',
						name: '地锁',
						default: false,   //默认选中
					},
					{
						id: 'other',
						name: '其它',
						default: false,   //默认选中
					},
				],
				rules: {
					ruleId: [{
						required: true,
						message: '请选择充电站类型',
						trigger: 'blur'
					}],
					networkAddress: [{
						required: true,
						message: '请输入充电站位置',
						trigger: 'blur'
					}],
					networkName: [{
						required: true,
						message: '请输入充电站名称',
						trigger: 'blur'
					}],
					merchantId: [{
						required: true,
						message: '请选择归属运营商户',
						trigger: 'change'
					}],
					networkLongitude: [{
						required: true,
						message: '请输入充电站经度',
						trigger: 'blur'
					}],
					networkLatitude: [{
						required: true,
						message: '请输入充电站纬度',
						trigger: 'blur'
					}],
					startingPrice: [{
						required: true,
						message: '请输入充电站最低起充电价',
						trigger: 'blur'
					}],
					locationAddress: [{
						required: true,
						message: '请选择电站位置',
						trigger: 'blur'
					}],
					areaPath: [{
						required: true,
						validator: (rule, value, callback) => {
							if (Array.isArray(value) && value.length === 3 && value[0] && value[1] && value[2]) {
								callback()
							} else {
								callback(new Error('请选择归属地区（省、市、区）'))
							}
						},
						trigger: 'change'
					}],
					capacity: [{
						required: true,
						message: '请输入电站电容',
						trigger: 'blur'
					}],
					stationType: [{
						required: true,
						message: '请选择电站类型',
						trigger: 'blur'
					}],
					buildAddress: [{
						required: true,
						message: '请选择电站建设场所',
						trigger: 'blur'
					}],
					isDuty: [{
						required: true,
						message: '请选择是否人员值守',
						trigger: 'blur'
					}],
					isAloneApply: [{
						required: true,
						message: '请选择是否独立报装',
						trigger: 'blur'
					}],
					isPublicParkingLot: [{
						required: true,
						message: '请选择是否公共停车场',
						trigger: 'blur'
					}],
					phone: [{
						required: true,
						message: '请输入管理员联系方式',
						trigger: 'blur'
					}],
					parkFeeType: [{
						required: true,
						message: '请选择停车收费类型',
						trigger: 'blur'
					}],
					parkFeeTip: [{
						required: true,
						message: '请输入停车收费提示',
						trigger: 'blur'
					}],
					stationTag: [{
						type: 'array',
						required: true,
						message: '请选择站点标签',
						trigger: 'change'
					}],
					businessHours: [{
						required: true,
						validator: (rule, value, callback) => {
							if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
								callback()
							} else {
								callback(new Error('请选择营业时间'))
							}
						},
						trigger: 'change'
					}],
					stationPictures: [{
						type: 'array',
						required: true,
						validator: (rule, value, callback) => {
							const hasPicture = (this.stationPictureSlots || []).some(s => s && s.url)
							if (!hasPicture) callback(new Error('请至少上传1张站点图片'))
							else callback()
						},
						trigger: 'change'
					}],
					remark: [{
						required: true,
						message: '请输入站点备注',
						trigger: 'blur'
					}],
					auxiliaryDeviceCheckList: [{
						required: true,
						message: '请选择站场辅助设备',
						trigger: 'change'
					}],
					pricingRuleId: [{
						required: true,
						message: '请选择站场计费标准',
						trigger: 'change'
					}],
				},
				title: "新增站点",
				isEdit: false,
				isDetail: false,
				currentStep: 1,
				areaOptions: [],
				areaCascaderKey: 1,
				stationAreaCascaderProps: {
					value: 'id',
					label: 'fullName',
					children: 'children',
					emitPath: true,
					lazy: true,
					lazyLoad: (node, resolve) => {
						this.loadStationAreaChildren(node, resolve)
					}
				},
        		operatorList: [],
				merchantList: [],
				priceTypeList: [],
				stationPictureSlots: [
					{ sort: 1, label: '主入口图', url: '' },
					{ sort: 2, label: '标志路径', url: '' },
					{ sort: 3, label: '电站全景', url: '' },
					{ sort: 4, label: '电桩特写', url: '' },
					{ sort: 5, label: '其它图片', url: '' }
				],
				formData: {
					networkAddress: '',
					networkName: '',
					networkLongitude: '',
					networkLatitude: '',
					tenantId: '',
					towncode: '',
					networkProvince: '',
					networkCity: '',
					networkRegion: '',
					areaPath: [],
          			startingPrice: 0.0,
					ruleId: 1,
					type: 1,
					locationAddress: 1,
					capacity: '',
					stationType: '',
					buildAddress: '',
					isDuty: false,
					isAloneApply: false,
					isPublicParkingLot: false,
					isLockFlag: false,
					isBarrierGate: false,
					phone: '',
					parkFeeType: '',
					parkFeeTip: '',
					stationTag: [],
					businessHours: null,
					stationPictures: [],
					remark: '',
					pricingRuleId: '',
					merchantId: ''
				},
				mapInput: "",
				// 地图实例
				GDMap: null,
				// 加载的一些插件
				// 更多参考：https://lbs.amap.com/api/javascript-api/guide/abc/plugins#plugins
				plugins: [
					"AMap.Autocomplete",
					"AMap.PlaceSearch",
					"AMap.OverView",
					"AMap.MouseTool",
					"AMap.PolyEditor",
					"AMap.RectangleEditor",
					"AMap.DistrictLayer",
					"AMap.CustomLayer"
				],
				key: (window.BaseConfig && window.BaseConfig.VUE_MAP_KEY) ? window.BaseConfig.VUE_MAP_KEY : '',
				v: "1.4.4"// 地图版本
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		mounted() {
			this.bootstrapFromRoute()
		},
		watch: {
			'$route.fullPath'() {
				if ((this.$route.path || '').includes('chargeStationForm')) {
					this.bootstrapFromRoute()
				}
			}
		},
		methods: {
			normalizeRadioBool(val) {
				if (val === true || val === 1 || val === '1') return true
				return false
			},
			parseBusinessHoursForForm(val) {
				if (val == null || val === '') return null
				let arr = val
				if (typeof val === 'string') {
					try {
						arr = JSON.parse(val)
					} catch (e) {
						return null
					}
				}
				if (!Array.isArray(arr) || arr.length !== 2) return null
				if (arr[0] == null || arr[1] == null || arr[0] === '' || arr[1] === '') return null
				return arr
			},
			normalizeStationAreaList(res) {
				const data = res && res.data
				const list = Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : (Array.isArray(res) ? res : []))
				return list.map(item => ({
					...item,
					id: item && item.id != null ? String(item.id) : item.id
				}))
			},
			findStationAreaNodeBySavedValue(list, saved) {
				const s = String(saved || '').trim()
				if (!s || !Array.isArray(list)) return null
				const byId = list.find(n => String(n.id) === s)
				if (byId) return byId
				return list.find(n => this.stationAreaNameMatch(n.fullName, s))
			},
			stationAreaNameMatch(apiName, savedName) {
				if (!apiName || !savedName) return false
				const a = String(apiName).replace(/\s/g, '')
				const b = String(savedName).replace(/\s/g, '')
				return a === b || a.includes(b) || b.includes(a)
			},
			loadStationAreaChildren(node, resolve) {
				if (!node) {
					resolve([])
					return
				}
				const level = node.level
				const parentId = level === 0 ? '-1' : (node.value != null ? String(node.value) : '')
				getAreaSelector(parentId).then(res => {
					const nodes = this.normalizeStationAreaList(res).map(item => ({
						...item,
						leaf: level >= 2
					}))
					resolve(nodes)
				}).catch(() => {
					resolve([])
				})
			},
			loadStationAreaOptionsForPath(provinceId, cityId, countyId) {
				if (!provinceId) return Promise.resolve()
				return getAreaSelector('-1').then(res => {
					const provinces = this.normalizeStationAreaList(res)
					provinces.forEach(p => {
						p.leaf = false
					})
					this.areaOptions = provinces
					const provinceNode = this.areaOptions.find(p => String(p.id) === String(provinceId))
					if (!provinceNode || !cityId) return Promise.resolve()
					return getAreaSelector(provinceId).then(res2 => {
						const cities = this.normalizeStationAreaList(res2)
						cities.forEach(c => {
							c.leaf = false
						})
						this.$set(provinceNode, 'children', cities)
						const cityNode = cities.find(c => String(c.id) === String(cityId))
						if (!cityNode || !countyId) return Promise.resolve()
						return getAreaSelector(cityId).then(res3 => {
							const counties = this.normalizeStationAreaList(res3)
							counties.forEach(a => {
								a.leaf = true
							})
							this.$set(cityNode, 'children', counties)
						})
					})
				}).catch(() => {
					this.areaOptions = []
				})
			},
			hydrateStationAreaFromSavedNames() {
				const p = (this.formData.networkProvince || '').trim()
				const c = (this.formData.networkCity || '').trim()
				const d = (this.formData.networkRegion || '').trim()
				if (!p || !c || !d) {
					this.$set(this.formData, 'areaPath', [])
					return Promise.resolve()
				}
				return getAreaSelector('-1').then(res1 => {
					const provinces = this.normalizeStationAreaList(res1)
					const pi = this.findStationAreaNodeBySavedValue(provinces, p)
					if (!pi) return
					return getAreaSelector(String(pi.id)).then(res2 => {
						const cities = this.normalizeStationAreaList(res2)
						const ci = this.findStationAreaNodeBySavedValue(cities, c)
						if (!ci) return
						return getAreaSelector(String(ci.id)).then(res3 => {
							const dists = this.normalizeStationAreaList(res3)
							const di = this.findStationAreaNodeBySavedValue(dists, d)
							if (!di) return
							return this.loadStationAreaOptionsForPath(String(pi.id), String(ci.id), String(di.id)).then(() => {
								this.$nextTick(() => {
									this.$set(this.formData, 'areaPath', [String(pi.id), String(ci.id), String(di.id)])
								})
							})
						})
					})
				}).catch(() => {})
			},
			handleStationAreaChange(val) {
				const path = Array.isArray(val) ? val.map(v => String(v)) : []
				this.$set(this.formData, 'areaPath', path)
				if (path.length === 3) {
					this.formData.networkProvince = path[0]
					this.formData.networkCity = path[1]
					this.formData.networkRegion = path[2]
				} else {
					this.formData.networkProvince = ''
					this.formData.networkCity = ''
					this.formData.networkRegion = ''
				}
				this.$nextTick(() => {
					this.$refs.formData && this.$refs.formData.validateField('areaPath')
				})
			},
			goBackList() {
				this.$router.push({ path: '/netWorkDot/netWorkDotList' })
			},
			handleCancel() {
				this.goBackList()
			},
			bootstrapFromRoute() {
				if (!(this.$route.path || '').includes('chargeStationForm')) return
				const id = this.$route.query.id
				const ruleId = Number(this.$route.query.ruleId || 1)
				const isDetail = this.$route.query.detail === '1' || this.$route.query.detail === 'true'
				if (!id) {
					this.onshowAdd(null, false, ruleId)
					return
				}
				Promise.all([
					getChargeStationById(id),
					getNetworkDotPictures(id)
				]).then(([res, picRes]) => {
					if (!res || res.code !== 200) {
						this.$message.error((res && res.msg) || '加载站点失败')
						this.goBackList()
						return
					}
					const row = { ...(res.data || {}), id: (res.data && res.data.id) || id }
					let pics = []
					if (picRes && picRes.code === 200 && Array.isArray(picRes.data)) {
						pics = picRes.data
					}
					row.stationPictures = pics
					this.onshowAdd(row, isDetail, Number(row.ruleId || ruleId))
				}).catch(() => {
					this.$message.error('加载站点失败')
					this.goBackList()
				})
			},
			nextStep(formName) {
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						if (this.currentStep < 3) this.currentStep++;
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			prevStep() {
				if (this.currentStep > 1) this.currentStep--;
				if (this.currentStep === 1) this.initMap();
			},
			changeSelect(val){
				let auxiliaryDeviceCheckList = this.auxiliaryDeviceCheckList
				console.log("选中辅助对象:",val)
				console.log("选中辅助设备:",auxiliaryDeviceCheckList)
				this.formData.isLockFlag = auxiliaryDeviceCheckList.includes("isLockFlag")
				this.formData.isBarrierGate = auxiliaryDeviceCheckList.includes("isBarrierGate")
				console.log("表单数据:",this.formData)
			},
			initMap() {
				let _this = this
				loadMap(_this.key, _this.plugins, _this.v).then(AMap => {
					let GDMap = new AMap.Map("GDMap", {
						zoom: 10,
					})

					if (_this.formData.networkLongitude) {
						let position = [_this.formData.networkLongitude, _this.formData.networkLatitude]
						var marker = new AMap.Marker({
							icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
							position: position
						});
						_this.oldMarker = marker
						GDMap.add(marker);
						GDMap.setFitView();
						let infoWindow = new AMap.InfoWindow({
							content: _this.formData.networkAddress,
							offset: new AMap.Pixel(0, -35)
						});
						infoWindow.open(GDMap, marker.getPosition());
					}
					GDMap.on("click", (e) => {
						_this.formData.networkLongitude = e.lnglat.getLng()
						_this.formData.networkLatitude = e.lnglat.getLat()
						let lnglatXY = [e.lnglat.getLng(), e.lnglat.getLat()];
						geocoder(lnglatXY)
					})
					GDMap.on("complete", () => {
						let auto = new AMap.Autocomplete({
							input: 'tipinput'
						})
						let placeSearch = new AMap.PlaceSearch({
							map: GDMap
						})
						AMap.event.addListener(auto, "select", select);

						function select(e) {
							placeSearch.setCity(e.poi.adcode);
							placeSearch.search(e.poi.name);
							console.log(e)
							let addressInfo = e.poi
							_this.formData.networkAddress = addressInfo.name + addressInfo.address
							_this.formData.networkLongitude = addressInfo.location.lng
							_this.formData.networkLatitude = addressInfo.location.lat
							let lnglatXY = [addressInfo.location.lng, addressInfo.location.lat];
							geocoder(lnglatXY)
						}
					})

					function geocoder(lnglatXY) {
						AMap.service('AMap.Geocoder', () => {
							let geocoder = new AMap.Geocoder({
								city: "" //城市，默认：“全国”
							});
							geocoder.getAddress(lnglatXY, (status, result) => {
								if (status === 'complete' && result.info === 'OK') {
									console.log(result)
									let towncode = result.regeocode.addressComponent.towncode;
									_this.formData.towncode = towncode
									_this.formData.networkAddress = result.regeocode
										.formattedAddress

									if (_this.marker) {
										_this.marker.setMap(null);
									}
									if (_this.oldMarker) {
										_this.oldMarker.setMap(null);
									}
									var marker = new AMap.Marker({
										map: GDMap,
										position: lnglatXY
									});
									_this.marker = marker
									//实例化信息窗体
									let content = _this.formData.networkAddress
									var infoWindow = new AMap.InfoWindow({
										content: content,
										offset: new AMap.Pixel(0, -40),
									});
									infoWindow.open(GDMap, marker.getPosition());
									GDMap.setCenter(lnglatXY);
									GDMap.setZoom(18);

									_this.$forceUpdate()
									console.log(_this.formData)
								}
							})
						})
					}
				})
			},
			onshowAdd(formData,isDetail, defaultRuleId) {
				this.areaOptions = []
				if(formData == null){
					this.isEdit = false
					this.isDetail = false
					this.title = '新增站点'
					this.currentStep = 1
					this.formData = {
						networkAddress: '',
						networkName: '',
						networkLongitude: '',
						networkLatitude: '',
						tenantId: '',
						towncode: '',
						networkProvince: '',
						networkCity: '',
						networkRegion: '',
						areaPath: [],
						startingPrice: 0.0,
						ruleId: Number(defaultRuleId || 1),
						type: 1,
						locationAddress: 1,
						capacity: '',
						stationType: '',
						buildAddress: '',
						isDuty: false,
						isAloneApply: false,
						isPublicParkingLot: false,
						isLockFlag: false,
						isBarrierGate: false,
						phone: '',
						parkFeeType: '',
						parkFeeTip: '',
						stationTag: [],
						businessHours: null,
						remark: '',
					}
					this.resetStationPictures([])
					this.areaCascaderKey++
				} else if (!isDetail) {
					this.isEdit = true
					this.isDetail = false
					this.title = '编辑站点'
					this.formData = JSON.parse(JSON.stringify(formData));
					this.formData.isBarrierGate = !!formData.isBarrierGate;
					this.formData.isLockFlag = !!formData.isLockFlag;
					this.formData.isDuty = this.normalizeRadioBool(formData.isDuty)
					this.formData.isAloneApply = this.normalizeRadioBool(formData.isAloneApply)
					this.formData.isPublicParkingLot = this.normalizeRadioBool(formData.isPublicParkingLot)
					this.formData.businessHours = this.parseBusinessHoursForForm(this.formData.businessHours)
					this.formData.stationTag = JSON.parse(formData.stationTag) || []
					this.resetStationPictures(Array.isArray(formData.stationPictures) ? formData.stationPictures : [])
					this.$set(this.formData, 'areaPath', [])
					this.hydrateStationAreaFromSavedNames().finally(() => {
						this.areaCascaderKey++
					})
				} else {
					this.isDetail = true
					this.isEdit = false
					this.title = '站点详情'
					this.formData = JSON.parse(JSON.stringify(formData));
					this.formData.isBarrierGate = !!formData.isBarrierGate;
					this.formData.isLockFlag = !!formData.isLockFlag;
					this.formData.isDuty = this.normalizeRadioBool(formData.isDuty)
					this.formData.isAloneApply = this.normalizeRadioBool(formData.isAloneApply)
					this.formData.isPublicParkingLot = this.normalizeRadioBool(formData.isPublicParkingLot)
					this.formData.businessHours = this.parseBusinessHoursForForm(this.formData.businessHours)
					this.formData.stationTag = JSON.parse(formData.stationTag) || []
					this.resetStationPictures(Array.isArray(formData.stationPictures) ? formData.stationPictures : [])
					this.$set(this.formData, 'areaPath', [])
					this.hydrateStationAreaFromSavedNames().finally(() => {
						this.areaCascaderKey++
					})
				}
				this.mapInput = ''
				this.getMerchant()
				this.getDevicePriceByPriceType()
				this.$nextTick(() => {
					this.initMap()
				})
			},
			onformData(formName) {
				let data = this.formData
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						const payload = { ...data }
						delete payload.areaPath
						Object.assign(payload, {
							businessHours: JSON.stringify(Array.isArray(this.formData.businessHours) ? this.formData.businessHours : []),
							stationTag: JSON.stringify(Array.isArray(this.formData.stationTag) ? this.formData.stationTag : []),
							stationPictures: this.stationPictureSlots.filter(s => s.url).slice(0, 5).map(s => ({
							pictureUrl: s.url,
							sort: s.sort
							}))
						})
						if (!payload.stationPictures || payload.stationPictures.length < 1) {
							this.$message.error('请至少上传1张站点图片')
							return false
						}
						if (!this.isEdit){
							addNetworkDot(payload).then(res => {
								if (res.code == 200) {
									this.resetForm(formName)
									this.$message.success(res.msg)
									this.$emit('getLists')
									this.goBackList()
								} else {
									this.$message.error(res.msg)
								}
							})
						} else {
							updateNetworkDot(payload).then(res => {
								if (res.code == 200) {
									this.resetForm(formName)
									this.$message.success(res.msg)
									this.$emit('getLists')
									this.goBackList()
								} else {
									this.$message.error(res.msg)
								}
							})
						}
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			getOperator() {
				getOperator().then(res => {
					this.operatorList = res.data || []
				})
			},
			 getMerchant() {
				getMerchant({ roleType: 'OPERATOR', type: 1 }).then(res => {
					if (res && res.code == 200) {
					this.merchantList = res.data || []
					}
				})
			},
			getDevicePriceByPriceType() {
				let data = {
					priceType: 1,
					ruleId: 2
				}
				findDevicePriceByPriceType(data).then(res => {
					if (res.code == 200) {
						this.priceTypeList = res.data || []
					}
				})
			},
				getPictureUrl(sort) {
					const f = this.stationPictureSlots.find(s => s.sort === sort)
					return f ? f.url : ''
				},
				setPictureUrl(sort, url) {
					const idx = this.stationPictureSlots.findIndex(s => s.sort === sort)
					if (idx !== -1) {
						this.$set(this.stationPictureSlots, idx, {
							...this.stationPictureSlots[idx],
							url
						})
					}
					this.formData.stationPictures = this.stationPictureSlots.filter(s => s && s.url).map(s => s.url)
					this.$refs['formData'] && this.$refs['formData'].validateField('stationPictures')
				},
				handleStationPictureUpload(sort, params) {
					const file = params.file
					if (!file) return
					const name = file.name || ''
					const type = file.type || ''
					const extOk = /\.(jpe?g|png|gif)$/i.test(name)
					const mimeOk = /^image\/(jpeg|png|gif)$/i.test(type)
					if (!extOk && !mimeOk) {
						this.$message.error('仅支持 jpg/jpeg/png/gif')
						return
					}
					const form = new FormData()
					form.append('file', file)
					upload('WebAnnexFile', form).then(res => {
						const url = res && res.data && (res.data.url || res.data)
						this.setPictureUrl(sort, url || res.data)
						this.$message.success('上传成功')
					}).catch(() => {
						this.$message.error('上传失败')
					})
				},
				resetStationPictures(list) {
					const base = [
						{ sort: 1, label: '主入口图', url: '' },
						{ sort: 2, label: '标志路径', url: '' },
						{ sort: 3, label: '电站全景', url: '' },
						{ sort: 4, label: '电桩特写', url: '' },
						{ sort: 5, label: '其它图片', url: '' }
					]
					if (Array.isArray(list)) {
						list.forEach(it => {
							const s = base.find(b => String(b.sort) === String(it.sort))
							if (s) s.url = it.pictureUrl || ''
						})
					}
					this.stationPictureSlots = base
					this.formData.stationPictures = this.stationPictureSlots.filter(s => s && s.url).map(s => s.url)
				}
		},
		created() {

		},
	}
</script>

<style>
	.charge-station-page {
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 120px);
		box-sizing: border-box;
	}
	.charge-station-page__toolbar {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
		flex-shrink: 0;
	}
	.charge-station-page__title {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
	}
	.charge-station-page__content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		min-width: 0;
	}
	.charge-station-page__center-wrap {
		max-width: 1160px;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		padding: 0 16px;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.charge-station-page__steps {
		flex-shrink: 0;
		margin-bottom: 8px;
		width: 100%;
	}
	.charge-station-page__body-scroll {
		flex: 1;
		overflow: auto;
		padding-bottom: 16px;
		min-height: 0;
		overscroll-behavior: contain;
	}
	.charge-station-form__time-popper,
	.charge-station-form__area-popper {
		z-index: 3100 !important;
	}
	.charge-station-form {
		width: 100%;
		max-width: 100%;
		margin-left: 0;
	}
	.charge-station-form__row {
		margin-bottom: 0;
	}
	.charge-station-form .el-col .el-form-item {
		margin-bottom: 18px;
	}
	.charge-station-page__footer {
		flex-shrink: 0;
		padding: 16px 0 0;
		border-top: 1px solid #ebeef5;
		text-align: right;
	}
	.charge-station-page__footer .el-button + .el-button {
		margin-left: 10px;
	}
	.charge-station-page__map {
		height: 400px;
		width: 100%;
		max-width: 100%;
		margin: 24px 0 60px;
	}

	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}

	.amap-sug-result {
		z-index: 9999 !important;
	}

	#tipinput {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	#tipinput1 {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	.picture-grid {
		display: flex;
		align-items: flex-start;
		gap: 20px;
		flex-wrap: wrap;
	}
	.picture-slot {
		width: 120px;
	}
	.picture-box {
		width: 120px;
		height: 120px;
		border: 1px solid #e4e7ed;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
	}
	.picture-plus { 
		font-size: 28px; 
		color: #909399;
	}
	.picture-label {
		text-align: center;
		color: #409EFF;
		margin-top: 8px;
		font-size: 12px;
	}
	.picture-tip {
		margin-top: 8px;
		color: #909399;
		font-size: 12px;
	}
</style>
