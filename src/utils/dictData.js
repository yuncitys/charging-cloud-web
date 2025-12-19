class dictData {
	getOrderStatus(val) {
		switch (val) {
			case 0:
				return '故障'
				break;
			case 1:
				return '进行中'
				break;
			case 2:
				return '已完成'
				break;
			case 2:
				return '待结算'
				break;
		}
	}
}
export default new dictData()
