<template>
	<div style="display: inline-block;">
    <el-button type="primary"  style="margin-left: 10px;" @click="onShowEdit()" size="mini" 
      v-if="btnAuthen.permsVerifAuthention(':card:cardList:edit')">
      编辑
    </el-button>
		<!-- 编辑充电卡 -->
		<el-dialog :visible.sync="showEditAD" title="编辑充电卡" @close="showEditAD = false" :append-to-body="true">
			<el-form ref="editAdData" :model="editAdData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'卡号'" prop="cardNo">
					<el-input v-model="editAdData.cardNo" placeholder="请输入卡号" clearable disabled />
				</el-form-item>
				<el-form-item :label="'用户名'" prop="userName">
					<el-input v-model="editAdData.userName" placeholder="请输入用户名" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="oneditAdData('editAdData')">确定</el-button>
					<el-button @click="showEditAD = false">取消</el-button>
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
		props: {
			row_data: {
				type: Object
			}
		},
		name: 'cardList1',
		data() {
			return {
				showEditAD: false,
				editAdData: {
          id: '',
					cardNo: '',
					perPayMoney: 1,
					userName: ''
				},
				showAddMoney: false,
				addMoney: {
					cardNo: '',
					realityPayMoney: '',
					giveMoney: ''
				},
			}
		},
		methods: {
			onShowEdit() {
				let item = this.row_data
        this.editAdData.id = item.id
				this.editAdData.cardNo = item.cardNo
				this.editAdData.userName = item.userName
				this.editAdData.perPayMoney = item.perPayMoney
				this.showEditAD = true
			},
			oneditAdData(formName) {
				console.log(this.editAdData)
				if (this.editAdData.cardNo == '' || this.editAdData.cardNo == null || this.editAdData.cardNo ==
					undefined) {
					this.$message.error("请输入卡号")
					return false
				}
				if (this.editAdData.userName == '' || this.editAdData.userName == null || this.editAdData.userName ==
					undefined) {
					this.$message.error("请输入用户名")
					return false
				}
				if (this.editAdData.perPayMoney == '' || this.editAdData.perPayMoney == null || this.editAdData
					.perPayMoney == undefined) {
					this.$message.error("请输入每次刷卡支付金额")
					return false
				}
				updateCard(this.editAdData).then(res => {
					if (res.code == 200) {
						this.showEditAD = false
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
