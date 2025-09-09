<template>
	<div style="display: inline-block;">
		<el-button type="primary"  style="margin-left: 10px;"
			@click="showDidlaoEditData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':permission:role:edit')">编辑
		</el-button>
		<el-dialog :visible.sync="showEdit" title="编辑角色" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'角色名称'" prop="roleName">
					<el-input v-model="editData.roleName" placeholder="请输入角色名称" clearable />
				</el-form-item>
				<el-form-item :label="'角色备注'" prop="roleRemark">
					<el-input v-model="editData.roleRemark" placeholder="请输入角色备注" clearable />
				</el-form-item>
				<el-form-item :label="'数据权限'" prop="dataScope">
					<el-select v-model="editData.dataScope" class="filter-item" placeholder="请选择数据权限"
						clearable style="width: 100%">
						<el-option v-for="item in dataScopeList" :key="item.id" :label="item.title"
							:value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item :label="'功能权限'">
					<el-input v-model="filterTextEdit" placeholder="输入关键字进行过滤" />
					<div style="margin: 20px 0;"></div>
					<el-tree ref="editTree" :data="treeData" :props="defaultProps" :filter-node-method="filterNode"
						show-checkbox node-key="id" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onEditData('editData')" :loading="Loading">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
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
		props:{
			row_data:{
				type:Object,
				default:()=>{
					return {}
				}
			}
		},
		data(){
			return {
				showEdit: false,
				editData: {
					myRoleId: '',
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
				filterTextEdit: '',
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
			filterTextEdit(val) {
				this.$refs.editTree.filter(val);
			}
		},
		methods:{
			showDidlaoEditData() {
				let item=this.row_data
				this.ger_role_id=[]
				console.log(item)
				this.editData.myRoleId = item.id
				this.editData.roleName = item.roleName
				this.editData.roleRemark = item.remark
				this.editData.menuIdArray = item.menuIdArray
				this.editData.dataScope = item.dataScope ? item.dataScope : ''
				let data = {
					roleId: item.id
				}
				findMenuByRoleId(data).then(res => {
					if (res.code == 200) {
						let menuList = res.data
						this.treeData = menuList
						this.showEdit = true
						if (menuList.length != '') {
							this.test_parse(menuList)
						}
						this.$nextTick(() => {
							this.$refs.editTree.setCheckedKeys(this.ger_role_id)
						})
					}else {
            			this.$message.error(res.msg)
					}
				})
			},
			test_parse(source) {
				for (var key in source) {
					if(source[key].checked){
						this.ger_role_id.push(source[key].id)
					}
					if (source[key].children) {
						this.test_parse(source[key].children)
					}
				}
			},
			onEditData(formName) {
				console.log(this.editData)
				const keys = [
					...this.$refs.editTree.getCheckedKeys(),
					// ...this.$refs.editTree.getHalfCheckedKeys()
				];
				if (keys.length == 0) {
					this.$message.error('请选择功能权限')
					return false
				}
				const iDStr = keys.join(',');
				console.log(keys, iDStr)
				this.editData.menuIdArray = iDStr
				console.log(this.editData)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						this.Loading=true
						updateRole(this.editData).then(res => {
							this.Loading=false
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
			setCheckedKeys() {
				this.$refs.tree.setCheckedKeys(this.ger_role_id)
			},
			filterNode(value, data) {
				if (!value) return true
				return data.title.indexOf(value) !== -1
			},
		},
	}
</script>

<style>
</style>
