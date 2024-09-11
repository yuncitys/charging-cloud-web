<template>
	<div>
		<Chart :cdata="cdata" :style="{height:height,width:width}" />
	</div>
</template>

<script>
	import Chart from '@/common/chart.vue';
	import resize from './mixins/resize'
	import {
		getProvinceByDevice
	} from '@/api/largeScreen/largeScreen.js'
	export default {
		mixins: [resize],
		props: {
			width: {
				type: String,
				default: '100%'
			},
			height: {
				type: String,
				default: '100%'
			},
		},
		data() {
			return {
				cdata: [{
						name: '北京市',
						value: 0,
					},
					{
						name: '天津市',
						value: 0,
					},
					{
						name: '河北省',
						value: 0,
					},
					{
						name: '山西省',
						value: 0,
					},
					{
						name: '内蒙古自治区',
						value: 0,
					},
					{
						name: '辽宁省',
						value: 0,
					},
					{
						name: '吉林省',
						value: 0,
					},
					{
						name: '黑龙江省',
						value: 0,
					},
					{
						name: '上海市',
						value: 0,
					},
					{
						name: '江苏省',
						value: 0,
					},
					{
						name: '浙江省',
						value: 0,
					},
					{
						name: '安徽省',
						value: 0,
					},
					{
						name: '福建省',
						value: 0,
					},
					{
						name: '江西省',
						value: 0,
					},
					{
						name: '山东省',
						value: 0,
					},
					{
						name: '河南省',
						value: 0,
					},
					{
						name: '湖北省',
						value: 0,
					},
					{
						name: '湖南省',
						value: 0,
					},
					{
						name: '广东省',
						value: 0,
					},
					{
						name: '广西壮族自治区',
						value: 0,
					},
					{
						name: '海南省',
						value: 0,
					},
					{
						name: '重庆市',
						value: 0,
					},
					{
						name: '四川省',
						value: 0,
					},
					{
						name: '贵州省',
						value: 0,
					},
					{
						name: '云南省',
						value: 0,
					},
					{
						name: '西藏自治区',
						value: 0,
					},
					{
						name: '陕西省',
						value: 0,
					},
					{
						name: '甘肃省',
						value: 0,
					},
					{
						name: '青海省',
						value: 0,
					},
					{
						name: '宁夏回族自治区',
						value: 0,
					},
					{
						name: '新疆维吾尔自治区',
						value: 0,
					},

					{
						name: '台湾省',
						value: 0,
					},
					{
						name: '香港特别行政区',
						value: 0,
					},
					{
						name: '澳门特别行政区',
						value: 0,
					}
				]
			}
		},
		components: {
			Chart,
		},
		mounted() {},
		created() {
			this.getProvinceByDevice()
		},
		methods: {
			getProvinceByDevice() {
				getProvinceByDevice().then(res => {
					if (res.code === 200) {
						let cdata = this.cdata
						let netdata = res.data

						let map = {}
						netdata.forEach(item => {
							let key = item.networkProvince;
							map[key] = item.totalDevice;
						})
						cdata.forEach((item, index) => {
							if (map[item.name]) {
								item.value = map[item.name]
							}
						})
						this.cdata = cdata;
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
</style>