<template>
	<div>
		<div v-if="isPc">
			<el-upload :show-file-list="false" :multiple="false" :http-request="uploadShopSteps"
				:on-remove="handleRemoveShopSteps" :on-success="successShopSteps" action="" class="avatar-uploader"
				:accept="accept" @abort="" v-loading="loading">
				<img v-if="value && type == 1" :src="value" class="avatar">
				<video v-if="value && type == 2" :src="value" controls="controls" class="video">您的浏览器不支持视频播放</video>
				<i v-if="!value" class="el-icon-plus avatar-uploader-icon" />
			</el-upload>
		</div>
		<div v-else>
			<el-upload :show-file-list="false" :multiple="false" :http-request="uploadShopSteps"
				:on-remove="handleRemoveShopSteps" :on-success="successShopSteps" action="" class="avatar-uploader"
				@abort="" v-loading="loading">
				<img v-if="value && type == 1" :src="value" class="avatar">
				<video v-if="value && type == 2" :src="value" controls="controls" class="video">您的浏览器不支持视频播放</video>
				<i v-if="!value" class="el-icon-plus avatar-uploader-icon" />
			</el-upload>
		</div>
	</div>
</template>

<script>
	import {
		uploadImg
	} from '@/api/AD/ADList.js'
	import {
		parseTime,
		isMobile
	} from '@/utils/index'
	export default {
		props: {
			value: {
				type: String
			},
		},
		data() {
			return {
				loading: false,
				accept: '.jpg,.jpeg,.png,.gif',
				type: 1
			}
		},
		created() {
			this.type = 1
			this.isPc = !this.$common.isMobile()
		},
		methods: {
			getType(type) {
				console.log(type)
				this.type = type
				if (type == 1) {
					this.accept = '.jpg,.jpeg,.png,.gif'
				} else {
					this.accept = '.mp4,.mov,.m4v,.3gp,.avi,.m3u8,.webm'
				}
			},
			uploadShopSteps(file) {
				if (!this.beforeUploadShopSteps(file.file)) {
					return false
				}
				// console.log(file.file)
				// 创建FormData对象
				let param = new FormData()
				// 将得到的文件流添加到FormData对象
				param.append('file', file.file)
				this.loading = true
				uploadImg("WebAnnexFile",param).then(res => {
					this.loading = false
					if (res.code == 200) {
						let imageUrl = this.Global.APIURl + res.data.url
						this.$emit('input', imageUrl)
					} else {
						this.$message.error('图片上传失败，原因:' + res.msg)
					}
				}).catch((err) => {
					this.$message.error('图片上传失败，原因:' + err)
					this.loading = false
				})
			},
			beforeUploadShopSteps(file) {
				let flag = true
				if (this.type == 1) {
					flag = this.imgBeforeUploadShopSteps(file)
				} else {
					flag = this.videoBeforeUploadShopSteps(file)
				}
				return flag
			},
			imgBeforeUploadShopSteps(file) {
				let flag = true
				const isRightType = (file.type === 'image/jpeg') || (file.type === 'image/png') || (file.type === 'image/jpg')
				const isLt2M = (file.size / 1024 / 1024) < 10
				if (!isRightType) {
					this.$message.error('只能上传jgp,jpeg和png格式!')
					flag = false
				}
				if (!isLt2M) {
					this.$message.error('图片大小不能超过10M')
					flag = false
				}
				return flag
			},
			videoBeforeUploadShopSteps(file) {
				let flag = true
				const isRightType = (file.type === 'video/mp4') || (file.type === 'video/m4v') || (file.type ===
					'video/3gp') || (file.type === 'video/mov') || (file.type === 'video/avi') || (file.type ===
					'video/m3u8') || (file.type === 'video/webm')
				const isLt2M = file.size / 1024 / 1024 < 60

				if (!isRightType) {
					this.$message.error('只能上传mp4,mov,m4v,3gp,avi,m3u8,webm和wmv格式!')
					flag = false
				}
				if (!isLt2M) {
					this.$message.error('视频大小不能超过60M')
					flag = false
				}
				return flag
			},
			handleRemoveShopSteps() {
				this.$emit('input', '')
			},
			successShopSteps(res) {
				let imageUrl = res.url
				this.$emit('input', imageUrl)
			},
		}
	}
</script>

<style>
	/* 上传图片 */
	.avatar {
		width: 178px;
		height: 178px;
		display: block;
		border: 1px dashed #d9d9d9 !important;
	}

	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	/* 上传图片 */

	.video {
		width: 300px;
		height: 300px;
	}
</style>
