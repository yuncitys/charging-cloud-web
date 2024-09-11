<template>
	<div style="display: flex;">
		<el-button type="primary"  style="margin-left: 10px;"
			@click="showDidlaoEditData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':permission:menu:edit')">编辑
		</el-button>
		
		<el-dialog :visible.sync="showEdit" title="编辑菜单" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'菜单名称'" prop="title">
					<el-input v-model="editData.title" placeholder="请输入菜单名称" clearable />
				</el-form-item>
				<el-form-item :label="'资源路径'" prop="href">
					<el-input v-model="editData.href" placeholder="请输入资源路径" clearable />
				</el-form-item>
				<el-form-item :label="'权限标识'" prop="perms">
					<el-input v-model="editData.perms" placeholder="请输入权限标识" clearable />
				</el-form-item>
				<el-form-item :label="'排序'" prop="sorting">
					<el-input v-model="editData.sorting" placeholder="请输入排序" clearable type="number" />
				</el-form-item>
				<el-form-item :label="'图标'" prop="icon">
					<el-select v-model="editData.icon" placeholder="请选择">
						<el-option v-for="(item,index) in cities" :key="index" :label="item" :value="item">
							<div style="text-align: center;">
								<i :class="item" style="font-size: 26px;"></i>
							</div>
						</el-option>
					</el-select>
					<i :class="editData.icon" style="font-size: 26px;margin-left: 20px;"></i>
				</el-form-item>
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
		addMenu,
		updateMenu,
		deleteMenu,
	} from '@/api/permission/menu.js'
	export default {
		props:{
			row_data:{
				type:Object,
				default:()=>{
					return {}
				}
			}
		},
		data() {
			return {
              showEdit: false,
              editData: {
              	id: '',
              	title: '',
              	href: '',
              	perms: '',
              	sorting: '',
              	icon: ''
              },
			  cities: ['el-icon-platform-eleme',
			  	'el-icon-s-custom',
			  	'el-icon-user-solid',
			  	'el-icon-user',
			  	'el-icon-s-goods',
			  	'el-icon-goods',
			  	'el-icon-sold-out',
			  	'el-icon-full-screen',
			  	'el-icon-postcard',
			  	'el-icon-connection',
			  	'el-icon-notebook-1',
			  	'el-icon-notebook-2',
			  	'el-icon-star-on',
			  	'el-icon-star-off',
			  	'el-icon-s-help',
			  	'el-icon-help',
			  	'el-icon-reading',
			  	'el-icon-pie-chart',
			  	'el-icon-data-line',
			  	'el-icon-s-finance',
			  	'el-icon-wallet',
			  	'el-icon-coin',
			  	'el-icon-document',
			  	'el-icon-shopping-cart-full',
			  	'el-icon-shopping-cart-1',
			  	'el-icon-sell',
			  	'el-icon-collection',
			  	'el-icon-shopping-cart-2',
			  	'el-icon-copy-document',
			  	'el-icon-set-up',
			  	'el-icon-s-fold',
			  	'el-icon-s-operation',
			  	'el-icon-s-management',
			  	'el-icon-eleme',
			  	'el-icon-s-tools',
			  	'el-icon-setting',
			  	'el-icon-s-home',
			  	'el-icon-s-data',
			  	'el-icon-s-grid',
			  	'el-icon-menu',
			  	'el-icon-date',
			  	'el-icon-edit',
			  	'el-icon-edit-outline',
			  	'el-icon-s-data',
			  	'el-icon-s-opportunity',
			  	''
			  ],
			  rules: {
			  	title: [{
			  		required: true,
			  		message: '请输入菜单名称',
			  		trigger: 'blur'
			  	}],
			  	// href: [{
			  	// 	required: true,
			  	// 	message: '请输入资源路径',
			  	// 	trigger: 'blur'
			  	// }],
			  	perms: [{
			  		required: true,
			  		message: '请输入权限标识',
			  		trigger: 'blur'
			  	}, ],
			  	sorting: [{
			  		required: true,
			  		message: '请输入排序',
			  		trigger: 'blur'
			  	}, ],
			  },
			}
		},
		methods:{
			showDidlaoEditData() {
				let item=this.row_data
				console.log(item)
				this.editData.title = item.title
				this.editData.href = item.href
				this.editData.perms = item.perms
				this.editData.sorting = item.sorting
				this.editData.id = item.id
				this.editData.icon = item.icon
				this.showEdit = true
			},
			onEditData(formName) {
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						updateMenu(this.editData).then(res => {
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
		}
	}
</script>

<style>

</style>
