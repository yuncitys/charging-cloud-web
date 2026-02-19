<!--
*添加代理商
-->
<template>
	<div style="display: inline-block;">
		<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click='onShowAdd'
			v-if="btnAuthen.permsVerifAuthention(':sys:admin:addAdminUser')">添加账号
		</el-button>
		<!-- 添加代理商-->
		<el-dialog :visible.sync="showAdd" title="添加账号" @close="showAdd = false" style="width: 100%;"
			:append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="120px"
				style="margin-left:50px;width: 650px;" :rules="rules">
				<el-form-item :label="'登录账号'" prop="adminName">
					<el-input v-model="addData.adminName" placeholder="请输入登录账号" clearable />
				</el-form-item>
				<el-form-item :label="'姓名'" prop="adminFullname">
					<el-input v-model="addData.adminFullname" placeholder="请输入姓名" clearable />
				</el-form-item>
				<el-form-item :label="'手机号'" prop="adminPhone">
					<el-input v-model="addData.adminPhone" placeholder="请输入手机号" clearable />
				</el-form-item>
				<el-form-item :label="'角色类型'" prop="roleType">
					<el-radio-group v-model="addData.roleType" @change="changeRoleType">
						<el-radio :label="1">平台管理员</el-radio>
						<el-radio :label="2">租户管理员</el-radio>
						<el-radio :label="3">商户管理员</el-radio>
						<el-radio :label="4">站点管理员</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'角色'" prop="roleId" style="width: 100%;">
					<el-select v-model="addData.roleId" class="filter-item" placeholder="请选择角色" clearable :disabled="showRole"
						@keyup.enter.native="handleFilter" style="width: 100%;">
						<el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"/>
					</el-select>
				</el-form-item>
				<el-form-item :label="label" prop="selectedStations" v-if="addData.roleType != '' && addData.roleType != 1">
					<div class="station-select-box">
						<div class="search-bar">
							<el-input v-model="searchKey" placeholder="请输入关键字进行过滤" clearable></el-input>
							<el-button type="primary" @click="filterTree">搜索</el-button>
						</div>
						<el-tree
							ref="tree"
							:data="filteredData"
							show-checkbox
							node-key="id"
							:props="defaultProps"
							:default-expand-all="false"
							:filter-node-method="filterNode"
							@check-change="handleCheck"
						></el-tree>
					</div>
				</el-form-item>
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
		addAdminUser
	} from '@/api/agent/agentList.js'
	import {
		findRoleAllList,
	} from '@/api/permission/role.js'
	import {
		parseTime
	} from '@/utils/index'
	import {
        getChargeStationTreeByMerchant
    } from '@/api/netWorkDot/netWorkDotList.js'
	import {
        getMerchant
    } from '@/api/merchant/merchant.js'
	import {
        getOperator
    } from '@/api/operator/operator.js'
	export default {
		name: 'agentAddpage',
		components: {

		},
		data() {
			let checkNum = (rule, value, callback) => {
				let regx = /^\d+\.\d+$/;
				if (regx.test(value)) {
					callback(new Error('请输入整数'))
				} else {
					if (parseInt(value) < 0) {
						console.log("111")
						callback(new Error('不能小于0'))
						console.log("222")
					} else if (parseInt(value) > 100) {
						callback(new Error('不能大于100'))
					} else {
						callback()
						console.log("333")
					}
				}
			}
			let checkPhone = (rule, value, callback) => {
				if (!(/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value))) {
					callback(new Error('手机号码格式有误，请重填'))
					return false;
				} else {
					callback()
				}
			}
			return {
				showAdd: false,
				showRole: true,
				addData: {
					adminName: '',
					adminFullname: '',
					adminPhone: '',
					roleId: '',
					roleType: '',
					dataIdList: [],
				},
				rules: {
					adminName: [{
						required: true,
						message: '请输入登录账号',
						trigger: 'blur'
					}],
					adminFullname: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					adminPhone: [{
						required: true,
						message: '请输入手机号',
						trigger: 'blur'
					}, {
						validator: checkPhone,
						trigger: 'blur'
					}],
					roleId: [{
						required: true,
						message: '请选择角色',
						trigger: 'change'
					}],
					roleType: [{
						required: true,
						message: '请选择角色类型',
						trigger: 'change'
					}],
				},
				roleList: [],

				label: '',
				searchKey: '',
				defaultProps: {
					children: 'children',
					label: 'label'
				},
				filteredData: [],
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
		watch: {
          searchKey() {
            this.filterTree();
          },
        },
		methods: {
			filterNode(value, data) {
				console.log("value",value,"data",data)
				if (!value) return true;
				return data.label.includes(value);
            },
            filterTree() {
              	this.$refs.tree.filter(this.searchKey);
            },
            handleCheck(data, checked) {
				const selected = this.$refs.tree.getCheckedKeys();
				console.log("handleCheck selected:",selected)
				this.addData.dataIdList = this.filterMerchantIds(selected);
            },
			initTreeData(roleType){
				switch (roleType) {
					case 2:
						this.label = '选择租户'
						this.getOperator()
						break;
					case 3:
						this.label = '选择商户'
						this.getMerchant()
						break
					case 4:
						this.label = '选择站点'
						this.getChargeStation()
						break
					default:
						break;
				}
              	
            },
			getChargeStation(){
				getChargeStationTreeByMerchant().then(res => {
					if (res.code != 200){
						return;
					}
					const stations = res.data.map(merchant => ({
						id: `merchant-${merchant.id}`,  // 商户ID加前缀，避免与充电站ID冲突
						label: merchant.name,
						type: 'merchant',
						// disabled: true,    // 可选：禁用商户节点选中
						// ...merchant,
						children: (merchant.chargingStationInfoVoList || []).map(station => ({
							id: String(station.id ),
							label: station.networkName,
							type: 'station',
							...station,
							// 如果有更深层级可以继续嵌套 children
						}))
					}))
					console.log("stations:",stations)
					this.filteredData = JSON.parse(JSON.stringify(stations));
				})
			},
			getMerchant(){
				getMerchant().then(res => {
					if (res.code != 200){
						return;
					}
					const merchant = res.data.map(merchant => ({
						id: merchant.id,
						label: merchant.name,
						children: []
					}))
					console.log("merchant:",merchant)
					this.filteredData = JSON.parse(JSON.stringify(merchant));
				})
			},
			getOperator(){
				getOperator().then(res => {
					if (res.code != 200){
						return;
					}
					const operator = res.data.map(operator => ({
						id: operator.id,
						label: operator.name,
						children: []
					}))
					console.log("operator:",operator)
					this.filteredData = JSON.parse(JSON.stringify(operator));
				})
			},
			// 过滤商户ID的通用方法
			filterMerchantIds(ids) {
				if (!Array.isArray(ids)) return []
				return ids.filter(id =>  
					typeof id === 'number' || 
					(typeof id === 'string' && !id.startsWith('merchant'))
				)
			},
			changeRoleType(roleType) {
				console.log("changeRoleType:",roleType)
				this.showRole = false
				this.addData.roleType = roleType
				this.addData.roleId = ''
				this.findRoleAllList(roleType)
				this.initTreeData(roleType)
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			onShowAdd() {
				this.showAdd = true
			},
			onaddData(formName) {
				let addData = JSON.parse(JSON.stringify(this.addData))
				this.$refs[formName].validate(valid => {
					if (valid) {
						console.log("通过")
						addAdminUser(addData).then(res => {
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
						console.log("不通过")
						return false
					}
				})
			},
			findRoleAllList(roleType) {
				const data = {
					roleType: roleType
				}
				findRoleAllList(data).then(res => {
					if (res.code == 200) {
						this.roleList = res.data
					}
				})
			},
		},
		created() {

		},
	}
</script>

<style scoped>
 .station-select-box {
    border: 0.2px solid gray;
    padding: 10px;
    border-radius: 4px;
  }
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .search-bar .el-input {
    flex: 1;
  }
</style>
