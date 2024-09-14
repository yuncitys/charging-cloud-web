<template>
	<div>
		<div class="RankBox">
			<div class="navListLight flex" v-if="!isDark">
				<div v-for="(item,index) in navList" :key="index" @click="changeIndex(index)"
					:class="['navItem',navIndex===index ? 'navActive' : '']">{{item.name}}</div>
			</div>
			<div class="navListDark flex" v-if="isDark">
				<div v-for="(item,index) in navList" :key="index" @click="changeIndex(index)"
					:class="['navItem',navIndex===index ? 'navActive' : '']">{{item.name}}</div>
			</div>
			<div class="tableBox">
				<div :class="['tableHead','flex',isDark ? 'dark_tableHead' : 'light_tableHead'] ">
					<div class="headItem" style="width:10%">排名</div>
					<div class="headItem" style="width:30%">站点名称</div>
					<div class="headItem" style="width:30%">充电总量</div>
          <div class="headItem" style="width:30%">充电金额</div>
          <div class="headItem" style="width:30%">充电度数</div>
					<div class="headItem" style="width:30%">统计时间</div>
				</div>
				<vue-seamless-scroll :data="list" class="seamless-warp">
					<div :class="['tableList','flex',item.num%2 === 0 ? (isDark ? 'evenBoxDark' : 'evenBoxLight') : ''] "
						v-for="(item,index) in list" :key="index">
						<div class="listItem flex" v-if="index === 0" style="width:10%;justify-content: center;">
							<div class="round" style="background-color: rgba(234, 92, 148, 1);">{{index+1}}</div>
						</div>
						<div class="listItem flex" v-if="index === 1" style="width:10%;justify-content: center;">
							<div class="round" style="background-color: rgba(93, 129, 242, 1);">{{index+1}}</div>
						</div>
						<div class="listItem flex" v-if="index === 2" style="width:10%;justify-content: center;">
							<div class="round" style="background-color: rgba(251, 129, 55, 1);">{{index+1}}</div>
						</div>
						<!-- <div class="listItem" v-if="index > 2" :style="{width:'10%',color:isDark ? '#fff' : '#333'}">
							{{index+1}}
						</div> -->
						<div :class="['listItem','text1','textLine1',isDark ? 'dark_text1' : 'light_text1']"
							style="width:30%">
							{{item.networkName}}
						</div>
						<div :class="['listItem','text2','textLine1',isDark ? 'dark_text2' : 'light_text2']"
							style="width:30%">
							{{navIndex === 0 ? item.orderCount : item.orderMoeny}}{{navIndex === 0 ? '单' : '元'}}
						</div>
            <div :class="['listItem','text1','textLine1',isDark ? 'dark_text1' : 'light_text1']"
            	style="width:30%">
              {{item.orderMoeny}}元
            </div>
            <div :class="['listItem','text1','textLine1',isDark ? 'dark_text1' : 'light_text1']"
            	style="width:30%">
              {{item.chargingDegree || 0}}度
            </div>
						<div :class="['listItem','text1','textLine1',isDark ? 'dark_text1' : 'light_text1']"
							style="width:30%">
              {{item.time}}
            </div>
					</div>
				</vue-seamless-scroll>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		getListByNetWorkDot
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'Rank',
		components: {

		},
		data() {
			return {
				navList: [
          {
					id: 1,
					name: '充电站排名'
          },
        //   {
        //     id: 2,
        //     name: '站点消费金额排名'
        //   },
        ],
				navIndex: 0,
				list: [],
			}
		},
		watch: {

		},
		methods: {
			changeIndex(index) {
				this.navIndex = index
				this.getListByNetWorkDot()
			},
			getListByNetWorkDot() {
				let type = this.navList[this.navIndex].id
				let data = {
					type
				}
				getListByNetWorkDot(data).then(res => {
					if (res.code === 200) {
						let list = res.data
						list.forEach((item, index) => {
							item.time = this.formatTime(new Date(), 'yyyy-MM-dd HH: mm: ss')
						})
						this.list = list
					}
				})
			},
			formatTime(time, fmt) {
				if (!time) return '';
				else {
					const date = new Date(time);
					const o = {
						'M+': date.getMonth() + 1,
						'd+': date.getDate(),
						'H+': date.getHours(),
						'm+': date.getMinutes(),
						's+': date.getSeconds(),
						'q+': Math.floor((date.getMonth() + 3) / 3),
						S: date.getMilliseconds(),
					};
					if (/(y+)/.test(fmt))
						fmt = fmt.replace(
							RegExp.$1,
							(date.getFullYear() + '').substr(4 - RegExp.$1.length)
						);
					for (const k in o) {
						if (new RegExp('(' + k + ')').test(fmt)) {
							fmt = fmt.replace(
								RegExp.$1,
								RegExp.$1.length === 1 ?
								o[k] :
								('00' + o[k]).substr(('' + o[k]).length)
							);
						}
					}
					return fmt;
				}
			}
		},
		mounted() {

		},
		created() {
			this.getListByNetWorkDot()
		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.RankBox {
		width: 800px;
		height: 200px;
		margin-top: 15px;

		.navListDark {
			align-items: center;

			.navItem {
				font-size: 13px;
				color: rgba(255, 255, 255, 0.50);
				margin-right: 20px;
				cursor: pointer;
			}

			.navActive {
				font-size: 13px;
				color: rgba(69, 102, 246, 1);
				border-bottom: 1px solid rgba(69, 102, 246, 1);
			}
		}

		.navListLight {
			align-items: center;

			.navItem {
				font-size: 13px;
				color: rgba(58, 56, 113, 0.50);
				margin-right: 20px;
				cursor: pointer;
			}

			.navActive {
				font-size: 13px;
				color: rgba(1, 132, 255, 1);
				border-bottom: 1px solid rgba(1, 132, 255, 1);
			}
		}

		.tableBox {
			width: 100%;
			margin: 0 auto;
			margin-top: 7px;

			.light_tableHead {
				background-color: rgba(255, 255, 255, 0.40);

				.headItem {
					color: rgba(1, 132, 255, 1);
				}
			}

			.dark_tableHead {
				background: linear-gradient(88deg, #001571 0%, rgba(0, 21, 112, 0) 100%);
				box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);

				.headItem {
					color: rgba(69, 102, 246, 1);
				}
			}

			.tableHead {
				width: 100%;
				align-items: center;
				height: 30px;

				.headItem {
					text-align: center;
					font-size: 15px;
				}
			}

			.seamless-warp {
				height: 120px;
				overflow: hidden;
			}

			.evenBoxDark {
				background: linear-gradient(88deg, #001571 0%, rgba(0, 21, 112, 0) 100%);
			}

			.evenBoxLight {
				background-color: rgba(255, 255, 255, 0.40);
			}

			.tableList {
				width: 100%;
				align-items: center;
				justify-content: space-between;
				height: 40px;

				.dark_text1 {
					color: #fff;
				}

				.light_text1 {
					color: rgba(58, 56, 113, 0.50);
				}

				.text1 {
					font-size: 14px;
				}

				.dark_text2 {
					color: #fff;
				}

				.light_text2 {
					color: rgba(58, 56, 113, 1);
				}


				.text2 {
					font-size: 14px;
				}

				.listItem {
					text-align: center;

					.round {
						width: 17px;
						height: 17px;
						border-radius: 50%;
						font-size: 16px;
						color: #fff;
						text-align: center;
						line-height: 17px;
					}
				}
			}
		}
	}
</style>
