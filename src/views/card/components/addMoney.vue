<template>
	<div style="display: inline-block;">
		<el-button type="primary" style="margin-left: 10px;" @click="onshowAddMoney()"
			v-if="btnAuthen.permsVerifAuthention(':card:cardList:addMoney')" size="mini">充值
		</el-button>
		<!-- 充值 -->
		<el-dialog :visible.sync="showAddMoney" title="充值" @close="showAddMoney = false" :append-to-body="true">
			<el-form ref="addMoney" :model="addMoney" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :append-to-body="true">
				<el-form-item :label="'卡号'" prop="cardNo">
					<el-input v-model="addMoney.cardNo" disabled />
				</el-form-item>
				<el-form-item :label="'充值金额'" prop="realityPayMoney">
					<el-input v-model="addMoney.realityPayMoney" placeholder="请输入充值金额" clearable type="number" />
				</el-form-item>
				<el-form-item :label="'赠送金额'" prop="giveMoney">
					<el-input v-model="addMoney.giveMoney" placeholder="请输入赠送金额" clearable type="number" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onupdateElectricity('addMoney')">确定</el-button>
					<el-button @click="showAddMoney = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		deleteCard,
		updateElectricity,
		addCard,
		lossCard,
		uploadExcel,
		updateCard,
	} from '@/api/card/cardList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'cardList1',
		props: {
			row_data: {
				type: Object
			}
		},
		components: {

		},
		data() {
			return {
				showAddMoney: false,
				addMoney: {
					cardNo: '',
					realityPayMoney: '',
					giveMoney: ''
				},
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
		methods: {
			onshowAddMoney() {
				let item = this.row_data
				this.addMoney.cardNo = item.cardNo
				this.showAddMoney = true
			},
			onupdateElectricity(formName) {
				if (this.addMoney.realityPayMoney == '' || this.addMoney.realityPayMoney == null || this.addMoney
					.realityPayMoney == undefined) {
					this.$message.error("请输入充值金额")
					return false
				}
				if (this.addMoney.giveMoney == '' || this.addMoney.giveMoney == null || this.addMoney.giveMoney ==
					undefined) {
					this.$message.error("请输入赠送金额")
					return false
				}
				updateElectricity(this.addMoney).then(res => {
					if (res.code == 200) {
						this.showAddMoney = false
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
		},
		created() {

		},
	}
</script>

<style scoped="scoped">
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
</style>
