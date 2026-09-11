<template>
	<div style="display: inline-block;">
		<el-dialog :visible.sync="showqrCode" @opened="qrCodeCreate" :before-close="qrCodeHandleClose"
			:append-to-body="true">
			<div v-if="showqrCode">
				<div style="text-align: center;font-weight: bold;margin-bottom: 20px;font-size: 30px;">小程序</div>
				<div style="text-align: center;">{{titleStr}}</div>
				<div style="text-align: center;width: 150px;">
					<div style="width: 150px;height: 150px;">
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
					<div style="margin-right: 20px;width: 150px;margin-top: 10px;" v-for="(item, index) in portQrList"
						:key="item.gunNumber">
						<div style="width: 150px;height: 150px;">
							<vue-qr :size="150" :text="item.url" :margin="0" :logoScale="0.3" :callback="codeCallback"
								:correctLevel="3" :id="`qrCode${index+1}`" :ref="`qrCode${index+1}`" :qid="`${index+1}`"
								v-if="item.url" :title="item.url"></vue-qr>
						</div>
						<div class="portText">{{ item.gunNumber }}号端口</div>
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
	import vueQr from 'vue-qr'
	import { listGuns } from '@/api/device/deviceList.js'

	export default {
		components: {
			vueQr
		},
		data() {
			return {
				showqrCode: false,
				titleStr: '',
				portQrList: [],
				codeUrl: '',
				deviceCode: '',
				networkDotId: '',
				deviceQrcodeLink: '',
				ruleId: null,
				base64Arr: []
			}
		},
		methods: {
			codeCallback(dataUrl, qid) {
				this.base64Arr[qid] = dataUrl
			},
			loadImg(index) {
				const deviceCode = this.deviceCode
				let imgName = `${deviceCode}.png`
				const base64Url = this.base64Arr[index]
				if (parseInt(index) === 0) {
					imgName = `小程序${deviceCode}.png`
				} else {
					const gunNumber = this.portQrList[index - 1] ? this.portQrList[index - 1].gunNumber : index
					imgName = `小程序${deviceCode}端口${gunNumber}.png`
				}
				this.loadBase64Img(base64Url, imgName)
			},
			loadBase64Img(url, imgName) {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				const img = new Image()
				img.crossOrigin = 'Anonymous'
				img.src = url
				img.onload = () => {
					canvas.height = 150
					canvas.width = 150
					ctx.drawImage(img, 0, 0, 150, 150)
					const dataURL = canvas.toDataURL('image/png')
					const elink = document.createElement('a')
					elink.href = dataURL
					elink.download = imgName
					elink.click()
				}
			},
			qrCodeHandleClose() {
				this.showqrCode = false
				this.portQrList = []
				this.codeUrl = ''
				this.base64Arr = []
			},
			qrCodeCreate() {},
			buildPortQrList(gunNumbers, ruleId) {
				const baseUrl = this.deviceQrcodeLink || ''
				this.codeUrl = baseUrl + this.deviceCode + '&networkDotId=' + this.networkDotId
				this.portQrList = gunNumbers.map(gunNumber => {
					let url = ''
					if (ruleId === 1) {
						url = baseUrl + this.deviceCode + '&port=' + gunNumber + '&networkDotId=' + this.networkDotId
					} else {
						url = baseUrl + this.deviceCode + String(gunNumber).padStart(2, '0') + '&networkDotId=' + this.networkDotId
					}
					return { gunNumber, url }
				})
			},
			loadGunNumbers(deviceCode) {
				return listGuns({ deviceCode }).then(res => {
					if (res.code === 200 && Array.isArray(res.data) && res.data.length) {
						return res.data
							.slice()
							.sort((a, b) => (Number(a.gunNumber) || 0) - (Number(b.gunNumber) || 0))
							.map(g => Number(g.gunNumber))
							.filter(n => n > 0)
					}
					return Promise.reject(new Error(res.msg || '未查询到枪口数据'))
				})
			},
			showQrcode(deviceCode, portCount, networkDotId, deviceQrcodeLink, ruleId) {
				this.deviceCode = deviceCode
				this.networkDotId = networkDotId || ''
				this.deviceQrcodeLink = deviceQrcodeLink || ''
				this.ruleId = ruleId
				this.titleStr = '设备号:' + deviceCode
				this.portQrList = []
				this.codeUrl = ''
				this.loadGunNumbers(deviceCode).then(gunNumbers => {
					this.buildPortQrList(gunNumbers, ruleId)
					this.showqrCode = true
				}).catch(err => {
					this.$message.error(err.message || '加载枪口列表失败')
				})
			},
			print(str) {
				document.getElementById(str).click()
			}
		}
	}
</script>

<style scoped="scoped">
	.portText {
		font-weight: bold;
		color: #000000;
		margin-top: 20px;
	}
</style>
