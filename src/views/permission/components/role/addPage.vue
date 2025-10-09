<template>
	<div>
		<el-button style="margin-right: 20px ;" type="primary" @click="onShowAdd"
			v-if="btnAuthen.permsVerifAuthention(':permission:role:add')">新增角色</el-button>
		
		<el-dialog :visible.sync="showAdd" title="新增角色" @close="showAdd = false" :append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'角色名称'" prop="roleName">
					<el-input v-model="addData.roleName" placeholder="请输入角色名称" clearable />
				</el-form-item>
				<el-form-item :label="'角色备注'" prop="roleRemark">
					<el-input v-model="addData.roleRemark" placeholder="请输入角色备注" clearable />
				</el-form-item>
				<el-form-item :label="'数据权限'" prop="dataScope">
					<el-select v-model="addData.dataScope" class="filter-item" placeholder="请选择数据权限"
						clearable style="width: 100%">
						<el-option v-for="item in dataScopeList" :key="item.id" :label="item.title":value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item :label="'功能权限'">
					<el-input v-model="filterTextAdd" placeholder="输入关键字进行过滤" />
					<div style="margin: 20px 0;"></div>
					<el-tree ref="addTree" :data="treeData" :props="defaultProps" :filter-node-method="filterNode"
						show-checkbox node-key="id" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onaddData('addData')" :loading="Loading">确定</el-button>
					<el-button @click="showAdd = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		addRole,
		findMenuByRoleId,
		updateRole,
		deleteRole
	} from '@/api/permission/role.js'
	export default {
		data(){
			return {
				showAdd: false,
				addData: {
					roleName: '',
					roleRemark: '',
					menuIdArray: '',
					dataScope:''
				},
				rules: {
					roleName: [{
						required: true,
						message: '请输入角色名称',
						trigger: 'blur'
					}],
					roleRemark: [{
						required: true,
						message: '请输入角色备注',
						trigger: 'blur'
					}],
					dataScope: [{
						required: true,
						message: '请选择数据权限',
						trigger: 'blur'
					}],
					menuIdArray: [{
						required: true,
						message: '请选择功能权限',
						trigger: 'change'
					}],
				},
				defaultProps: {
					children: 'children',
					label: 'title'
				},
				filterTextAdd: '',
				treeData: [],
				ger_role_id:[],
				Loading:false,
				dataScopeList:[
					{
						id:1,
						title:'全部数据权限'
					},
					{
						id:2,
						title:'本人及下级数据权限'
					},
					{
						id:3,
						title:'仅本人数据权限'
					},
				]
			}
		},
		watch: {
			filterTextAdd(val) {
				this.$refs.addTree.filter(val);
			},
		},
		methods:{
			onShowAdd(){
				this.getFindMenuByRoleId(1)
				this.showAdd=true
			},
			onaddData(formName) {
				const keys = [
					...this.$refs.addTree.getCheckedKeys(),
					...this.$refs.addTree.getHalfCheckedKeys()
				];
				if (keys.length == 0) {
					this.$message.error('请选择功能权限')
					return false
				}
				const iDStr = keys.join(',');
				console.log(keys, iDStr)
				this.addData.menuIdArray = iDStr
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						this.Loading=true
						addRole(this.addData).then(res => {
							this.Loading=false
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
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			getFindMenuByRoleId(id) {
				let data = {
					roleId: id
				}
				findMenuByRoleId(data).then(res => {
					if (res.code == 200) {
						let menuList = res.data
						let menuList2 = menuList
						this.treeData = menuList
						console.log(this.treeData)
					}
				})
			},
			setCheckedKeys() {
				this.$refs.tree.setCheckedKeys(this.ger_role_id)
			},
			filterNode(value, data) {
				if (!value) return true
				return data.title.indexOf(value) !== -1
			},
		}
	}
</script>

<style>
</style>
