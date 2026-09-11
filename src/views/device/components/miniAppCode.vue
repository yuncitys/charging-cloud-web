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
				<div style="flex-wrap: wrap;display: flex;text-align: center;">
					<div style="margin-right: 20px;width: 150px;margin-top: 10px;" v-for="gunNumber in gunNumbers" :key="gunNumber">
						<div :id="`qrCode${gunNumber}`" :ref="`qrCode${gunNumber}`"></div>
						<div class="portText">{{ gunNumber }}号端口</div>
						<div style="margin-top: 20px;">
							<el-button @click="print(`trueBtn${gunNumber}`)" type="primary">打印二维码</el-button>
							<button v-print="`#qrCode${gunNumber}`" :id="`trueBtn${gunNumber}`" style="display: none">
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
	import { listGuns } from '@/api/device/deviceList.js'

	export default {
		data() {
			return {
				codeWidth: 150,
				codeHeight: 150,
				showqrCode: false,
				titleStr: '',
				codeUrl: '',
				gunNumbers: []
			}
		},
		methods: {
			qrCodeHandleClose() {
				this.showqrCode = false
				this.gunNumbers.forEach(gunNumber => {
					const el = document.getElementById('qrCode' + gunNumber)
					if (el) {
						el.innerHTML = ''
					}
				})
				const deviceEl = document.getElementById('qrCode0')
				if (deviceEl) {
					deviceEl.innerHTML = ''
				}
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
			showQrcode(deviceCode) {
				this.codeUrl = deviceCode
				this.titleStr = '设备号:' + deviceCode
				this.loadGunNumbers(deviceCode).then(gunNumbers => {
					this.gunNumbers = gunNumbers
					this.showqrCode = true
				}).catch(err => {
					this.$message.error(err.message || '加载枪口列表失败')
				})
			},
			qrcode(url) {
				const baseUrl = this.Global.codeUrl
				const deviceEl = document.getElementById('qrCode0')
				if (deviceEl) {
					deviceEl.innerHTML = ''
					new QRCode('qrCode0', {
						text: baseUrl + '?qrcode=' + url,
						width: this.codeWidth,
						height: this.codeHeight
					})
				}
				this.gunNumbers.forEach(gunNumber => {
					const elId = 'qrCode' + gunNumber
					const el = document.getElementById(elId)
					if (!el) {
						return
					}
					el.innerHTML = ''
					new QRCode(elId, {
						text: baseUrl + '?qrcode=' + url + '&port=' + gunNumber,
						width: this.codeWidth,
						height: this.codeHeight
					})
				})
			},
			qrCodeCreate() {
				this.$nextTick(() => {
					this.qrcode(this.codeUrl)
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
