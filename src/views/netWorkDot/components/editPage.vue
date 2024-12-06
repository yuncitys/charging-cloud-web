<template>
	<div style="display: inline-block;">
		<el-button type="primary" style="margin-left: 10px;" @click="showformData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit')">编辑
		</el-button>
		<!-- 编辑 -->
		<el-dialog :visible.sync="showEdit" title="编辑充电站" @close="showEdit = false" :append-to-body="true" width="60%">
			<el-form ref="formData" :model="formData" label-position="left" label-width="100px"
				style="width: 800px; margin-left:50px;" :rules="rules">
        <el-form-item :label="'运营商'" prop="adminId">
        	<!-- <el-autocomplete class="filter-item" v-model="formData.adminName" :fetch-suggestions="querySearch"
        		placeholder="请选择运营商" @select="editchangeDealer" clearable :debounce='0' style="width: 100%;"
        		@change="changeName">
          </el-autocomplete> -->
          <el-select style="width: 100%;" class="filter-item" v-model="formData.adminId" filterable clearable placeholder="请选择运营商">
              <el-option
                v-for="item in operatorList"
                :key="item.id"
                :label="item.adminFullname"
                :value="item.id">
              </el-option>
          </el-select>
        </el-form-item>
				<el-form-item :label="'充电站类型'" prop="ruleId">
					<el-radio-group v-model="formData.ruleId">
						<el-radio :label="1">单车充电站</el-radio>
						<el-radio :label="2">汽车充电站</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'充电站名称'" prop="networkName">
					<el-input v-model="formData.networkName" placeholder="请输入充电站名称" clearable />
				</el-form-item>
        <el-form-item :label="'充电起始价'" prop="startingPrice" v-if="formData.ruleId == 2">
        	<el-input v-model="formData.startingPrice" placeholder="请输入充电站最低起充电价(元)" clearable type = "number"/>
        </el-form-item>
				<el-form-item :label="'充电站位置'" prop="networkAddress">
					<el-input v-model="formData.networkAddress" placeholder="请在下方投放地输入地址查询或者手动输入" clearable />
				</el-form-item>
				<el-form-item :label="'充电站经度'" prop="networkLongitude">
					<el-input v-model="formData.networkLongitude" placeholder="请在下方投放地输入地址查询" clearable type="number" />
				</el-form-item>
				<el-form-item :label="'充电站纬度'" prop="networkLatitude">
					<el-input v-model="formData.networkLatitude" placeholder="请在下方投放地输入地址查询" clearable type="number" />
				</el-form-item>
        <el-form-item :label="'省'" prop="networkProvince">
        	<el-input v-model="formData.networkProvince" placeholder="请在下方投放地输入地址查询" clearable disabled />
        </el-form-item>
        <el-form-item :label="'市'" prop="networkCity">
        	<el-input v-model="formData.networkCity" placeholder="请在下方投放地输入地址查询" clearable disabled />
        </el-form-item>
        <el-form-item :label="'区'" prop="networkRegion">
        	<el-input v-model="formData.networkRegion" placeholder="请在下方投放地输入地址查询" clearable disabled />
        </el-form-item>
				<el-form-item :label="'投放地查询'" prop="">
					<input id="tipinput" placeholder="请输入大概地址查询" type="text" v-model="mapInput" autocomplete="off"
						v-if="showEdit" />
				</el-form-item>
				<el-form-item :label="''" prop="">
					<el-tag type="warning" style="font-size: 16px;">在投放地输入框内查询小区位置后，可点击地图再次选取更详细的楼层或街道地址</el-tag>
				</el-form-item>
				<div id="GDMap" style="height:400px;width: 800px;margin: 60px 0;" v-if="showEdit"></div>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showEdit = false">取 消</el-button>
				<el-button type="primary" @click="onformData('formData')">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		addNetworkDot,
		updateNetworkDot,
		deleteNetworkDot,
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
	  getOperator
	} from '@/api/agent/agentList.js'
	import loadMap from "../../../utils/loadMap.js";
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'netWorkDotList1',
		components: {

		},
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				rules: {
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
					adminId: [{
						required: true,
						message: '请选择运营商',
						trigger: 'change'
					}],
					networkLongitude: [{
						required: true,
						message: '请输入充电站经度',
						trigger: 'change'
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
				},
				showEdit: false,
        operatorList: [],
				formData: {
					id: '',
					networkAddress: '',
					networkName: '',
					networkLongitude: '',
					networkLatitude: '',
					adminId: '',
					towncode: '',
					networkProvince: '',
					networkCity: '',
					networkRegion: '',
          startingPrice : 0.0,
					ruleId: 1
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
			// editchangeDealer(item) {
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
			showformData() {
				let scope = this.row_data
				console.log(scope)
				let formData = {
					id: scope.id,
					networkAddress: scope.networkAddress,
					networkName: scope.networkName,
					networkLongitude: scope.networkLongitude,
					networkLatitude: scope.networkLatitude,
					adminId: scope.adminId,
					networkProvince: scope.networkProvince,
					networkCity: scope.networkCity,
					networkRegion: scope.networkRegion,
					adminName: scope.adminFullname,
          startingPrice: scope.startingPrice ?? 0,
					ruleId: scope.ruleId
				}
				this.formData = formData
				this.showEdit = true
				this.mapInput = ''
				this.getOperator()
				this.$nextTick(() => {
					this.initMap()
				})
			},
			onformData(formName) {
				console.log(this.formData)
				if (this.formData.adminId == '' || this.formData.adminId == null || this.formData.adminId == undefined) {
					this.$message.error('请选择运营商')
					return false
				}
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						updateNetworkDot(this.formData).then(res => {
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
      getOperator() {
      	getOperator().then(res => {
      		if (res.code == 200) {
      			this.operatorList = res.data
      		} else {
      			this.$message.error(res.msg)
      		}
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
