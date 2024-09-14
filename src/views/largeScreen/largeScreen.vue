<template>
	<div>
		<Frame :width="pageWidth" :height="pageHeight">
			<div :class="[isDark ? 'dark_mainBody' : 'light_mainBody','mainBody']">
				<Title />
				<div class="mainContent">
					<Statistics />
					<div class="mainBox flex">
						<div class="mainBox_left">
							<!-- <Recharge /> -->
							<Daily />
              <RealOrder />
						</div>
						<div class="mainBox_middle">
							<Map />
							<Rank />
						</div>
						<div class="mainBox_right">
							<SevenDayTrendOrder />
							<Device />
              <!-- <UpDownLine /> -->
						</div>
					</div>
				</div>
			</div>
		</Frame>
	</div>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import Frame from '@/components/Common/Frame'
	import Screenfull from '@/components/Screenfull'
	import Title from './components/Title'
	import Statistics from './components/Statistics'
	import Recharge from './components/Recharge'
	import Daily from './components/Daily'
	import SevenDayTrendOrder from './components/SevenDayTrendOrder'
	import Map from './components/Map'
	import Rank from './components/Rank'
	import RealOrder from './components/RealOrder'
	import Device from './components/Device'
	import UpDownLine from './components/UpDownLine'
	export default {
		components: {
			Frame,
			Screenfull,
			Title,
			Statistics,
			Recharge,
			Daily,
			SevenDayTrendOrder,
			Map,
			Rank,
			RealOrder,
			Device,
			UpDownLine
		},
		data() {
			return {
				pageWidth: 1920,
				pageHeight: 1080,
			}
		},
		created() {

		},
		methods: {}
	}
</script>

<style lang="scss">
	.dark_mainBody {
		background-image: url(../../assets/largeScreen/Slice438.png);
	}

	.light_mainBody {
		background-image: url(../../assets/largeScreen/Slice395.png);
	}

	.mainBody {
		width: 100%;
		height: 100%;
		background-size: cover;
		position: relative;

		.mainContent {
			width: 1864px;
			margin: 0 auto;

			.mainBox {
				width: 100%;
				justify-content: space-between;

				.mainBox_left {
					width: 500px;
				}

				.mainBox_middle {
					width: 800px;
				}

				.mainBox_right {
					width: 500px;
				}
			}
		}
	}
</style>
