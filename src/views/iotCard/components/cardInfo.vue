<template>
	<div style="display: inline-block;"	>
		<el-button type="primary" @click="onShowInfo" size='mini' >
      详情
		</el-button>
		<el-dialog :visible.sync="showInfo" title="物联卡详情" @close="showInfo = false" :append-to-body="true">
			<div style="display: flex;">
				<el-row>
					<el-col :xs="24"  :lg="12">
						<div>
							<el-form ref="cardInfo" :model="cardInfo" label-position="left" label-width="100px"
								style="width: 300px; margin-left:50px;">
								<el-form-item :label="'卡状态：'" prop="cardStatus">
								<el-tag v-if="cardInfo.cardStatus == 0">未开卡</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 2">沉默期</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 4">已停机</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 5">已断网</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 8">待激活</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 9">正常使用</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 20">期满,关停</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 21">已回收状态</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 80">未知</el-tag>
								<el-tag v-if="cardInfo.cardStatus == 99">已删除</el-tag>
								</el-form-item>
								<el-form-item :label="'卡 ICCID 号'" prop="iccid">
									<el-input v-model="cardInfo.iccid" disabled=""></el-input>
								</el-form-item>
								<el-form-item :label="'卡 IMSI 号'" prop="imsi">
									<el-input v-model="cardInfo.imsi" disabled="">
									</el-input>
								</el-form-item>
								<el-form-item :label="'卡 msisdn'" prop="msisdn">
									<el-input v-model="cardInfo.msisdn" disabled="">
									</el-input>
								</el-form-item>
								<el-form-item :label="'套餐可用流量'" prop="packageCanUsage">
									<el-input v-model="cardInfo.packageCanUsage" disabled="">
										<template slot="append">M</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'套餐已用流量'" prop="packageHasUsage">
									<el-input v-model="cardInfo.packageHasUsage" disabled="">
										<template slot="append">M</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'剩余周期'" prop="leftPeriod">
									<el-input v-model="cardInfo.leftPeriod" disabled="">
									</el-input>
								</el-form-item>
							</el-form>
						</div>
					</el-col>
					<el-col :xs="24"  :lg="12">
						<div class="left10">
							<el-form ref="cardInfo" :model="cardInfo" label-position="left" label-width="100px"
								style="width: 300px; margin-left:50px;">
							<el-form-item :label="'计费时间'" prop="cardFeeTime">
								<el-input v-model="cardInfo.cardFeeTime" disabled="">
								</el-input>
							</el-form-item>
							<el-form-item :label="'到期时间'" prop="cardEndTime">
								<el-input v-model="cardInfo.cardEndTime" disabled="">
								</el-input>
							</el-form-item>
							<el-form-item :label="'本期开始时间'" prop="periodStartTime">
								<el-input v-model="cardInfo.periodStartTime" disabled="">
								</el-input>
							</el-form-item>
							<el-form-item :label="'本期结束时间'" prop="periodEndTime">
								<el-input v-model="cardInfo.periodEndTime" disabled="">
								</el-input>
							</el-form-item>
							</el-form>
						</div>
					</el-col>
				</el-row>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		info
	} from '@/api/iotCard/iotCard.js'
	export default {
		props: {
			row_data: {
				type: Object,
				default: function() {
					return null
				}
			}
		},
		data() {
			return {
				showInfo: false,
				cardInfo: {},
			}
		},
		mounted() {

		},
		methods: {
			onShowInfo(){
        		this.getInfo()
			},
			//获取卡详情
			getInfo(){
				const identify = this.row_data.msisdn
				if (identify === '' || identify === undefined){
					this.$message.error('msisdn不能为空');
				}
				let data = {
					identify: identify
				}
				info(data).then(res => {
					if (res.code == 200) {
						let cardInfo= res.data
						this.cardInfo = cardInfo
						this.showInfo = true
					} else {
					this.showInfo = false
						this.$message.error(res.msg)
					}
				})
			}
		},
		created() {

		},
	}
</script>
