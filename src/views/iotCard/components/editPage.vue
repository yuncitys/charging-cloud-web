<template>
	<div style="display: inline-block;">
    <el-button type="primary" style="margin-left: 10px;" size="mini"
      @click="onShowEdit()" v-if="btnAuthen.permsVerifAuthention(':iot:card:edit')">
      编辑
    </el-button>
		<el-dialog :visible.sync="showEdit" title="编辑充电卡" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" :rules="iotCardRules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'ICCID'" prop="iccid">
					<el-input v-model="editData.iccid" placeholder="请输入ICCID" disabled />
				</el-form-item>
				<el-form-item :label="'IMSI'" prop="imsi">
					<el-input v-model="editData.imsi" placeholder="请输入IMSI" disabled />
				</el-form-item>
				<el-form-item :label="'msisdn'" prop="msisdn">
					<el-input v-model="editData.msisdn" placeholder="请输入MSISDN" disabled />
				</el-form-item>
				<!-- <el-form-item :label="'归属'" prop="adminId">
					<el-autocomplete class="filter-item" v-model="editData.adminName" :fetch-suggestions="querySearch"
						placeholder="请选择归属" @select="selectOperator" clearable :debounce='0' style="width: 100%;"
						@change="changeOperatorName">
					</el-autocomplete>
				</el-form-item> -->
				<el-form-item :label="'渠道商'" prop="channelName">
					<el-input v-model="editData.channelName" placeholder="请输入渠道商" clearable />
				</el-form-item>
				<el-form-item :label="'备注'" prop="remark">
					<el-input v-model="editData.remark" placeholder="请输入备注" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onEdit('editData')">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
    update
	} from '@/api/iotCard/iotCard.js'
  import {
    getOperator
  } from '@/api/agent/agentList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		props: {
			row_data: {
				type: Object
			}
		},
		name: 'editIotCard',
		data() {
			return {
				showEdit: false,
        		operatorList:[],
				editData: {
					id: '',
					iccid: '',
					imsi: '',
					msisdn: '',
					channelName:'',
					remark:''
				},
				iotCardRules: {
					iccid: [{
						required: true,
						message: '请输入iccid',
						trigger: 'blur'
					}],
					imsi: [{
						required: true,
						message: '请输入imsi',
						trigger: 'blur'
					}],
					msisdn: [{
						required: true,
						message: '请输入msisdn',
						trigger: 'blur'
					}],
					channelName: [{
						required: true,
						message: '请输入卡渠道商',
						trigger: 'blur'
					}],
					remark: [{
						required: true,
						message: '请输入卡备注',
						trigger: 'blur'
					}],
				},
			}
		},
		methods: {
			onShowEdit() {
        		// this.getOperator()
				let item = this.row_data
				this.editData.id = item.id
				this.editData.iccid = item.iccid
				this.editData.imsi = item.imsi
				this.editData.msisdn = item.msisdn
				this.editData.channelName = item.channelName
				this.editData.remark = item.remark
				this.showEdit = true
			},
			onEdit(formName) {
				console.log(this.editData)
				update(this.editData).then(res => {
					if (res.code == 200) {
						this.showEdit = false
						this.resetForm(formName)
						this.$message.success(res.msg)
						this.$emit('getLists')
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			//选择代理商
			selectOperator(item) {
				this.editData.adminId = item.operatorId + ''
				this.editData.adminName = item.value + ''
			},
			changeOperatorName() {
				if (this.editData.adminName == '') {
					this.editData.adminId = ''
				}
				this.getOperator()
			},
			querySearch(queryString, cb) {
				var restaurants = this.restaurants;
				console.log("restaurants：",restaurants)
				let restaurantsText = []
				if (restaurants.length != '') {
					restaurants.forEach((item, index) => {
						let obj = {
							value: '',
							operatorId: ''
						}
						let value = item.adminName + "(" + item.adminFullname + ")"
						obj.value = value
						obj.operatorId = item.id
						restaurantsText.push(obj)
					})
				}
				var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
				console.log("results：",results)
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			createFilter(queryString) {
				return (restaurant) => {
					return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
				};
			},
			//代理商列表
			getOperator() {
				getOperator().then(res => {
					if (res.code == 200) {
						this.operatorList = res.data
						this.restaurants = this.operatorList
						this.restaurants.forEach((item, index) => {
							if (Number(this.editData.adminId) === Number(item.id)) {
								this.editData.adminName = item.adminName + "(" + item.adminFullname + ")"
							}
						})
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
