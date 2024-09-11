<template>
	<div>
		<el-image :style="{width: width+'px', height: height+'px'}" :src="imgSrc"
			:preview-src-list="[imgSrc]" @click.stop="handleClickItem" :class="[radius ? 'radius' : '']">
		</el-image>
	</div>
</template>

<script>
	export default {
		props:{
			imgSrc:{
				type:String,
				default:''
			},
			width:{
				type:Number,
				default:40
			},
			height:{
				type:Number,
				default:40
			},
			radius:{
				type:Boolean,
				default:true
			}
		},
		data(){
			return {
				
			}
		},
		methods:{
			handleClickItem() {
				this.$nextTick(() => {
					// 获取遮罩层dom
					let domImageMask = document.querySelector(".el-image-viewer__mask");
					if (!domImageMask) {
						return;
					}
					domImageMask.addEventListener("click", () => {
						// 点击遮罩层时调用关闭按钮的 click 事件
						document.querySelector(".el-image-viewer__close").click();
					});
				})
			},
		}
	}
</script>

<style scoped="scoped">
	.radius{
		border-radius: 50%;
	}
</style>
