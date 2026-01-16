<template>
    <div>
        <div class="map-breadcrumb">
            <span
                v-for="(item, idx) in breadcrumbs"
                :key="idx"
                class="crumb"
                @click="goToLevel(idx)"
            >
                {{ item }}<span v-if="idx !== breadcrumbs.length - 1"> / </span>
            </span>
        </div>
        <Chart :cdata="cdata" :mapName="mapName" @map-click="handleMapClick" :style="{height:height,width:width}" />
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
				mapName: '全国',
                breadcrumbs: ['全国'],
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
            /**
             * 处理地图点击事件：仅在“下钻成功”（存在已注册地图）时更新面包屑与地图
             * - 全国 -> 省：只有当对应省份地图已注册时才切换并更新面包屑
             * - 省 -> 市/区：同样仅在对应地图已注册时才切换；否则忽略点击，不追加面包屑
             */
            handleMapClick(params) {
                if (!params || !params.name) return
                if (this.mapName === '全国') {
                    const targetFullName = params.name
                    const targetMapName = this.toRegisteredMapName(targetFullName)
                    if (this.isMapRegistered(targetMapName)) {
                        this.mapName = targetMapName
                        this.breadcrumbs = ['全国', targetFullName]
                    }
                } else {
                    // 省级视图：尝试下钻城市，仅当已注册对应地图才允许
                    const targetFullName = params.name
                    const targetMapName = this.toRegisteredMapName(targetFullName)
                    if (this.isMapRegistered(targetMapName)) {
                        this.mapName = targetMapName
                        // 省级面包屑第二项保持全称（如“福建省”），城市/区县使用点击名称
                        const provinceFull = this.breadcrumbs[1]
                        this.breadcrumbs = ['全国', provinceFull, targetFullName]
                    }
                }
            },
            /**
             * 根据面包屑位置进行层级跳转
             * idx 0：全国；idx 1：省份；>=2：城市/区县（保持省级地图，仅更新面包屑）
             */
            goToLevel(idx) {
                if (idx === 0) {
                    this.mapName = '全国'
                    this.breadcrumbs = ['全国']
                } else if (idx === 1) {
                    const provinceFull = this.breadcrumbs[1]
                    const provinceMap = this.toRegisteredMapName(provinceFull)
                    if (this.isMapRegistered(provinceMap)) {
                        this.mapName = provinceMap
                        this.breadcrumbs = ['全国', provinceFull]
                    }
                } else if (idx >= 2) {
                    // 城市/区县层：如果对应地图已注册则切换，否则保持当前地图，仅修剪面包屑
                    const targetFull = this.breadcrumbs[idx]
                    const targetMap = this.toRegisteredMapName(targetFull)
                    if (this.isMapRegistered(targetMap)) {
                        this.mapName = targetMap
                    }
                    this.breadcrumbs = this.breadcrumbs.slice(0, idx + 1)
                }
            },
            /**
             * 省份中文全称转为已注册的地图名称（与 echarts.registerMap 保持一致）
             */
            toRegisteredMapName(fullName) {
                const map = {
                    '福建省': '福建',
                    '山东省': '山东'
                }
                return map[fullName] || fullName
            },
            /**
             * 判断地图是否已通过 echarts.registerMap 注册
             */
            isMapRegistered(name) {
                try {
                    return !!this.$echarts && !!this.$echarts.getMap(name)
                } catch (e) {
                    return false
                }
            },
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
    .map-breadcrumb {
        font-size: 14px;
        margin-bottom: 8px;
        user-select: none;
    }
    .crumb {
        cursor: pointer;
        color: #409EFF;
    }
    .crumb:hover {
        text-decoration: underline;
    }
</style>
