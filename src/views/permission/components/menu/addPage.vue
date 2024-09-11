<template>
	<div style="display: flex;">
		<div v-if="type == 'parent'">
			<el-button style="margin-right: 20px ;" type="primary" @click="addPMeun"
				v-if="btnAuthen.permsVerifAuthention(':permission:menu:add')">新增菜单</el-button>
		</div>
		<div v-if="type == 'childern'">
			<el-button type="primary" @click="addCMeun()" style="margin-left: 10px;" size="mini"
				v-if="btnAuthen.permsVerifAuthention(':permission:menu:addChild')">添加子菜单
			</el-button>
		</div>
		
		
		
		<el-dialog :visible.sync="showAdd" title="新增菜单" @close="showAdd = false" :append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'菜单名称'" prop="title">
					<el-input v-model="addData.title" placeholder="请输入菜单名称" clearable />
				</el-form-item>
				<el-form-item :label="'资源路径'" prop="href">
					<el-input v-model="addData.href" placeholder="请输入资源路径" clearable />
				</el-form-item>
				<el-form-item :label="'权限标识'" prop="perms">
					<el-input v-model="addData.perms" placeholder="请输入权限标识" clearable />
				</el-form-item>
				<el-form-item :label="'排序'" prop="sorting">
					<el-input v-model="addData.sorting" placeholder="请输入排序" clearable type="number" />
				</el-form-item>
				<el-form-item :label="'图标'" prop="icon">
					<el-select v-model="addData.icon" placeholder="请选择">
						<el-option v-for="(item,index) in cities" :key="index" :label="item" :value="item">
							<div style="text-align: center;">
								<i :class="item" style="font-size: 26px;"></i>
							</div>
						</el-option>
					</el-select>
		            <i :class="addData.icon" style="font-size: 26px;margin-left: 20px;"></i>
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
		getList,
		addMenu,
		updateMenu,
		deleteMenu,
	} from '@/api/permission/menu.js'
	export default {
		props:{
			type:{
				type:String,
				default:''
			},
			id:{
				type:Number,
				default:1
			}
		},
		data() {
			return {
              showAdd:false,
			  addData: {
			  	parentId: '',
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
			addPMeun() {
				console.log('父菜单')
				this.addData.parentId = 0
				this.showAdd = true
			},
			addCMeun() {
				console.log('子菜单',this.id)
				this.addData.parentId = this.id
				this.showAdd = true
			},
			onaddData(formName) {
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						addMenu(this.addData).then(res => {
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
		}
	}
</script>

<style>

</style>
