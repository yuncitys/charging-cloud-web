<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="showAddAD = true"
			v-if="btnAuthen.permsVerifAuthention(':card:cardList:oneAdd')">
      新增充电卡
    </el-button>
		<!-- 新增充电卡 -->
		<el-dialog :visible.sync="showAddAD" title="新增充电卡" @close="showAddAD = false">
			<el-form ref="addAdData" :model="addAdData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :append-to-body="true">
				<el-form-item :label="'卡号'" prop="cardNo">
					<el-input v-model="addAdData.cardNo" placeholder="请输入卡号" clearable />
				</el-form-item>
				<el-form-item :label="'用户名'" prop="userName">
					<el-input v-model="addAdData.userName" placeholder="请输入用户名" clearable />
				</el-form-item>
				<!-- <el-form-item :label="'刷卡支付金额'" prop="perPayMoney">
					<el-input v-model="addAdData.perPayMoney" placeholder="请输入每次刷卡支付金额" clearable type="number"
						disabled />
				</el-form-item> -->
				<el-form-item>
					<el-button type="primary" @click="onaddAdData('addAdData')">确定</el-button>
					<el-button @click="showAddAD = false">取消</el-button>
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
		data() {
			return {
				showAddAD: false,
				addAdData: {
					cardNo: '',
					perPayMoney: 1,
					userName: ''
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
			onaddAdData(formName) {
				console.log(this.addAdData)
				if (this.addAdData.cardNo == '' || this.addAdData.cardNo == null || this.addAdData.cardNo == undefined) {
					this.$message.error("请输入卡号")
					return false
				}
				if (this.addAdData.userName == '' || this.addAdData.userName == null || this.addAdData.userName ==
					undefined) {
					this.$message.error("请输入用户名")
					return false
				}
				if (this.addAdData.perPayMoney == '' || this.addAdData.perPayMoney == null || this.addAdData.perPayMoney ==
					undefined) {
					this.$message.error("请输入每次刷卡支付金额")
					return false
				}
				addCard(this.addAdData).then(res => {
					if (res.code == 200) {
						this.showAddAD = false
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
