<template>
	<div style="display: inline-block;">
		<el-dialog :visible.sync="showqrCode" @opened="qrCodeCreate" :before-close="qrCodeHandleClose"
			:append-to-body="true">
			<div v-if="showqrCode">
				<div style="text-align: center;font-weight: bold;margin-bottom: 20px;font-size: 30px;">小程序</div>
				<div style="text-align: center;">{{titleStr}}</div>
				<div style="text-align: center;width: 150px;">
					<div style="width: 150px;height: 150px;">
						<!-- :logoSrc="logoSrc"  -->
						<vue-qr :size="150" :text="codeUrl" :margin="0" :logoScale="0.3" :callback="codeCallback"
							:correctLevel="3" id="qrCode0" ref="qrCode0" qid="0" v-if="codeUrl" :title="codeUrl">
						</vue-qr>
					</div>
					<div class="portText">设备二维码</div>
					<div style="justify-content: space-between;display: flex;margin-top: 20px;">
						<div style="margin-top: 0px;">
							<el-button @click="print('trueBtn')" type="primary">打印</el-button>
							<button v-print="'#qrCode0'" id="trueBtn" style="display: none">
								打印
							</button>
						</div>
						<div style="margin-top: 0px;">
							<el-button @click="loadImg(0)" type="primary">下载</el-button>
						</div>
					</div>
				</div>
				<div style="flex-wrap: wrap;display: flex;text-align: center;">
					<div style="margin-right: 20px;width: 150px;margin-top: 10px;" v-for="(item,index) in urls"
						:key="index">
						<div style="width: 150px;height: 150px;">
							<!-- :logoSrc="logoSrc" -->
							<vue-qr :size="150" :text="item" :margin="0" :logoScale="0.3" :callback="codeCallback"
								:correctLevel="3" :id="`qrCode${index+1}`" ref="`qrCode${index+1}`" :qid="`${index+1}`"
								v-if="item" :title="item"></vue-qr>
						</div>
						<div class="portText">端口{{index+1}}</div>
						<div style="justify-content: space-between;display: flex;margin-top: 20px;">
							<div style="margin-top: 0px;">
								<el-button @click="print(`trueBtn${index+1}`)" type="primary">打印</el-button>
								<button v-print="`#qrCode${index+1}`" :id="`trueBtn${index+1}`" style="display: none">
									打印
								</button>
							</div>
							<div style="margin-top: 0px;">
								<el-button @click="loadImg(index+1)" type="primary">下载</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import QRCode from 'qrcodejs2'
	import vueQr from 'vue-qr'
	export default {
		components: {
			vueQr
		},
		props: {

		},
		data() {
			return {
				codeWidth: 150,
				codeHeight: 150,
				showqrCode: false,
				titleStr: '',
				portCount: 10,

				urls: [],
				codeUrl: '',
				// logoSrc:logoSrc,
				base64Arr: []
			}
		},
		mounted() {

		},
		methods: {
			codeCallback(dataUrl, qid) {
				// console.log(dataUrl, qid)
				this.base64Arr[qid] = dataUrl
			},
			loadImg(index) {
				let deviceCode = this.deviceCode
				let imgName = `${deviceCode}.png`
				let base64Url = this.base64Arr[index]
				if (parseInt(index) == 0) {
					imgName = `小程序${deviceCode}.png`
				} else {
					imgName = `小程序${deviceCode}端口${index}.png`
				}
				this.loadBase64Img(base64Url, imgName)
			},
			loadBase64Img(url, imgName) {
				let canvas = document.createElement('canvas')
				let ctx = canvas.getContext('2d')
				let img = new Image()
				img.crossOrigin = 'Anonymous' //允许跨域
				img.src = url
				img.onload = () => {
					canvas.height = 150
					canvas.width = 150
					ctx.drawImage(img, 0, 0, 150, 150)
					let dataURL = canvas.toDataURL('image/png')
					canvas = null
					let elink = document.createElement('a')
					elink.href = dataURL
					elink.download = imgName
					elink.click()
				}
			},
			//关闭弹窗回调
			qrCodeHandleClose() {
				this.showqrCode = false
				this.urls = []
				this.codeUrl = ''
			},
			//打开弹窗回调
			qrCodeCreate() {

			},
			//显示二维码
			showQrcode(deviceCode, portCount, networkDotId, domainName, ruleId) {
				console.log(portCount)
				this.showqrCode = true
				this.codeUrl = deviceCode
				this.networkDotId = networkDotId || ''
				this.portCount = portCount || 10
				this.domainName = domainName || ''
				this.ruleId = ruleId
				this.titleStr = "设备号:" + deviceCode
				this.deviceCode = deviceCode
				this.$nextTick(() => {
					this.getCodeUrl()
				})
			},
			getCodeUrl(url) {
				for (let i = 0; i < this.portCount + 1; i++) {
					let str = 'qrCode' + i
					let domainName = this.domainName
					// domainName = this.getFormat(domainName)
					// let ruleId = this.ruleId
					// let baseUrl = domainName + `weixin${ruleId}/miniprogram`
					let baseUrl = domainName
					let url = ''
					if (i == 0) {
						url = baseUrl + '?qrcode=' + this.deviceCode + '&networkDotId=' + this
							.networkDotId
						this.codeUrl = url
					} else {
						url = baseUrl + '?qrcode=' + this.deviceCode + '&port=' + i +
							'&networkDotId=' + this.networkDotId
						this.urls.push(url)
					}
				}
			},
			getFormat(str) {
				let url = ''
				let lastStr = str.substr(-1)
				if (lastStr !== '/') {
					url = str + '/'
				} else {
					url = str
				}
				return url
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
