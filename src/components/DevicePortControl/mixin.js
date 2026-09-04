import { listGuns } from '@/api/device/deviceList.js'

/** 设备控制页共用：枪口列表、选中与状态展示 */
export default {
	methods: {
		choosePart(index) {
			const gun = this.gunList[index]
			if (!gun || !this.isPortSelectable(gun.status)) {
				this.$message.warning('只能选择空闲状态的枪口')
				return
			}
			this.partIndex = index
		},
		isPortSelectable(status) {
			return Number(status) === 0
		},
		getSelectedPortNumber() {
			const gun = this.gunList[this.partIndex]
			return gun ? Number(gun.gunNumber) : null
		},
		ensurePortSelected() {
			if (this.partIndex < 0 || this.partIndex >= this.gunList.length) {
				this.$message.error('请选择枪口')
				return false
			}
			return true
		},
		ensureIdlePortSelected() {
			if (!this.ensurePortSelected()) {
				return false
			}
			if (!this.isPortSelectable(this.gunList[this.partIndex].status)) {
				this.$message.error('请选择空闲状态的枪口')
				return false
			}
			return true
		},
		syncPortSelection() {
			if (!this.gunList.length) {
				this.partIndex = -1
				return
			}
			if (this.partIndex >= 0 && this.partIndex < this.gunList.length) {
				return
			}
			this.partIndex = this.gunList.findIndex(gun => this.isPortSelectable(gun.status))
		},
		portStatusStyle(status) {
			const color = this.$dict.getConnectorStatusColor(status)
			return color ? { color } : {}
		},
		loadGunList() {
			listGuns({ deviceId: this.deviceId }).then(res => {
				if (res.code === 200 && Array.isArray(res.data)) {
					this.gunList = res.data
						.slice()
						.sort((a, b) => (Number(a.gunNumber) || 0) - (Number(b.gunNumber) || 0))
				} else {
					this.gunList = []
				}
				this.syncPortSelection()
			}).catch(() => {
				this.gunList = []
				this.syncPortSelection()
			})
		},
		enter() {
			this.isToBottom = false
		},
		leave() {
			this.isToBottom = true
		},
		scrollToBottom() {
			if (!this.isToBottom) {
				return
			}
			this.$nextTick(() => {
				const box = this.$el.querySelector('.commedBox')
				if (box) {
					box.scrollTop = box.scrollHeight
				}
			})
		},
		lengthCutting(str, num) {
			if (!str) {
				return []
			}
			const strArr = []
			for (let i = 0; i < str.length; i += num) {
				strArr.push(str.slice(i, i + num))
			}
			return strArr
		}
	}
}
