<template>
	<div>
		<div class="MapBox">
			<mapChart width="800px" height="560px" />
		</div>
	</div>
</template>

<script>
	import mapChart from '@/components/Charts/mapChart'
	export default {
		name: 'Map',
		components: {
			mapChart
		},
		data() {
			return {

			}
		},
		watch: {

		},
		methods: {

		},
		mounted() {

		},
		created() {

		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.MapBox {
		width: 740px;
		height: 560px;
	}
</style>