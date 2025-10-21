<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="showSonDeviceInfo()" size='mini'
			v-if="btnAuthen.permsVerifAuthention(':device:deviceList:agent')" >查看详情
		</el-button>
		<div v-else>
			该账号无权限
		</div>
		<!-- 代理商 -->
		<el-dialog :visible.sync="showDialog" title="代理商" @close="showDialog = false" :append-to-body="true">
			<el-table v-loading="listLoading" :key="tableKey" :data="list"
				element-loading-text="拼命加载中......"  fit highlight-current-row align="center">
				<el-table-column label="登录账号" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope"><span>{{scope.row.adminName}} </span></template>
				</el-table-column>
				<el-table-column label="姓名" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope"><span>{{scope.row.adminFullname}} </span></template>
				</el-table-column>
				<el-table-column label="手机号" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope"><span>{{scope.row.adminPhone}} </span></template>
				</el-table-column>
				<el-table-column label="角色" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope"><span>{{scope.row.role.roleName}} </span></template>
				</el-table-column>
				<el-table-column label="角色备注" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope"><span>{{scope.row.role.remark}} </span></template>
				</el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script>
	import {
		findParentByCurAdmin
	} from '@/api/device/deviceList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		components: {

		},
		props: {
			row_data: {
				type: Object
			}
		},
		name: 'deviceList1',
		data() {
			return {
				list: [],
				tableKey: 0,
				listLoading: false,
				showDialog: false,
			}
		},
		filters: {
			//格式化时间
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
			showSonDeviceInfo() {
				this.showDialog = true
				this.listLoading=true
				console.log(this.row_data)
				let data={
					adminId:this.row_data.adminId
				}
				findParentByCurAdmin(data).then(res=>{
					this.listLoading=false
					if(res.code == 200){
						this.list=res.data || []
					}
				})
			},
		},
		created() {
            this.isPc=!this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">
	.portText {
		font-weight: bold;
		color: #000000;
		margin-top: 20px;
	}
</style>
