<template>
	<div style="display: inline-block;">
		<el-dialog :visible.sync="showqrCode" @opened="qrCodeCreate" :before-close="qrCodeHandleClose"
			:append-to-body="true" width="30%">
			<div v-if="showqrCode">
				<div style="text-align: center;font-weight: bold;margin-bottom: 20px;font-size: 30px;">
          			{{titleStr}}
				</div>
				<div style="text-align: center;width: 150px;margin: 0 auto;">
					<div style="width: 150px;height: 150px;">
						<!-- :logoSrc="logoSrc"  -->
						<vue-qr :size="150" :text="codeUrl" :margin="0" :logoScale="0.3" :callback="codeCallback"
							:correctLevel="3" id="qrCode0" ref="qrCode0" qid="0" v-if="codeUrl" :title="codeUrl">
						</vue-qr>
					</div>
					<div class="portText">插座二维码</div>
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

				codeUrl: '',
				// logoSrc:logoSrc,
				base64Arr: []
			}
		},
		mounted() {

		},
		methods: {
			//生产二维码回调(base64)
			codeCallback(dataUrl, qid) {
				// console.log(dataUrl, qid)
				this.base64Arr[qid] = dataUrl
			},
			//获取图片的base64地址和文件名
			loadImg(index) {
				let deviceCode = this.deviceCode
				let imgName = `${deviceCode}.png`
				let base64Url = this.base64Arr[index]
				if (parseInt(index) == 0) {
					imgName = `插座二维码${deviceCode}.png`
				}
				this.loadBase64Img(base64Url, imgName)
			},
			//下载base64图片
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
			showQrcode(deviceCode, domainName) {
				this.showqrCode = true
				this.titleStr = deviceCode
				this.deviceCode = deviceCode
				this.domainName = domainName || ''
				this.codeUrl = domainName
				// this.$nextTick(() => {
				// 	this.getCodeUrl()
				// })
			},
			//生成二维码内容
			getCodeUrl() {
				let domainName = this.domainName
				domainName = this.getFormat(domainName)
				let baseUrl = domainName + 'weixin1/miniprogram'
				let url = baseUrl + '?qrcode=' + this.deviceCode + '&qrType=1'
				this.codeUrl = url
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
