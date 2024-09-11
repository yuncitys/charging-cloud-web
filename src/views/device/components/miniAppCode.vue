<template>
	<div style="display: inline-block;">
		<el-dialog :visible.sync="showqrCode" @opened="qrCodeCreate" :before-close="qrCodeHandleClose"
			:append-to-body="true">
			<div>
				<div style="text-align: center;">{{titleStr}}</div>
				<div style="text-align: center;width: 150px;">
					<div id="qrCode0" ref="qrCode0"></div>
					<div class="portText">设备二维码</div>
					<div style="margin-top: 20px;">
						<el-button @click="print('trueBtn')" type="primary">打印二维码</el-button>
						<button v-print="'#qrCode0'" id="trueBtn" style="display: none">
							打印二维码
						</button>
					</div>
				</div>
				<div style="flex-wrap: wrap;display: flex;text-align: center;" >
					<div style="margin-right: 20px;width: 150px;margin-top: 10px;" v-for="(item,index) in portCount" :key="index">
						<div :id="`qrCode${index+1}`" ref="`qrCode${index+1}`"></div>
						<div class="portText">端口{{index+1}}</div>
						<div style="margin-top: 20px;">
							<el-button @click="print(`trueBtn${index+1}`)" type="primary">打印二维码</el-button>
							<button v-print="`#qrCode${index+1}`" :id="`trueBtn${index+1}`" style="display: none">
								打印二维码
							</button>
						</div>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import QRCode from 'qrcodejs2'
	export default {
		props: {
			
		},
		data() {
			return {
				codeWidth: 150,
				codeHeight: 150,
				showqrCode: false,
				titleStr: '',
				portCount:10
			}
		},
		mounted() {

		},
		methods: {
			//清除二维码
			qrCodeHandleClose() {
				this.showqrCode = false;
				this.qrCode = '';
				for (let i = 0; i < this.portCount+1; i++) {
					let str = 'qrCode' + i
					document.getElementById(str).innerHTML = '';
				}
			},
			//显示二维码
			showQrcode(deviceCode,portCount) {
				this.showqrCode = true
				this.codeUrl =deviceCode
				this.portCount=portCount || 10
				this.titleStr = "设备号:" + deviceCode
			},
			qrcode(url) {
				for (let i = 0; i < this.portCount+1; i++) {
					let str = 'qrCode' + i
					let baseUrl = this.Global.codeUrl
					let urls = ''
					if (i == 0) {
						urls = baseUrl + '?qrcode=' + url
					} else {
						urls = baseUrl + '?qrcode=' + url + '&port=' + i
					}
					this.qrCode = new QRCode(str, {
						text: urls,
						width: this.codeWidth,
						height: this.codeHeight
					})
				}
			},
			qrCodeCreate() {
				let url = this.codeUrl
				this.$nextTick(() => {
					this.qrcode(url);
				})
			},
			//打印
			print(str) {
				console.log(str)
				document.getElementById(str).click();
			},
		},
		created() {

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
