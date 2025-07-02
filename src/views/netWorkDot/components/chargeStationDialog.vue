<template>
	<div> <!-- style="display: inline-block;" -->
		<!-- <el-button style="margin-right: 20px ;" type="primary" @click="onshowAdd" class="filter-item"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:add')">
      		新增充电站
		</el-button> -->

		<!-- 新增充电站 -->
		<el-dialog :visible.sync="showAdd" :title="title" @close="showAdd = false" :destroy-on-close="true" :append-to-body="true" width="60%">
			<div style="width: 100%; height:100px;">
				<el-steps :active="currentStep" align-center>
					<el-step title="基础信息"></el-step>
					<el-step title="监管信息"></el-step>
					<el-step title="运营信息"></el-step>
				</el-steps>
			</div>
			<el-form v-if="currentStep === 1" ref="formData" :model="formData" label-position="left" label-width="120px" style="width: 800px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'充电站类型'" prop="ruleId">
					<el-radio-group v-model="formData.ruleId" :disabled = "isDetail">
						<el-radio :label="1">单车充电站</el-radio>
						<el-radio :label="2">汽车充电站</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'运营商户'" prop="tenantId">
					<el-select style="width: 100%;" class="filter-item" v-model="formData.tenantId" filterable clearable placeholder="请选择归属运营商户" :disabled = "isDetail">
						<el-option
							v-for="item in operatorList"
							:key="item.operatorId"
							:label="item.name"
							:value="item.operatorId + ''">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="'充电站名称'" prop="networkName">
					<el-input v-model="formData.networkName" placeholder="请输入充电站名称" clearable :disabled = "isDetail"/>
				</el-form-item>
				<el-form-item :label="'充电起始价'" prop="startingPrice" v-if="formData.ruleId == 2">
					<el-input v-model="formData.startingPrice" placeholder="请输入充电站最低起充电价(元)" clearable type = "number" :disabled = "isDetail">
						<template slot="append">元</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'充电站位置'" prop="networkAddress">
					<el-input v-model="formData.networkAddress" placeholder="请在下方投放地输入地址查询或者手动输入" clearable :disabled = "isDetail"/>
				</el-form-item>
				<el-form-item :label="'充电站经度'" prop="networkLongitude">
					<el-input v-model="formData.networkLongitude" placeholder="请在下方投放地输入地址查询" clearable type="number" :disabled = "isDetail"/>
				</el-form-item>
				<el-form-item :label="'充电站纬度'" prop="networkLatitude">
					<el-input v-model="formData.networkLatitude" placeholder="请在下方投放地输入地址查询" clearable type="number" :disabled = "isDetail"/>
				</el-form-item>
				<!-- <el-form-item :label="'省'" prop="networkProvince">
					<el-input v-model="formData.networkProvince" placeholder="请在下方投放地输入地址查询" clearable disabled />
				</el-form-item>
				<el-form-item :label="'市'" prop="networkCity">
					<el-input v-model="formData.networkCity" placeholder="请在下方投放地输入地址查询" clearable disabled />
				</el-form-item>
				<el-form-item :label="'区'" prop="networkRegion">
					<el-input v-model="formData.networkRegion" placeholder="请在下方投放地输入地址查询" clearable disabled />
				</el-form-item> -->
				<el-form-item :label="'投放地查询'" prop="">
					<input id="tipinput" placeholder="请输入大概地址查询" type="text" v-model="mapInput" autocomplete="off" v-if="showAdd" :disabled = "isDetail"/>
				</el-form-item>
				<el-form-item :label="''" prop="">
					<el-tag type="warning" style="font-size: 16px;">在投放地输入框内查询小区位置后，可点击地图再次选取更详细的楼层或街道地址</el-tag>
				</el-form-item>
				<div id="GDMap" style="height:400px;width: 900px;margin: 60px 0;" v-if="showAdd"></div>
			</el-form>
			<el-form v-if="currentStep === 2" ref="formData" :model="formData" label-position="left" label-width="120px" style="width: 800px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'电站位置'" prop="locationAddress">
					<el-radio-group v-model="formData.locationAddress" :disabled = "isDetail">
						<el-radio :label="1">地上电站</el-radio>
						<el-radio :label="2">地下电站</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'可用电容'" prop="capacity">
					<el-input v-model="formData.capacity" placeholder="请输入充电站最大电容" clearable type="number" :disabled = "isDetail">
						<template slot="append">KWA</template>
					</el-input>
				</el-form-item>
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
				<el-form-item :label="'人员值守'" prop="isDuty">
					<el-radio-group v-model="formData.isDuty" :disabled = "isDetail">
						<el-radio :label="0">否</el-radio>
						<el-radio :label="1">是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'独立报装'" prop="isAloneApply">
					<el-radio-group v-model="formData.isAloneApply" :disabled = "isDetail">
						<el-radio :label="0">否</el-radio>
						<el-radio :label="1">是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'公共停车场'" prop="isPublicParkingLot">
					<el-radio-group v-model="formData.isPublicParkingLot" :disabled = "isDetail">
						<el-radio :label="0">否</el-radio>
						<el-radio :label="1">是</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<el-form v-if="currentStep === 3" ref="formData" :model="formData" label-position="left" label-width="120px" style="width: 800px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'站场辅助设备'" prop="">
					<!-- <el-checkbox-group v-model="formData.auxiliaryDeviceCheckList">
						<el-checkbox v-for="item in auxiliaryDeviceList"
							:key="item.id"
							:label="item.id"
							:checked="item.default"
							@change="changeSelect(item)"
						>{{item.name}}</el-checkbox>
					</el-checkbox-group> -->
					<el-checkbox v-model="formData.isBarrierGate" label="道闸" :disabled = "isDetail">道闸</el-checkbox>
					<el-checkbox v-model="formData.isLockFlag" label="地锁" :disabled = "isDetail">地锁</el-checkbox>
				</el-form-item>
				<el-form-item :label="'营业时间'" prop="businessHours">
					<el-time-picker
						:disabled = "isDetail"
						is-range
						v-model="formData.businessHours"
						value-format="HH:mm:ss"
						range-separator="至"
						start-placeholder="开始时间"
						end-placeholder="结束时间"
						placeholder="选择时间范围">
					</el-time-picker>
				</el-form-item>
				<el-form-item :label="'管理员电话'" prop="phone">
					<el-input v-model="formData.phone" placeholder="请输入管理员联系方式" clearable type="text" :disabled = "isDetail"/>
				</el-form-item>
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
				<el-form-item :label="'停车收费提示'" prop="parkFeeTip">
					<el-input v-model="formData.parkFeeTip" placeholder="请输入停车收费提示" clearable type="text" :disabled = "isDetail"/>
				</el-form-item>
				<el-form-item :label="'站点标签'" prop="stationTag">
					<el-select style="width: 100%;" class="filter-item" v-model="formData.stationTag" multiple collapse-tags placeholder="请选择站点标签" :disabled = "isDetail">
						<el-option
							v-for="item in stationTagList"
							:key="item.id + ''"
							:label="item.name"
							:value="item.id + ''">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="'站场备注'" prop="remark">
					<el-input v-model="formData.remark" placeholder="请输入备注信息" clearable  type="textarea" :disabled = "isDetail"/>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showAdd = false">取 消</el-button>
				<el-button v-if="currentStep > 1" @click="prevStep('formData')">上一步</el-button>
        		<el-button v-if="currentStep < 3" type="primary" @click="nextStep('formData')">下一步</el-button>
				<el-button v-if="currentStep === 3  && !isDetail"type="primary" @click="onformData('formData')">保 存</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import {
		addNetworkDot,
		updateNetworkDot
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
      getOperator
    } from '@/api/operator/operator.js'
	import loadMap from "../../../utils/loadMap.js";
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'addChargingStation',
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
					tenantId: [{
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
					networkProvince: [{
						required: true,
						message: '请选择电站位置',
						trigger: 'blur'
					}],
					networkCity: [{
						required: true,
						message: '请选择电站位置',
						trigger: 'blur'
					}],
					networkRegion: [{
						required: true,
						message: '请选择电站位置',
						trigger: 'blur'
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
						required: true,
						message: '请选择站点标签',
						trigger: 'blur'
					}],
					businessHours: [{
						required: true,
						message: '请选择营业时间',
						trigger: 'blur'
					}],
					remark: [{
						required: true,
						message: '请输入站点备注',
						trigger: 'blur'
					}],
					auxiliaryDeviceCheckList: [{
						required: true,
						message: '请选择站场辅助设备',
						trigger: 'blur'
					}],
				},
				title: "新增站点",
				isEdit: false,
				isDetail: false,
				currentStep: 1,
				showAdd: false,
        		operatorList: [],
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
          			startingPrice: 0.0,
					ruleId: 1,
					type: 1,
					locationAddress: 1,
					capacity: '',
					stationType: '',
					buildAddress: '',
					isDuty: 0,
					isAloneApply: 0,
					isPublicParkingLot: 0,
					isLockFlag: false,
					isBarrierGate: false,
					phone: '',
					parkFeeType: '',
					parkFeeTip: '',
					stationTag: '',
					businessHours: '',
					remark: '',
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
				key: '87331a23c6a4e734969f8621bc166eff',
				// key: '160cab8ad6c50752175d76e61ef92c50',
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

		},
		methods: {
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
			// createFilter(queryString) {
			// 	return (restaurant) => {
			// 		return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
			// 	};
			// },
			// changeName() {
			// 	if (this.formData.adminName == '') {
			// 		this.formData.adminId = ''
			// 	}
			// },
			// addchangeDealer(item) {
			// 	this.formData.adminId = item.dealerId
			// 	this.formData.adminName = item.value + ''
			// },
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
									let province = result.regeocode.addressComponent
										.province;
									let city = result.regeocode.addressComponent
										.city;
									let district = result.regeocode.addressComponent
										.district;
									let towncode = result.regeocode.addressComponent.towncode;
									_this.formData.towncode = towncode
									_this.formData.networkProvince = province
									_this.formData.networkCity = city
									_this.formData.networkRegion = district
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
			onshowAdd(formData,isDetail) {
				this.showAdd = true
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
						startingPrice: 0.0,
						ruleId: 1,
						type: 1,
						locationAddress: 1,
						capacity: '',
						stationType: '',
						buildAddress: '',
						isDuty: 0,
						isAloneApply: 0,
						isPublicParkingLot: 0,
						isLockFlag: false,
						isBarrierGate: false,
						phone: '',
						parkFeeType: '',
						parkFeeTip: '',
						stationTag: '',
						businessHours: '',
						remark: '',
					}
				} else if (!isDetail) {
					this.isEdit = true
					this.isDetail = false
					this.title = '编辑站点'
					this.formData = JSON.parse(JSON.stringify(formData));
					this.formData.isBarrierGate = !!formData.isBarrierGate;
					this.formData.isLockFlag = !!formData.isLockFlag;
					this.formData.businessHours = JSON.parse(formData.businessHours)
					this.formData.stationTag = JSON.parse(formData.stationTag)
					
				} else {
					this.isDetail = true
					this.isEdit = false
					this.title = '站点详情'
					this.formData = JSON.parse(JSON.stringify(formData));
					this.formData.isBarrierGate = !!formData.isBarrierGate;
					this.formData.isLockFlag = !!formData.isLockFlag;
					this.formData.businessHours = JSON.parse(formData.businessHours)
					this.formData.stationTag = JSON.parse(formData.stationTag)
				}
				this.mapInput = ''
				this.getOperator()
				this.$nextTick(() => {
					this.initMap()
				})
			},
			onformData(formName) {
				let data = this.formData
				if (data.tenantId == '' || data.tenantId == null || data.tenantId == undefined) {
					this.$message.error('请选择运营商')
					return false
				}
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						data.businessHours = JSON.stringify(this.formData.businessHours)
						data.stationTag = JSON.stringify(this.formData.stationTag)
						if (!this.isEdit){
							addNetworkDot(data).then(res => {
								if (res.code == 200) {
									this.showAdd = false
									this.resetForm(formName)
									this.$message.success(res.msg)
									this.$emit('getLists')
								} else {
									this.$message.error(res.msg)
								}
							})
						} else {
							updateNetworkDot(data).then(res => {
								if (res.code == 200) {
									this.showAdd = false
									this.resetForm(formName)
									this.$message.success(res.msg)
									this.$emit('getLists')
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
					this.operatorList = res.data
				})
			},
		},
		created() {

		},
	}
</script>

<style>
	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/*height:600px;*/
		max-height: calc(100% - 30px);
		max-width: calc(100% - 30px);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;

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
</style>
