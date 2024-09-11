<template>
	<div class="app-container">
		<div class="filter-container">
			<div style="margin: 15px 0;">
				<!-- 新增广告 -->
				<addPage @getLists="getLists" />
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <el-table-column prop="wxName" label="小程序名称" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column prop="imageTitle" label="广告名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="types" label="广告类型" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.types == 1">图片</el-tag>
						<el-tag type="success" v-if="scope.row.types == 2">视频</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="imageUrl" label="预览" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope" style="text-align: center;">
						<imgView :width="200" :height="200" v-if="scope.row.types == 1" :radius="false"
							:imgSrc="scope.row.imageUrl" />
						<video v-if="scope.row.types == 2" :src="scope.row.imageUrl"
							style="height: 200px;width: 200px;" controls="controls">您的浏览器不支持视频播放</video>
					</template>
				</el-table-column>
				<!-- <el-table-column prop="image_link" label="跳转链接" align="center" width="150"
					:show-overflow-tooltip='true'>
				</el-table-column> -->
				<el-table-column prop="sorting" label="排序" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
        <!-- <el-table-column prop="updateTime" label="更新时间" align="center" :show-overflow-tooltip="isPc">
        	<template slot-scope="scope">
        		<span>{{ scope.row.updateTime | formatDate }}</span>
        	</template>
        </el-table-column> -->
				<el-table-column label="操作" width="200">
					<template slot-scope="scope">
						<!-- 编辑广告 -->
						<editPage :row_data="scope.row" @getLists="getLists" />
						<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;"
							icon="el-icon-delete" v-if="btnAuthen.permsVerifAuthention(':AD:ADList:delete')">删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
			<!-- 查看图片 -->
			<el-dialog :visible.sync="showImg" :append-to-body="true">
				<img width="100%" :src="tableImg" alt="" height="600" />
			</el-dialog>
		</div>
	</div>
</template>

<script>
	import {
		getList,
		deleteImageCarousel,
		addImageCarousel,
		updateImageCarousel,
		uploadImg
	} from '@/api/AD/ADList.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/addPage.vue'
	import editPage from './components/editPage.vue'
	import imgView from '@/components/Common/imgView.vue'
	export default {
		name: 'ADList',
		components: {
			addPage,
			editPage,
			imgView
		},
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10
				},
				tableKey: 0,
				tableImg: '',
				showImg: false
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		methods: {
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						id
					}
					console.log(data)
					deleteImageCarousel(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			showBigImg(imgUrl) {
				this.tableImg = imgUrl
				this.showImg = true
			},
		},
		created() {
			this.getLists()
		},
	}
</script>

<style scoped="scoped">
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

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}

	.BigImg:hover {
		cursor: pointer;
	}
</style>
