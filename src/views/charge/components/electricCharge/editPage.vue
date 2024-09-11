<template>
	<div style="display:inline-block">
		<el-button type="primary" style="margin-left: 10px;" size="mini" @click="showDidlaoEditData()"
			v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:electricCharge:edit')">编辑
		</el-button>
		<el-dialog :visible.sync="showEdit" title="编辑方案" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px"
				style="margin-left:50px;">
				<el-form-item :label="'方案名称'" prop="feeName">
					<el-input v-model="editData.feeName" placeholder="请输入方案名称" clearable style="width: 60%;"
						class="feeName" />
				</el-form-item>
				<el-form-item :label="'收费说明'" prop="remark">
					<el-input v-model="editData.remark" placeholder="请输入收费金额" clearable style="width: 60%;"
						type="textarea" :rows="2" />
				</el-form-item>
				<el-form-item :label="'计时类型'" prop="feeName">
					<div id="">
						<el-radio-group v-model="editData.realTimeCharging">
							<el-radio v-for="(item,index) in payType" :key="index" :label="index">{{item.title}}
							</el-radio>
						</el-radio-group>
					</div>
				</el-form-item>
				<div :label="'详情'">
					<div>
						<el-button type="primary" @click="addForm('edit')">添加详情</el-button>
					</div>
					<div style="margin: 30px 0;">
						<div v-for="(item, index) in formArr" :key="index" style="margin: 5px 0;">
							<div class="flex" style="align-items: center;">
								<div class="flex" style="align-items: center;">
									<div style="margin-right: 20px;">电量</div>
									<div>
										<el-select v-model="editData.duration[index]"
											style="min-width: 100px;margin-right: 20px ;" class="filter-item"
											placeholder="请选择电量" clearable @keyup.enter.native="handleFilter">
											<el-option v-for="item in tags" :key="item.id" :label="item.title"
												:value="item.id" />
										</el-select>
									</div>
								</div>
								<div class="flex" style="align-items: center;">
									<div style="margin-right: 20px;">收费金额</div>
									<div>
										<el-input v-model="editData.money[index]" placeholder="请输入收费金额" clearable
											type="number" style="min-width: 100px;" />
									</div>
								</div>
								<div style="margin-left: 20px;">
									<el-button type="danger" @click="delForm(index,'edit')">删除</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>

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
		batchDevicePrices,
		deleteDevicePrice,
		updateDevicePrice
	} from '@/api/netWorkDot/charge/chargeList.js'
	export default {
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				showEdit: false,
				editData: {
					tdpId: '',
					feeName: '',
					status: '1',
					duration: [],
					money: [],
					realTimeCharging: 0,
					remark: '',
					ruleId: 1
				},
				formArr: [""],
				tags: [],
				payType: [{
					id: 1,
					realTimeCharging: 0,
					title: "按1分钟收费"
				}, {
					id: 2,
					realTimeCharging: 1,
					title: "按30分钟收费"
				}],
			}
		},
		methods: {
			addForm(type) {
				if (type == 'edit') {
					this.formArr.push("")
					this.editData.duration.push(1)
					this.editData.money.push(0)
				} else {
					this.formArr.push("")
					this.addData.duration.push(1)
					this.addData.money.push(0)
				}
			},
			delForm(index, type) {
				if (type == 'edit') {
					this.formArr.splice(index, 1)
					this.editData.duration.splice(index, 1)
					this.editData.money.splice(index, 1)
				} else {
					this.formArr.splice(index, 1)
					this.addData.duration.splice(index, 1)
					this.addData.money.splice(index, 1)
				}
			},
			showDidlaoEditData() {
				let item = this.row_data
				console.log(item)
				this.editData.tdpId = item.id
				this.editData.feeName = item.feeName
				this.editData.realTimeCharging = item.realTimeCharging
				this.editData.remark = item.remark || ''
				let ids = []
				let duration = []
				let money = []
				if (item.priceContents != 0) {
					item.priceContents.forEach((val, index) => {
						ids.push(val.id)
						duration.push(parseInt(val.duration))
						money.push(val.money)
					})
				}
				this.formArr = item.priceContents
				this.editData.duration = duration
				this.editData.money = money
				this.showEdit = true
			},
			onEditData(formName) {
				if (this.editData.feeName == '') {
					this.$message.error('请输入方案名称')
					return false
				}
				if (this.editData.duration == '') {
					this.$message.error('请至少添加一种方案')
					return false
				}
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						updateDevicePrice(this.editData).then(res => {
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
		},
		created() {
			let tags = []
			for (let i = 1; i <= 48; i++) {
				let obj = {
					id: i,
					title: i + '度'
				}
				tags.push(obj)
			}
			this.tags = tags
		},
		mounted() {

		},
	}
</script>

<style lang="scss">
	.flex {
		display: flex;
	}
</style>