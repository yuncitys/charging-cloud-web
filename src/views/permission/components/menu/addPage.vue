<template>
	<div style="display: flex;">
		<div v-if="type == 'parent'">
			<el-button style="margin-right: 20px ;" type="primary" @click="addPMeun"
				v-if="btnAuthen.permsVerifAuthention(':permission:menu:add')">新增菜单</el-button>
		</div>
		<div v-if="type == 'childern' && canAddChild">
			<el-button type="primary" @click="addCMeun()" style="margin-left: 10px;" size="mini"
				v-if="btnAuthen.permsVerifAuthention(':permission:menu:addChild') || btnAuthen.permsVerifAuthention(':permission:menu:add')">
				{{ childButtonLabel }}
			</el-button>
		</div>

		<el-dialog :visible.sync="showAdd" :title="dialogTitle" @close="onDialogClose" :append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item label="菜单类型" prop="menuType">
					<el-radio-group v-model="addData.menuType" @change="onMenuTypeChange">
						<el-radio v-for="opt in typeOptions" :key="'mt-' + opt.value" :label="opt.value">{{ opt.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="菜单名称" prop="title">
					<el-input v-model="addData.title" placeholder="请输入菜单名称" clearable />
				</el-form-item>
				<el-form-item v-if="showHref" label="资源路径" prop="href">
					<el-input v-model="addData.href" :placeholder="hrefPlaceholder" clearable />
				</el-form-item>
				<el-form-item v-if="showPerms" label="权限标识" prop="perms">
					<el-input v-model="addData.perms" :placeholder="permsPlaceholder" clearable />
				</el-form-item>
				<el-form-item label="排序" prop="sorting">
					<el-input v-model="addData.sorting" placeholder="请输入排序" clearable type="number" />
				</el-form-item>
				<el-form-item v-if="showIcon" label="图标" prop="icon">
					<el-select v-model="addData.icon" placeholder="请选择" clearable>
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
	import { addMenu } from '@/api/permission/menu.js'
	import {
		MENU_TYPE,
		MENU_TYPE_OPTIONS,
		addChildButtonLabel,
		childMenuTypeOptions,
		defaultChildMenuType,
		menuTypeLabel
	} from '@/views/permission/constants/menuType.js'

	export default {
		props: {
			type: {
				type: String,
				default: ''
			},
			id: {
				type: Number,
				default: 1
			},
			parentMenuType: {
				type: [Number, String],
				default: null
			}
		},
		data() {
			return {
				showAdd: false,
				addData: {
					parentId: '',
					menuType: MENU_TYPE.MENU,
					title: '',
					href: '',
					perms: '',
					sorting: '',
					icon: ''
				},
				cities: [
					'el-icon-platform-eleme',
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
					'el-icon-s-opportunity',
					''
				]
			}
		},
		computed: {
			canAddChild() {
				return childMenuTypeOptions(this.parentMenuType).length > 0
			},
			childButtonLabel() {
				return addChildButtonLabel(this.parentMenuType)
			},
			typeOptions() {
				if (this.type === 'parent') {
					return MENU_TYPE_OPTIONS.filter(item => item.value !== MENU_TYPE.BUTTON)
				}
				return childMenuTypeOptions(this.parentMenuType)
			},
			dialogTitle() {
				return '新增' + menuTypeLabel(this.addData.menuType)
			},
			isDirectory() {
				return Number(this.addData.menuType) === MENU_TYPE.DIRECTORY
			},
			isMenu() {
				return Number(this.addData.menuType) === MENU_TYPE.MENU
			},
			isButton() {
				return Number(this.addData.menuType) === MENU_TYPE.BUTTON
			},
			showHref() {
				return this.isMenu || this.isButton
			},
			showPerms() {
				return this.isMenu || this.isButton || this.isDirectory
			},
			showIcon() {
				return !this.isButton
			},
			hrefPlaceholder() {
				return this.isButton ? '可选，API 路径如 /sys/menu/addMenu' : '请输入前端路由路径，如 /permission/menu'
			},
			permsPlaceholder() {
				return this.isButton ? '如 :permission:menu:add' : '请输入权限标识'
			},
			rules() {
				const rules = {
					menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
					title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
					sorting: [{ required: true, message: '请输入排序', trigger: 'blur' }]
				}
				if (this.isMenu) {
					rules.href = [{ required: true, message: '页面菜单必须填写资源路径', trigger: 'blur' }]
					rules.perms = [{ required: true, message: '页面菜单必须填写权限标识', trigger: 'blur' }]
				} else if (this.isButton) {
					rules.perms = [{ required: true, message: '按钮必须填写权限标识', trigger: 'blur' }]
				}
				return rules
			}
		},
		methods: {
			resetAddData(parentId, menuType) {
				this.addData = {
					parentId,
					menuType,
					title: '',
					href: '',
					perms: '',
					sorting: '',
					icon: ''
				}
			},
			addPMeun() {
				this.resetAddData(0, MENU_TYPE.DIRECTORY)
				this.showAdd = true
			},
			addCMeun() {
				const menuType = defaultChildMenuType(this.parentMenuType)
				this.resetAddData(this.id, menuType)
				this.showAdd = true
			},
			onMenuTypeChange() {
				if (this.isButton) {
					this.addData.icon = ''
				}
				if (this.isDirectory) {
					this.addData.href = ''
				}
				this.$nextTick(() => {
					if (this.$refs.addData) {
						this.$refs.addData.clearValidate()
					}
				})
			},
			onDialogClose() {
				this.showAdd = false
				if (this.$refs.addData) {
					this.$refs.addData.clearValidate()
				}
			},
			onaddData(formName) {
				this.$refs[formName].validate(valid => {
					if (!valid) {
						return false
					}
					const payload = Object.assign({}, this.addData)
					if (this.isDirectory) {
						payload.href = payload.href || ''
					}
					if (this.isButton) {
						payload.icon = ''
					}
					addMenu(payload).then(res => {
						if (res.code == 200) {
							this.showAdd = false
							this.$message.success(res.msg)
							this.$emit('getLists')
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			}
		}
	}
</script>

<style>
</style>
